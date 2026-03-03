import withPWAInit from "@ducanh2912/next-pwa";
import type { NextConfig } from "next";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", 
  register: true,
});

const nextConfig: NextConfig = {
  turbopack: {}, 

  // 🌟 NEW: The Invisible Bridge for Supabase (Bypasses Jio/Airtel ISP Blocks)
  async rewrites() {
    return [
      {
        source: '/supabase-proxy/:path*',
        // Route it securely to your actual Supabase URL
        destination: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/:path*`, 
      },
    ]
  },

  images: {
    formats: ['image/avif', 'image/webp'],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    qualities: [40, 50, 60, 65, 75, 100],
    remotePatterns: [
      // 🌟 1. Supabase Storage (Your main database images)
      {
        protocol: "https" as const,
        hostname: "**.supabase.co",
      },
      // 🌟 2. Postimages (If you use it for quick, free hosting)
      {
        protocol: "https" as const,
        hostname: "i.postimg.cc",
      },
      // 🌟 3. Google Profile Images (Future-proofing for Auth/Logins)
      {
        protocol: "https" as const,
        hostname: "**.googleusercontent.com",
      },
      // 🌟 4. General Wildcard (Remove this later if you want strict security, 
      // but keep it for now if you are pasting image URLs from all over the web)
      {
        protocol: "https" as const,
        hostname: "**",
      },
      {
        protocol: "https" as const,
        hostname: "images.pexels.com",
      },
    ],
  },
};

export default withPWA(nextConfig);