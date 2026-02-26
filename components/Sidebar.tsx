import Link from 'next/link';
import { supabase } from '../utils/supabase';
import { FaFire, FaPrayingHands, FaWhatsapp, FaChevronRight } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

export default async function Sidebar() {
  // 1. Fetch Trending Bhajans (Top 5 based on view_count)
  const { data: trendingBhajans } = await supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, view_count')
    .order('view_count', { ascending: false })
    .limit(5);

  // 2. Fetch Deities for the Browse section
  const { data: deities } = await supabase
    .from('deities')
    .select('name_hinglish, name_hindi, slug')
    .order('name_hinglish', { ascending: true })
    .limit(8);

  return (
    <aside className="w-full lg:w-80 shrink-0 space-y-8">
      
      {/* --- Section 1: Trending Bhajans --- */}
      <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm relative overflow-hidden">
        {/* Decorative background element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-bl-full -z-0 opacity-50"></div>
        
        <div className="relative z-10">
          <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2">
            <FaFire className="text-orange-500" /> 
            Trending <span className="text-orange-600">Now</span>
          </h3>

          <div className="space-y-4">
            {trendingBhajans?.map((bhajan, index) => (
              <Link 
                key={bhajan.slug} 
                href={`/bhajan/${bhajan.slug}`}
                className="group flex items-start gap-3 p-2 -mx-2 rounded-xl hover:bg-orange-50 transition-colors"
              >
                {/* Number Badge */}
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                  {index + 1}
                </div>
                
                {/* Bhajan Info */}
                <div>
                  <h4 className="font-bold text-gray-800 group-hover:text-orange-600 transition-colors line-clamp-1">
                    {bhajan.title_hindi}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {bhajan.title_hinglish}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* --- Section 2: Browse by Deity --- */}
      <div className="bg-white rounded-3xl p-6 border border-orange-100 shadow-sm">
        <h3 className="text-xl font-black text-gray-900 mb-5 flex items-center gap-2">
          <FaPrayingHands className="text-orange-500" /> 
          Browse by <span className="text-orange-600">Deity</span>
        </h3>

        <div className="flex flex-col gap-2">
          {deities?.map((deity) => (
            <Link 
              key={deity.slug} 
              href={`/deity/${deity.slug}`}
              className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-orange-200 hover:bg-orange-50 transition-all"
            >
              <div className="flex items-center gap-3">
                <div className="text-orange-400 group-hover:text-orange-600 transition-colors">
                  <GiLotusFlower size={18} />
                </div>
                <span className="font-bold text-gray-700 group-hover:text-gray-900">
                  {deity.name_hinglish}
                </span>
              </div>
              <FaChevronRight className="text-gray-300 group-hover:text-orange-500 text-sm transition-colors" />
            </Link>
          ))}
        </div>
        
        <Link 
  href="/deity" 
  className="block w-full text-center mt-4 text-sm font-bold text-orange-600 hover:text-orange-700 hover:underline transition-colors"
>
  View All Deities &rarr;
</Link>
      </div>

      {/* --- Section 3: WhatsApp Community Banner --- */}
      <div className="bg-gradient-to-br from-[#25D366] to-[#128C7E] rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
        <FaWhatsapp className="absolute -bottom-4 -right-4 text-8xl text-white opacity-20" />
        <div className="relative z-10">
          <h3 className="text-xl font-black mb-2">Join Our Community</h3>
          <p className="text-green-50 text-sm font-medium mb-5">
            Get new daily Bhajans, Aartis, and festival updates directly on WhatsApp.
          </p>
          <a 
            href="https://whatsapp.com/channel/0029VbBxMM7Ae5VutiItov27"
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full text-center bg-white text-[#128C7E] font-black py-3 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all"
          >
            Join Free Group
          </a>
        </div>
      </div>

    </aside>
  );
}