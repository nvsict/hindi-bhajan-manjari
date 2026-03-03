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
import { FaBookOpen, FaClock, FaArrowRight } from 'react-icons/fa';

// 🌟 THE HOMEPAGE CANONICAL FIX
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/',
  },
};

export const revalidate = 300; 

// ==========================================
// 🌟 NEW: THE PUBLISHER TRUST SIGNAL (Sanatan Gyan)
// ==========================================
async function LatestGyanSection() {
  const { data: articles, error } = await supabase
    .from('articles')
    .select('title_hindi, title_hinglish, slug, read_time_minutes, meta_description, published_at')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(3);

  if (error || !articles || articles.length === 0) {
    return null; // Fail gracefully if no articles exist yet
  }

  return (
    <div className="mb-12">
      <div className="flex flex-row items-center justify-between border-b border-orange-100 pb-3 md:pb-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
          सनातन <span className="text-orange-600">ज्ञान</span>
        </h2>
        <Link href="/gyan" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group">
          View All <FaArrowRight className="group-hover:translate-x-1 transition-transform text-xs" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {articles.map((article) => {
          const publishDate = new Date(article.published_at).toLocaleDateString('hi-IN', {
            month: 'short', day: 'numeric', year: 'numeric'
          });

          return (
            <Link 
              href={`/gyan/${article.slug}`} 
              key={article.slug}
              className="flex flex-col sm:flex-row gap-4 p-5 bg-gradient-to-br from-white to-orange-50/30 rounded-2xl border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-300 group"
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
                <h3 className="text-xl font-black text-gray-900 font-hindi mb-1 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {article.title_hindi}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {article.meta_description || article.title_hinglish}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

// ==========================================
// EXISTING LATEST BHAJANS
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
    console.error("Error fetching initial bhajans:", error);
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
  return (
    <div className="min-h-screen bg-white">
      {/* 1. Hero Section */}
      <Hero />

      {/* 🌟 LAYOUT: Flex-row with items-start is crucial here so the Sidebar can be sticky */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0">
          
          {/* 2. Visual Deity Cards */}
          <DeityBrowse /> 

          {/* 3. Popular Categories Section */}
          <PopularCategories />

          {/* 4. Trending Artists Section */}
          <TrendingArtists />

          {/* ==========================================
              🌟 5. NEW: SANATAN GYAN SECTION
              This transforms the site from a "Songbook" to a "Publisher"
              ========================================== */}
          <Suspense fallback={<div className="h-64 bg-gray-50 rounded-2xl animate-pulse mb-12"></div>}>
            <LatestGyanSection />
          </Suspense>

          {/* 6. Latest Added Bhajans Header */}
          <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 md:pb-4 mb-6 md:mb-8 mt-4">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2 md:gap-3">
              Latest <span className="text-orange-600">Bhajans</span>
            </h2>
          </div>
          
          {/* 7. The Dynamic List Section */}
          <Suspense fallback={<BhajanGridSkeleton />}>
            <LatestBhajansSection />
          </Suspense>

        </main>

        {/* 8. Sidebar */}
        <Sidebar />

      </div>
    </div>
  );
}