import { Metadata } from 'next';
import { Suspense } from 'react';
import Link from 'next/link';
import { supabase } from '../utils/supabase';
import Hero from '../components/Hero'; 
import Sidebar from '../components/Sidebar';
import DeityBrowse from '../components/DeityBrowse';
import BhajanList from '../components/BhajanList'; 
import { BhajanGridSkeleton } from '../components/Skeletons';

import PopularCategories from '../components/home/PopularCategories';
import TrendingArtists from '../components/home/TrendingArtists';
import { FaBookOpen, FaClock, FaArrowRight, FaMusic } from 'react-icons/fa';
import ScrollReveal from '../components/ScrollReveal';
import SupportersWall from '@/components/SupportersWall';

// 🌟 NEW: Affiliate Slot & Vichar Banner
import AffiliateSlot from '../components/AffiliateSlot';
import VicharBanner from '../components/VicharBanner';

// VPS Native ISR (Incremental Static Regeneration)
export const revalidate = 300; 

// ==========================================
// 🌟 ADVANCED HOMEPAGE METADATA (Language Targeted)
// ==========================================
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
const seoDescription = "हिंदी भजन मंजरी पर आपका हार्दिक स्वागत है। यहाँ आप सभी देवी-देवताओं के प्रामाणिक भजन, आरती, चालीसा और मंत्रों के लिरिक्स (Lyrics) और उनके भावार्थ हिंदी में पढ़ सकते हैं।";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'हिंदी भजन मंजरी | Hindi Bhajan Manjari - Lyrics, Aarti & Chalisa Sangrah',
  description: seoDescription,
  keywords: 'Hindi Bhajan, Bhajan Lyrics, Aarti Lyrics, Chalisa Sangrah, Devotional Songs, हिंदी भजन, आरती संग्रह, हनुमान चालीसा, शिव भजन',
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'Hindi Bhajan Manjari - Ultimate Devotional Lyrics Collection',
    description: seoDescription,
    url: siteUrl,
    siteName: 'Hindi Bhajan Manjari',
    type: 'website',
    locale: 'hi_IN', // 👈 STEP 2: Tells Google/Facebook the primary language is Hindi (India)
    alternateLocale: 'en_IN', // 👈 Lets them know English/Hinglish UI exists
    images: [
      {
        url: `${siteUrl}/og-image.jpg`, 
        width: 1200,
        height: 630,
        alt: 'Hindi Bhajan Manjari',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Hindi Bhajan Manjari',
    description: seoDescription,
    images: [`${siteUrl}/og-image.jpg`],
  },
};

// ==========================================
// 🌟 HELPER: FETCH WITH RETRY LOGIC
// ==========================================
async function fetchLatestBhajansWithRetry(retries = 3, delayMs = 1000) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await supabase
        .from('mv_bhajan_details')
        .select(`
          title_hinglish, 
          title_hindi, 
          slug, 
          lyrics_hindi,
          video_embed_url,
          deity, 
          categories
        `)
        .order('created_at', { ascending: false })
        .range(0, 9);

      if (error) throw error;
      
      return data;
    } catch (err: any) {
      console.warn(`[Homepage] Fetch attempt ${attempt} failed:`, err.message);
      
      if (attempt === retries) {
        throw err; 
      }
      
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  return null;
}

// ==========================================
// 🌟 VICHAR BANNER SECTION
// ==========================================
async function LatestVicharSection() {
  const { data: latestVichars, error } = await supabase
    .from('mere_vichar')
    .select('slug, title_hindi, quote_text')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(5);

  if (error || !latestVichars || latestVichars.length === 0) return null;

  return <VicharBanner vichars={latestVichars} />;
}

// ==========================================
// 🌟 SERVER-SIDE AFFILIATE CAROUSEL FETCH
// ==========================================
async function HomepageCarouselSection() {
  try {
    const { data: products, error } = await supabase
      .from('affiliate_products')
      .select('*')
      .eq('is_active', true)
      .order('clicks', { ascending: false })
      .limit(8);

    if (error) throw error;
    if (!products || products.length === 0) return null;

    return <AffiliateSlot layout="homepage-carousel" products={products} />;
  } catch (err: any) {
    console.error("[Homepage] Failed to fetch affiliate products:", err.message);
    return null;
  }
}

// ==========================================
// 🌟 LATEST GYAN SECTION
// ==========================================
async function LatestGyanSection() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('title_hindi, title_hinglish, slug, read_time_minutes, meta_description, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3);

  if (error || !articles || articles.length === 0) return null; 

  return (
    <div className="mt-16 mb-12">
      <ScrollReveal yOffset={20}>
        <div className="flex flex-row items-center justify-between border-b border-orange-100 dark:border-[#2a1d12] pb-3 md:pb-4 mb-6">
          {/* 👈 STEP 3: Content-Level Language Tagging for Pure Hindi text */}
          <h2 lang="hi" className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2 md:gap-3 transition-colors">
            सनातन <span className="text-orange-600">ज्ञान</span>
          </h2>
          <Link href="/gyan" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded px-1">
            View All <FaArrowRight className="group-hover:translate-x-1 transition-transform text-xs" />
          </Link>
        </div>
      </ScrollReveal>

      <div className="grid grid-cols-1 gap-4">
        {articles.map((article, index) => {
          const publishDate = new Date(article.published_at).toLocaleDateString('hi-IN', {
            month: 'short', day: 'numeric', year: 'numeric'
          });

          return (
            <div key={article.slug}>
              <ScrollReveal delay={index * 0.1} yOffset={30}>
                <Link 
                  href={`/gyan/${article.slug}`} 
                  className="flex flex-col sm:flex-row gap-4 p-5 bg-gradient-to-br from-white to-orange-50/30 dark:from-[#110c08] dark:to-[#1a120b] rounded-2xl border border-orange-100 dark:border-[#2a1d12] hover:border-orange-300 dark:hover:border-orange-900/50 hover:shadow-md transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  <div className="w-12 h-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                    <FaBookOpen size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-1.5 transition-colors">
                      <span className="text-orange-500 flex items-center gap-1"><FaClock /> {article.read_time_minutes} Min</span>
                      <span>&bull;</span>
                      <span>{publishDate}</span>
                    </div>
                    {/* 👈 STEP 3: Content-Level Language Tagging */}
                    <h3 lang="hi" className="text-xl font-black text-gray-900 dark:text-gray-100 font-hindi leading-tight mb-1 group-hover:text-orange-600 dark:group-hover:text-orange-500 transition-colors line-clamp-1">
                      {article.title_hindi}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 transition-colors">
                      {article.meta_description || article.title_hinglish}
                    </p>
                  </div>
                </Link>
              </ScrollReveal>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// 🌟 LATEST BHAJANS SECTION
// ==========================================
async function LatestBhajansSection() {
  try {
    const rawBhajans = await fetchLatestBhajansWithRetry(3, 1000);

    if (!rawBhajans) {
      throw new Error("No data returned from database");
    }

    const initialBhajans = rawBhajans.map((bhajan: any) => ({
      ...bhajan,
      deity: Array.isArray(bhajan.deity) ? bhajan.deity[0] : bhajan.deity,
    }));

    return <BhajanList initialBhajans={initialBhajans} />;
    
  } catch (error: any) {
    console.error("[Homepage] Failed to fetch latest bhajans after retries:", error.message);
    return (
      <div className="p-8 text-center bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30">
        {/* 👈 STEP 3: Content-Level Language Tagging */}
        <p lang="hi" className="text-orange-800 dark:text-orange-400 font-medium">संग्रह लोड हो रहा है, कृपया कुछ समय बाद पुनः प्रयास करें।</p> 
      </div>
    );
  }
}

// ==========================================
// 🌟 SERVER-SIDE SUPPORTERS WALL FETCH (SMART SORTING)
// ==========================================

// Helper function to detect Hindi characters
const hasHindiCharacters = (str: string | null) => {
  if (!str) return false;
  return /[\u0900-\u097F]/.test(str);
};

// Strict anonymous checker
const isStrictlyAnonymous = (supporter: any) => {
  if (supporter.is_anonymous) return true;
  if (!supporter.name) return true;
  
  const nameCleaned = supporter.name.trim().toLowerCase();
  if (nameCleaned === "एक गुप्त भक्त" || nameCleaned === "anonymous" || nameCleaned === "gupt bhakt") {
    return true;
  }
  
  return false;
};

async function SupportersWallSection() {
  let supporters = [];
  let total = 0;

  try {
    // 1. Fetch more records to give our algorithm a good pool to sort from
    const { data, count, error } = await supabase
      .from('mv_active_supporters')
      .select('*', { count: 'exact' })
      .order('is_anonymous', { ascending: true }) // Get named people first
      .order('amount', { ascending: false }) // Then by highest amount
      .order('created_at', { ascending: false }) // Tie breaker: recent first
      .limit(30); // Fetch top 30 to process

    if (error) throw error;
    
    total = count || 0;
    const rawData = data || [];

    // 2. Apply our Smart 3-Tier Algorithm on the Server
    const sortedSupporters = rawData.sort((a, b) => {
      const aIsAnon = isStrictlyAnonymous(a);
      const bIsAnon = isStrictlyAnonymous(b);

      // Rule A: Named supporters ALWAYS go above anonymous ones
      if (aIsAnon !== bIsAnon) return aIsAnon ? 1 : -1; 
      
      // Rule B: Hindi names go above English names
      if (!aIsAnon && !bIsAnon) {
        const aIsHindi = hasHindiCharacters(a.name);
        const bIsHindi = hasHindiCharacters(b.name);
        if (aIsHindi !== bIsHindi) return aIsHindi ? -1 : 1; 
      }

      // Rule C: Higher amount wins
      return b.amount - a.amount;
    });

    // 3. Slice exactly 8 for the homepage showcase
    supporters = sortedSupporters.slice(0, 8);

  } catch (err: any) {
    console.error("[Homepage] Failed to load supporters wall on server:", err.message);
  }

  return <SupportersWall supporters={supporters} total={total} />;
}

export default function Home() {
  const homeSchemaGraph = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        "url": siteUrl,
        "name": "Hindi Bhajan Manjari",
        "description": seoDescription,
        "potentialAction": {
          "@type": "SearchAction",
          "target": {
            "@type": "EntryPoint",
            "urlTemplate": `${siteUrl}/search?q={search_term_string}`
          },
          "query-input": "required name=search_term_string"
        },
        "inLanguage": ["hi", "en-IN"]
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        "name": "Hindi Bhajan Manjari",
        "url": siteUrl,
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/logo.png`
        },
        "sameAs": [
          "https://www.facebook.com/mohit.tarkar.7121/",
          "https://www.instagram.com/hindibhajanmanjari/"
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-transparent transition-colors duration-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchemaGraph) }} />

      {/* 1. Hero Section */}
      <Hero />

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col lg:flex-row gap-8 items-start">
        
        <main className="flex-1 w-full min-w-0">
          
          {/* ==========================================
              🌟 1.5. AAJ KA VICHAR BANNER (Above Deities)
              ========================================== */}
          <Suspense fallback={<div className="h-[300px] bg-gray-50 dark:bg-[#110c08] rounded-[2.5rem] animate-pulse mb-8 border border-gray-100 dark:border-[#2a1d12]"></div>}>
            <LatestVicharSection />
          </Suspense>

          {/* 2. Visual Hook: Who to pray to? */}
          <DeityBrowse /> 

          {/* ==========================================
              🌟 2.5 PREMIUM HOMEPAGE CAROUSEL (0ms Server Load)
              ========================================== */}
          <div className="mt-8 md:mt-12">
            <Suspense fallback={
              <div className="w-full my-8 min-h-[420px] flex flex-col justify-between">
                <div className="h-8 w-48 bg-gray-200 dark:bg-[#1a120b] rounded-full animate-pulse mb-6 ml-2"></div>
                <div className="flex gap-4 md:gap-6 overflow-hidden px-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="w-[240px] md:w-[280px] h-[340px] bg-white dark:bg-[#120c08] rounded-[2rem] animate-pulse shrink-0 ring-1 ring-gray-900/5"></div>
                  ))}
                </div>
              </div>
            }>
              <HomepageCarouselSection />
            </Suspense>
          </div>

          {/* 3. Core Content: The Bhajans */}
          <div className="mt-8 md:mt-12">
            <ScrollReveal yOffset={20}>
              <div className="flex flex-row items-center justify-between border-b border-gray-100 dark:border-[#2a1d12] pb-3 md:pb-4 mb-6 md:mb-8 mt-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2 md:gap-3 transition-colors">
                  <FaMusic className="text-orange-500 text-xl md:text-2xl hidden sm:block" />
                  Latest <span className="text-orange-600">Bhajans</span>
                </h2>
              </div>
            </ScrollReveal>
            
            <Suspense fallback={<BhajanGridSkeleton />}>
              <LatestBhajansSection />
            </Suspense>
          </div>

          {/* 4. Secondary Discovery */}
          <div className="mt-16">
            <PopularCategories />
          </div>

          <div className="mt-8 md:mt-12">
            <TrendingArtists />
          </div>

          {/* 🌟 0ms Server-Rendered Supporters Wall */}
          <div className="mt-16">
            <Suspense fallback={<div className="h-64 bg-orange-50/50 dark:bg-[#110c08]/80 rounded-[2.5rem] animate-pulse border border-orange-100/50 dark:border-[#2a1d12]/50 my-4 md:my-6"></div>}>
              <SupportersWallSection />
            </Suspense>
          </div>

          {/* 5. Deep Reading Anchor */}
          <Suspense fallback={<div className="h-64 bg-gray-50 dark:bg-[#110c08] rounded-2xl animate-pulse mt-16 mb-12 border border-gray-100 dark:border-[#2a1d12]"></div>}>
            <LatestGyanSection />
          </Suspense>

        </main>

        {/* 6. Intelligent Global Sidebar */}
        <Suspense fallback={
          <div className="hidden lg:block w-[300px] h-[800px] shrink-0 bg-gray-50/50 dark:bg-[#110c08] border border-gray-100 dark:border-[#2a1d12] rounded-[2rem] animate-pulse sticky top-28"></div>
        }>
          <div className="hidden lg:block lg:sticky lg:top-28 h-fit w-[300px] shrink-0 pb-8">
            <Sidebar />
          </div>
        </Suspense>

      </div>
    </div>
  );
}