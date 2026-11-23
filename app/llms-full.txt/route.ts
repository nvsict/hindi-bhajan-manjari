import { supabase } from '@/utils/supabase';

// ==========================================
// /llms-full.txt — comprehensive knowledge map for LLMs & AI Agents (llmstxt.org)
// ==========================================

export const revalidate = 86400; // 24h cache

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com').replace(/\/$/, '');

const CACHE_TTL_MS = 60 * 60 * 1000;
let cached: { body: string; at: number } | null = null;

const clean = (s?: string | null) =>
  (s ?? '').replace(/[\[\]\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

const label = (hinglish?: string | null, hindi?: string | null) => {
  const en = clean(hinglish);
  const hi = clean(hindi);
  if (en && hi && en !== hi) return `${en} (${hi})`;
  return en || hi;
};

const link = (title: string, path: string, note?: string) =>
  `- [${title}](${SITE_URL}${path})${note ? `: ${note}` : ''}`;

async function buildLlmsFullTxt(): Promise<string> {
  const [deities, categories, artists, bhajans, gitaChapters, dictSample] = await Promise.all([
    supabase.from('deities').select('slug, name_hinglish, name_hindi').order('name_hinglish'),
    supabase.from('categories').select('slug, name_hinglish, name_hindi').order('name_hinglish'),
    supabase.from('artists').select('slug, name_hinglish, name_hindi').limit(200),
    supabase.from('mv_bhajan_details').select('slug, title_hindi, title_hinglish, deity, singer_details').limit(500),
    supabase.from('gita_chapters').select('chapter_number, name_sanskrit, name_translation, meaning_hi').order('chapter_number'),
    supabase.from('dictionary').select('slug, word_hi, word_en, meaning_hi').limit(100),
  ]);

  const lines: string[] = [];

  lines.push('# Hindi Bhajan Manjari (हिंदी भजन मंजरी) — Full Knowledge Index');
  lines.push('');
  lines.push('> Comprehensive spiritual archive of Sanatan Dharma: Bhajans, Aartis, Chalisas, Mantras, Shrimad Bhagavad Gita, and Sanatan Shabdkosh.');
  lines.push('');
  lines.push('Language: Hindi (Devanagari), Sanskrit, and Hinglish transliteration.');
  lines.push(`Canonical Website: ${SITE_URL}`);
  lines.push(`XML Sitemap: ${SITE_URL}/sitemap.xml`);
  lines.push('');

  // 1. Shrimad Bhagavad Gita
  lines.push('## Shrimad Bhagavad Gita (18 Chapters & 700 Slokas)');
  lines.push(link('Bhagavad Gita Home', '/bhagavad-gita', 'All 18 chapters and daily sloka'));
  if (gitaChapters.data) {
    for (const c of gitaChapters.data) {
      lines.push(link(`Adhyay ${c.chapter_number}: ${c.name_sanskrit} (${c.name_translation})`, `/bhagavad-gita/chapter/${c.chapter_number}`, c.meaning_hi || undefined));
    }
  }
  lines.push('');

  // 2. Deities
  lines.push('## Deities (देवी-देवता)');
  if (deities.data) {
    for (const d of deities.data) {
      lines.push(link(label(d.name_hinglish, d.name_hindi), `/deity/${d.slug}`));
    }
  }
  lines.push('');

  // 3. Categories
  lines.push('## Categories (विधाएँ)');
  if (categories.data) {
    for (const c of categories.data) {
      lines.push(link(label(c.name_hinglish, c.name_hindi), `/category/${c.slug}`));
    }
  }
  lines.push('');

  // 4. Popular Bhajans
  lines.push('## Curated Bhajans & Aartis');
  if (bhajans.data) {
    for (const b of bhajans.data) {
      const singer = b.singer_details?.name ? `Sung by ${b.singer_details.name}` : undefined;
      lines.push(link(label(b.title_hinglish, b.title_hindi), `/bhajan/${b.slug}`, singer));
    }
  }
  lines.push('');

  // 5. Popular Artists
  lines.push('## Artists & Saints (भक्त, गायक एवं संत)');
  if (artists.data) {
    for (const a of artists.data) {
      lines.push(link(label(a.name_hinglish, a.name_hindi), `/artist/${a.slug}`));
    }
  }
  lines.push('');

  // 6. Sanatan Shabdkosh
  lines.push('## Sanatan Shabdkosh (Spiritual Dictionary Sample)');
  lines.push(link('Sanatan Shabdkosh Directory', '/shabdkosh', 'Explore 1,300+ spiritual terms and meanings'));
  if (dictSample.data) {
    for (const w of dictSample.data) {
      lines.push(link(`${w.word_hi} (${w.word_en || ''})`, `/shabdkosh/${encodeURI(w.slug)}`, w.meaning_hi ? clean(w.meaning_hi).substring(0, 80) : undefined));
    }
  }
  lines.push('');

  return lines.join('\n');
}

export async function GET() {
  const now = Date.now();
  let body: string;

  if (cached && now - cached.at < CACHE_TTL_MS) {
    body = cached.body;
  } else {
    try {
      body = await buildLlmsFullTxt();
      cached = { body, at: now };
    } catch (err) {
      console.error('[llms-full.txt] build failed:', err);
      if (!cached) return new Response('llms-full.txt is temporarily unavailable.', { status: 503, headers: { 'Retry-After': '300' } });
      body = cached.body;
    }
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      'X-Robots-Tag': 'noindex',
    },
  });
}
