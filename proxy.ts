import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// 🛡️ LAYER 2: In-Memory Tracker (Perfect for VPS hosting)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export async function proxy(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // ==========================================
  // 🛡️ 1. RATE LIMITING SHIELD (Bot Protection)
  // ==========================================
  
  // 🌟 FIXED: Removed deprecated req.ip and safely parsed x-forwarded-for
  const ip = req.headers.get('cf-connecting-ip') || req.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown-ip';
  
  const WINDOW_TIME = 60 * 1000; // 1 मिनट का समय
  const MAX_REQUESTS = 60; // 1 मिनट में अधिकतम 60 पेज लोड की अनुमति

  const now = Date.now();
  const userRecord = rateLimitMap.get(ip);

  // अगर IP नया है या उसका 1 मिनट पूरा हो गया है, तो काउंट रीसेट करें
  if (!userRecord || now > userRecord.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_TIME });
  } else {
    // अगर 1 मिनट के अंदर रिक्वेस्ट आई है, तो काउंट बढ़ाएं
    userRecord.count += 1;
    
    // अगर 60 से ज़्यादा बार रिक्वेस्ट आई, तो उसे ब्लॉक कर दें! 🛑
    if (userRecord.count > MAX_REQUESTS) {
      console.warn(`🚨 BOT BLOCKED: IP ${ip} exceeded rate limits on path ${path}`);
      
      return new NextResponse(
        JSON.stringify({ 
          error: 'Too Many Requests', 
          message: 'हमारी सुरक्षा प्रणाली ने असामान्य गतिविधि देखी है। कृपया 1 मिनट प्रतीक्षा करें।' 
        }),
        { 
          status: 429, 
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  }

  // ==========================================
  // 🔒 2. ADMIN PANEL SECURITY
  // ==========================================
  if (path.startsWith('/admin') && path !== '/admin/login') {
    
    const token = req.cookies.get('admin_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

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

// 🌟 CRITICAL FIX: The Matcher
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};