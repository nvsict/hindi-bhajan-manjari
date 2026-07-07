"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { FaSearch, FaMusic, FaSpinner, FaTimes, FaChevronDown, FaBookOpen } from 'react-icons/fa';
import Link from 'next/link';

const BACKGROUND_IMAGES = [
  '/images/pexels-photo-9277866.avif',
  '/images/pexels-photo-9277866t.avif',
];

interface SearchResult {
  slug: string;
  title_hindi?: string;
  title_hinglish?: string;
  title?: string; 
  type: 'bhajan' | 'article'; 
}

export default function Hero() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [currentBgIndex, setCurrentBgIndex] = useState(0);
  
  // 🌟 MOBILE OPTIMIZATION STATE
  const [isMobile, setIsMobile] = useState(false);
  
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // 🌟 PERFORMANCE: Check if mobile on mount
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile(); // Check immediately on client load
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (BACKGROUND_IMAGES.length <= 1) return;
    const intervalId = setInterval(() => {
      setCurrentBgIndex((prevIndex) => (prevIndex + 1) % BACKGROUND_IMAGES.length);
    }, 5000); 
    return () => clearInterval(intervalId);
  }, []);

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
    document.getElementById('hero-search-input')?.focus();
  };

  return (
    <section className="relative w-full min-h-[100svh] flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-[#1a0500]">
      
      {/* 🌟 OPTIMIZED SLIDESHOW CONTAINER */}
      <div className="absolute inset-0 overflow-hidden z-0 pointer-events-none bg-[#1a0500]">
        {BACKGROUND_IMAGES.map((src, index) => (
          <div
            key={src}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
              index === currentBgIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            <Image 
  src={src} 
  alt={`Hindi Bhajan Manjari Background ${index + 1}`}
  fill
  priority={index === 0}             
  fetchPriority={index === 0 ? "high" : "auto"}  
  loading="eager"        // 🌟 यह नई लाइन जोड़ें
  quality={50} 
  className="object-cover object-[center_30%]"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1920px" 
/>
          </div>
        ))}
        
        {/* 🌟 FIX: Disabled backdrop-blur on mobile to save GPU */}
        <div className={`absolute inset-0 bg-[#1a0500]/40 ${!isMobile ? 'backdrop-blur-[1px]' : ''} z-20 transition-all duration-300`}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#1a0500] via-[#1a0500]/70 to-transparent z-20"></div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-30 w-full max-w-3xl text-left text-white -mt-10">
        <div className="flex items-center justify-start gap-3 md:gap-4 mb-5 opacity-0 animate-[fade-in_0.8s_ease-out_forwards]">
          <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-orange-300/60"></div>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-orange-100">
            Welcome to the World of Devotion
          </p>
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight drop-shadow-2xl leading-[1.1] opacity-0 animate-[fade-in-up_0.8s_ease-out_0.2s_forwards]">
          Find Your Favorite <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300 drop-shadow-sm">
            Bhajan & Gyan
          </span>
        </h1>
        
        <p className="text-base md:text-xl mb-12 font-medium text-orange-50/90 drop-shadow-md max-w-xl opacity-0 animate-[fade-in-up_0.8s_ease-out_0.4s_forwards]">
          Explore a sacred collection of authentic lyrics, meanings, and spiritual verses.
        </p>

        <div className="max-w-2xl relative z-50 opacity-0 animate-[fade-in-up_0.8s_ease-out_0.6s_forwards]" ref={searchContainerRef}>
          <form 
            role="search" 
            onSubmit={handleSearchSubmit}
            className="bg-white/95 rounded-full p-1.5 md:p-2 flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.4)] ring-4 ring-orange-500/20 focus-within:ring-orange-500/60 transition-all duration-300"
          >
            <div className="hidden md:flex items-center pl-6 text-orange-500" aria-hidden="true">
              {isSearching ? <FaSpinner className="animate-spin" size={20} /> : <FaSearch size={20} />}
            </div>

            <input 
              id="hero-search-input"
              type="text" 
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Bhajans, Chalisa or Sanatan Gyan..." 
              className="flex-1 w-full bg-transparent px-5 md:px-4 py-3 md:py-4 text-gray-900 font-bold text-base md:text-lg placeholder:text-gray-500 focus:outline-none"
              role="combobox"
              aria-label="Search for bhajans, aartis, or chalisa"
              aria-expanded={isDropdownOpen}
              aria-controls="search-dropdown-results"
              autoComplete="off"
            />

            {query.length > 0 && (
              <button 
                type="button"
                onClick={clearSearch}
                className="p-2 text-gray-500 hover:text-gray-600 transition-colors mr-1 md:mr-2 outline-none rounded-full focus-visible:ring-2 focus-visible:ring-orange-400"
                aria-label="Clear search text"
              >
                <FaTimes size={16} aria-hidden="true" />
              </button>
            )}

            <button 
              type="submit"
              className="shrink-0 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-base md:text-lg px-7 md:px-10 py-3 md:py-4 rounded-full hover:from-orange-600 hover:to-red-700 shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-2 outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-orange-500"
              aria-label="Submit search"
            >
              <FaSearch className="md:hidden" size={16} aria-hidden="true" />
              <span className="hidden md:block">Search</span>
            </button>
          </form>

          {/* INSTANT SEARCH DROPDOWN */}
          {isDropdownOpen && (
            <div 
              id="search-dropdown-results"
              className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-100 overflow-hidden text-left z-[100] flex flex-col"
            >
              {searchResults.length > 0 ? (
                <>
                  <div className="py-2 max-h-[50vh] overflow-y-auto overscroll-contain">
                    {searchResults.map((item) => {
                      const isArticle = item.type === 'article';
                      const linkHref = isArticle ? `/gyan/${item.slug}` : `/bhajan/${item.slug}`;
                      const displayTitle = isArticle ? (item.title || item.title_hindi) : item.title_hindi;
                      const displaySub = isArticle ? "Sanatan Gyan" : item.title_hinglish;
                      
                      return (
                        <Link 
                          key={`${item.type}-${item.slug}`} 
                          href={linkHref}
                          onClick={() => setIsDropdownOpen(false)}
                          className="group flex items-center gap-4 px-6 py-3.5 hover:bg-orange-50 transition-colors border-b border-gray-100 last:border-0 focus-visible:bg-orange-50 outline-none"
                        >
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${isArticle ? 'bg-blue-100/50 text-blue-500 group-hover:bg-blue-200' : 'bg-orange-100/50 text-orange-500 group-hover:bg-orange-200'}`} aria-hidden="true">
                            {isArticle ? <FaBookOpen size={14} /> : <FaMusic size={14} />}
                          </div>
                          <div>
                            <h4 className="font-bold font-hindi text-gray-900 group-hover:text-orange-700 transition-colors text-base line-clamp-1">
                              {displayTitle}
                            </h4>
                            <p className={`text-[11px] font-bold uppercase tracking-widest mt-1 line-clamp-1 ${isArticle ? 'text-blue-500' : 'text-gray-500'}`}>
                              {displaySub}
                            </p>
                          </div>
                        </Link>
                      )
                    })}
                  </div>
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-3.5 bg-gray-50 hover:bg-orange-100 text-orange-700 font-bold text-sm transition-colors border-t border-gray-100 outline-none focus-visible:bg-orange-100"
                  >
                    View all results for "{query}" &rarr;
                  </button>
                </>
              ) : (
                <div className="px-6 py-8 text-center" role="alert">
                  <p className="text-gray-500 font-medium">No results found matching <span className="font-bold text-gray-800">"{query}"</span></p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center opacity-70" aria-hidden="true">
        <span className="text-[10px] uppercase tracking-widest text-orange-600 font-bold mb-2">Explore</span>
        <FaChevronDown className="text-orange-600 animate-bounce" size={16} />
      </div>
    </section>
  );
}