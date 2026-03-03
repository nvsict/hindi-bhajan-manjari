import { supabase } from '@/utils/supabase';
import ArtistCarousel from './ArtistCarousel'; 

export const revalidate = 3600; // 🌟 Added cache so this heavy calculation doesn't run on every single page load!

export default async function TrendingArtists() {
  // 1. Fetch artists and their associated bhajan_ids
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

  // 2. Format the data and filter out duplicates
  const artistsWithCounts = rawArtists.map((artist: any) => {
    const uniqueBhajans = new Set();
    
    if (artist.bhajan_artist_map && Array.isArray(artist.bhajan_artist_map)) {
      artist.bhajan_artist_map.forEach((mapping: any) => {
        if (mapping.bhajan_id) uniqueBhajans.add(mapping.bhajan_id);
      });
    }

    return {
      id: artist.id,
      name_hinglish: artist.name_hinglish,
      name_hindi: artist.name_hindi,
      slug: artist.slug,
      profile_image_url: artist.profile_image_url,
      total_bhajans: uniqueBhajans.size 
    };
  });

  // 3. Sort (Highest unique total_bhajans first) and grab Top 10
  const topArtists = artistsWithCounts
    .sort((a, b) => b.total_bhajans - a.total_bhajans)
    .slice(0, 10);

  if (topArtists.length === 0) return null;

  return (
    <section className="mb-12 md:mb-16">
      {/* Hand the data off to the interactive Client Component */}
      <ArtistCarousel artists={topArtists} />
    </section>
  );
}