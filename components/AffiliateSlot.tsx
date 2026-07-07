'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { FaExternalLinkAlt, FaShoppingCart, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

interface AffiliateSlotProps {
  deityId?: string | null;
  layout?: 'inline' | 'card' | 'sidebar' | 'homepage-carousel';
}

export default function AffiliateSlot({ deityId, layout = 'inline' }: AffiliateSlotProps) {
  const [product, setProduct] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // 🌟 Scroll Container Reference for Desktop Controls
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAffiliateData = async () => {
      setLoading(true);
      try {
        let query = supabase.from('affiliate_products').select('*').eq('is_active', true);
        
        if (layout === 'homepage-carousel') {
          query = query.order('clicks', { ascending: false }).limit(8); // Fetching 8 to allow good scrolling
          const { data, error } = await query;
          if (data && !error) setProducts(data);
        } else {
          if (deityId) query = query.eq('deity_id', deityId);
          
          const { data, error } = await query;

          if (data && data.length > 0) {
            setProduct(data[Math.floor(Math.random() * data.length)]);
          } else if (deityId) {
            const { data: generalData } = await supabase.from('affiliate_products').select('*').eq('is_active', true).is('deity_id', null);
            if (generalData && generalData.length > 0) {
              setProduct(generalData[Math.floor(Math.random() * generalData.length)]);
            }
          }
        }
      } catch (err) {
        console.error("Affiliate Slot Error:", err);
      }
      setLoading(false);
    };

    fetchAffiliateData();
  }, [deityId, layout]);

  const handleAdClick = async (clickedProduct: any) => {
    if (!clickedProduct) return;
    
    supabase.rpc('increment_click', { product_id: clickedProduct.id }).then(); 

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        product_name: clickedProduct.title,
        placement: layout,
      });
    }
  };

  // 🌟 Scroll Controller Function
  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = window.innerWidth > 768 ? 320 : 260; // Card width + gap
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  // ==========================================
  // 🌟 ANTI-CLS SKELETON LOADERS
  // ==========================================
  if (loading) {
    if (layout === 'homepage-carousel') {
      return (
        <div className="w-full my-8 min-h-[420px]">
          <div className="flex items-center justify-between mb-6 px-2">
            <div className="h-8 w-48 bg-gray-200 dark:bg-[#1a120b] rounded-full animate-pulse"></div>
            {/* Skeleton for Desktop Controls */}
            <div className="hidden md:flex gap-2">
              <div className="h-10 w-10 bg-gray-200 dark:bg-[#1a120b] rounded-full animate-pulse"></div>
              <div className="h-10 w-10 bg-gray-200 dark:bg-[#1a120b] rounded-full animate-pulse"></div>
            </div>
          </div>
          <div className="flex gap-4 md:gap-6 overflow-hidden px-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="w-[260px] md:w-[280px] h-[340px] bg-white dark:bg-[#120c08] border border-gray-100 dark:border-white/5 rounded-[2rem] animate-pulse shrink-0 p-4">
                <div className="w-full aspect-square bg-gray-100 dark:bg-white/5 rounded-2xl mb-4"></div>
                <div className="h-4 w-3/4 bg-gray-100 dark:bg-white/5 rounded mb-2"></div>
                <div className="h-4 w-1/2 bg-gray-100 dark:bg-white/5 rounded mb-4"></div>
                <div className="h-10 w-full bg-gray-100 dark:bg-white/5 rounded-xl mt-auto"></div>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="w-full h-[180px] md:h-[220px] bg-white dark:bg-[#0c0804] border border-gray-100 dark:border-white/5 rounded-[2.5rem] animate-pulse my-4"></div>
    );
  }

  // ==========================================
  // 🌟 PREMIUM HOMEPAGE CAROUSEL 
  // ==========================================
  if (layout === 'homepage-carousel') {
    if (products.length === 0) return null;

    return (
      <div className="w-full my-10 relative group/carousel">
        
        {/* Header with Title and Custom Controls */}
        <div className="flex items-center justify-between mb-6 px-2">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight flex items-center gap-2">
            <FaShoppingCart className="text-orange-500" />
            Pooja <span className="text-orange-600">Collection</span>
          </h2>
          
          {/* 🌟 Desktop Navigation Controls */}
          <div className="hidden md:flex items-center gap-3">
            <button 
              onClick={() => scroll('left')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-md transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-orange-500 outline-none"
              aria-label="Previous items"
            >
              <FaChevronLeft size={14} className="-ml-0.5" />
            </button>
            <button 
              onClick={() => scroll('right')}
              className="w-10 h-10 rounded-full flex items-center justify-center bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 text-gray-500 hover:text-orange-600 dark:hover:text-orange-400 hover:border-orange-200 dark:hover:border-orange-900/50 hover:shadow-md transition-all active:scale-90 focus-visible:ring-2 focus-visible:ring-orange-500 outline-none"
              aria-label="Next items"
            >
              <FaChevronRight size={14} className="-mr-0.5" />
            </button>
          </div>
        </div>

        {/* Scrollable Container with elegant fade masks */}
        <div className="relative">
          {/* Left/Right Fade Masks for Premium Look */}
          <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-orange-50/80 dark:from-[#0c0804]/80 to-transparent z-10 pointer-events-none opacity-0 md:opacity-100"></div>
          <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-orange-50 dark:from-[#0c0804] to-transparent z-10 pointer-events-none opacity-0 md:opacity-100"></div>

          <div 
            ref={scrollContainerRef}
            className="flex overflow-x-auto gap-4 md:gap-6 pb-8 pt-2 px-2 snap-x snap-mandatory scrollbar-hide scroll-smooth" 
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {products.map((item, index) => (
              <Link 
                key={item.id}
                href={item.amazon_link} 
                target="_blank" 
                onClick={() => handleAdClick(item)}
                rel="noopener noreferrer nofollow"
                className="group relative flex-none w-[240px] md:w-[280px] snap-center bg-white dark:bg-[#120c08] rounded-[2rem] p-4 ring-1 ring-gray-900/5 dark:ring-white/5 shadow-[0_4px_20px_rgb(0,0,0,0.03)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(234,88,12,0.12)] dark:hover:shadow-[0_20px_40px_rgba(234,88,12,0.08)] transition-all duration-500 ease-out hover:-translate-y-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <div className="absolute top-4 left-4 z-20">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.15em] shadow-sm backdrop-blur-md transition-transform group-hover:scale-105 ${index < 2 ? 'bg-gradient-to-r from-orange-500 to-red-500 text-white border border-orange-400/50' : 'bg-white/90 dark:bg-black/50 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-white/10'}`}>
                    {index < 2 ? <><HiSparkles size={12} className="text-yellow-200" /> Top Selling</> : 'Featured'}
                  </span>
                </div>

                <div className="relative w-full aspect-square rounded-2xl bg-gray-50/50 dark:bg-white/5 overflow-hidden flex items-center justify-center p-6 mb-5 ring-1 ring-inset ring-gray-900/5 dark:ring-white/5 group-hover:bg-orange-50/50 dark:group-hover:bg-orange-900/10 transition-colors duration-500">
                  <Image 
                    src={item.image_url} 
                    alt={item.title} 
                    fill 
                    sizes="(max-width: 768px) 240px, 280px"   
                    className="object-contain p-4 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" 
                  />
                </div>
                
                <div className="flex flex-col text-left px-1 h-[100px] justify-between">
                  <h3 className="text-[15px] md:text-base font-bold text-gray-800 dark:text-gray-200 leading-snug line-clamp-2 tracking-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
                    {item.title}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto pt-3">
                    {item.price && (
                      <div className="text-lg md:text-xl font-black text-gray-900 dark:text-white tracking-tighter">
                        {item.price}
                      </div>
                    )}
                    <div className="w-9 h-9 rounded-full bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-500 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12 group-hover:shadow-lg">
                      <FaExternalLinkAlt size={12} />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Ensure single product exists for inline and sidebar layouts
  if (!product) return null;

  // ==========================================
  // 🌟 ULTRA-PREMIUM INLINE LAYOUT (For Bhajan Pages)
  // ==========================================
  if (layout === 'inline') {
    return (
      <Link 
        href={product.amazon_link} 
        target="_blank" 
        onClick={() => handleAdClick(product)}
        rel="noopener noreferrer nofollow"
        className="group relative block w-full bg-white dark:bg-[#0c0804] rounded-[2.5rem] p-3 md:p-4 ring-1 ring-gray-900/5 dark:ring-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(234,88,12,0.08)] dark:hover:shadow-[0_20px_40px_rgba(234,88,12,0.05)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
          <Image src={product.image_url} alt="aura" fill className="object-cover blur-[100px] scale-150" unoptimized />
        </div>

        <div className="relative z-10 flex flex-col sm:flex-row gap-5 md:gap-8 items-center sm:items-stretch h-full">
          <div className="relative w-full sm:w-[220px] shrink-0 aspect-[4/3] sm:aspect-square rounded-[2rem] bg-white dark:bg-gray-100 overflow-hidden flex items-center justify-center p-4 ring-1 ring-inset ring-gray-900/5 shadow-inner">
            <Image 
              src={product.image_url} alt={product.title} fill sizes="(max-width: 640px) 100vw, 220px" 
              className="object-contain p-2 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" 
            />
          </div>
          
          <div className="flex flex-col justify-center py-2 sm:py-6 pr-2 sm:pr-6 w-full text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start mb-4">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[10px] font-black uppercase tracking-[0.2em] ring-1 ring-inset ring-orange-500/20">
                <HiSparkles size={12} className="text-orange-500" /> Editor's Pick
              </span>
            </div>

            <h3 className="text-lg md:text-[22px] font-black text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 tracking-tight mb-4 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
              {product.title}
            </h3>

            <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              {product.price && (
                <div className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                  {product.price}
                </div>
              )}

              <div className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:bg-orange-600 dark:group-hover:bg-orange-500 group-hover:text-white group-hover:scale-[1.03] group-hover:shadow-[0_8px_20px_rgba(234,88,12,0.25)] flex items-center justify-center gap-2 shrink-0">
                अमेज़न पर देखें 
                <FaExternalLinkAlt size={12} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ==========================================
  // 🌟 ULTRA-PREMIUM SIDEBAR LAYOUT
  // ==========================================
  if (layout === 'sidebar') {
    return (
      <Link 
        href={product.amazon_link} 
        target="_blank" 
        onClick={() => handleAdClick(product)}
        rel="noopener noreferrer nofollow"
        className="group relative block w-full bg-white dark:bg-[#0c0804] rounded-[2rem] p-4 ring-1 ring-gray-900/5 dark:ring-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(234,88,12,0.08)] dark:hover:shadow-[0_20px_40px_rgba(234,88,12,0.05)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
          <Image src={product.image_url} alt="aura" fill className="object-cover blur-[80px] scale-150" unoptimized />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-[0.2em] ring-1 ring-inset ring-orange-500/20">
              <HiSparkles size={10} /> Editor's Choice
            </span>
          </div>

          <div className="relative w-full aspect-square rounded-2xl bg-white dark:bg-gray-100 overflow-hidden flex items-center justify-center p-6 ring-1 ring-inset ring-gray-900/5 shadow-inner mb-5">
            <Image 
              src={product.image_url} alt={product.title} fill sizes="280px"   
              className="object-contain p-2 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:scale-110" 
            />
          </div>
          
          <div className="flex flex-col text-center px-1">
            <h3 className="text-base font-black text-gray-900 dark:text-gray-100 leading-snug line-clamp-2 tracking-tight mb-3 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors duration-300">
              {product.title}
            </h3>

            {product.price && (
              <div className="text-2xl font-black text-gray-900 dark:text-white tracking-tighter mb-4">
                {product.price}
              </div>
            )}

            <div className="w-full py-3.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-sm transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:bg-orange-600 dark:group-hover:bg-orange-500 group-hover:text-white group-hover:shadow-[0_8px_20px_rgba(234,88,12,0.25)] flex items-center justify-center gap-2">
              अमेज़न पर देखें 
              <FaExternalLinkAlt size={12} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return null; 
}