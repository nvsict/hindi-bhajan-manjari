import { supabase } from '../../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import Script from 'next/script';
import Link from 'next/link';
import Breadcrumbs from '../../../../components/Breadcrumbs';
import AuthorBox from '../../../../components/AuthorBox';
import { FaClock, FaCalendarAlt, FaBookOpen, FaLanguage } from 'react-icons/fa';

// 🌟 IMPORT THE NEW AD COMPONENTS & VIEW COUNTER
import AdInArticle from '@/components/AdInArticle';
import AdDisplay from '@/components/AdDisplay';
import AdMultiplex from '@/components/AdMultiplex';
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

  const ogImageUrl = new URL(`${siteUrl}/api/og/articles`);
  ogImageUrl.searchParams.set('title', article.title_english || 'Sanatan Gyan');
  const finalImageUrl = article.featured_image_url || ogImageUrl.toString();

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

  const htmlChunks = article.content_html_english ? article.content_html_english.split(/<\/p>/i) : [];

  return (
    <div className="min-h-screen bg-blue-50/20 pb-20">
      
      <ArticleViewCounter slug={slug} />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedArticleSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[ { label: 'Wisdom', href: '/en/gyan' }, { label: article.title_english || '' } ]} />

        {/* 🌟 TOP DISPLAY AD */}
        <div className="mt-6 mb-6 w-full max-w-full overflow-hidden block">
          <AdDisplay />
        </div>

        <main className="bg-white rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-blue-100 overflow-hidden">
          
          <div className="bg-gradient-to-br from-blue-50/50 to-white p-8 md:p-12 border-b border-blue-100">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4 text-xs md:text-sm font-bold text-blue-700 uppercase tracking-wider">
                <span className="flex items-center gap-2 bg-blue-100 px-3 py-1.5 rounded-full">
                  <FaBookOpen /> Wisdom
                </span>
                <span className="flex items-center gap-1.5">
                  <FaClock /> {article.read_time_minutes} Min Read
                </span>
                <span className="hidden sm:inline text-gray-400">&bull;</span>
                <span className="flex items-center gap-1.5 text-gray-500">
                  <FaCalendarAlt /> {publishDateStr}
                </span>
              </div>

              {article.slug && article.is_published && (
                <Link 
                  href={`/gyan/${article.slug}`}
                  className="flex items-center gap-2 bg-orange-600 text-white hover:bg-orange-700 border border-transparent px-4 py-2 rounded-full font-bold text-sm transition-all shadow-md active:scale-95"
                >
                  <FaLanguage className="text-lg" /> हिंदी में
                </Link>
              )}
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] mb-8 tracking-tight">
              {article.title_english}
            </h1>

            {article.featured_image_url && (
              <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden shadow-xl border border-gray-100">
                <Image 
                  src={article.featured_image_url} 
                  alt={article.title_english || 'Article Image'}
                  fill
                  priority={true}             
                  fetchPriority="high"         
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 800px"
                />
              </div>
            )}
          </div>

          <div className="p-6 md:p-12">
            <article 
              className="
                text-gray-800 text-[1.125rem] md:text-[1.25rem] leading-[1.8] tracking-normal
                [&_p]:mb-8
                [&_h2]:text-2xl md:text-3xl [&_h2]:font-extrabold [&_h2]:text-slate-900 [&_h2]:mt-12 [&_h2]:mb-6 [&_h2]:border-l-4 [&_h2]:border-blue-500 [&_h2]:pl-4
                [&_h3]:text-xl md:text-2xl [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-8 [&_h3]:mb-4
                [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-8 [&_ul>li]:mb-3
                [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-8 [&_ol>li]:mb-3
                [&_strong]:text-slate-950 [&_strong]:font-bold
                [&_blockquote]:border-l-4 [&_blockquote]:border-blue-400 [&_blockquote]:pl-6 [&_blockquote]:py-1 [&_blockquote]:bg-blue-50/50 [&_blockquote]:italic [&_blockquote]:text-slate-700 [&_blockquote]:mb-8 [&_blockquote]:rounded-r-lg
                [&_img]:rounded-2xl [&_img]:my-10 [&_img]:w-full [&_img]:shadow-lg
              "
            >
              {htmlChunks.map((chunk: string, index: number) => {
                if (!chunk.trim() && index === htmlChunks.length - 1) return null;

                const shouldShowAd = index === 1 || (index > 2 && (index - 1) % 4 === 0);
                const adCount = Math.floor((index - 1) / 4) + 1;
                const isAllowedAd = shouldShowAd && adCount <= 3;

                return (
                  <div key={index} className="contents">
                    <div dangerouslySetInnerHTML={{ __html: chunk + (index < htmlChunks.length - 1 ? '</p>' : '') }} />
                    
                    {/* 🌟 NATIVE IN-ARTICLE AD */}
                    {isAllowedAd && index < htmlChunks.length - 1 && (
                      <div className="my-10 py-4 border-y border-gray-100 flex justify-center bg-gray-50/50 rounded-xl w-full max-w-full overflow-hidden block">
                        <AdInArticle />
                      </div>
                    )}
                  </div>
                );
              })}
            </article>
          </div>

          {/* 🌟 BOTTOM DISPLAY AD */}
          <div className="w-full max-w-full overflow-hidden block border-t border-blue-50 pt-8 pb-4 bg-blue-50/20">
            <AdDisplay />
          </div>

          <div className="p-8 md:p-12 bg-slate-50 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-8 text-center">
              Content Curated By
            </h3>
            <AuthorBox authorName={article.author_name} authorSlug={article.author_slug} />
          </div>

        </main>

        {/* 🌟 BOTTOM MULTIPLEX AD (OUTSIDE MAIN CARD) */}
        <div className="w-full mt-12 max-w-full overflow-hidden block">
          <AdMultiplex />
        </div>

      </div>
    </div>
  );
}