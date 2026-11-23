import { MetadataRoute } from 'next';
import { supabase } from '@/utils/supabase';

// 🌟 Cache the sitemap for 24 hours
export const revalidate = 86400;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

  // 1. Fetch static/small tables in parallel
  const [
    { data: categories },
    { data: deities },
    { data: artists },
    { data: articles },
    { data: gitaChapters },
    { data: gitaVerses },
  ] = await Promise.all([
    supabase.from('categories').select('slug'),
    supabase.from('deities').select('slug'),
    supabase.from('artists').select('slug, created_at'),
    supabase.from('articles').select('slug, published_at'),
    supabase.from('gita_chapters').select('chapter_number').order('chapter_number'),
    supabase.from('gita_verses').select('chapter_number, verse_number').limit(1000),
  ]);

  // 2. 🌟 BATCH FETCHING FOR DICTIONARY (Safe Fetching across all pages)
  const allWords: any[] = [];
  let dictHasMore = true;
  let dictFrom = 0;
  const dictStep = 1000;

  while (dictHasMore) {
    const { data: dictData, error: dictError } = await supabase
      .from('dictionary')
      .select('slug')
      .range(dictFrom, dictFrom + dictStep - 1);

    if (dictError) {
      console.error(`❌ [Sitemap] Dictionary fetch error:`, dictError.message);
      break;
    }

    if (!dictData || dictData.length === 0) {
      dictHasMore = false;
    } else {
      allWords.push(...dictData);
      if (dictData.length < dictStep) dictHasMore = false;
      dictFrom += dictStep;
    }
  }

  // 3. 🌟 BATCH FETCHING FOR BHAJANS (Safe Fetching)
  const allBhajans: any[] = [];
  let hasMore = true;
  let from = 0;
  const step = 1000;

  while (hasMore) {
    const { data, error } = await supabase
      .from('mv_bhajan_details') 
      .select('slug, created_at')
      .range(from, from + step - 1);

    if (error) {
      console.error(
        `❌ [Sitemap] Bhajan fetch error at range ${from}-${from + step - 1}:`,
        error.message
      );
      break; 
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allBhajans.push(...data);
      if (data.length < step) hasMore = false;
      from += step;
    }
  }

  // 4. Map Static Routes
  // 🌟 High-value landing pages for search engines
  const staticRoutes = [
    { url: '', priority: 1.0 },
    { url: '/bhajan', priority: 0.95 },
    { url: '/bhagavad-gita', priority: 0.95 },
    { url: '/shabdkosh', priority: 0.9 },
    { url: '/app', priority: 0.95 },
    { url: '/gyan', priority: 0.9 },
    { url: '/category', priority: 0.8 },
    { url: '/deity', priority: 0.8 },
    { url: '/artist', priority: 0.8 },
    { url: '/author/mohit-tarkar', priority: 0.8 },
    { url: '/about', priority: 0.7 },
    { url: '/contact', priority: 0.7 },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    changeFrequency: 'weekly' as const,
    priority: route.priority,
  }));

  // 5. Map Dynamic Routes
  const bhajanRoutes = allBhajans.map((bhajan) => ({
    url: `${baseUrl}/bhajan/${bhajan.slug}`,
    lastModified: bhajan.created_at
      ? new Date(bhajan.created_at)
      : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const articleRoutes = (articles || []).map((article) => ({
    url: `${baseUrl}/gyan/${article.slug}`,
    lastModified: article.published_at
      ? new Date(article.published_at)
      : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const artistRoutes = (artists || []).map((artist) => ({
    url: `${baseUrl}/artist/${artist.slug}`,
    lastModified: artist.created_at
      ? new Date(artist.created_at)
      : undefined,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryRoutes = (categories || []).map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const deityRoutes = (deities || []).map((deity) => ({
    url: `${baseUrl}/deity/${deity.slug}`,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 📖 Gita Chapter Routes
  const gitaChapterRoutes = (gitaChapters || []).map((chapter) => ({
    url: `${baseUrl}/bhagavad-gita/chapter/${chapter.chapter_number}`,
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // 📖 Gita Verse Routes
  const gitaVerseRoutes = (gitaVerses || []).map((verse) => ({
    url: `${baseUrl}/bhagavad-gita/chapter/${verse.chapter_number}/verse/${verse.verse_number}`,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  // 📚 Sanatan Shabdkosh Dictionary Routes
  const dictionaryRoutes = allWords.map((word) => ({
    url: `${baseUrl}/shabdkosh/${encodeURI(word.slug)}`,
    changeFrequency: 'monthly' as const,
    priority: 0.75,
  }));

  // 6. Combine everything
  return [
    ...staticRoutes,
    ...bhajanRoutes, 
    ...articleRoutes,
    ...categoryRoutes,
    ...deityRoutes,
    ...artistRoutes,
    ...gitaChapterRoutes,
    ...gitaVerseRoutes,
    ...dictionaryRoutes,
  ];
}