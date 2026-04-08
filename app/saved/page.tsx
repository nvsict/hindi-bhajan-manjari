"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHeart, FaTrash, FaArrowRight, FaPrayingHands } from 'react-icons/fa';

interface SavedBhajan {
  title: string;
  slug: string;
  addedAt: string;
}

export default function SavedBhajansPage() {
  const [savedBhajans, setSavedBhajans] = useState<SavedBhajan[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Load favorites from local storage when the page mounts
    const stored = JSON.parse(localStorage.getItem('bhajan_favorites') || '[]');
    // Sort by newest first
    stored.sort((a: SavedBhajan, b: SavedBhajan) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime());
    setSavedBhajans(stored);
    setIsMounted(true);
  }, []);

  const removeFavorite = (slugToRemove: string) => {
    const updated = savedBhajans.filter(b => b.slug !== slugToRemove);
    setSavedBhajans(updated);
    localStorage.setItem('bhajan_favorites', JSON.stringify(updated));
  };

  return (
    <div className="min-h-screen bg-orange-50/30 py-10 md:py-16">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* 🌟 SEO & Layout Shell: Always rendered, even during SSR */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center rotate-3 shadow-sm shrink-0">
            <FaHeart size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">My Sangrah</h1>
            <p className="text-gray-500 font-medium mt-1">Your personal collection of saved bhajans.</p>
          </div>
        </div>

        {/* 🌟 Premium Skeleton Loader during client hydration */}
        {!isMounted ? (
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {[1, 2, 3, 4].map((skeleton) => (
              <div key={skeleton} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm animate-pulse flex flex-col h-[140px]">
                <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-100 rounded-lg w-1/2 mb-auto"></div>
                <div className="flex justify-between items-center mt-6">
                  <div className="h-4 bg-orange-100 rounded-lg w-24"></div>
                  <div className="h-6 bg-gray-100 rounded-lg w-6"></div>
                </div>
              </div>
            ))}
          </div>
        ) : savedBhajans.length === 0 ? (
          
          /* Empty State */
          <div className="bg-white p-12 rounded-[2.5rem] border border-orange-100 shadow-sm text-center flex flex-col items-center animate-fade-in-up">
            <div className="w-24 h-24 bg-orange-50 rounded-full flex items-center justify-center mb-6">
              <FaPrayingHands className="text-5xl text-orange-500 drop-shadow-sm" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Your collection is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md font-medium leading-relaxed">
              When you find a bhajan you love, tap the heart icon to save it here for quick reading later.
            </p>
            <Link 
              href="/" 
              className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-3.5 rounded-full font-bold shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-2"
            >
              Explore Bhajans <FaArrowRight />
            </Link>
          </div>
          
        ) : (
          
          /* Populated List */
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {savedBhajans.map((bhajan) => (
              <div 
                key={bhajan.slug} 
                className="bg-white p-6 rounded-[2rem] border border-orange-100/60 shadow-[0_4px_20px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_-10px_rgba(234,88,12,0.15)] hover:border-orange-200 transition-all duration-300 group relative overflow-hidden flex flex-col"
              >
                <div className="flex-1 pr-10">
                  <h3 className="text-xl font-black text-gray-900 mb-1.5 leading-tight line-clamp-2 group-hover:text-orange-700 transition-colors">
                    {bhajan.title}
                  </h3>
                  <p className="text-[11px] uppercase tracking-widest text-gray-400 font-bold">
                    Saved on {new Date(bhajan.addedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <Link 
                    href={`/bhajan/${bhajan.slug}`} 
                    className="text-orange-600 font-black hover:text-orange-700 text-[13px] uppercase tracking-wider flex items-center gap-1.5 px-4 py-2 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors"
                  >
                    Read Lyrics <FaArrowRight size={12} />
                  </Link>

                  <button 
                    onClick={() => removeFavorite(bhajan.slug)}
                    className="text-gray-300 hover:text-red-500 hover:bg-red-50 w-9 h-9 rounded-xl flex items-center justify-center transition-all active:scale-95"
                    title="Remove from Saved"
                    aria-label={`Remove ${bhajan.title} from saved`}
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}