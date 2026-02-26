import { supabase } from '@/utils/supabase';
import { GiLotusFlower } from 'react-icons/gi';

// Cache this widget for 1 hour so it loads instantly on third-party sites
export const revalidate = 3600;

export default async function DailyBhajanWidget({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; lang?: string }>;
}) {
  const resolvedParams = await searchParams;
  const theme = resolvedParams.theme || 'light';
  const lang = resolvedParams.lang || 'hindi';
  const isDark = theme === 'dark';

  // 1. Fetch a small pool of Bhajans
  const { data: bhajans } = await supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, deities(name_hinglish)')
    .order('created_at', { ascending: false })
    .limit(7);

  // 2. Pick a "Daily" one based on the current day of the week
  const dayIndex = new Date().getDay(); // Returns 0 (Sun) to 6 (Sat)
  const bhajan = bhajans?.[dayIndex % (bhajans?.length || 1)];

  if (!bhajan) {
    return (
      <div className={`flex h-full items-center justify-center p-4 font-sans ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-orange-50 text-gray-500'}`}>
        Loading Today's Bhajan...
      </div>
    );
  }

  const displayTitle = lang === 'hinglish' ? bhajan.title_hinglish : bhajan.title_hindi;
  // @ts-ignore - Handling array or single object depending on Supabase setup
  const deityName = Array.isArray(bhajan.deities) ? bhajan.deities[0]?.name_hinglish : bhajan.deities?.name_hinglish;

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const bhajanUrl = `${baseUrl}/bhajan/${bhajan.slug}`;

  // 🌟 WIDGET UI (Must use target="_blank" so it opens in a new tab, not inside the iframe!)
  return (
    <div 
      className={`min-h-screen font-sans transition-colors duration-300 flex flex-col items-center justify-center p-6 text-center border-t-4 ${
        isDark 
          ? 'bg-gradient-to-br from-gray-900 to-gray-800 border-orange-600' 
          : 'bg-gradient-to-br from-orange-50 to-white border-orange-500'
      }`}
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 shadow-lg ${isDark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
        <GiLotusFlower size={24} />
      </div>

      <span className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        Bhajan of the Day
      </span>

      <h2 className={`text-2xl font-black mb-1 leading-tight line-clamp-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        {displayTitle}
      </h2>
      
      {deityName && (
        <p className={`text-sm font-medium mb-6 ${isDark ? 'text-orange-400' : 'text-orange-600'}`}>
          Dedicated to {deityName}
        </p>
      )}

      <a 
        href={bhajanUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className={`px-6 py-2.5 rounded-full font-bold text-sm transition-transform hover:scale-105 active:scale-95 shadow-md ${
          isDark 
            ? 'bg-orange-600 text-white hover:bg-orange-500' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-orange-500/30'
        }`}
      >
        Read Full Lyrics
      </a>
    </div>
  );
}