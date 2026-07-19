import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // 🌟 FIX: Localhost और Live VPS दोनों के लिए डायनामिक URL
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

  try {
    const formData = await req.formData();
    const paymentId = formData.get("razorpay_payment_id") as string;
    const orderId = formData.get("razorpay_order_id") as string;
    const signature = formData.get("razorpay_signature") as string;

    // अगर Razorpay से डेटा ही नहीं आया
    if (!paymentId || !orderId || !signature) {
       return NextResponse.redirect(new URL(`/donate?status=failed&reason=missing_data`, baseUrl), 303);
    }

    // सिग्नेचर वेरीफाई करें (चेक करें कि पेमेंट असली है या हैक)
    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    // अगर सिग्नेचर मैच नहीं हुआ
    if (expected !== signature) {
       return NextResponse.redirect(new URL(`/donate?status=failed&reason=invalid_signature`, baseUrl), 303);
    }

    // 🌟 100% SUCCESS! यूज़र को वापस भेजें
    return NextResponse.redirect(new URL(`/donate?status=success&order_id=${orderId}`, baseUrl), 303);

  } catch (error) {
    console.error("Callback verification failed:", error);
    return NextResponse.redirect(new URL(`/donate?status=failed&reason=server_error`, baseUrl), 303);
  }
}