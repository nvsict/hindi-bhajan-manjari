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

export const revalidate = 300; 

// ==========================================
// 🌟 ADVANCED HOMEPAGE METADATA
// ==========================================
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
const seoDescription = "हिंदी भजन मंजरी पर आपका हार्दिक स्वागत है। यहाँ आप सभी देवी-देवताओं के प्रामाणिक भजन, आरती, चालीसा और मंत्रों के लिरिक्स (Lyrics) और उनके भावार्थ हिंदी में पढ़ सकते हैं।";

export const metadata: Metadata = {
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
    images: [
      {
        url: `${siteUrl}/og-image.jpg`, // Ensure you have an og-image.jpg in your public folder!
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
// THE PUBLISHER TRUST SIGNAL (Sanatan Gyan)
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
        <div className="flex flex-row items-center justify-between border-b border-orange-100 pb-3 md:pb-4 mb-6">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
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
            <ScrollReveal key={article.slug} delay={index * 0.1} yOffset={30}>
              <Link 
                href={`/gyan/${article.slug}`} 
                className="flex flex-col sm:flex-row gap-4 p-5 bg-gradient-to-br from-white to-orange-50/30 rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-300 group outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
              >
                <div className="w-12 h-12 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 group-hover:scale-110 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300">
                  <FaBookOpen size={20} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    <span className="text-orange-500 flex items-center gap-1"><FaClock /> {article.read_time_minutes} Min</span>
                    <span>&bull;</span>
                    <span>{publishDate}</span>
                  </div>
                  <h3 className="text-xl font-black text-gray-900 font-hindi leading-tight mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {article.title_hindi}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {article.meta_description || article.title_hinglish}
                  </p>
                </div>
              </Link>
            </ScrollReveal>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// LATEST BHAJANS
// ==========================================
async function LatestBhajansSection() {
  const { data: rawBhajans, error } = await supabase
    .from('bhajans')
    .select(`
      title_hinglish, 
      title_hindi, 
      slug, 
      lyrics_hindi,
      deities ( name_hinglish ), 
      categories ( name_hinglish )
    `)
    .order('created_at', { ascending: false })
    .range(0, 5); 

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-2xl border border-red-100">
        <p className="text-red-600 font-bold">Unable to load Bhajans at the moment.</p>
      </div>
    );
  }

  const initialBhajans = (rawBhajans || []).map(bhajan => ({
    ...bhajan,
    deities: Array.isArray(bhajan.deities) ? bhajan.deities[0] : bhajan.deities,
    categories: Array.isArray(bhajan.categories) ? bhajan.categories[0] : bhajan.categories,
  }));

  return <BhajanList initialBhajans={initialBhajans} />;
}

export default function Home() {
  // ==========================================
  // 🌟 THE HOMEPAGE SEO GRAPH (WebSite + Organization)
  // ==========================================
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
          "https://www.instagram.com/imp.erfecto_"
        ]
      }
    ]
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 🌟 INJECTING THE HOMEPAGE SCHEMA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homeSchemaGraph) }} />

      {/* 1. Hero Section */}
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0">
          
          {/* 2. Visual Hook: Who to pray to? */}
          <DeityBrowse /> 

          {/* 🌟 3. Core Content: The Bhajans (Moved up for immediate gratification) */}
          <div className="mt-8">
            <ScrollReveal yOffset={20}>
              <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 md:pb-4 mb-6 md:mb-8 mt-4">
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
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
          
          <div className="mt-8">
            <TrendingArtists />
          </div>

          {/* 5. Deep Reading Anchor (Moved to bottom) */}
          <Suspense fallback={<div className="h-64 bg-gray-50 rounded-2xl animate-pulse mt-16 mb-12 border border-gray-100"></div>}>
            <LatestGyanSection />
          </Suspense>

        </main>

        {/* 6. Intelligent Global Sidebar */}
        <Suspense fallback={
          <div className="hidden lg:block w-[340px] h-[800px] shrink-0 bg-gray-50/50 border border-gray-100 rounded-[2rem] animate-pulse sticky top-28"></div>
        }>
          <div className="hidden lg:block">
            <Sidebar />
          </div>
        </Suspense>

      </div>
    </div>
  );
}