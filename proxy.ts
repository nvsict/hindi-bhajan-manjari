import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 🌟 Function name remains 'proxy' for Next.js 16.x compatibility
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 🌐 CORS SUPPORT FOR EXPO WEB / APP SUBSCRIPTION APIs (/api/app-sub/*)
  if (path.startsWith('/api/app-sub/')) {
    const origin = req.headers.get('origin') || '*';
    const allowedOrigin =
      origin === 'http://localhost:8081' ||
      origin === 'http://127.0.0.1:8081' ||
      origin === 'http://localhost:19006' ||
      origin === 'https://www.hindibhajanmanjari.com' ||
      origin === 'https://hindibhajanmanjari.com'
        ? origin
        : '*';

    const corsHeaders: Record<string, string> = {
      'Access-Control-Allow-Origin': allowedOrigin,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      'Access-Control-Max-Age': '86400',
    };

    if (req.method === 'OPTIONS') {
      return new NextResponse(null, { status: 204, headers: corsHeaders });
    }

    const apiResponse = NextResponse.next({
      request: { headers: req.headers },
    });
    Object.entries(corsHeaders).forEach(([k, v]) => apiResponse.headers.set(k, v));
    return apiResponse;
  }

  // 1. Initial response object
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  // 2. Initialize Supabase Server Client for Edge/Proxy
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // If Supabase needs to refresh the token, we update both the request and response cookies
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          response = NextResponse.next({
            request: { headers: req.headers },
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // 🔒 ADMIN PANEL SECURITY
  if (path.startsWith('/admin') && path !== '/admin/login') {
    // 3. Supabase से चेक करें कि यूज़र लॉगिन है या नहीं (यह JWT को अपने आप डिकोड और वेरीफाई करेगा)
    const { data: { user } } = await supabase.auth.getUser();

    // 4. अगर यूज़र नहीं मिला (यानी कुकी/सेशन नहीं है), तो लॉगिन पर वापस भेजें
    if (!user) {
      const redirectUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  return response;
}

// 🌟 Matcher Config (No changes here, keeping your exact pattern)
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};