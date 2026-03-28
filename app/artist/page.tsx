import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { FaMicrophoneAlt, FaUserCircle } from 'react-icons/fa';
import { Metadata } from 'next';
import { Hind } from 'next/font/google';
import ScrollReveal from '@/components/ScrollReveal'; // 🌟 Imported our new Framer wrapper!

// ==========================================
// 🌟 FONT CONFIGURATION
// ==========================================
const hind = Hind({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// ==========================================
// 🌟 SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'All Bhajan Singers & Writers | Hindi Bhajan Manjari',
  description: 'Browse our complete directory of devotional singers, lyricists, and artists. Find bhajans by your favorite spiritual performers.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/artist',
  }
};

export const revalidate = 3600; // ISR: Update cache every hour

export default async function ArtistsDirectory() {
  // ⚡️ OPTIMIZATION: Only fetch the exact columns needed for the cards
  const { data: artists, error } = await supabase
    .from('artists')
    .select('id, slug, name_hindi, name_hinglish, profile_image_url')
    .order('name_hinglish', { ascending: true });

  if (error) {
    return (
      <div className={`flex items-center justify-center min-h-[50vh] ${hind.className}`}>
        <p className="text-red-500 font-medium bg-red-50 px-6 py-3 rounded-xl">
          Error loading artists. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gray-50/50 pb-24 ${hind.className}`}>
      
      {/* 🌟 HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-600 to-orange-500 py-20 px-4 mb-12 shadow-sm">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          
          {/* 🌟 Reveal Title First */}
          <ScrollReveal yOffset={30} duration={0.8}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-sm">
              Our Artists
            </h1>
          </ScrollReveal>

          {/* 🌟 Reveal Paragraph slightly after */}
          <ScrollReveal yOffset={20} delay={0.15} duration={0.8}>
            <p className="text-orange-50 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed opacity-90">
              Explore the voices and writers behind your favorite bhajans, aartis, and spiritual songs.
            </p>
          </ScrollReveal>
        </div>
      </div>

      {/* 🌟 DIRECTORY GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 md:gap-8">
          
          {artists?.map((artist, index) => (
            /* 🌟 THE CASCADE MAGIC: 
               We multiply the index by 0.05s. 
               Card 1 has 0s delay, Card 2 has 0.05s, Card 3 has 0.10s.
               It creates a beautiful, rippling wave effect as they appear! */
            <ScrollReveal 
              key={artist.id} 
              delay={index * 0.05} 
              yOffset={40}
            >
              <Link 
                href={`/artist/${artist.slug}`}
                className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-orange-200 transition-all duration-300 overflow-hidden h-full"
              >
                {/* Landscape Profile Image */}
                <div className="relative w-full aspect-[4/3] bg-orange-50/50 overflow-hidden flex items-center justify-center border-b border-gray-50">
                  {artist.profile_image_url ? (
                    <Image 
                      src={artist.profile_image_url} 
                      alt={`Profile of ${artist.name_hinglish}`} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <FaUserCircle className="text-orange-600/70 w-20 h-20 transition-transform group-hover:scale-110 duration-500" />
                  )}
                  
                  {/* Subtle Image Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                {/* Text Info */}
                <div className="p-5 flex flex-col flex-grow items-center text-center bg-white z-10 relative">
                  <h2 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1">
                    {artist.name_hindi}
                  </h2>
                  <p className="text-sm text-gray-500 font-medium mb-4 line-clamp-1">
                    {artist.name_hinglish}
                  </p>

                  <div className="mt-auto w-full">
                    <span className="inline-flex items-center justify-center gap-1.5 text-xs font-bold uppercase tracking-wider text-orange-600 bg-orange-50 px-4 py-1.5 rounded-lg group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 w-full">
                      View Profile
                    </span>
                  </div>
                </div>
              </Link>
            </ScrollReveal>
          ))}

        </div>

        {/* 🌟 EMPTY STATE */}
        {artists?.length === 0 && (
          <ScrollReveal yOffset={30}>
            <div className="flex flex-col items-center justify-center bg-white p-16 rounded-3xl text-center border-2 border-dashed border-gray-200 mt-8 max-w-3xl mx-auto">
              <div className="bg-orange-50 p-6 rounded-full mb-6">
                <FaMicrophoneAlt className="text-orange-600 text-5xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">No Artists Found</h3>
              <p className="text-gray-500 text-lg">Our directory is currently empty. Check back soon for new additions.</p>
            </div>
          </ScrollReveal>
        )}
      </div>
    </div>
  );
}