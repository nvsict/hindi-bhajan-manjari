import Link from 'next/link';
import { supabase } from '@/utils/supabase'; // Ensure this path is correct
import { FaFire, FaPrayingHands, FaWhatsapp, FaChevronRight, FaMusic, FaEye, FaStar } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

export default async function Sidebar() {
  // 1. Fetch Trending Bhajans (Top 5 based on view_count)
  const { data: trendingBhajans } = await supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, view_count')
    .order('view_count', { ascending: false })
    .limit(5);

  // 2. Fetch Deities for the Browse section (Limit to 6 for a perfect 2x3 grid)
  const { data: deities } = await supabase
    .from('deities')
    .select('name_hinglish, name_hindi, slug')
    .order('name_hinglish', { ascending: true })
    .limit(6);

  // Hardcoded main categories for high-speed rendering
  const quickCategories = [
    { name: "Bhajan", slug: "bhajan", color: "from-orange-400 to-orange-500" },
    { name: "Aarti", slug: "aarti", color: "from-amber-400 to-amber-500" },
    { name: "Chalisa", slug: "chalisa", color: "from-red-400 to-red-500" },
    { name: "Pad", slug: "pad", color: "from-rose-400 to-rose-500" },
    { name: "Stotram", slug: "stotram", color: "from-yellow-500 to-orange-500" },
  ];

  return (
    // 🌟 STICKY BEHAVIOR: Slides down beautifully as the user reads long lyrics
    <aside className="w-full lg:w-[340px] shrink-0 space-y-8 lg:sticky lg:top-28 h-fit pb-10">
      
      {/* --- SECTION 1: TOP TRENDING (The Chart) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden group">
        {/* Decorative glowing orb in the background */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-orange-400/10 rounded-full blur-3xl group-hover:bg-orange-500/20 transition-colors duration-700"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            {/* 🌟 FIX: Updated to tracking-tighter */}
            <h3 className="text-xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
              <span className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
                <FaFire size={20} />
              </span>
              Top Trending
            </h3>
          </div>

          <div className="space-y-2">
            {trendingBhajans?.map((bhajan, index) => (
              <Link 
                key={bhajan.slug} 
                href={`/bhajan/${bhajan.slug}`}
                className="group/item flex items-center gap-4 p-3 -mx-2 rounded-2xl hover:bg-white hover:shadow-md border border-transparent hover:border-orange-50 transition-all duration-300"
              >
                {/* Number Badge with conditional coloring for #1 */}
                <div className={`w-10 h-10 rounded-full text-base font-black flex items-center justify-center shrink-0 shadow-sm transition-transform duration-300 group-hover/item:scale-110 ${
                  index === 0 ? 'bg-gradient-to-br from-orange-400 to-amber-500 text-white' : 'bg-gray-50 text-gray-400 group-hover/item:text-orange-500'
                }`}>
                  {index === 0 ? <FaStar size={14} /> : index + 1}
                </div>
                
                {/* Bhajan Info with slight right slide on hover */}
                <div className="flex-1 min-w-0 transition-transform duration-300 group-hover/item:translate-x-1">
                  {/* 🌟 FIX: Injected font-hindi, increased size to text-lg, added leading-tight */}
                  <h4 className="font-black font-hindi text-gray-800 text-lg group-hover/item:text-orange-600 transition-colors line-clamp-1 leading-tight mb-1">
                    {bhajan.title_hindi}
                  </h4>
                  <div className="flex items-center gap-2">
                    {/* 🌟 FIX: Changed Hinglish to uppercase tracking-widest text-[10px] */}
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold line-clamp-1">
                      {bhajan.title_hinglish}
                    </p>
                    {bhajan.view_count > 0 && (
                      <>
                        <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                        <span className="flex items-center gap-1 text-[10px] text-orange-400/80 font-bold uppercase tracking-wider shrink-0">
                          <FaEye size={10} />
                          {bhajan.view_count.toLocaleString()}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- SECTION 2: DIVINE CATEGORIES (Floating Badges) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* 🌟 FIX: Updated to tracking-tighter */}
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tighter">
          <span className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner">
            <FaMusic size={18} />
          </span>
          Categories
        </h3>
        <div className="flex flex-wrap gap-3">
          {quickCategories.map((cat) => (
            <Link 
              key={cat.slug} 
              href={`/category/${cat.slug}`}
              className="group relative px-5 py-2.5 rounded-xl bg-gray-50 overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 border border-transparent hover:border-orange-100"
            >
              {/* Subtle hover gradient wash */}
              <div className={`absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-10 transition-opacity duration-300 ${cat.color}`}></div>
              <span className="relative z-10 text-sm font-bold text-gray-600 group-hover:text-gray-900">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* --- SECTION 3: BROWSE BY DEITY (Sleek Grid) --- */}
      <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 sm:p-7 border border-orange-100/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {/* 🌟 FIX: Updated to tracking-tighter */}
        <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-3 tracking-tighter">
          <span className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center text-red-500 shadow-inner">
            <FaPrayingHands size={20} />
          </span>
          By Deity
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {deities?.map((deity) => (
            <Link 
              key={deity.slug} 
              href={`/deity/${deity.slug}`}
              className="group flex flex-col items-center text-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100/80 hover:bg-orange-50 hover:border-orange-200 transition-all duration-300 hover:shadow-sm"
            >
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-orange-400 group-hover:text-orange-500 group-hover:scale-110 shadow-sm transition-transform duration-300">
                <GiLotusFlower size={24} />
              </div>
              <span className="font-bold text-gray-800 text-sm group-hover:text-orange-700 line-clamp-1">
                {deity.name_hinglish}
              </span>
            </Link>
          ))}
        </div>
        
        <Link 
          href="/deity" 
          className="group flex items-center justify-center gap-2 w-full mt-5 py-4 rounded-xl bg-transparent text-xs font-black uppercase tracking-widest text-gray-400 hover:bg-gray-50 hover:text-orange-600 transition-all duration-300"
        >
          Explore All
          <FaChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* --- SECTION 4: PREMIUM COMMUNITY BANNER --- */}
      <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#128C7E] to-[#075E54] p-8 text-white shadow-xl shadow-[#128C7E]/20 group">
        {/* Background ambient WhatsApp Icon */}
        <FaWhatsapp className="absolute -bottom-8 -right-8 text-9xl text-white opacity-5 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-700 ease-out" />
        
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-5 border border-white/30 shadow-inner">
            <FaWhatsapp size={32} className="text-white drop-shadow-md" />
          </div>
          {/* 🌟 FIX: Updated to tracking-tighter */}
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