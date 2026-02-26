import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import BhajanList from '../../../components/BhajanList';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function DeityPage({ params }: Props) {
  // 1. Await params
  const { slug } = await params;

  // 2. Fetch Deity
  const { data: deity, error: deityError } = await supabase
    .from('deities')
    .select('id, name_hinglish, name_hindi')
    .eq('slug', slug)
    .single();

  // If Supabase can't find the deity, trigger the 404
  if (deityError || !deity) {
    console.error("Deity fetch error:", deityError);
    notFound();
  }

  // ... inside your DeityPage function ...

  // 3. Fetch Bhajans for this Deity
  const { data: rawBhajans } = await supabase
    .from('bhajans')
    .select(`
      title_hinglish, 
      title_hindi, 
      slug, 
      lyrics_hindi,
      deities ( name_hinglish ), 
      categories ( name_hinglish )
    `)
    .eq('deity_id', deity.id)
    .order('created_at', { ascending: false })
    .range(0, 5);

  // FIX: Map the raw data to flatten the 'deities' and 'categories' arrays
  const initialBhajans = rawBhajans?.map(bhajan => ({
    ...bhajan,
    deities: Array.isArray(bhajan.deities) ? bhajan.deities[0] : bhajan.deities,
    categories: Array.isArray(bhajan.categories) ? bhajan.categories[0] : bhajan.categories,
  })) || [];

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <Breadcrumbs items={[{ label: deity.name_hinglish }]} />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <main className="flex-1 w-full min-w-0">
            
            <div className="mb-10">
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
                {deity.name_hindi} <span className="text-orange-600">Bhajans</span>
              </h1>
              <p className="text-gray-600 text-lg">
                Sacred lyrics and collection for {deity.name_hinglish}.
              </p>
            </div>

            {/* Now the type strictly matches Bhajan[] */}
            <BhajanList initialBhajans={initialBhajans} />
            
          </main>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}