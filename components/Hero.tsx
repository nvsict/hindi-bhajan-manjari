"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { FaSearch, FaMusic, FaSpinner, FaTimes } from 'react-icons/fa';
import Link from 'next/link';

// Define the shape of your search results
interface SearchResult {
  slug: string;
  title_hindi: string;
  title_hinglish: string;
}

export default function Hero() {
  const [query, setQuery] = useState("");
  const [trendingTags, setTrendingTags] = useState([
    "Hanuman Chalisa", 
    "Ram Siya Ram", 
    "Shiv Aarti", 
    "Om Jai Jagdish", 
    "Gayatri Mantra"
  ]);
  
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Fetch Trending Tags on Load
  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const response = await fetch('/api/search');
        if (!response.ok) throw new Error("Failed to fetch trending tags");
        const data = await response.json();
        if (data && data.length > 0) {
          setTrendingTags(data.map((item: { title_hinglish: string }) => item.title_hinglish));
        }
      } catch (error) {
        console.error("Failed to load trending tags:", error);
      }
    };
    fetchTrendingTags();
  }, []);

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

  const bgImage = "https://images.pexels.com/photos/9277866/pexels-photo-9277866.jpeg";

  return (
    <section className="relative w-full min-h-[500px] md:min-h-[650px] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden py-16 md:py-24">

      {/* 1. Base Image */}
      <Image 
        src={bgImage}
        alt="Hindi Bhajan Manjari Devotional Background"
        fill
        priority
        fetchPriority="high"
        quality={50}
        className="object-cover object-[center_30%] z-0"
        sizes="100vw"
      />

      {/* 🌟 2. FULL-SCREEN FROSTED GLASS & VIGNETTE 🌟 */}
      {/* The backdrop-blur applies to the whole image now, with a warm devotional tint */}
      <div className="absolute inset-0 z-10 pointer-events-none bg-[#2a0e00]/30 backdrop-blur-md"></div>
      
      {/* Heavy radial vignette to draw the eye to the search bar in the center */}
      <div className="absolute inset-0 z-15 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_10%,rgba(0,0,0,0.85)_100%)]"></div>

      {/* 3. Main Hero Content - Floating freely over the glass */}
      <div className="relative z-30 w-full max-w-4xl mx-auto text-center text-white">
        
        {/* Subtitle */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-5 opacity-90">
          <div className="h-[1px] w-12 md:w-20 bg-gradient-to-r from-transparent to-orange-300/60"></div>
          <p className="text-xs md:text-sm font-bold uppercase tracking-[0.3em] text-orange-100">
            Welcome to the World of Devotion
          </p>
          <div className="h-[1px] w-12 md:w-20 bg-gradient-to-l from-transparent to-orange-300/60"></div>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight drop-shadow-xl leading-[1.1]">
          Find Your Favorite <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-200 to-orange-300 drop-shadow-sm">
            Bhajan & Aarti
          </span>
        </h1>
        
        {/* Database stat */}
        <p className="text-base md:text-xl mb-12 font-medium text-orange-50/90 drop-shadow-md">
          Explore a sacred collection of <span className="font-bold text-yellow-400"></span> Lyrics
        </p>

        {/* Search Container with Dropdown Logic */}
        <div className="max-w-2xl mx-auto relative z-50" ref={searchContainerRef}>
          <form 
            onSubmit={handleSearchSubmit}
            className="bg-white/95 rounded-full p-1.5 md:p-2 flex items-center shadow-[0_10px_40px_rgba(0,0,0,0.4)] ring-4 ring-orange-500/20 focus-within:ring-orange-500/50 transition-all duration-300"
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
            />

            {/* Clear Button */}
            {query.length > 0 && (
              <button 
                type="button"
                onClick={clearSearch}
                className="p-2 text-gray-400 hover:text-gray-600 transition-colors mr-1 md:mr-2"
              >
                <FaTimes size={16} />
              </button>
            )}

            <button 
              type="submit"
              className="shrink-0 bg-gradient-to-r from-orange-500 to-red-600 text-white font-black text-base md:text-lg px-7 md:px-10 py-3 md:py-4 rounded-full hover:from-orange-600 hover:to-red-700 shadow-lg active:scale-95 transition-all duration-200 flex items-center gap-2"
              aria-label="Submit search"
            >
              <FaSearch className="md:hidden" size={16} aria-hidden="true" />
              <span className="hidden md:block">Search</span>
            </button>
          </form>

          {/* INSTANT SEARCH DROPDOWN */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-orange-100 overflow-hidden text-left animate-in fade-in slide-in-from-top-4 duration-200">
              
              {searchResults.length > 0 ? (
                <div className="py-2">
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
                        <h4 className="font-bold text-gray-900 group-hover:text-orange-700 transition-colors text-base">
                          {item.title_hindi}
                        </h4>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">
                          {item.title_hinglish}
                        </p>
                      </div>
                    </Link>
                  ))}
                  <button 
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-3.5 bg-gray-50 hover:bg-orange-100 text-orange-700 font-bold text-sm transition-colors"
                  >
                    View all results for "{query}" &rarr;
                  </button>
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <p className="text-gray-500 font-medium">No lyrics found matching <span className="font-bold text-gray-800">"{query}"</span></p>
                  <p className="text-xs text-gray-400 mt-1">Try searching in Hindi or check your spelling.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Trending Tags - Adjusted colors to pop against the global glassmorphism */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-2.5 md:gap-3">
          <span className="text-orange-200 text-xs font-black uppercase tracking-widest mr-2 hidden sm:inline">
            Trending:
          </span>
          {trendingTags.map((tag) => (
            <Link 
              key={tag} 
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-orange-50 px-4 md:px-5 py-2 rounded-full transition-all duration-300 shadow-sm text-xs md:text-sm font-medium active:scale-95"
            >
              {tag}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}