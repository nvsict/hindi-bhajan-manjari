import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { FaBookOpen, FaMusic } from 'react-icons/fa';
import ScrollReveal from '../ScrollReveal'; // 🌟 1. Imported ScrollReveal

export const revalidate = 3600; // Cache for fast load times (ISR)

export default async function PopularCategories() {
  // Database fetch is already perfectly optimized (selective columns, limited to 8)
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_hinglish, name_hindi, slug')
    .order('created_at', { ascending: true })
    .limit(8);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="mb-12 md:mb-16">
      
      {/* 🌟 Reveal Header Smoothly */}
      <ScrollReveal yOffset={20}>
        <div className="flex flex-row items-center justify-between border-b border-gray-100 pb-3 md:pb-4 mb-6 md:mb-8">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-2 md:gap-3">
            Sacred <span className="text-orange-600">Categories</span>
          </h2>
          
          {/* Mobile-Optimized Uiverse 3D Button */}
          <Link 
            href="/category" 
            className="relative inline-flex items-center justify-center gap-1.5 md:gap-2 bg-orange-500 text-white px-4 py-2 md:px-6 md:py-2.5 text-[11px] md:text-xs font-bold uppercase tracking-widest transition-all duration-150 rounded-lg opacity-95 hover:opacity-100 shadow-[0_4px_0px_#c2410c] md:shadow-[0_5px_0px_#c2410c] active:top-[4px] md:active:top-[5px] active:shadow-[0_0px_0px_#c2410c] shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-orange-400 focus-visible:ring-offset-2"
            aria-label="View all categories"
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

      {/* 🌟 BORDERLESS FLOATING CARDS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 items-stretch">
        {categories.map((category, index) => (
          
          /* 🌟 THE CASCADE MAGIC: Delays each card by 0.05s */
          /* className="h-full" ensures the Framer Motion div stretches to fill the grid */
          <ScrollReveal 
            key={category.id} 
            delay={index * 0.05} 
            yOffset={30} 
            className="h-full"
          >
            <Link 
              href={`/category/${category.slug}`} 
              className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-orange-400 rounded-2xl"
            >
              {/* The Floating Container (No Borders!) */}
              <div className="relative h-full flex flex-col justify-center bg-gradient-to-br from-white to-orange-50/30 p-4 md:p-5 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_10px_30px_rgb(234,88,12,0.15)] hover:-translate-y-1 overflow-hidden">
                
                {/* Animated Accent Bar on the left */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-orange-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-y-0 group-hover:scale-y-100 origin-bottom"></div>

                {/* Decorative Watermark Icon */}
                <FaBookOpen className="absolute -bottom-3 -right-3 text-6xl text-orange-500/[0.03] group-hover:text-orange-500/[0.08] group-hover:-rotate-12 transition-all duration-500 pointer-events-none" />

                {/* Content Layout */}
                <div className="relative z-10 flex items-center gap-3">
                  
                  {/* Small leading icon */}
                  <div className="w-8 h-8 rounded-full bg-orange-100/50 text-orange-500 flex items-center justify-center shrink-0 group-hover:bg-orange-500 group-hover:text-white transition-colors duration-300 shadow-inner">
                    <FaMusic size={12} />
                  </div>

                  {/* Text Container */}
                  <div className="flex-1 min-w-0">
                    {/* Applied font-hindi, increased text size, tightened leading */}
                    <h3 className="text-lg md:text-xl font-black font-hindi text-gray-900 group-hover:text-orange-600 transition-colors truncate tracking-tight leading-tight">
                      {category.name_hindi}
                    </h3>
                    
                    {/* Accessibility contrast boost to text-gray-500 */}
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-500 group-hover:text-orange-500/80 mt-0.5 truncate transition-colors">
                      {category.name_hinglish}
                    </p>
                  </div>
                </div>

              </div>
            </Link>
          </ScrollReveal>
        ))}
      </div>

    </section>
  );
}