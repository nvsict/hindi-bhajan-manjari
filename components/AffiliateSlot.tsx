'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

interface AffiliateSlotProps {
  deityId?: string | null;
  layout?: 'inline' | 'card' | 'sidebar';
}

export default function AffiliateSlot({ deityId, layout = 'inline' }: AffiliateSlotProps) {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBestProduct = async () => {
      setLoading(true);
      try {
        let query = supabase.from('affiliate_products').select('*').eq('is_active', true);
        
        if (deityId) {
          query = query.eq('deity_id', deityId);
        } else {
          query = query.is('deity_id', null);
        }

        const { data, error } = await query;

        if (data && data.length > 0) {
          const randomProduct = data[Math.floor(Math.random() * data.length)];
          setProduct(randomProduct);
        } else if (deityId) {
          const { data: generalData } = await supabase.from('affiliate_products').select('*').eq('is_active', true).is('deity_id', null);
          if (generalData && generalData.length > 0) {
            setProduct(generalData[Math.floor(Math.random() * generalData.length)]);
          }
        }
      } catch (err) {
        console.error("Affiliate Slot Error:", err);
      }
      setLoading(false);
    };

    fetchBestProduct();
  }, [deityId]);

  const handleAdClick = async () => {
    if (!product) return;
    
    // Background click tracking
    supabase.rpc('increment_click', { product_id: product.id }).then(); 

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'affiliate_click', {
        product_name: product.title,
        placement: layout,
      });
    }
  };

  if (loading || !product) return null;

  // ==========================================
  // 🌟 ULTRA-PREMIUM INLINE LAYOUT
  // ==========================================
  if (layout === 'inline') {
    return (
      <Link 
        href={product.amazon_link} 
        target="_blank" 
        onClick={handleAdClick}
        rel="noopener noreferrer nofollow"
        className="group relative block w-full bg-white dark:bg-[#0c0804] rounded-[2.5rem] p-3 md:p-4 ring-1 ring-gray-900/5 dark:ring-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(234,88,12,0.08)] dark:hover:shadow-[0_20px_40px_rgba(234,88,12,0.05)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      >
        {/* DYNAMIC AURA */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
          <Image 
            src={product.image_url} 
            alt="aura" 
            fill 
            className="object-cover blur-[100px] scale-150" 
            unoptimized 
          />
        </div>

        {/* CONTENT WRAPPER */}
        <div className="relative z-10 flex flex-col sm:flex-row gap-5 md:gap-8 items-center sm:items-stretch h-full">
          
          {/* 🌟 THE FIX: IMAGE CONTAINER
            1. bg-white ensures the Amazon image background merges perfectly.
            2. mix-blend-multiply on the image makes the white invisible.
            3. overflow-hidden and rounded-[2rem] guarantee soft corners.
          */}
          <div className="relative w-full sm:w-[220px] shrink-0 aspect-[4/3] sm:aspect-square rounded-[2rem] bg-white dark:bg-gray-100 overflow-hidden flex items-center justify-center p-4 ring-1 ring-inset ring-gray-900/5 shadow-inner">
            <Image 
  src={product.image_url} 
  alt={product.title} 
  fill 
  sizes="(max-width: 640px) 100vw, 220px" 
  className="object-contain p-2 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110" 
/>
          </div>
          
          {/* TYPOGRAPHY & BUTTONS */}
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
                अमेज़न पर देखें 
                <FaExternalLinkAlt size={12} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
              </div>

            </div>
          </div>
        </div>
      </Link>
    );
  }

  // ==========================================
  // 🌟 ULTRA-PREMIUM SIDEBAR LAYOUT (Vertical Stack)
  // ==========================================
  if (layout === 'sidebar') {
    return (
      <Link 
        href={product.amazon_link} 
        target="_blank" 
        onClick={handleAdClick}
        rel="noopener noreferrer nofollow"
        className="group relative block w-full bg-white dark:bg-[#0c0804] rounded-[2rem] p-4 ring-1 ring-gray-900/5 dark:ring-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_20px_40px_rgb(234,88,12,0.08)] dark:hover:shadow-[0_20px_40px_rgba(234,88,12,0.05)] overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-1.5 focus:outline-none"
      >
        {/* Dynamic Aura */}
        <div className="absolute inset-0 z-0 opacity-[0.03] dark:opacity-[0.08] group-hover:opacity-[0.06] dark:group-hover:opacity-[0.15] transition-opacity duration-700 pointer-events-none mix-blend-multiply dark:mix-blend-screen">
          <Image src={product.image_url} alt="aura" fill className="object-cover blur-[80px] scale-150" unoptimized />
        </div>

        <div className="relative z-10 flex flex-col h-full">
          {/* Top Badge */}
          <div className="flex items-center justify-between mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 text-[9px] font-black uppercase tracking-[0.2em] ring-1 ring-inset ring-orange-500/20">
              <HiSparkles size={10} /> Editor's Choice
            </span>
          </div>

          {/* Large Vertical Image */}
          <div className="relative w-full aspect-square rounded-2xl bg-white dark:bg-gray-100 overflow-hidden flex items-center justify-center p-6 ring-1 ring-inset ring-gray-900/5 shadow-inner mb-5">
            <Image 
              src={product.image_url} 
              alt={product.title} 
              fill 
              sizes="280px"   
              className="object-contain p-2 mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-110" 
            />
          </div>
          
          {/* Typography & Call to Action */}
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
              अमेज़न पर देखें 
              <FaExternalLinkAlt size={12} className="opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
            </div>
          </div>
        </div>
      </Link>
    );
  }

  return null; 
}