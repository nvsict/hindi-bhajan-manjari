import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 🌟 FIX: The exported function MUST be named 'proxy' to match the file name
export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Protect all /admin routes EXCEPT the login page itself
  if (path.startsWith('/admin') && path !== '/admin/login') {
    
    // 1. Check if the secure cookie exists
    const token = req.cookies.get('admin_token')?.value;

    // 2. If no token, redirect to the beautiful login page
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    // 3. If token exists, verify it hasn't been tampered with
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      
      // Token is valid! Let them through to the admin panel.
      return NextResponse.next();
    } catch (err) {
      // Token is invalid or expired. Delete it and redirect to login.
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }

  // Allow all public routes (home, /bhajan, etc) to pass normally
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};