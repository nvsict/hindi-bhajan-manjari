import { supabase } from '../../../utils/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { FaBookOpen, FaClock, FaCalendarAlt, FaChevronRight, FaLanguage } from 'react-icons/fa';


export const metadata: Metadata = {
  title: 'Sanatan Gyan - Spiritual Articles & Meanings | Hindi Bhajan Manjari',
  description: 'Discover the deep spiritual meanings behind Sanatan Dharma, Hindu Bhajans, and Vedic traditions in English.',
  alternates: {
    canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/en/gyan`,
  }
};

export const revalidate = 3600;

export default async function EnglishGyanIndexPage() {
  // 🌟 Fetch only articles where English version is published
  const { data: articles, error } = await supabase
    .from('articles')
    .select('title_english, slug_english, slug, meta_description_english, read_time_minutes, published_at, author_name, featured_image_url')
    .eq('is_published_english', true)
    .order('published_at', { ascending: false });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Sanatan Gyan (English) - Hindi Bhajan Manjari",
    "description": "Deep spiritual articles and meanings of Hindu Bhajans in English.",
    "url": `${siteUrl}/en/gyan`,
    "blogPost": articles?.map(article => ({
      "@type": "BlogPosting",
      "headline": article.title_english,
      "url": `${siteUrl}/en/gyan/${article.slug_english}`,
      "datePublished": article.published_at,
      "image": article.featured_image_url || undefined,
      "author": { "@type": "Person", "name": article.author_name }
    }))
  };

  return (
    <div className="min-h-screen bg-blue-50/30 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Spiritual Wisdom', href: '/en/gyan' }]} />

        {/* --- HERO SECTION --- */}
        <div className="mt-6 mb-12 bg-white p-8 md:p-14 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm mb-6 relative z-10 border border-blue-100">
            <FaBookOpen className="text-4xl" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 relative z-10 tracking-tight">
            Spiritual <span className="text-blue-600">Wisdom</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium relative z-10 max-w-3xl leading-relaxed">
            Understand the deep meanings of Bhajans, Vedic rituals, and the profound secrets of Sanatan Dharma in simple English.
          </p>
        </div>


        {/* --- ARTICLES GRID --- */}
        {error || !articles || articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 text-lg font-medium">New spiritual articles in English are coming very soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article, index) => {
              const publishDate = new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              });

              return (
                <Fragment key={article.slug_english}>
                  <Link 
                    href={`/en/gyan/${article.slug_english}`} 
                    className="bg-white rounded-3xl border border-blue-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col h-full group overflow-hidden"
                  >
                    {/* 🌟 Beautiful Landscape Image */}
                    {article.featured_image_url && (
                      <div className="relative w-full h-52 bg-gray-100 border-b border-blue-100/50 overflow-hidden shrink-0">
                        <Image
                          src={article.featured_image_url}
                          alt={article.title_english || 'Article Image'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                          <FaLanguage /> Hindi Available
                        </div>
                      </div>
                    )}

                    <div className="p-7 md:p-8 flex-1 flex flex-col">
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">
                        <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100/50">
                          <FaClock className="mb-0.5" /> {article.read_time_minutes} Min
                        </span>
                        <span className="flex items-center gap-1.5 text-gray-500">
                          <FaCalendarAlt className="mb-0.5" /> {publishDate}
                        </span>
                      </div>

                      <h2 className="text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors line-clamp-3">
                        {article.title_english}
                      </h2>

                      <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6 flex-1 font-medium">
                        {article.meta_description_english}
                      </p>

                      <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between text-blue-600 font-bold text-sm">
                        Read Full Article
                        <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                          <FaChevronRight className="text-xs group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </Fragment>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}