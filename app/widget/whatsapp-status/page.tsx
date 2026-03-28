import { supabase } from '@/utils/supabase'; // 🌟 Added Supabase import
import { FaWhatsapp } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

// Revalidate every 60 seconds so users get a fresh quote frequently, 
// without crashing your database with every single page view!
export const revalidate = 60;

export default async function WhatsAppStatusWidget({
  searchParams,
}: {
  searchParams: Promise<{ theme?: string; lang?: string }>;
}) {
  const resolvedParams = await searchParams;
  const theme = resolvedParams.theme || 'light';
  const lang = resolvedParams.lang || 'hindi';
  const isDark = theme === 'dark';
  const isHinglish = lang === 'hinglish';

  // 1. Fetch a pool of bhajans that actually have lyrics
  const { data: bhajans } = await supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, lyrics_hindi, lyrics_hinglish')
    .not('lyrics_hindi', 'is', null)
    .limit(50); // Fetch 50 to give us a good pool to pick from

  // 2. Fallback if database fails
  if (!bhajans || bhajans.length === 0) {
    return <div className="p-4 text-center">Loading Devotion...</div>;
  }

  // 3. Pick a random bhajan from the pool
  const randomBhajan = bhajans[Math.floor(Math.random() * bhajans.length)];

  // 4. Get the correct language lyrics
  const rawLyrics = isHinglish 
    ? (randomBhajan.lyrics_hinglish || randomBhajan.lyrics_hindi) 
    : randomBhajan.lyrics_hindi;

  // 5. Split into lines, clean up whitespace, and remove empty lines
  // 5. Split into lines, clean up whitespace, and remove empty lines
  const lines = String(rawLyrics || "")
    .split(/\r?\n/)
    .map((line: string) => line.trim())
    .filter((line: string) => line.length > 5); // Ignore super short lines like "॥ 1 ॥"

  // 6. Pick two consecutive lines randomly
  let displayQuote = "Devotion loads here...";
  if (lines.length >= 2) {
    // Pick a random starting line (ensuring there's room for line + 1)
    const randomIndex = Math.floor(Math.random() * (lines.length - 1));
    displayQuote = `${lines[randomIndex]}\n${lines[randomIndex + 1]}`;
  } else if (lines.length === 1) {
    displayQuote = lines[0]; // Fallback if it's only 1 line long
  }

  // 7. Setup the Source and URL
  const source = isHinglish ? randomBhajan.title_hinglish : randomBhajan.title_hindi;
  const url = `https://www.hindibhajanmanjari.com/bhajan/${randomBhajan.slug}`;

  // 🌟 THE VIRAL PAYLOAD
  const shareText = encodeURIComponent(
    `🙏 *Daily Devotion* 🙏\n\n"${displayQuote}"\n\n— ${source}\n\nRead the full lyrics and meaning here: ${url}`
  );
  const shareUrl = `https://api.whatsapp.com/send?text=${shareText}`;

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300 text-center ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-orange-100'} border-4 rounded-2xl`}>
      
      <div className={`mb-4 ${isDark ? 'text-orange-500' : 'text-orange-600'}`}>
        <GiLotusFlower size={24} />
      </div>

      <div className="relative mb-6 px-4">
        <span className={`absolute -top-4 -left-2 text-4xl opacity-20 font-serif ${isDark ? 'text-gray-500' : 'text-orange-600'}`}>"</span>
        <h3 className={`text-lg md:text-xl font-bold leading-relaxed whitespace-pre-wrap ${isDark ? 'text-gray-200' : 'text-gray-800'}`}>
          {displayQuote}
        </h3>
        <span className={`absolute -bottom-6 -right-2 text-4xl opacity-20 font-serif ${isDark ? 'text-gray-500' : 'text-orange-600'}`}>"</span>
      </div>

      <p className={`text-xs font-bold uppercase tracking-widest mb-8 ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        — {source}
      </p>

      {/* 🌟 THE WHATSAPP SHARE BUTTON */}
      <a 
        href={shareUrl}
        target="_blank" 
        rel="noopener noreferrer"
        className="w-full max-w-[240px] flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#1ebe5e] active:bg-[#18a852] text-white py-3 px-4 rounded-xl font-bold text-sm shadow-lg shadow-[#25D366]/30 transition-all hover:-translate-y-0.5"
      >
        <FaWhatsapp size={18} />
        Share to WhatsApp
      </a>

      <p className={`mt-4 text-[10px] ${isDark ? 'text-gray-600' : 'text-gray-500'}`}>
        Click to share with family & friends
      </p>
    </div>
  );
}