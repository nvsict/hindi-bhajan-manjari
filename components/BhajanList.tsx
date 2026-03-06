"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';
import { FaArrowRight, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import ScrollReveal from './ScrollReveal'; // 🌟 Imported ScrollReveal!

interface Bhajan {
  title_hinglish: string;
  title_hindi: string;
  slug: string;
  lyrics_hindi: string;
  deities: { name_hinglish: string } | null;
  categories: { name_hinglish: string } | null;
}

interface Props {
  initialBhajans: Bhajan[];
  categoryId?: string;
  categorySlug?: string;
  currentPage?: number;
  totalItems?: number;
  itemsPerPage?: number;
}

export default function BhajanList({ 
  initialBhajans, 
  categoryId,
  categorySlug,
  currentPage,
  totalItems,
  itemsPerPage = 10
}: Props) {
  const [bhajans, setBhajans] = useState<Bhajan[]>(initialBhajans);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // 🌟 FIX 1: Strict Page Tracking
  const [loadMorePage, setLoadMorePage] = useState(1);
  
  // 🌟 FIX 2: Network Error State for Supabase DNS issues
  const [networkError, setNetworkError] = useState<string | null>(null);

  // Sync state if URL changes
  useEffect(() => {
    setBhajans(initialBhajans);
    setLoadMorePage(1); 
    setHasMore(true);
    setNetworkError(null);
  }, [initialBhajans]);

  const isSeoPaginated = !!(categorySlug && currentPage && totalItems);
  const totalPages = isSeoPaginated ? Math.ceil(totalItems! / itemsPerPage) : 0;
  const hasNextPage = isSeoPaginated ? currentPage! < totalPages : false;
  const hasPrevPage = isSeoPaginated ? currentPage! > 1 : false;

  const loadMoreBhajans = async () => {
    setLoading(true);
    setNetworkError(null); 

    const from = loadMorePage * itemsPerPage;
    const to = from + itemsPerPage - 1;

    try {
      let fetchedData = null;

      if (categoryId) {
        const { data, error } = await supabase
          .from('bhajan_category_map')
          .select(`
            bhajans (
              title_hinglish, title_hindi, slug, lyrics_hindi,
              deities ( name_hinglish )
            )
          `)
          .eq('category_id', categoryId)
          .order('id', { ascending: false }) 
          .range(from, to);

        if (error) throw error;

        fetchedData = data?.map((item: any) => ({
          ...item.bhajans,
          categories: initialBhajans[0]?.categories || null 
        }));

      } else {
        const { data, error } = await supabase
          .from('bhajans')
          .select(`
            title_hinglish, title_hindi, slug, lyrics_hindi,
            deities ( name_hinglish ), categories ( name_hinglish )
          `)
          .order('created_at', { ascending: false }) 
          .range(from, to);
          
        if (error) throw error;
        fetchedData = data;
      }

      if (fetchedData) {
        if (fetchedData.length < itemsPerPage) {
          setHasMore(false);
        }

        const flattenedData: Bhajan[] = fetchedData.map((item: any) => ({
          ...item,
          deities: Array.isArray(item.deities) ? item.deities[0] : item.deities,
          categories: Array.isArray(item.categories) ? item.categories[0] : item.categories,
        }));

        setBhajans((prev) => {
          const uniqueNewBhajans = flattenedData.filter(
            (newBhajan) => !prev.some((existingBhajan) => existingBhajan.slug === newBhajan.slug)
          );
          return [...prev, ...uniqueNewBhajans];
        });

        setLoadMorePage((prev) => prev + 1); 
      }
    } catch (err: any) {
      console.error("Supabase Fetch Error:", err);
      setNetworkError(`Supabase says: ${err.message || err.details || 'DNS Connection Timeout'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      
      {/* List Container */}
      <div className="flex flex-col gap-4">
        {bhajans.map((bhajan, index) => (
          /* 🌟 OPTIMIZATION: Modulo Delay! 
             Ensures the 11th item doesn't wait a full second to load. 
             Every new batch of 10 restarts the cascade wave perfectly. */
          <ScrollReveal 
            key={bhajan.slug} 
            delay={(index % itemsPerPage) * 0.05} 
            yOffset={30}
          >
            <Link href={`/bhajan/${bhajan.slug}`}>
              <div className="group bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden hover:-translate-y-0.5">
                
                <div className="flex-1">
                  <div className="flex flex-col-reverse md:flex-col gap-1.5 mb-3.5">
                    <h3 className="text-xl md:text-2xl font-black font-hindi text-gray-900 group-hover:text-orange-600 transition-colors leading-tight">
                      {bhajan.title_hindi}
                    </h3>
                    <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-500">
                      {bhajan.title_hinglish}
                    </p>
                  </div>
                  
                  <p className="text-sm md:text-base text-gray-600 italic font-hindi line-clamp-1 border-l-2 border-orange-200 pl-3 leading-relaxed">
                    "{bhajan.lyrics_hindi?.split('\n')[0] || 'View full lyrics inside'}"...
                  </p>
                </div>

                <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center shrink-0 border-t border-gray-50 md:border-t-0 pt-4 md:pt-0">
                  <div className="flex gap-2 mb-0 md:mb-4">
                    {bhajan.deities && (
                      <span className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        {bhajan.deities.name_hinglish}
                      </span>
                    )}
                    {bhajan.categories && (
                      <span className="bg-gray-50 text-gray-600 border border-gray-100 px-3 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        {bhajan.categories.name_hinglish}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center text-orange-600 text-sm font-bold group-hover:translate-x-1 transition-transform">
                    Read <FaArrowRight className="ml-1.5" size={12} />
                  </div>
                </div>
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>

      {/* 🌟 Reveal the Pagination block smoothly */}
      {isSeoPaginated ? (
        <ScrollReveal yOffset={20}>
          <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-4">
            {hasPrevPage ? (
              <Link 
                href={`/category/${categorySlug}${currentPage! - 1 === 1 ? '' : `?page=${currentPage! - 1}`}`}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all flex items-center gap-2"
              >
                <FaArrowLeft size={14} /> Previous
              </Link>
            ) : <div></div>} 

            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>

            {hasNextPage ? (
              <Link 
                href={`/category/${categorySlug}?page=${currentPage! + 1}`}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all flex items-center gap-2"
              >
                Next <FaArrowRight size={14} />
              </Link>
            ) : <div></div>}
          </div>
        </ScrollReveal>
      ) : hasMore && (
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-center pt-6 border-t border-gray-50 mt-2">
            
            {networkError && (
              <div className="mb-4 flex items-center gap-2 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
                <FaExclamationTriangle className="shrink-0" />
                <p>{networkError}</p>
              </div>
            )}

            <button 
              onClick={loadMoreBhajans}
              disabled={loading}
              className={`group relative px-8 py-3.5 bg-white border font-bold rounded-full shadow-sm transition-all disabled:opacity-80
                ${networkError 
                  ? 'border-red-300 text-red-600 hover:bg-red-50' 
                  : 'border-gray-200 text-gray-700 hover:border-orange-500 hover:text-orange-600 hover:shadow-md'
                }
              `}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Fetching...
                </span>
              ) : networkError ? (
                "Retry Loading"
              ) : (
                "Load More Bhajans"
              )}
            </button>
          </div>
        </ScrollReveal>
      )}
      
    </div>
  );
}