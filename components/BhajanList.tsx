"use client";

import { useState, useEffect, memo } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';
import { FaArrowRight, FaArrowLeft, FaExclamationTriangle, FaPlay, FaMusic, FaCompass } from 'react-icons/fa';
import ScrollReveal from './ScrollReveal'; 
import Image from 'next/image';

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
  categoryId?: string | number; // Category ID (If on Category Page)
  categorySlug?: string;
  deityId?: string | number;    // 🌟 NEW: Deity ID (If on Deity Page)
  deitySlug?: string;           // 🌟 NEW: Deity Slug
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

// ==========================================
// 🌟 OPTIMIZED BHAJAN CARD (Perfect Aspect Ratio Fix)
// ==========================================
const BhajanCard = memo(({ bhajan, index, itemsPerPage }: { bhajan: Bhajan, index: number, itemsPerPage: number }) => {
  const ytId = getYouTubeId(bhajan.video_embed_url);
  const thumbnailUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null;

  return (
    <ScrollReveal delay={(index % itemsPerPage) * 0.05} yOffset={30}>
      <Link href={`/bhajan/${bhajan.slug}`}>
        <div className="group bg-white p-4 md:p-5 rounded-[2rem] border border-gray-100 shadow-[0_2px_10px_rgb(0,0,0,0.02)] hover:shadow-lg hover:border-orange-200 transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-5 md:gap-6 relative overflow-hidden hover:-translate-y-1">
          
          {/* 🌟 YOUTUBE THUMBNAIL (Strictly Locked at 16:9) */}
          {thumbnailUrl ? (
            <div className="relative w-full sm:w-48 md:w-56 shrink-0 aspect-video rounded-2xl overflow-hidden bg-gray-900 group-hover:shadow-md transition-all border border-gray-100/50">
              <Image 
                src={thumbnailUrl} 
                alt={bhajan.title_hinglish}
                fill 
                quality={75}
                sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 250px" 
                className="object-cover scale-[1.02] group-hover:scale-110 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-black/10 flex items-center justify-center group-hover:bg-black/20 transition-colors duration-500">
                <div className="w-10 h-10 md:w-12 md:h-12 bg-white/95 rounded-full flex items-center justify-center text-orange-600 shadow-xl backdrop-blur-sm group-hover:scale-110 transition-transform duration-300">
                  <FaPlay className="ml-1 text-sm md:text-base" />
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex w-full sm:w-48 md:w-56 shrink-0 aspect-video rounded-2xl bg-gradient-to-br from-[#1a0500] via-[#431407] to-[#882b0f] items-center justify-center border border-[#301108] shadow-inner overflow-hidden group-hover:shadow-xl transition-all duration-300">
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-[0.04]">
                <Image src="/logo.png" alt="Watermark pattern" fill className="object-cover scale-150" />
              </div>
              <div style={{ position: 'absolute', top: 0, left: '20%', right: '20%', height: '4px', backgroundImage: 'linear-gradient(90deg, transparent, #ea580c, transparent)', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px', opacity: 0.8 }} />
              <div className="relative z-10 flex flex-col items-center justify-center px-4 w-full h-full">
                <div className="relative w-12 h-12 md:w-14 md:h-14 mb-2 md:mb-3 drop-shadow-[0_4px_10px_rgba(0,0,0,0.3)]">
                  <Image src="/logo.png" alt="Logo" fill className="object-contain" />
                </div>
                <div className="flex items-center gap-1.5 bg-black/20 text-white/70 px-3 py-1 rounded-full border border-white/5 backdrop-blur-sm shadow-sm mb-1 md:mb-2.5">
                  <FaMusic size={10} className="text-orange-600" />
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] truncate max-w-[120px]">
                    {bhajan.deities?.name_hinglish || 'Bhajan'}
                  </span>
                </div>
                 <span className="absolute bottom-2 md:bottom-2.5 right-3 md:right-4 text-2xl md:text-3xl font-black text-white/5 uppercase tracking-tighter leading-none font-serif truncate max-w-[80%]">
                   {bhajan.deities?.name_hinglish || 'BHANJANI'}
                 </span>
              </div>
            </div>
          )}

          {/* CONTENT AREA */}
          <div className="flex flex-col flex-1 min-w-0 justify-center py-1">
            <div className="flex flex-col-reverse md:flex-col gap-1 mb-2.5">
              <h3 className="text-xl md:text-[22px] font-black font-hindi text-gray-900 group-hover:text-orange-600 transition-colors leading-tight line-clamp-2">
                {bhajan.title_hindi}
              </h3>
              <p className="text-[11px] font-bold uppercase tracking-widest text-gray-500 line-clamp-1">
                {bhajan.title_hinglish}
              </p>
            </div>
            
            <p className="text-sm text-gray-600 italic font-hindi line-clamp-1 border-l-2 border-orange-200 pl-3 leading-relaxed mb-4">
              "{bhajan.lyrics_hindi?.split('\n')[0] || 'View full lyrics inside'}"...
            </p>

            <div className="mt-auto flex items-center justify-between pt-1">
              <div className="flex flex-wrap gap-2">
                {bhajan.deities && (
                  <span className="bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                    {bhajan.deities.name_hinglish}
                  </span>
                )}
                {bhajan.categories && (
                  <span className="bg-gray-50 text-gray-600 border border-gray-100 px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest">
                    {bhajan.categories.name_hinglish}
                  </span>
                )}
              </div>

              <div className="flex items-center text-orange-600 text-sm font-bold group-hover:translate-x-1 transition-transform shrink-0">
                Read <FaArrowRight className="ml-1.5" size={12} />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </ScrollReveal>
  );
});

BhajanCard.displayName = "BhajanCard";


// ==========================================
// MAIN BHAJAN LIST COMPONENT
// ==========================================
export default function BhajanList({ 
  initialBhajans, 
  categoryId,
  categorySlug,
  deityId,       // 🌟 Destructured Deity ID
  deitySlug,     // 🌟 Destructured Deity Slug
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
  }, [initialBhajans, categoryId, deityId]); // Reset if IDs change

  const isSeoPaginated = !!((categorySlug || deitySlug) && currentPage && totalItems);
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
        // 🌟 FETCH FOR CATEGORY
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

      } else if (deityId) {
        // 🌟 NEW: FETCH FOR DEITY ONLY
        const { data, error } = await supabase
          .from('bhajans')
          .select(`
            title_hinglish, title_hindi, slug, lyrics_hindi, video_embed_url,
            deities ( name_hinglish ), categories ( name_hinglish )
          `)
          .eq('deity_id', deityId)
          .order('created_at', { ascending: false }) 
          .range(from, to);
          
        if (error) throw error;
        fetchedData = data;

      } else {
        // 🌟 FETCH ALL (Homepage)
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
      setNetworkError(`Supabase says: ${err.message || err.details || 'Connection Timeout'}`);
    } finally {
      setLoading(false);
    }
  };

  const paginationBaseUrl = categorySlug ? `/category/${categorySlug}` : `/deity/${deitySlug}`;

  return (
    <div className="flex flex-col gap-8 w-full">
      
      {/* List of Bhajans */}
      <div className="flex flex-col gap-5">
        {bhajans.map((bhajan, index) => (
          <BhajanCard 
            key={bhajan.slug} 
            bhajan={bhajan} 
            index={index} 
            itemsPerPage={itemsPerPage} 
          />
        ))}
      </div>

      {/* SEO Pagination (If active) */}
      {isSeoPaginated ? (
        <ScrollReveal yOffset={20}>
          <div className="flex items-center justify-between pt-8 border-t border-gray-100 mt-4">
            {hasPrevPage ? (
              <Link 
                href={`${paginationBaseUrl}${currentPage! - 1 === 1 ? '' : `?page=${currentPage! - 1}`}`}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all flex items-center gap-2"
              >
                <FaArrowLeft size={14} /> Previous
              </Link>
            ) : <div></div>} 

            <span className="text-sm font-bold text-gray-500 uppercase tracking-widest">
              Page {currentPage} of {totalPages}
            </span>

            {hasNextPage ? (
              <Link 
                href={`${paginationBaseUrl}?page=${currentPage! + 1}`}
                className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all flex items-center gap-2"
              >
                Next <FaArrowRight size={14} />
              </Link>
            ) : <div></div>}
          </div>
        </ScrollReveal>
      ) : hasMore ? (
        // "Load More" Button
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
      ) : (
        // 🌟 NEW: "End of List" UI when no more bhajans are available
        <ScrollReveal yOffset={20}>
          <div className="flex flex-col items-center justify-center pt-10 pb-6 border-t border-gray-100 mt-4 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-300 mb-4">
              <FaCompass size={24} />
            </div>
            <h4 className="text-lg font-black text-gray-800 mb-2 tracking-tight">You've reached the end!</h4>
            <p className="text-gray-500 text-sm font-medium mb-6 max-w-sm">
              We have shown all the bhajans available in this section. Continue your spiritual journey by exploring other collections.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link 
                href="/deity" 
                className="px-6 py-2.5 bg-orange-50 text-orange-600 font-bold rounded-full hover:bg-orange-100 hover:shadow-sm transition-all text-sm"
              >
                Explore Deities
              </Link>
              <Link 
                href="/category" 
                className="px-6 py-2.5 bg-blue-50 text-blue-600 font-bold rounded-full hover:bg-blue-100 hover:shadow-sm transition-all text-sm"
              >
                Browse Categories
              </Link>
            </div>
          </div>
        </ScrollReveal>
      )}
      
    </div>
  );
}