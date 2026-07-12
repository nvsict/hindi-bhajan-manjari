import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link'; 
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import LyricsViewer from '../../../components/LyricsViewer'; 
// 🌟 FIX: Added FaCheckCircle, FaLanguage, and FaFilePdf for the new Features UI
import { FaMicrophoneAlt, FaPhoneAlt, FaQuestionCircle, FaCheckCircle, FaLanguage, FaFilePdf } from 'react-icons/fa';
import ViewCounter from '../../../components/ViewCounter';
import CommentsSection from '@/components/CommentsSection';
import AuthorBox from '@/components/AuthorBox';
import RelatedContent from '@/components/RelatedContent';
import AffiliateSlot from '@/components/AffiliateSlot'; 
import DivineHover from '@/components/DivineHover';

// 🌟 NEW: BHAKTI STUDIO & COMMUNITY WALL IMPORTS
import BhaktiStudio from '@/components/BhaktiStudio';
import CommunityWall from '@/components/CommunityWall';

export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

const getYouTubeId = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// 🌟 METADATA GENERATION (Tags automatically included in keywords for SEO)
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: bhajan } = await supabase
    .from('bhajans')
    .select('*, deities(name_hinglish), bhajan_category_map(categories(name_hinglish)), bhajan_tag_map(tags(name))')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!bhajan) return { title: 'Bhajan Not Found' };

  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  const pageUrl = `${baseUrl}/bhajan/${bhajan.slug}`;
  
  const categoryNames = bhajan.bhajan_category_map?.map((map: any) => map.categories?.name_hinglish).filter(Boolean) || ['Bhajans'];
  const tagNames = bhajan.bhajan_tag_map?.map((map: any) => map.tags?.name).filter(Boolean) || [];
  
  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(bhajan.title_hinglish)}`;

  const defaultTitle = `${bhajan.title_hindi} - ${bhajan.title_hinglish} Lyrics | Bhajan Sangrah`;
  const finalTitle = bhajan.seo_title?.trim() ? bhajan.seo_title : defaultTitle;

  const hasMeaning = bhajan.explanation ? "Includes spiritual Bhavarth (Meaning). " : "";
  const defaultMetaDescription = `Read complete ${bhajan.title_hindi} (${bhajan.title_hinglish}) lyrics. ${hasMeaning}Available in 8+ Indian languages with free PDF download for daily Puja.`;
  const finalDescription = bhajan.meta_description?.trim() ? bhajan.meta_description : defaultMetaDescription;

  let altQueriesArray: string[] = [];
  if (bhajan.alt_queries?.trim()) {
    altQueriesArray = bhajan.alt_queries.split(',').map((q: string) => q.trim());
  }

  // Tags are fed directly into the meta keywords!
  const dynamicKeywords = [
    `${bhajan.title_hinglish} lyrics`,
    `${bhajan.title_hindi} लिरिक्स`,
    `${bhajan.title_hinglish} in Hindi`,
    `${bhajan.title_hinglish} PDF download`,
    bhajan.deities?.name_hinglish ? `${bhajan.deities.name_hinglish} bhajans` : "",
    ...categoryNames,
    ...tagNames, // 👈 THE SEO MAGIC
    ...altQueriesArray 
  ].filter(Boolean).join(', ');

  return {
    metadataBase: new URL(baseUrl),
    title: finalTitle, 
    description: finalDescription, 
    keywords: dynamicKeywords, 
    alternates: { canonical: pageUrl },
    openGraph: {
      title: finalTitle,
      description: finalDescription,
      url: pageUrl,
      type: 'article',
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${bhajan.title_hinglish} Lyrics` }],
    },
    twitter: {
      card: 'summary_large_image',
      title: finalTitle,
      description: finalDescription,
      images: [ogImageUrl],
    },
  };
} 

export default async function BhajanDetails({ params }: Props) {
  const { slug } = await params;

  const { data: bhajan, error } = await supabase
    .from('bhajans')
    .select(`
      *,
      deities ( name_hinglish, name_hindi, slug ),
      bhajan_category_map ( categories ( name_hinglish, name_hindi, slug ) ),
      bhajan_tag_map ( tags ( id, name, slug ) ),
      bhajan_artist_map ( role, artists ( name_hinglish, name_hindi, slug, phone, address ) )
    `)
    .eq('slug', slug)
    .single();

  if (error || !bhajan) notFound();

  const categories = bhajan.bhajan_category_map?.map((map: any) => map.categories).filter(Boolean) || [];
  const tags = bhajan.bhajan_tag_map?.map((map: any) => map.tags).filter(Boolean) || [];
  
  const artistMaps = bhajan.bhajan_artist_map || [];
  const singers = artistMaps.filter((m: any) => m.role.toLowerCase() === 'singer').map((m: any) => m.artists);
  const lyricists = artistMaps.filter((m: any) => m.role.toLowerCase() === 'lyricist').map((m: any) => m.artists);

  const displaySingerName = singers.length > 0 ? singers.map((s:any) => s.name_hinglish).join(', ') : bhajan.singer_details?.name;
  const displayLyricistName = lyricists.length > 0 ? lyricists.map((l:any) => l.name_hinglish).join(', ') : bhajan.singer_details?.lyricist;
  
  const primaryArtist = singers[0] || lyricists[0];
  const displayPhone = primaryArtist?.phone || bhajan.singer_details?.phone;
  const displayAddress = primaryArtist?.address || bhajan.singer_details?.address;

  const breadcrumbItems = [
    { label: bhajan.deities?.name_hinglish || 'Bhajans', href: `/deity/${bhajan.deities?.slug}` },
    { label: bhajan.title_hindi }
  ];

  const rawBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const baseUrl = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  const pageUrl = `${baseUrl}/bhajan/${bhajan.slug}`;
  const ogImageUrl = `${baseUrl}/api/og?title=${encodeURIComponent(bhajan.title_hinglish)}`;

  // ==========================================================
  // 🌟 ADVANCED JSON-LD SCHEMA GRAPH (WITH TAGS INJECTED)
  // ==========================================================
  const graphNodes: any[] = [];
  
  // Create comma-separated tags string for Schema
  const schemaKeywords = tags.map((t: any) => t.name).join(', ');

  // 1. Organization Schema
  graphNodes.push({
    "@type": "Organization",
    "@id": `${baseUrl}/#organization`,
    "name": "Hindi Bhajan Manjari",
    "url": baseUrl,
    "logo": {
      "@type": "ImageObject",
      "url": `${baseUrl}/logo.png`
    }
  });

  // 2. Author/Person Schema (EEAT Signal)
  graphNodes.push({
    "@type": "Person",
    "@id": `${baseUrl}/#author`,
    "name": "Mohit Tarkar",
    "url": baseUrl
  });

  // 3. Breadcrumbs Schema
  graphNodes.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": bhajan.deities?.name_hinglish || "Deities", "item": `${baseUrl}/deity/${bhajan.deities?.slug}` },
      { "@type": "ListItem", "position": 3, "name": bhajan.title_hindi, "item": pageUrl }
    ]
  });

  // 4. Video Schema (if exists)
  let ytId = null;
  if (bhajan.video_embed_url) {
    ytId = getYouTubeId(bhajan.video_embed_url);
    if (ytId) {
      graphNodes.push({
        "@type": "VideoObject",
        "@id": `${pageUrl}#video`,
        "name": `${bhajan.title_hindi} Video`,
        "description": `Watch the divine video for ${bhajan.title_hindi} (${bhajan.title_hinglish})`,
        "thumbnailUrl": [
          `https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`,
          `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`
        ],
        "uploadDate": bhajan.created_at || new Date().toISOString(),
        "embedUrl": `https://www.youtube.com/embed/${ytId}`
      });
    }
  }

  // 5. MusicComposition Schema
  let alternateNamesSchema = [bhajan.title_hinglish];
  if (bhajan.alt_queries?.trim()) {
    alternateNamesSchema = [...alternateNamesSchema, ...bhajan.alt_queries.split(',').map((q: string) => q.trim())];
  }

  const lyricistSchema = lyricists.map((l: any) => ({
    "@type": "Person",
    "name": l.name_hinglish,
    "url": `${baseUrl}/artist/${l.slug}`
  }));

  const singerSchema = singers.map((s: any) => ({
    "@type": "Person",
    "name": s.name_hinglish,
    "url": `${baseUrl}/artist/${s.slug}`
  }));

  graphNodes.push({
    "@type": "MusicComposition",
    "@id": `${pageUrl}#composition`,
    "name": bhajan.title_hindi,
    "alternateName": alternateNamesSchema, 
    "genre": ["Hindu Devotional Music", "Bhajan", ...categories.map((c:any) => c.name_hinglish)],
    "keywords": schemaKeywords, // 👈 INJECTING TAGS INTO COMPOSITION SCHEMA
    "inLanguage": ["hi", "en-IN", "gu", "bn", "te", "kn", "ml", "or"],
    "image": ogImageUrl,
    "lyricist": lyricistSchema.length > 0 ? lyricistSchema : undefined,
    "composer": lyricistSchema.length > 0 ? lyricistSchema : undefined,
    "recordedAs": singerSchema.length > 0 ? {
      "@type": "MusicRecording",
      "byArtist": singerSchema
    } : undefined,
    "lyrics": { 
      "@type": "CreativeWork", 
      "text": bhajan.lyrics_hindi, 
      "inLanguage": "hi" 
    },
    ...(ytId && { "video": { "@id": `${pageUrl}#video` } }) 
  });

  // 6. Article Schema (For Bhavarth/Explanation)
  if (bhajan.explanation) {
    graphNodes.push({
      "@type": "Article",
      "@id": `${pageUrl}#article`,
      "headline": `${bhajan.title_hindi} भावार्थ (Meaning)`,
      "description": bhajan.meta_description || bhajan.explanation.substring(0, 150),
      "image": ogImageUrl,
      "author": { "@id": `${baseUrl}/#author` },
      "publisher": { "@id": `${baseUrl}/#organization` },
      "mainEntityOfPage": { "@id": pageUrl }
    });
  }

  // 7. FAQPage Schema
  if (bhajan.faqs && Array.isArray(bhajan.faqs) && bhajan.faqs.length > 0) {
    graphNodes.push({
      "@type": "FAQPage",
      "@id": `${pageUrl}#faq`,
      "mainEntity": bhajan.faqs.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    });
  }

  // 8. WebSite & WebPage Schema
  graphNodes.push({
    "@type": "WebSite",
    "@id": `${baseUrl}/#website`,
    "url": baseUrl,
    "name": "Hindi Bhajan Manjari",
    "publisher": { "@id": `${baseUrl}/#organization` }
  });

  graphNodes.push({
    "@type": "WebPage",
    "@id": pageUrl,
    "url": pageUrl,
    "name": `${bhajan.title_hindi} Lyrics`,
    "description": bhajan.meta_description,
    "keywords": schemaKeywords, // 👈 INJECTING TAGS INTO WEBPAGE SCHEMA
    "image": ogImageUrl,
    "author": { "@id": `${baseUrl}/#author` },
    "datePublished": bhajan.created_at || new Date().toISOString(),
    "dateModified": bhajan.updated_at || bhajan.created_at || new Date().toISOString(),
    "isPartOf": { "@id": `${baseUrl}/#website` },
    "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
    "mainEntity": { "@id": `${pageUrl}#composition` }
  });

  const advancedSchemaGraph = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };

  return (
    <div className="min-h-screen bg-orange-50/30 dark:bg-[#0c0804]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedSchemaGraph) }} />
      
      <ViewCounter slug={bhajan.slug} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
         <main className="flex-1 min-w-0 w-full lg:w-auto bg-white dark:bg-[#120c08] rounded-3xl shadow-sm border border-orange-100 dark:border-white/5 overflow-hidden">
            
            {/* Header Section */}
            <div className="p-6 md:p-10 border-b border-orange-50 dark:border-white/5 bg-gradient-to-br from-white dark:from-[#120c08] to-orange-50/40 dark:to-orange-900/10 pb-2">
              
              <div className="flex flex-wrap gap-2 mb-4">
                {bhajan.deities && (
                  <Link 
                    href={`/deity/${bhajan.deities.slug}`} 
                    className="bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm transition-colors active:scale-95"
                  >
                    {bhajan.deities.name_hinglish}
                  </Link>
                )}
                
                {categories.map((cat: any) => (
                  <Link 
                    key={cat.slug} 
                    href={`/category/${cat.slug}`} 
                    className="bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-orange-200/50 dark:border-orange-900/50 transition-colors active:scale-95"
                  >
                    {cat.name_hinglish}
                  </Link>
                ))}
              </div>
              
              <DivineHover>
  <h1 className="text-3xl md:text-5xl font-black font-hindi text-gray-900 dark:text-orange-50 mb-2 tracking-tighter leading-tight cursor-default">
    {bhajan.title_hindi}
  </h1>
</DivineHover>
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 font-bold uppercase tracking-[0.2em] mb-8">
                {bhajan.title_hinglish}
              </p>
              
              {(displaySingerName || displayLyricistName || displayPhone || displayAddress) && (
                <div className="flex flex-wrap gap-4 md:gap-6 bg-white/60 dark:bg-white/5 p-4 md:p-5 rounded-2xl border border-orange-100 dark:border-white/10 shadow-sm">
                  {(singers.length > 0 || bhajan.singer_details?.name) && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FaMicrophoneAlt className="text-orange-500" aria-hidden="true" />
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Singer: </span>
                      {singers.length > 0 ? (
                        <div className="flex gap-1 text-sm font-bold">
                          {singers.map((s: any, i: number) => (
                            <span key={s.slug}>
                              <Link href={`/artist/${s.slug}`} className="text-orange-600 hover:text-orange-800 dark:hover:text-orange-400 transition-colors">{s.name_hinglish}</Link>
                              {i < singers.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-bold text-sm text-gray-800 dark:text-gray-200">{bhajan.singer_details?.name}</span>
                      )}
                    </div>
                  )}

                  {displayPhone && (
                    <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <FaPhoneAlt className="text-orange-500" aria-hidden="true" />
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-500 dark:text-gray-400">Contact: </span>
                      <a href={`tel:${displayPhone}`} className="text-sm font-bold text-orange-600 hover:text-orange-800 dark:hover:text-orange-400 transition-colors">
                        {displayPhone}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>

           <div className="pt-0 px-4 md:px-8 pb-8">
              
              {/* Recording Bar */}
              <BhaktiStudio bhajanId={bhajan.id} bhajanSlug={bhajan.slug} />

              {/* Lyrics Content */}
              <LyricsViewer 
                title={bhajan.title_hindi} 
                lyricsHindi={bhajan.lyrics_hindi} 
                lyricsHinglish={bhajan.lyrics_hinglish} 
                slug={bhajan.slug} 
                videoEmbedUrl={bhajan.video_embed_url} 
                tarz={bhajan.tarj_parody}
              />

              <div className="mt-10 mb-8">
                <AffiliateSlot deityId={bhajan.deity_id?.toString()} layout="inline" />
              </div>

              {/* Community Wall */}
              <div className="mt-12 space-y-8 border-t border-orange-100 dark:border-white/10 pt-10">
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-black font-hindi text-gray-900 dark:text-orange-50">भक्तों का मंच (Bhakt's Voice)</h2>
                  <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">अन्य भक्तों द्वारा गाए गए मधुर कवर्स सुनें।</p>
                </div>
                <CommunityWall bhajanId={bhajan.id} />
              </div>
              
              {/* Bhavarth (Meaning) */}
              {bhajan.explanation && (
                <div className="mt-12 bg-gradient-to-br from-orange-50 dark:from-orange-900/10 to-orange-100/50 dark:to-orange-900/5 p-6 md:p-8 rounded-2xl border border-orange-200 dark:border-orange-900/30 shadow-sm">
                  <h3 className="text-2xl font-black font-hindi text-gray-900 dark:text-orange-50 mb-4 flex items-center gap-2">
                    <span className="text-orange-600 dark:text-orange-500">अर्थ</span> (Bhavarth)
                  </h3>
                  <div className="text-gray-700 dark:text-gray-300 text-lg md:text-xl leading-[1.8] font-hindi whitespace-pre-wrap">
                    {bhajan.explanation}
                  </div>
                </div>
              )}

              {/* ==========================================
                  🌟 Site Features UI (AdSense Friendly - Replaces boilerplate paragraph)
                  ========================================== */}
              <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-5 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 mb-3 border border-orange-100 dark:border-orange-900/30">
                    <FaCheckCircle size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1.5">Authentic Lyrics</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Pristine Devanagari & Romanized scripts with Bhavarth.</p>
                </div>
                
                <div className="flex flex-col items-center text-center p-5 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 mb-3 border border-orange-100 dark:border-orange-900/30">
                    <FaLanguage size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1.5">8+ Indian Languages</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Instantly transliterate to Gujarati, Bengali, Telugu & more.</p>
                </div>

                <div className="flex flex-col items-center text-center p-5 bg-gray-50/50 dark:bg-white/[0.02] rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-500 mb-3 border border-orange-100 dark:border-orange-900/30">
                    <FaFilePdf size={20} />
                  </div>
                  <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1.5">Free PDF Download</h4>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Save offline for daily Puja, Aarti, and Satsang.</p>
                </div>
              </div>

              {/* FAQs */}
              {bhajan.faqs && Array.isArray(bhajan.faqs) && bhajan.faqs.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-black text-gray-900 dark:text-orange-50 tracking-tighter mb-6 flex items-center gap-2">
                    <FaQuestionCircle className="text-orange-500" aria-hidden="true" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {bhajan.faqs.map((faq: any, idx: number) => (
                      <div key={idx} className="bg-white dark:bg-[#1a120b] border border-gray-100 dark:border-white/5 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-lg md:text-xl font-black font-hindi text-gray-900 dark:text-gray-100 mb-2 leading-tight">
                          {faq.question}
                        </h4>
                        <p className="text-gray-600 dark:text-gray-400 leading-[1.8] font-hindi text-base md:text-lg">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ==========================================
                  🌟 NEW FIX: NON-CLICKABLE TAGS (SEO Retained)
                  ========================================== */}
              {tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-white/10">
                  <h4 className="text-[11px] font-bold text-gray-500 dark:text-gray-400 mb-4 uppercase tracking-widest">Search Terms</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {tags.map((tag: any) => (
                      <span 
                        key={tag.id || tag.slug} 
                        className="bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 text-gray-600 dark:text-gray-300 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider cursor-default shadow-sm"
                      >
                        # {tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8">
                <CommentsSection bhajanSlug={slug} />
              </div>

              {bhajan.deity_id && (
                <div className="mt-12">
                  <RelatedContent deityId={bhajan.deity_id} currentSlug={bhajan.slug} />
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-white/10">
                <AuthorBox />
              </div>

            </div>
          </main>

          <aside className="hidden lg:block w-[320px] shrink-0">
            <Sidebar 
              topicName={bhajan.deities?.name_hinglish}
              filterColumn="deity_id"
              filterValue={bhajan.deity_id}
              currentBhajanSlug={bhajan.slug}
            />
          </aside>
          
        </div>
      </div>
    </div>
  );
}