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

  // 🗑️ SEO PURGE: Return HTTP 410 (Gone) for deprecated/thin /tag/* URLs
  // This explicitly instructs Googlebot that these legacy tags are permanently removed.
  // Googlebot drops them from the index and stops wasting crawl budget.
  if (path === '/tag' || path.startsWith('/tag/')) {
    return new NextResponse(
      `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="robots" content="noindex, nofollow">
  <title>410 Gone | Hindi Bhajan Manjari</title>
  <meta http-equiv="refresh" content="3;url=/bhajan">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #fff7ed; color: #1f2937; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 85vh; padding: 20px; text-align: center; margin: 0;">
  <div style="background: white; border-radius: 24px; padding: 36px 28px; max-width: 480px; box-shadow: 0 10px 30px rgba(234, 88, 12, 0.08); border: 1px solid #fed7aa;">
    <div style="font-size: 42px; margin-bottom: 12px;">🙏</div>
    <h1 style="font-size: 22px; font-weight: 800; color: #9a3412; margin: 0 0 10px 0;">यह टैग संग्रह हटा दिया गया है</h1>
    <p style="color: #6b7280; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
      यह पेज अब उपलब्ध नहीं है। आपको 3 सेकंड में हमारी मुख्य भजन डायरेक्टरी पर ले जाया जा रहा है...
    </p>
    <a href="/bhajan" style="display: inline-block; background: #ea580c; color: white; padding: 12px 28px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 14px;">
      सभी भजन देखें &rarr;
    </a>
  </div>
</body>
</html>`,
      {
        status: 410,
        statusText: 'Gone',
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'X-Robots-Tag': 'noindex, nofollow',
        },
      }
    );
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