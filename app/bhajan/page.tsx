import { createClient } from '@supabase/supabase-js';
import Sidebar from '../../components/Sidebar';
import Link from 'next/link';
import { Metadata } from 'next';
import { FaSortAlphaDown, FaMusic, FaBookOpen, FaChevronRight } from 'react-icons/fa';
import { GiTempleGate } from 'react-icons/gi';

// 🌟 Cache setting for VPS (Updates every 1 hour)
export const revalidate = 3600; 

// ==========================================
// 🌟 1. ADVANCED SEO METADATA
// ==========================================
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

export const metadata: Metadata = {
  title: 'A to Z Bhajan Lyrics Directory | Hindi Bhajan Manjari',
  description: 'Browse our complete A to Z directory of authentic Hindu devotional songs. Find lyrics, meanings, and PDFs of your favorite Bhajans, Aartis, and Chalisa by alphabetical order.',
  keywords: 'A to Z Bhajan, Bhajan Directory, All Bhajans List, Hindi Bhajan Lyrics, Devotional Songs A-Z, Aarti Sangrah, Chalisa Collection',
  alternates: {
    canonical: `${siteUrl}/bhajans`,
  },
  openGraph: {
    title: 'A to Z Bhajan Directory - Ultimate Collection',
    description: 'Explore the complete alphabetical collection of authentic Sanatan Dharma Bhajans and Aartis.',
    url: `${siteUrl}/bhajans`,
    type: 'website',
  },
};

// ==========================================
// 🌟 2. MAIN PAGE COMPONENT
// ==========================================
export default async function AToZBhajansPage() {
  // 🌟 FIX 1: Create a stateless, pure server client for static generation.
  // Do NOT use the browser client here as it can deadlock parallel build workers.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { persistSession: false } // Crucial for build performance
    }
  );

  let bhajans: any[] = [];

  try {
    // 🌟 FIX 2: Added AbortSignal to prevent the 10s Cloudflare timeout from crashing the build.
    // If it takes more than 8 seconds, it aborts cleanly and logs a warning.
    const { data: allBhajans, error } = await supabaseAdmin
      .from('bhajans')
      .select('id, title_hinglish, title_hindi, slug, view_count')
      .order('title_hinglish', { ascending: true })
      .abortSignal(AbortSignal.timeout(8000));

    if (error) throw error;
    bhajans = allBhajans || [];

  } catch (error: any) {
    // 🌟 FIX 3: Graceful Fallback. We don't throw the error, we just log it.
    // This allows `npm run build` to finish successfully with an empty state.
    // The `revalidate = 3600` will fetch the actual data in the background once deployed!
    console.warn("⚠️ Build-Time Fetch Warning (Likely Cloudflare Rate Limit):", error.message);
  }

  // 2. Group Bhajans by First Letter
  const groupedBhajans = bhajans.reduce((acc: any, bhajan) => {
    let firstLetter = bhajan.title_hinglish.charAt(0).toUpperCase();
    if (!/[A-Z]/.test(firstLetter)) {
      firstLetter = '#';
    }
    
    if (!acc[firstLetter]) acc[firstLetter] = [];
    acc[firstLetter].push(bhajan);
    return acc;
  }, {});

  // 3. Generate Alphabet Array (A-Z + #)
  const alphabets = ['#', ...Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i))];
  const availableLetters = Object.keys(groupedBhajans);

  // 4. Schema Generation for Directory
  const graphNodes = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "A to Z Bhajan Directory",
    "description": "Complete alphabetical index of all bhajans on Hindi Bhajan Manjari.",
    "url": `${siteUrl}/bhajans`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": bhajans.map((bhajan, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${siteUrl}/bhajan/${bhajan.slug}`,
        "name": bhajan.title_hindi
      }))
    }
  };

  return (
    <div className="min-h-screen bg-[#f9fafb] selection:bg-orange-100 selection:text-orange-900 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graphNodes) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12 flex flex-col lg:flex-row gap-8 lg:gap-12 items-start">
        
        <main className="flex-1 w-full min-w-0">
          
          {/* ==========================================
              🚀 HERO HEADER
              ========================================== */}
          <div className="mb-6 md:mb-8 p-8 md:p-12 bg-white rounded-[2.5rem] border border-orange-100 shadow-[0_20px_60px_-15px_rgba(234,88,12,0.1)] relative overflow-hidden">
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-red-400/10 blur-[80px] rounded-full pointer-events-none"></div>
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-yellow-400/20 to-orange-500/10 blur-[80px] rounded-full pointer-events-none"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-orange-200 shadow-inner">
                <FaSortAlphaDown className="text-3xl md:text-4xl" />
              </div>
              <div>
                <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 tracking-tighter">
                  A to Z <span className="text-orange-600">Directory</span>
                </h1>
                <p className="text-gray-600 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                  हमारी संपूर्ण डिजिटल लाइब्रेरी। अपने पसंदीदा पाठ को खोजने के लिए नीचे दिए गए अक्षरों का उपयोग करें।
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs md:text-sm font-bold text-gray-500 uppercase tracking-widest">
                  <span className="flex items-center gap-1.5"><FaMusic className="text-orange-400"/> {bhajans.length} Bhajans</span>
                  <span>&bull;</span>
                  <span className="flex items-center gap-1.5"><FaBookOpen className="text-orange-400"/> Verified</span>
                </div>
              </div>
            </div>
          </div>

          {/* ==========================================
              🔤 ALPHABET BAR 
              ========================================== */}
          <div className="relative bg-[#f9fafb] pb-6 md:pb-8 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
            <div className="bg-white/95 px-4 py-3 md:p-5 rounded-2xl md:rounded-[2rem] border border-orange-100 shadow-[0_4px_20px_-10px_rgba(234,88,12,0.1)] transition-all">
              <div className="flex items-center md:flex-wrap md:justify-center gap-2 overflow-x-auto md:overflow-visible pb-1 md:pb-0 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                {alphabets.map((letter) => {
                  const isAvailable = availableLetters.includes(letter);
                  return isAvailable ? (
                    <a 
                      key={letter} 
                      href={`#letter-${letter}`}
                      className="shrink-0 w-10 h-10 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-700 font-black text-[15px] border border-gray-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 hover:-translate-y-0.5 transition-all shadow-sm hover:shadow-[0_4px_10px_rgba(234,88,12,0.3)] active:scale-95"
                    >
                      {letter}
                    </a>
                  ) : (
                    <span 
                      key={letter} 
                      className="shrink-0 w-10 h-10 md:w-10 md:h-10 flex items-center justify-center rounded-xl bg-gray-50/30 text-gray-300 font-bold text-[15px] border border-gray-100/50 cursor-not-allowed select-none"
                      title={`No bhajans starting with ${letter}`}
                    >
                      {letter}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ==========================================
              📂 GROUPED LISTINGS
              ========================================== */}
          {availableLetters.length > 0 ? (
            <div className="space-y-12 md:space-y-16">
              {availableLetters.sort().map((letter) => (
                <section 
                  key={letter} 
                  id={`letter-${letter}`} 
                  className="scroll-mt-[100px] md:scroll-mt-[120px]" 
                >
                  
                  {/* Letter Header */}
                  <div className="flex items-end gap-4 border-b border-gray-200 pb-2 mb-5 md:mb-6 px-2 md:px-0">
                    <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-orange-400 to-orange-600 drop-shadow-sm leading-none">
                      {letter}
                    </h2>
                    <span className="text-gray-500 font-bold uppercase tracking-widest text-[11px] md:text-xs mb-1.5">
                      {groupedBhajans[letter].length} Records
                    </span>
                  </div>

                  {/* Cards Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                    {groupedBhajans[letter].map((bhajan: any) => (
                      <Link 
                        key={bhajan.slug} 
                        href={`/bhajan/${bhajan.slug}`}
                        className="group flex items-center gap-4 bg-white p-3 md:p-4 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-md transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                      >
                        <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-sm">
                          <GiTempleGate size={24} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-[15px] md:text-[17px] font-black text-gray-900 font-hindi leading-tight mb-1 group-hover:text-orange-600 transition-colors truncate">
                            {bhajan.title_hindi}
                          </h3>
                          <p className="text-[10px] md:text-xs text-gray-500 font-bold uppercase tracking-wider truncate">
                            {bhajan.title_hinglish}
                          </p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors shrink-0">
                          <FaChevronRight size={12} className="group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </Link>
                    ))}
                  </div>

                </section>
              ))}
            </div>
          ) : (
            // Empty State Fallback (Shows during build if Cloudflare blocks)
            <div className="bg-white p-12 md:p-24 rounded-[2.5rem] border border-dashed border-gray-300 text-center shadow-sm mt-8">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaMusic size={24} className="md:text-3xl opacity-50" />
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Syncing Database...</h3>
              <p className="text-sm md:text-base text-gray-500 max-w-sm mx-auto">
                The library is currently generating. Please refresh the page in a few moments to see the complete A-Z list!
              </p>
            </div>
          )}

        </main>

        {/* ==========================================
            🖥️ INTELLIGENT SIDEBAR
            ========================================== */}
        <div className="hidden lg:block lg:sticky lg:top-28 h-fit w-[340px] shrink-0">
          <Sidebar />
        </div>

      </div>
    </div>
  );
}