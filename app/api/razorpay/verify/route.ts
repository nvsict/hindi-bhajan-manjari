import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json({ paid: false, error: 'Order ID required' }, { status: 400 });
    }

    // 1. Fetch the exact order status directly from Razorpay's servers
    const order = await razorpay.orders.fetch(orderId);

    // 2. Determine if it was successfully paid
    if (order.status === 'paid') {
      return NextResponse.json({ 
        paid: true, 
        // 🌟 THE FIX: Wrap order.amount in Number() to satisfy TypeScript
        amount: Number(order.amount) / 100 
      }, { status: 200 });
    }

    // If 'created' or 'attempted', it is not finalized yet
    return NextResponse.json({ paid: false, status: order.status }, { status: 200 });

  } catch (error) {
    console.error("Verification Error:", error);
    return NextResponse.json({ paid: false, error: 'Verification failed' }, { status: 500 });
  }
}