"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaHandsPraying, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

type Deity = {
  id: string;
  name_hindi: string;
  name_hinglish: string;
  slug: string;
  image_url: string;
};

export default function DeitiesClient({ initialDeities }: { initialDeities: Deity[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fast client-side filtering based on Hindi or Hinglish name
  const filteredDeities = useMemo(() => {
    if (!searchQuery.trim()) return initialDeities;
    const lowerQuery = searchQuery.toLowerCase();
    return initialDeities.filter(deity => 
      deity.name_hinglish.toLowerCase().includes(lowerQuery) ||
      deity.name_hindi.includes(searchQuery)
    );
  }, [searchQuery, initialDeities]);

  return (
    <main className="min-h-screen bg-orange-50/30 dark:bg-[#0c0804] pb-24">
      {/* 🌟 Premium Hero & Search Section */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 dark:from-orange-950 dark:via-[#2a1106] dark:to-[#1a0802] pt-20 pb-28 px-4 overflow-hidden border-b border-orange-200 dark:border-orange-900/50">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/20 dark:bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white/20 dark:bg-black/20 backdrop-blur-md mb-6 shadow-lg border border-white/30 dark:border-white/10">
            <FaHandsPraying className="text-2xl sm:text-3xl text-white drop-shadow-md" />
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 sm:mb-6 text-white drop-shadow-lg tracking-tight">
            Divine Deities
          </h1>
          
          {/* 🌟 Lightweight Live Search Bar */}
          <div className="w-full max-w-lg mt-4 relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaMagnifyingGlass className="text-orange-200 dark:text-orange-500/70 text-lg transition-colors group-focus-within:text-white" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search deities (e.g. Shiva, हनुमान)..."
              className="w-full py-4 pl-12 pr-12 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-orange-500/30 rounded-2xl text-white placeholder-orange-100/70 dark:placeholder-orange-500/50 focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-orange-500/50 transition-all shadow-lg text-lg"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-orange-200 hover:text-white transition-colors"
              >
                <FaXmark className="text-xl" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* 🌟 Deities Grid Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative z-20">
        {/* Mobile: 2 Columns (gap-3), Tablet: 3-4 Columns, PC: 5 Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 md:gap-8">
          {filteredDeities.map((deity, index) => (
            <Link 
              key={deity.id} 
              href={`/deity/${deity.slug}`}
              className="group relative bg-white dark:bg-[#120804] rounded-2xl sm:rounded-3xl shadow-md hover:shadow-2xl hover:-translate-y-1 sm:hover:-translate-y-2 transition-all duration-300 border border-orange-100 dark:border-orange-900/40 flex flex-col overflow-hidden"
            >
              {/* Image Container: Square aspect ratio ensures it looks great in 2-col mobile */}
              <div className="relative w-full aspect-square bg-orange-100/50 dark:bg-black/50 overflow-hidden">
                {deity.image_url ? (
                  <Image 
                    src={deity.image_url} 
                    alt={`${deity.name_hinglish} - ${deity.name_hindi}`} 
                    fill
                    priority={index < 6}
                    quality={60}
                    className="object-cover transition-transform duration-700 group-hover:scale-110" 
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 dark:from-[#1a0e08] dark:to-[#24130a] group-hover:scale-105 transition-transform duration-500">
                    <span className="text-4xl sm:text-6xl font-black text-orange-500/30 dark:text-orange-500/10">
                      {deity.name_hinglish[0]}
                    </span>
                  </div>
                )}
                
                {/* Desktop-only dark overlay for premium feel */}
                <div className="hidden sm:block absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
              </div>
              
              {/* Typography Section: Tighter padding on mobile */}
              <div className="p-3 sm:p-5 flex flex-col items-center sm:items-start text-center sm:text-left flex-grow relative bg-white dark:bg-[#120804]">
                <h3 className="font-extrabold text-gray-900 dark:text-orange-50 text-base sm:text-xl group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-1 w-full">
                  {deity.name_hinglish}
                </h3>
                <p className="text-orange-600 dark:text-orange-500/80 font-bold text-xs sm:text-base mt-0.5 sm:mt-1">
                  {deity.name_hindi}
                </p>
              </div>

              {/* Animated Bottom Border */}
              <div className="absolute bottom-0 left-0 w-full h-1 sm:h-1.5 bg-gradient-to-r from-orange-400 to-red-500 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300 ease-out"></div>
            </Link>
          ))}
        </div>

        {/* Empty State / No Results */}
        {filteredDeities.length === 0 && (
          <div className="text-center py-20 bg-white/50 dark:bg-black/20 rounded-3xl backdrop-blur-sm border border-orange-100 dark:border-orange-900/30 mt-8">
            <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4 sm:mb-6">
              <FaMagnifyingGlass className="text-2xl sm:text-4xl text-orange-400 opacity-50" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-orange-50 mb-2">No Deities Found</h3>
            <p className="text-sm sm:text-base text-gray-500 dark:text-gray-400">
              We couldn't find any match for "{searchQuery}".
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="mt-6 px-6 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 font-bold rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>
    </main>
  );
}