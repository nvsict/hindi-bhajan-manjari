import { NextRequest, NextResponse } from "next/server";
import Razorpay from "razorpay";
import { createClient } from "@supabase/supabase-js";

// 🌟 FIX 1: Force Dynamic (ताकि Next.js इसे कभी Cache न करे) 
// और Runtime NodeJS सेट करें (Edge में Razorpay SDK क्रैश हो सकता है)
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

    // चेक करें कि क्या डेटाबेस में पहले से यह पेमेंट मौजूद है
    const { data: existing } = await supabaseAdmin
      .from("supporters")
      .select("id")
      .eq("razorpay_payment_id", captured.id)
      .maybeSingle();

    let supporterId = existing?.id ?? null;

    if (!supporterId) {
      const { data: inserted, error } = await supabaseAdmin
        .from("supporters")
        .insert([{
          amount: Math.round(Number(captured.amount) / 100),
          is_anonymous: true,
          status: "completed",
          razorpay_payment_id: captured.id,
        }])
        .select()
        .single();
        
      // 🌟 अगर Webhook ने हमसे पहले इंसर्ट कर दिया, तो Unique Constraint एरर (23505) देगा
      // हम उसे इग्नोर कर देंगे क्योंकि हमारा काम तो हो ही गया है।
      if (error && error.code !== '23505') {
        console.error("Verify API Insert Error:", error);
      }
      
      supporterId = inserted?.id ?? null;
    }

    return NextResponse.json({ paid: true, paymentId: captured.id, supporterId });
  } catch (error) {
    console.error("Verify error:", error);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}