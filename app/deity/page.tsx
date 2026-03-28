import Link from 'next/link';
import Image from 'next/image';
import { Metadata } from 'next';
import { supabase } from '@/utils/supabase';
import { FaPrayingHands } from 'react-icons/fa';

export const revalidate = 3600; 

// ==========================================
// 🌟 1. SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'All Hindu Deities - Bhajans, Aartis & Chalisa | Hindi Bhajan Manjari',
  description: 'Browse our complete collection of bhajans, aartis, and mantras dedicated to Hindu Gods and Goddesses. Read authentic lyrics and meanings.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/deity',
  }
};

export default async function DeitiesPage() {
  // Fetching deities
  const { data: deities, error } = await supabase
    .from('deities')
    .select('id, name_hindi, name_hinglish, slug, image_url')
    .order('name_hinglish', { ascending: true });

  if (error) {
    console.error("Supabase Error:", error);
    return (
      <div className="text-center py-20 bg-orange-50 min-h-screen">
        <p className="text-red-600 font-bold">Error loading deities.</p>
        <p className="text-sm text-gray-500">Check if the table has data in Supabase.</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-orange-50/30">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center text-white">
          <FaPrayingHands className="mx-auto text-4xl mb-4 text-orange-600" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">All Deities</h1>
          <p className="text-lg md:text-xl text-orange-100 max-w-2xl mx-auto">
            Browse our collection dedicated to Hindu Gods and Goddesses.
          </p>
        </div>
      </div>

      {/* Deities Grid */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {deities?.map((deity) => (
            <Link 
              key={deity.id} 
              href={`/deity/${deity.slug}`}
              className="group bg-white rounded-2xl shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 border border-orange-100 flex flex-col overflow-hidden"
            >
              {/* 🌟 Landscape Image Section */}
              <div className="relative w-full aspect-[4/3] bg-orange-50 overflow-hidden border-b border-orange-50">
                {deity.image_url ? (
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
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-orange-100 to-orange-200 group-hover:scale-105 transition-transform duration-500">
                    <span className="text-6xl font-black text-orange-600 opacity-50">
                      {deity.name_hinglish[0]}
                    </span>
                  </div>
                )}
                
                {/* Subtle inner shadow overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
              </div>
              
              {/* Typography Section */}
              <div className="p-5 text-center">
                <h3 className="font-bold text-gray-900 text-xl group-hover:text-orange-600 transition-colors">
                  {deity.name_hinglish}
                </h3>
                <p className="text-orange-500 font-bold text-sm mt-1">
                  {deity.name_hindi}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}