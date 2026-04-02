import { supabase } from '../../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import AuthorBox from '../../../../components/AuthorBox';
import { FaClock, FaCalendarAlt, FaBookOpen, FaLanguage } from 'react-icons/fa';

// 🌟 IMPORT THE AD COMPONENT & VIEW COUNTER
import ManualAdUnit from '@/components/ManualAdUnit';
import ArticleViewCounter from '@/components/ArticleViewCounter';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: article } = await supabase
    .from('articles')
    .select('title_english, meta_description_english, author_name, featured_image_url, slug, is_published')
    .eq('slug_english', slug)
    .eq('is_published_english', true)
    .single();

  if (!article) return { title: 'Article Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${siteUrl}/en/gyan/${slug}`;

  // Fallback OG image if custom one is missing
  const ogImageUrl = new URL(`${siteUrl}/api/og/articles`);
  ogImageUrl.searchParams.set('title', article.title_english || 'Sanatan Gyan');
  const finalImageUrl = article.featured_image_url || ogImageUrl.toString();

  // 🌟 SEO MAGIC: Hreflang Tags linking back to Hindi version
  const alternates: any = { canonical: pageUrl };
  if (article.slug && article.is_published) {
    alternates.languages = {
      'en': pageUrl,
      'hi': `${siteUrl}/gyan/${article.slug}`
    };
  }

  return {
    title: `${article.title_english} | Spiritual Wisdom`,
    description: article.meta_description_english,
    authors: article.author_name ? [{ name: article.author_name }] : undefined,
    alternates: alternates,
    openGraph: {
      title: article.title_english || 'Sanatan Gyan',
      description: article.meta_description_english || '',
      type: 'article',
      url: pageUrl,
      siteName: 'Hindi Bhajan Manjari',
      images: [{ url: finalImageUrl, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', title: article.title_english || 'Sanatan Gyan', images: [finalImageUrl] },
  };
}

export default async function EnglishArticlePage({ params }: Props) {
  const { slug } = await params;

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug_english', slug)
    .eq('is_published_english', true)
    .single();

  if (error || !article) notFound();

  const publishDateStr = new Date(article.published_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${siteUrl}/en/gyan/${slug}`;
  const finalImageUrl = article.featured_image_url || `${siteUrl}/api/og/articles?title=${encodeURIComponent(article.title_english || '')}`;

  // 🌟 Schema Generation
  const advancedArticleSchema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title_english,
    "description": article.meta_description_english,
    "image": [finalImageUrl],
    "datePublished": new Date(article.published_at).toISOString(),
    "inLanguage": "en",
    "author": { "@type": "Person", "name": article.author_name || "Team" },
    "publisher": { "@type": "Organization", "name": "Hindi Bhajan Manjari", "logo": { "@type": "ImageObject", "url": `${siteUrl}/favicon.ico` } },
    "mainEntityOfPage": { "@type": "WebPage", "@id": pageUrl }
  };

  // Split HTML chunks for Smart Ad Injection
  const htmlChunks = article.content_html_english ? article.content_html_english.split(/<\/p>/i) : [];

  return (
    <div className="min-h-screen bg-blue-50/30 pb-20">
      
      {/* 🌟 BACKGROUND VIEW TRACKER FOR ENGLISH PAGE */}
      <ArticleViewCounter slug={slug} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedArticleSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[ { label: 'Spiritual Wisdom', href: '/en/gyan' }, { label: article.title_english || '' } ]} />

        <main className="mt-6 bg-white rounded-[2.5rem] shadow-sm border border-blue-100 overflow-hidden">
          
          {/* --- ARTICLE HERO HEADER --- */}
          <div className="bg-gradient-to-br from-blue-50 to-white p-8 md:p-12 border-b border-blue-100">
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-blue-600/80 uppercase tracking-widest">
                <span className="flex items-center gap-2 bg-blue-100/50 px-3 py-1.5 rounded-full border border-blue-200/50">
                  <FaBookOpen /> Wisdom
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="mb-0.5" /> {article.read_time_minutes} Min Read
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">&bull;</span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <FaCalendarAlt className="mb-0.5" /> {publishDateStr}
                </span>
              </div>

              {/* 🌟 LANGUAGE SWITCHER: Back to Hindi */}
              {article.slug && article.is_published && (
                <Link 
                  href={`/gyan/${article.slug}`}
                  className="flex items-center gap-2 bg-orange-50 text-orange-700 hover:bg-orange-600 hover:text-white border border-orange-200 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-sm active:scale-95 font-hindi"
                >
                  <FaLanguage className="text-lg" /> हिंदी में पढ़ें
                </Link>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-8 tracking-tight">
              {article.title_english}
            </h1>

            {/* 🌟 Beautiful Landscape Image (Personalized) */}
            {article.featured_image_url && (
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <Image 
                  src={article.featured_image_url} 
                  alt={article.title_english || 'Article Image'}
                  fill
                  priority={true}             
                  fetchPriority="high"         
                  quality={75}                
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )}
          </div>

          {/* --- ARTICLE BODY (SMART AD INJECTION) --- */}
          <div className="p-8 md:p-12">
            <article 
              className="
                text-lg md:text-xl text-gray-800 leading-[2.2] tracking-wide font-medium
                [&_p]:mb-6 [&_p:last-child]:mb-0
                [&_h2]:text-3xl [&_h2]:font-black [&_h2]:text-gray-900 [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:border-b [&_h2]:border-blue-100 [&_h2]:pb-2
                [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-8 [&_h3]:mb-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul>li]:mb-2 [&_ul>li::marker]:text-blue-500
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol>li]:mb-2 [&_ol>li::marker]:font-bold [&_ol>li::marker]:text-blue-600
                [&_strong]:text-gray-900 [&_strong]:bg-blue-50/50 [&_strong]:px-1 [&_strong]:rounded
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-500 [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:bg-blue-50/30 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_blockquote]:mb-6 [&_blockquote]:rounded-r-xl
                [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-8 [&_img]:w-full
              "
            >
              {htmlChunks.map((chunk: string, index: number) => {
                if (!chunk.trim() && index === htmlChunks.length - 1) return null;

                // Smart Ad Logic (After 2nd para, then every 4)
                const shouldShowAd = index === 1 || (index > 2 && (index - 1) % 4 === 0);
                const adCount = Math.floor((index - 1) / 4) + 1;
                const isAllowedAd = shouldShowAd && adCount <= 3;

                return (
                  <div key={index} className="contents">
                    <div dangerouslySetInnerHTML={{ __html: chunk + (index < htmlChunks.length - 1 ? '</p>' : '') }} />
                    
                    {isAllowedAd && index < htmlChunks.length - 1 && (
                      <div className="py-2 my-8 md:my-12 border-y border-gray-100/50">
                        <ManualAdUnit />
                      </div>
                    )}
                  </div>
                );
              })}
            </article>
          </div>

          {/* --- AUTHOR BOX --- */}
          <div className="p-8 md:p-12 bg-gray-50 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">
              Written & Verified By
            </h3>
            <AuthorBox authorName={article.author_name} authorSlug={article.author_slug} />
          </div>

        </main>
      </div>
    </div>
  );
}