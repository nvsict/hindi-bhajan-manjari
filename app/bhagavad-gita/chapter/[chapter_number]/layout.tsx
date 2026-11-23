import { Metadata } from 'next';
import { supabase } from '@/utils/supabase';

interface ChapterLayoutProps {
  children: React.ReactNode;
  params: Promise<{ chapter_number: string }>;
}

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ chapter_number: string }>;
}): Promise<Metadata> {
  const { chapter_number } = await params;
  const cNum = Number(chapter_number) || 1;

  const { data: chapter } = await supabase
    .from('gita_chapters')
    .select('*')
    .eq('chapter_number', cNum)
    .maybeSingle();

  if (!chapter) {
    return {
      title: `अध्याय ${cNum} | श्रीमद्भगवद्गीता`,
      description: `श्रीमद्भगवद्गीता अध्याय ${cNum} के संपूर्ण श्लोक और हिंदी भावार्थ।`,
    };
  }

  const title = `अध्याय ${cNum}: ${chapter.name_sanskrit} (${chapter.name_translation}) | श्रीमद्भगवद्गीता`;
  const summarySnippet = chapter.summary_hi
    ? `${chapter.summary_hi.substring(0, 140)}... `
    : '';
  const description = `श्रीमद्भगवद्गीता अध्याय ${cNum} (${chapter.name_sanskrit} - ${chapter.meaning_hi})। कुल ${chapter.verses_count} श्लोक अर्थ व भावार्थ सहित। ${summarySnippet}दैनिक पाठ व स्वाध्याय।`;
  const canonicalUrl = `${siteUrl}/bhagavad-gita/chapter/${cNum}`;

  return {
    title,
    description,
    keywords: [
      `Gita Chapter ${cNum}`,
      `Bhagavad Gita Adhyay ${cNum}`,
      chapter.name_sanskrit,
      chapter.name_translation,
      chapter.name_transliteration,
      `भगवद्गीता अध्याय ${cNum}`,
      'Gita Slokas Hindi Meaning',
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

export default async function ChapterLayout({
  children,
  params,
}: ChapterLayoutProps) {
  const { chapter_number } = await params;
  const cNum = Number(chapter_number) || 1;

  const { data: chapter } = await supabase
    .from('gita_chapters')
    .select('*')
    .eq('chapter_number', cNum)
    .maybeSingle();

  const chapterSchema = chapter
    ? {
        "@context": "https://schema.org",
        "@type": "Chapter",
        "@id": `${siteUrl}/bhagavad-gita/chapter/${cNum}#chapter`,
        "name": `अध्याय ${cNum}: ${chapter.name_sanskrit}`,
        "alternateName": chapter.name_translation,
        "position": cNum,
        "description": chapter.summary_hi || chapter.meaning_hi,
        "isPartOf": {
          "@type": "Book",
          "@id": `${siteUrl}/bhagavad-gita#book`,
          "name": "श्रीमद्भगवद्गीता (Shrimad Bhagavad Gita)"
        },
        "url": `${siteUrl}/bhagavad-gita/chapter/${cNum}`
      }
    : null;

  return (
    <>
      {chapterSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(chapterSchema) }}
        />
      )}
      {children}
    </>
  );
}
