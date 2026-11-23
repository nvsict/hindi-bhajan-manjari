import { supabase } from '@/utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/Breadcrumbs';
import { FaBookOpen, FaArrowLeft, FaOm, FaSearch } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

// 🌟 IMPORT THE NEW CLIENT COMPONENT
import WordActionButtons from '@/components/WordActionButtons';

// 🌟 Cache dictionary words for 24 hours (super-fast ISR & edge caching)
export const revalidate = 86400;

interface Props {
  params: Promise<{ slug: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

// ==========================================
// 🌟 1. DYNAMIC SEO METADATA
// ==========================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // 🌟 FIX 2: Decode the URL parameter so Hindi matches the database perfectly
  const decodedSlug = decodeURIComponent(slug);
  
  const { data: word } = await supabase
    .from('dictionary')
    .select('*')
    .eq('slug', decodedSlug) 
    .single();

  if (!word) return { title: 'Word Not Found' };

  const pageUrl = `${siteUrl}/shabdkosh/${word.slug}`;
  const dynamicDescription = `${word.word_hi} (${word.word_en}) का अर्थ और भावार्थ। Discover the deep spiritual meaning of the Hindu devotional word '${word.word_hi}' in Hindi and English.`;

  return {
    metadataBase: new URL(siteUrl),
    title: `${word.word_hi} Meaning in Hindi & English | Sanatan Shabdkosh`,
    description: dynamicDescription,
    keywords: `${word.word_hi} meaning, ${word.word_hi} in hindi, ${word.word_en} spiritual meaning, Bhavarth of ${word.word_en}, Sanatan Shabdkosh, Hindu dictionary`,
    alternates: {
      canonical: pageUrl,
    },
    openGraph: {
      title: `Meaning of ${word.word_hi} (${word.word_en})`,
      description: dynamicDescription,
      url: pageUrl,
      type: 'article',
      siteName: 'Hindi Bhajan Manjari',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${word.word_hi} Meaning`,
      description: dynamicDescription,
    }
  };
}

// ==========================================
// 🌟 2. MAIN PAGE COMPONENT
// ==========================================
export default async function ShabdkoshWordPage({ params }: Props) {
  const { slug } = await params;

  // 🌟 FIX 2: Decode the URL parameter here as well
  const decodedSlug = decodeURIComponent(slug);

  const { data: word, error } = await supabase
    .from('dictionary')
    .select('*')
    .eq('slug', decodedSlug) 
    .single();

  if (error || !word) {
    notFound();
  }

  // Fetch 3 random related words for "Explore More"
  const { data: relatedWords } = await supabase
    .from('dictionary')
    .select('word_hi, word_en, slug')
    .neq('slug', decodedSlug) 
    .limit(3);

  const breadcrumbItems = [
    { label: 'Sanatan Shabdkosh', href: '/shabdkosh' },
    { label: word.word_en || word.word_hi }
  ];

  const pageUrl = `${siteUrl}/shabdkosh/${word.slug}`;

  // ==========================================
  // 🌟 3. DEFINED TERM SCHEMA
  // ==========================================
  const wordSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": pageUrl,
    "name": word.word_hi,
    "alternateName": word.word_en || "",
    "description": word.meaning_hi,
    "inLanguage": "hi",
    "inDefinedTermSet": {
      "@type": "DefinedTermSet",
      "@id": `${siteUrl}/shabdkosh`,
      "name": "Sanatan Shabdkosh",
      "url": `${siteUrl}/shabdkosh`
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f8] relative selection:bg-orange-200 selection:text-orange-900">
      
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(wordSchema) }} />

      {/* Decorative Background */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-50/80 to-transparent pointer-events-none z-0"></div>
      <div className="absolute top-10 right-10 text-orange-500/5 pointer-events-none z-0">
        <GiLotusFlower size={300} />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 relative z-10">
        
        {/* Navigation & Breadcrumbs */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Breadcrumbs items={breadcrumbItems} />
          <Link 
            href="/shabdkosh" 
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-orange-600 transition-colors bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm w-max"
          >
            <FaArrowLeft /> शब्दकोश में वापस जाएं
          </Link>
        </div>

        {/* --- MAIN WORD CARD --- */}
        <main className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl shadow-orange-900/5 border border-orange-100/50 relative overflow-hidden">
          
          <div className="absolute -bottom-10 -right-10 text-[200px] text-gray-50 pointer-events-none select-none z-0">
            <FaOm />
          </div>

          <div className="relative z-10">
            
            <div className="border-b border-gray-100 pb-8 mb-8 text-center md:text-left">
              <div className="inline-flex items-center justify-center gap-2 bg-orange-50 text-orange-600 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest mb-6 border border-orange-100">
                <FaBookOpen /> Spiritual Dictionary
              </div>
              
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-5xl md:text-7xl font-black text-gray-900 font-hindi tracking-tighter mb-2">
                    {word.word_hi}
                  </h1>
                  {word.word_en && (
                    <div className="flex items-center justify-center md:justify-start gap-3 text-gray-400">
                      <span className="text-xl md:text-2xl font-bold uppercase tracking-[0.2em]">{word.word_en}</span>
                    </div>
                  )}
                </div>
                
                {/* Interactive Client Component for TTS & Share */}
                <WordActionButtons 
                  wordHi={word.word_hi} 
                  wordEn={word.word_en || ""} 
                  meaning={word.meaning_hi} 
                />
              </div>
            </div>

            <div className="space-y-8 md:space-y-12">
              
              <div className="relative">
                <div className="absolute -left-6 top-0 w-1.5 h-full bg-orange-500 rounded-r-md hidden md:block"></div>
                <h2 className="text-sm font-black text-orange-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                  हिंदी भावार्थ <span className="w-10 h-px bg-orange-200"></span>
                </h2>
                <p className="text-2xl md:text-3xl text-gray-800 font-hindi leading-[1.8] font-medium">
                  {word.meaning_hi}
                </p>
              </div>

              {word.meaning_en && (
                <div className="relative">
                  <div className="absolute -left-6 top-0 w-1.5 h-full bg-blue-500 rounded-r-md hidden md:block"></div>
                  <h2 className="text-sm font-black text-blue-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                    English Meaning <span className="w-10 h-px bg-blue-200"></span>
                  </h2>
                  <p className="text-lg md:text-xl text-gray-700 leading-[1.8] font-medium">
                    {word.meaning_en}
                  </p>
                </div>
              )}

              {word.detailed_explanation && (
                <div className="mt-8 pt-8 border-t border-gray-100">
                  <h3 className="text-lg font-black text-gray-900 mb-4">विस्तृत जानकारी (Detailed Overview)</h3>
                  <div className="text-gray-600 leading-relaxed font-hindi text-lg">
                    {word.detailed_explanation}
                  </div>
                </div>
              )}

            </div>
          </div>
        </main>

        {/* --- CONTEXTUAL SEARCH IN BHAJANS --- */}
        <div className="mt-12 bg-gradient-to-r from-orange-500 to-red-500 rounded-[2rem] p-8 md:p-10 text-white shadow-xl shadow-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-black font-hindi mb-2">"{word.word_hi}" वाले भजन खोजें</h3>
            <p className="text-orange-100 font-medium">देखें कि हमारे संग्रह में यह पवित्र शब्द किन-किन भजनों और आरतियों में प्रयोग हुआ है।</p>
          </div>
          <Link 
            href={`/search?q=${encodeURIComponent(word.word_hi)}`}
            className="shrink-0 bg-white text-orange-600 px-8 py-4 rounded-full font-black text-sm uppercase tracking-widest hover:bg-orange-50 hover:scale-105 transition-all shadow-md flex items-center gap-3"
          >
            <FaSearch /> Search Bhajans
          </Link>
        </div>

        {/* --- EXPLORE RELATED WORDS --- */}
        {relatedWords && relatedWords.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">अन्य शब्द खोजें (Explore More)</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedWords.map((rw) => (
                <Link 
                  key={rw.slug} 
                  href={`/shabdkosh/${rw.slug}`}
                  className="bg-white p-6 rounded-2xl border border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all duration-300 group flex justify-between items-center"
                >
                  <div>
                    <h4 className="text-xl font-black font-hindi text-gray-900 group-hover:text-orange-600 transition-colors">{rw.word_hi}</h4>
                    {rw.word_en && (
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">{rw.word_en}</p>
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    &rarr;
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}