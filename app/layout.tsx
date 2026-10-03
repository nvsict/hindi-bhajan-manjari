import type { Metadata, Viewport } from "next";
import AnnouncementStrip from '@/components/AnnouncementStrip';

// 🌟 1. PERF FIX: Removed the 4 extra fonts. Only loading default 'Hind' and Base fonts upfront.
import { 
  Geist, 
  Geist_Mono, 
  Hind 
} from "next/font/google";
import "./globals.css";

// 🌟 Components
import ConditionalHeader from "../components/ConditionalHeader";
import ConditionalFooter from "../components/ConditionalFooter";
import SmoothScrolling from "../components/SmoothScrolling";
import AnalyticsWrapper from '@/components/AnalyticsWrapper';
import NextTopLoader from 'nextjs-toploader'; 
import dynamic from 'next/dynamic';
import ScrollToTop from '@/components/ScrollToTop';
import ScrollRecovery from '@/components/ScrollRecovery';
import EngagementTracker from '@/components/EngagementTracker';
import ExitFeedbackManager from '@/components/ExitFeedbackManager';

// 🌟 MICROSOFT CLARITY & META PIXEL
import ClarityAnalytics from '@/components/ClarityAnalytics';
import MetaPixel from '@/components/MetaPixel'; // 🌟 NEW: META PIXEL IMPORT

// 🌟 PWA & GLOBAL FEATURE IMPORTS
import PwaRegistration from '@/components/PwaRegistration';
import { ThemeProvider } from '@/components/ThemeProvider';

// 🌟 NEW: CAMPAIGN MODAL (GLOBAL POPUP)
import CampaignModal from '@/components/CampaignModal';

// 🌟 NEW: MGID GLOBAL CONTROLLER (Load ads securely, except on /admin)
import MgidGlobal from '@/components/MgidGlobal';

// 🌟 FIX: Removed { ssr: false } because layout.tsx is a Server Component.
// The component itself has "use client" so it's perfectly safe and dynamic.
const DivinePeek = dynamic(() => import('@/components/DivinePeek'));

// --- BASE FONTS ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- THE DEFAULT DEVOTIONAL FONT ---
const hindFont = Hind({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  variable: "--font-hind",
  display: 'swap',
});

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hindibhajanmanjari.com";

// 🌟 Explicit Viewport Export (Next.js 14 Best Practice)
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  // 🌟 सिर्फ लाइट थीम का कलर रखें, डार्क वाला हटा दें
  themeColor: "#fffcf5", 
  colorScheme: "light", // 🌟 यह ब्राउज़र को डार्क मोड फोर्स करने से रोकेगा
};

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: "हिंदी भजन मंजरी | Hindi Bhajan Manjari - Lyrics & Aarti",
    template: "%s | Hindi Bhajan Manjari"
  },
  description: "हिंदी भजन मंजरी पर आपका हार्दिक स्वागत है। यहाँ आप सभी देवी-देवताओं के प्रामाणिक भजन, आरती, चालीसा और मंत्रों के लिरिक्स (Lyrics) और उनके भावार्थ हिंदी में पढ़ सकते हैं। जय श्री राम। ",
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
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'हिंदी भजन मंजरी - Hindi Bhajan Manjari',
      },
    ],
  },
};

// ==========================================
// 🌟 RootLayout Server Component
// ==========================================
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="hi" suppressHydrationWarning>
      
      <head>
        {/* Supabase & Media API Preconnects */}
        <link rel="preconnect" href="https://vjylssvpxjhzjkmqzvjz.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        
        {/* 🌟 MGID script removed from here. It is now safely handled by <MgidGlobal /> */}
      </head>

      <body 
        suppressHydrationWarning
        /* 🌟 PERF FIX: Removed heavy font variables from the body string */
        className={`${geistSans.variable} ${geistMono.variable} ${hindFont.variable} antialiased bg-orange-50/30 dark:bg-[#0c0804] flex flex-col min-h-screen selection:bg-orange-500 selection:text-white transition-colors duration-300`}
      >
        {/* 🌟 NEW: META PIXEL COMPONENT INJECTED HERE */}
        <MetaPixel />

        <ThemeProvider attribute="class" defaultTheme="light" forcedTheme="light" enableSystem={false}>

          <ScrollRecovery />
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
            <AnnouncementStrip />
            <ConditionalHeader /> 
            <EngagementTracker />
            <main className="flex-1 relative z-10">
              {children}
            </main>
            
            <ConditionalFooter />
          </SmoothScrolling>
            
          <AnalyticsWrapper gaId="G-LVXN7TD3JB" />
          
          {/* 🌟 PWA Registration */}
          <PwaRegistration />

          <ExitFeedbackManager />
          
          {/* 🌟 GLOBAL MODAL */}
          <CampaignModal />
          <DivinePeek />

          {/* ==========================================
              🌟 MGID GLOBAL AD CONTROLLER
              Safe execution: Blocks scripts & ads on /admin routes 
              ========================================== */}
          <MgidGlobal />

        </ThemeProvider>
      </body>
    </html>
  );
}