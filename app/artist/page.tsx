import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { FaMicrophoneAlt, FaUserCircle } from 'react-icons/fa';
import { Metadata } from 'next';
import { Hind } from 'next/font/google';
import ScrollReveal from '@/components/ScrollReveal';

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
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
const pageTitle = 'All Bhajan Singers & Writers | Hindi Bhajan Manjari';
const pageDescription = 'Browse our complete directory of devotional singers, lyricists, and artists. Find bhajans by your favorite spiritual performers.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: pageTitle,
  description: pageDescription,
  keywords: 'Bhajan singers, Hindu devotional singers, Bhajan lyricists, aarti singers, Hindi Bhajan Manjari artists, spiritual performers',
  alternates: {
    canonical: `${siteUrl}/artist`,
  },
  openGraph: {
    title: pageTitle,
    description: pageDescription,
    url: `${siteUrl}/artist`,
    type: 'website',
    siteName: 'Hindi Bhajan Manjari',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Artists & Singers Directory - Hindi Bhajan Manjari',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: pageTitle,
    description: pageDescription,
    images: [`${siteUrl}/og-image.jpg`],
  },
};

export const revalidate = 3600; // ISR: Update cache every hour

export default async function ArtistsDirectory() {
  // ⚡️ OPTIMIZATION: Fetch exactly what's needed
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

  // ==========================================
  // 🌟 JSON-LD SCHEMA FOR DIRECTORY
  // ==========================================
  const schemaGraph = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": pageTitle,
    "description": pageDescription,
    "url": `${siteUrl}/artist`,
    "mainEntity": {
      "@type": "ItemList",
      "itemListElement": artists?.map((artist, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${siteUrl}/artist/${artist.slug}`,
        "name": artist.name_hindi || artist.name_hinglish
      })) || []
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50/50 pb-24 ${hind.className}`}>
      
      {/* 🌟 INJECT STRUCTURED DATA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }} />
      
      {/* 🌟 HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-b from-orange-600 to-orange-500 py-20 px-4 mb-12 shadow-sm">
        
        {/* 🌟 Pure CSS Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.15]" 
          style={{ 
            backgroundImage: 'radial-gradient(#ffffff 1.5px, transparent 1.5px)', 
            backgroundSize: '24px 24px' 
          }}
        ></div>

        <div className="relative max-w-5xl mx-auto text-center">
          
          <ScrollReveal yOffset={30} duration={0.8}>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight drop-shadow-sm">
              Our Artists
            </h1>
          </ScrollReveal>

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
            <ScrollReveal 
              key={artist.id} 
              delay={index * 0.05} 
              yOffset={40}
            >
              <Link 
                href={`/artist/${artist.slug}`}
                className="group flex flex-col bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 hover:border-orange-200 transition-all duration-300 overflow-hidden h-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
                aria-label={`View profile of ${artist.name_hinglish}`}
              >
                {/* Landscape Profile Image */}
                <div className="relative w-full aspect-[4/3] bg-orange-50/50 overflow-hidden flex items-center justify-center border-b border-gray-50">
                  {artist.profile_image_url ? (
                    <Image 
                      src={artist.profile_image_url} 
                      alt={`Profile of ${artist.name_hinglish}`} 
                      fill
                      priority={index < 8} /* 🌟 UX FIX: Prefetch top images for fast LCP */
                      className="object-cover group-hover:scale-105 transition-transform duration-700 ease-in-out bg-gray-100"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  ) : (
                    <FaUserCircle className="text-orange-600/70 w-20 h-20 transition-transform group-hover:scale-110 duration-500" aria-hidden="true" />
                  )}
                  
                  {/* Subtle Image Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
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
                <FaMicrophoneAlt className="text-orange-600 text-5xl" aria-hidden="true" />
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