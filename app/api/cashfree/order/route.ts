import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { amount, count, returnPath } = body;

    let finalAmount = 0;
    let orderType = 'donation';
    let bhajanCount = 0;

    if (count !== undefined && count !== null) {
      orderType = 'book_builder';
      bhajanCount = Number(count);
      if (bhajanCount <= 0) return NextResponse.json({ error: 'कम से कम 1 भजन चुनें।' }, { status: 400 });
      finalAmount = bhajanCount <= 2 ? 11 : 11 + ((bhajanCount - 2) * 2);
    } else if (amount !== undefined && amount !== null) {
      finalAmount = Number(amount);
    }

    if (finalAmount <= 0) return NextResponse.json({ error: 'अमान्य राशि' }, { status: 400 });

    const orderId = `cf_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    
    // 🌟 FIX: Bulletproof Localhost vs Production Check
    const baseUrl = process.env.NODE_ENV === 'development' 
      ? 'http://localhost:3000' 
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://hindibhajanmanjari.com');
    
    const redirectUrl = `${baseUrl}/api/cashfree/redirect?order_id={order_id}&return_path=${returnPath || '/donate'}`;

    const response = await fetch(`${process.env.CASHFREE_BASE_URL}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: finalAmount,
        order_currency: 'INR',
        customer_details: {
          customer_id: 'cust_anon_1',
          customer_phone: '9999999999',
          customer_name: 'Bhakt',
        },
        order_meta: {
          return_url: redirectUrl, 
        },
        order_tags: {
          orderType: orderType,
          bhajanCount: String(bhajanCount)
        }
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Cashfree Order Failed');

    const { error: dbError } = await supabase.from('supporters').insert([{
      cf_order_id: orderId,
      amount: finalAmount,
      order_type: orderType,
      bhajan_count: bhajanCount,
      status: 'pending',
      is_anonymous: true
    }]);

    if (dbError) console.error("⚠️ DB Insert Warning:", dbError.message);

    return NextResponse.json({
      orderId: data.order_id,
      paymentSessionId: data.payment_session_id
    }, { status: 200 });

  } catch (error: any) {
    console.error("❌ Order Creation Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}