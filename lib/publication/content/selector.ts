// ==========================================
// 🌟 LAYER 1: CONTENT SELECTION ENGINE
// ==========================================
import { supabase } from '@/utils/supabase';
import {
  PublicationDocument,
  ScriptLanguage,
  ThemeStyle,
  PageSize,
  OutputFormat,
} from '../types';
import { processBhajanToChapter } from '../processors/textProcessor';

export interface PublicationRequestOptions {
  targetFormat?: OutputFormat;
  script?: ScriptLanguage;
  theme?: ThemeStyle;
  pageSize?: PageSize;
  includeMeaning?: boolean;
  includeQrCode?: boolean;
  fontSizeScale?: number;
  customTitle?: string;
}

// 🌟 HELPER: बड़े ऐरे (slugs) को छोटे टुकड़ों (batches) में बांटने के लिए
function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

/**
 * 1. Single Bhajan Selector: सिर्फ एक भजन के लिए Document Model बनाता है
 */
export async function createSingleBhajanDocument(
  slug: string,
  options: PublicationRequestOptions = {}
): Promise<PublicationDocument | null> {
  const { data: bhajan, error } = await supabase
    .from('mv_bhajan_details')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !bhajan) {
    console.error(`[PublicationEngine] Failed to fetch bhajan: ${slug}`, error);
    throw new Error(`भजन डेटा प्राप्त करने में समस्या आई: ${slug}`);
  }

  const script = options.script || 'devanagari';
  const includeMeaning = options.includeMeaning ?? true;

  // Layer 2 Processor से चैप्टर बनाना
  const chapter = await processBhajanToChapter(bhajan, script, includeMeaning);

  if (!chapter) {
    throw new Error("भजन चैप्टर प्रोसेस नहीं हो सका।");
  }

  return {
    metadata: {
      title: chapter.titleMain || bhajan.title_hindi || 'भजन',
      subtitle: chapter.titleSecondary || bhajan.title_hinglish || undefined,
      description: bhajan.meta_description || undefined,
      generatedAt: new Date().toISOString(),
      websiteName: 'Hindi Bhajan Manjari',
      websiteUrl: 'https://www.hindibhajanmanjari.com',
    },
    config: {
      targetFormat: options.targetFormat || 'pdf',
      script,
      theme: options.theme || 'temple',
      pageSize: options.pageSize || 'A4',
      includeMeaning,
      includeQrCode: options.includeQrCode ?? true,
      fontSizeScale: options.fontSizeScale || 1.0,
    },
    chapters: [chapter],
  };
}

/**
 * 2. Multi-Bhajan Book Selector (Deity / Category / Custom Playlist)
 * 🌟 FIXED: Chunking (Batching), User-Order Sorting & Strict Validation
 */
export async function createMultiBhajanDocument(
  title: string,
  slugs: string[],
  options: PublicationRequestOptions = {}
): Promise<PublicationDocument> {
  if (!slugs || slugs.length === 0) {
    throw new Error("कृपया कम से कम 1 भजन चुनें।");
  }

  // 1. 🌟 BATCHING FIX: URL Character Limit (ERR_FAILED) से बचने के लिए 25-25 के बैच में लोड करें
  const slugBatches = chunkArray(slugs, 25);
  const allFetchedBhajans: any[] = [];

  for (const batch of slugBatches) {
    const { data, error } = await supabase
      .from('mv_bhajan_details')
      .select('*')
      .in('slug', batch);

    if (error) {
      console.error("[PublicationEngine] Batch fetch error:", error);
      throw new Error(`डेटाबेस से भजन लोड करने में समस्या आई: ${error.message}`);
    }

    if (data && data.length > 0) {
      allFetchedBhajans.push(...data);
    }
  }

  // 2. 🌟 STRICT VALIDATION: कोई डेटा न मिलने पर एरर थ्रो करें (ताकि 400 Bad Request न आए)
  if (allFetchedBhajans.length === 0) {
    throw new Error("चुने गए भजनों का डेटाबेस से कोई विवरण प्राप्त नहीं हो सका।");
  }

  // 3. 🌟 ORDER SORTING: यूज़र ने जिस क्रम में भजन चुने हैं, उसी क्रम में सजाएं
  const bhajanMap = new Map(allFetchedBhajans.map((b) => [b.slug, b]));
  const orderedBhajans = slugs
    .map((slug) => bhajanMap.get(slug))
    .filter(Boolean); // जो सफलतापूर्वक मिले केवल उन्हें रखें

  if (orderedBhajans.length === 0) {
    throw new Error("वैलिड भजन विवरण तैयार नहीं हो सका।");
  }

  const script = options.script || 'devanagari';
  const includeMeaning = options.includeMeaning ?? false;

  // 4. सभी भजनों को प्रोसेस करके Chapters में बदलना
  const chapters = await Promise.all(
    orderedBhajans.map((b) => processBhajanToChapter(b, script, includeMeaning))
  );

  // 5. 🌟 FINAL SAFETY CHECK: खाली चैप्टर्स मॉडल को रोकें
  if (!chapters || chapters.length === 0) {
    throw new Error("डॉक्यूमेंट मॉडल (Chapters) नहीं बन पाया।");
  }

  return {
    metadata: {
      title: options.customTitle || title,
      subtitle: `${chapters.length} दिव्य भजनों का विशेष संग्रह`,
      generatedAt: new Date().toISOString(),
      websiteName: 'Hindi Bhajan Manjari',
      websiteUrl: 'https://www.hindibhajanmanjari.com',
    },
    config: {
      targetFormat: options.targetFormat || 'pdf',
      script,
      theme: options.theme || 'temple',
      pageSize: options.pageSize || 'A4',
      includeMeaning,
      includeQrCode: options.includeQrCode ?? true,
      fontSizeScale: options.fontSizeScale || 1.0,
    },
    chapters,
  };
}