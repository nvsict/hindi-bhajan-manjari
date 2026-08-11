import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

// 🌟 Service Role Key का उपयोग ताकि Webhook बिना RLS (Row Level Security) के DB अपडेट कर सके
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🌟 Timing-safe signature comparison — हैकर्स को जाली रिक्वेस्ट भेजने से रोकता है
function isValidSignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");

  if (expectedBuf.length !== signatureBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  // 1. Signature Verify करें
  if (!signature || !isValidSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 2. सिर्फ 'payment.captured' इवेंट को हैंडल करें
  if (event?.event === "payment.captured") {
    const payment = event?.payload?.payment?.entity;

    if (!payment?.id || !payment?.amount || !payment?.order_id) {
      console.error("❌ [Webhook] Payload missing required fields:", event);
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    // Notes से डेटा निकालें (जो हमने Order बनाते समय सेट किया था)
    const orderType = payment.notes?.orderType || 'donation';
    const bhajanCount = payment.notes?.bhajanCount ? Number(payment.notes.bhajanCount) : 0;
    const finalAmount = Math.round(Number(payment.amount) / 100);

    // 🌟 3A. मुख्य प्रयास: पहले से मौजूद (Pending) ऑर्डर को 'completed' में अपडेट करें
    const { data: updatedData, error: updateError } = await supabaseAdmin
      .from("supporters")
      .update({
        status: "completed",
        razorpay_payment_id: payment.id,
        // सुरक्षा के लिए अमाउंट और नोट्स को सिंक (Sync) कर देते हैं
        amount: finalAmount,
        order_type: orderType,
        bhajan_count: bhajanCount
      })
      .eq("razorpay_order_id", payment.order_id)
      .select();

    if (updateError) {
      console.error("❌ [Webhook] Update Error:", updateError);
      return NextResponse.json({ error: "DB update failed" }, { status: 500 });
    }

    // 🌟 3B. स्मार्ट फॉलबैक: अगर UPDATE ने कोई लाइन (row) नहीं बदली, इसका मतलब /order API DB में एंट्री नहीं कर पाया था
    if (!updatedData || updatedData.length === 0) {
      console.log("⚠️ [Webhook] No existing order found. Inserting new record fallback.");
      
      const { error: insertError } = await supabaseAdmin
        .from("supporters")
        .insert([{
          amount: finalAmount,
          is_anonymous: true,
          status: "completed",
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id,
          order_type: orderType,
          bhajan_count: bhajanCount
        }]);

      if (insertError) {
        console.error("❌ [Webhook] Fallback Insert Error:", insertError);
        return NextResponse.json({ error: "DB fallback insert failed" }, { status: 500 });
      }
    }
  }

  // Razorpay को सफलता का मैसेज (200 OK) भेजें ताकि वह इसे दोबारा न भेजे
  return NextResponse.json({ received: true });
} 