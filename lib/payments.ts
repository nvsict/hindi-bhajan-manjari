import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export type ConfirmResult =
  | { paid: true; paymentId: string; supporterId: string; amount: number }
  | { paid: false };

/**
 * THE single function that decides whether a Razorpay order is paid, and
 * writes the result to `supporters`. Called by both the webhook and the
 * client-triggered /api/razorpay/verify route — there is exactly one
 * source of truth, so the two paths can never disagree with each other.
 *
 * Insert-then-fallback-to-select (never a blind upsert) is deliberate:
 * if the row already exists — because the webhook and a client verify
 * call raced each other, or because this is a later recovery check — the
 * row may already carry a name/photo the donor added via
 * /api/supporters/details. A blind upsert would silently wipe that back
 * to null. So a duplicate-key error here just means "someone beat us to
 * it," and we fetch what's already there instead of overwriting it.
 */
export async function confirmPayment(orderId: string): Promise<ConfirmResult> {
  const payments = await razorpay.orders.fetchPayments(orderId);
  const captured = payments.items.find((p: any) => p.status === "captured");
  if (!captured) return { paid: false };

  const amount = Math.round(Number(captured.amount) / 100);

  const { data: inserted, error: insertError } = await supabaseAdmin
    .from("supporters")
    .insert([{
      razorpay_order_id: orderId,
      razorpay_payment_id: captured.id,
      amount,
      status: "completed",
      is_anonymous: true,
    }])
    .select()
    .single();

  if (!insertError && inserted) {
    return { paid: true, paymentId: captured.id, supporterId: inserted.id, amount };
  }

  if (insertError?.code === "23505") {
    const { data: existing } = await supabaseAdmin
      .from("supporters")
      .select("id")
      .eq("razorpay_payment_id", captured.id)
      .single();
    return { paid: true, paymentId: captured.id, supporterId: existing?.id ?? "", amount };
  }

  console.error("confirmPayment insert error:", insertError);
  // Payment IS captured on Razorpay's side even if our DB write failed —
  // never tell the donor it failed just because our own bookkeeping hiccuped.
  return { paid: true, paymentId: captured.id, supporterId: "", amount };
}