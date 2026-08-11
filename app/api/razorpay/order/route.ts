import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';
import { supabase } from '@/utils/supabase';

// Razorpay इनिशियलाइज़ेशन
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, count } = body;

    let finalAmount = 0;
    let orderType = 'donation';
    let bhajanCount = 0;

    // ==========================================
    // 🌟 MODE 1: BOOK BUILDER (Secure Calculation on Backend)
    // ==========================================
    if (count !== undefined && count !== null) {
      orderType = 'book_builder';
      bhajanCount = Number(count);
      
      if (bhajanCount <= 0) {
        return NextResponse.json(
          { error: 'कम से कम 1 भजन चुनना अनिवार्य है।' }, 
          { status: 400 }
        );
      }
      
      // शगुन कैलकुलेशन: पहले 2 भजन के लिए ₹11, उसके बाद अतिरिक्त भजन पर ₹2
      if (bhajanCount <= 2) {
        finalAmount = 11;
      } else {
        finalAmount = 11 + ((bhajanCount - 2) * 2);
      }
    } 
    // ==========================================
    // 🌟 MODE 2: STANDARD DONATION (From /donate page)
    // ==========================================
    else if (amount !== undefined && amount !== null) {
      finalAmount = Number(amount);
    }

    // वैलिडेशन
    if (finalAmount <= 0) {
      return NextResponse.json({ error: 'अमान्य राशि (Invalid amount)' }, { status: 400 });
    }

    // 1. Razorpay पर नया ऑर्डर बनाएँ
    const options = {
      amount: finalAmount * 100, // INR to Paise
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        orderType: orderType,
        bhajanCount: String(bhajanCount)
      }
    };

    const order = await razorpay.orders.create(options);

    // 2. 🌟 SUPABASE DB ENTRY (Pending Status)
    // Webhook इसी रिकॉर्ड को ढूँढकर 'completed' मार्क करेगा
    const { error: dbError } = await supabase
      .from('supporters')
      .insert([
        {
          razorpay_order_id: order.id,
          amount: finalAmount,
          order_type: orderType,
          bhajan_count: bhajanCount,
          status: 'pending',
          is_anonymous: true
        }
      ]);

    if (dbError) {
      console.error("⚠️ [API /razorpay/order] Supabase DB Insert Warning:", dbError.message);
      // DB इंसर्ट में इश्यू आने पर भी हम यूज़र को ब्लॉक नहीं करते, ऑर्डर का रिस्पॉन्स दे देते हैं
    }

    return NextResponse.json(order, { status: 200 });

  } catch (error: any) {
    console.error("❌ [API /razorpay/order] Order Creation Error:", error);
    return NextResponse.json(
      { error: error.message || 'ऑर्डर बनाने में विफल (Failed to create order)' }, 
      { status: 500 }
    );
  }
}