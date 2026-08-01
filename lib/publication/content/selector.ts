// ==========================================
// 🌟 LAYER 1: CONTENT SELECTION ENGINE
// ==========================================
import { supabase } from '@/utils/supabase';
import { PublicationDocument, ScriptLanguage, ThemeStyle, PageSize, OutputFormat } from '../types';
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
    return null;
  }

  const script = options.script || 'devanagari';
  const includeMeaning = options.includeMeaning ?? true;

  // Layer 2 Processor से चैप्टर बनाना
  const chapter = await processBhajanToChapter(bhajan, script, includeMeaning);

  return {
    metadata: {
      title: chapter.titleMain,
      subtitle: chapter.titleSecondary,
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
 * यूज़र भविष्य में चाहे 50 शिव भजन चुने या अपनी मनपसंद प्लेलिस्ट, यह एक सम्पूर्ण ई-बुक/किताब बनाएगा!
 */
export async function createMultiBhajanDocument(
  title: string,
  slugs: string[],
  options: PublicationRequestOptions = {}
): Promise<PublicationDocument> {
  
  const { data: bhajans, error } = await supabase
    .from('mv_bhajan_details')
    .select('*')
    .in('slug', slugs);

  const script = options.script || 'devanagari';
  const includeMeaning = options.includeMeaning ?? false; // बड़ी किताब में डिफ़ॉल्ट रूप से भावार्थ ऑफ रख सकते हैं

  // सभी भजनों को प्रोसेस करके Chapters में बदलना
  const chapters = await Promise.all(
    (bhajans || []).map(b => processBhajanToChapter(b, script, includeMeaning))
  );

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