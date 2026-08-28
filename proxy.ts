import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// 🌟 Function name remains 'proxy' for Next.js 16.x compatibility
export async function proxy(req: NextRequest) {
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

  const path = req.nextUrl.pathname;

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