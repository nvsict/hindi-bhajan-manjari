import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');
  const returnPath = searchParams.get('return_path') || '/donate';
  
  // 🌟 FIX: Dynamic Host Check (Localhost vs Production)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'hindibhajanmanjari.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (!orderId) {
    return NextResponse.redirect(`${baseUrl}${returnPath}?error=missing_order`, 303);
  }

  try {
    const response = await fetch(`${process.env.CASHFREE_BASE_URL}/pg/orders/${orderId}`, {
      method: 'GET',
      headers: {
        'x-client-id': process.env.CASHFREE_CLIENT_ID!,
        'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
        'x-api-version': '2023-08-01',
      },
    });

    const data = await response.json();

    if (data.order_status === 'PAID') {
      const transactionId = data.order_id; 
      
      await supabaseAdmin
        .from('supporters')
        .update({ status: 'completed' })
        .eq('cf_order_id', orderId);

      return NextResponse.redirect(`${baseUrl}${returnPath}?success=true&payment_id=${transactionId}`, 303);
    } else {
      return NextResponse.redirect(`${baseUrl}${returnPath}?error=payment_failed`, 303);
    }
  } catch (error) {
    return NextResponse.redirect(`${baseUrl}${returnPath}?error=verification_failed`, 303);
  }
}