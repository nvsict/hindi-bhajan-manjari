import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Turbopack is active by default in Next 15+, but good to have the object ready
  turbopack: {}, 

  // 🌟 The Invisible Bridge for Supabase (Bypasses Jio/Airtel ISP Blocks)
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
    // Note: removed 'qualities' array as it's not a standard Next.js image config property in newer versions
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: "**.supabase.co",
      },
      {
        protocol: "https" as const,
        hostname: "i.postimg.cc",
      },
      {
        protocol: "https" as const,
        hostname: "**.googleusercontent.com",
      },
      {
        protocol: "https" as const,
        hostname: "images.pexels.com",
      },
      // Keep the wildcard last just in case
      {
        protocol: "https" as const,
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;