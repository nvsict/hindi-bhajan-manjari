import { supabase } from '../../../utils/supabase';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link'; 
import Sidebar from '../../../components/Sidebar';
import Breadcrumbs from '../../../components/Breadcrumbs';
import LyricsViewer from '../../../components/LyricsViewer'; 
import { FaMicrophoneAlt, FaPenNib, FaPhoneAlt, FaMapMarkerAlt, FaQuestionCircle } from 'react-icons/fa';
import ViewCounter from '../../../components/ViewCounter';
import CommentsSection from '@/components/CommentsSection';
import AuthorBox from '@/components/AuthorBox';
import RelatedContent from '@/components/RelatedContent';

export const revalidate = 3600;
interface Props {
  params: Promise<{ slug: string }>;
}

// 🌟 DYNAMIC SEO METADATA & WHATSAPP PREVIEW
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { data: bhajan } = await supabase
    .from('bhajans')
    .select('*, deities(name_hinglish), bhajan_category_map(categories(name_hinglish)), bhajan_tag_map(tags(name))')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!bhajan) return { title: 'Bhajan Not Found' };

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${baseUrl}/bhajan/${bhajan.slug}`;
  
  const categoryNames = bhajan.bhajan_category_map?.map((map: any) => map.categories?.name_hinglish).filter(Boolean) || ['Bhajans'];
  const tagNames = bhajan.bhajan_tag_map?.map((map: any) => map.tags?.name).filter(Boolean) || [];
  
  const ogImageUrl = new URL(`${baseUrl}/api/og`);
  ogImageUrl.searchParams.set('title', bhajan.title_hinglish);

  const hasMeaning = bhajan.explanation ? "Includes spiritual Bhavarth (Meaning). " : "";
  const dynamicMetaDescription = `Read complete ${bhajan.title_hindi} (${bhajan.title_hinglish}) lyrics. ${hasMeaning}Available in 8+ Indian languages with free PDF download for daily Puja.`;

  // 🌟 Dynamic Keywords for better ranking
  const dynamicKeywords = [
    `${bhajan.title_hinglish} lyrics`,
    `${bhajan.title_hindi} लिरिक्स`,
    `${bhajan.title_hinglish} in Hindi`,
    `${bhajan.title_hinglish} PDF download`,
    bhajan.deities?.name_hinglish ? `${bhajan.deities.name_hinglish} bhajans` : "",
    ...categoryNames,
    ...tagNames
  ].filter(Boolean).join(', ');

  return {
    title: `${bhajan.title_hindi} - ${bhajan.title_hinglish} Lyrics | Bhajan Sangrah`,
    description: dynamicMetaDescription,
    keywords: dynamicKeywords,
    alternates: {
      canonical: pageUrl, 
    },
    openGraph: {
      title: `${bhajan.title_hindi} Lyrics & Meaning`,
      description: dynamicMetaDescription,
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
      description: dynamicMetaDescription,
      images: [ogImageUrl.toString()],
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
  
  // Process Relational Artist Data
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

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
  const pageUrl = `${baseUrl}/bhajan/${bhajan.slug}`;

  // ==========================================
  // 🌟 THE ADVANCED SEO ENTITY GRAPH
  // ==========================================
  
  const graphNodes: any[] = [];

  // 1. Breadcrumb Node
  graphNodes.push({
    "@type": "BreadcrumbList",
    "@id": `${pageUrl}#breadcrumb`,
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Home", "item": baseUrl },
      { "@type": "ListItem", "position": 2, "name": bhajan.deities?.name_hinglish || "Deities", "item": `${baseUrl}/deity/${bhajan.deities?.slug}` },
      { "@type": "ListItem", "position": 3, "name": bhajan.title_hindi, "item": pageUrl }
    ]
  });

  // 2. Video Node (If exists)
  if (bhajan.video_embed_url) {
    graphNodes.push({
      "@type": "VideoObject",
      "@id": `${pageUrl}#video`,
      "name": `${bhajan.title_hinglish} Video`,
      "description": `Watch the divine video for ${bhajan.title_hindi}`,
      "thumbnailUrl": `https://img.youtube.com/vi/${bhajan.video_embed_url.split('v=')[1]?.split('&')[0]}/maxresdefault.jpg`,
      "uploadDate": bhajan.created_at, // Consider updating this to actual video date if available in future
      "embedUrl": bhajan.video_embed_url
    });
  }

  // 3. Music Composition Node (The Core Entity)
  graphNodes.push({
    "@type": "MusicComposition",
    "@id": `${pageUrl}#composition`,
    "name": bhajan.title_hindi,
    "alternateName": bhajan.title_hinglish,
    "genre": ["Hindu Devotional Music", "Bhajan", ...categories.map((c:any) => c.name_hinglish)],
    "about": {
      "@type": "Thing",
      "name": bhajan.deities?.name_hinglish || "Hindu Deity"
    },
    // 🌟 Transliterator Hack: Telling Google we support these languages!
    "inLanguage": ["hi", "en-IN", "gu", "bn", "te", "kn", "ml", "or"],
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
    "lyrics": {
      "@type": "CreativeWork",
      "text": bhajan.lyrics_hindi,
      "inLanguage": "hi"
    },
    ...(bhajan.video_embed_url && { "video": { "@id": `${pageUrl}#video` } })
  });

  // 4. FAQ Node (If exists)
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

  // 5. WebPage Node (Ties everything together)
  graphNodes.push({
    "@type": "WebPage",
    "@id": pageUrl,
    "url": pageUrl,
    "name": `${bhajan.title_hindi} Lyrics`,
    "isPartOf": {
      "@type": "WebSite",
      "name": "Hindi Bhajan Manjari",
      "url": baseUrl
    },
    "breadcrumb": { "@id": `${pageUrl}#breadcrumb` },
    "mainEntity": { "@id": `${pageUrl}#composition` }
  });

  // The final wrapped Graph
  const advancedSchemaGraph = {
    "@context": "https://schema.org",
    "@graph": graphNodes
  };

  return (
    <div className="min-h-screen bg-orange-50/30">
      
      {/* 🌟 INJECTING THE ADVANCED GRAPH SCHEMA ONCE */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(advancedSchemaGraph) }} />
      
      <ViewCounter slug={bhajan.slug} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-10">
        <Breadcrumbs items={breadcrumbItems} />

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <main className="flex-1 w-full bg-white rounded-3xl shadow-sm border border-orange-100 overflow-hidden">
            
            {/* Header Section */}
            <div className="p-6 md:p-10 border-b border-orange-50 bg-gradient-to-br from-white to-orange-50/40 pb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {bhajan.deities && (
                  <span className="bg-orange-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
                    {bhajan.deities.name_hinglish}
                  </span>
                )}
                
                {categories.map((cat: any) => (
                  <span key={cat.slug} className="bg-orange-100 text-orange-700 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-orange-200/50">
                    {cat.name_hinglish}
                  </span>
                ))}
              </div>
              
              <h1 className="text-3xl md:text-5xl font-black font-hindi text-gray-900 mb-2 tracking-tighter leading-tight">
                {bhajan.title_hindi}
              </h1>
              <p className="text-xs md:text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mb-8">
                {bhajan.title_hinglish} Lyrics
              </p>
              
              {/* Artist Details Box */}
              {(displaySingerName || displayLyricistName || displayPhone || displayAddress) && (
                <div className="flex flex-wrap gap-4 md:gap-6 bg-white/60 p-4 md:p-5 rounded-2xl border border-orange-100 shadow-sm">
                  
                  {/* Singers */}
                  {(singers.length > 0 || bhajan.singer_details?.name) && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaMicrophoneAlt className="text-orange-500" />
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Singer: </span>
                      {singers.length > 0 ? (
                        <div className="flex gap-1 text-sm font-bold">
                          {singers.map((s: any, i: number) => (
                            <span key={s.slug}>
                              <Link href={`/artist/${s.slug}`} className="text-orange-600 hover:text-orange-800 transition-colors">
                                {s.name_hinglish}
                              </Link>
                              {i < singers.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-bold text-sm text-gray-800">{bhajan.singer_details?.name}</span>
                      )}
                    </div>
                  )}

                  {/* Lyricists */}
                  {(lyricists.length > 0 || bhajan.singer_details?.lyricist) && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaPenNib className="text-orange-500" />
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Writer: </span>
                      {lyricists.length > 0 ? (
                        <div className="flex gap-1 text-sm font-bold">
                          {lyricists.map((l: any, i: number) => (
                            <span key={l.slug}>
                              <Link href={`/artist/${l.slug}`} className="text-orange-600 hover:text-orange-800 transition-colors">
                                {l.name_hinglish}
                              </Link>
                              {i < lyricists.length - 1 ? ', ' : ''}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="font-bold text-sm text-gray-800">{bhajan.singer_details?.lyricist}</span>
                      )}
                    </div>
                  )}

                  {/* Contact Number */}
                  {displayPhone && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaPhoneAlt className="text-orange-500" />
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Contact: </span>
                      <a href={`tel:${displayPhone}`} className="text-sm font-bold text-orange-600 hover:text-orange-800 transition-colors">
                        {displayPhone}
                      </a>
                    </div>
                  )}

                  {/* Address */}
                  {displayAddress && (
                    <div className="flex items-center gap-2 text-gray-700">
                      <FaMapMarkerAlt className="text-orange-500" />
                      <span className="text-[11px] uppercase tracking-widest font-bold text-gray-400">Location: </span>
                      <span className="font-bold text-sm text-gray-800">{displayAddress}</span>
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
                <div className="mt-12 bg-gradient-to-br from-orange-50 to-orange-100/50 p-6 md:p-8 rounded-2xl border border-orange-200 shadow-sm">
                  <h3 className="text-2xl font-black font-hindi text-gray-900 mb-4 flex items-center gap-2">
                    <span className="text-orange-600">अर्थ</span> (Bhavarth)
                  </h3>
                  <div className="text-gray-700 text-lg md:text-xl leading-[1.8] font-hindi whitespace-pre-wrap">
                    {bhajan.explanation}
                  </div>
                </div>
              )}

              {/* DYNAMIC SEO INTRO PARAGRAPH */}
              <div className="mt-12 bg-gray-50/50 border border-gray-100 rounded-3xl p-6 md:p-8 shadow-sm">
                {/* English SEO Text */}
                <p className="text-sm md:text-base text-gray-700 leading-relaxed mb-6">
                  Read the most authentic and complete <strong>{bhajan.title_hinglish} ({bhajan.title_hindi})</strong> lyrics. 
                  {displaySingerName ? ` Popularized by ${displaySingerName}, this` : ' This'} divine {categories.length > 0 ? categories[0].name_hinglish.toLowerCase() : 'bhajan'} {bhajan.deities ? `dedicated to ${bhajan.deities.name_hinglish}` : ''} is presented in pristine Devanagari and English (Romanized) scripts. 
                  Using our advanced transliteration tool, you can instantly convert these lyrics into 8+ Indian languages including <strong>Gujarati, Bengali, Kannada, and Telugu</strong>. 
                  {bhajan.explanation && " Scroll up to read the complete Bhavarth (meaning) to deeply understand the spiritual essence of this composition. "}
                  You can also use the free <strong>PDF download</strong> feature to save these lyrics for your daily offline Puja, Aarti, and Satsang.
                </p>

                <div className="w-full h-px bg-gray-200/60 my-6"></div>

                {/* Hindi SEO Text */}
                <p className="text-base md:text-lg text-gray-800 leading-[1.8] font-hindi">
                  यहाँ आप <strong>{bhajan.title_hindi}</strong> के संपूर्ण और शुद्ध पाठ का आनंद ले सकते हैं। 
                  हमारी वेबसाइट पर आप इस {categories.length > 0 && categories[0].name_hindi ? categories[0].name_hindi : 'भजन'} को हिंदी और अंग्रेजी के साथ-साथ <strong>गुजराती, बंगाली और अन्य 6 भारतीय भाषाओं</strong> में पढ़ सकते हैं। 
                  {bhajan.explanation && "इस रचना के आध्यात्मिक रहस्य को समझने के लिए आप ऊपर इसका 'भावार्थ' (अर्थ) भी पढ़ सकते हैं। "}
                  दैनिक पूजा और सत्संग के लिए आप इसका <strong>PDF (पीडीएफ) मुफ्त में डाउनलोड</strong> कर सकते हैं।
                </p>
              </div>

              {bhajan.faqs && Array.isArray(bhajan.faqs) && bhajan.faqs.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-2xl font-black text-gray-900 tracking-tighter mb-6 flex items-center gap-2">
                    <FaQuestionCircle className="text-orange-500" />
                    Frequently Asked Questions
                  </h3>
                  <div className="space-y-4">
                    {bhajan.faqs.map((faq: any, idx: number) => (
                      <div key={idx} className="bg-white border border-gray-100 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
                        <h4 className="text-lg md:text-xl font-black font-hindi text-gray-900 mb-2 leading-tight">
                          {faq.question}
                        </h4>
                        <p className="text-gray-600 leading-[1.8] font-hindi text-base md:text-lg">
                          {faq.answer}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-100">
                  <h4 className="text-[11px] font-bold text-gray-400 mb-4 uppercase tracking-widest">Related Tags</h4>
                  <div className="flex flex-wrap gap-2.5">
                    {tags.map((tag: any) => (
                      <a 
                        key={tag.slug} 
                        href={`/tag/${tag.slug}`} 
                        className="bg-gray-50 border border-gray-100 hover:bg-orange-50 hover:border-orange-200 text-gray-600 hover:text-orange-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all"
                      >
                        {tag.name}
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Internal Breadcrumb Footer */}
              <div className="mt-10 pt-6 border-t border-gray-100 flex flex-wrap gap-4 justify-center">
                {categories.length > 0 && (
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                    Categories: <span className="text-gray-700">{categories.map((c:any) => c.name_hinglish).join(', ')}</span>
                  </p>
                )}
                {bhajan.deities && (
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest">
                    Deity: <span className="text-gray-700">{bhajan.deities.name_hinglish}</span>
                  </p>
                )}
              </div>
              
              <div className="mt-8">
                <CommentsSection bhajanSlug={slug} />
              </div>

              {bhajan.deity_id && (
                <div className="mt-12">
                  <RelatedContent 
                    deityId={bhajan.deity_id} 
                    currentSlug={bhajan.slug} 
                  />
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-gray-100">
                <AuthorBox />
              </div>

            </div>
          </main>

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-[320px] sticky top-24 shrink-0">
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