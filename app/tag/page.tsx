import { supabase } from '../../utils/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import Breadcrumbs from '../../components/Breadcrumbs';
import { FaHashtag, FaTags, FaSearch } from 'react-icons/fa';

// 🌟 SEO METADATA FOR THE MAIN TAGS DIRECTORY
export const metadata: Metadata = {
  title: 'All Spiritual Tags & Topics | Hindi Bhajan Manjari',
  description: 'Explore our comprehensive directory of spiritual tags, themes, and topics. Find bhajans, aartis, and mantras categorized by festivals, emotions, and specific deities.',
  keywords: ['bhajan tags', 'spiritual topics', 'hindu festival songs', 'devotional themes', 'hindi bhajan manjari tags'],
  openGraph: {
    title: 'All Spiritual Tags & Topics | Hindi Bhajan Manjari',
    description: 'Explore our comprehensive directory of spiritual tags, themes, and topics. Find bhajans categorized by festivals, emotions, and deities.',
    type: 'website',
  },
};

// 🌟 FORCE DYNAMIC TO ENSURE NEW TAGS APPEAR IMMEDIATELY
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function AllTagsPage() {
  // Fetch all tags ordered alphabetically
  const { data: tags, error } = await supabase
    .from('tags')
    .select('id, name, slug')
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching tags:", error);
  }

  // Fetch the count of bhajans for each tag to show alongside the tag name
  // Using a separate query for performance, aggregating counts
  const { data: tagCountsData } = await supabase
    .from('bhajan_tag_map')
    .select('tag_id');

  // Count occurrences of each tag_id
  const tagCounts = tagCountsData?.reduce((acc: Record<string, number>, curr) => {
    acc[curr.tag_id] = (acc[curr.tag_id] || 0) + 1;
    return acc;
  }, {}) || {};

  // Attach counts to the tags array
  const tagsWithCounts = tags?.map(tag => ({
    ...tag,
    count: tagCounts[tag.id] || 0
  })) || [];

  // Group tags alphabetically for better UX
  const groupedTags = tagsWithCounts.reduce((acc: Record<string, typeof tagsWithCounts>, tag) => {
    const firstLetter = tag.name.charAt(0).toUpperCase();
    const groupKey = /[A-Z]/.test(firstLetter) ? firstLetter : '#';
    
    if (!acc[groupKey]) acc[groupKey] = [];
    acc[groupKey].push(tag);
    return acc;
  }, {});

  const breadcrumbItems = [
    { label: 'Tags' }
  ];

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 mt-8">
          <main className="flex-1 w-full max-w-full">
            
            {/* 🌟 HERO SECTION */}
            <div className="bg-white rounded-[2.5rem] p-8 md:p-12 border border-orange-100 shadow-[0_20px_60px_-15px_rgba(234,88,12,0.1)] mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-orange-200/50 to-red-100/50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 opacity-70 pointer-events-none"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-50 border border-orange-100 text-orange-600 text-sm font-bold uppercase tracking-widest mb-4">
                    <FaTags /> Spiritual Directory
                  </div>
                  <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-4">
                    Explore by <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 to-red-600">Topics</span>
                  </h1>
                  <p className="text-gray-500 font-medium text-lg max-w-2xl leading-relaxed">
                    Browse our extensive collection of devotional content organized by themes, festivals, emotions, and specific attributes.
                  </p>
                </div>
                
                <div className="w-24 h-24 bg-gradient-to-br from-orange-100 to-red-50 rounded-3xl flex items-center justify-center shrink-0 shadow-inner border border-white rotate-3">
                  <FaHashtag className="text-4xl text-orange-500 drop-shadow-sm" />
                </div>
              </div>
            </div>

            {/* 🌟 SEARCH BAR (Client-side filtering could be added here, but static is fine for SEO) */}
            <div className="mb-10 relative group">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400 group-focus-within:text-orange-500 transition-colors" />
              </div>
              <input 
                type="text" 
                placeholder="Find a specific tag (e.g., Navratri, Morning, Aarti)..." 
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-medium text-gray-700 placeholder-gray-400"
                // Adding a simple client-side filter here would require converting this to a Client Component.
                // For SEO purposes, leaving it as a Server Component is better. 
                // Users can use browser search (Ctrl+F) for now, or you can implement a separate client search component later.
                disabled
                title="Browser search (Ctrl+F) recommended for finding tags"
              />
            </div>

            {/* 🌟 ALPHABETICAL NAVIGATION TABS */}
            <div className="flex flex-wrap gap-2 mb-10 p-4 bg-white rounded-2xl shadow-sm border border-gray-100">
              {Object.keys(groupedTags).sort().map(letter => (
                <a 
                  key={letter} 
                  href={`#letter-${letter}`}
                  className="w-10 h-10 flex items-center justify-center rounded-xl font-black text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors border border-transparent hover:border-orange-100"
                >
                  {letter}
                </a>
              ))}
            </div>

            {/* 🌟 TAGS GRID BY ALPHABET */}
            {Object.keys(groupedTags).length > 0 ? (
              <div className="space-y-12">
                {Object.keys(groupedTags).sort().map(letter => (
                  <div key={letter} id={`letter-${letter}`} className="scroll-mt-32">
                    <div className="flex items-center gap-4 mb-6 border-b border-gray-200 pb-2">
                      <h2 className="text-3xl font-black text-gray-900 bg-gray-50 w-12 h-12 rounded-xl flex items-center justify-center border border-gray-200">
                        {letter}
                      </h2>
                      <div className="h-[1px] flex-1 bg-gradient-to-r from-gray-200 to-transparent"></div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {groupedTags[letter].map(tag => (
                        <Link 
                          key={tag.id} 
                          href={`/tag/${tag.slug}`}
                          className="group bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-300 transition-all flex items-center justify-between overflow-hidden relative"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-50/0 to-orange-50/0 group-hover:to-orange-50/50 transition-colors duration-300"></div>
                          
                          <div className="flex items-center gap-3 relative z-10 w-full pr-4">
                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-white group-hover:shadow-sm transition-all border border-transparent group-hover:border-orange-100">
                              <FaHashtag className="text-gray-400 group-hover:text-orange-500 text-sm transition-colors" />
                            </div>
                            <span className="font-bold text-gray-700 group-hover:text-orange-700 transition-colors truncate">
                              {tag.name}
                            </span>
                          </div>
                          
                          <span className="relative z-10 text-xs font-black text-gray-400 bg-gray-50 px-2.5 py-1 rounded-lg group-hover:bg-orange-100 group-hover:text-orange-600 transition-colors shrink-0">
                            {tag.count}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-16 text-center border border-dashed border-gray-300 shadow-sm">
                <FaTags className="text-6xl text-gray-300 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-gray-900 mb-2">No Tags Found</h3>
                <p className="text-gray-500 max-w-md mx-auto">It looks like there are no tags currently available in the database. Tags will appear here once they are added to bhajans.</p>
              </div>
            )}

          </main>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}