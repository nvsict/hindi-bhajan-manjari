// ==========================================
// 🌟 LAYER 2: MULTI-SCRIPT TRANSLITERATION ENGINE (With Hinglish Normalizer)
// ==========================================
import { ScriptLanguage, ChapterNode, VerseNode } from '../types';

/**
 * हमारी ScriptLanguage को Sanscript लाइब्रेरी के स्कीम कोड से मैप करता है
 */
function getSanscriptScheme(script: ScriptLanguage): string {
  const schemeMap: Record<ScriptLanguage, string> = {
    devanagari: 'devanagari',
    gujarati: 'gujarati',
    bengali: 'bengali',
    telugu: 'telugu',
    gurmukhi: 'gurmukhi',
    kannada: 'kannada',
    tamil: 'tamil',
    oriya: 'oriya',
    malayalam: 'malayalam',
    assamese: 'bengali', // असमिया लिपि बंगाली के करीब होती है
    hinglish: 'iast',    // 🌟 FIX: ITRANS की जगह 'iast' का उपयोग ताकि अनचाहे Capitals और Dots न आएं
  };
  return schemeMap[script] || 'devanagari';
}

/**
 * ITRANS / IAST के कच्चे आउटपुट को आम पाठकों के पढ़ने लायक हिंग्लिश में बदलता है
 */
function cleanHinglishOutput(rawText: string): string {
  if (!rawText) return '';

  return rawText
    // 1. IAST/ITRANS के स्पेशल डाईक्रिटिक्स और अनुस्वार को सामान्य अंग्रेजी में बदलना
    .replace(/\.N|\.n|ṃ|ṅ|ñ|ṇ/g, 'n')
    .replace(/ṃ/g, 'm')
    // 2. ऋ (ṛ / RRi / R^i) को 'ri' में बदलना
    .replace(/ṛ|RRi|R\^i/g, 'ri')
    // 3. श / ष (ś / ṣ) को 'sh' में बदलना
    .replace(/ś|ṣ/g, 'sh')
    // 4. च (c) को हिंग्लिश के 'ch' और छ (ch) को 'chh' में बदलना
    .replace(/ch/g, 'chh')
    .replace(/([^\w]|^)c([a-z])/g, '$1ch$2')
    // 5. दीर्घ स्वरों (ā, ī, ū) से बार हटाना
    .replace(/ā/g, 'a')
    .replace(/ī/g, 'i')
    .replace(/ū/g, 'u')
    // 6. शब्दों के बीच के अनचाहे Capital Letters को Small करना (जैसे puShpa -> pushpa)
    .toLowerCase()
    // 7. हर लाइन के पहले अक्षर को Sentence Case (Capitalize) करना
    .replace(/(^\s*\w|[\.\!\|]\s*\w)/g, (char) => char.toUpperCase());
}

/**
 * टेक्स्ट को देवनागरी से टारगेट लिपि में सुरक्षित रूप से बदलता है
 */
async function transliterateText(text: string, targetScript: ScriptLanguage): Promise<string> {
  if (!text || targetScript === 'devanagari') return text;

  try {
    const SanscriptModule = await import('sanscript');
    const Sanscript = SanscriptModule.default || SanscriptModule;
    const targetScheme = getSanscriptScheme(targetScript);

    const rawTransliterated = Sanscript.t(text, 'devanagari', targetScheme);

    // 🌟 अगर टारगेट हिंग्लिश है, तो क्लीनर पाइपलाइन से गुजारें
    if (targetScript === 'hinglish') {
      return cleanHinglishOutput(rawTransliterated);
    }

    return rawTransliterated;
  } catch (error) {
    console.warn(`[TextProcessor] Transliteration failed for ${targetScript}, returning original:`, error);
    return text;
  }
}

/**
 * Supabase के रॉ भजन डेटा को प्रोसेस करके Universal ChapterNode बनाता है
 */
export async function processBhajanToChapter(
  rawBhajan: any,
  targetScript: ScriptLanguage = 'devanagari',
  includeMeaning: boolean = true
): Promise<ChapterNode> {
  // 1. शीर्षक और मुख्य टेक्स्ट (Smart Fallback: अगर DB में hinglish है तो उसे प्राथमिकता दें)
  const processedTitle = targetScript === 'hinglish' && rawBhajan.title_hinglish
    ? rawBhajan.title_hinglish
    : await transliterateText(rawBhajan.title_hindi || '', targetScript);

  const processedLyrics = targetScript === 'hinglish' && rawBhajan.lyrics_hinglish
    ? rawBhajan.lyrics_hinglish
    : await transliterateText(rawBhajan.lyrics_hindi || '', targetScript);

  const processedExplanation = includeMeaning
    ? (targetScript === 'hinglish' && rawBhajan.explanation_hinglish
        ? rawBhajan.explanation_hinglish
        : await transliterateText(rawBhajan.explanation || '', targetScript))
    : undefined;

  // 2. स्टैंजा (Verses) को सही लाइनों में तोड़ें
  const rawStanzas = String(processedLyrics)
    .split(/\n\s*\n/)
    .map(s => s.trim())
    .filter(Boolean);

  const verses: VerseNode[] = rawStanzas.map((stanza, idx) => {
    const lines = stanza
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean);

    // पहली कड़ी को 'chorus' (स्थाई) मानकर हाइलाइट करने के लिए
    const type = idx === 0 ? 'chorus' : 'verse';

    return { type, lines };
  });

  // 3. ChapterNode रिटर्न करें
  return {
    id: rawBhajan.slug || String(rawBhajan.id),
    titleMain: processedTitle,
    titleSecondary: rawBhajan.title_hinglish, // सब-टाइटल हमेशा ओरिजनल रहेगा
    deity: rawBhajan.deity?.name_hindi
      ? await transliterateText(rawBhajan.deity.name_hindi, targetScript)
      : rawBhajan.deity_name,
    category: rawBhajan.categories?.[0]?.name_hindi
      ? await transliterateText(rawBhajan.categories[0].name_hindi, targetScript)
      : rawBhajan.categories?.[0]?.name_hinglish,
    tarz: rawBhajan.tarj_parody
      ? await transliterateText(rawBhajan.tarj_parody, targetScript)
      : undefined,
    artist: rawBhajan.singer_details?.name,
    qrUrl: `https://hindibhajanmanjari.com/bhajan/${rawBhajan.slug}`,
    verses,
    explanation: processedExplanation,
  };
}