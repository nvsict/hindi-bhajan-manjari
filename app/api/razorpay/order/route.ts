import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

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

    // ==========================================
    // 🌟 MODE 1: BOOK BUILDER (Secure Calculation on Backend)
    // ==========================================
    if (count !== undefined && count !== null) {
      orderType = 'book_builder';
      const bhajanCount = Number(count);
      
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

    // Razorpay के लिए INR को पैसे (Paise) में बदलें
    const options = {
      amount: finalAmount * 100, 
      currency: 'INR',
      receipt: `rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      notes: {
        orderType: orderType,
        bhajanCount: count ? String(count) : '0'
      }
    };

    const order = await razorpay.orders.create(options);
    
    return NextResponse.json(order, { status: 200 });
  } catch (error: any) {
    console.error("❌ [API /razorpay/order] Order Creation Error:", error);
    return NextResponse.json(
      { error: error.message || 'ऑर्डर बनाने में विफल (Failed to create order)' }, 
      { status: 500 }
    );
  }
}