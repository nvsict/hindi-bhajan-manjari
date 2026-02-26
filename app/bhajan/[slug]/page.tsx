import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link'; // 🌟 Added for internal SEO linking
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import LyricsViewer from '../../../components/LyricsViewer'; 
import { FaMicrophoneAlt, FaPenNib, FaPhoneAlt, FaMapMarkerAlt, FaQuestionCircle } from 'react-icons/fa';
import ViewCounter from '../../../components/ViewCounter';
import CommentsSection from '@/components/CommentsSection';
export const revalidate = 3600;
interface Props {
  params: Promise<{ slug: string }>;
}

// 🌟 DYNAMIC SEO METADATA & WHATSAPP PREVIEW
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: bhajan } = await supabase
    .from('bhajans')
    .select('*, deities(name_hinglish), bhajan_category_map(categories(name_hinglish))')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!bhajan) return { title: 'Bhajan Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${baseUrl}/bhajan/${bhajan.slug}`;
  
  const categoryNames = bhajan.bhajan_category_map?.map((map: any) => map.categories?.name_hinglish).filter(Boolean).join(', ') || 'Bhajans';
  
  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  ogImageUrl.searchParams.set('title', bhajan.title_hindi);
  ogImageUrl.searchParams.set('subtitle', `${bhajan.title_hinglish} Lyrics`);
  ogImageUrl.searchParams.set('badge', bhajan.deities?.name_hinglish ? `✨ ${bhajan.deities.name_hinglish}` : `🙏 ${categoryNames}`);

  return {
    title: `${bhajan.title_hindi} - ${bhajan.title_hinglish} Lyrics | Bhajan Sangrah`,
    description: `Read the complete lyrics and spiritual meaning of ${bhajan.title_hindi} (${bhajan.title_hinglish}). Explore beautiful ${bhajan.deities?.name_hinglish} ${categoryNames} with Hindi and English translations.`,
    alternates: {
      canonical: pageUrl, 
    },
    openGraph: {
      title: `${bhajan.title_hindi} Lyrics & Meaning`,
      description: `Complete lyrics for ${bhajan.title_hinglish}`,
      url: pageUrl,
      type: 'article',
      images: [
        {
          url: ogImageUrl.toString(), 
          width: 1200,
          height: 630,
          alt: `${bhajan.title_hinglish} Lyrics Preview`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${bhajan.title_hindi} Lyrics`,
      description: `Complete lyrics for ${bhajan.title_hinglish}`,
      images: [ogImageUrl.toString()],
    },
  };
} 

export default async function BhajanDetails({ params }: Props) {
  const { slug } = await params;

  // 🌟 Query updated to fetch from the new bhajan_artist_map table
  const { data: bhajan, error } = await supabase
    .from('bhajans')
    .select(`
      *,
      deities ( name_hinglish, slug ),
      bhajan_category_map ( categories ( name_hinglish, slug ) ),
      bhajan_tag_map ( tags ( id, name, slug ) ),
      bhajan_artist_map (
        role,
        artists ( name_hinglish, name_hindi, slug, phone, address )
      )
    `)
    .eq('slug', slug)
    .single();

  if (error || !bhajan) notFound();

  // Extract mapped data
  const categories = bhajan.bhajan_category_map?.map((map: any) => map.categories).filter(Boolean) || [];
  const tags = bhajan.bhajan_tag_map?.map((map: any) => map.tags).filter(Boolean) || [];
  
  // 🌟 Process the New Relational Artist Data
  const artistMaps = bhajan.bhajan_artist_map || [];
  const singers = artistMaps.filter((m: any) => m.role.toLowerCase() === 'singer').map((m: any) => m.artists);
  const lyricists = artistMaps.filter((m: any) => m.role.toLowerCase() === 'lyricist').map((m: any) => m.artists);

  // Fallback to old JSON format so your non-updated pages don't break
  const displaySingerName = singers.length > 0 ? singers.map((s:any) => s.name_hinglish).join(', ') : bhajan.singer_details?.name;
  const displayLyricistName = lyricists.length > 0 ? lyricists.map((l:any) => l.name_hinglish).join(', ') : bhajan.singer_details?.lyricist;
  
  // Grab the phone/address from the first available linked artist, fallback to JSON
  const primaryArtist = singers[0] || lyricists[0];
  const displayPhone = primaryArtist?.phone || bhajan.singer_details?.phone;
  const displayAddress = primaryArtist?.address || bhajan.singer_details?.address;

  const breadcrumbItems = [
    { label: bhajan.deities?.name_hinglish || 'Bhajans', href: `/deity/${bhajan.deities?.slug}` },
    { label: bhajan.title_hindi }
  ];

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

  // ==========================================
  // 🌟 ADVANCED SEO SCHEMAS (JSON-LD)
  // ==========================================

  const musicSchema = {
    "@context": "https://schema.org",
    "@type": "MusicComposition",
    "name": bhajan.title_hindi,
    "alternateName": bhajan.title_hinglish,
    "lyricist": {
      "@type": "Person",
      "name": displayLyricistName || "Traditional"
    },
    "recordedAs": {
      "@type": "MusicRecording",
      "byArtist": {
        "@type": "Person",
        "name": displaySingerName || "Various Artists"
      }
    },
    "text": bhajan.lyrics_hindi,
    "inLanguage": "hi"
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": bhajan.deities?.name_hinglish || "Deities", "item": `${baseUrl}/deity/${bhajan.deities?.slug}` },
      { "@type": "ListItem", "position": 3, "name": bhajan.title_hindi, "item": `${baseUrl}/bhajan/${bhajan.slug}` }
    ]
  };

  let videoSchema = null;
  if (bhajan.video_embed_url) {
    videoSchema = {
      "@context": "https://schema.org",
      "@type": "VideoObject",
      "name": `${bhajan.title_hinglish} Video`,
      "description": `Watch the video for ${bhajan.title_hindi}`,
      "thumbnailUrl": `https://img.youtube.com/vi/${bhajan.video_embed_url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`,
      "uploadDate": bhajan.created_at,
      "embedUrl": bhajan.video_embed_url
    };
  }

  let faqSchema = null;
  const hasFaqs = bhajan.faqs && Array.isArray(bhajan.faqs) && bhajan.faqs.length > 0;
  
  if (hasFaqs) {
    faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": bhajan.faqs.map((faq: any) => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
  }

  return (
    <div className="min-h-screen bg-orange-50/30">
      
      {/* 🌟 INJECTING THE SEO BRAIN INTO THE DOM */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(musicSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {videoSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema) }} />}
      {faqSchema && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />}
      
      <ViewCounter slug={bhajan.slug} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <main className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
            
            {/* Header Section */}
            <div className="p-6 md:p-10 border-b border-orange-50 bg-gradient-to-br from-white to-orange-50/40">
              <div className="flex flex-wrap gap-2 mb-4">
                {bhajan.deities && (
                  <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {bhajan.deities.name_hinglish}
                  </span>
                )}
                
                {categories.map((cat: any) => (
                  <span key={cat.slug} className="bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {cat.name_hinglish}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-3 leading-tight">
                {bhajan.title_hindi}
              </h1>
              <p className="text-lg md:text-xl text-orange-600 font-medium italic mb-6">
                {bhajan.title_hinglish} Lyrics
              </p>

              {/* 🌟 UPDATED: Artist Details Box with SEO Links */}
              {(displaySingerName || displayLyricistName || displayPhone || displayAddress) && (
                <div className="flex flex-wrap gap-4 md:gap-6 bg-white/60 p-4 md:p-5 rounded-2xl border border-orange-100 shadow-sm">
                  
                  {/* Singers */}
                  {(singers.length > 0 || bhajan.singer_details?.name) && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaMicrophoneAlt className="text-orange-500" />
                      <span className="text-sm font-semibold">Singer: </span>
                      {singers.length > 0 ? (
                        <div className="flex gap-1">
                          {singers.map((s: any, i: number) => (
                            <span key={s.slug}>
                              <Link href={`/artist/${s.slug}`} className="font-normal text-orange-600 hover:text-orange-800 hover:underline transition-colors">
                                {s.name_hinglish}
                              </Link>
                              {i < singers.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-normal">{bhajan.singer_details?.name}</span>
                      )}
                    </div>
                  )}

                  {/* Lyricists */}
                  {(lyricists.length > 0 || bhajan.singer_details?.lyricist) && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaPenNib className="text-orange-500" />
                      <span className="text-sm font-semibold">Writer: </span>
                      {lyricists.length > 0 ? (
                        <div className="flex gap-1">
                          {lyricists.map((l: any, i: number) => (
                            <span key={l.slug}>
                              <Link href={`/artist/${l.slug}`} className="font-normal text-orange-600 hover:text-orange-800 hover:underline transition-colors">
                                {l.name_hinglish}
                              </Link>
                              {i < lyricists.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-normal">{bhajan.singer_details?.lyricist}</span>
                      )}
                    </div>
                  )}

                  {/* Contact Number */}
                  {displayPhone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaPhoneAlt className="text-orange-500" />
                      <span className="text-sm font-semibold">
                        Contact: <a href={`tel:${displayPhone}`} className="font-normal text-orange-600 hover:text-orange-800 hover:underline transition-colors">{displayPhone}</a>
                      </span>
                    </div>
                  )}

                  {/* Address */}
                  {displayAddress && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaMapMarkerAlt className="text-orange-500" />
                      <span className="text-sm font-semibold">Location: <span className="font-normal">{displayAddress}</span></span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="p-4 md:p-8">
              <LyricsViewer 
                title={bhajan.title_hindi} 
                lyricsHindi={bhajan.lyrics_hindi} 
                lyricsHinglish={bhajan.lyrics_hinglish} 
                slug={bhajan.slug} 
                videoEmbedUrl={bhajan.video_embed_url} 
                tarz={bhajan.tarj_parody}
              />
              
              {bhajan.explanation && (
                <div className="mt-12 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 md:p-8 rounded-2xl border border-orange-200">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-orange-600">अर्थ</span> (Bhavarth)
                  </h3>
                  <div className="text-gray-800 text-lg leading-relaxed whitespace-pre-wrap">
                    {bhajan.explanation}
                  </div>
                </div>
              )}

              {hasFaqs && (
                <div className="mt-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <FaQuestionCircle className="text-orange-500" />
                    FAQs
                  </h3>
                  <div className="space-y-4">
                    {bhajan.faqs.map((faq: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-100 p-5 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">{faq.question}</h4>
                        <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-12 pt-6 border-t border-gray-100">
                  <h4 className="font-bold text-gray-700 mb-3 text-sm uppercase tracking-wide">Related Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag: any) => (
                      <a 
                        key={tag.slug} 
                        href={`/tag/${tag.slug}`} 
                        className="bg-gray-100 hover:bg-orange-100 text-gray-600 hover:text-orange-700 px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                      >
                        {tag.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap gap-4 justify-center">
                {categories.length > 0 && (
                  <p className="text-sm text-gray-400 font-medium">
                    Categories: <span className="text-gray-600">{categories.map((c:any) => c.name_hinglish).join(', ')}</span>
                  </p>
                )}
                {bhajan.deities && (
                  <p className="text-sm text-gray-400 font-medium">
                    Deity: <span className="text-gray-600">{bhajan.deities.name_hinglish}</span>
                  </p>
                )}
              </div>
               <CommentsSection bhajanSlug={slug} />
            </div>
          </main>

          <Sidebar />
          
        </div>
        
      </div>
     
    </div>
  );
}