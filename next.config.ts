import type { NextConfig } from "next";

// 🌟 ADS.TXT DOMAINS FOR CSP 🌟
// All programmatic ad networks extracted from ads.txt to prevent CSP blocking
const adDomains = "https://*.journeymv.com https://*.google.com https://*.media.net https://*.pubmatic.com https://*.openx.com https://*.rubiconproject.com https://*.onetag.com https://*.improvedigital.com https://*.yieldmo.com https://*.contextweb.com https://*.appnexus.com https://*.rhythmone.com https://*.unrulymedia.com https://*.smartadserver.com https://*.gumgum.com https://*.indexexchange.com https://*.kargo.com https://*.fabrik.com https://*.triplelift.com https://*.themediagrid.com https://*.minutemedia.com https://*.lijit.com https://*.admanmedia.com https://*.inmobi.com https://*.sharethrough.com https://*.zetaglobal.net https://*.33across.com https://*.sonobi.com https://*.visiblemeasures.com https://*.risecodes.com https://*.xandr.com https://*.smaato.com https://*.nativo.com https://*.seedtag.com https://*.ogury.com https://*.amazon.com https://*.sovrn.com https://*.ad-generation.jp https://*.districtm.io https://*.undertone.com https://*.beachfront.com https://*.mediago.io https://*.adyoulike.com https://*.vidazoo.com https://*.imds.tv https://*.start.io https://*.aniview.com https://*.richaudience.com https://*.emxdgt.com https://*.conversantmedia.com https://*.cadent.com https://*.trustx.org https://*.smilewanted.com https://*.e-planning.net https://*.nextmillennium.io https://*.amxrtb.com https://*.adform.com https://*.trustedstack.com https://*.insticator.com https://*.doubleclick.net https://*.googlesyndication.com";

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
            // 🌟 ULTIMATE CSP: Dynamically injects ad domains to allow scripts and frames
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://www.instagram.com https://*.googletagmanager.com https://static.cloudflareinsights.com https://*.clarity.ms https://checkout.razorpay.com https://cdn.razorpay.com https://*.scriptwrapper.com ${adDomains}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://news.google.com; img-src * blob: data:; media-src * blob: data:; font-src 'self' https://fonts.gstatic.com data:; connect-src *; frame-src 'self' https://www.youtube.com https://www.instagram.com https://*.google.com https://*.razorpay.com ${adDomains}; worker-src 'self' blob:;`
          }
        ],
      },
    ];
  },
};

export default nextConfig;