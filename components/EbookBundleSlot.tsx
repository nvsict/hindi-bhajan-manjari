'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { FaBookOpen, FaChevronLeft, FaChevronRight, FaListUl, FaRegImages } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

// 🌟 यह आपके Supabase डेटाबेस से आने वाले डायनामिक बंडल का स्ट्रक्चर है
export interface EbookTemplate {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  original_price: number;
  cover_image_url: string;
  tag: string;
  target_count: number;
}

interface EbookSlotProps {
  layout?: 'inline' | 'homepage-carousel';
  ebooks: EbookTemplate[];
}

export default function EbookBundleSlot({ layout = 'homepage-carousel', ebooks = [] }: EbookSlotProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // 🌟 प्रोडक्ट पेज पर ले जाने वाला फंक्शन
  const handleViewProduct = (slug: string) => {
    router.push(`/ebook/${slug}`);
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 320 : 260;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (!ebooks || ebooks.length === 0) return null;

  // ==========================================
  // 🌟 PREMIUM HOMEPAGE CAROUSEL LAYOUT
  // ==========================================
  if (layout === 'homepage-carousel') {
    return (
      <div 
        className="w-full my-10 relative group/carousel tracking-wide"
        style={{ fontFamily: 'var(--font-hind), sans-serif' }}
      >
        {/* HEADER SECTION */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2 font-hind">
            <FaBookOpen className="text-orange-500" />
            रेडीमेड <span className="text-orange-600">ई-बुक्स (PDF)</span>
          </h2>
          
          <div className="hidden md:flex items-center gap-3">
            <button onClick={() => scroll('left')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-orange-600 transition-all shadow-sm active:scale-95">
              <FaChevronLeft size={14} className="-ml-0.5" />
            </button>
            <button onClick={() => scroll('right')} className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-orange-600 transition-all shadow-sm active:scale-95">
              <FaChevronRight size={14} className="-mr-0.5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE CAROUSEL CONTAINER */}
        <div className="relative">
          {/* Subtle fade edges for desktop (Only on sides, no weird shadows) */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-[#fffaf5]/90 dark:from-[#0c0804]/90 to-transparent z-10 pointer-events-none opacity-0 md:opacity-100"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fffaf5]/90 dark:from-[#0c0804]/90 to-transparent z-10 pointer-events-none opacity-0 md:opacity-100"></div>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-8 pt-2 px-2 snap-x snap-mandatory scrollbar-hide scroll-smooth" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {ebooks.map((ebook) => (
              <div 
                key={ebook.id}
                className="group relative flex-none w-[260px] md:w-[280px] snap-center bg-white dark:bg-[#120c08] rounded-3xl p-4 border border-gray-100 dark:border-[#2a1d12] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgb(234,88,12,0.1)] transition-all duration-300 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col font-hind h-full"
                onClick={() => handleViewProduct(ebook.slug)}
              >
                
                {/* 🌟 PERFECT CLEAN IMAGE WRAPPER */}
                <div className="relative w-full aspect-[4/5] rounded-2xl bg-gray-50 dark:bg-white/5 overflow-hidden mb-4 border border-gray-50 dark:border-gray-800">
                  
                  {/* Badge inside the image so it doesn't break card layout */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md backdrop-blur-md bg-gradient-to-r from-red-500 to-orange-500 text-white border border-white/20">
                      <HiSparkles size={12} className="text-yellow-200" /> {ebook.tag || 'Trending'}
                    </span>
                  </div>

                  {ebook.cover_image_url ? (
                    <Image 
                      src={ebook.cover_image_url} 
                      alt={ebook.title} 
                      fill 
                      sizes="(max-width: 768px) 260px, 280px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                      <FaRegImages size={40} className="mb-2" />
                      <span className="text-xs font-bold">Cover Missing</span>
                    </div>
                  )}
                </div>
                
                {/* 🌟 DETAILS SECTION (Flex-grow keeps bottom elements aligned) */}
                <div className="flex flex-col text-left px-1 flex-grow">
                  
                  <h3 className="text-[18px] md:text-xl font-black text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {ebook.title}
                  </h3>
                  
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                    {ebook.subtitle}
                  </p>
                  
                  {/* mt-auto pushes price and button to the exact bottom */}
                  <div className="mt-auto pt-5">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-end gap-2">
                        <span className="text-2xl font-black text-gray-900 dark:text-white leading-none">₹{ebook.price}</span>
                        <span className="text-sm font-bold text-gray-400 line-through leading-tight">₹{ebook.original_price}</span>
                      </div>
                      <div className="text-xs font-bold text-orange-600 bg-orange-50 dark:bg-orange-900/30 px-2.5 py-1 rounded-md">
                        {ebook.target_count} भजन
                      </div>
                    </div>

                    <button className="w-full py-3.5 rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 font-bold text-[15px] transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center gap-2 border border-orange-100 dark:border-orange-900/50 group-hover:border-orange-600 shadow-sm active:scale-95">
                      <FaListUl size={14} /> भजन सूची देखें
                    </button>
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🌟 INLINE LAYOUT (For articles & bhajan pages)
  // ==========================================
  if (layout === 'inline' && ebooks.length > 0) {
    const ebook = ebooks[0]; 
    return (
      <div 
        onClick={() => handleViewProduct(ebook.slug)}
        className="group relative block w-full bg-white dark:bg-[#120804] rounded-[2rem] p-4 md:p-6 border border-orange-100 dark:border-[#2a1d12] shadow-sm hover:shadow-[0_8px_30px_rgb(234,88,12,0.12)] cursor-pointer overflow-hidden transition-all duration-300 font-hind my-8"
        style={{ fontFamily: 'var(--font-hind), sans-serif' }}
      >
        {/* Very subtle background glow on hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 to-orange-50/50 dark:from-[#120804] dark:to-orange-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-5 md:gap-6 items-center sm:items-stretch h-full">
          
          {/* INLINE IMAGE */}
          <div className="relative w-[140px] sm:w-[160px] shrink-0 aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
            {ebook.cover_image_url ? (
              <Image 
                src={ebook.cover_image_url} 
                alt={ebook.title} 
                fill 
                sizes="(max-width: 640px) 140px, 160px"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                <FaRegImages size={30} className="mb-2" />
              </div>
            )}
          </div>
          
          {/* INLINE DETAILS */}
          <div className="flex flex-col justify-center flex-grow text-center sm:text-left">
            <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-black uppercase tracking-widest w-fit mb-3 mx-auto sm:mx-0 border border-orange-200 dark:border-orange-900/50">
              <HiSparkles size={14} className="text-orange-500" /> कस्टमाइज़ेबल PDF बंडल
            </span>

            <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-orange-600 transition-colors">
              {ebook.title}
            </h3>
            
            <p className="text-sm md:text-base font-medium text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              <span className="font-bold text-gray-800 dark:text-gray-200">{ebook.target_count} भजनों का संग्रह</span> • {ebook.subtitle}
            </p>

            <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-black text-gray-900 dark:text-white">₹{ebook.price}</span>
                <span className="text-base font-bold text-gray-400 line-through">₹{ebook.original_price}</span>
              </div>
              
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-[15px] transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white shadow-md flex items-center justify-center gap-2 active:scale-95">
                <FaListUl /> किताब के अंदर देखें
              </button>
            </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}