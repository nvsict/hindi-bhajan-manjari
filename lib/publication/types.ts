// ==========================================
// 🌟 LAYER 3: UNIVERSAL DOCUMENT MODEL
// ==========================================
// Renderer कभी Supabase DB या HTML नहीं पढ़ेगा।
// वह सिर्फ इस PublicationDocument इंटरफ़ेस को पढ़ेगा।

export type ScriptLanguage = 
  | 'devanagari' 
  | 'hinglish' 
  | 'gujarati' 
  | 'bengali' 
  | 'gurmukhi' 
  | 'telugu' 
  | 'kannada' 
  | 'tamil' 
  | 'oriya' 
  | 'assamese' 
  | 'malayalam';

export type OutputFormat = 'pdf' | 'epub' | 'docx' | 'image-poster' | 'txt' | 'print-cmyk';
export type ThemeStyle = 'temple' | 'minimal' | 'pocket-kirtan' | 'festival';
export type PageSize = 'A4' | 'A5' | 'Letter' | 'Mobile-Slide';

// हर श्लोक/कड़ी का स्ट्रक्चर
export interface VerseNode {
  type: 'doha' | 'chorus' | 'verse' | 'bhavarth' | 'note';
  lines: string[];           // उदाहरण: ["जय गणेश जय गणेश...", "माता जाकी पार्वती..."]
  meaning?: string;          // भावार्थ (अगर यूज़र ने ऑप्शन चुना हो)
}

// हर भजन (Chapter) का स्ट्रक्चर
export interface ChapterNode {
  id: string;                // Bhajan ID or Slug
  titleMain: string;         // चुनी गई भाषा में शीर्षक
  titleSecondary?: string;   // Hinglish या मूल शीर्षक
  deity?: string;
  category?: string;
  tarz?: string;             // तर्ज / Melody Reference
  artist?: string;
  qrUrl?: string;            // वेबसाइट का डायरेक्ट लिंक / QR Code URL
  verses: VerseNode[];
  explanation?: string;      // सम्पूर्ण भावार्थ
}

// 🌟 THE MASTER DOCUMENT (जो Renderer के पास जाएगा)
export interface PublicationDocument {
  metadata: {
    title: string;           // उदाहरण: "शिव भजन एवं आरती संग्रह" या "श्री हनुमान चालीसा"
    subtitle?: string;
    description?: string;
    generatedAt: string;     // ISO Date
    websiteName: 'Hindi Bhajan Manjari';
    websiteUrl: string;
    customUserTitle?: string;// अगर यूज़र ने अपनी कस्टम बुक का नाम दिया हो
  };
  
  config: {
    targetFormat: OutputFormat;
    script: ScriptLanguage;
    theme: ThemeStyle;
    pageSize: PageSize;
    includeMeaning: boolean; // क्या भावार्थ शामिल करना है?
    includeQrCode: boolean;  // क्या QR कोड शामिल करना है?
    fontSizeScale: number;   // 1 = Normal, 1.2 = Large (Kirtan friendly)
  };

  // इसमें 1 भजन भी हो सकता है और यूज़र द्वारा चुने गए 100 भजन भी!
  chapters: ChapterNode[];
}