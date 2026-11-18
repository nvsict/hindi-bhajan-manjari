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
  ] = await Promise.all([
    supabase.from('categories').select('slug'),
    supabase.from('deities').select('slug'),
    supabase.from('artists').select('slug, created_at'),
    // अगर articles में भी is_published कॉलम नहीं है, तो .eq() हटा दें
    supabase.from('articles').select('slug, published_at') 
  ]);

  // 2. 🌟 BATCH FETCHING FOR BHAJANS (Safe Fetching)
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

  // 3. Map Static Routes
  // 🌟 FIX: Removed /submit, /donate, /developers (often these have noindex tags)
  const staticRoutes = [
    { url: '', priority: 1.0 },
    { url: '/app', priority: 0.95 },
    { url: '/gyan', priority: 0.9 },
    { url: '/category', priority: 0.8 },
    { url: '/deity', priority: 0.8 },
    { url: '/artist', priority: 0.8 },
    { url: '/about', priority: 0.7 },
    { url: '/contact', priority: 0.7 },
  ].map((route) => ({
    url: `${baseUrl}${route.url}`,
    changeFrequency: 'weekly' as const,
    priority: route.priority,
  }));

  // 4. Map Dynamic Routes
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

  // 5. Combine everything
  return [
    ...staticRoutes,
    ...articleRoutes,
    ...bhajanRoutes, 
    ...categoryRoutes,
    ...deityRoutes,
    ...artistRoutes,
  ];
}