import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import BhajanList from '../../../components/BhajanList';
import FAQAccordion from '../../../components/FAQAccordion';
import { GiTempleGate } from 'react-icons/gi';
import { FaBookOpen, FaQuestionCircle } from 'react-icons/fa';

export const revalidate = 3600;
interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ==========================================
// 🌟 1. DYNAMIC SEO METADATA (With Pagination & Keywords)
// ==========================================
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  
  const { data: category } = await supabase
    .from('categories')
    .select('name_hinglish, name_hindi')
    .eq('slug', slug)
    .single();

  if (!category) return { title: 'Category Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : '';
  
  const canonicalUrl = currentPage > 1 
    ? `${baseUrl}/category/${slug}?page=${currentPage}` 
    : `${baseUrl}/category/${slug}`;
  
  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  ogImageUrl.searchParams.set('title', category.name_hindi);
  ogImageUrl.searchParams.set('subtitle', `${category.name_hinglish} Collection${pageSuffix}`);
  ogImageUrl.searchParams.set('badge', '✨ Bhajan Category');

  return {
    title: `Best ${category.name_hinglish} (${category.name_hindi}) Lyrics & PDFs${pageSuffix} | Hindi Bhajan Manjari`,
    description: `Explore our complete collection of ${category.name_hinglish} (${category.name_hindi})${pageSuffix}. Read accurate lyrics, download free PDFs, and understand their spiritual meanings.`,
    keywords: `${category.name_hinglish}, ${category.name_hindi}, ${category.name_hinglish} lyrics, best ${category.name_hindi} sangrah, ${category.name_hinglish} PDF download, Hindi Bhajan Manjari`,
    alternates: {
      canonical: canonicalUrl, 
    },
    openGraph: {
      title: `${category.name_hindi} Collection${pageSuffix}`,
      description: `Complete collection of ${category.name_hinglish} lyrics${pageSuffix}.`,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Hindi Bhajan Manjari',
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `${category.name_hinglish} Lyrics Collection`,
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

  // Calculate Pagination Offsets
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

  // Fetching with Pagination
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
    `, { count: 'exact' })
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
  const pageUrl = currentPage > 1 ? `${baseUrl}/category/${slug}?page=${currentPage}` : `${baseUrl}/category/${slug}`;

  const breadcrumbItems = [
    { label: 'Categories', href: '/category' },
    { label: category.name_hinglish, href: `/category/${category.slug}` }
  ];

  // ==========================================
  // 🌟 3. DYNAMIC FAQS (Only shown on Page 1)
  // ==========================================
  const categoryFaqs = [
    {
      question: `इस श्रेणी (${category.name_hindi}) में कौन-कौन सी रचनाएं शामिल हैं?`,
      answer: `इस श्रेणी में आपको ${category.name_hindi} से जुड़ी सभी प्रामाणिक और लोकप्रिय रचनाएं मिलेंगी। आप अपनी पसंद की रचना को हिंदी, अंग्रेजी या अन्य क्षेत्रीय भाषाओं में पढ़ सकते हैं।`
    },
    {
      question: `क्या मैं इन ${category.name_hindi} की PDF फाइल सेव कर सकता हूँ?`,
      answer: `जी हाँ! आप किसी भी रचना पर क्लिक करके उसे खोलें, और वहां दिए गए 'Download PDF' बटन का उपयोग करके उसे मुफ्त में अपने डिवाइस में सेव कर सकते हैं।`
    },
    {
      question: `${category.name_hindi} का पाठ करने के क्या लाभ हैं?`,
      answer: `सनातन धर्म में ${category.name_hindi} का पाठ करना अत्यंत फलदायी माना गया है। यह मन को असीम शांति प्रदान करता है और घर में सकारात्मक ऊर्जा (Positive Energy) का संचार करता है।`
    }
  ];

  // ==========================================
  // 🌟 4. ADVANCED SEO ENTITY GRAPH
  // ==========================================
  const graphNodes: any[] = [];

  // Breadcrumb Node
  graphNodes.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Categories", "item": `${baseUrl}/category` },
      { "@type": "ListItem", "position": 3, "name": category.name_hinglish, "item": pageUrl }
    ]
  });

  // ItemList Node
  if (initialBhajans.length > 0) {
    graphNodes.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      "name": `${category.name_hindi} Collection - Page ${currentPage}`,
      "itemListElement": initialBhajans.map((bhajan, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${baseUrl}/bhajan/${bhajan.slug}`,
        "name": bhajan.title_hindi
      }))
    });
  }

  // FAQ Node (Only add to Graph if it's page 1 to avoid duplicate schema errors)
  if (currentPage === 1) {
    graphNodes.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      "mainEntity": categoryFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  // CollectionPage Node
  graphNodes.push({
    "@type": "CollectionPage",
    "@id": pageUrl,
    "url": pageUrl,
    "name": `${category.name_hindi} Collection`,
    "description": `Complete collection of ${category.name_hinglish} lyrics.`,
    "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
    "mainEntity": initialBhajans.length > 0 ? { "@id": `${pageUrl}#itemlist` } : undefined
  });

  const advancedCollectionSchema = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };

  return (
    <div className="min-h-screen bg-orange-50/30">
      {/* 🌟 INJECT THE ADVANCED ENTITY GRAPH */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedCollectionSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 items-start mt-6">
          <main className="flex-1 w-full min-w-0">
            
            {/* HERO SECTION */}
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

            {/* BHAJAN LISTING */}
            {initialBhajans.length > 0 ? (
              <BhajanList 
                initialBhajans={initialBhajans} 
                categoryId={category.id} 
                categorySlug={category.slug}
                currentPage={currentPage}
                totalItems={count || 0}
                itemsPerPage={itemsPerPage}
              />
            ) : (
              <div className="bg-white p-16 md:p-24 rounded-[2.5rem] border border-dashed border-gray-300 text-center shadow-sm mb-8">
                <div className="w-20 h-20 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GiTempleGate size={40} opacity={0.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Content Found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We haven't added any {category.name_hinglish} to this specific page yet. Check back soon!
                </p>
              </div>
            )}

            {/* ==========================================
                🌟 SEO PILLAR CONTENT (ONLY ON PAGE 1)
                ========================================== */}
            {currentPage === 1 && initialBhajans.length > 0 && (
              <>
                <div className="mt-16 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FaBookOpen className="text-orange-500 text-2xl" />
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                      {category.name_hindi} का आध्यात्मिक महत्व
                    </h2>
                  </div>
                  
                  <div className="text-lg text-gray-700 font-hindi leading-loose space-y-4">
                    <p>
                      सनातन धर्म में <strong>{category.name_hindi}</strong> का एक विशेष और अत्यंत पवित्र स्थान है। 
                      यह केवल कुछ शब्दों का संग्रह नहीं है, बल्कि परमात्मा से जुड़ने और उनके प्रति अपनी श्रद्धा 
                      प्रकट करने का एक सरल और सुंदर माध्यम है।
                    </p>
                    <p>
                      हमारी वेबसाइट <strong>'हिंदी भजन मंजरी'</strong> पर आपको {category.name_hindi} का सबसे 
                      विस्तृत और प्रामाणिक संग्रह (Collection) मिलेगा। हमने यह सुनिश्चित किया है कि सभी लिरिक्स 
                      मात्राओं और उच्चारण की दृष्टि से बिल्कुल शुद्ध हों, ताकि आप बिना किसी दुविधा के अपनी दैनिक 
                      पूजा, सत्संग और साधना में इनका उपयोग कर सकें।
                    </p>
                  </div>
                </div>

                <FAQAccordion faqs={categoryFaqs} />
              </>
            )}
            
          </main>

          <Sidebar />
        </div>
      </div>
    </div>
  );
}