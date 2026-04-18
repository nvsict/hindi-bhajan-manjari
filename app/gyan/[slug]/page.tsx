import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import Breadcrumbs from '../../../components/Breadcrumbs';
import AuthorBox from '../../../components/AuthorBox';
import { FaClock, FaCalendarAlt, FaBookOpen, FaGlobe } from 'react-icons/fa';

// 🌟 IMPORT THE NEW AD COMPONENTS & VIEW COUNTER
import AdInArticle from '@/components/AdInArticle';
import AdDisplay from '@/components/AdDisplay';
import AdMultiplex from '@/components/AdMultiplex';
import ArticleViewCounter from '@/components/ArticleViewCounter';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

// ==========================================
// 🌟 1. GOOGLE DISCOVER METADATA & HREFLANG
// ==========================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: article } = await supabase
    .from('articles')
    // 🌟 ADDED ENGLISH COLUMNS FOR SEO HREFLANG
    .select('title_hindi, title_hinglish, meta_description, author_name, featured_image_url, slug_english, is_published_english')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!article) return { title: 'Article Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${siteUrl}/gyan/${slug}`;

  const ogImageUrl = new URL(`${siteUrl}/api/og/articles`);
  ogImageUrl.searchParams.set('title', article.title_hinglish);

  const finalImageUrl = article.featured_image_url || ogImageUrl.toString();
  const keywords = `${article.title_hinglish}, ${article.title_hindi}, Sanatan Gyan, Hindu mythology, ${article.author_name ? article.author_name + ' articles' : ''}, Hindi Bhajan Manjari blogs`;

  // 🌟 SEO MAGIC: Add hreflang tags if English version exists
  const alternates: any = { canonical: pageUrl };
  if (article.slug_english && article.is_published_english) {
    alternates.languages = {
      'hi': pageUrl,
      'en': `${siteUrl}/en/gyan/${article.slug_english}`
    };
  }

  return {
    title: `${article.title_hindi} | ${article.title_hinglish} | Sanatan Gyan`,
    description: article.meta_description,
    keywords: keywords,
    authors: article.author_name ? [{ name: article.author_name }] : undefined,
    alternates: alternates,
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
    openGraph: {
      title: article.title_hindi,
      description: article.meta_description,
      type: 'article',
      url: pageUrl,
      siteName: 'Hindi Bhajan Manjari',
      images: [
        {
          url: finalImageUrl,
          width: 1200,
          height: 630,
          alt: `${article.title_hinglish} | Sanatan Gyan`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title_hindi,
      description: article.meta_description,
      images: [finalImageUrl],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !article) {
    notFound();
  }

  const publishDateStr = new Date(article.published_at).toLocaleDateString('hi-IN', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
  
  const isoPublishDate = new Date(article.published_at).toISOString();
  const isoModifiedDate = new Date(article.updated_at || article.published_at).toISOString();

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${siteUrl}/gyan/${slug}`;

  // ==========================================
  // 🌟 2. SCHEMA GRAPH 
  // ==========================================
  const finalImageUrl = article.featured_image_url || `${siteUrl}/api/og/articles?title=${encodeURIComponent(article.title_hinglish)}`;
  
  const graphNodes: any[] = [];

  graphNodes.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": siteUrl },
      { "@type": "ListItem", "position": 2, "name": "Gyan", "item": `${siteUrl}/gyan` },
      { "@type": "ListItem", "position": 3, "name": article.title_hinglish, "item": pageUrl }
    ]
  });

  graphNodes.push({
    "@type": "Person",
    "@id": `${siteUrl}/author/${article.author_slug || 'team'}#person`,
    "name": article.author_name || "Hindi Bhajan Manjari Team",
    "url": `${siteUrl}/author/${article.author_slug || 'team'}`
  });

  graphNodes.push({
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    "name": "Hindi Bhajan Manjari",
    "url": siteUrl,
    "logo": { "@type": "ImageObject", "url": `${siteUrl}/favicon.ico` }
  });

  graphNodes.push({
    "@type": "NewsArticle", 
    "@id": `${pageUrl}#article`,
    "headline": article.title_hindi,
    "alternativeHeadline": article.title_hinglish,
    "description": article.meta_description,
    "image": [finalImageUrl],
    "datePublished": isoPublishDate,
    "dateModified": isoModifiedDate,
    "wordCount": article.content_html ? article.content_html.split(/\s+/).length : 0,
    "timeRequired": `PT${article.read_time_minutes || 5}M`,
    "inLanguage": "hi",
    "author": { "@id": `${siteUrl}/author/${article.author_slug || 'team'}#person` },
    "publisher": { "@id": `${siteUrl}#organization` },
    "mainEntityOfPage": { "@id": pageUrl }
  });

  const advancedArticleSchema = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };

  // 🌟 THE HTML SPLITTING LOGIC
  // We safely split the raw HTML by paragraph closing tags (</p>)
  const htmlChunks = article.content_html ? article.content_html.split(/<\/p>/i) : [];

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20">
      
      {/* 🌟 3. BACKGROUND VIEW TRACKER */}
      <ArticleViewCounter slug={slug} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedArticleSchema) }} />

      <Script 
        src="https://news.google.com/swg/js/v1/swg-basic.js" 
        strategy="afterInteractive" 
      />
      <Script id="google-swg-sync" strategy="afterInteractive">
        {`
          (self.SWG_BASIC = self.SWG_BASIC || []).push( basicSubscriptions => {
            basicSubscriptions.init({
              type: "NewsArticle",
              isPartOfType: ["Product"],
              isPartOfProductId: "CAow7fXFDA:openaccess",
              clientOptions: { theme: "light", lang: "hi" },
            });
          });
        `}
      </Script>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        <Breadcrumbs items={[ { label: 'Gyan', href: '/gyan' }, { label: article.title_hinglish } ]} />

        {/* 🌟 DISPLAY AD: Top of the Page (Above Article) */}
        <div className="mt-6 mb-6 w-full max-w-full overflow-hidden block">
          <AdDisplay />
        </div>

        <main className="bg-white rounded-[2.5rem] shadow-sm border border-orange-100 overflow-hidden">
          
          {/* --- ARTICLE HERO HEADER --- */}
          <div className="bg-gradient-to-br from-orange-50 to-white p-8 md:p-12 border-b border-orange-100">
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-orange-600/80 uppercase tracking-widest">
                <span className="flex items-center gap-2 bg-orange-100/50 px-3 py-1.5 rounded-full border border-orange-200/50">
                  <FaBookOpen /> Sanatan Gyan
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock className="mb-0.5" /> {article.read_time_minutes} Min Read
                </span>
                <span className="flex items-center gap-1.5 text-gray-500">&bull;</span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <FaCalendarAlt className="mb-0.5" /> {publishDateStr}
                </span>
              </div>

              {/* 🌟 LANGUAGE SWITCHER BUTTON (Visible only if English version is published) */}
              {article.slug_english && article.is_published_english && (
                <Link 
                  href={`/en/gyan/${article.slug_english}`}
                  className="flex items-center gap-2 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 px-4 py-2 rounded-full font-bold text-sm transition-all duration-300 shadow-sm active:scale-95"
                >
                  <FaGlobe className="text-lg" /> Read in English
                </Link>
              )}
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-4 tracking-tight font-hindi">
              {article.title_hindi}
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-500 font-medium font-serif italic mb-8">
              {article.title_hinglish}
            </h2>

            {article.featured_image_url && (
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <Image 
                  src={article.featured_image_url} 
                  alt={article.title_hinglish}
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
                font-hindi text-lg md:text-xl text-gray-800 leading-[2.2] tracking-wide
                [&_p]:mb-6 [&_p:last-child]:mb-0
                [&_h2]:text-3xl [&_h2]:font-black [&_h2]:text-gray-900 [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:border-b [&_h2]:border-orange-100 [&_h2]:pb-2
                [&_h3]:text-2xl [&_h3]:font-bold [&_h3]:text-gray-900 [&_h3]:mt-8 [&_h3]:mb-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-6 [&_ul>li]:mb-2 [&_ul>li::marker]:text-orange-500
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-6 [&_ol>li]:mb-2 [&_ol>li::marker]:font-bold [&_ol>li::marker]:text-orange-600
                [&_strong]:text-gray-900 [&_strong]:bg-orange-50/50 [&_strong]:px-1 [&_strong]:rounded
                [&_blockquote]:border-l-4 [&_blockquote]:border-orange-500 [&_blockquote]:pl-6 [&_blockquote]:py-2 [&_blockquote]:bg-orange-50/30 [&_blockquote]:italic [&_blockquote]:text-gray-700 [&_blockquote]:mb-6 [&_blockquote]:rounded-r-xl
                [&_img]:rounded-xl [&_img]:shadow-md [&_img]:my-8 [&_img]:w-full
              "
            >
              {htmlChunks.map((chunk: string, index: number) => {
                // Ignore empty strings at the very end caused by the split
                if (!chunk.trim() && index === htmlChunks.length - 1) return null;

                // 🌟 AD LOGIC: First ad after 2nd paragraph, then every 4 paragraphs
                const shouldShowAd = index === 1 || (index > 2 && (index - 1) % 4 === 0);
                const adCount = Math.floor((index - 1) / 4) + 1;
                const isAllowedAd = shouldShowAd && adCount <= 3;

                return (
                  <div key={index} className="contents">
                    {/* Render the chunk and append the closing </p> back */}
                    <div dangerouslySetInnerHTML={{ __html: chunk + (index < htmlChunks.length - 1 ? '</p>' : '') }} />
                    
                    {/* INJECT IN-ARTICLE AD SAFELY BETWEEN CHUNKS */}
                    {isAllowedAd && index < htmlChunks.length - 1 && (
                      <div className="py-2 my-8 md:my-12 border-y border-gray-100/50 w-full max-w-full overflow-hidden block">
                        <AdInArticle />
                      </div>
                    )}
                  </div>
                );
              })}
            </article>
          </div>

          {/* 🌟 DISPLAY AD: Bottom of the Article Content */}
          <div className="w-full max-w-full overflow-hidden block border-t border-gray-50 pt-8 pb-4 bg-gray-50/30">
            <AdDisplay />
          </div>

          {/* --- THE AUTHOR BOX --- */}
          <div className="p-8 md:p-12 bg-gray-50 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 text-center">
              Written & Verified By
            </h3>
            <AuthorBox authorName={article.author_name} authorSlug={article.author_slug} />
          </div>

        </main>

        {/* 🌟 MULTIPLEX AD: "You May Also Like" Grid Below The Post */}
        <div className="mt-12 w-full max-w-full overflow-hidden block">
          <AdMultiplex />
        </div>

      </div>
    </div>
  );
}