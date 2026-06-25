import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🌟 Hide "X-Powered-By: Next.js" from hackers
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ['react-icons'],
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [50, 60, 75, 90, 100], 
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "**" },
    ],
  },

  // 🛡️ SECURITY HEADERS SHIELD 🛡️
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN', // Note: Razorpay modals still work because they are injected into your DOM, and bank iframes handle their own headers.
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), browsing-topics=()'
          },
          {
            // 🌟 ULTIMATE CSP: Added Razorpay to script-src and frame-src
            // next.config.ts में:

key: 'Content-Security-Policy',
value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.instagram.com https://*.googletagmanager.com https://static.cloudflareinsights.com https://*.clarity.ms https://*.google.com https://checkout.razorpay.com https://cdn.razorpay.com https://*.scriptwrapper.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://news.google.com; img-src * blob: data:; media-src * blob: data:; font-src 'self' https://fonts.gstatic.com data:; connect-src * https://lumberjack.razorpay.com https://*.scriptwrapper.com; frame-src 'self' https://www.youtube.com https://www.instagram.com https://*.google.com https://*.razorpay.com; worker-src 'self' blob:;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;