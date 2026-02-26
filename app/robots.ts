import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/', 
        '/api/',
        '/login',
        '/widget/', // 🌟 THE FIX: Prevent Google from indexing your naked widget iframes
      ],
    },
    sitemap: 'https://www.hindibhajanmanjari.com/sitemap.xml',
  };
}