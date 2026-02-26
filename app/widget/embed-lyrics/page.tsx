import { supabase } from '@/utils/supabase';
import { GiLotusFlower } from 'react-icons/gi';
import { FaExternalLinkAlt } from 'react-icons/fa';

export const revalidate = 3600;

export default async function EmbedLyricsWidget({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; lang?: string; slug?: string }>;
}) {
  const resolvedParams = await searchParams;
  const theme = resolvedParams.theme || 'light';
  const lang = resolvedParams.lang || 'hindi';
  const slug = resolvedParams.slug || 'hanuman-chalisa'; // Default fallback
  const isDark = theme === 'dark';

  // Fetch the specific Bhajan
  const { data: bhajan } = await supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, lyrics_hindi, lyrics_hinglish, deities(name_hinglish)')
    .eq('slug', slug)
    .single();

  if (!bhajan) {
    return (
      <div className={`flex h-full items-center justify-center p-4 font-sans border rounded-2xl ${isDark ? 'bg-gray-900 text-gray-400 border-gray-800' : 'bg-orange-50 text-gray-500 border-orange-200'}`}>
        Bhajan not found.
      </div>
    );
  }

  const displayTitle = lang === 'hinglish' ? bhajan.title_hinglish : bhajan.title_hindi;
  const displayLyrics = lang === 'hinglish' ? (bhajan.lyrics_hinglish || bhajan.lyrics_hindi) : bhajan.lyrics_hindi;
  
  // @ts-ignore
  const deityName = Array.isArray(bhajan.deities) ? bhajan.deities[0]?.name_hinglish : bhajan.deities?.name_hinglish;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const bhajanUrl = `${baseUrl}/bhajan/${bhajan.slug}`;

  return (
    <div className={`flex flex-col h-screen overflow-hidden font-sans transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-200' : 'bg-white text-gray-800'}`}>
      
      {/* 🌟 WIDGET HEADER (Fixed) */}
      <div className={`shrink-0 p-4 border-b flex items-center justify-between ${isDark ? 'border-gray-800 bg-gray-900/95' : 'border-orange-100 bg-orange-50/50'}`}>
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${isDark ? 'bg-orange-900/50 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
            <GiLotusFlower size={16} />
          </div>
          <div>
            <h2 className={`text-base font-bold leading-tight line-clamp-1 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {displayTitle}
            </h2>
            {deityName && (
              <p className={`text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500' : 'text-orange-600/70'}`}>
                {deityName}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* 🌟 SCROLLABLE LYRICS BODY */}
      <div className="flex-1 overflow-y-auto p-5 scrollbar-thin scrollbar-thumb-orange-200 scrollbar-track-transparent">
        <div className={`whitespace-pre-wrap text-sm leading-relaxed text-center font-medium ${lang === 'hindi' ? 'text-base' : ''}`}>
          {displayLyrics}
        </div>
      </div>

      {/* 🌟 WIDGET FOOTER (Fixed CTA) */}
      <div className={`shrink-0 p-3 border-t ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-100 bg-gray-50'}`}>
        <a 
          href={bhajanUrl}
          target="_blank" 
          rel="noopener noreferrer"
          className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-xs transition-colors ${
            isDark 
              ? 'bg-gray-800 hover:bg-gray-700 text-orange-400' 
              : 'bg-white border border-orange-200 hover:bg-orange-50 text-orange-600 shadow-sm'
          }`}
        >
          Read Full Meaning & Listen <FaExternalLinkAlt size={10} />
        </a>
      </div>

    </div>
  );
}