import { MetadataRoute } from 'next';
import { supabase } from '../utils/supabase';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.hindibhajanmanjari.com';

  // 🌟 CRITICAL FIX: The Pagination Loop
  // Supabase limits queries to 1000 rows. This loop ensures we fetch all 10,000+ 
  // Bhajans so none of them are left out of the Google index.
  const allBhajans: any[] = [];
  let hasMore = true;
  let from = 0;
  const step = 1000;

  while (hasMore) {
    const { data } = await supabase
      .from('bhajans')
      .select('slug, created_at')
      .range(from, from + step - 1);

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      allBhajans.push(...data);
      if (data.length < step) hasMore = false;
      from += step;
    }
  }

  // Assuming Categories, Deities, Tags, and Artists are under 1,000 rows each.
  // (If any of these ever cross 1,000, use the same while-loop technique!)
  const { data: categories } = await supabase.from('categories').select('slug');
  const { data: deities } = await supabase.from('deities').select('slug');
  const { data: tags } = await supabase.from('tags').select('slug');
  const { data: artists } = await supabase.from('artists').select('slug, created_at');

  // 2. Define truly static routes
  const staticRoutes = [
    '',
    '/search',     // 🌟 Added Search Page
    '/developers', // 🌟 Added your new SaaS Dashboard
    '/artist',
    '/saved',
    '/submit',
    '/about',
    '/contact',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1.0 : route === '/developers' ? 0.9 : 0.5, 
  }));

  // 3. Map Bhajan pages (High Priority)
  const bhajanRoutes = allBhajans.map((bhajan) => ({
    url: `${baseUrl}/bhajan/${bhajan.slug}`,
    lastModified: bhajan.created_at ? new Date(bhajan.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.9, 
  }));

  // 4. Map Artist Profile pages
  const artistRoutes = (artists || []).map((artist) => ({
    url: `${baseUrl}/artist/${artist.slug}`,
    lastModified: artist.created_at ? new Date(artist.created_at) : new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 5. Map Category pages
  const categoryRoutes = (categories || []).map((category) => ({
    url: `${baseUrl}/category/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 6. Map Deity pages
  const deityRoutes = (deities || []).map((deity) => ({
    url: `${baseUrl}/deity/${deity.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // 7. Map Tag pages
  const tagRoutes = (tags || []).map((tag) => ({
    url: `${baseUrl}/tag/${tag.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [
    ...staticRoutes, 
    ...bhajanRoutes, 
    ...artistRoutes, 
    ...categoryRoutes, 
    ...deityRoutes, 
    ...tagRoutes
  ];
}