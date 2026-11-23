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
      { protocol: "https", hostname: "**" }, // इसे वापस रखा है ताकि आपकी कोई इमेज ब्रेक न हो
    ],
  },

  // 🧭 SEO 301 PERMANENT REDIRECTS (Fix GSC 404s & Slug Changes)
  async redirects() {
    return [
      // 1. Plural /bhajans -> Singular /bhajan (A to Z Directory)
      {
        source: '/bhajans',
        destination: '/bhajan',
        permanent: true,
      },
      // 2. Legacy Payment HTML -> /donate
      {
        source: '/pay.html',
        destination: '/donate',
        permanent: true,
      },
      // 3. Category /mata-ke-bhajan -> Deity /deity/mata-rani
      {
        source: '/category/mata-ke-bhajan',
        destination: '/deity/mata-rani',
        permanent: true,
      },
      // 4. Deleted Dummy Test Bhajan -> /deity/shri-ganesha
      {
        source: '/bhajan/shree-ganesha-damee-bhajana',
        destination: '/deity/shri-ganesha',
        permanent: true,
      },
      // 5. Renamed Bhajan: Shiv Kailasho Ke Vasi
      {
        source: '/bhajan/shiv-kailasho-ke-vasi-dhauli-dharon-ke-raj-bhajan',
        destination: '/bhajan/shiv-kailasho-ke-vasi-lyrics',
        permanent: true,
      },
      // 6. Renamed Bhajan: Morchhadi Lehrayi Re
      {
        source: '/bhajan/morchhadi-lehrayi-re-rasiya-o-sanwara-lyrics-khatu-shyam',
        destination: '/bhajan/morchhadi-lehrayi-re-rasiya-o-sanwara-lyrics-surbhi-chaturvedi',
        permanent: true,
      },
      // 7. Scraping/Typo Suffix: Jai Santoshi Mata Aarti
      {
        source: '/bhajan/jai-santoshi-mata-aarti-lyrics-shukravar-specialSame',
        destination: '/bhajan/jai-santoshi-mata-aarti-lyrics-shukravar-special',
        permanent: true,
      },
      // 8. Shabdkosh Unicode: ghar-घर -> ghar-ghar-घर-घर
      {
        source: '/shabdkosh/ghar-घर',
        destination: '/shabdkosh/ghar-ghar-घर-घर',
        permanent: true,
      },
      {
        source: '/shabdkosh/ghar-%E0%A4%98%E0%A4%B0',
        destination: '/shabdkosh/ghar-ghar-%E0%A4%98%E0%A4%B0-%E0%A4%98%E0%A4%B0',
        permanent: true,
      },
    ];
  },

  // 🛡️ SECURITY HEADERS SHIELD 🛡️
  async headers() {
    return [
      {
        source: '/api/app-sub/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization, X-Requested-With',
          },
        ],
      },
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
            // 🌟 THE FIX: इसे वापस ओरिजिनल स्टेट में कर दिया है ताकि आपका api.hindibhajanmanjari.com 
            // और Cloudflare Insights बिना ब्लॉक हुए काम कर सकें।
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https: blob:; style-src 'self' 'unsafe-inline' https:; img-src * blob: data:; media-src * blob: data:; font-src 'self' https: data:; connect-src *; frame-src *; worker-src 'self' blob:;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;