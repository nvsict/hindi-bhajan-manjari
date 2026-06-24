import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ error: 'Missing required payment parameters' }, { status: 400 });
    }

    // Algorithm: HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(body.toString())
      .digest('hex');

    // Compare signatures securely
    if (expectedSignature === razorpay_signature) {
      // Signature is valid. You can safely mark the payment as successful in your DB here.
      return NextResponse.json({ success: true, message: "Payment verified successfully" }, { status: 200 });
    } else {
      // Signature mismatch, potential tampering
      return NextResponse.json({ success: false, error: 'Invalid payment signature' }, { status: 400 });
    }
  } catch (error) {
    console.error("Signature Verification Error:", error);
    return NextResponse.json({ error: 'Internal server error during verification' }, { status: 500 });
  }
}