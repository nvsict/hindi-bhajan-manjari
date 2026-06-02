import { supabase } from '../../utils/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react';
import Breadcrumbs from '../../components/Breadcrumbs';
import { FaBookOpen, FaClock, FaCalendarAlt, FaChevronRight, FaGlobe } from 'react-icons/fa';


// ==========================================
// 🌟 1. HIGH-CTR SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'सनातन ज्ञान (Sanatan Gyan) - Articles & Deep Meanings | Hindi Bhajan Manjari',
  description: 'सनातन धर्म के रहस्यों, भजनों के वास्तविक अर्थ (Bhavarth), और पूजा पद्धति के नियमों को गहराई से समझें। (Understand the deep meanings of Sanatan Dharma and Bhajans).',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/gyan`,
  }
};

// ==========================================
// 🌟 2. PERFORMANCE: NEXT.JS ISR
// ==========================================
// Revalidate the page every 1 hour (3600 seconds) for blazing fast loads
export const revalidate = 3600;

// ==========================================
// 🌟 3. TYPESCRIPT INTERFACES
// ==========================================
interface Article {
  title_hindi: string;
  title_hinglish: string;
  slug: string;
  meta_description: string;
  read_time_minutes: number;
  published_at: string;
  author_name: string;
  featured_image_url: string | null;
  slug_english: string | null;
  is_published_english: boolean;
}

export default async function GyanIndexPage() {
  // Fetching featured_image_url, slug_english, and is_published_english
  const { data, error } = await supabase
    .from('articles')
    .select('title_hindi, title_hinglish, slug, meta_description, read_time_minutes, published_at, author_name, featured_image_url, slug_english, is_published_english')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  const articles = data as Article[] | null;

  // ==========================================
  // 🌟 4. GOOGLE BLOG/COLLECTION SCHEMA
  // ==========================================
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Sanatan Gyan - Hindi Bhajan Manjari",
    "description": "Deep spiritual articles and meanings of Hindu Bhajans.",
    "url": `${siteUrl}/gyan`,
    "blogPost": articles ? articles.map(article => ({
      "@type": "BlogPosting",
      "headline": article.title_hindi,
      "url": `${siteUrl}/gyan/${article.slug}`,
      "datePublished": article.published_at,
      "image": article.featured_image_url || undefined,
      "author": {
        "@type": "Person",
        "name": article.author_name
      }
    })) : []
  };

  return (
    <main className="min-h-screen bg-orange-50/30 pb-20">
      {/* Inject JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Gyan' }]} />

        {/* --- HERO SECTION --- */}
        <header className="mt-6 mb-12 bg-white p-8 md:p-14 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shadow-sm mb-6 relative z-10 border border-orange-100">
            <FaBookOpen className="text-4xl" aria-hidden="true" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 relative z-10 tracking-tight font-hindi">
            सनातन <span className="text-orange-600">ज्ञान</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium relative z-10 max-w-3xl leading-relaxed font-hindi">
            भजनों के भावार्थ, पूजा के नियम, और सनातन धर्म के उन गूढ़ रहस्यों को सरल भाषा में समझें जो हमारी आस्था का आधार हैं।
          </p>
        </header>

        {/* --- ARTICLES GRID --- */}
        {error || !articles || articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 text-lg font-medium">नई ज्ञानवर्धक सामग्री जल्द ही आ रही है... (New articles coming soon!)</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => {
              const publishDate = new Date(article.published_at).toLocaleDateString('hi-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <Fragment key={article.slug}>
                  <article className="h-full flex flex-col group overflow-hidden bg-white rounded-3xl border border-orange-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300">
                    <Link 
                      href={`/gyan/${article.slug}`} 
                      className="flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-3xl"
                      aria-label={`Read article: ${article.title_hinglish}`}
                    >
                      
                      {/* Featured Image Header */}
                      {article.featured_image_url && (
                        <div className="relative w-full h-52 bg-gray-100 border-b border-orange-100/50 overflow-hidden shrink-0">
                          <Image
                            src={article.featured_image_url}
                            alt={`Cover image for ${article.title_hinglish}`}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          
                          {/* "English Available" Badge over image */}
                          {article.is_published_english && article.slug_english && (
                            <div className="absolute top-4 right-4 bg-white/95 backdrop-blur text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                              <FaGlobe aria-hidden="true" /> EN Available
                            </div>
                          )}
                        </div>
                      )}

                      <div className="p-7 md:p-8 flex-1 flex flex-col">
                        {/* Meta Info */}
                        <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">
                          <span className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100/50 group-hover:bg-orange-100 transition-colors">
                            <FaClock className="mb-0.5" aria-hidden="true" /> {article.read_time_minutes} Min
                          </span>
                          <time dateTime={article.published_at} className="flex items-center gap-1.5 text-gray-500">
                            <FaCalendarAlt className="mb-0.5" aria-hidden="true" /> {publishDate}
                          </time>
                          
                          {/* Fallback Badge if no image is present */}
                          {!article.featured_image_url && article.is_published_english && article.slug_english && (
                            <span className="flex items-center gap-1.5 text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100/50">
                              <FaGlobe aria-hidden="true" /> EN
                            </span>
                          )}
                        </div>

                        {/* Titles */}
                        <h2 className="font-hindi text-2xl font-black text-gray-900 mb-2 leading-tight group-hover:text-orange-600 transition-colors line-clamp-3">
                          {article.title_hindi}
                        </h2>
                        <h3 className="text-sm font-medium text-gray-500 mb-4 line-clamp-1">
                          {article.title_hinglish}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-600 font-hindi leading-relaxed line-clamp-3 mb-6 flex-1">
                          {article.meta_description}
                        </p>

                        {/* Read More Button */}
                        <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between text-orange-600 font-bold text-sm">
                          पूरा पढ़ें (Read Article)
                          <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                            <FaChevronRight className="text-xs group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>

                </Fragment>
              );
            })}
          </section>
        )}

      </div>
    </main>
  );
}