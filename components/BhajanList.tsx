"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';
import { FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaPlay, FaMusic } from 'react-icons/fa';
import ScrollReveal from './ScrollReveal'; 

interface Bhajan {
  title_hinglish: string;
  title_hindi: string;
  slug: string;
  lyrics_hindi: string;
  video_embed_url?: string; 
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

const getYouTubeId = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

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
  
  const [loadMorePage, setLoadMorePage] = useState(1);
  const [networkError, setNetworkError] = useState<string | null>(null);

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
              title_hinglish, title_hindi, slug, lyrics_hindi, video_embed_url,
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
            title_hinglish, title_hindi, slug, lyrics_hindi, video_embed_url,
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
      
      <div className="flex flex-col gap-4">
        {bhajans.map((bhajan, index) => {
          const ytId = getYouTubeId(bhajan.video_embed_url);
          const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

          return (
            <ScrollReveal 
              key={bhajan.slug} 
              delay={(index % itemsPerPage) * 0.05} 
              yOffset={30}
            >
              <Link href={`/bhajan/${bhajan.slug}`}>
                <div className="group bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col sm:flex-row sm:items-start justify-between gap-5 md:gap-6 relative overflow-hidden hover:-translate-y-0.5">
                  
                  {/* 🌟 PERFECT 16:9 YOUTUBE THUMBNAIL UI */}
                  {thumbnailUrl ? (
                    <div className="relative w-full sm:w-48 md:w-56 shrink-0 aspect-video rounded-2xl overflow-hidden bg-gray-100 group-hover:shadow-md transition-all border border-gray-100/50">
                      <img 
                        src={thumbnailUrl} 
                        alt={bhajan.title_hinglish} 
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center group-hover:bg-black/10 transition-colors duration-500">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-white/95 rounded-full flex items-center justify-center text-orange-600 shadow-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                          <FaPlay className="ml-1 text-sm md:text-base" />
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Placeholder for Bhajans without YouTube links - Also matching 16:9 */
                    <div className="hidden sm:flex w-full sm:w-48 md:w-56 shrink-0 aspect-video rounded-2xl bg-gradient-to-br from-orange-50 to-orange-100/50 items-center justify-center border border-orange-100 text-orange-200/60">
                      <FaMusic size={32} />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col-reverse md:flex-col gap-1.5 mb-3.5">
                      <h3 className="text-xl md:text-2xl font-black font-hindi text-gray-900 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2">
                        {bhajan.title_hindi}
                      </h3>
                      <p className="text-[11px] md:text-xs font-bold uppercase tracking-widest text-gray-500 line-clamp-1">
                        {bhajan.title_hinglish}
                      </p>
                    </div>
                    
                    <p className="text-sm md:text-base text-gray-600 italic font-hindi line-clamp-1 border-l-2 border-orange-200 pl-3 leading-relaxed">
                      "{bhajan.lyrics_hindi?.split('\n')[0] || 'View full lyrics inside'}"...
                    </p>
                  </div>

                  <div className="flex items-center sm:flex-col sm:items-end justify-between sm:justify-center shrink-0 border-t border-gray-50 sm:border-t-0 pt-4 sm:pt-0 mt-auto sm:mt-0">
                    <div className="flex flex-wrap gap-2 mb-0 sm:mb-4">
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
          );
        })}
      </div>

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