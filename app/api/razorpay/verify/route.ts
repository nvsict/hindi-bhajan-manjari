import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  if (!orderId) return NextResponse.json({ paid: false }, { status: 400 });

  try {
    const payments = await razorpay.orders.fetchPayments(orderId);
    const captured = payments.items.find((p: any) => p.status === "captured");

    if (!captured) return NextResponse.json({ paid: false });

    const amountRupees = Math.round(Number(captured.amount) / 100);

    // Upsert instead of select-then-insert — race-safe against the webhook
    // or a duplicate verify call landing at nearly the same moment.
    const { data: supporter, error } = await supabaseAdmin
      .from("supporters")
      .upsert(
        [{
          amount: amountRupees,
          is_anonymous: true,
          status: "completed",
          razorpay_payment_id: captured.id,
        }],
        { onConflict: "razorpay_payment_id", ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) console.error("Verify API upsert error:", error);

    return NextResponse.json({
      paid: true,
      paymentId: captured.id,
      supporterId: supporter?.id ?? null,
      amount: amountRupees, // 🌟 authoritative amount, always trust this over local state
    });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}