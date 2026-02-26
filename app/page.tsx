import { Metadata } from 'next';
import { Suspense } from 'react';
import { supabase } from '../utils/supabase';
import Hero from '../components/Hero'; // Adjust paths to '@/components/...' if needed
import Sidebar from '../components/Sidebar';
import DeityBrowse from '../components/DeityBrowse';
import BhajanList from '../components/BhajanList'; 
import { BhajanGridSkeleton } from '../components/Skeletons';

import PopularCategories from '../components/home/PopularCategories';
import TrendingArtists from '../components/home/TrendingArtists';

// 🌟 THE HOMEPAGE CANONICAL FIX
// This tells Google this is the ONLY official homepage URL, fixing the GSC warning!
export const metadata: Metadata = {
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/',
  },
};

export const revalidate = 300; 

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
      <div className="p-8 text-center bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-600 font-medium">Unable to load Bhajans at the moment.</p>
      </div>
    );
  }

  // Flatten the arrays into single objects so they match your interface
  const initialBhajans = (rawBhajans || []).map(bhajan => ({
    ...bhajan,
    deities: Array.isArray(bhajan.deities) ? bhajan.deities[0] : bhajan.deities,
    categories: Array.isArray(bhajan.categories) ? bhajan.categories[0] : bhajan.categories,
  }));

  return <BhajanList initialBhajans={initialBhajans} />;
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* 1. Hero Section (Loads instantly with priority AVIF image) */}
      <Hero />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 items-start">
        
        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0">
          
          {/* 2. Visual Deity Cards */}
          <DeityBrowse /> 

          {/* 3. Popular Categories Section */}
          <div className="mt-8 rounded-3xl overflow-hidden border border-orange-100 shadow-sm">
            <PopularCategories />
          </div>

          {/* 4. Trending Artists Section */}
          <div className="mt-8 rounded-3xl overflow-hidden border border-orange-100 shadow-sm">
            <TrendingArtists />
          </div>

          {/* 5. Latest Added Bhajans Header */}
          <div className="flex items-center justify-between border-b border-orange-100 pb-3 mb-8 mt-12">
            <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
              <span className="w-2 h-8 bg-orange-600 rounded-full"></span>
              Latest Added Bhajans
            </h2>
          </div>
          
          {/* 6. The Dynamic List Section */}
          <Suspense fallback={<BhajanGridSkeleton />}>
            <LatestBhajansSection />
          </Suspense>

        </main>

        {/* 7. Sidebar */}
        <Sidebar />

      </div>
    </div>
  );
}