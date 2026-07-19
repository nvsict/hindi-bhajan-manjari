import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  // 🌟 FIX: अपना लाइव डोमेन यहाँ हार्डकोड कर दें (या ENV से लें)
  // ताकि Nginx/VPS के इंटरनल localhost से कोई फर्क न पड़े
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://www.hindibhajanmanjari.com";

  try {
    const formData = await req.formData();
    const paymentId = formData.get("razorpay_payment_id") as string;
    const orderId = formData.get("razorpay_order_id") as string;
    const signature = formData.get("razorpay_signature") as string;

    if (!paymentId || !orderId || !signature) {
       return NextResponse.redirect(new URL(`/donate?status=failed`, baseUrl), 303);
    }

    const expected = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const valid = expected === signature;
    const redirectUrl = valid
      ? `/donate?status=success&order_id=${orderId}`
      : `/donate?status=failed`;

    // 🌟 अब यह localhost की जगह हमेशा आपकी असली साइट पर ही Redirect करेगा
    return NextResponse.redirect(new URL(redirectUrl, baseUrl), 303);

  } catch (error) {
    console.error("Callback verification failed:", error);
    return NextResponse.redirect(new URL(`/donate?status=failed`, baseUrl), 303);
  }
}