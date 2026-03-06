import type { Metadata } from "next";
import { Geist, Geist_Mono, Hind } from "next/font/google";
import "./globals.css";
import ConditionalHeader from "../components/ConditionalHeader";
import ConditionalFooter from "../components/ConditionalFooter";
import SmoothScrolling from "../components/SmoothScrolling"; // 🌟 Imported Lenis Provider
import { GoogleAnalytics } from '@next/third-parties/google'; 
import NextTopLoader from 'nextjs-toploader';
import { SpeedInsights } from "@vercel/speed-insights/next"
import PushPrompt from '@/components/PushPrompt';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 🌟 THE UPGRADE: A highly modern, sleek Hindi font
const hindFont = Hind({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  variable: "--font-hind",
  display: 'swap',
});

// 🌟 THE NEW DOMAIN
const baseUrl = "https://www.hindibhajanmanjari.com";

export const metadata: Metadata = {
  // ⚡️ SEO FIX: This acts as the root for all automatically generated URLs
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
  },
  
  other: {
    "google-adsense-account": "ca-pub-5565563905050993",
  },
  
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} ${hindFont.variable} antialiased bg-orange-50/30 flex flex-col min-h-screen`}
      >
        {/* Top Loading Bar */}
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

        {/* 🌟 WRAPPED APP IN SMOOTH SCROLLING */}
        <SmoothScrolling>
          <ConditionalHeader /> 
          
          <main className="flex-1">
            {children}
          </main>
          
          <ConditionalFooter />
        </SmoothScrolling>
        <SpeedInsights/>

        {/* 🌟 PERFECT PLACEMENT: Will load asynchronously without blocking rendering */}
        <GoogleAnalytics gaId="G-LVXN7TD3JB" />
        
        {/* 🌟 OUR CUSTOM NATIVE PUSH SYSTEM */}
        <PushPrompt />
      </body>
    </html>
  );
}