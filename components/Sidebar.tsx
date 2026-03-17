import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { FaFire, FaWhatsapp, FaEye, FaStar, FaChevronRight, FaBookOpen } from 'react-icons/fa';
import { FaWandSparkles } from 'react-icons/fa6';

// 🌟 THE UPGRADE: The Sidebar now accepts context so it knows exactly where it is being rendered.
interface SidebarProps {
  topicName?: string;           // e.g., "Hanuman" or "Aarti"
  filterColumn?: string;        // e.g., "deity_id" or "category_slug"
  filterValue?: string | number;// e.g., "shri-hanuman" or 3
  currentBhajanSlug?: string;   // e.g., "hanuman-chalisa" (To prevent linking to the current page)
}

export default async function Sidebar({ 
  topicName, 
  filterColumn, 
  filterValue, 
  currentBhajanSlug 
}: SidebarProps = {}) { // Default to empty object for global pages (like Home)

  // 1. Build the Dynamic Queries
  let trendingQuery = supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, view_count')
    .order('view_count', { ascending: false })
    .limit(5);

  let latestQuery = supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug')
    .order('created_at', { ascending: false })
    .limit(4);

  // 2. Apply Context Filters (If we are on a specific deity/category page)
  if (filterColumn && filterValue) {
    trendingQuery = trendingQuery.eq(filterColumn, filterValue);
    latestQuery = latestQuery.eq(filterColumn, filterValue);
  }

  // 3. Exclude the current page (Never show a link to the page the user is already reading)
  if (currentBhajanSlug) {
    trendingQuery = trendingQuery.neq('slug', currentBhajanSlug);
    latestQuery = latestQuery.neq('slug', currentBhajanSlug);
  }

  // 4. Execute all queries simultaneously for zero-waterfall performance
  const [
    { data: trendingBhajans },
    { data: latestBhajans },
    { data: latestArticle }
  ] = await Promise.all([
    trendingQuery,
    latestQuery,
    supabase
      .from('articles')
      .select('title, excerpt, slug')
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(1)
      .single()
  ]);

  // Dynamic UI Strings
  const trendingTitle = topicName ? `Trending ${topicName}` : 'Top Trending';
  const latestTitle = topicName ? `New ${topicName}` : 'New Additions';

  return (
    <aside className="w-full lg:w-[340px] shrink-0 space-y-6 lg:sticky lg:top-28 h-fit pb-10">
      
      {/* --- SECTION 1: TOP TRENDING --- */}
      {trendingBhajans && trendingBhajans.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
                <span className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                  <FaFire size={20} />
                </span>
                {trendingTitle}
              </h3>
            </div>

            <div className="space-y-2">
              {trendingBhajans.map((bhajan, index) => (
                <Link 
                  key={bhajan.slug} 
                  href={`/bhajan/${bhajan.slug}`}
                  className="group/item flex items-center gap-4 p-3 -mx-2 rounded-2xl hover:bg-white hover:shadow-md border border-transparent hover:border-orange-50 transition-all duration-300"
                >
                  <div className={`w-10 h-10 rounded-full text-base font-black flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover/item:scale-110 ${
                    index === 0 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' : 'bg-gray-50 text-gray-400 group-hover/item:text-orange-500'
                  }`}>
                    {index === 0 ? <FaStar size={14} /> : index + 1}
                  </div>
                  
                  <div className="flex-1 min-w-0 transition-transform duration-300 group-hover/item:translate-x-1">
                    <h4 className="font-black font-hindi text-gray-800 text-lg group-hover/item:text-orange-600 transition-colors line-clamp-1 leading-tight mb-1">
                      {bhajan.title_hindi}
                    </h4>
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold line-clamp-1">
                        {bhajan.title_hinglish}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SECTION 2: NEW ARRIVALS --- */}
      {latestBhajans && latestBhajans.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tighter">
            <span className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500 shadow-inner">
              <FaWandSparkles size={18} />
            </span>
            {latestTitle}
          </h3>
          <div className="space-y-4">
            {latestBhajans.map((bhajan) => (
              <Link 
                key={bhajan.slug} 
                href={`/bhajan/${bhajan.slug}`}
                className="group flex flex-col gap-1 border-b border-gray-100 last:border-0 pb-4 last:pb-0"
              >
                <h4 className="font-black font-hindi text-gray-800 text-[17px] group-hover:text-blue-600 transition-colors line-clamp-1">
                  {bhajan.title_hindi}
                </h4>
                <p className="text-[11px] text-gray-500 uppercase tracking-wider font-bold line-clamp-1">
                  {bhajan.title_hinglish}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 3: SPIRITUAL WISDOM --- */}
      {latestArticle && (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-[2rem] p-6 sm:p-7 border border-orange-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.02)]">
          <h3 className="text-sm font-black text-orange-600 mb-4 flex items-center gap-2 uppercase tracking-widest">
            <FaBookOpen size={14} /> Sanatan Gyan
          </h3>
          <Link href={`/gyan/${latestArticle.slug}`} className="group block">
            <h4 className="text-xl font-black text-gray-900 leading-tight mb-2 group-hover:text-orange-700 transition-colors">
              {latestArticle.title}
            </h4>
            <p className="text-sm text-gray-600 font-medium line-clamp-3 mb-4 leading-relaxed">
              {latestArticle.excerpt || "Dive deep into the spiritual meanings and stories behind our sacred texts..."}
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-orange-600 group-hover:translate-x-1 transition-transform">
              Read Article <FaChevronRight size={10} />
            </span>
          </Link>
        </div>
      )}

      {/* --- SECTION 4: PREMIUM COMMUNITY BANNER --- */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#128C7E] to-[#075E54] p-8 text-white shadow-xl shadow-[#128C7E]/20 group">
        <FaWhatsapp className="absolute -bottom-8 -right-8 text-9xl text-white opacity-5 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700 ease-out" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-5 border border-white/30 shadow-inner">
            <FaWhatsapp size={32} className="text-white drop-shadow-md" />
          </div>
          <h3 className="text-2xl font-black mb-3 tracking-tighter text-white drop-shadow-sm">Join the Mandali</h3>
          <p className="text-green-50/90 text-sm font-medium mb-7 leading-relaxed px-2">
            Get daily Bhajans, festive Aartis, and spiritual updates sent directly to you.
          </p>
          <a 
            href="https://whatsapp.com/channel/0029VbBxMM7Ae5VutiItov27"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full bg-white text-[#075E54] font-black text-base py-4 rounded-xl shadow-[0_4px_14px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:-translate-y-0.5 active:scale-95 transition-all duration-300"
          >
            Join Free Channel
          </a>
        </div>
      </div>

    </aside>
  );
}