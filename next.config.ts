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
};

export default nextConfig;