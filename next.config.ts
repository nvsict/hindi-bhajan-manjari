import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 🌟 NEW: React Icons Optimization (Lighthouse JavaScript Size Fix)
  experimental: {
    optimizePackageImports: ['react-icons'],
  },

  images: {
    // 🌟 Next.js को AVIF और WebP सपोर्ट करने का निर्देश
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    
    // 🌟 FIXED: Added qualities to stop the terminal warnings for quality="60"
    qualities: [50, 60, 75, 90, 100], 
    
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "i.postimg.cc",
      },
      {
        protocol: "https",
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
      // Keep the wildcard last just in case you use other image hosts
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // 🛡️ SECURITY HEADERS SHIELD (The 4th Layer) 🛡️
  async headers() {
    return [
      {
        // यह रूल वेबसाइट के हर एक पेज (/(.*)) पर लागू होगा
        source: '/(.*)',
        headers: [
          {
            // 1. HSTS (Strict-Transport-Security) - Forces HTTPS
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            // 2. Prevent MIME-Sniffing
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            // 3. Prevent Clickjacking (X-Frame-Options)
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            // 4. Cross-Site Scripting (XSS) Protection
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            // 5. Referrer Policy (Privacy)
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            // 6. Content-Security-Policy (CSP)
            // Whitelisted: YouTube, Instagram, Google Fonts, Supabase
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.instagram.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src * blob: data:; font-src 'self' https://fonts.gstatic.com data:; connect-src *; frame-src 'self' https://www.youtube.com https://www.instagram.com;"
          }
        ],
      },
    ];
  },
};

export default nextConfig;