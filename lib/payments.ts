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
  // 🌟 Layer 0: सबसे पहले DB में देख लें — अगर वेबहुक या पहले किसी retry ने
  // पहले ही confirm कर दिया है, तो Razorpay API हिट करने की ज़रूरत नहीं
  // (हर retry/instance पर बार-बार API कॉल से rate-limit का खतरा कम होता है)
  const { data: existingRow } = await supabaseAdmin
    .from("supporters")
    .select("id, razorpay_payment_id, amount")
    .eq("razorpay_order_id", orderId)
    .eq("status", "completed")
    .maybeSingle();

  if (existingRow) {
    return {
      paid: true,
      paymentId: existingRow.razorpay_payment_id,
      supporterId: existingRow.id,
      amount: existingRow.amount,
    };
  }

  // DB में नहीं मिला — Razorpay से लाइव पूछें (यही असली सोर्स है)
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
    // 🌟 FIX: .single() की जगह .maybeSingle() — अगर replication lag की वजह से
    // row अभी readable न हो, तो यह throw नहीं करेगा, सिर्फ null देगा।
    // दोनों ही स्थिति में हम Razorpay से मिला कैप्चर्ड डेटा लौटाते हैं —
    // पेमेंट तो कैप्चर हो ही चुका है, इसे "paid: true" कहने से रोकने की कोई वजह नहीं।
    const { data: existing, error: lookupError } = await supabaseAdmin
      .from("supporters")
      .select("id")
      .eq("razorpay_payment_id", captured.id)
      .maybeSingle();

    if (lookupError) {
      console.error("confirmPayment conflict-lookup error:", lookupError);
    }

    return { paid: true, paymentId: captured.id, supporterId: existing?.id ?? "", amount };
  }

  console.error("confirmPayment insert error:", insertError);
  // Payment IS captured on Razorpay's side even if our DB write failed —
  // never tell the donor it failed just because our own bookkeeping hiccuped.
  return { paid: true, paymentId: captured.id, supporterId: "", amount };
}