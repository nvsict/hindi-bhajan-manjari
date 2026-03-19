import { supabase } from '@/utils/supabase';

export async function GET() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

  // 1. Fetch the latest 50 published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('title_hindi, title_hinglish, slug, meta_description, published_at, featured_image_url, author_name')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .limit(50);

  // 2. Generate XML for each article
  const itemsXml = articles?.map((article) => {
    const articleUrl = `${siteUrl}/gyan/${article.slug}`;
    const pubDate = new Date(article.published_at).toUTCString();
    
    // 🌟 THE DISCOVER HACK: Ensure every post has an image, fallback to OG Image
    const imageUrl = article.featured_image_url || `${siteUrl}/api/og/articles?title=${encodeURIComponent(article.title_hinglish)}`;

    return `
      <item>
        <title><![CDATA[${article.title_hindi} | ${article.title_hinglish}]]></title>
        <link>${articleUrl}</link>
        <guid isPermaLink="true">${articleUrl}</guid>
        <pubDate>${pubDate}</pubDate>
        <description><![CDATA[${article.meta_description}]]></description>
        <author>${article.author_name || 'Hindi Bhajan Manjari'}</author>
        <media:content url="${imageUrl}" type="image/jpeg" medium="image" width="1200" height="630" />
      </item>
    `;
  }).join('') || '';

  // 3. Wrap items in the main RSS Feed structure
  const rssFeed = `<?xml version="1.0" encoding="UTF-8" ?>
  <rss version="2.0" xmlns:media="http://search.yahoo.com/mrss/" xmlns:atom="http://www.w3.org/2005/Atom">
    <channel>
      <title>Hindi Bhajan Manjari - Sanatan Gyan</title>
      <link>${siteUrl}</link>
      <description>Read the most authentic bhajans, aartis, and Sanatan Gyan articles.</description>
      <language>hi-IN</language>
      <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
      <atom:link href="${siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
      ${itemsXml}
    </channel>
  </rss>`;

  // 4. Return the XML response with caching
  return new Response(rssFeed, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      // Cache for 1 hour, serve stale while revalidating in background
      'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400',
    },
  });
}