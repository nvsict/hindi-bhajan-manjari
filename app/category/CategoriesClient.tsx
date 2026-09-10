"use client";

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { FaBookOpen, FaMusic, FaArrowLeftLong, FaMagnifyingGlass, FaXmark } from 'react-icons/fa6';

type Category = {
  id: string;
  name_hindi: string;
  name_hinglish: string;
  slug: string;
};

export default function CategoriesClient({ initialCategories }: { initialCategories: Category[] }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Fast client-side filtering by Hindi or Hinglish category names
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return initialCategories;
    const lowerQuery = searchQuery.toLowerCase();
    return initialCategories.filter(cat => 
      cat.name_hinglish.toLowerCase().includes(lowerQuery) ||
      cat.name_hindi.includes(searchQuery)
    );
  }, [searchQuery, initialCategories]);

  return (
    <main className="min-h-screen bg-orange-50/30 dark:bg-[#0c0804] pb-24">
      {/* 🌟 Hero & Search Header */}
      <section className="relative bg-gradient-to-br from-orange-600 via-orange-500 to-red-600 dark:from-orange-950 dark:via-[#2a1106] dark:to-[#1a0802] pt-10 pb-24 px-4 overflow-hidden border-b border-orange-200 dark:border-orange-900/50">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-white/20 dark:bg-orange-500/10 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-4xl mx-auto relative z-10 flex flex-col items-center text-center">
          
          {/* Back Navigation Button */}
          <div className="w-full flex justify-start mb-6">
            <Link 
              href="/" 
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-orange-100 hover:text-white dark:text-orange-300 dark:hover:text-white transition-colors bg-white/10 dark:bg-black/30 backdrop-blur-md px-4 py-2 rounded-xl border border-white/20 dark:border-orange-500/20"
            >
              <FaArrowLeftLong size={12} /> Back to Home
            </Link>
          </div>

          <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/20 dark:bg-black/20 backdrop-blur-md mb-4 shadow-lg border border-white/30 dark:border-white/10 text-white">
            <FaBookOpen className="text-2xl sm:text-3xl" />
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-3 text-white drop-shadow-lg tracking-tight">
            Sacred <span className="text-orange-200 dark:text-orange-400">Categories</span>
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-orange-50 dark:text-orange-200/80 max-w-2xl mx-auto font-medium leading-relaxed drop-shadow-sm mb-6">
            Browse through our entire collection of spiritual categories—from daily Aartis to powerful Mantras and Stotrams.
          </p>

          {/* 🌟 Lightweight Live Search Bar */}
          <div className="w-full max-w-lg relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <FaMagnifyingGlass className="text-orange-200 dark:text-orange-500/70 text-lg transition-colors group-focus-within:text-white" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search categories (e.g. Aarti, आरती, Chalisa)..."
              className="w-full py-3.5 sm:py-4 pl-12 pr-12 bg-white/10 dark:bg-black/30 backdrop-blur-md border border-white/20 dark:border-orange-500/30 rounded-2xl text-white placeholder-orange-100/70 dark:placeholder-orange-500/50 focus:outline-none focus:ring-2 focus:ring-white/50 dark:focus:ring-orange-500/50 transition-all shadow-lg text-sm sm:text-base"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-orange-200 hover:text-white transition-colors"
              >
                <FaXmark className="text-lg" />
              </button>
            )}
          </div>

        </div>
      </section>

      {/* 🌟 Categories Grid Section */}
      <section className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 -mt-10 sm:-mt-12 relative z-20">
        {/* Mobile: 2 Columns (gap-3), Tablet: 3-4 Columns, Desktop: 5 Columns */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-5 items-stretch">
          {filteredCategories.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`} 
              className="group block h-full outline-none"
            >
              <div className="relative h-full flex flex-col justify-center bg-white dark:bg-[#120804] p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden border border-orange-100 dark:border-orange-900/40">
                
                {/* Animated Left Accent Bar */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-500 to-red-500 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-bottom"></div>

                {/* Decorative Background Watermark Icon */}
                <FaBookOpen className="absolute -bottom-3 -right-3 text-5xl sm:text-6xl text-orange-500/[0.04] dark:text-orange-400/[0.05] group-hover:text-orange-500/[0.1] dark:group-hover:text-orange-400/[0.12] group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />

                {/* Card Content */}
                <div className="relative z-10 flex items-center gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-orange-50 dark:bg-orange-950/50 text-orange-500 dark:text-orange-400 flex items-center justify-center shrink-0 group-hover:bg-orange-600 group-hover:text-white dark:group-hover:bg-orange-500 dark:group-hover:text-white transition-colors duration-300 shadow-inner">
                    <FaMusic className="text-xs sm:text-sm" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-orange-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors truncate tracking-tight">
                      {category.name_hindi}
                    </h3>
                    <p className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 group-hover:text-orange-500 dark:group-hover:text-orange-400/80 mt-0.5 truncate transition-colors">
                      {category.name_hinglish}
                    </p>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredCategories.length === 0 && (
          <div className="text-center py-16 bg-white/50 dark:bg-[#120804]/50 rounded-3xl backdrop-blur-sm border border-orange-100 dark:border-orange-900/30 mt-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-900/20 mb-4">
              <FaMagnifyingGlass className="text-2xl text-orange-400 opacity-50" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-orange-50 mb-1">No Categories Found</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              We couldn't find any match for "{searchQuery}".
            </p>
            <button 
              onClick={() => setSearchQuery('')}
              className="px-5 py-2 bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 text-sm font-bold rounded-xl hover:bg-orange-200 dark:hover:bg-orange-900/50 transition"
            >
              Clear Search
            </button>
          </div>
        )}
      </section>
    </main>
  );
}