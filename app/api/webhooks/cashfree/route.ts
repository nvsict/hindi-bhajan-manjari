import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

// 🌟 FIX: Webhook को कभी भी कैश न होने दें
export const dynamic = 'force-dynamic';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🌟 Cashfree Webhook Signature Verification
function verifyCashfreeSignature(timestamp: string, rawBody: string, signature: string, secret: string) {
  const data = timestamp + rawBody;
  const expectedSignature = crypto.createHmac('sha256', secret).update(data).digest('base64');
  return expectedSignature === signature;
}

export async function POST(req: NextRequest) {
  const timestamp = req.headers.get("x-webhook-timestamp") || "";
  const signature = req.headers.get("x-webhook-signature") || "";
  const rawBody = await req.text();

  if (!verifyCashfreeSignature(timestamp, rawBody, signature, process.env.CASHFREE_CLIENT_SECRET!)) {
    console.error("❌ [Webhook] Invalid Signature Detected");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);

    // सिर्फ PAYMENT_SUCCESS_WEBHOOK को प्रोसेस करें
    if (event.type === "PAYMENT_SUCCESS_WEBHOOK") {
      const { order, payment } = event.data;
      
      const orderType = order.order_tags?.orderType || 'donation';
      const bhajanCount = order.order_tags?.bhajanCount ? Number(order.order_tags.bhajanCount) : 0;
      const finalAmount = order.order_amount;

      // 1. Update Database (Primary)
      const { data: updatedData } = await supabaseAdmin
        .from("supporters")
        .update({
          status: "completed",
          cf_transaction_id: String(payment.cf_payment_id),
          amount: finalAmount,
          order_type: orderType,
          bhajan_count: bhajanCount
        })
        .eq("cf_order_id", order.order_id)
        .select();

      // 2. Fallback Insert (अगर Order API DB में एंट्री नहीं कर पाया था)
      if (!updatedData || updatedData.length === 0) {
        console.log("⚠️ [Webhook] No existing order found. Inserting fallback record.");
        await supabaseAdmin.from("supporters").insert([{
          amount: finalAmount,
          is_anonymous: true,
          status: "completed",
          cf_transaction_id: String(payment.cf_payment_id),
          cf_order_id: order.order_id,
          order_type: orderType,
          bhajan_count: bhajanCount
        }]);
      }
    }

    // Cashfree को Success Response (200 OK) भेजें ताकि वह दोबारा Webhook न भेजे
    return NextResponse.json({ status: "OK" });
    
  } catch (error) {
    console.error("❌ [Webhook] Processing Error:", error);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
} 