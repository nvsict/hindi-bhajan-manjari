import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 🌟 1. Added 'type' parameter to explicitly know what the user is buying
    const { amount, count, returnPath, name, phone, type } = body;

    let finalAmount = 0;
    // Default to 'donation' if type is not provided
    let orderType = type || 'donation';
    let bhajanCount = count ? Number(count) : 0;

    // 🌟 2. ROUTING LOGIC FOR DIFFERENT PRODUCTS
    if (orderType === 'prebuilt_ebook') {
      // For fixed-price ebooks (Admin created)
      if (!amount || Number(amount) <= 0) {
        return NextResponse.json({ error: 'अमान्य ई-बुक मूल्य' }, { status: 400 });
      }
      finalAmount = Number(amount);

    } else if (
      orderType === 'book_builder' ||
      // ✅ FIX: legacy detection only when a real bhajan count (> 0) is sent.
      // Donations that send count: 0 (or no count) now fall through to the donation branch.
      (type === undefined && bhajanCount > 0)
    ) {
      // For Custom Book Builder (Per bhajan pricing logic)
      if (bhajanCount <= 0) {
        return NextResponse.json({ error: 'कम से कम 1 भजन चुनें।' }, { status: 400 });
      }
      finalAmount = bhajanCount <= 2 ? 11 : 11 + ((bhajanCount - 2) * 2);
      orderType = 'book_builder'; // Enforce type

    } else if (orderType === 'donation' && amount !== undefined) {
      // Standard donation
      finalAmount = Number(amount);
      bhajanCount = 0; // donations never carry a bhajan count
    }

    // Safety check
    if (!finalAmount || finalAmount <= 0) {
      return NextResponse.json({ error: 'अमान्य राशि' }, { status: 400 });
    }

    const orderId = `cf_order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const baseUrl = process.env.NODE_ENV === 'development'
      ? 'http://localhost:3000'
      : (process.env.NEXT_PUBLIC_SITE_URL || 'https://hindibhajanmanjari.com');

    const redirectUrl = `${baseUrl}/api/cashfree/redirect?order_id={order_id}&return_path=${returnPath || '/donate'}`;

    // 🌟 3. DYNAMIC PAYLOAD CREATION
    const payload: any = {
      order_id: orderId,
      order_amount: finalAmount,
      order_currency: 'INR',
      customer_details: {
        customer_id: phone ? `cust_${phone}` : `cust_anon_${Date.now()}`,
        customer_phone: phone || '9999999999',
        customer_name: name || 'Bhakt',
      },
      order_tags: {
        orderType: orderType,
        bhajanCount: String(bhajanCount)
      }
    };

    // Only pass 'return_url' for normal donations.
    // For e-books, we leave it out so the Cashfree modal simply closes
    // and lets our Frontend JS trigger the PDF generation seamlessly.
    if (orderType === 'donation') {
      payload.order_meta = {
        return_url: redirectUrl
      };
    }

    const response = await fetch(`${process.env.CASHFREE_BASE_URL}/pg/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2023-08-01',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Cashfree Order Failed');

    const { error: dbError } = await supabase.from('supporters').insert([{
      cf_order_id: orderId,
      amount: finalAmount,
      order_type: orderType,
      bhajan_count: bhajanCount,
      status: 'pending',
      // If name/phone is provided, it's not strictly anonymous
      is_anonymous: !(name && phone),
      name: name || 'A Gupt Bhakt' // Save the name in the DB
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