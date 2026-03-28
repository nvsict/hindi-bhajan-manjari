"use client";

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaUserCircle, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import ScrollReveal from '../ScrollReveal';

export default function ArtistCarousel({ artists }: { artists: any[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Smooth scroll logic
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' 
        ? -(scrollRef.current.clientWidth * 0.75) 
        : (scrollRef.current.clientWidth * 0.75);
      
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full">
      
      {/* 🌟 Reveal Header First */}
      <ScrollReveal yOffset={20}>
        <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 md:pb-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-2 md:gap-3">
            Popular <span className="text-orange-600">Artists</span>
          </h2>
          
          {/* Right Side: Scroll Buttons + View All Button */}
          <div className="flex items-center gap-3 md:gap-5">
            
            {/* DESKTOP SCROLL ARROWS */}
            <div className="hidden md:flex items-center gap-2">
              <button 
                onClick={() => scroll('left')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200 border border-orange-100 shadow-sm hover:shadow-md active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                aria-label="Scroll left"
              >
                <FaChevronLeft size={14} className="-ml-0.5" />
              </button>
              <button 
                onClick={() => scroll('right')}
                className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-200 border border-orange-100 shadow-sm hover:shadow-md active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                aria-label="Scroll right"
              >
                <FaChevronRight size={14} className="-mr-0.5" />
              </button>
            </div>

            {/* Mobile-Optimized Uiverse 3D Button */}
            <Link 
              href="/artist" 
              className="relative inline-flex items-center justify-center gap-1.5 md:gap-2 bg-orange-500 text-white px-4 py-2 md:px-6 md:py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all duration-150 rounded-lg opacity-95 hover:opacity-100 shadow-[0_4px_0px_#c2410c] md:shadow-[0_5px_0px_#c2410c] active:top-[4px] md:active:top-[5px] active:shadow-[0_0px_0px_#c2410c] shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white"
              aria-label="View all artists"
            >
              View All
              <svg className="w-2.5 h-3 md:w-3 md:h-4" viewBox="0 0 10 18" fill="none">
                <path d="M0.879395 13.0463L6.41356 7.5L0.879395 1.95375L2.58314 0.25L9.83315 7.5L2.58314 14.75L0.879395 13.0463Z" fill="currentColor"></path>
              </svg>
            </Link>
            
          </div>
        </div>
      </ScrollReveal>

      {/* 🌟 PREMIUM HORIZONTAL SCROLL WITH FADE-OUT MASK */}
      <div className="relative w-full">
        {/* data-lenis-prevent ensures horizontal scrolling doesn't lock vertical page scrolling */}
        <div 
          ref={scrollRef}
          data-lenis-prevent="true"
          className="flex overflow-x-auto gap-4 md:gap-8 pb-8 pt-4 snap-x hide-scrollbar relative z-10" 
          style={{ 
            scrollbarWidth: 'none', 
            msOverflowStyle: 'none',
            WebkitMaskImage: 'linear-gradient(to right, black 0%, black 85%, transparent 100%)',
            maskImage: 'linear-gradient(to right, black 0%, black 85%, transparent 100%)'
          }}
        >
          {artists.map((artist, index) => (
            /* 🌟 THE CASCADE: 
               We use Math.min so the delay maxes out at 0.5s. 
               This ensures if you have 20 artists, the last ones don't take 2 seconds to appear! */
            <ScrollReveal 
              key={artist.id} 
              delay={Math.min(index * 0.08, 0.5)} 
              yOffset={30}
              className="snap-start shrink-0 group w-32 md:w-40 text-center outline-none"
            >
              <Link 
                href={`/artist/${artist.slug}`} 
                className="block outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-2xl p-1"
              >
                
                {/* The Floating Avatar Container */}
                <div className="relative w-28 h-28 md:w-36 md:h-36 mx-auto rounded-full overflow-hidden shadow-[0_4px_15px_rgb(0,0,0,0.08)] border-[3px] md:border-4 border-white group-hover:border-orange-200 group-hover:shadow-[0_10px_30px_rgb(234,88,12,0.2)] transition-all duration-500 group-hover:-translate-y-2 mb-4 md:mb-5 bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                  {artist.profile_image_url ? (
                    <Image 
                      src={artist.profile_image_url} 
                      alt={artist.name_hinglish} 
                      fill 
                      quality={60}
                      className="object-cover transition-transform duration-700 group-hover:scale-110" 
                      sizes="(max-width: 768px) 112px, 144px" 
                    />
                  ) : (
                    <FaUserCircle className="text-orange-600/50 w-full h-full p-2 md:p-4 relative z-10 transition-transform duration-700 group-hover:scale-110" />
                  )}
                </div>
                
                {/* Standardized Typography */}
                <h3 className="text-lg md:text-xl font-black font-hindi text-gray-900 truncate group-hover:text-orange-600 transition-colors tracking-tight leading-tight">
                  {artist.name_hindi || artist.name_hinglish}
                </h3>
                <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-500 group-hover:text-orange-500/80 mt-0.5 truncate transition-colors">
                  {artist.name_hinglish}
                </p>
                
                {/* Sleek Pill Badge */}
                {artist.total_bhajans > 0 && (
                  <div className="mt-2.5 md:mt-3 flex justify-center">
                    <span className="bg-orange-50 border border-orange-100/80 text-[9px] md:text-[10px] font-black text-orange-600 uppercase tracking-widest px-3 py-1 rounded-full group-hover:bg-orange-100 group-hover:border-orange-200 transition-colors">
                      {artist.total_bhajans} {artist.total_bhajans === 1 ? 'Bhajan' : 'Bhajans'}
                    </span>
                  </div>
                )}
                
              </Link>
            </ScrollReveal>
          ))}
          
          {/* 🌟 INVISIBLE SPACER */}
          <div className="shrink-0 w-12 md:w-24 pointer-events-none" aria-hidden="true"></div>
          
        </div>
      </div>
      
    </div>
  );
}