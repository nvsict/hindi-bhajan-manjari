import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { FaMicrophoneAlt, FaUserCircle } from 'react-icons/fa';

export default async function TrendingArtists() {
  // 1. Fetch artists and their associated bhajan_ids (NOT just the count)
  const { data: rawArtists, error } = await supabase
    .from('artists')
    .select(`
      id, 
      name_hinglish, 
      name_hindi, 
      slug, 
      profile_image_url,
      bhajan_artist_map ( bhajan_id )
    `);

  if (error || !rawArtists || rawArtists.length === 0) return null;

  // 2. Format the data and filter out duplicates using a JavaScript Set
  const artistsWithCounts = rawArtists.map((artist: any) => {
    
    // Create a Set to hold unique bhajan IDs
    const uniqueBhajans = new Set();
    
    // If the artist has mappings, add the bhajan_ids to the Set
    if (artist.bhajan_artist_map && Array.isArray(artist.bhajan_artist_map)) {
      artist.bhajan_artist_map.forEach((mapping: any) => {
        if (mapping.bhajan_id) {
          uniqueBhajans.add(mapping.bhajan_id);
        }
      });
    }

    return {
      id: artist.id,
      name_hinglish: artist.name_hinglish,
      name_hindi: artist.name_hindi,
      slug: artist.slug,
      profile_image_url: artist.profile_image_url,
      // The Set's 'size' property gives us the perfectly accurate unique count!
      total_bhajans: uniqueBhajans.size 
    };
  });

  // 3. Sort them in JavaScript (Highest unique total_bhajans first)
  artistsWithCounts.sort((a, b) => b.total_bhajans - a.total_bhajans);

  // 4. Grab only the Top 10 most active artists
  const topArtists = artistsWithCounts.slice(0, 10);

  return (
    <section className="py-12 bg-gradient-to-b from-white to-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <FaMicrophoneAlt className="text-orange-500 text-2xl" />
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
              Popular Singers & Writers
            </h2>
          </div>
          <Link 
            href="/artist" 
            className="text-orange-600 font-bold text-sm hover:underline hidden sm:block"
            aria-label="View all artists"
          >
            View All
          </Link>
        </div>

        {/* Horizontal Scrolling Container */}
        <div className="flex overflow-x-auto gap-6 pb-6 pt-2 snap-x hide-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {topArtists.map((artist) => (
            <Link key={artist.id} href={`/artist/${artist.slug}`} className="snap-start shrink-0 group w-36 md:w-44 text-center">
              
              <div className="relative w-32 h-32 md:w-40 md:h-40 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:shadow-xl group-hover:border-orange-200 transition-all duration-300 group-hover:-translate-y-2 mb-4 bg-orange-100 flex items-center justify-center">
                {artist.profile_image_url ? (
                  <Image 
                    src={artist.profile_image_url} 
                    alt={artist.name_hinglish} 
                    fill 
                    className="object-cover" 
                    sizes="(max-width: 768px) 128px, 160px" 
                  />
                ) : (
                  <FaUserCircle className="text-orange-300 w-full h-full p-4 relative z-10" />
                )}
              </div>
              
              {/* Names */}
              <h3 className="text-base md:text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors">
                {artist.name_hindi || artist.name_hinglish}
              </h3>
              <p className="text-xs md:text-sm font-medium text-gray-500 line-clamp-1 mt-0.5">
                {artist.name_hinglish}
              </p>
              
              {/* The dynamic, strictly unique count badge! */}
              {artist.total_bhajans > 0 && (
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest mt-2 bg-orange-100/50 inline-block px-2 py-1 rounded-md">
                  {artist.total_bhajans} {artist.total_bhajans === 1 ? 'Bhajan' : 'Bhajans'}
                </p>
              )}
              
            </Link>
          ))}
        </div>
        
      </div>
    </section>
  );
}