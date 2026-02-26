"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image'; 
import { FaSearch } from 'react-icons/fa';
import Link from 'next/link';
// 🌟 1. REMOVED the Supabase import! This component is now 100% ISP-block-proof.

export default function Hero() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  
  // Start with default tags so the screen doesn't look empty while fetching
  const [trendingTags, setTrendingTags] = useState([
    "Hanuman Chalisa", 
    "Ram Siya Ram", 
    "Shiv Aarti", 
    "Om Jai Jagdish", 
    "Gayatri Mantra"
  ]);

  // 🌟 2. Updated to fetch from your own Next.js API Proxy
  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        // Calling our proxy without a "?q=" returns the top 5 latest/trending bhajans
        const response = await fetch('/api/search');
        
        if (!response.ok) throw new Error("Failed to fetch trending tags");
        
        const data = await response.json();

        if (data && data.length > 0) {
          setTrendingTags(data.map((item: { title_hinglish: string }) => item.title_hinglish));
        }
      } catch (error) {
        console.error("Failed to load trending tags:", error);
        // If it fails, it just silently keeps the 5 default tags we set above!
      }
    };
    
    fetchTrendingTags();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const bgImage = "https://images.pexels.com/photos/9277866/pexels-photo-9277866.jpeg";

  return (
    <section className="relative w-full min-h-[480px] md:min-h-[580px] flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 overflow-hidden">
      
      <Image 
        src={bgImage}
        alt="Hindi Bhajan Manjari Devotional Background"
        fill
        priority={true}
        fetchPriority="high"
        quality={40} 
        className="object-cover object-[center_30%] z-0" 
        sizes="100vw"
      />
      
      {/* Deep Devotional Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-orange-950/90 via-orange-900/75 to-orange-800/40 z-10 pointer-events-none"></div>
      
      {/* Main Hero Content */}
      <div className="relative z-20 max-w-4xl mx-auto text-center text-white pt-6 pb-10">
        
        {/* Subtitle */}
        <div className="flex items-center justify-center gap-3 md:gap-4 mb-5 opacity-90">
          <div className="h-[1px] w-8 md:w-16 bg-orange-200/50"></div>
          <p className="text-xs md:text-base font-bold uppercase tracking-[0.2em] text-orange-100">
            Welcome to the World of Devotion
          </p>
          <div className="h-[1px] w-8 md:w-16 bg-orange-200/50"></div>
        </div>

        {/* Cinematic Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold mb-6 tracking-tight drop-shadow-2xl leading-[1.1]">
          Find Your Favorite <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-200 via-yellow-200 to-orange-100">
            Bhajan & Aarti
          </span>
        </h1>
        
        {/* Database stat */}
        <p className="text-lg md:text-2xl mb-10 font-medium text-orange-50 drop-shadow-lg">
          Explore a sacred collection of <span className="font-bold text-yellow-400">10,000+</span> Lyrics
        </p>

        {/* Functional Search Bar */}
        <form 
          onSubmit={handleSearch}
          className="max-w-3xl mx-auto bg-white rounded-full p-1.5 md:p-2 flex items-center shadow-[0_20px_50px_rgba(0,0,0,0.3)] focus-within:ring-4 focus-within:ring-orange-500/30 transition-all"
        >
          <div className="hidden md:flex items-center pl-5 text-gray-400">
            <FaSearch size={20} />
          </div>

          <input 
            type="text" 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search e.g. Hanuman Chalisa, Shiv Aarti..." 
            className="flex-1 w-full bg-transparent px-5 py-3 text-gray-800 text-base md:text-lg placeholder:text-gray-400 focus:outline-none"
          />

          <button 
            type="submit"
            className="shrink-0 bg-gradient-to-r from-red-600 to-orange-600 text-white font-bold text-base md:text-lg px-7 md:px-12 py-3 md:py-4 rounded-full hover:from-red-700 hover:to-orange-700 hover:shadow-xl active:scale-95 transition-all flex items-center gap-2"
            aria-label="Submit search"
          >
            <FaSearch className="md:hidden" size={18} aria-hidden="true" />
            <span className="hidden md:block">Search Now</span>
          </button>
        </form>

        {/* Trending Tags */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 min-h-[60px]">
          <span className="text-orange-200 text-sm font-bold uppercase tracking-widest mr-1 hidden sm:inline">
            Trending:
          </span>
          {trendingTags.map((tag) => (
            <Link 
              key={tag} 
              href={`/search?q=${encodeURIComponent(tag)}`}
              className="bg-white/10 hover:bg-white/25 border border-white/20 text-white px-4 py-1.5 rounded-full backdrop-blur-md transition-all shadow-sm text-xs md:text-sm font-medium"
            >
              {tag}
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}