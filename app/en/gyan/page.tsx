import { supabase } from '../../../utils/supabase';
import { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { Fragment } from 'react';
import Breadcrumbs from '../../../components/Breadcrumbs';
import { 
  FaBookOpen, 
  FaClock, 
  FaCalendarAlt, 
  FaChevronRight, 
  FaLanguage,
  FaWhatsapp,
  FaFacebook,
  FaTwitter
} from 'react-icons/fa';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

// ==========================================
// 🌟 1. HIGH-CTR SEO & OPEN GRAPH METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'Sanatan Gyan - Spiritual Articles & Meanings | Hindi Bhajan Manjari',
  description: 'Discover the deep spiritual meanings behind Sanatan Dharma, Hindu Bhajans, and Vedic traditions in English.',
  keywords: ['Sanatan Gyan English', 'Spiritual Wisdom', 'Hindu Dharma in English', 'Bhajan Meanings', 'Vedic traditions', 'Hindi Bhajan Manjari'],
  alternates: {
    canonical: `${SITE_URL}/en/gyan`,
  },
  openGraph: {
    title: 'Sanatan Gyan - Spiritual Articles & Meanings',
    description: 'Discover the deep spiritual meanings behind Sanatan Dharma, Hindu Bhajans, and Vedic traditions in English.',
    url: `${SITE_URL}/en/gyan`,
    siteName: 'Hindi Bhajan Manjari',
    images: [
      {
        url: `${SITE_URL}/default-og-gyan-en.jpg`, // Replace with your actual default OG image path
        width: 1200,
        height: 630,
        alt: 'Sanatan Gyan English - Hindi Bhajan Manjari',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sanatan Gyan - Spiritual Articles & Meanings',
    description: 'Discover the deep spiritual meanings behind Sanatan Dharma, Hindu Bhajans, and Vedic traditions in English.',
    images: [`${SITE_URL}/default-og-gyan-en.jpg`],
  },
};

export const revalidate = 3600;

export default async function EnglishGyanIndexPage() {
  // 🌟 Fetch only articles where English version is published
  const { data: articles, error } = await supabase
    .from('articles')
    .select('title_english, slug_english, slug, meta_description_english, read_time_minutes, published_at, author_name, featured_image_url')
    .eq('is_published_english', true)
    .order('published_at', { ascending: false });

  // ==========================================
  // 🌟 2. GOOGLE BLOG/COLLECTION SCHEMA
  // ==========================================
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "name": "Sanatan Gyan (English) - Hindi Bhajan Manjari",
    "description": "Deep spiritual articles and meanings of Hindu Bhajans in English.",
    "url": `${SITE_URL}/en/gyan`,
    "blogPost": articles?.map(article => ({
      "@type": "BlogPosting",
      "headline": article.title_english,
      "url": `${SITE_URL}/en/gyan/${article.slug_english}`,
      "datePublished": article.published_at,
      "image": article.featured_image_url || undefined,
      "author": { "@type": "Person", "name": article.author_name }
    }))
  };

  return (
    <div className="min-h-screen bg-blue-50/30 pb-20">
      {/* Inject JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[{ label: 'Spiritual Wisdom', href: '/en/gyan' }]} />

        {/* --- HERO SECTION --- */}
        <header className="mt-6 mb-12 bg-white p-8 md:p-14 rounded-[2.5rem] border border-blue-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          
          <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center shadow-sm mb-6 relative z-10 border border-blue-100">
            <FaBookOpen className="text-4xl" aria-hidden="true" />
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 relative z-10 tracking-tight">
            Spiritual <span className="text-blue-600">Wisdom</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl font-medium relative z-10 max-w-3xl leading-relaxed">
            Understand the deep meanings of Bhajans, Vedic rituals, and the profound secrets of Sanatan Dharma in simple English.
          </p>
        </header>

        {/* --- ARTICLES GRID --- */}
        {error || !articles || articles.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-gray-100">
            <p className="text-gray-500 text-lg font-medium">New spiritual articles in English are coming very soon!</p>
          </div>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {articles.map((article) => {
              const publishDate = new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric'
              });

              // Encode URLs and Titles for Sharing
              const articleUrl = `${SITE_URL}/en/gyan/${article.slug_english}`;
              const encodedUrl = encodeURIComponent(articleUrl);
              const encodedTitle = encodeURIComponent(`Read: ${article.title_english} | Hindi Bhajan Manjari\n`);

              const whatsappShareUrl = `https://wa.me/?text=${encodedTitle}${encodedUrl}`;
              const facebookShareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
              const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`;

              return (
                <Fragment key={article.slug_english}>
                  <article className="bg-white rounded-3xl border border-blue-100/60 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 flex flex-col h-full group overflow-hidden">
                    
                    {/* 🌟 Featured Image Header (Clickable) */}
                    {article.featured_image_url && (
                      <Link href={`/en/gyan/${article.slug_english}`} className="relative w-full h-52 bg-gray-100 border-b border-blue-100/50 overflow-hidden shrink-0 block" aria-label={`Read article: ${article.title_english}`}>
                        <Image
                          src={article.featured_image_url}
                          alt={article.title_english || 'Article Image'}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-700"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                        <div className="absolute top-4 right-4 bg-white/95 backdrop-blur text-orange-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5">
                          <FaLanguage aria-hidden="true" /> Hindi Available
                        </div>
                      </Link>
                    )}

                    <div className="p-7 md:p-8 flex-1 flex flex-col">
                      {/* Meta Info */}
                      <div className="flex flex-wrap items-center gap-3 text-xs font-bold text-blue-500 uppercase tracking-widest mb-4">
                        <span className="flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100/50 group-hover:bg-blue-100 transition-colors">
                          <FaClock className="mb-0.5" aria-hidden="true" /> {article.read_time_minutes} Min
                        </span>
                        <time dateTime={article.published_at} className="flex items-center gap-1.5 text-gray-500">
                          <FaCalendarAlt className="mb-0.5" aria-hidden="true" /> {publishDate}
                        </time>
                      </div>

                      {/* Titles (Clickable) */}
                      <Link href={`/en/gyan/${article.slug_english}`} className="block focus:outline-none">
                        <h2 className="text-2xl font-black text-gray-900 mb-4 leading-tight group-hover:text-blue-600 transition-colors line-clamp-3">
                          {article.title_english}
                        </h2>
                      </Link>

                      {/* Description */}
                      <p className="text-gray-600 leading-relaxed line-clamp-3 mb-6 flex-1 font-medium">
                        {article.meta_description_english}
                      </p>

                      {/* Footer: Share Buttons & Read More */}
                      <div className="mt-auto pt-5 border-t border-gray-50 flex items-center justify-between">
                        
                        {/* 🌟 Social Share Links */}
                        <div className="flex items-center gap-4">
                          <a href={whatsappShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" className="text-gray-400 hover:text-green-500 transition-colors active:scale-95">
                            <FaWhatsapp size={20} />
                          </a>
                          <a href={facebookShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook" className="text-gray-400 hover:text-blue-600 transition-colors active:scale-95">
                            <FaFacebook size={20} />
                          </a>
                          <a href={twitterShareUrl} target="_blank" rel="noopener noreferrer" aria-label="Share on Twitter" className="text-gray-400 hover:text-sky-500 transition-colors active:scale-95">
                            <FaTwitter size={20} />
                          </a>
                        </div>

                        {/* Read More Button */}
                        <Link href={`/en/gyan/${article.slug_english}`} className="flex items-center gap-2 text-blue-600 font-bold text-sm hover:text-blue-700 transition-colors">
                          Read Article
                          <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                            <FaChevronRight className="text-xs group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                          </div>
                        </Link>
                      </div>
                    </div>
                  </article>
                </Fragment>
              );
            })}
          </section>
        )}

      </div>
    </div>
  );
}