import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script'; // 🌟 NEW: Imported Next.js Script component
import Breadcrumbs from '../../../components/Breadcrumbs';
import AuthorBox from '../../../components/AuthorBox';
import { FaClock, FaCalendarAlt, FaBookOpen } from 'react-icons/fa';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600;

// ==========================================
// 🌟 1. GOOGLE DISCOVER METADATA
// ==========================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // 🌟 Fetching the 'featured_image_url'
  const { data: article } = await supabase
    .from('articles')
    .select('title_hindi, title_hinglish, meta_description, author_name, featured_image_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!article) return { title: 'Article Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${siteUrl}/gyan/${slug}`;

  // Dynamic OG Image Fallback
  const ogImageUrl = new URL(`${siteUrl}/api/og/articles`);
  ogImageUrl.searchParams.set('title', article.title_hinglish);

  // 🌟 The Final Image to show to Google (Priority to Featured Image)
  const finalImageUrl = article.featured_image_url || ogImageUrl.toString();
  const keywords = `${article.title_hinglish}, ${article.title_hindi}, Sanatan Gyan, Hindu mythology, ${article.author_name ? article.author_name + ' articles' : ''}, Hindi Bhajan Manjari blogs`;

  return {
    title: `${article.title_hindi} | ${article.title_hinglish} | Sanatan Gyan`,
    description: article.meta_description,
    keywords: keywords,
    authors: article.author_name ? [{ name: article.author_name }] : undefined,
    alternates: { canonical: pageUrl },
    // 🌟 CRITICAL FOR GOOGLE DISCOVER: max-image-preview: large
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
    "@type": "NewsArticle", // Using NewsArticle as requested by Google SWG
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

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20">
      
      {/* 🌟 THE SEO SCHEMA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedArticleSchema) }} />

      {/* 🌟 NEW: GOOGLE PUBLISHER CENTER / SWG SYNC SCRIPT */}
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

        <main className="mt-6 bg-white rounded-[2.5rem] shadow-sm border border-orange-100 overflow-hidden">
          
          {/* --- ARTICLE HERO HEADER --- */}
          <div className="bg-gradient-to-br from-orange-50 to-white p-8 md:p-12 border-b border-orange-100">
            
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-orange-600/80 uppercase tracking-widest mb-6">
              <span className="flex items-center gap-2 bg-orange-100/50 px-3 py-1.5 rounded-full border border-orange-200/50">
                <FaBookOpen /> Sanatan Gyan
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="mb-0.5" /> {article.read_time_minutes} Min Read
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">&bull;</span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <FaCalendarAlt className="mb-0.5" /> {publishDateStr}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-4 tracking-tight font-hindi">
              {article.title_hindi}
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-500 font-medium font-serif italic mb-8">
              {article.title_hinglish}
            </h2>

            {/* 🌟 GOOGLE DISCOVER HERO IMAGE */}
            {article.featured_image_url && (
              <div className="relative w-full aspect-[16/9] md:aspect-[21/9] rounded-2xl overflow-hidden shadow-lg border border-gray-100">
                <Image 
                  src={article.featured_image_url} 
                  alt={article.title_hinglish}
                  fill
                  priority 
                  className="object-cover hover:scale-105 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )}
          </div>

          {/* --- ARTICLE BODY --- */}
          <div className="p-8 md:p-12">
            <article 
              className="
                font-hindi text-lg md:text-xl text-gray-800 leading-[2.2] tracking-wide
                [&>p]:mb-6 [&>p:last-child]:mb-0
                [&>h2]:text-3xl [&>h2]:font-black [&>h2]:text-gray-900 [&>h2]:mt-12 [&>h2]:mb-6 [&>h2]:border-b [&>h2]:border-orange-100 [&>h2]:pb-2
                [&>h3]:text-2xl [&>h3]:font-bold [&>h3]:text-gray-900 [&>h3]:mt-8 [&>h3]:mb-4
                [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-6 [&>ul>li]:mb-2 [&>ul>li::marker]:text-orange-500
                [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-6 [&>ol>li]:mb-2 [&>ol>li::marker]:font-bold [&>ol>li::marker]:text-orange-600
                [&>strong]:text-gray-900 [&>strong]:bg-orange-50/50 [&>strong]:px-1 [&>strong]:rounded
                [&>blockquote]:border-l-4 [&>blockquote]:border-orange-500 [&>blockquote]:pl-6 [&>blockquote]:py-2 [&>blockquote]:bg-orange-50/30 [&>blockquote]:italic [&>blockquote]:text-gray-700 [&>blockquote]:mb-6 [&>blockquote]:rounded-r-xl
                [&>img]:rounded-xl [&>img]:shadow-md [&>img]:my-8 [&>img]:w-full
              "
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />
          </div>

          {/* --- THE AUTHOR BOX --- */}
          <div className="p-8 md:p-12 bg-gray-50 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">
              Written & Verified By
            </h3>
            <AuthorBox authorName={article.author_name} authorSlug={article.author_slug} />
          </div>

        </main>
      </div>
    </div>
  );
}