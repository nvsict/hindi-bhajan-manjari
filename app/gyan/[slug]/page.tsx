import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Breadcrumbs from '../../../components/Breadcrumbs';
import AuthorBox from '../../../components/AuthorBox';
import { FaClock, FaCalendarAlt, FaBookOpen } from 'react-icons/fa';

interface Props {
  params: Promise<{ slug: string }>;
}

// ==========================================
// 🌟 1. DYNAMIC METADATA (SEO Magnet)
// ==========================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  const { data: article } = await supabase
    .from('articles')
    .select('title_hindi, title_hinglish, meta_description')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (!article) return { title: 'Article Not Found' };

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

  // 🌟 THE FIX: Dynamically construct the OG image URL for articles
  const ogImageUrl = new URL(`${siteUrl}/api/og/articles`);
  // Pass the Hinglish title to the sleek new minimalist design
  ogImageUrl.searchParams.set('title', article.title_hinglish);

  return {
    title: `${article.title_hindi} | ${article.title_hinglish}`,
    description: article.meta_description,
    alternates: {
      canonical: `${siteUrl}/gyan/${slug}`,
    },
    openGraph: {
      title: article.title_hindi,
      description: article.meta_description,
      type: 'article',
      // 🌟 Add the generated dynamic image to Open Graph
      images: [
        {
          url: ogImageUrl.toString(),
          width: 1200,
          height: 630,
          alt: `${article.title_hinglish} | Sanatan Gyan`,
        },
      ],
    },
    // Add Twitter card data for good measure
    twitter: {
      card: 'summary_large_image',
      title: article.title_hindi,
      description: article.meta_description,
      images: [ogImageUrl.toString()],
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;

  // 2. Fetch Article Data
  const { data: article, error } = await supabase
    .from('articles')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single();

  if (error || !article) {
    notFound();
  }

  // Format the publish date beautifully
  const publishDate = new Date(article.published_at).toLocaleDateString('hi-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // ==========================================
  // 🌟 3. GOOGLE ARTICLE SCHEMA (Rich Snippets)
  // ==========================================
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": article.title_hindi,
    "description": article.meta_description,
    "author": {
      "@type": "Person",
      "name": article.author_name,
      "url": `${siteUrl}/author/${article.author_slug}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "Hindi Bhajan Manjari",
      "logo": {
        "@type": "ImageObject",
        "url": `${siteUrl}/favicon.ico`
      }
    },
    "datePublished": article.published_at,
    "dateModified": article.updated_at,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteUrl}/gyan/${slug}`
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <Breadcrumbs items={[
          { label: 'Gyan', href: '/gyan' }, 
          { label: article.title_hinglish }
        ]} />

        <main className="mt-6 bg-white rounded-[2.5rem] shadow-sm border border-orange-100 overflow-hidden">
          
          {/* --- ARTICLE HERO HEADER --- */}
          <div className="bg-gradient-to-br from-orange-50 to-white p-8 md:p-12 border-b border-orange-100">
            
            {/* Meta Info (Read Time & Date) */}
            <div className="flex flex-wrap items-center gap-4 text-sm font-bold text-orange-600/80 uppercase tracking-widest mb-6">
              <span className="flex items-center gap-2 bg-orange-100/50 px-3 py-1.5 rounded-full border border-orange-200/50">
                <FaBookOpen /> Sanatan Gyan
              </span>
              <span className="flex items-center gap-1.5">
                <FaClock className="mb-0.5" /> {article.read_time_minutes} Min Read
              </span>
              <span className="flex items-center gap-1.5 text-gray-400">
                &bull;
              </span>
              <span className="flex items-center gap-1.5 text-gray-500">
                <FaCalendarAlt className="mb-0.5" /> {publishDate}
              </span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 leading-tight mb-4 tracking-tight font-hindi">
              {article.title_hindi}
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-500 font-medium font-serif italic">
              {article.title_hinglish}
            </h2>
          </div>

          {/* --- ARTICLE BODY (Safely rendering rich HTML) --- */}
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
              "
              dangerouslySetInnerHTML={{ __html: article.content_html }}
            />
          </div>

          {/* --- THE AUTHOR BOX (E-E-A-T) --- */}
          <div className="p-8 md:p-12 bg-gray-50 border-t border-gray-100">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-6 text-center">
              Written & Verified By
            </h3>
            <AuthorBox 
              authorName={article.author_name} 
              authorSlug={article.author_slug} 
            />
          </div>

        </main>
      </div>
    </div>
  );
}