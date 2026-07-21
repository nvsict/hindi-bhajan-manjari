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

  // 🌟 Extract the real public host from proxy headers
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const proto = req.headers.get('x-forwarded-proto') || 'https';

  // If testing locally, keep localhost. On live server, force your exact domain.
  const baseUrl = host && host.includes('localhost')
    ? `http://${host}`
    : `https://hindibhajanmanjari.com`;

  if (expectedSignature === razorpay_signature) {
    // Database update logic can go here if needed
    
    return NextResponse.redirect(
      `${baseUrl}/donate?success=true&payment_id=${razorpay_payment_id}`, 
      303
    );
  } else {
    return NextResponse.redirect(`${baseUrl}/donate?error=verification_failed`, 303);
  }
}