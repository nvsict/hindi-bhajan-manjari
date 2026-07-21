import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const formData = await req.formData();
  
  const razorpay_payment_id = formData.get('razorpay_payment_id') as string;
  const razorpay_order_id = formData.get('razorpay_order_id') as string;
  const razorpay_signature = formData.get('razorpay_signature') as string;

  // Verify the signature
  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(body.toString())
    .digest("hex");

  // 🌟 THE FIX: Dynamically grab the exact domain you are currently on
  // If on PC, it stays http://localhost:3000. If live, it becomes https://hindibhajanmanjari.com
  const requestUrl = new URL(req.url);
  const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;

  if (expectedSignature === razorpay_signature) {
    // 2. Update your Supabase database here (mark order as paid) if needed
    
    // 3. Redirect dynamically based on the environment
    return NextResponse.redirect(
      `${baseUrl}/donate?success=true&payment_id=${razorpay_payment_id}`, 
      303
    );
  } else {
    return NextResponse.redirect(`${baseUrl}/donate?error=verification_failed`, 303);
  }
}