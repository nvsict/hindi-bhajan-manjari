import { supabase } from '../../utils/supabase';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';
import { Metadata } from 'next';
import { FaSearch, FaMusic, FaAlignLeft, FaOm } from 'react-icons/fa';

export const revalidate = 0; // Search pages should always be dynamic

const RESULT_LIMIT = 50;

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ q: string }> }): Promise<Metadata> {
  const { q: query } = await searchParams;
  return {
    title: `Search Results for "${query}" | Hindi Bhajan Manjari`,
    description: `Discover bhajans, aartis, and spiritual content related to ${query}. Search by title, melody (tarz), or deep within the lyrics.`,
    robots: {
      index: false, // Best practice: Don't let Google index dynamic search result pages
      follow: true,
    }
  };
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q: rawQuery } = await searchParams;
  // Decode and clean the query
  const query = decodeURIComponent(rawQuery || '').trim();

  /*
   * Ranking, typo-tolerant matching, and match-type classification are now
   * all done in Postgres via search_bhajans_full (see search_page_function.sql)
   * instead of client-side here. Two changes from the previous version:
   *
   *   1. Typo tolerance — this page previously ran a plain ILIKE query,
   *      completely separate from the header's quick-search dropdown
   *      (which already got trigram matching). A typo'd query could find
   *      results in the dropdown but zero results here. Now both use the
   *      same underlying trigram approach.
   *
   *   2. No more fetching full lyrics_hindi/lyrics_hinglish text for every
   *      row just to classify matchType client-side — that data was never
   *      rendered on this page, only used for an .includes() check. The
   *      RPC does that classification in the database and returns only
   *      the fields actually displayed.
   */

  let results: any[] = [];
  let totalCount = 0;

  if (query.length > 0) {
    const { data, error } = await supabase.rpc('search_bhajans_full', {
      search_query: query,
      match_limit: RESULT_LIMIT,
    });

    if (!error && data) {
      results = data;
      totalCount = data.length > 0 ? Number(data[0].total_count) : 0;
    }
  }

  const isCapped = totalCount > results.length;

  return (
    <div className="min-h-screen bg-orange-50/30">

      {/* --- HERO HEADER --- */}
      <div className="bg-[#1a0500] py-16 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-orange-600/20 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="relative z-10">
          <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center text-orange-400 mx-auto mb-6 backdrop-blur-sm border border-white/10">
            <FaSearch size={24} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter">
            Search Results for <span className="text-orange-500">"{query}"</span>
          </h1>
          <p className="text-orange-100/70 text-lg font-medium">
            {isCapped
              ? `Showing top ${results.length} of ${totalCount} sacred bhajans matching your search.`
              : `Found ${results.length} sacred ${results.length === 1 ? 'bhajan' : 'bhajans'} matching your search.`}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16 flex flex-col lg:flex-row gap-8 items-start">

        {/* --- MAIN RESULTS AREA --- */}
        <main className="flex-1 w-full min-w-0">

          {query.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2.5rem] border border-orange-100 shadow-sm">
              <FaSearch size={40} className="text-gray-300 mx-auto mb-4" />
              <h2 className="text-2xl font-black text-gray-900 mb-2">Please enter a search term</h2>
              <p className="text-gray-500">Try searching for a deity, a bhajan title, a melody (tarz), or a specific word.</p>
            </div>
          ) : results.length > 0 ? (
            <div className="grid gap-6">
              {results.map((bhajan) => (
                <Link href={`/bhajan/${bhajan.slug}`} key={bhajan.slug} className="group block outline-none focus-visible:ring-4 focus-visible:ring-orange-500/30 rounded-[2rem]">
                  <div className="p-6 md:p-8 border border-orange-100 rounded-[2rem] shadow-sm bg-white hover:shadow-xl hover:border-orange-300 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">

                    {/* Decorative Hover Element */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-100/50 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>

                    <div className="flex-1 relative z-10">

                      {/* SMART MATCH BADGES — matchType now comes pre-classified from the RPC */}
                      <div className="mb-4 flex flex-wrap gap-2">
                        {bhajan.match_type === 'tarz' && (
                          <span className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-purple-200">
                            <FaMusic size={10} /> तर्ज मैच (Melody Match)
                          </span>
                        )}
                        {bhajan.match_type === 'lyrics' && (
                          <span className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-200">
                            <FaAlignLeft size={10} /> लिरिक्स में मिला (Found in Lyrics)
                          </span>
                        )}
                        {bhajan.deity_name_hinglish && (
                          <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-orange-200">
                            <FaOm size={12} /> {bhajan.deity_name_hinglish}
                          </span>
                        )}
                      </div>

                      <h3 className="text-2xl md:text-3xl font-black font-hindi text-gray-900 mb-2 group-hover:text-orange-600 transition-colors tracking-tight">
                        {bhajan.title_hindi}
                      </h3>
                      <p className="text-gray-500 text-sm font-bold tracking-widest uppercase mb-3">
                        {bhajan.title_hinglish}
                      </p>

                      {bhajan.tarj_parody && (
                        <p className="text-gray-600 text-sm font-medium font-hindi border-l-2 border-orange-200 pl-3 italic">
                          <strong className="not-italic text-orange-800">तर्ज:</strong> {bhajan.tarj_parody}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 relative z-10">
                      <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-colors border border-gray-100 shadow-sm">
                        &rarr;
                      </div>
                    </div>

                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-24 bg-white rounded-[3rem] border border-orange-100 shadow-sm px-6">
              <div className="w-24 h-24 bg-orange-50 text-orange-300 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FaSearch size={40} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">कोई परिणाम नहीं मिला</h2>
              <p className="text-gray-500 text-lg mb-8 max-w-md mx-auto">
                We couldn't find any bhajans, melodies, or lyrics matching <strong className="text-gray-900">"{query}"</strong>.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/deities" className="bg-gray-900 text-white px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-black transition-colors shadow-md">
                  Browse Deities
                </Link>
                <Link href="/categories" className="bg-orange-50 text-orange-600 px-8 py-3.5 rounded-full font-bold text-sm uppercase tracking-wider hover:bg-orange-100 transition-colors">
                  View Categories
                </Link>
              </div>
            </div>
          )}
        </main>

        {/* --- GLOBAL SIDEBAR --- */}
        <aside className="hidden lg:block w-[320px] sticky top-28 shrink-0">
          <Sidebar />
        </aside>

      </div>
    </div>
  );
}