import Link from 'next/link';
import { FaMusic, FaArrowRight, FaSearch } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';
import { supabase } from '@/utils/supabase';

// 🌟 Fetch the Top 3 Bhajans by view count dynamically
async function getTopBhajans() {
  const { data } = await supabase
    .from('bhajans')
    .select('title_hinglish, title_hindi, slug, view_count')
    .order('view_count', { ascending: false })
    .limit(3);
  return data || [];
}

export default async function NotFound() {
  const topBhajans = await getTopBhajans();

  return (
    <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* --- Decorative Background Glows --- */}
      <div className="absolute top-0 left-1/2 w-[600px] h-[600px] bg-orange-500/10 rounded-full blur-3xl pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      
      {/* --- Main 404 Card --- */}
      <div className="max-w-3xl w-full relative z-10 mt-10">
        
        {/* Header Section */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-50 rounded-full mb-6 shadow-inner border border-orange-100 relative">
            <div className="absolute inset-0 bg-orange-200 rounded-full animate-ping opacity-30"></div>
            <GiLotusFlower className="text-4xl text-orange-500 relative z-10" />
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4 leading-tight">
            The page is missing,<br/> but the <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Devotion remains.</span>
          </h1>
          
          <p className="text-gray-500 font-medium text-lg max-w-lg mx-auto leading-relaxed mb-8">
            We couldn't find the exact link you clicked. Search for it below, or read one of our most popular Bhajans today.
          </p>

          {/* 🌟 THE DIRECT SEARCH BAR */}
          <form action="/search" method="GET" className="max-w-lg mx-auto relative group mb-12">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <FaSearch className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
            </div>
            <input 
              type="text" 
              name="q" // This passes the query to your /search page like: /search?q=hanuman
              placeholder="Search for any Bhajan, Aarti, or Deity..." 
              className="w-full bg-white border-2 border-gray-100 rounded-2xl pl-12 pr-4 py-5 font-bold text-gray-900 focus:outline-none focus:border-orange-400 focus:ring-4 focus:ring-orange-500/10 transition-all shadow-sm text-lg"
              autoComplete="off"
            />
            <button type="submit" className="absolute inset-y-2 right-2 bg-orange-600 hover:bg-orange-500 text-white px-6 rounded-xl font-bold transition-colors">
              Search
            </button>
          </form>
        </div>

        {/* --- DYNAMIC TOP BHAJANS GRID --- */}
        {topBhajans.length > 0 && (
          <div className="mb-10">
            <div className="text-center mb-6">
              <span className="bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-orange-100">
                Trending Right Now
              </span>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {topBhajans.map((bhajan, index) => {
                // Assign a different emoji/color to top 3
                const styles = [
                  { emoji: "🙏", bg: "bg-orange-50 text-orange-600", border: "border-orange-100", shadow: "hover:shadow-orange-900/5" },
                  { emoji: "🔱", bg: "bg-gray-50 text-gray-600", border: "border-gray-100", shadow: "hover:shadow-gray-900/5" },
                  { emoji: "🦚", bg: "bg-blue-50 text-blue-600", border: "border-blue-50", shadow: "hover:shadow-blue-900/5" },
                ];
                const style = styles[index % 3];

                return (
                  <Link 
                    key={bhajan.slug}
                    href={`/bhajan/${bhajan.slug}`} 
                    className={`bg-white p-6 rounded-[2rem] border ${style.border} shadow-sm hover:shadow-xl ${style.shadow} hover:-translate-y-1 transition-all group text-center flex flex-col justify-between`}
                  >
                    <div>
                      <div className={`w-12 h-12 ${style.bg} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform`}>
                        {style.emoji}
                      </div>
                      <h3 className="font-black text-gray-900 mb-1 leading-tight line-clamp-2">
                        {bhajan.title_hinglish}
                      </h3>
                      <h4 className="font-hindi text-orange-600 font-bold mb-3 line-clamp-1">
                        {bhajan.title_hindi}
                      </h4>
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
                      Read Now &rarr;
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* --- The Fallback Action Button --- */}
        <div className="flex flex-col items-center justify-center">
          <Link href="/category" className="text-sm font-bold text-gray-400 hover:text-orange-600 transition-colors uppercase tracking-widest border-b border-transparent hover:border-orange-600 pb-1">
            Browse By Category Instead
          </Link>
        </div>

      </div>
    </div>
  );
}