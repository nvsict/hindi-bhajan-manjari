import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/utils/supabase';
import ScrollReveal from './ScrollReveal';

export const revalidate = 3600; // Refreshes the cache every hour

export default async function DeityBrowse() {
  // 🌟 STEP 1: Fetch the most recently added/updated Bhajans (to find trending deities)
  const { data: recentBhajans } = await supabase
    .from('bhajans')
    .select(`
      deities (
        id,
        name_hinglish,
        slug,
        image_url
      )
    `)
    .order('created_at', { ascending: false })
    .limit(50); // Increased limit to increase chances of finding unique deities

  const uniqueDeitiesMap = new Map();
  
  // Extract unique deities from recent bhajans
  if (recentBhajans) {
    for (const bhajan of recentBhajans as any[]) {
      const deity = Array.isArray(bhajan.deities) ? bhajan.deities[0] : bhajan.deities;
      if (deity && deity.slug && !uniqueDeitiesMap.has(deity.slug)) {
        uniqueDeitiesMap.set(deity.slug, deity);
      }
      if (uniqueDeitiesMap.size === 6) break;
    }
  }

  // 🌟 STEP 2: The Fallback (If recent bhajans only had 3 deities, fetch the remaining 3 directly)
  if (uniqueDeitiesMap.size < 6) {
    const needed = 6 - uniqueDeitiesMap.size;
    
    // Get slugs we already have so we don't fetch duplicates
    const existingSlugs = Array.from(uniqueDeitiesMap.keys());

    // Fetch random/other deities to fill the gap
    let query = supabase
      .from('deities')
      .select('id, name_hinglish, slug, image_url')
      .limit(needed);
      
    // Exclude the ones we already have
    if (existingSlugs.length > 0) {
      query = query.not('slug', 'in', `(${existingSlugs.join(',')})`);
    }

    const { data: fallbackDeities } = await query;

    if (fallbackDeities) {
      for (const deity of fallbackDeities) {
        uniqueDeitiesMap.set(deity.slug, deity);
      }
    }
  }

  const deities = Array.from(uniqueDeitiesMap.values());

  // If absolutely no deities exist in DB, hide section
  if (deities.length === 0) return null;

  return (
    <section className="mb-12 md:mb-16">
      
      <ScrollReveal yOffset={20}>
        <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 md:pb-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Divine <span className="text-orange-600">Deities</span>
          </h2>
          
          <Link 
            href="/deity" 
            className="relative inline-flex items-center justify-center gap-1.5 md:gap-2 bg-orange-500 text-white px-4 py-2 md:px-6 md:py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all duration-150 rounded-lg opacity-95 hover:opacity-100 shadow-[0_4px_0px_#c2410c] md:shadow-[0_5px_0px_#c2410c] active:top-[4px] md:active:top-[5px] active:shadow-[0_0px_0px_#c2410c] shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            aria-label="View all deities"
          >
            View All
            <svg 
              className="w-2.5 h-3 md:w-3 md:h-4" 
              viewBox="0 0 10 18" 
              fill="none"
            >
              <path 
                d="M0.879395 13.0463L6.41356 7.5L0.879395 1.95375L2.58314 0.25L9.83315 7.5L2.58314 14.75L0.879395 13.0463Z" 
                fill="currentColor"
              ></path>
            </svg>
          </Link>
        </div>
      </ScrollReveal>

      {/* 🌟 RESPONSIVE GRID: Locked to 16:9 Landscape */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-6">
        {deities.map((deity, index) => (
          <ScrollReveal 
            key={deity.slug} 
            delay={index * 0.1} 
            yOffset={30}
          >
            <Link href={`/deity/${deity.slug}`} className="group outline-none block focus-visible:ring-2 focus-visible:ring-orange-400 rounded-2xl">
              
              <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-sm border border-orange-100/60 cursor-pointer aspect-video bg-gradient-to-br from-orange-50 to-amber-50 group-hover:shadow-[0_8px_25px_rgb(234,88,12,0.15)] group-hover:border-orange-300 transition-all duration-500">
                
                {deity.image_url ? (
                  <Image 
                    src={deity.image_url} 
                    alt={deity.name_hinglish} 
                    fill
                    quality={60} 
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110" 
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 30vw" 
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center transition-transform duration-700 ease-out group-hover:scale-110 relative z-10">
                    <span className="text-4xl md:text-6xl font-black text-orange-500/10 drop-shadow-sm">
                      {deity.name_hinglish.charAt(0)}
                    </span>
                  </div>
                )} 
                
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500 z-10 pointer-events-none"></div>

                <div className="absolute inset-x-0 bottom-2 md:bottom-4 flex justify-center z-20 px-2">
                  <span className="bg-white/95 backdrop-blur-md border border-white/30 px-3 md:px-6 py-1 md:py-1.5 rounded-full text-[10px] md:text-sm font-black uppercase tracking-wider text-gray-800 shadow-md group-hover:text-orange-600 group-hover:-translate-y-0.5 md:group-hover:-translate-y-1 transition-all duration-300 truncate max-w-full">
                    {deity.name_hinglish}
                  </span>
                </div>
                
              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>
    </section>
  );
}