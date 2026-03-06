import { SignJWT } from 'jose';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Check credentials against environment variables
    if (
      username === process.env.ADMIN_USERNAME && 
      password === process.env.ADMIN_PASSWORD
    ) {
      // 1. Create a secure token
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const alg = 'HS256';

      const jwt = await new SignJWT({ role: 'admin' })
        .setProtectedHeader({ alg })
        .setIssuedAt()
        .setExpirationTime('24h') // Expires in 24 hours
        .sign(secret);

      // 2. Set it as an HTTP-Only Cookie (Immune to Cross-Site Scripting)
      const response = NextResponse.json({ success: true });
      response.cookies.set('admin_token', jwt, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Requires HTTPS in production
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24, // 1 day
      });

      return response;
    }

    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}