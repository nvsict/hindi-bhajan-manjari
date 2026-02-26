import { supabase } from '../../utils/supabase';
import Link from 'next/link';
import Sidebar from '../../components/Sidebar';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q: string }>;
}) {
  const { q: query } = await searchParams;

  // 1. Fetch the raw results
  const { data: rawResults, error } = await supabase
    .from('bhajans')
    .select(`
      title_hinglish, title_hindi, slug, lyrics_hindi,
      deities ( name_hinglish ), categories ( name_hinglish )
    `)
    .or(`title_hinglish.ilike.%${query}%,title_hindi.ilike.%${query}%`);

  // 2. FIX: Flatten the data immediately
  const results = (rawResults || []).map(bhajan => ({
    ...bhajan,
    deities: Array.isArray(bhajan.deities) ? bhajan.deities[0] : bhajan.deities,
    categories: Array.isArray(bhajan.categories) ? bhajan.categories[0] : bhajan.categories,
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-8 items-start">
      <main className="flex-1 w-full min-w-0">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Search Results for: <span className="text-orange-600">"{query}"</span>
          </h1>
          <p className="text-gray-500 mt-2">
            Found {results.length} bhajans matching your search.
          </p>
        </div>

        {results.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {results.map((bhajan) => (
              <Link href={`/bhajan/${bhajan.slug}`} key={bhajan.slug}>
                <div className="p-5 border border-orange-100 rounded-xl shadow-sm bg-white hover:border-orange-300 transition-all">
                  <h3 className="text-xl font-bold text-gray-900">{bhajan.title_hindi}</h3>
                  <p className="text-gray-500 text-sm mb-3">{bhajan.title_hinglish}</p>
                  <div className="flex gap-2">
                    {/* Now TypeScript knows this is a single object, not an array! */}
                    <span className="bg-orange-100 text-orange-800 px-2 py-0.5 rounded text-xs font-bold">
                      {bhajan.deities?.name_hinglish}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg">No bhajans found. Try searching for "Hanuman" or "Shiv".</p>
          </div>
        )}
      </main>
      <Sidebar />
    </div>
  );
}