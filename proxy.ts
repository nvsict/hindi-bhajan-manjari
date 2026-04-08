import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // 🔒 केवल एडमिन पैनल की सुरक्षा
  if (path.startsWith('/admin') && path !== '/admin/login') {
    const token = req.cookies.get('admin_token')?.value;
    if (!token) return NextResponse.redirect(new URL('/admin/login', req.url));

    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
    } catch (err) {
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      response.cookies.delete('admin_token');
      return response;
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};