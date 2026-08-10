import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

// Razorpay इनिशियलाइज़ेशन
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('order_id');

    if (!orderId) {
      return NextResponse.json(
        { paid: false, error: 'Order ID is required' }, 
        { status: 400 }
      );
    }

    // 1. Razorpay के सर्वर से सीधे ऑर्डर का ताज़ा स्टेटस (Live Status) मंगाएं
    const order = await razorpay.orders.fetch(orderId);

    // 2. चेक करें कि पेमेंट सफलतापूर्वक पूरा (paid) हुआ है या नहीं
    if (order.status === 'paid') {
      return NextResponse.json({ 
        paid: true, 
        // 🌟 FIX: पैसे (paise) को वापस ₹ (INR) में बदलें
        amount: Number(order.amount) / 100, 
        // 🌟 NEW: बुक बिल्डर और डोनेशन को अलग करने के लिए नोट्स भी वापस भेजें
        orderType: order.notes?.orderType || 'donation',
        bhajanCount: order.notes?.bhajanCount ? Number(order.notes.bhajanCount) : 0
      }, { status: 200 });
    }

    // अगर स्टेटस 'created' या 'attempted' है, तो इसका मतलब है कि पेमेंट अभी पेंडिंग या विफल है
    return NextResponse.json(
      { paid: false, status: order.status }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error("❌ [API /razorpay/verify] Verification Error:", error);
    return NextResponse.json(
      { paid: false, error: error.message || 'Verification failed' }, 
      { status: 500 }
    );
  }
}