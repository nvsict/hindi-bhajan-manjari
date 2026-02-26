import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import Image from 'next/image'; // 🌟 1. Imported Next.js Image
import { FaMicrophoneAlt, FaUserCircle, FaSearch } from 'react-icons/fa';
import { Metadata } from 'next';

// ==========================================
// 🌟 2. SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'All Bhajan Singers & Writers | Hindi Bhajan Manjari',
  description: 'Browse our complete directory of devotional singers, lyricists, and artists. Find bhajans by your favorite spiritual performers.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/artist', // ⚡️ Prevents duplicate content issues
  }
};

export const revalidate = 3600; // Update cache every hour

export default async function ArtistsDirectory() {
  // Fetch all artists ordered by name
  const { data: artists, error } = await supabase
    .from('artists')
    .select('*')
    .order('name_hinglish', { ascending: true });

  if (error) {
    return <div className="p-20 text-center">Error loading artists. Please try again later.</div>;
  }

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
            Our Artists
          </h1>
          <p className="text-orange-100 text-lg max-w-2xl mx-auto">
            Explore the voices and writers behind your favorite bhajans, aartis, and spiritual songs.
          </p>
        </div>
      </div>

      {/* Directory Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {artists?.map((artist) => (
            <Link 
              key={artist.id} 
              href={`/artist/${artist.slug}`}
              className="group bg-white rounded-3xl p-6 shadow-sm border border-orange-100 hover:shadow-xl hover:border-orange-300 transition-all duration-300 text-center"
            >
              {/* Profile Image */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 mx-auto mb-4">
                <div className="absolute inset-0 bg-orange-200 rounded-full blur-md opacity-0 group-hover:opacity-40 transition-opacity"></div>
                {/* 🌟 Parent has 'relative' and 'overflow-hidden' */}
                <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-gray-50 bg-orange-50 flex items-center justify-center shadow-inner">
                  {artist.profile_image_url ? (
                    // 🌟 3. Implemented Next.js Image
                    <Image 
                      src={artist.profile_image_url} 
                      alt={artist.name_hinglish} 
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 768px) 96px, 128px" // 96px for w-24, 128px for md:w-32
                    />
                  ) : (
                    <FaUserCircle className="text-orange-200 w-full h-full p-4 relative z-10" />
                  )}
                </div>
              </div>

              {/* Text Info */}
              <h2 className="text-lg font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1">
                {artist.name_hindi}
              </h2>
              <p className="text-sm text-gray-500 font-medium mb-3">
                {artist.name_hinglish}
              </p>

              <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1 rounded-full group-hover:bg-orange-600 group-hover:text-white transition-colors">
                View Profile
              </span>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {artists?.length === 0 && (
          <div className="bg-white p-20 rounded-3xl text-center border border-dashed border-gray-300 mt-10">
            <FaMicrophoneAlt className="text-gray-300 text-5xl mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No artists have been added to the directory yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}