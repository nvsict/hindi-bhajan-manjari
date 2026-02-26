import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import BhajanList from '../../../components/BhajanList';
import { GiTempleGate } from 'react-icons/gi';

export const revalidate = 3600;
interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ==========================================
// 🌟 1. DYNAMIC SEO METADATA (With Pagination)
// ==========================================
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // Grab the page number from the URL
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  
  const { data: category } = await supabase
    .from('categories')
    .select('name_hinglish, name_hindi')
    .eq('slug', slug)
    .single();

  if (!category) return { title: 'Category Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  
  // Create the " - Page X" suffix (empty if on page 1)
  const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : '';
  
  // Dynamic Canonical URL
  const canonicalUrl = currentPage > 1 
    ? `${baseUrl}/category/${slug}?page=${currentPage}` 
    : `${baseUrl}/category/${slug}`;
  
  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  ogImageUrl.searchParams.set('title', category.name_hindi);
  ogImageUrl.searchParams.set('subtitle', `${category.name_hinglish} Collection${pageSuffix}`);
  ogImageUrl.searchParams.set('badge', '✨ Bhajan Category');

  return {
    // ⚡️ Inject the page suffix to prevent Duplicate Title penalties
    title: `Best ${category.name_hinglish} (${category.name_hindi}) Lyrics${pageSuffix} | Hindi Bhajan Manjari`,
    description: `Explore our complete collection of ${category.name_hinglish}${pageSuffix}. Read accurate lyrics and understand their spiritual meanings.`,
    alternates: {
      canonical: canonicalUrl, // ⚡️ Points to the exact page number
    },
    openGraph: {
      title: `${category.name_hindi} Collection${pageSuffix}`,
      description: `Complete collection of ${category.name_hinglish} lyrics${pageSuffix}.`,
      url: canonicalUrl,
      type: 'website',
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `${category.name_hinglish} Lyrics`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      images: [ogImageUrl.toString()],
    },
  };
}

// ==========================================
// 🌟 2. MAIN PAGE COMPONENT
// ==========================================
export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;

  // 🌟 Calculate Pagination Offsets
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  const itemsPerPage = 10;
  
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // Fetch Category details
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id, name_hinglish, name_hindi, slug')
    .eq('slug', slug)
    .single();

  if (catError || !category) {
    notFound();
  }

  // 🌟 Fetching with Pagination (.range) and getting total count
  const { data: mappedData, count } = await supabase
    .from('bhajan_category_map')
    .select(`
      bhajans (
        id,
        title_hinglish, 
        title_hindi, 
        slug, 
        lyrics_hindi,
        created_at,
        deities ( name_hinglish )
      )
    `, { count: 'exact' }) // ⚡️ Get total count for pagination math
    .eq('category_id', category.id)
    .order('bhajans(created_at)', { ascending: false })
    .range(from, to); 

  interface BhajanData {
    id: string;
    title_hinglish: string;
    title_hindi: string;
    slug: string;
    lyrics_hindi: string;
    deities: { name_hinglish: string } | null;
    categories: { name_hinglish: string } | null;
  }

  // Format the data and explicitly cast it
  const initialBhajans = (mappedData?.map((mapItem: any) => {
    const b = mapItem.bhajans;
    if (!b) return null;
    return {
      id: b.id,
      title_hinglish: b.title_hinglish,
      title_hindi: b.title_hindi,
      slug: b.slug,
      lyrics_hindi: b.lyrics_hindi,
      deities: Array.isArray(b.deities) ? b.deities[0] : b.deities,
      categories: { name_hinglish: category.name_hinglish } 
    };
  }).filter((item) => item !== null) as BhajanData[]) || [];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

  const breadcrumbItems = [
    { label: 'Categories', href: '/category' },
    { label: category.name_hinglish, href: `/category/${category.slug}` }
  ];

  // ==========================================
  // 🌟 3. ADVANCED SEO SCHEMAS (JSON-LD)
  // ==========================================
  
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Categories", "item": `${baseUrl}/category` },
      { "@type": "ListItem", "position": 3, "name": category.name_hinglish, "item": `${baseUrl}/category/${category.slug}` }
    ]
  };

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": initialBhajans.map((bhajan, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${baseUrl}/bhajan/${bhajan.slug}`,
      "name": bhajan.title_hindi
    }))
  };

  return (
    <div className="min-h-screen bg-orange-50/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 items-start mt-6">
          <main className="flex-1 w-full min-w-0">
            
            <div className="mb-10 p-8 md:p-10 bg-white rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex items-center gap-5">
                <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                  <GiTempleGate size={36} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 tracking-tight">
                    {category.name_hindi} <span className="text-orange-600">Collection</span>
                  </h1>
                  <h2 className="text-gray-500 text-lg font-medium">
                    All {category.name_hinglish} lyrics in one sacred place
                    {currentPage > 1 && ` (Page ${currentPage})`}
                  </h2>
                </div>
              </div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-50 rounded-full opacity-50 blur-3xl pointer-events-none"></div>
            </div>

            {initialBhajans.length > 0 ? (
              // ⚡️ Passing the new pagination data down to the component
              <BhajanList 
                initialBhajans={initialBhajans} 
                categoryId={category.id} 
                categorySlug={category.slug}
                currentPage={currentPage}
                totalItems={count || 0}
                itemsPerPage={itemsPerPage}
              />
            ) : (
              <div className="bg-white p-16 md:p-24 rounded-[2.5rem] border border-dashed border-gray-300 text-center shadow-sm">
                <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GiTempleGate size={40} opacity={0.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Bhajans Found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We haven't added any {category.name_hinglish} to this specific page yet. Check back soon!
                </p>
              </div>
            )}
            
          </main>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}