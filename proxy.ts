import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rename this function from middleware to proxy
export function proxy(req: NextRequest) {
  if (req.nextUrl.pathname.startsWith('/admin')) {
    const basicAuth = req.headers.get('authorization');

    if (basicAuth) {
      const authValue = basicAuth.split(' ')[1];
      const [user, pwd] = atob(authValue).split(':');

      if (user === 'admin' && pwd === 'manjari2026') {
        return NextResponse.next();
      }
    }

    return new NextResponse('Unauthorized Access', {
      status: 401,
      headers: {
        'WWW-Authenticate': 'Basic realm="Secure Admin Area"',
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};