import { cache } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { FaChevronRight, FaMapMarkerAlt, FaMusic, FaPhoneAlt, FaUserCircle } from 'react-icons/fa';
import ScrollReveal from '@/components/ScrollReveal';
import { ArtistBio, ArtistDiscography, type ArtistWork } from '@/components/ArtistSections';

interface Props {
  params: Promise<{ slug: string }>;
}

export const revalidate = 3600; // Cache for performance

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
const SITE_NAME = 'Hindi Bhajan Manjari';

// ==========================================
// 🌟 HELPERS
// ==========================================

// One fetch per request, shared by generateMetadata() AND the page (was 2 identical queries before).
// maybeSingle(): "no row" => null (real 404). A genuine DB/network error throws instead of being
// mistaken for a missing artist, so a temporary hiccup can never cache a 404 for an hour.
const getArtist = cache(async (slug: string) => {
  const { data, error } = await supabase
    .from('artists')
    .select(`
      *,
      bhajan_artist_map (
        role,
        bhajans (
          id,
          slug,
          title_hindi,
          title_hinglish,
          view_count,
          deities (name_hinglish)
        )
      )
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error) throw new Error(`Failed to load artist "${slug}": ${error.message}`);
  return data;
});

// Cuts at a word boundary (never mid-word / mid-conjunct) and collapses whitespace.
function truncate(text: string, max: number) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(' ');
  const safe = lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut;
  return safe.replace(/[\s,;:\-–।]+$/, '') + '…';
}

// Escapes "<" so data like "</script>" in a bio can never break out of the JSON-LD tag.
const safeJsonLd = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

const pick = <T,>(value: T | T[] | null | undefined): T | null =>
  Array.isArray(value) ? (value[0] ?? null) : (value ?? null);

// ==========================================
// 🌟 1. DYNAMIC SEO & SOCIAL SHARING METADATA
// ==========================================
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const artist = await getArtist(slug);

  if (!artist) return { title: 'Artist Not Found', robots: { index: false, follow: false } };

  const pageUrl = `${SITE_URL}/artist/${artist.slug}`;
  const description = artist.bio
    ? `${truncate(artist.bio, 130)} Explore bhajans, aartis and lyrics by ${artist.name_hinglish}.`
    : `Explore the complete collection of authentic bhajans, aartis, and lyrics by ${artist.name_hinglish} (${artist.name_hindi}). Read and save your favourites.`;

  const hasImage = !!artist.profile_image_url;
  const ogImages = hasImage
    ? [{ url: artist.profile_image_url, alt: `${artist.name_hinglish} - Bhajan Singer & Lyricist` }]
    : [{ url: `${SITE_URL}/og-image.jpg`, width: 1200, height: 630, alt: `${SITE_NAME} Artist Collection` }];

  return {
    title: `${artist.name_hindi} (${artist.name_hinglish}) Bhajans & Lyrics | ${SITE_NAME}`,
    description,
    // NOTE: the old <meta keywords> tag was removed — Google ignores it and it looked like keyword stuffing.
    alternates: { canonical: pageUrl },
    openGraph: {
      title: `${artist.name_hindi} - Complete Bhajan Collection`,
      description,
      type: 'profile',
      url: pageUrl,
      siteName: SITE_NAME,
      images: ogImages,
    },
    twitter: {
      // Artist photos are square: "summary" shows them uncropped, "summary_large_image" would crop them.
      card: hasImage ? 'summary' : 'summary_large_image',
      title: `${artist.name_hindi} - Bhajan Collection`,
      description,
      images: hasImage ? [artist.profile_image_url] : [`${SITE_URL}/og-image.jpg`],
    },
  };
}

// ==========================================
// 🌟 2. MAIN PAGE COMPONENT
// ==========================================
export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  const artist = await getArtist(slug);

  if (!artist) notFound();

  // --- DATA NORMALIZATION: one entry per bhajan, merging singer + writer roles ---
  const worksMap = new Map<string | number, ArtistWork>();

  for (const entry of (artist.bhajan_artist_map ?? []) as any[]) {
    const bhajan = pick<any>(entry.bhajans);
    if (!bhajan?.slug) continue;

    const role = String(entry.role ?? '').toLowerCase().trim();
    const deity = pick<{ name_hinglish: string }>(bhajan.deities); // Supabase may return object OR array

    const existing: ArtistWork = worksMap.get(bhajan.id) ?? {
      id: bhajan.id,
      slug: bhajan.slug,
      title_hindi: bhajan.title_hindi ?? '',
      title_hinglish: bhajan.title_hinglish ?? '',
      view_count: Number(bhajan.view_count) || 0,
      deity: deity?.name_hinglish ?? null,
      isSinger: false,
      isWriter: false,
    };

    if (role === 'singer') existing.isSinger = true;
    if (role === 'writer' || role === 'lyricist') existing.isWriter = true;
    worksMap.set(bhajan.id, existing);
  }

  // Most-read first (client lets visitors re-sort)
  const works = Array.from(worksMap.values()).sort((a, b) => b.view_count - a.view_count);

  const singerCount = works.filter((w) => w.isSinger).length;
  const writerCount = works.filter((w) => w.isWriter).length;
  const totalViews = works.reduce((sum, w) => sum + w.view_count, 0);
  const topWork = works[0];

  const pageUrl = `${SITE_URL}/artist/${artist.slug}`;
  const phoneHref = artist.phone ? `tel:${String(artist.phone).replace(/[^\d+]/g, '')}` : null;

  const compact = new Intl.NumberFormat('en-IN', { notation: 'compact', maximumFractionDigits: 1 });
  const stats = [
    { label: 'Bhajans', value: String(works.length) },
    ...(singerCount > 0 ? [{ label: 'Sung', value: String(singerCount) }] : []),
    ...(writerCount > 0 ? [{ label: 'Written', value: String(writerCount) }] : []),
    ...(totalViews > 0 ? [{ label: 'Reads', value: compact.format(totalViews) }] : []),
  ];

  // ==========================================
  // 🌟 3. ENTITY GRAPH SCHEMA
  // ==========================================
  const graphNodes: Record<string, unknown>[] = [
    {
      '@type': 'Person',
      '@id': `${pageUrl}#person`,
      name: artist.name_hinglish,
      alternateName: artist.name_hindi,
      description: artist.bio || `Renowned Bhajan singer and lyricist: ${artist.name_hinglish}`,
      jobTitle: 'Devotional Artist',
      url: pageUrl,
      image: artist.profile_image_url || undefined,
      // telephone intentionally NOT exposed in structured data (privacy: it is machine-harvestable)
    },
    {
      '@type': 'BreadcrumbList',
      '@id': `${pageUrl}#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Artists', item: `${SITE_URL}/artist` },
        { '@type': 'ListItem', position: 3, name: artist.name_hinglish, item: pageUrl },
      ],
    },
  ];

  if (works.length > 0) {
    graphNodes.push({
      '@type': 'ItemList',
      '@id': `${pageUrl}#discography`,
      name: `Bhajans by ${artist.name_hinglish}`,
      numberOfItems: works.length,
      itemListElement: works.map((w, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        url: `${SITE_URL}/bhajan/${w.slug}`,
        name: w.title_hindi,
      })),
    });
  }

  graphNodes.push({
    '@type': 'ProfilePage',
    '@id': pageUrl,
    url: pageUrl,
    name: `${artist.name_hindi} - Artist Profile & Bhajans`,
    mainEntity: { '@id': `${pageUrl}#person` },
    breadcrumb: { '@id': `${pageUrl}#breadcrumb` },
    about: works.length > 0 ? { '@id': `${pageUrl}#discography` } : undefined,
  });

  const jsonLd = { '@context': 'https://schema.org', '@graph': graphNodes };

  return (
    <div className="min-h-screen bg-[#fffcf5] dark:bg-[#0c0804] pb-20 font-sans">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }} />

      {/* ==========================================
          HERO
          Same dark-saffron gradient the site uses for its bhajan placeholders,
          with the artist photo softly blurred behind the crisp portrait.
      ========================================== */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#1a0500] via-[#431407] to-[#882b0f] text-white pt-24 md:pt-28 pb-24 md:pb-28 px-4 rounded-b-[2.5rem] md:rounded-b-[3.5rem] shadow-2xl">
        {artist.profile_image_url && (
          <Image
            src={artist.profile_image_url}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover scale-125 blur-2xl opacity-25 pointer-events-none select-none"
          />
        )}
        {/* Warm glows (cheap radial gradients, no extra blur layers) */}
        <div
          className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_15%_20%,rgba(234,88,12,0.35),transparent_45%),radial-gradient(circle_at_85%_80%,rgba(251,146,60,0.18),transparent_45%)]"
          aria-hidden="true"
        />

        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-8 md:mb-10">
            <ol className="flex flex-wrap items-center justify-center md:justify-start gap-x-2 gap-y-1 text-xs sm:text-sm font-semibold text-orange-100/80">
              <li>
                <Link href="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li aria-hidden="true"><FaChevronRight className="text-[9px] opacity-60" /></li>
              <li>
                <Link href="/artist" className="hover:text-white transition-colors">Artists</Link>
              </li>
              <li aria-hidden="true"><FaChevronRight className="text-[9px] opacity-60" /></li>
              <li aria-current="page" className="text-white truncate max-w-[45vw] md:max-w-none">{artist.name_hinglish}</li>
            </ol>
          </nav>

          <div className="flex flex-col md:flex-row items-center md:items-end gap-7 md:gap-12">
            {/* Portrait */}
            <div className="relative shrink-0">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-tr from-orange-500/60 to-amber-300/30 opacity-70" aria-hidden="true" />
              <div className="relative w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-white/25 bg-[#2a0d04] shadow-2xl flex items-center justify-center">
                {artist.profile_image_url ? (
                  <Image
                    src={artist.profile_image_url}
                    alt={`${artist.name_hinglish} - Bhajan Singer & Lyricist`}
                    fill
                    priority
                    sizes="(min-width: 768px) 208px, (min-width: 640px) 176px, 144px"
                    className="object-cover"
                  />
                ) : (
                  <FaUserCircle className="text-white/40 w-full h-full p-3" aria-hidden="true" />
                )}
              </div>
            </div>

            {/* Identity */}
            <div className="flex-1 min-w-0 text-center md:text-left">
              <h1 className="font-hindi text-3xl sm:text-5xl md:text-6xl font-black text-white drop-shadow-lg break-words text-balance">
                {artist.name_hindi}
              </h1>
              <p className="mt-1 text-sm md:text-base font-bold uppercase tracking-[0.2em] text-orange-200">
                {artist.name_hinglish}
              </p>

              {/* Stats */}
              <ul className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                {stats.map((s) => (
                  <li
                    key={s.label}
                    className="flex items-baseline gap-2 bg-black/25 border border-white/10 rounded-full px-4 py-2"
                  >
                    <span className="text-lg font-black tabular-nums">{s.value}</span>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-orange-200/90">{s.label}</span>
                  </li>
                ))}
              </ul>

              {/* Actions */}
              {works.length > 0 && (
                <div className="mt-6 flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Link
                    href={`/bhajan/${topWork.slug}`}
                    className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-full bg-orange-600 hover:bg-orange-500 text-white font-bold shadow-lg shadow-orange-950/40 transition-colors"
                  >
                    Read most popular bhajan
                  </Link>
                  <a
                    href="#discography"
                    className="inline-flex items-center justify-center min-h-[48px] px-6 rounded-full bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold transition-colors"
                  >
                    Browse all {works.length}
                  </a>
                </div>
              )}

              {/* Contact */}
              {(phoneHref || artist.address) && (
                <div className="mt-5 flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-sm font-medium">
                  {phoneHref && (
                    <a
                      href={phoneHref}
                      className="inline-flex items-center gap-2.5 min-h-[44px] bg-black/25 hover:bg-black/40 px-5 rounded-full border border-white/10 transition-colors"
                    >
                      <FaPhoneAlt className="text-orange-300" aria-hidden="true" />
                      <span className="tracking-wide">{artist.phone}</span>
                    </a>
                  )}
                  {artist.address && (
                    <div className="inline-flex items-center gap-2.5 min-h-[44px] bg-black/25 px-5 py-2 rounded-full border border-white/10 max-w-full">
                      <FaMapMarkerAlt className="text-orange-300 shrink-0" aria-hidden="true" />
                      <span className="tracking-wide text-white/90 text-left">{artist.address}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* --- BIO --- */}
        {artist.bio && (
          <section className="max-w-4xl mx-auto px-4 -mt-10 md:-mt-12 relative z-20" aria-label="About the artist">
            <ScrollReveal yOffset={20}>
              <ArtistBio bio={artist.bio} />
            </ScrollReveal>
          </section>
        )}

        {/* --- DISCOGRAPHY --- */}
        <section className={`max-w-5xl mx-auto px-4 ${artist.bio ? 'mt-14' : 'mt-10'}`} aria-labelledby="discography-heading">
          <div className="flex items-center gap-3 mb-6 border-b border-orange-200/60 dark:border-white/10 pb-4">
            <FaMusic className="text-orange-500 text-2xl" aria-hidden="true" />
            <h2 id="discography-heading" className="text-2xl md:text-3xl font-black text-gray-900 dark:text-orange-50 tracking-tight">
              Bhajans by {artist.name_hinglish}{' '}
              <span className="text-orange-400 font-medium text-xl md:text-2xl">({works.length})</span>
            </h2>
          </div>

          {works.length === 0 ? (
            <div className="bg-white dark:bg-[#1a120b] rounded-[2rem] p-12 text-center border border-dashed border-orange-200 dark:border-orange-900/40">
              <p className="text-gray-700 dark:text-gray-200 font-bold text-lg mb-2">No bhajans added yet</p>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">Bhajans by this artist will appear here once they are published.</p>
              <Link
                href="/bhajan"
                className="inline-flex px-6 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 font-bold rounded-full hover:bg-orange-100 dark:hover:bg-orange-900/40 transition-all text-sm border border-transparent dark:border-orange-900/30"
              >
                Browse all bhajans
              </Link>
            </div>
          ) : (
            <ArtistDiscography works={works} />
          )}
        </section>

        {/* --- FOOTER NAV --- */}
        <div className="max-w-5xl mx-auto px-4 mt-14 flex justify-center">
          <Link
            href="/artist"
            className="px-6 py-3 bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 text-gray-700 dark:text-gray-300 font-bold rounded-full hover:border-orange-500 hover:text-orange-600 dark:hover:text-orange-400 shadow-sm transition-all"
          >
            View all artists
          </Link>
        </div>
      </main>
    </div>
  );
}