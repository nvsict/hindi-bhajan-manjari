import type { NextConfig } from "next";

const nextConfig: NextConfig = {

  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // 🌟 Hide "X-Powered-By: Next.js" from hackers
  poweredByHeader: false,

  experimental: {
    optimizePackageImports: ['react-icons'],
  },

  images: {
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,

    // 🌟 THE LCP FIX: Capping max image generation size to 1920px (Blocks 3840px 4K loads)
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],

    // 🌟 Optional but good: Defined smaller breakpoints for icons/logos
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    qualities: [50, 60, 75, 90, 100], 
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "i.postimg.cc" },
      { protocol: "https", hostname: "i.ibb.co" }, // ImgBB
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "images.pexels.com" },
      { protocol: "https", hostname: "i.ytimg.com" }, // YouTube Thumbnails
      { protocol: "https", hostname: "img.youtube.com" }, // YouTube Thumbnails
      { protocol: "https", hostname: "*.amazonaws.com" }, // Amazon S3
      { protocol: "https", hostname: "**" }, // Fallback wildcard
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
            // 🌟 CSP FIX: Added doubleclick.net, consentmanager.net, grow.me, and rapidedge.io
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.instagram.com https://*.googletagmanager.com https://static.cloudflareinsights.com https://*.clarity.ms https://*.google.com https://checkout.razorpay.com https://cdn.razorpay.com https://cdn.tailwindcss.com https://browser.sentry-cdn.com https://*.scriptwrapper.com https://*.journeymv.com https://*.doubleclick.net https://*.consentmanager.net https://*.grow.me https://*.rapidedge.io; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://news.google.com https://cdnjs.cloudflare.com; img-src * blob: data:; media-src * blob: data:; font-src 'self' https://fonts.gstatic.com data:; connect-src * https://lumberjack.razorpay.com; frame-src 'self' https://www.youtube.com https://www.instagram.com https://*.google.com https://*.razorpay.com https://cdn.razorpay.com https://razorpay.com https://*.scriptwrapper.com https://*.journeymv.com https://*.doubleclick.net https://*.googlesyndication.com; worker-src 'self' blob:;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;