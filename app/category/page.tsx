import { Metadata } from 'next';
import { supabase } from '@/utils/supabase'; // Adjust path if needed
import Link from 'next/link';
import { FaBookOpen, FaMusic, FaArrowLeft } from 'react-icons/fa';

export const revalidate = 3600; // Cache for 1 hour

// 🌟 SEO Metadata
export const metadata: Metadata = {
  title: 'Browse All Categories | Hindi Bhajan Manjari',
  description: 'Explore our vast collection of Hindu devotional songs, structured by categories like Aarti, Chalisa, Mantra, Stotram, and more.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/category',
  },
};

export default async function AllCategoriesPage() {
  // Fetch ALL categories, ordered alphabetically by their Hinglish name
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name_hinglish, name_hindi, slug')
    .order('name_hinglish', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-red-500 font-bold">
        Error loading categories. Please try again later.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      
      {/* 🌟 PAGE HEADER */}
      <div className="bg-white border-b border-gray-100 pt-8 pb-10 shadow-[0_4px_20px_rgb(0,0,0,0.02)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Back Button */}
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-400 hover:text-orange-600 transition-colors mb-6"
          >
            <FaArrowLeft size={10} /> Back to Home
          </Link>
          
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight flex items-center gap-3 md:gap-4">
            <span className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-orange-50 flex items-center justify-center text-orange-500 shadow-inner">
              <FaBookOpen size={24} className="md:w-8 md:h-8" />
            </span>
            Sacred <span className="text-orange-600">Categories</span>
          </h1>
          <p className="mt-4 text-gray-500 font-medium max-w-2xl text-sm md:text-base leading-relaxed">
            Browse through our entire collection of spiritual categories. From daily Aartis to powerful Mantras, find exactly what your soul is seeking.
          </p>
        </div>
      </div>

      {/* 🌟 FULL GRID OF CATEGORIES */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5 items-stretch">
          {categories?.map((category) => (
            <Link 
              key={category.id} 
              href={`/category/${category.slug}`} 
              className="group block h-full outline-none"
            >
              {/* Exact same floating card UI as the homepage */}
              <div className="relative h-full flex flex-col justify-center bg-gradient-to-br from-white to-orange-50/30 p-4 md:p-5 rounded-2xl shadow-[0_4px_15px_rgb(0,0,0,0.05)] transition-all duration-500 hover:shadow-[0_10px_30px_rgb(234,88,12,0.15)] hover:-translate-y-1 overflow-hidden border border-transparent hover:border-orange-100/50">
                
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
                    {/* Hindi Name */}
                    <h3 className="text-base md:text-lg font-black text-gray-900 group-hover:text-orange-600 transition-colors truncate tracking-tight">
                      {category.name_hindi}
                    </h3>
                    
                    {/* Hinglish Name */}
                    <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.1em] text-gray-400 group-hover:text-orange-500/80 mt-0.5 truncate transition-colors">
                      {category.name_hinglish}
                    </p>
                  </div>
                </div>

              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}