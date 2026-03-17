import { MetadataRoute } from 'next';
import { supabase } from '@/utils/supabase';

// 🌟 Cache the sitemap for 24 hours to prevent Vercel timeouts
export const revalidate = 86400; 

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hindibhajanmanjari.com';

  // 1. Fetch static/small tables in parallel (REMOVED TAGS)
  const [
    { data: categories },
    { data: deities },
    { data: artists },
    { data: articles }
  ] = await Promise.all([
    supabase.from('categories').select('slug'),
    supabase.from('deities').select('slug'),
    supabase.from('artists').select('slug, created_at'),
    supabase.from('articles').select('slug, published_at').eq('is_published', true)
  ]);

  // 2. Fetch all Bhajans
  const allBhajans: any[] = [];
  let hasMore = true;
  let from = 0;
  const step = 1000;

  while (hasMore) {
    const { data } = await supabase
      .from('bhajans')
      .select('slug, created_at') // 💡 TIP: If you add 'updated_at' to DB, use it here!
      .range(from, from + step - 1);

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allBhajans.push(...data);
      if (data.length < step) hasMore = false;
      from += step;
    }
  }

  // 3. Map Static Routes
  const staticRoutes = [
    '',
    '/search',
    '/gyan',
    '/developers',
    '/artist',
    '/saved',
    '/submit',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : (route === '/gyan' || route === '/developers') ? 0.9 : 0.8,
  }));

  // 4. Map Dynamic Routes
  const bhajanRoutes = allBhajans.map((bhajan) => ({
    url: `${baseUrl}/bhajan/${bhajan.slug}`,
    lastModified: bhajan.created_at ? new Date(bhajan.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const articleRoutes = (articles || []).map((article) => ({
    url: `${baseUrl}/gyan/${article.slug}`,
    lastModified: article.published_at ? new Date(article.published_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9,
  }));

  const artistRoutes = (artists || []).map((artist) => ({
    url: `${baseUrl}/artist/${artist.slug}`,
    lastModified: artist.created_at ? new Date(artist.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const categoryRoutes = (categories || []).map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  const deityRoutes = (deities || []).map((deity) => ({
    url: `${baseUrl}/deity/${deity.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 5. Combine everything (NO TAGS INCLUDED)
  return [
    ...staticRoutes,
    ...articleRoutes,
    ...bhajanRoutes,
    ...artistRoutes,
    ...categoryRoutes,
    ...deityRoutes,
  ];
}