import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const paymentId = formData.get("razorpay_payment_id") as string;
    const orderId = formData.get("razorpay_order_id") as string;
    const signature = formData.get("razorpay_signature") as string;

    if (!paymentId || !orderId || !signature) {
       return NextResponse.redirect(new URL(`/donate?status=failed`, req.url));
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const valid = expected === signature;
    const redirectUrl = valid
      ? `/donate?status=success&order_id=${orderId}`
      : `/donate?status=failed`;

    // 🌟 Razorpay POST रिक्वेस्ट करता है, हम उसे 303 Redirect करके वापस वेबसाइट पर भेज रहे हैं
    return NextResponse.redirect(new URL(redirectUrl, req.url), 303);
  } catch (error) {
    console.error("Callback verification failed:", error);
    return NextResponse.redirect(new URL(`/donate?status=failed`, req.url), 303);
  }
}