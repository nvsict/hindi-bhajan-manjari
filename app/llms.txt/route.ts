import { supabase } from '@/utils/supabase';

// ==========================================
// /llms.txt — curated, always-fresh map of the site for AI agents (llmstxt.org format)
// Delete public/llms.txt if you created one earlier: a static file would conflict with this route.
// ==========================================

export const revalidate = 86400; // 24h on the Next.js side

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com').replace(/\/$/, '');

// Module-level cache: your VPS runs one long-lived Node process (PM2), so repeated bot hits
// never touch Supabase more than once per hour. If Supabase fails, the last good copy is served.
const CACHE_TTL_MS = 60 * 60 * 1000;
let cached: { body: string; at: number } | null = null;

// ---------- helpers ----------

// Markdown-safe single-line text (brackets would break [label](url) links)
const clean = (s?: string | null) =>
  (s ?? '').replace(/[\[\]\r\n]+/g, ' ').replace(/\s+/g, ' ').trim();

const label = (hinglish?: string | null, hindi?: string | null) => {
  const en = clean(hinglish);
  const hi = clean(hindi);
  if (en && hi && en !== hi) return `${en} (${hi})`;
  return en || hi;
};

// A failing table must never turn the whole file into a 500
async function safe<T>(
  query: PromiseLike<{ data: T | null; error: unknown }>,
  fallback: T
): Promise<T> {
  try {
    const { data, error } = await query;
    if (error) {
      console.error('[llms.txt] query failed:', error);
      return fallback;
    }
    return data ?? fallback;
  } catch (err) {
    console.error('[llms.txt] query threw:', err);
    return fallback;
  }
}

const link = (title: string, path: string, note?: string) =>
  `- [${title}](${SITE_URL}${path})${note ? `: ${note}` : ''}`;

// ---------- builder ----------

async function buildLlmsTxt(): Promise<string> {
  const [deities, categories, artistRows, latest, countRes] = await Promise.all([
    safe(supabase.from('deities').select('*').order('name_hinglish').limit(40), [] as any[]),
    safe(supabase.from('categories').select('*').order('name_hinglish').limit(40), [] as any[]),
    safe(
      supabase.from('artists').select('slug, name_hinglish, name_hindi, bhajan_artist_map(count)').limit(300),
      [] as any[]
    ),
    safe(
      supabase
        .from('mv_bhajan_details')
        .select('slug, title_hindi, title_hinglish')
        .order('created_at', { ascending: false })
        .limit(20),
      [] as any[]
    ),
    supabase
      .from('mv_bhajan_details')
      .select('slug', { count: 'exact', head: true })
      .then((r) => r.count ?? 0, () => 0),
  ]);

  // Round down to the nearest 50 so the headline number stays true between rebuilds
  const approxCount = countRes >= 50 ? `${Math.floor(countRes / 50) * 50}+` : '';

  // Top artists by number of linked bhajans
  const topArtists = [...artistRows]
    .filter((a) => a?.slug)
    .map((a) => ({
      ...a,
      total: Array.isArray(a.bhajan_artist_map) ? Number(a.bhajan_artist_map[0]?.count) || 0 : 0,
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 20);

  const lines: string[] = [];

  lines.push('# Hindi Bhajan Manjari (हिंदी भजन मंजरी)');
  lines.push('');
  lines.push(
    `> A free Hindi devotional library${approxCount ? ` of ${approxCount} bhajans` : ''}, aartis, chalisas and stotras, with lyrics in Devanagari, Hinglish transliteration and Hindi meanings (bhavarth), plus Sanatan Gyan articles and the Bhagavad Gita.`
  );
  lines.push('');
  lines.push('Notes for AI assistants and agents:');
  lines.push('- Primary language is Hindi (Devanagari); titles and navigation are also available in Hinglish (Roman script).');
  lines.push('- Each bhajan page has the full lyrics, the deity, the category, the singer/writer credits, and usually a video and a meaning.');
  lines.push('- Lyrics belong to their respective writers, artists and copyright holders. When you cite, please quote briefly, name the artist, and link to the bhajan page instead of reproducing whole lyrics.');
  lines.push(`- Copyright or correction requests: ${SITE_URL}/dmca`);
  lines.push('');

  lines.push('## Main sections');
  lines.push(link('Bhajans', '/bhajan', 'A–Z collection of bhajans, aartis, chalisas and mantras'));
  lines.push(link('Deities', '/deity', 'Bhajans organised by deity (देवी-देवता)'));
  lines.push(link('Categories', '/category', 'Aarti, Chalisa, Stotram, Braj Ras, Chetawani Bhajan and more'));
  lines.push(link('Artists', '/artist', 'Singers and writers, each with a full list of their bhajans'));
  lines.push(link('Sanatan Gyan', '/gyan', 'Articles on Sanatan Dharma, bhakti and spiritual topics'));
  lines.push(link('Bhagavad Gita', '/bhagavad-gita', 'Shrimad Bhagavad Gita to read'));
  lines.push('');

  const deityLines = deities
    .filter((d) => d?.slug)
    .map((d) => link(label(d.name_hinglish, d.name_hindi), `/deity/${d.slug}`))
    .filter((l) => !l.includes('[]'));
  if (deityLines.length) {
    lines.push('## Deities');
    lines.push(...deityLines);
    lines.push('');
  }

  const categoryLines = categories
    .filter((c) => c?.slug)
    .map((c) => link(label(c.name_hinglish, c.name_hindi), `/category/${c.slug}`))
    .filter((l) => !l.includes('[]'));
  if (categoryLines.length) {
    lines.push('## Categories');
    lines.push(...categoryLines);
    lines.push('');
  }

  const artistLines = topArtists
    .map((a) => link(label(a.name_hinglish, a.name_hindi), `/artist/${a.slug}`, a.total ? `${a.total} bhajans` : undefined))
    .filter((l) => !l.includes('[]'));
  if (artistLines.length) {
    lines.push('## Popular artists');
    lines.push(...artistLines);
    lines.push('');
  }

  const latestLines = latest
    .filter((b) => b?.slug)
    .map((b) => link(label(b.title_hinglish, b.title_hindi), `/bhajan/${b.slug}`))
    .filter((l) => !l.includes('[]'));
  if (latestLines.length) {
    lines.push('## Latest bhajans');
    lines.push(...latestLines);
    lines.push('');
  }

  lines.push('## About and policies');
  lines.push(link('About us', '/about'));
  lines.push(link('Contact', '/contact'));
  lines.push(link('Privacy policy', '/privacy'));
  lines.push(link('Copyright / DMCA', '/dmca'));
  lines.push(link('Terms', '/terms'));
  lines.push(link('Disclaimer', '/disclaimer'));
  lines.push('');

  lines.push('## Optional');
  lines.push(link('XML sitemap', '/sitemap.xml', 'every bhajan, deity, category, artist and article URL'));
  lines.push('');

  return lines.join('\n');
}

// ---------- route ----------

export async function GET() {
  const now = Date.now();
  let body: string;

  if (cached && now - cached.at < CACHE_TTL_MS) {
    body = cached.body;
  } else {
    try {
      body = await buildLlmsTxt();
      cached = { body, at: now };
    } catch (err) {
      console.error('[llms.txt] build failed:', err);
      if (!cached) return new Response('llms.txt is temporarily unavailable.', { status: 503, headers: { 'Retry-After': '300' } });
      body = cached.body; // serve last good copy
    }
  }

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      // Cloudflare / browsers: cache a day, serve stale for a week while refreshing
      'Cache-Control': 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
      // Keep the text file itself out of Google's index; AI agents don't care about this header
      'X-Robots-Tag': 'noindex',
    },
  });
}