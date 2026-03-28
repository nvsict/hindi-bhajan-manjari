import { supabase } from '../../utils/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '../../components/Breadcrumbs';
import { FaBookOpen, FaClock, FaCalendarAlt, FaChevronRight } from 'react-icons/fa';

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

export default async function GyanIndexPage() {
  // 2. Fetch all published articles
  const { data: articles, error } = await supabase
    .from('articles')
    .select('title_hindi, title_hinglish, slug, meta_description, read_time_minutes, published_at, author_name')
    .eq('is_published', true)
    .order('published_at', { ascending: false });

  // ==========================================
  // 🌟 3. GOOGLE BLOG/COLLECTION SCHEMA
  // ==========================================
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Sanatan Gyan - Hindi Bhajan Manjari",
    "description": "Deep spiritual articles and meanings of Hindu Bhajans.",
    "url": `${siteUrl}/gyan`,
    "blogPost": articles?.map(article => ({
      "@type": "BlogPosting",
      "headline": article.title_hindi,
      "url": `${siteUrl}/gyan/${article.slug}`,
      "datePublished": article.published_at,
      "author": {
        "@type": "Person",
        "name": article.author_name
      }
    }))
  };

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Gyan' }]} />

        {/* --- HERO SECTION --- */}
        <div className="mt-6 mb-12 bg-white p-8 md:p-14 rounded-[2.5rem] border border-orange-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-100/50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-50 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center shadow-sm mb-6 relative z-10 border border-orange-100">
            <FaBookOpen className="text-4xl" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 relative z-10 tracking-tight font-hindi">
            सनातन <span className="text-orange-600">ज्ञान</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium relative z-10 max-w-3xl leading-relaxed font-hindi">
            भजनों के भावार्थ, पूजा के नियम, और सनातन धर्म के उन गूढ़ रहस्यों को सरल भाषा में समझें जो हमारी आस्था का आधार हैं।
          </p>
        </div>

        {/* --- ARTICLES GRID --- */}
        {error || !articles || articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 text-lg font-medium">नई ज्ञानवर्धक सामग्री जल्द ही आ रही है... (New articles coming soon!)</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const publishDate = new Date(article.published_at).toLocaleDateString('hi-IN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              });

              return (
                <Link 
                  href={`/gyan/${article.slug}`} 
                  key={article.slug}
                  className="bg-white rounded-3xl border border-orange-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 flex flex-col h-full group overflow-hidden"
                >
                  <div className="p-8 flex-1 flex flex-col">
                    {/* Meta Info */}
                    <div className="flex items-center gap-4 text-xs font-bold text-orange-500 uppercase tracking-widest mb-4">
                      <span className="flex items-center gap-1.5 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100/50 group-hover:bg-orange-100 transition-colors">
                        <FaClock className="mb-0.5" /> {article.read_time_minutes} Min
                      </span>
                      <span className="flex items-center gap-1.5 text-gray-500">
                        <FaCalendarAlt className="mb-0.5" /> {publishDate}
                      </span>
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
                    <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between text-orange-600 font-bold text-sm">
                      पूरा पढ़ें (Read Article)
                      <FaChevronRight className="group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}