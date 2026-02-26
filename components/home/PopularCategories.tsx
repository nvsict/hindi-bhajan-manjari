import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { FaBookOpen } from 'react-icons/fa';

export default async function PopularCategories() {
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_hinglish, name_hindi, slug')
    .order('created_at', { ascending: true })
    .limit(8);

  if (!categories || categories.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center gap-3 mb-8">
          <FaBookOpen className="text-orange-500 text-2xl" />
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
            Browse by Category
          </h2>
        </div>

        {/* FIX 1: grid-rows-fr ensures all items in a row 
            naturally want to be the same height.
        */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-stretch">
          {categories.map((category) => (
            <Link key={category.id} href={`/category/${category.slug}`} className="group block h-full">
              {/* FIX 2: Added flex flex-col justify-center and min-h-[110px] 
                  to keep heights uniform even with 1 vs 2 lines of text.
              */}
              <div className="h-full min-h-[110px] flex flex-col justify-center bg-orange-50/50 border border-orange-100 hover:border-orange-300 hover:shadow-md p-4 md:p-6 rounded-2xl text-center transition-all duration-300 group-hover:-translate-y-1">
                
                {/* FIX 3: line-clamp-1 ensures that if a name is 
                    ridiculously long, it cuts off with "..." instead of 
                    breaking the card.
                */}
                <h3 className="text-base md:text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                  {category.name_hindi}
                </h3>
                
                <p className="text-xs md:text-sm font-medium text-orange-600/80 mt-1 line-clamp-1">
                  {category.name_hinglish}
                </p>
              </div>
            </Link>
          ))}
        </div>

      </div>
    </section>
  );
}