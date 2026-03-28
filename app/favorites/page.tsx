"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaHeartBroken, FaHeart, FaMusic } from 'react-icons/fa';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';

interface FavoriteBhajan {
  title: string;
  slug: string;
  addedAt: string;
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteBhajan[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Load favorites from Local Storage after the component mounts
  // We do this inside useEffect to prevent Next.js Server-Side Rendering (SSR) errors
  useEffect(() => {
    const savedFavorites = JSON.parse(localStorage.getItem('bhajan_favorites') || '[]');
    
    // Sort them so the most recently added appears at the top
    savedFavorites.sort((a: FavoriteBhajan, b: FavoriteBhajan) => {
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });
    
    setFavorites(savedFavorites);
    setIsLoaded(true);
  }, []);

  // 2. Remove from favorites logic
  const removeFavorite = (slug: string) => {
    const updatedFavorites = favorites.filter(fav => fav.slug !== slug);
    setFavorites(updatedFavorites);
    localStorage.setItem('bhajan_favorites', JSON.stringify(updatedFavorites));
  };

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <Breadcrumbs items={[{ label: 'My Favorites' }]} />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <main className="flex-1 w-full min-w-0">
            
            {/* Header */}
            <div className="mb-10 p-8 bg-white rounded-3xl border border-orange-100 shadow-sm flex items-center gap-4">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center shrink-0">
                <FaHeart size={30} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-1">
                  My <span className="text-red-500">Favorites</span>
                </h1>
                <p className="text-gray-500 font-medium">
                  {isLoaded ? `${favorites.length} saved bhajans` : "Loading..."}
                </p>
              </div>
            </div>

            {/* Skeleton Loading State */}
            {!isLoaded && (
              <div className="grid gap-4 md:grid-cols-2">
                {[1, 2, 3, 4].map(n => (
                  <div key={n} className="h-24 bg-white rounded-2xl border border-gray-100 animate-pulse"></div>
                ))}
              </div>
            )}

            {/* Empty State */}
            {isLoaded && favorites.length === 0 && (
              <div className="bg-white p-12 md:p-20 rounded-3xl border border-dashed border-red-200 text-center flex flex-col items-center">
                <div className="w-20 h-20 bg-red-50 text-red-300 rounded-full flex items-center justify-center mb-6">
                  <FaHeartBroken size={40} />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">No Favorites Yet</h2>
                <p className="text-gray-500 max-w-md mx-auto mb-8">
                  You haven't saved any bhajans yet. While reading a bhajan, tap the heart icon in the floating toolbar to save it here for quick access later!
                </p>
                <Link href="/" className="bg-orange-600 text-white font-bold px-8 py-3 rounded-full hover:bg-orange-700 transition-colors">
                  Explore Bhajans
                </Link>
              </div>
            )}

            {/* Favorites Grid */}
            {isLoaded && favorites.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                {favorites.map((fav) => (
                  <div 
                    key={fav.slug} 
                    className="group bg-white p-5 rounded-2xl border border-orange-100 hover:border-red-300 shadow-sm hover:shadow-md transition-all flex items-center justify-between gap-4"
                  >
                    <Link href={`/bhajan/${fav.slug}`} className="flex-1 min-w-0 flex items-center gap-4">
                      <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                        <FaMusic />
                      </div>
                      <div className="truncate">
                        <h3 className="font-bold text-gray-900 text-lg truncate group-hover:text-orange-600 transition-colors">
                          {fav.title}
                        </h3>
                        <p className="text-xs text-gray-500 font-medium mt-0.5">
                          Saved on {new Date(fav.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </Link>
                    
                    {/* Remove Button */}
                    <button 
                      onClick={(e) => {
                        e.preventDefault(); // Prevents the Link from clicking
                        removeFavorite(fav.slug);
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                      title="Remove from favorites"
                    >
                      <FaHeartBroken size={18} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </main>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}