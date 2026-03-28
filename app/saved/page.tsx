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

  // Prevent server/client hydration mismatch
  if (!isMounted) return <div className="min-h-screen bg-gray-50 p-8">Loading...</div>;

  return (
    <div className="min-h-screen bg-orange-50/30 py-10 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-red-100 text-red-500 rounded-3xl flex items-center justify-center rotate-3 shadow-sm">
            <FaHeart size={28} />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight">My Sangrah</h1>
            <p className="text-gray-500 font-medium mt-1">Your personal collection of saved bhajans.</p>
          </div>
        </div>

        {savedBhajans.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-orange-100 shadow-sm text-center flex flex-col items-center">
            <FaPrayingHands className="text-6xl text-orange-600 mb-6" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Your collection is empty</h2>
            <p className="text-gray-500 mb-8 max-w-md">
              When you find a bhajan you love, tap the heart icon to save it here for quick reading later.
            </p>
            <Link 
              href="/" 
              className="bg-orange-600 text-white px-8 py-3.5 rounded-full font-bold shadow-md hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              Explore Bhajans <FaArrowRight />
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {savedBhajans.map((bhajan) => (
              <div 
                key={bhajan.slug} 
                className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow group relative overflow-hidden flex flex-col"
              >
                <div className="flex-1 pr-10">
                  <h3 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                    {bhajan.title}
                  </h3>
                  <p className="text-xs text-gray-500 font-medium">
                    Saved on {new Date(bhajan.addedAt).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="mt-6 flex items-center justify-between">
                  <Link 
                    href={`/bhajan/${bhajan.slug}`} 
                    className="text-orange-600 font-bold hover:text-orange-700 text-sm flex items-center gap-1.5"
                  >
                    Read Lyrics <FaArrowRight />
                  </Link>

                  <button 
                    onClick={() => removeFavorite(bhajan.slug)}
                    className="text-gray-300 hover:text-red-500 p-2 transition-colors"
                    title="Remove from Saved"
                  >
                    <FaTrash size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}