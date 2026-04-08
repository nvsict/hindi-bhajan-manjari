import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ==========================================
  // 🔒 ADMIN PANEL SECURITY
  // ==========================================
  // यह हिस्सा सुनिश्चित करता है कि बिना टोकन के कोई /admin एक्सेस न कर पाए
  if (path.startsWith('/admin') && path !== '/admin/login') {
    
    const token = req.cookies.get('admin_token')?.value;

    // अगर टोकन नहीं है, तो लॉगिन पेज पर भेजें
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      // JWT टोकन को वेरीफाई करें
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch (err) {
      // अगर टोकन गलत या एक्सपायर है, तो उसे डिलीट करें और लॉगिन पर भेजें
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // बाकी सभी रिक्वेस्ट को नॉर्मल तरीके से जाने दें
  return NextResponse.next();
}

// 🌟 URL Matcher Configuration
// यह सेटअप स्टैटिक फाइल्स (images, fonts, scripts) को छोड़कर बाकी सब पर लागू होगा
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};