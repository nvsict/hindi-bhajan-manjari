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

  // 🌟 अब यह सीधे चेकआउट पर नहीं, बल्कि डायनामिक प्रोडक्ट पेज पर जाएगा
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
  // 🌟 PREMIUM HOMEPAGE CAROUSEL 
  // ==========================================
  if (layout === 'homepage-carousel') {
    return (
      <div className="w-full my-10 relative group/carousel font-hind tracking-wide">
        
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
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

        <div className="relative">
          {/* Subtle fade edges for desktop */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-orange-50/80 dark:from-[#0c0804]/80 to-transparent z-10 pointer-events-none opacity-0 md:opacity-100"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-orange-50 dark:from-[#0c0804] to-transparent z-10 pointer-events-none opacity-0 md:opacity-100"></div>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 md:gap-5 pb-8 pt-2 px-2 snap-x snap-mandatory scrollbar-hide scroll-smooth" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {ebooks.map((ebook, index) => (
              <div 
                key={ebook.id}
                className="group relative flex-none w-[240px] md:w-[280px] snap-center bg-white dark:bg-[#120c08] rounded-3xl p-4 ring-1 ring-gray-900/5 dark:ring-white/5 shadow-sm hover:shadow-xl transition-all duration-500 ease-out hover:-translate-y-1.5 cursor-pointer flex flex-col"
                onClick={() => handleViewProduct(ebook.slug)}
              >
                {/* Badge */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-wider shadow-sm backdrop-blur-md bg-gradient-to-r from-red-500 to-orange-500 text-white border border-orange-400/50">
                    <HiSparkles size={12} className="text-yellow-200" /> {ebook.tag || 'Trending'}
                  </span>
                </div>

                {/* 🌟 CLEANED UP IMAGE WRAPPER */}
                <div className="relative w-full aspect-[4/5] md:aspect-[3/4] rounded-2xl bg-gray-50 dark:bg-white/5 overflow-hidden flex items-center justify-center mb-5 ring-1 ring-inset ring-gray-900/5 group-hover:ring-orange-500/20 transition-all duration-300">
                  {ebook.cover_image_url ? (
                    <Image 
                      src={ebook.cover_image_url} 
                      alt={ebook.title} 
                      fill 
                      sizes="(max-width: 768px) 240px, 280px"
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center text-gray-300">
                      <FaRegImages size={40} className="mb-2" />
                      <span className="text-xs font-bold">No Cover</span>
                    </div>
                  )}
                </div>
                
                {/* Details Section */}
                <div className="flex flex-col text-left px-1 flex-grow">
                  <h3 className="text-[17px] md:text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight line-clamp-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                    {ebook.title}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">{ebook.subtitle}</p>
                  
                  <div className="flex items-end justify-between mt-auto pt-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xl md:text-2xl font-black text-gray-900 dark:text-white">₹{ebook.price}</span>
                      <span className="text-xs md:text-sm text-gray-400 line-through">₹{ebook.original_price}</span>
                    </div>
                  </div>

                  <button className="w-full mt-4 py-3 rounded-xl bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300 font-bold text-sm transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white flex items-center justify-center gap-2 border border-orange-100 dark:border-orange-900/50 group-hover:border-orange-600">
                    <FaListUl size={14} /> भजन सूची देखें ({ebook.target_count})
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🌟 INLINE LAYOUT (For inserting into articles/bhajan pages)
  // ==========================================
  if (layout === 'inline' && ebooks.length > 0) {
    const ebook = ebooks[0]; 
    return (
      <div 
        onClick={() => handleViewProduct(ebook.slug)}
        className="group relative block w-full bg-gradient-to-br from-white to-orange-50/50 dark:from-[#120804] dark:to-[#0c0804] rounded-3xl p-4 md:p-6 ring-1 ring-gray-200 dark:ring-orange-900/50 shadow-sm hover:shadow-xl hover:ring-orange-300 dark:hover:ring-orange-700/50 cursor-pointer overflow-hidden transition-all duration-500 font-hind my-8"
      >
        <div className="relative z-10 flex flex-col sm:flex-row gap-5 md:gap-6 items-center sm:items-stretch h-full">
          
          {/* 🌟 CLEANED UP INLINE IMAGE */}
          <div className="relative w-[140px] sm:w-[160px] shrink-0 aspect-[4/5] sm:aspect-[3/4] rounded-2xl overflow-hidden shadow-md border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-white/5">
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
          
          <div className="flex flex-col justify-center flex-grow text-center sm:text-left">
            <span className="inline-flex items-center justify-center sm:justify-start gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-[10px] sm:text-xs font-black uppercase tracking-widest w-fit mb-3 mx-auto sm:mx-0">
              <HiSparkles size={14} className="text-orange-500" /> कस्टमाइज़ेबल PDF बंडल
            </span>

            <h3 className="text-xl md:text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-2 group-hover:text-orange-600 transition-colors">
              {ebook.title}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              <span className="font-bold text-gray-800 dark:text-gray-200">{ebook.target_count} भजनों का संग्रह</span> • {ebook.subtitle}
            </p>

            <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                <span className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white">₹{ebook.price}</span>
                <span className="text-sm font-bold text-gray-400 line-through">₹{ebook.original_price}</span>
              </div>
              
              <button className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold transition-all duration-300 group-hover:bg-orange-600 group-hover:text-white shadow-md hover:shadow-lg flex items-center justify-center gap-2 active:scale-95">
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