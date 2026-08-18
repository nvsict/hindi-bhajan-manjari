import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  experimental: {
    optimizePackageImports: ['react-icons'],
  },

  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [50, 60, 75, 90, 100], 
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "i.ibb.co" }, 
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "i.ytimg.com" }, 
      { protocol: "https", hostname: "img.youtube.com" }, 
      { protocol: "https", hostname: "*.amazonaws.com" }, 
      // 🌟 FIX: हटा दिया गया -> { protocol: "https", hostname: "**" } (Ads के लिए खुला छोड़ा गया था)
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
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(self), geolocation=(), browsing-topics=()'
          },
          {
            // 🌟 THE FIX: Ads नेटवर्क की खुली छूट (https: और *) हटा दी गई है। 
            // अब सिर्फ आपके काम के टूल्स (GA, Clarity, Supabase, YouTube) ही अलाउड हैं।
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms; style-src 'self' 'unsafe-inline' https:; img-src * blob: data:; media-src * blob: data:; font-src 'self' https: data:; connect-src 'self' https://*.supabase.co https://*.google-analytics.com https://*.analytics.google.com https://*.clarity.ms; frame-src 'self' https://www.youtube.com; worker-src 'self' blob:;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;