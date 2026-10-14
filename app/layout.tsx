import type { Metadata, Viewport } from "next";
import Script from "next/script"; // 🌟 NEW: NEXT.JS SCRIPT COMPONENT
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
import MetaPixel from '@/components/MetaPixel'; 

// 🌟 PWA & GLOBAL FEATURE IMPORTS
import PwaRegistration from '@/components/PwaRegistration';
import { ThemeProvider } from '@/components/ThemeProvider';
import CampaignModal from '@/components/CampaignModal';

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#fffcf5", 
  colorScheme: "light", 
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
    "हिंदी भजन", "भजन लिरिक्स", "आरती संग्रह", "चालीसा", "भक्ति गीत", "मंत्र भावार्थ", "प्रार्थना"
  ],
  
  alternates: {
    languages: {
      'hi': '/',
      'x-default': '/',
    },
  },

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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="hi" suppressHydrationWarning>
      
      <head>
        {/* 🌟 GOOGLE ADSENSE ACCOUNT VERIFICATION TAG */}
        <meta name="google-adsense-account" content="ca-pub-9765995147902028" />

        {/* Supabase & Media API Preconnects */}
        <link rel="preconnect" href="https://vjylssvpxjhzjkmqzvjz.supabase.co" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />

        {/* 🌟 GOOGLE ADSENSE ASYNC SCRIPT */}
        <Script
          id="google-adsense"
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-9765995147902028"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>

      <body 
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${hindFont.variable} antialiased bg-orange-50/30 dark:bg-[#0c0804] flex flex-col min-h-screen selection:bg-orange-500 selection:text-white transition-colors duration-300`}
      >
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
          <PwaRegistration />
          <ExitFeedbackManager />
          <CampaignModal />
          <DivinePeek />

        </ThemeProvider>
      </body>
    </html>
  );
} 