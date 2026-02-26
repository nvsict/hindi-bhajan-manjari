import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { FaHashtag, FaMusic } from 'react-icons/fa';

interface Props {
  params: Promise<{ slug: string }>;
}

// 🌟 DYNAMIC SEO FOR TAG PAGES
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const { data: tag } = await supabase
    .from('tags')
    .select('name')
    .eq('slug', slug)
    .single();

  if (!tag) return { title: 'Tag Not Found' };

  return {
    title: `Best ${tag.name} Bhajans Lyrics | Hindi Bhajan Manjari`,
    description: `Explore our collection of ${tag.name} bhajans. Read lyrics in Hindi and English with meaning and video references.`,
  };
}

export default async function TagPage({ params }: Props) {
  const { slug } = await params;

  // 1. Fetch Tag Info
  const { data: tag } = await supabase
    .from('tags')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!tag) notFound();

  // 2. Fetch all Bhajans linked to this Tag via the Junction Table
  const { data: mappedData, error } = await supabase
    .from('bhajan_tag_map')
    .select(`
      bhajans (
        id,
        title_hindi,
        title_hinglish,
        slug,
        lyrics_hindi,
        deities ( name_hinglish )
      )
    `)
    .eq('tag_id', tag.id);

  const bhajans = mappedData?.map((item: any) => item.bhajans).filter(Boolean) || [];

  const breadcrumbItems = [
    { label: 'Tags', href: '#' },
    { label: tag.name }
  ];

  return (
    <div className="min-h-screen bg-orange-50/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 mt-6">
          <main className="flex-1">
            
            {/* Tag Header */}
            <div className="bg-white rounded-3xl p-8 border border-orange-100 shadow-sm mb-8">
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-orange-100 rounded-2xl flex items-center justify-center">
                  <FaHashtag className="text-orange-600 text-2xl" />
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900">
                  {tag.name} <span className="text-orange-600">Bhajans</span>
                </h1>
              </div>
              <p className="text-gray-500 font-medium">
                Showing {bhajans.length} collection(s) tagged under #{tag.name}
              </p>
            </div>

            {/* Bhajans Grid */}
            {bhajans.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bhajans.map((bhajan: any) => (
                  <Link 
                    key={bhajan.slug} 
                    href={`/bhajan/${bhajan.slug}`}
                    className="group bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-orange-200 transition-all"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-2 py-1 rounded">
                        {bhajan.deities?.name_hinglish || 'Bhajan'}
                      </span>
                      <FaMusic className="text-gray-300 group-hover:text-orange-400 transition-colors" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-800 group-hover:text-orange-700 transition-colors mb-1">
                      {bhajan.title_hindi}
                    </h2>
                    <p className="text-sm text-gray-500 italic line-clamp-1">
                      {bhajan.title_hinglish}
                    </p>
                    <div className="mt-4 text-orange-600 text-sm font-bold flex items-center gap-1">
                      Read Lyrics →
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-gray-300">
                <p className="text-gray-500">No bhajans found for this tag yet.</p>
              </div>
            )}
          </main>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}