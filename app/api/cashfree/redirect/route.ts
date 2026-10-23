import { NextResponse } from 'next/server';
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Only allow internal paths like "/donate" or "/ebook/xyz".
// Rejects "//evil.com", "@evil.com", "https://...", and backslash tricks.
function safeReturnPath(path: string | null): string {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) {
    return '/donate';
  }
  return path;
}

function redirectTo(baseUrl: string, returnPath: string, params: Record<string, string>) {
  const url = new URL(returnPath, baseUrl);
  Object.entries(params).forEach(([key, value]) => url.searchParams.set(key, value));
  return NextResponse.redirect(url.toString(), 303);
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('order_id');
  const returnPath = safeReturnPath(searchParams.get('return_path'));

  // 🌟 Dynamic Host Check (Localhost vs Production)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'hindibhajanmanjari.com';
  const protocol = host.includes('localhost') ? 'http' : 'https';
  const baseUrl = `${protocol}://${host}`;

  if (!orderId) {
    return redirectTo(baseUrl, returnPath, { error: 'missing_order' });
  }

  try {
    const response = await fetch(
      `${process.env.CASHFREE_BASE_URL}/pg/orders/${encodeURIComponent(orderId)}`,
      {
        method: 'GET',
        headers: {
          'x-client-id': process.env.CASHFREE_CLIENT_ID!,
          'x-client-secret': process.env.CASHFREE_CLIENT_SECRET!,
          'x-api-version': '2023-08-01',
        },
      }
    );

    const data = await response.json();

    if (data.order_status === 'PAID') {
      const transactionId = data.order_id;

      await supabaseAdmin
        .from('supporters')
        .update({ status: 'completed' })
        .eq('cf_order_id', orderId);

      return redirectTo(baseUrl, returnPath, { success: 'true', payment_id: transactionId });
    } else {
      return redirectTo(baseUrl, returnPath, { error: 'payment_failed' });
    }
  } catch (error) {
    return redirectTo(baseUrl, returnPath, { error: 'verification_failed' });
  }
}