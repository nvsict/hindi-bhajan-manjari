import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import BhajanList from '../../../components/BhajanList';
import AuthorBox from '../../../components/AuthorBox';
import FAQAccordion from '../../../components/FAQAccordion';
import { FaFire, FaBookOpen } from 'react-icons/fa';
import TrendingBhajans from '../../../components/TrendingBhajans';

export const revalidate = 3600; // Cache the page for 1 hour for lightning fast loads

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ==========================================
// 🌟 1. HIGH-CTR SEO METADATA (Click-Magnet & Duplicate Title Fix)
// ==========================================
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;

  const { data: deity, error } = await supabase
    .from('deities')
    .select('name_hinglish, name_hindi')
    .eq('slug', slug)
    .single();

  if (error || !deity) return { title: 'Not Found | Hindi Bhajan Manjari' };

  const currentYear = new Date().getFullYear();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  
  // 🌟 SEO FIX: Suffix for paginated pages to prevent "Duplicate Title Tags"
  const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : '';
  const canonicalUrl = currentPage > 1 ? `${siteUrl}/deity/${slug}?page=${currentPage}` : `${siteUrl}/deity/${slug}`;
  
  const dynamicDescription = `Read the most authentic and popular ${deity.name_hinglish} (${deity.name_hindi}) bhajans, aartis, and chalisa. Complete lyrics with meanings, curated by experts.${pageSuffix}`;

  return {
    metadataBase: new URL(siteUrl),
    title: `100+ Best ${deity.name_hindi} Bhajans & Aarti Lyrics (${currentYear})${pageSuffix} | Hindi Bhajan Manjari`,
    description: dynamicDescription,
    keywords: `${deity.name_hinglish} bhajans, ${deity.name_hindi} भजन, ${deity.name_hinglish} aarti lyrics, ${deity.name_hinglish} chalisa, Hindi Bhajan Manjari, best ${deity.name_hinglish} songs`,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `Best ${deity.name_hindi} Bhajans & Aarti Collection${pageSuffix}`,
      description: dynamicDescription,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Hindi Bhajan Manjari',
      images: [
        {
          url: `${siteUrl}/og-image.jpg`, 
          width: 1200,
          height: 630,
          alt: `${deity.name_hinglish} Bhajans Collection`,
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      title: `${deity.name_hindi} Bhajans Collection${pageSuffix}`,
      description: dynamicDescription,
    }
  };
}

export default async function DeityPage({ params, searchParams }: Props) {
  const { slug } = await params;

  // 🌟 SEO FIX: Extract page for offset calculation
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  const itemsPerPage = 10;
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 2. Fetch Deity
  const { data: deity, error: deityError } = await supabase
    .from('deities')
    .select('id, name_hinglish, name_hindi, slug') 
    .eq('slug', slug)
    .single();

  if (deityError || !deity) {
    notFound();
  }

  // 3. Fetch Bhajans for this Deity (with pagination logic)
  const { data: rawBhajans, count } = await supabase
    .from('bhajans')
    .select(`
      title_hinglish, 
      title_hindi, 
      slug, 
      lyrics_hindi,
      video_embed_url, 
      deities ( name_hinglish ), 
      categories ( name_hinglish )
    `, { count: 'exact' })
    .eq('deity_id', deity.id)
    .order('created_at', { ascending: false })
    .range(from, to); 

  const initialBhajans = rawBhajans?.map((bhajan: any) => ({
    ...bhajan,
    deities: Array.isArray(bhajan.deities) ? bhajan.deities[0] : bhajan.deities,
    categories: Array.isArray(bhajan.categories) ? bhajan.categories[0] : bhajan.categories,
  })) || [];

  // Fetch Trending/Classic Bhajans (Top 5) - ONLY ON PAGE 1 to avoid DB load & duplicate content
  let trendingBhajans = null;
  if (currentPage === 1) {
    const { data } = await supabase
      .from('bhajans')
      .select('title_hindi, title_hinglish, slug')
      .eq('deity_id', deity.id)
      .order('created_at', { ascending: true }) 
      .limit(5);
    trendingBhajans = data;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = currentPage > 1 ? `${siteUrl}/deity/${slug}?page=${currentPage}` : `${siteUrl}/deity/${slug}`;

  // ==========================================
  // 🌟 4. DYNAMIC FAQS FOR SEO
  // ==========================================
  const deityFaqs = [
    {
      question: `${deity.name_hindi} के सबसे प्रसिद्ध भजन कौन से हैं?`,
      answer: `हमारे संग्रह में ${deity.name_hindi} के सभी प्राचीन और प्रसिद्ध भजन, आरती और चालीसा उपलब्ध हैं। आप ऊपर दी गई सूची से अपने पसंदीदा भजन पढ़ सकते हैं।`
    },
    {
      question: `${deity.name_hindi} की आरती पढ़ने का सही समय क्या है?`,
      answer: `आमतौर पर ${deity.name_hindi} की स्तुति और आरती प्रातः काल स्नान के बाद और संध्या वंदन के समय करना सबसे शुभ माना जाता है।`
    },
    {
      question: `क्या मैं इन भजनों की PDF डाउनलोड कर सकता हूँ?`,
      answer: `हाँ! आप हमारी वेबसाइट पर किसी भी भजन को खोलकर 'Download PDF' बटन पर क्लिक करके उसे अपने फोन में सेव कर सकते हैं ताकि आप बिना इंटरनेट के भी पढ़ सकें।`
    }
  ];

  // ==========================================
  // 🌟 5. ADVANCED SEO SCHEMA GRAPH
  // ==========================================
  const graphNodes: any[] = [];

  graphNodes.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Deities", "item": `${siteUrl}/deity` }, 
      { "@type": "ListItem", "position": 3, "name": deity.name_hinglish, "item": pageUrl }
    ]
  });

  const allVisibleBhajans = [...(trendingBhajans || []), ...(rawBhajans || [])];
  const uniqueBhajans = Array.from(new Set(allVisibleBhajans.map(b => b.slug)))
    .map(slug => allVisibleBhajans.find(b => b.slug === slug));

  if (uniqueBhajans.length > 0) {
    graphNodes.push({
      "@type": "ItemList",
      "@id": `${pageUrl}#itemlist`,
      "name": `Top ${deity.name_hinglish} Bhajans - Page ${currentPage}`,
      "itemListElement": uniqueBhajans.map((b: any, index: number) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": `${siteUrl}/bhajan/${b.slug}`,
        "name": b.title_hindi || b.title_hinglish
      }))
    });
  }

  // 🌟 SEO FIX: Only show FAQ Schema on Page 1 to prevent duplicate structured data errors
  if (currentPage === 1) {
    graphNodes.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      "mainEntity": deityFaqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  graphNodes.push({
    "@type": "CollectionPage",
    "@id": pageUrl,
    "url": pageUrl,
    "name": `${deity.name_hindi} Bhajans Collection`,
    "description": `A curated collection of sacred bhajans dedicated to ${deity.name_hinglish}.`,
    "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
    "mainEntity": uniqueBhajans.length > 0 ? { "@id": `${pageUrl}#itemlist` } : undefined
  });

  const advancedCollectionSchema = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };

  return (
    <div className="min-h-screen bg-orange-50/30">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedCollectionSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[{ label: deity.name_hinglish }]} />

        <div className="flex flex-col lg:flex-row gap-8 items-start mt-4">
          <main className="flex-1 w-full min-w-0">
            
            {/* --- HERO SECTION --- */}
            <div className="mb-10 bg-white p-8 md:p-10 rounded-3xl border border-orange-100 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
              
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 relative z-10 tracking-tight">
                {deity.name_hindi} <span className="text-orange-600">Bhajans & Aarti</span>
              </h1>
              <p className="text-gray-600 text-lg md:text-xl font-medium relative z-10 max-w-2xl leading-relaxed">
                Immerse yourself in devotion. Explore our expertly curated collection of sacred lyrics, aartis, and chalisa dedicated to {deity.name_hinglish}.
                {currentPage > 1 && <span className="ml-2 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-bold">Page {currentPage}</span>}
              </p>
            </div>

            {/* 🌟 SEO FIX: Only show trending on Page 1 to avoid duplicate content layouts */}
            {currentPage === 1 && trendingBhajans && trendingBhajans.length > 0 && (
              <TrendingBhajans 
                bhajans={trendingBhajans} 
                deityNameHindi={deity.name_hindi} 
              />
            )}

            {/* --- CURATION SECTION --- */}
            <div className="mb-8 flex items-center gap-3 border-b border-orange-200/60 pb-3">
              <FaFire className="text-orange-500 text-xl" />
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">
                Latest Additions
              </h2>
            </div>

            {/* 🌟 FIXED: Passed pagination props to BhajanList */}
            <BhajanList 
              initialBhajans={initialBhajans} 
              deityId={deity.id}
              deitySlug={deity.slug}
              currentPage={currentPage}
              totalItems={count || 0}
              itemsPerPage={itemsPerPage}
            />

            {/* 🌟 SEO FIX: Only show description and FAQ on Page 1 */}
            {currentPage === 1 && (
              <>
                <div className="mt-16 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FaBookOpen className="text-orange-500 text-2xl" />
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900">
                      {deity.name_hindi} की महिमा और भजन का महत्व
                    </h2>
                  </div>
                  
                  <div className="text-lg text-gray-700 font-hindi leading-loose space-y-4">
                    <p>
                      हिन्दू धर्म में <strong>{deity.name_hindi}</strong> की उपासना का विशेष महत्व है। 
                      भक्ति मार्ग में भजनों के माध्यम से भगवान की स्तुति करना सबसे सरल और पवित्र माध्यम माना गया है। 
                      जब हम सच्चे मन से {deity.name_hindi} के भजनों का गायन करते हैं, तो मन को असीम शांति मिलती है 
                      और जीवन में सकारात्मक ऊर्जा का संचार होता है।
                    </p>
                    <p>
                      हमारी वेबसाइट पर आपको {deity.name_hinglish} के सबसे प्रसिद्ध भजनों, आरती और चालीसा का 
                      प्रामाणिक और त्रुटिहीन संग्रह मिलेगा। हम यह सुनिश्चित करते हैं कि सभी लिरिक्स व्याकरण 
                      और भाव दोनों दृष्टि से पूर्णतः शुद्ध हों।
                    </p>
                  </div>
                </div>

                <FAQAccordion faqs={deityFaqs} />
              </>
            )}

            <AuthorBox />

          </main>

          <aside className="hidden lg:block w-[320px] sticky top-24 shrink-0">
            <Sidebar 
              topicName={deity.name_hinglish}
              filterColumn="deity_id"
              filterValue={deity.id}
            />
          </aside>

        </div>
      </div>
    </div>
  );
}