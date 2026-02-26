"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import Link from 'next/link';
import { FaArrowRight, FaArrowLeft } from 'react-icons/fa'; // 🌟 Added FaArrowLeft

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
  // 🌟 NEW PROPS FOR SEO PAGINATION
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

  // 🌟 SYNC STATE: If the URL changes (e.g., user clicks Next Page), 
  // update the list with the fresh server data.
  useEffect(() => {
    setBhajans(initialBhajans);
  }, [initialBhajans]);

  // 🌟 PAGINATION MATH
  const isSeoPaginated = !!(categorySlug && currentPage && totalItems);
  const totalPages = isSeoPaginated ? Math.ceil(totalItems! / itemsPerPage) : 0;
  const hasNextPage = isSeoPaginated ? currentPage! < totalPages : false;
  const hasPrevPage = isSeoPaginated ? currentPage! > 1 : false;

  const loadMoreBhajans = async () => {
    setLoading(true);
    const nextOffset = bhajans.length;

    let fetchedData = null;
    let fetchError = null;

    if (categoryId) {
      // CATEGORY PAGE LOGIC (Fallback if not using SEO links)
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
        .range(nextOffset, nextOffset + itemsPerPage - 1);

      fetchedData = data?.map((item: any) => ({
        ...item.bhajans,
        categories: initialBhajans[0]?.categories || null 
      }));
      fetchError = error;

    } else {
      // HOMEPAGE LOGIC
      const { data, error } = await supabase
        .from('bhajans')
        .select(`
          title_hinglish, title_hindi, slug, lyrics_hindi,
          deities ( name_hinglish ), categories ( name_hinglish )
        `)
        .order('created_at', { ascending: false }) 
        .range(nextOffset, nextOffset + itemsPerPage - 1);
        
      fetchedData = data;
      fetchError = error;
    }

    if (fetchError) {
      console.error("Error loading more:", fetchError);
    } else if (fetchedData) {
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
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-8 max-w-4xl mx-auto">
      
      {/* List Container */}
      <div className="flex flex-col gap-4">
        {bhajans.map((bhajan) => (
          <Link href={`/bhajan/${bhajan.slug}`} key={bhajan.slug}>
            <div className="group bg-white p-5 md:p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 relative overflow-hidden">
              
              {/* Left Side: Typography */}
              <div className="flex-1">
                <div className="flex flex-col-reverse md:flex-col gap-1 mb-3">
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 group-hover:text-orange-600 transition-colors">
                    {bhajan.title_hindi}
                  </h3>
                  <p className="text-sm font-medium text-gray-400">
                    {bhajan.title_hinglish}
                  </p>
                </div>
                
                {/* Single line lyrics snippet */}
                <p className="text-sm text-gray-500 italic line-clamp-1 border-l-2 border-orange-200 pl-3">
                  "{bhajan.lyrics_hindi?.split('\n')[0] || 'View full lyrics inside'}"...
                </p>
              </div>

              {/* Right Side: Badges & Arrow */}
              <div className="flex items-center md:flex-col md:items-end justify-between md:justify-center shrink-0 border-t border-gray-50 md:border-t-0 pt-4 md:pt-0">
                
                <div className="flex gap-2 mb-0 md:mb-4">
                  {bhajan.deities && (
                    <span className="bg-orange-50 text-orange-700 border border-orange-100 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                      {bhajan.deities.name_hinglish}
                    </span>
                  )}
                  {bhajan.categories && (
                    <span className="bg-gray-50 text-gray-600 border border-gray-100 px-3 py-1 rounded-full text-xs font-bold tracking-wide">
                      {bhajan.categories.name_hinglish}
                    </span>
                  )}
                </div>

                <div className="flex items-center text-orange-500 text-sm font-bold group-hover:translate-x-1 transition-transform">
                  Read <FaArrowRight className="ml-1.5" size={12} />
                </div>

              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* 🌟 SEO-FRIENDLY PAGINATION OR LOAD MORE BUTTON */}
      {isSeoPaginated ? (
        <div className="flex items-center justify-between pt-8 border-t border-orange-100 mt-4">
          
          {hasPrevPage ? (
            <Link 
              href={`/category/${categorySlug}${currentPage! - 1 === 1 ? '' : `?page=${currentPage! - 1}`}`}
              className="px-6 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 shadow-sm transition-all flex items-center gap-2"
            >
              <FaArrowLeft size={14} /> Previous
            </Link>
          ) : <div></div>} {/* Empty div to keep 'Page X of Y' centered */}

          <span className="text-sm font-bold text-gray-400">
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
      ) : hasMore && (
        <div className="flex justify-center pt-6">
          <button 
            onClick={loadMoreBhajans}
            disabled={loading}
            className="group relative px-8 py-3.5 bg-white border border-gray-200 text-gray-600 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 hover:shadow-sm transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-gray-200 border-t-orange-600 rounded-full animate-spin"></div>
                Fetching...
              </span>
            ) : (
              "Load More Bhajans"
            )}
          </button>
        </div>
      )}
      
    </div>
  );
}