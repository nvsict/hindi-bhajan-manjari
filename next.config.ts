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
            value: 'SAMEORIGIN',
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
            // 🌟 Permissions Policy (Camera, Mic, Geolocation blocked for safety)
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()'
          },
          {
            // 🌟 ULTIMATE CSP: Added 'blob:' in script-src and 'https://news.google.com' in style-src
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.instagram.com https://*.googlesyndication.com https://*.doubleclick.net https://*.googletagmanager.com https://static.cloudflareinsights.com https://*.clarity.ms https://*.google.com https://*.adtrafficquality.google; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://news.google.com; img-src * blob: data:; font-src 'self' https://fonts.gstatic.com data:; connect-src *; frame-src 'self' https://www.youtube.com https://www.instagram.com https://*.doubleclick.net https://*.googlesyndication.com https://*.google.com https://*.adtrafficquality.google;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;