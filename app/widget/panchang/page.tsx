import { supabase } from '@/utils/supabase';
import { FaCalendarAlt } from 'react-icons/fa';

// Revalidate every 1 hour so the day rolls over correctly at midnight
export const revalidate = 3600;

export default async function PanchangWidget({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; lang?: string }>;
}) {
  const resolvedParams = await searchParams;
  const theme = resolvedParams.theme || 'light';
  const lang = resolvedParams.lang || 'hindi';
  const isDark = theme === 'dark';

  // 1. Calculate current day in IST
  const options: Intl.DateTimeFormatOptions = { weekday: 'long', timeZone: 'Asia/Kolkata' };
  const currentDay = new Intl.DateTimeFormat('en-US', options).format(new Date());

  // 2. Map the day to its ruling Deity and a search keyword
  const dayMappings: Record<string, { hindi: string, deity: string, keyword: string }> = {
    'Monday': { hindi: 'सोमवार', deity: 'Lord Shiva', keyword: '%Shiv%' },
    'Tuesday': { hindi: 'मंगलवार', deity: 'Lord Hanuman', keyword: '%Hanuman%' },
    'Wednesday': { hindi: 'बुधवार', deity: 'Lord Ganesha', keyword: '%Ganesh%' },
    'Thursday': { hindi: 'गुरुवार', deity: 'Lord Vishnu / Sai Baba', keyword: '%Ram%' },
    'Friday': { hindi: 'शुक्रवार', deity: 'Goddess Durga / Laxmi', keyword: '%Mata%' },
    'Saturday': { hindi: 'शनिवार', deity: 'Lord Shani / Hanuman', keyword: '%Hanuman%' },
    'Sunday': { hindi: 'रविवार', deity: 'Lord Surya / Krishna', keyword: '%Krishna%' },
  };

  const todayInfo = dayMappings[currentDay] || dayMappings['Monday'];

  // 3. Fetch a Bhajan matching today's Deity
  const { data: bhajans } = await supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug')
    .ilike('title_hinglish', todayInfo.keyword)
    .limit(5);

  // Pick a random one from the results, or fallback to a default if the keyword fails
  const bhajan = bhajans && bhajans.length > 0 
    ? bhajans[Math.floor(Math.random() * bhajans.length)] 
    : { title_hindi: 'श्री हनुमान चालीसा', title_hinglish: 'Shri Hanuman Chalisa', slug: 'hanuman-chalisa' };

  const displayTitle = lang === 'hinglish' ? bhajan.title_hinglish : bhajan.title_hindi;
  
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const bhajanUrl = `${baseUrl}/bhajan/${bhajan.slug}`;

  return (
    <div className={`min-h-screen flex flex-col p-5 font-sans transition-colors duration-300 border-t-4 rounded-xl ${
      isDark 
        ? 'bg-gray-900 border-orange-600 text-gray-200' 
        : 'bg-gradient-to-br from-orange-50/50 to-white border-orange-500 text-gray-800'
    }`}>
      
      {/* 🌟 HEADER: The Calendar Tear-off */}
      <div className="flex items-center gap-3 mb-4 border-b pb-4 border-opacity-20 border-gray-400">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm ${isDark ? 'bg-orange-900/40 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
          <FaCalendarAlt size={18} />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest opacity-80">
            Today's Panchang
          </h2>
          <p className={`text-lg font-black leading-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            {currentDay} <span className="opacity-50 font-normal">({todayInfo.hindi})</span>
          </p>
        </div>
      </div>

      {/* 🌟 BODY: The Suggestion */}
      <div className="flex-1">
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-500 mb-1">
          Dedicated to {todayInfo.deity}
        </p>
        <h3 className={`text-xl font-bold mb-2 line-clamp-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
          {displayTitle}
        </h3>
        <p className={`text-sm mb-4 line-clamp-2 ${isDark ? 'text-gray-500' : 'text-gray-600'}`}>
          Start your {currentDay} with auspicious blessings. Read the full lyrics and meaning.
        </p>
      </div>

      {/* 🌟 FOOTER: The CTA */}
      <a 
        href={bhajanUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className={`w-full text-center py-2.5 rounded-lg font-bold text-sm transition-transform hover:scale-[1.02] active:scale-[0.98] ${
          isDark 
            ? 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/20' 
            : 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/20'
        }`}
      >
        Read Today's Devotion
      </a>

    </div>
  );
}