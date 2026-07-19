import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// 🌟 Service Role Key का इस्तेमाल करें ताकि बिना Login किये भी इंसर्ट हो सके
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

    // चेक करें कि क्या डेटाबेस में पहले से यह पेमेंट मौजूद है
    const { data: existing } = await supabaseAdmin
      .from("supporters")
      .select("id")
      .eq("razorpay_payment_id", captured.id)
      .maybeSingle();

    let supporterId = existing?.id ?? null;

    if (!supporterId) {
      const { data: inserted } = await supabaseAdmin
        .from("supporters")
        .insert([{
          amount: Math.round(Number(captured.amount) / 100),
          is_anonymous: true,
          status: "completed",
          razorpay_payment_id: captured.id,
        }])
        .select()
        .single();
      supporterId = inserted?.id ?? null;
    }

    return NextResponse.json({ paid: true, paymentId: captured.id, supporterId });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}