import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import BhajanList from '../../../components/BhajanList';
import FAQAccordion from '../../../components/FAQAccordion';
import { GiTempleGate } from 'react-icons/gi';
import { FaBookOpen, FaPenNib } from 'react-icons/fa';
import Link from 'next/link';

// 🌟 PERFORMANCE FIX: Set to 3600 (1 hour) for production caching to prevent database overload
export const revalidate = 3600; 

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

// ==========================================
// 🌟 1. DYNAMIC SEO METADATA (AdSense & Search Optimized)
// ==========================================
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  
  // 🌟 Fetching rich_description for better SEO Meta
  const { data: category, error } = await supabase
    .from('categories')
    .select('name_hinglish, name_hindi, rich_description')
    .eq('slug', slug)
    .single();

  // 🌟 Safe Error Handling to prevent 5XX server errors on missing slugs
  if (error || !category) {
    return { title: 'Category Not Found | Hindi Bhajan Manjari' };
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  
  // 🌟 SEO FIX: Prevent Duplicate Titles using Page Suffix
  const pageSuffix = currentPage > 1 ? ` - Page ${currentPage}` : '';
  
  // 🌟 SEO FIX: Accurate Canonical Tag for Pagination
  const canonicalUrl = currentPage > 1 
    ? `${baseUrl}/category/${slug}?page=${currentPage}` 
    : `${baseUrl}/category/${slug}`;
  
  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  ogImageUrl.searchParams.set('title', category.name_hindi);
  ogImageUrl.searchParams.set('subtitle', `${category.name_hinglish} Collection${pageSuffix}`);
  ogImageUrl.searchParams.set('badge', '✨ Spiritual Library');

  // Fallback description if DB is empty
  const metaDesc = category.rich_description 
    ? `${category.rich_description.substring(0, 150)}...` 
    : `Explore our complete collection of ${category.name_hinglish} (${category.name_hindi})${pageSuffix}. Read accurate lyrics, meanings, and free PDFs.`;

  return {
    title: `${category.name_hindi} लिरिक्स | Best ${category.name_hinglish} Lyrics & Meanings${pageSuffix} | Hindi Bhajan Manjari`,
    description: metaDesc,
    keywords: `${category.name_hinglish}, ${category.name_hindi}, ${category.name_hinglish} lyrics, best ${category.name_hindi} sangrah, ${category.name_hinglish} PDF, Hindi Bhajan Manjari, spiritual meanings`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `${category.name_hindi} Collection${pageSuffix}`,
      description: metaDesc,
      url: canonicalUrl,
      type: 'website',
      siteName: 'Hindi Bhajan Manjari',
      images: [{ url: ogImageUrl.toString(), width: 1200, height: 630, alt: `${category.name_hinglish} Lyrics Collection` }],
    },
    twitter: { card: 'summary_large_image', images: [ogImageUrl.toString()] },
  };
}

// ==========================================
// 🌟 2. MAIN PAGE COMPONENT
// ==========================================
export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;

  const resolvedSearchParams = await searchParams;
  const currentPage = resolvedSearchParams?.page ? Number(resolvedSearchParams.page) : 1;
  const itemsPerPage = 10;
  const from = (currentPage - 1) * itemsPerPage;
  const to = from + itemsPerPage - 1;

  // 🌟 Fetching smart content from the new DB columns
  const { data: category, error: catError } = await supabase
    .from('categories')
    .select('id, name_hinglish, name_hindi, slug, rich_description, dynamic_faqs')
    .eq('slug', slug)
    .single();

  if (catError || !category) {
    notFound();
  }

  // 🌟 SPEED BOOST & FIX: Fetching Bhajans directly from the View using JSONB contains
  const { data: rawBhajans, count, error: fetchError } = await supabase
    .from('mv_bhajan_details')
    .select(`
      id,
      title_hinglish, 
      title_hindi, 
      slug, 
      lyrics_hindi,
      video_embed_url,
      created_at,
      deity,
      categories
    `, { count: 'exact' })
    .contains('categories', JSON.stringify([{ id: category.id }])) // 🌟 MAGIC JSON FILTER
    .order('created_at', { ascending: false }) 
    .range(from, to);

  if (fetchError) {
    console.error("🔥 SUPABASE ERROR on Category Page:", fetchError);
  }

  interface BhajanData {
    id: string;
    title_hinglish: string;
    title_hindi: string;
    slug: string;
    lyrics_hindi: string;
    video_embed_url?: string;
    deity: { name_hinglish: string } | null;
    categories: { name_hinglish: string }[] | null;
  }

  const initialBhajans = (rawBhajans
    ?.filter(Boolean)
    .map((b: any) => ({
      id: b.id,
      title_hinglish: b.title_hinglish,
      title_hindi: b.title_hindi,
      slug: b.slug,
      lyrics_hindi: b.lyrics_hindi,
      video_embed_url: b.video_embed_url, 
      deity: Array.isArray(b.deity) ? b.deity[0] : b.deity,
      categories: [{ name_hinglish: category.name_hinglish }] 
    })) as BhajanData[]) || [];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = currentPage > 1 ? `${baseUrl}/category/${slug}?page=${currentPage}` : `${baseUrl}/category/${slug}`;

  const breadcrumbItems = [
    { label: 'Categories', href: '/category' },
    { label: category.name_hinglish, href: `/category/${category.slug}` }
  ];

  // 🌟 SMART FAQS: Use DB FAQs if available, else use a slightly smart fallback
  const categoryFaqs = category.dynamic_faqs || [
    { question: `इस ${category.name_hindi} संग्रह में क्या खास है?`, answer: `हमने इस ${category.name_hindi} संग्रह में केवल प्रमाणित और प्राचीन पाठों को शामिल किया है, साथ ही उनके भावार्थ भी उपलब्ध कराये हैं।` },
    { question: `क्या मैं इन ${category.name_hindi} को ऑफलाइन पढ़ सकता हूँ?`, answer: `जी हाँ! आप वेबसाइट के 'My Sangrah' फीचर का उपयोग करके इन्हें सेव कर सकते हैं या PDF डाउनलोड कर सकते हैं।` },
    { question: `अगर मुझे कोई अन्य ${category.name_hindi} चाहिए तो क्या करूँ?`, answer: `आप हमारे 'Submit Bhajan' पेज के माध्यम से हमें सुझाव भेज सकते हैं, हम उसे जल्द ही जोड़ देंगे।` }
  ];

  // JSON-LD Schema Generation
  const graphNodes: any[] = [];
  graphNodes.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": "Categories", "item": `${baseUrl}/category` },
      { "@type": "ListItem", "position": 3, "name": category.name_hinglish, "item": pageUrl }
    ]
  });

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

  // Only show FAQ Schema on Page 1 to avoid duplicate content flags
  if (currentPage === 1) {
    graphNodes.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      "mainEntity": categoryFaqs.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": { "@type": "Answer", "text": faq.answer }
      }))
    });
  }

  return (
    <div className="min-h-screen bg-orange-50/30 selection:bg-orange-100 selection:text-orange-900">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ "@context": "https://schema.org", "@graph": graphNodes }) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 items-start mt-6">
          <main className="flex-1 w-full min-w-0">
            
            {/* 🌟 1. RICH HEADER WITH DYNAMIC DESCRIPTION */}
            <div className="mb-10 p-8 md:p-10 bg-white rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 text-orange-600 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-orange-200 shadow-inner">
                  <GiTempleGate size={42} />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 tracking-tight">
                    {category.name_hindi} <span className="text-orange-600">संग्रह</span>
                  </h1>
                  {/* Smart DB Description or Smart Fallback */}
                  <p className="text-gray-600 text-lg font-medium leading-relaxed max-w-3xl">
                    {category.rich_description || `यहाँ आपको सनातन धर्म के प्रमुख ${category.name_hindi} का प्रामाणिक संग्रह मिलेगा। हमारी टीम ने हर एक पाठ को अर्थ (Bhavarth) और सही उच्चारण के साथ प्रस्तुत करने का प्रयास किया है।`}
                    {currentPage > 1 && <span className="ml-2 px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-sm font-bold">Page {currentPage}</span>}
                  </p>
                </div>
              </div>
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-400 rounded-full opacity-10 blur-3xl pointer-events-none"></div>
            </div>

            {/* 🌟 2. BHAJAN LIST */}
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
                <div className="w-20 h-20 bg-gray-50 text-gray-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <GiTempleGate size={40} opacity={0.5} />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 mb-2">No Content Found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  We haven't added any {category.name_hinglish} to this specific page yet. Check back soon!
                </p>
              </div>
            )}

            {/* 🌟 3. COMMUNITY CONTRIBUTION BANNER */}
            {initialBhajans.length > 0 && (
              <div className="mt-10 bg-gradient-to-r from-orange-600 to-orange-500 rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-orange-900/10 flex flex-col md:flex-row items-center justify-between gap-6 mb-10">
                <div>
                  <h3 className="text-2xl font-black mb-2 tracking-tight">कोई {category.name_hindi} भजन छूट गया क्या?</h3>
                  <p className="text-orange-100 font-medium">
                    हमारा उद्देश्य इस डिजिटल लाइब्रेरी को सबसे बड़ा और शुद्ध बनाना है। अगर आपका पसंदीदा पाठ यहाँ नहीं है, तो कृपया हमें भेजें।
                  </p>
                </div>
                <Link 
                  href="/submit" 
                  className="shrink-0 flex items-center gap-2 bg-white text-orange-600 px-6 py-3.5 rounded-full font-black uppercase tracking-widest text-sm hover:bg-orange-50 transition-all shadow-md hover:-translate-y-0.5"
                >
                  <FaPenNib /> Submit Now
                </Link>
              </div>
            )}

            {/* 🌟 4. RICH FAQS SECTION (From DB) */}
            {currentPage === 1 && initialBhajans.length > 0 && (
              <>
                <div className="mt-4 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-gray-100 mb-8">
                  <div className="flex items-center gap-3 mb-6">
                    <FaBookOpen className="text-orange-500 text-2xl" />
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                      {category.name_hindi} के बारे में अक्सर पूछे जाने वाले प्रश्न
                    </h2>
                  </div>
                  {/* Passing the Dynamic FAQs */}
                  <FAQAccordion faqs={categoryFaqs} />
                </div>
              </>
            )}
            
          </main>
          
          <Sidebar />
          
        </div>
      </div>
    </div>
  );
}