import { supabase } from '@/utils/supabase';
import { Metadata } from 'next';
import ShabdkoshClient from './ShabdkoshClient';

export const dynamic = 'force-dynamic';

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

// 🌟 FIX: In Next.js 15, searchParams is a Promise
export default async function ShabdkoshPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 🌟 FIX: Unwrap the Promise before accessing properties
  const resolvedSearchParams = await searchParams;

  // Determine what the user is looking for based on URL, default to 'A'
  const letter = typeof resolvedSearchParams.letter === 'string' ? resolvedSearchParams.letter.toUpperCase() : 'A';
  const searchQuery = typeof resolvedSearchParams.q === 'string' ? resolvedSearchParams.q : '';

  // 🌟 THE SCALABLE QUERY: Only fetch exactly what we need
  let query = supabase
    .from('dictionary')
    .select('id, word_hi, word_en, meaning_hi, meaning_en, slug')
    .order('word_en', { ascending: true });

  if (searchQuery) {
    // Search mode: Look across multiple columns, limit to 100 results to prevent lag
    query = query
      .or(`word_hi.ilike.%${searchQuery}%,word_en.ilike.%${searchQuery}%,meaning_hi.ilike.%${searchQuery}%`)
      .limit(100);
  } else if (letter === '#') {
    // Special character mode: Fetch words with no English translation yet
    query = query.is('word_en', null);
  } else {
    // Letter mode: Fetch only words starting with the active letter (e.g., "A%")
    query = query.ilike('word_en', `${letter}%`);
  }

  const { data: words, error } = await query;

  if (error) {
    console.error("Error fetching dictionary words:", error);
  }

  const dictionaryWords = words || [];

  // 🌟 DYNAMIC SCHEMA: Only inject the schema for the words currently on screen
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
      "alternateName": word.word_en || "",
      "description": word.meaning_hi,
      ...(word.slug && { "url": `${siteUrl}/shabdkosh/${word.slug}` })
    }))
  };

  return (
    <div className="min-h-screen bg-gray-50/50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(shabdkoshSchema) }} />

      <div className="bg-[#1a0500] pt-24 pb-32 px-4 text-center relative overflow-hidden">
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

      <ShabdkoshClient 
        words={dictionaryWords} 
        currentLetter={!searchQuery ? letter : null} 
        currentSearch={searchQuery}
      />
    </div>
  );
}