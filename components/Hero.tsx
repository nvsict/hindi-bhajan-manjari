"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { FaSearch, FaMusic, FaSpinner, FaTimes, FaChevronDown } from 'react-icons/fa';
import Link from 'next/link';

// 🌟 1. IMPORT THE LOCAL IMAGE DIRECTLY
// Make sure you created a folder called 'images' inside your 'public' folder 
// and saved the compressed WebP image there.
import heroBg from '@/public/images/pexels-photo-9277866.avif';

// Define the shape of your search results
interface SearchResult {
  slug: string;
  title_hindi: string;
  title_hinglish: string;
}

export default function Hero() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Debounced Instant Search Logic
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (query.trim().length >= 2) {
        setIsSearching(true);
        try {
          const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
          if (response.ok) {
            const data = await response.json();
            setSearchResults(data || []);
            setIsDropdownOpen(true);
          }
        } catch (error) {
          console.error("Instant search failed:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setSearchResults([]);
        setIsDropdownOpen(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setIsDropdownOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setSearchResults([]);
    setIsDropdownOpen(false);
  };

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 overflow-hidden bg-[#1a0500]">

      {/* 🌟 2. THE OPTIMIZED IMAGE COMPONENT */}
      <Image 
        src={heroBg} // Pass the imported static object, NOT a string URL
        alt="Hindi Bhajan Manjari Devotional Background"
        fill
        priority // Tells the browser "Load this before ANYTHING else"
        fetchPriority="high"
        placeholder="blur" // 🌟 Instant blurred placeholder generation!
        quality={75} // You can bump this up now that it's a tiny WebP file
        className="object-cover object-[center_30%] z-0"
        sizes="100vw"
      />

      {/* Glass & Left-to-Right Gradient for Readability */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[#2a0e00]/20 backdrop-blur-[2px]"></div>
      <div className="absolute inset-0 z-15 pointer-events-none bg-gradient-to-r from-[#1a0500]/95 via-[#1a0500]/60 to-transparent"></div>

      {/* Main Hero Content (Left Aligned) */}
      <div className="relative z-30 w-full max-w-3xl text-left text-white -mt-10">
        
        {/* Subtitle */}
        <div className="flex items-center justify-start gap-3 md:gap-4 mb-5 opacity-90 animate-fade-in-up">
          <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-orange-300/60"></div>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-orange-100">
            Welcome to the World of Devotion
          </p>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight drop-shadow-2xl leading-[1.1] animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          Find Your Favorite <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300 drop-shadow-sm">
            Bhajan & Aarti
          </span>
        </h1>
        
        {/* Supporting Text */}
        <p className="text-base md:text-xl mb-12 font-medium text-orange-50/90 drop-shadow-md max-w-xl animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
          Explore a sacred collection of authentic lyrics, meanings, and spiritual verses.
        </p>

        {/* Search Container */}
        <div className="max-w-2xl relative z-50 animate-fade-in-up" style={{ animationDelay: '0.3s' }} ref={searchContainerRef}>
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white/95 rounded-full p-1.5 md:p-2 flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.4)] ring-4 ring-orange-500/20 focus-within:ring-orange-500/60 transition-all duration-300"
          >
            <div className="hidden md:flex items-center pl-6 text-orange-500">
              {isSearching ? <FaSpinner className="animate-spin" size={20} /> : <FaSearch size={20} />}
            </div>

            <input 
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search e.g. Hanuman Chalisa..." 
              className="flex-1 w-full bg-transparent px-5 md:px-4 py-3 md:py-4 text-gray-900 font-bold text-base md:text-lg placeholder:text-gray-400 focus:outline-none"
              aria-label="Search bhajans"
            />

            {/* Clear Button */}
            {query.length > 0 && (
              <button 
                type="button"
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-1 md:mr-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-full"
                aria-label="Clear search"
              >
                <FaTimes size={16} />
              </button>
            )}

            <button 
              type="submit"
              className="shrink-0 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-base md:text-lg px-7 md:px-10 py-3 md:py-4 rounded-full hover:from-orange-600 hover:to-red-700 shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-white focus-visible:ring-orange-500"
              aria-label="Submit search"
            >
              <FaSearch className="md:hidden" size={16} aria-hidden="true" />
              <span className="hidden md:block">Search</span>
            </button>
          </form>

          {/* INSTANT SEARCH DROPDOWN */}
          {isDropdownOpen && (
            <div 
              className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-100 overflow-hidden text-left animate-in fade-in slide-in-from-top-4 duration-200 flex flex-col"
            >
              {searchResults.length > 0 ? (
                <>
                  <div className="py-2 max-h-[50vh] overflow-y-auto overscroll-contain custom-scrollbar">
                    {searchResults.map((item) => (
                      <Link 
                        key={item.slug} 
                        href={`/bhajan/${item.slug}`}
                        onClick={() => setIsDropdownOpen(false)}
                        className="group flex items-center gap-4 px-6 py-3.5 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-full bg-orange-100/50 text-orange-500 flex items-center justify-center shrink-0 group-hover:bg-orange-200 transition-colors">
                          <FaMusic size={14} />
                        </div>
                        <div>
                          <h4 className="font-bold font-hindi text-gray-900 group-hover:text-orange-700 transition-colors text-base line-clamp-1">
                            {item.title_hindi}
                          </h4>
                          <p className="text-xs font-medium text-gray-500 mt-0.5 line-clamp-1">
                            {item.title_hinglish}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-3.5 bg-gray-50 hover:bg-orange-100 text-orange-700 font-bold text-sm transition-colors border-t border-gray-100 shrink-0"
                  >
                    View all results for "{query}" &rarr;
                  </button>
                </>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 font-medium">No lyrics found matching <span className="font-bold text-gray-800">"{query}"</span></p>
                  <p className="text-xs text-gray-400 mt-1">Try searching in Hindi or check your spelling.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Scroll Down Indicator for Full-Screen UX */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center opacity-70 hover:opacity-100 transition-opacity">
        <span className="text-[10px] uppercase tracking-widest text-orange-200 font-bold mb-2">Explore</span>
        <FaChevronDown className="text-orange-300 animate-bounce" size={16} />
      </div>

    </section>
  );
}