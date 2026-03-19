import { supabase } from '@/utils/supabase';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { 
  FaPhoneAlt, 
  FaMapMarkerAlt, 
  FaUserCircle, 
  FaPlayCircle, 
  FaPenNib, 
  FaQuoteLeft, 
  FaMusic,
  FaChevronRight
} from 'react-icons/fa';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // Cache for performance

// ==========================================
// 🌟 1. DYNAMIC SEO & SOCIAL SHARING METADATA
// ==========================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: artist } = await supabase
    .from('artists')
    .select('name_hinglish, name_hindi, bio, profile_image_url')
    .eq('slug', slug)
    .single();

  if (!artist) return { title: 'Artist Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${baseUrl}/artist/${slug}`;
  
  // Create a highly clickable description
  const description = artist.bio 
      ? `${artist.bio.substring(0, 150).trim()}... Explore the complete collection of bhajans, aartis, and lyrics by ${artist.name_hinglish}.` 
      : `Explore the complete collection of authentic bhajans, aartis, and lyrics by renowned artist ${artist.name_hinglish} (${artist.name_hindi}). Read, listen, and download.`;
  
  return {
    title: `Top ${artist.name_hinglish} (${artist.name_hindi}) Bhajans & Lyrics Collection | Hindi Bhajan Manjari`,
    description: description,
    keywords: `${artist.name_hinglish} bhajans, ${artist.name_hindi} भजन, ${artist.name_hinglish} songs, ${artist.name_hinglish} aarti lyrics, popular bhajans by ${artist.name_hinglish}, Hindi Bhajan Manjari`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `${artist.name_hindi} - Complete Bhajan Collection`,
      description: description,
      type: 'profile',
      url: pageUrl,
      siteName: 'Hindi Bhajan Manjari',
      images: artist.profile_image_url ? [
        {
          url: artist.profile_image_url,
          width: 800,
          height: 800,
          alt: `${artist.name_hinglish} - Bhajan Singer & Lyricist`,
        }
      ] : [
        {
          url: `${baseUrl}/og-image.jpg`, // Fallback
          width: 1200,
          height: 630,
          alt: 'Hindi Bhajan Manjari Artist Collection',
        }
      ], 
    },
    twitter: {
      card: 'summary_large_image',
      title: `${artist.name_hindi} - Bhajan Collection`,
      description: description,
      images: artist.profile_image_url ? [artist.profile_image_url] : [`${baseUrl}/og-image.jpg`],
    }
  };
}

// ==========================================
// 🌟 2. MAIN PAGE COMPONENT
// ==========================================
export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;

  const { data: artist, error } = await supabase
    .from('artists')
    .select(`
      *,
      bhajan_artist_map (
        role,
        bhajans (
          id,
          slug,
          title_hindi,
          title_hinglish,
          view_count,
          deities (name_hinglish)
        )
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !artist) notFound();

  // --- DATA TRANSFORMATION: GROUP BY BHAJAN ID ---
  const rawWorks = artist.bhajan_artist_map?.filter((map: any) => map.bhajans !== null) || [];
  
  const groupedWorksMap = rawWorks.reduce((acc: any, item: any) => {
    const bhajanId = item.bhajans.id;
    const role = item.role.toLowerCase();
    
    if (!acc[bhajanId]) {
      acc[bhajanId] = {
        ...item.bhajans,
        roles: [role]
      };
    } else {
      if (!acc[bhajanId].roles.includes(role)) {
        acc[bhajanId].roles.push(role);
      }
    }
    return acc;
  }, {});

  const uniqueWorks = Object.values(groupedWorksMap);
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${baseUrl}/artist/${artist.slug}`;

  // ==========================================
  // 🌟 3. ADVANCED ENTITY GRAPH SCHEMA
  // ==========================================
  
  const graphNodes: any[] = [];

  // Node 1: The Person (Artist) Entity
  graphNodes.push({
    "@type": "Person",
    "@id": `${pageUrl}#person`,
    "name": artist.name_hinglish,
    "alternateName": artist.name_hindi,
    "description": artist.bio || `Renowned Bhajan singer and lyricist: ${artist.name_hinglish}`,
    "jobTitle": "Devotional Artist",
    "telephone": artist.phone || undefined,
    "url": pageUrl,
    "image": artist.profile_image_url || undefined
  });

  // Node 2: ItemList (The Discography)
  if (uniqueWorks.length > 0) {
    graphNodes.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#discography`,
      "name": `Bhajans by ${artist.name_hinglish}`,
      "itemListElement": uniqueWorks.map((bhajan: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${baseUrl}/bhajan/${bhajan.slug}`,
        "name": bhajan.title_hindi
      }))
    });
  }

  // Node 3: ProfilePage (Tying it together)
  graphNodes.push({
    "@type": "ProfilePage",
    "@id": pageUrl,
    "url": pageUrl,
    "name": `${artist.name_hindi} - Artist Profile & Bhajans`,
    "mainEntity": { "@id": `${pageUrl}#person` },
    "about": uniqueWorks.length > 0 ? { "@id": `${pageUrl}#discography` } : undefined
  });

  const advancedProfileSchema = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };

  return (
    <div className="min-h-screen bg-orange-50/40 pb-20 font-sans">
      
      {/* 🌟 INJECT THE ADVANCED ENTITY GRAPH */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedProfileSchema) }} />

      {/* --- PREMIUM ARTIST HEADER --- */}
      <div className="relative overflow-hidden bg-gradient-to-br from-orange-600 via-red-600 to-orange-800 text-white pt-20 pb-24 px-4 shadow-2xl">
        <div className="max-w-5xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12">
          
          {/* Profile Image */}
          <div className="relative group">
            <div className="absolute inset-0 bg-orange-300 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
            <div className="w-44 h-44 md:w-52 md:h-52 shrink-0 rounded-full border-4 border-white/20 overflow-hidden bg-white/10 flex items-center justify-center shadow-2xl relative z-10 backdrop-blur-sm">
              {artist.profile_image_url ? (
                <img src={artist.profile_image_url} alt={artist.name_hinglish} className="w-full h-full object-cover" />
              ) : (
                <FaUserCircle className="text-white/50 w-full h-full p-4" />
              )}
            </div>
          </div>

          <div className="flex-1 text-center md:text-left mt-4 md:mt-8">
            <span className="inline-block px-4 py-1.5 rounded-full bg-white/10 text-orange-100 text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/10 mb-4 shadow-sm">
              Verified Artist
            </span>
            
            <h1 className="text-4xl md:text-6xl font-black font-hindi mb-2 tracking-tighter drop-shadow-lg leading-tight">
              {artist.name_hindi}
            </h1>
            
            <h2 className="text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-orange-200/90 mb-8">
              {artist.name_hinglish}
            </h2>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-sm font-medium">
              {artist.phone && (
                <div className="flex items-center gap-2.5 bg-black/20 hover:bg-black/30 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 transition-colors shadow-inner">
                  <FaPhoneAlt className="text-orange-300" />
                  <a href={`tel:${artist.phone}`} className="hover:text-white transition-colors tracking-wide">{artist.phone}</a>
                </div>
              )}
              {artist.address && (
                <div className="flex items-center gap-2.5 bg-black/20 px-5 py-2.5 rounded-full backdrop-blur-md border border-white/10 shadow-inner">
                  <FaMapMarkerAlt className="text-orange-300" />
                  <span className="tracking-wide text-white/90">{artist.address}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* --- BIO SECTION --- */}
      {artist.bio && (
        <div className="max-w-4xl mx-auto px-4 -mt-12 relative z-20">
          <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-orange-900/5 border border-orange-100 flex gap-6 items-start">
            <FaQuoteLeft className="text-4xl text-orange-200 shrink-0 hidden sm:block mt-1" />
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About the Artist</h3>
              <p className="text-gray-600 text-base md:text-lg leading-[1.8] font-medium">
                {artist.bio}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- BHAJAN COLLECTION GRID --- */}
      <div className={`max-w-5xl mx-auto px-4 ${artist.bio ? 'mt-16' : 'mt-8'}`}>
        <div className="flex items-center gap-3 mb-8 border-b border-orange-200/60 pb-4">
          <FaMusic className="text-orange-500 text-2xl" />
          <h3 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter">
            Discography <span className="text-orange-400 font-medium text-xl md:text-2xl">({uniqueWorks.length})</span>
          </h3>
        </div>

        {uniqueWorks.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-orange-200">
            <p className="text-gray-500 font-medium text-lg">No bhajans added yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {uniqueWorks.map((bhajan: any, idx: number) => {
              const isSinger = bhajan.roles.includes('singer');
              const isWriter = bhajan.roles.includes('writer') || bhajan.roles.includes('lyricist');

              return (
                <Link key={idx} href={`/bhajan/${bhajan.slug}`} className="group block h-full">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-xl hover:shadow-orange-900/5 hover:border-orange-300 transition-all duration-300 flex items-center justify-between relative overflow-hidden h-full hover:-translate-y-0.5">
                    
                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isSinger ? 'bg-gradient-to-b from-green-400 to-green-500' : 'bg-gradient-to-b from-blue-400 to-blue-500'} opacity-0 group-hover:opacity-100 transition-opacity`}></div>

                    <div className="flex-1 pr-4">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {isSinger && (
                          <span className="bg-green-50 text-green-700 border border-green-200/60 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                            <FaPlayCircle className="text-green-500" /> Singer
                          </span>
                        )}
                        {isWriter && (
                          <span className="bg-blue-50 text-blue-700 border border-blue-200/60 text-[9px] md:text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                            <FaPenNib className="text-blue-500" /> Writer
                          </span>
                        )}
                        {bhajan.deities && (
                          <span className="bg-orange-50 text-orange-700 border border-orange-200/60 text-[9px] md:text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm">
                            {bhajan.deities.name_hinglish}
                          </span>
                        )}
                      </div>
                      
                      <h4 className="text-lg md:text-xl font-black font-hindi text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-1 leading-tight">
                        {bhajan.title_hindi}
                      </h4>
                      <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-500 line-clamp-1">
                        {bhajan.title_hinglish}
                      </p>
                    </div>

                    <div className="w-10 h-10 shrink-0 rounded-full bg-orange-50 flex items-center justify-center text-orange-400 group-hover:bg-orange-500 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1 shadow-sm">
                      <FaChevronRight className="text-sm" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}