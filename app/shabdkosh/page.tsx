import { supabase } from '@/utils/supabase';
import { Metadata } from 'next';
import ShabdkoshClient from './ShabdkoshClient';

// Cache for 1 hour
export const revalidate = 3600;

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: 'सनातन शब्दकोश (Sanatan Shabdkosh) - Spiritual Dictionary | Hindi Bhajan Manjari',
  description: 'सनातन धर्म के कठिन शब्दों का सरल हिंदी और अंग्रेजी अर्थ। A beautifully structured spiritual dictionary for words used in Hindu Bhajans, Aartis, and Mantras.',
  keywords: 'Sanatan Shabdkosh, Hindu spiritual dictionary, Bhajan word meanings, Bhavarth, सनातन शब्दकोश, आध्यात्मिक डिक्शनरी',
  alternates: {
    canonical: `${siteUrl}/shabdkosh`,
  }
};

export default async function ShabdkoshPage() {
  // 1. Fetch all dictionary words from Supabase
  const { data: words, error } = await supabase
    .from('dictionary')
    .select('id, word_hi, word_en, meaning_hi, meaning_en, slug')
    .order('word_en', { ascending: true }); // Order by English alphabet for A-Z index

  const dictionaryWords = words || [];

  // ==========================================
  // 🌟 2. GOOGLE DICTIONARY SCHEMA (DefinedTermSet)
  // ==========================================
  const shabdkoshSchema = {
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `${siteUrl}/shabdkosh`,
    "name": "Sanatan Shabdkosh",
    "description": "A comprehensive spiritual dictionary for Hindu devotional words, bhajans, and aartis.",
    "inLanguage": ["hi", "en"],
    "hasDefinedTerm": dictionaryWords.map((word) => ({
      "@type": "DefinedTerm",
      "name": word.word_hi,
      "alternateName": word.word_en,
      "description": word.meaning_hi,
      ...(word.slug && { "url": `${siteUrl}/shabdkosh/${word.slug}` })
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      
      {/* 🌟 INJECT DICTIONARY SCHEMA */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(shabdkoshSchema) }} />

      {/* --- MINIMAL & ELEGANT HERO SECTION --- */}
      <div className="bg-[#1a0500] pt-24 pb-32 px-4 text-center relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-orange-600/20 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="relative z-10">
          <p className="text-orange-400 font-bold uppercase tracking-[0.3em] text-sm mb-4">
            Spiritual Dictionary
          </p>
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6 drop-shadow-md tracking-tighter leading-tight font-hindi">
            सनातन <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">शब्दकोश</span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl font-medium max-w-2xl mx-auto font-hindi leading-relaxed">
            भजनों, आरतियों और मंत्रों में प्रयोग होने वाले कठिन आध्यात्मिक शब्दों का सरल और सटीक अर्थ खोजें।
          </p>
        </div>
      </div>

      {/* --- CLIENT COMPONENT (SEARCH & A-Z LIST) --- */}
      <ShabdkoshClient initialWords={dictionaryWords} />

    </div>
  );
}