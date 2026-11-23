import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/', 
          '/api/',
          '/login',
          '/widget/', // Prevent indexing widget iframes
        ],
      },
      {
        userAgent: ['GPTBot', 'PerplexityBot', 'ClaudeBot', 'Google-Extended', 'Applebot-Extended'],
        allow: ['/', '/llms.txt', '/llms-full.txt'],
        disallow: ['/admin/', '/api/', '/login', '/widget/'],
      },
    ],
    sitemap: 'https://www.hindibhajanmanjari.com/sitemap.xml',
    host: 'https://www.hindibhajanmanjari.com',
  };
}