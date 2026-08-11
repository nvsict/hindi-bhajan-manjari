import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { createClient } from "@supabase/supabase-js";

// 🌟 Supabase Admin का उपयोग ताकि RLS की समस्या के बिना ऑर्डर वेरीफाई किया जा सके
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

    // ==========================================
    // 🌟 1. Primary Check: Supabase Database (Fastest & Safest)
    // ==========================================
    const { data: dbOrder, error: dbError } = await supabaseAdmin
      .from('supporters')
      .select('status, amount, order_type, bhajan_count')
      .eq('razorpay_order_id', orderId)
      .single();

    // अगर Webhook ने डेटाबेस को 'completed' कर दिया है, तो तुरंत Success भेजें
    if (dbOrder && dbOrder.status === 'completed') {
      console.log(`✅ [Verify API] Verified from DB: ${orderId}`);
      return NextResponse.json({
        paid: true,
        amount: dbOrder.amount,
        orderType: dbOrder.order_type,
        bhajanCount: dbOrder.bhajan_count
      }, { status: 200 });
    }

    // ==========================================
    // 🌟 2. Fallback Check: Razorpay API (अगर Webhook आने में 2-3 सेकंड की देरी हो गई हो)
    // ==========================================
    const order = await razorpay.orders.fetch(orderId);

    if (order.status === 'paid') {
      console.log(`⚠️ [Verify API] Verified from Razorpay (Webhook Delayed): ${orderId}`);
      
      // 🌟 Self-Healing: चूँकि वेबहुक लेट है, हम खुद ही DB को अपडेट कर देते हैं
      await supabaseAdmin
        .from('supporters')
        .update({ status: 'completed' })
        .eq('razorpay_order_id', orderId);

      return NextResponse.json({ 
        paid: true, 
        amount: Number(order.amount) / 100, 
        orderType: order.notes?.orderType || 'donation',
        bhajanCount: order.notes?.bhajanCount ? Number(order.notes.bhajanCount) : 0
      }, { status: 200 });
    }

    // अगर स्टेटस 'created' या 'attempted' है, तो पेमेंट सच में पूरा नहीं हुआ है
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