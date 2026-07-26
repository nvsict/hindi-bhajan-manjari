"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
// 🌟 FIX: FaPlayCircle 'fa' से और FaSparkles 'fa6' से इम्पोर्ट किया गया है
import { FaPlayCircle } from 'react-icons/fa';
import { FaWandSparkles } from 'react-icons/fa6';

interface Props {
  savedSlugs: string[];
}

export default function SmartRecommendations({ savedSlugs }: Props) {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let targetDeityId = null;

        // 1. 🧠 ANALYZE USER'S TASTE
        if (savedSlugs.length > 0) {
          const recentSlugs = savedSlugs.slice(0, 20);
          const { data: savedMeta } = await supabase
            .from('mv_bhajan_details')
            .select('deity_id')
            .in('slug', recentSlugs);

          if (savedMeta && savedMeta.length > 0) {
            const counts = savedMeta.reduce((acc: any, curr) => {
              if (curr.deity_id) acc[curr.deity_id] = (acc[curr.deity_id] || 0) + 1;
              return acc;
            }, {});
            
            const sortedDeities = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
            if (sortedDeities.length > 0) {
              targetDeityId = sortedDeities[0];
            }
          }
        }

        // 2. 🎁 FETCH SUGGESTIONS BASED ON TASTE
        let query = supabase.from('mv_bhajan_details').select('slug, title_hindi, title_hinglish');
        
        if (targetDeityId) {
          query = query.eq('deity_id', targetDeityId);
        }
        
        const { data: suggestions } = await query.limit(15);

        if (suggestions) {
          const finalRecs = suggestions
            .filter(b => !savedSlugs.includes(b.slug))
            .slice(0, 5);
          
          setRecommendations(finalRecs);
        }
      } catch (error) {
        console.error("Error fetching recommendations", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [savedSlugs]);

  if (loading) {
    return (
      <div className="mt-12 pt-8 border-t border-orange-100/50">
        <div className="h-6 w-48 bg-orange-100/50 animate-pulse rounded-full mb-6"></div>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3].map(i => <div key={i} className="w-[240px] h-[120px] bg-white/50 animate-pulse rounded-2xl shrink-0"></div>)}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) return null;

  return (
    <div className="mt-12 md:mt-16 pt-8 border-t border-orange-100/50 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex items-center gap-3 mb-6 px-1">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white shadow-sm">
          <FaWandSparkles size={14} />
        </div>
        <h2 className="text-xl md:text-2xl font-black text-gray-900 font-hindi tracking-tight">
          आपके लिए विशेष सुझाव
        </h2>
      </div>

      {/* 🌟 Horizontal Slider */}
      <div className="flex overflow-x-auto gap-4 pb-6 custom-scrollbar snap-x snap-mandatory">
        {recommendations.map((bhajan) => (
          <Link 
            key={bhajan.slug} 
            href={`/bhajan/${bhajan.slug}`}
            className="snap-start shrink-0 w-[260px] bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-[0_8px_25px_rgba(234,88,12,0.15)] hover:border-orange-200 transition-all group relative overflow-hidden"
          >
            <div className="absolute -right-4 -bottom-4 opacity-[0.02] group-hover:opacity-[0.08] transition-opacity">
              <FaPlayCircle size={120} />
            </div>
            <div className="w-10 h-10 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-500 group-hover:text-white transition-colors relative z-10">
  <FaWandSparkles size={16} />
</div>
            <h3 className="text-lg font-black font-hindi text-gray-900 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors relative z-10">
              {bhajan.title_hindi}
            </h3>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-3 relative z-10 group-hover:text-orange-500 transition-colors">
              Tap to Read &rarr;
            </p>
          </Link>
        ))}
      </div>

    </div>
  );
}