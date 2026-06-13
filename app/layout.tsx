import type { Metadata, Viewport } from "next";

// 🌟 1. All 5 Devotional Fonts + Base Fonts Imported
import { 
  Geist, 
  Geist_Mono, 
  Hind, 
  Noto_Serif_Devanagari, 
  Amita, 
  Poppins, 
  Kalam 
} from "next/font/google";
import "./globals.css";

// 🌟 Next.js Built-in Script Optimizer
import Script from "next/script";

// 🌟 Components
import ConditionalHeader from "../components/ConditionalHeader";
import ConditionalFooter from "../components/ConditionalFooter";
import SmoothScrolling from "../components/SmoothScrolling";
import AnalyticsWrapper from '@/components/AnalyticsWrapper';
import NextTopLoader from 'nextjs-toploader';
import ScrollToTop from '@/components/ScrollToTop';

// 🌟 MICROSOFT CLARITY
import ClarityAnalytics from '@/components/ClarityAnalytics';

// 🌟 PWA & GLOBAL FEATURE IMPORTS
import PwaRegistration from '@/components/PwaRegistration';
import { ThemeProvider } from '@/components/ThemeProvider';

// 🌟 SMART SITE ASSISTANT
import SiteAssistant from '@/components/SiteAssistant';

// 🌟 NEW: CAMPAIGN MODAL (GLOBAL POPUP)
import CampaignModal from '@/components/CampaignModal';

// --- BASE FONTS ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- THE 5 DEVOTIONAL PERSONALITIES ---
const hindFont = Hind({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  variable: "--font-hind",
  display: 'swap',
});

const notoSerifDeva = Noto_Serif_Devanagari({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari'],
  variable: "--font-noto-serif",
  display: 'swap',
  preload: false, 
});

const amitaFont = Amita({
  weight: ['400', '700'],
  subsets: ['devanagari'],
  variable: "--font-amita",
  display: 'swap',
  preload: false, 
});

const poppinsFont = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  variable: "--font-poppins",
  display: 'swap',
  preload: false, 
});

const kalamFont = Kalam({
  weight: ['400', '700'],
  subsets: ['devanagari'],
  variable: "--font-kalam",
  display: 'swap',
  preload: false, 
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hindibhajanmanjari.com";

// 🌟 Explicit Viewport Export (Next.js 14 Best Practice)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fffcf5" },
    { media: "(prefers-color-scheme: dark)", color: "#0c0804" }
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "हिंदी भजन मंजरी | Hindi Bhajan Manjari - Lyrics & Aarti",
    template: "%s | Hindi Bhajan Manjari"
  },
  description: "हिंदी भजन मंजरी पर आपका हार्दिक स्वागत है। यहाँ आप सभी देवी-देवताओं के प्रामाणिक भजन, आरती, चालीसा और मंत्रों के लिरिक्स (Lyrics) और उनके भावार्थ हिंदी में पढ़ सकते हैं। जय श्री राम।",
  keywords: [
    "Hindi Bhajan", "Bhajan Lyrics", "Aarti Lyrics", "Chalisa Sangrah", "Devotional Songs", "Mantra Meaning",
    "हिंदी भजन", "भजन लिरिक्स", "आरती संग्रह", "चालीसा", "भक्ति गीत", "मंत्र भावार्थ", "प्रार्थना",
    "Krishna Bhajan", "Shiv Bhajan", "Hanuman Chalisa", "Mata ke Bhajan", "Ganesh Aarti", "Ram Bhajan",
    "Bhajan with meaning", "Bhavarth sahit bhajan", "Morning devotional songs lyrics", "Spiritual songs Hindi"
  ],
  verification: {
    google: "pr7vLaXyG4j1uq1rscn6Vz8LozTAvDjPn8NLbSfM6BY", 
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png', 
  },
  manifest: '/manifest.json', 
  openGraph: {
    type: 'website',
    locale: 'hi_IN',
    url: baseUrl,
    siteName: 'Hindi Bhajan Manjari',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'हिंदी भजन मंजरी - Hindi Bhajan Manjari',
      },
    ],
  },
};

// ==========================================
// 🌟 SOLUTION STEP 1: Server-Side Anti-Adblock Library Fetch with Caching
// ==========================================
async function getAntiAdblockLibrary() {
  const adcashApiUrl = "https://adbpage.com/adblock?v=3&format=js";
  
  try {
    // 💡 Fetching the code from Adcash server side.
    // The response is cached for 300 seconds (5 minutes) as recommended.
    const response = await fetch(adcashApiUrl, {
      next: { revalidate: 300 }, // Caching mechanism
      headers: {
        'User-Agent': 'HindiBhajanManjari/1.0 ServerFetch' // Optional but good practice
      }
    });

    if (!response.ok) {
      throw new Error(`Adcash API failed with status ${response.status}`);
    }

    // Get the raw source code string
    const librarySource = await response.text();
    return librarySource;

  } catch (error) {
    console.error("🌟 Adcash Anti-Adblock Fetch Error:", error);
    // 💡 IMPORTANT: If fetch fails, we don't want to crash the site.
    // We return null so the site renders normally (but without ads).
    return null;
  }
}

// ==========================================
// 🌟 RootLayout Server Component
// ==========================================
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  // 🌟 CALLING STEP 1 FUNCTION Server Side
  const adcashLibraryCode = await getAntiAdblockLibrary();

  return (
    <html lang="hi" suppressHydrationWarning>
      
      <head>
        {/* ==========================================
            🌟 STEP 2: Injected Anti-Adblock Library Code
            It is injected directly into the <head> using templates literals to prevent errors.
            ========================================== */}
        {adcashLibraryCode && (
          <script id="adcash-anti-adblock-lib">
            {`// --- Adcash Anti-Adblock Library Source ---
${adcashLibraryCode}`}
          </script>
        )}

        {/* 🛡️ CSP Security Update
             If Adcash asks to connect to other domains, we must add them here.
             connect-src * is used which is quite open, but safe for ad networks.
        */}
        <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://*.googlesyndication.com https://*.doubleclick.net https://*.googletagmanager.com https://*.clarity.ms https://*.google.com https://*.adtrafficquality.google; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src * blob: data:; font-src 'self' https://fonts.gstatic.com data:; connect-src *; frame-src 'self' https://www.youtube.com https://www.instagram.com;" />

        {/* Supabase & Media API Preconnects */}
        <link rel="preconnect" href="https://vjylssvpxjhzjkmqzvjz.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
      </head>

      <body 
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${hindFont.variable} ${notoSerifDeva.variable} ${amitaFont.variable} ${poppinsFont.variable} ${kalamFont.variable} antialiased bg-orange-50/30 dark:bg-[#0c0804] flex flex-col min-h-screen selection:bg-orange-500 selection:text-white transition-colors duration-300`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          
          <ClarityAnalytics />

          <ScrollToTop />
          <NextTopLoader 
            color="#ea580c"
            initialPosition={0.65}
            crawlSpeed={50}
            height={4}
            showSpinner={false}
            easing="cubic-bezier(0.1, 0.7, 1.0, 0.1)"
            speed={150}
            crawl={true}
            shadow="0 0 15px #ea580c, 0 0 10px #fbbf24"
          />

          <SmoothScrolling>
            <ConditionalHeader /> 
            
            <main className="flex-1">
              {children}
            </main>
            
            <ConditionalFooter />
          </SmoothScrolling>
            
          <AnalyticsWrapper gaId="G-LVXN7TD3JB" />
          
          {/* 🌟 PWA Registration */}
          <PwaRegistration />

          {/* 🌟 GLOBAL MODAL & ASSISTANT */}
          <CampaignModal />
          <SiteAssistant />

          {/* ==========================================
              🌟 STEP 3: Run your ad format
              Initializing the ad formats anywhere below the library.
              Placed before closing body for optimal performance.
              ========================================== */}
          <Script id="adcash-autotag-init" strategy="afterInteractive">
            {`
              if (typeof aclib !== 'undefined') {
                  aclib.runAutoTag({
                      zoneId: 'wlqefco1zm',
                  });
              } else {
                  console.warn('Adcash aclib library failed to inject correctly on client side.');
              }
            `}
          </Script>

        </ThemeProvider>
      </body>
    </html>
  );
}