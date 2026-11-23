import { Metadata } from 'next';
import { supabase } from '@/utils/supabase';

interface VerseLayoutProps {
  children: React.ReactNode;
  params: Promise<{ chapter_number: string; verse_number: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter_number: string; verse_number: string }>;
}): Promise<Metadata> {
  const { chapter_number, verse_number } = await params;
  const cNum = Number(chapter_number) || 1;
  const vNum = Number(verse_number) || 1;
  const targetVerseId = `BG${cNum}.${vNum}`;

  const { data: verse } = await supabase
    .from('gita_verses')
    .select('*')
    .eq('id', targetVerseId)
    .maybeSingle();

  const title = `गीता अध्याय ${cNum} श्लोक ${vNum} (BG ${cNum}.${vNum}) संस्कृत व हिंदी भावार्थ`;
  const sanskritOneLine = verse?.sanskrit
    ? verse.sanskrit.replace(/[\r\n]+/g, ' ').replace(/\s+/g, ' ').trim()
    : '';
  const description = `श्रीमद्भगवद्गीता अध्याय ${cNum} श्लोक ${vNum} (${targetVerseId}): ${sanskritOneLine ? sanskritOneLine.substring(0, 120) + '... ' : ''}संस्कृत मूल श्लोक, अन्वय, हिंदी अनुवाद व सरल आध्यात्मिक भावार्थ।`;
  const canonicalUrl = `${siteUrl}/bhagavad-gita/chapter/${cNum}/verse/${vNum}`;

  return {
    title,
    description,
    keywords: [
      `BG ${cNum}.${vNum}`,
      `Gita ${cNum}.${vNum}`,
      `Gita Chapter ${cNum} Verse ${vNum}`,
      `गीता अध्याय ${cNum} श्लोक ${vNum}`,
      'Bhagavad Gita Sloka Meaning in Hindi',
      'Sanskrit Sloka with Translation',
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      type: 'article',
      images: [{ url: `${siteUrl}/og-image.jpg`, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

export default async function VerseLayout({
  children,
  params,
}: VerseLayoutProps) {
  const { chapter_number, verse_number } = await params;
  const cNum = Number(chapter_number) || 1;
  const vNum = Number(verse_number) || 1;
  const targetVerseId = `BG${cNum}.${vNum}`;

  const { data: verse } = await supabase
    .from('gita_verses')
    .select('*')
    .eq('id', targetVerseId)
    .maybeSingle();

  const verseSchema = verse
    ? {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        "@id": `${siteUrl}/bhagavad-gita/chapter/${cNum}/verse/${vNum}#verse`,
        "name": `श्रीमद्भगवद्गीता अध्याय ${cNum} श्लोक ${vNum} (${targetVerseId})`,
        "text": verse.sanskrit,
        "inLanguage": "sa",
        "position": vNum,
        "isPartOf": {
          "@type": "Chapter",
          "@id": `${siteUrl}/bhagavad-gita/chapter/${cNum}#chapter`,
          "position": cNum
        },
        "url": `${siteUrl}/bhagavad-gita/chapter/${cNum}/verse/${vNum}`
      }
    : null;

  return (
    <>
      {verseSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(verseSchema) }}
        />
      )}
      {children}
    </>
  );
}
