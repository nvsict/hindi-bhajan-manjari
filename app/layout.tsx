import type { Metadata } from "next";

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

// 🌟 Components
import ConditionalHeader from "../components/ConditionalHeader";
import ConditionalFooter from "../components/ConditionalFooter";
import SmoothScrolling from "../components/SmoothScrolling";
import AnalyticsWrapper from '@/components/AnalyticsWrapper';
import NextTopLoader from 'nextjs-toploader';
import ScrollToTop from '@/components/ScrollToTop';

// 🌟 THE NEW SMART ADSENSE COMPONENT
import AdSense from '@/components/AdSense';

// 🌟 MICROSOFT CLARITY
import ClarityAnalytics from '@/components/ClarityAnalytics';

// 🌟 PWA & GLOBAL FEATURE IMPORTS
import PwaRegistration from '@/components/PwaRegistration';
import { ThemeProvider } from '@/components/ThemeProvider';

// 🌟 NEW: SMART SITE ASSISTANT & PUSH PROMPT
import SiteAssistant from '@/components/SiteAssistant';
import SlideInPrompt from '@/components/SlideInPrompt';

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
  other: {
    // 🌟 Google Verification for AdSense ownership
    "google-adsense-account": "ca-pub-5565563905050993",
  },
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" suppressHydrationWarning>
      
      <head>
        {/* Supabase API */}
        <link rel="preconnect" href="https://vjylssvpxjhzjkmqzvjz.supabase.co" crossOrigin="anonymous" />
        {/* YouTube Thumbnails */}
        <link rel="preconnect" href="https://img.youtube.com" crossOrigin="anonymous" />
        {/* Google AdSense Servers */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossOrigin="anonymous" />

        {/* 🌟 THE ADSENSE FIX: Pure HTML Script tag instead of Next.js <Script> 
            This single line removes the "data-nscript" error and initializes Auto Ads perfectly. */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5565563905050993" 
          crossOrigin="anonymous"
        ></script>
      </head>

      <body 
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${hindFont.variable} ${notoSerifDeva.variable} ${amitaFont.variable} ${poppinsFont.variable} ${kalamFont.variable} antialiased bg-orange-50/30 dark:bg-[#0c0804] flex flex-col min-h-screen selection:bg-orange-500 selection:text-white transition-colors duration-300`}
      >
        {/* 🌟 SMART ADSENSE: Admin panel पर अपने आप छुप जाएगा */}
        <AdSense />

        {/* 🌟 MICROSOFT CLARITY ANALYTICS */}
        <ClarityAnalytics />

        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
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
          
          {/* 🌟 PWA & Engagement UI */}
          <PwaRegistration />

          {/* 🌟 MANJARI GUIDE (Smart Site Assistant) */}
          <SiteAssistant />

          {/* 🌟 SCROLL-DELAY PUSH PROMPT (Emotional Hook) */}
          <SlideInPrompt />

        </ThemeProvider>
      </body>
    </html>
  );
}