import Link from 'next/link';
import Image from 'next/image'; // 🌟 1. Imported Next.js Image
import { supabase } from '@/utils/supabase'; // Adjust path if needed

export const revalidate = 3600; // Cache this for 1 hour for fast homepage loads

export default async function DeityBrowse() {
  // Fetch up to 6 deities to keep the homepage grid perfectly balanced
  const { data: deities, error } = await supabase
    .from('deities')
    .select('name_hinglish, slug, image_url')
    .order('created_at', { ascending: true })
    .limit(6);

  // If there's an error or no data, we fail gracefully and hide the section
  if (error || !deities || deities.length === 0) {
    return null;
  }

  return (
    <section className="mb-12">
      <div className="flex items-center justify-between border-b border-gray-200 pb-3 mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
           Browse by Deity
        </h2>
        <Link 
  href="/deity" 
  className="text-sm font-semibold text-orange-600 hover:underline"
  aria-label="View all deities" // 🌟 THE FIX
>
  View All &gt;
</Link>
      </div>

      {/* Grid layout: 2 columns on mobile, 3 on tablet, 3 on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 md:gap-6">
        {deities.map((deity) => (
          <Link href={`/deity/${deity.slug}`} key={deity.slug}>
            {/* The Landscape Card Container */}
            {/* 🌟 2. Already has 'relative' and landscape aspect ratios, perfect for 'fill' */}
            <div className="relative rounded-xl overflow-hidden shadow-sm border border-orange-100 group cursor-pointer aspect-[4/3] md:aspect-video bg-orange-50">
              
              {/* Deity Image (or a beautiful fallback if no image exists) */}
              {deity.image_url ? (
                // 🌟 3. Implemented Next.js Image for WebP conversion and lazy loading
                <Image 
                  src={deity.image_url} 
                  alt={deity.name_hinglish} 
                  fill
                  quality={50} // ⚡️ High compression for Pinterest thumbnails
                  className="object-cover transition-transform duration-500 group-hover:scale-110" 
                  // ⚡️ PERFECT SIZING: "If mobile, make it 50% of the screen. If tablet, 33%. Otherwise, 20%."
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw" 
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 transition-transform duration-500 group-hover:scale-110 relative z-10">
                  <span className="text-5xl font-black text-orange-300 opacity-50">
                    {deity.name_hinglish.charAt(0)}
                  </span>
                </div>
              )} 
              
              {/* Inner Shadow for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60 z-10 pointer-events-none"></div>

              {/* The Floating White Pill for the Name */}
              <div className="absolute inset-x-0 bottom-2 md:bottom-3 flex justify-center z-20">
                <span className="bg-white/95 backdrop-blur-sm border border-orange-50 px-4 md:px-6 py-1 md:py-1.5 rounded-full text-xs md:text-sm font-bold text-gray-800 shadow-md group-hover:text-orange-600 transition-colors">
                  {deity.name_hinglish}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}