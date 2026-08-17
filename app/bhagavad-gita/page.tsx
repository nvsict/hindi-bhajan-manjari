"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import Sanscript from '@indic-transliteration/sanscript';
import { 
  FaWhatsapp, FaSearch, FaArrowRight, FaLanguage, 
  FaBookOpen, FaOm, FaSpinner, FaPlayCircle 
} from 'react-icons/fa';

// 🌟 ग्लोबल कैश ताकि वापस आने पर पेज तुरंत खुले (Zero Latency)
const homeCache: { chapters: any[]; dailyVerse: any | null } = { chapters: [], dailyVerse: null };

export default function BhagavadGitaHomePage() {
  const [chapters, setChapters] = useState<any[]>([]);
  const [dailyVerse, setDailyVerse] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [script, setScript] = useState<string>('devanagari');

  // लिपियों की सूची
  const supportedScripts = [
    { id: 'devanagari', label: 'देवनागरी (संस्कृत)' },
    { id: 'hk', label: 'English (Roman)' },
    { id: 'gujarati', label: 'ગુજરાતી' },
    { id: 'bengali', label: 'বাংলা' },
    { id: 'telugu', label: 'తెలుగు' },
  ];

  useEffect(() => {
    let isMounted = true;

    const fetchHomeData = async () => {
      // अगर डेटा कैश में है, तो तुरंत दिखाएं
      if (homeCache.chapters.length > 0) {
        setChapters(homeCache.chapters);
        setDailyVerse(homeCache.dailyVerse);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        if (!supabase) throw new Error("Supabase Client Not Found");

        // 1. सभी 18 अध्याय फेच करें (chapter_number के क्रम में)
        const { data: chaptersData } = await supabase
          .from('gita_chapters')
          .select('*')
          .order('chapter_number', { ascending: true });

        // 2. 'आज का श्लोक' के लिए एक श्लोक चुनें (दिन के हिसाब से)
        // 2. 'आज का श्लोक' के लिए एक श्लोक चुनें (दिन के हिसाब से)
        const popularVerses = ['BG2.47', 'BG4.7', 'BG4.8', 'BG2.22', 'BG9.22', 'BG18.66'];
        const todayVerseId = popularVerses[new Date().getDate() % popularVerses.length];

        const { data: verseData } = await supabase
          .from('gita_verses')
          .select('*')
          .eq('id', todayVerseId)
          .single();

        let displayMeaning = "अर्थ उपलब्ध नहीं है।";
        
        if (verseData) {
          // 🌟 SMART FIX: हिंदी और इंग्लिश दोनों को फेच करें
          const { data: commentaries } = await supabase
            .from('gita_commentaries')
            .select('content_text, language')
            .eq('verse_id', todayVerseId);

          if (commentaries && commentaries.length > 0) {
            // प्राथमिकता 1: पहले हिंदी (hi) अर्थ ढूँढें
            const hiComm = commentaries.find(c => ['hi', 'Hindi', 'hindi'].includes(c.language));
            // प्राथमिकता 2: अगर हिंदी न मिले, तो इंग्लिश (en) ढूँढें
            const enComm = commentaries.find(c => ['en', 'English', 'english'].includes(c.language));

            if (hiComm) {
              displayMeaning = hiComm.content_text;
            } else if (enComm) {
              displayMeaning = enComm.content_text;
            }
          }
        }

        const finalDailyVerse = verseData ? { ...verseData, meaning: displayMeaning } : null;

        // कैश में सेव करें
        if (chaptersData) homeCache.chapters = chaptersData;
        if (finalDailyVerse) homeCache.dailyVerse = finalDailyVerse;

        if (isMounted) {
          setChapters(chaptersData || []);
          setDailyVerse(finalDailyVerse);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Home Data Fetch Error:", error);
        if (isMounted) setIsLoading(false);
      }
    };

    fetchHomeData();
    return () => { isMounted = false; };
  }, []);

  // 🌟 ट्रांसलिट्रेशन लॉजिक (श्लोक को चुनी गई लिपि में बदलना)
  const getDisplayVerse = (sanskritText: string) => {
    if (script === 'devanagari') return sanskritText;
    if (script === 'hk' && dailyVerse?.transliteration) return dailyVerse.transliteration;
    try {
      return Sanscript.t(sanskritText, 'devanagari', script);
    } catch (e) {
      return sanskritText;
    }
  };

  const handleWhatsAppShare = () => {
    if (!dailyVerse) return;
    const text = `✨ *आज का श्लोक (भगवद्गीता)* ✨\n\n📖 *अध्याय ${dailyVerse.chapter_number}, श्लोक ${dailyVerse.verse_number}*\n\n🕉️ *श्लोक:*\n${getDisplayVerse(dailyVerse.sanskrit)}\n\n🇮🇳 *अर्थ:*\n${dailyVerse.meaning}\n\n👉 *पढ़ने के लिए क्लिक करें:* ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] space-y-4">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
        <p className="text-orange-800 font-bold font-hindi animate-pulse">गीता का ज्ञान लोड हो रहा है...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 py-6 px-4 sm:px-6 lg:px-8 font-sans selection:bg-orange-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ==========================================
            1. COMPACT HEADER & SEARCH
            ========================================== */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <span className="text-orange-600 font-bold text-[10px] sm:text-xs tracking-widest uppercase bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
              संपूर्ण श्रीमद् भगवद्गीता
            </span>
            <h1 className="text-3xl sm:text-4xl font-black font-hindi text-gray-900 mt-3">
              परमार्थ का मार्ग
            </h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">बिना किसी रुकावट के, अपनी भाषा में पढ़ें।</p>
          </div>

          <div className="w-full md:w-[400px] relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
              <FaSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="श्लोक खोजें (जैसे: कर्म, योग)..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-medium transition-all"
            />
          </div>
        </div>

        {/* ==========================================
            2. SWEET & COMPACT "VERSE OF THE DAY"
            ========================================== */}
        {dailyVerse && (
          <div className="bg-gradient-to-r from-orange-50 to-[#FFF6EA] border border-orange-200 rounded-[2rem] p-5 sm:p-6 shadow-sm relative overflow-hidden flex flex-col md:flex-row items-center gap-6 group">
            <FaOm className="absolute -left-6 -bottom-6 text-orange-500/5 rotate-12" size={150} />
            
            <div className="relative z-10 flex-1 w-full text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-3">
                <span className="bg-orange-500 text-white text-[10px] sm:text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                  आज का श्लोक
                </span>
                <span className="text-xs font-bold text-orange-800/70 bg-white px-3 py-1 rounded-full border border-orange-100">
                  अध्याय {dailyVerse.chapter_number} • श्लोक {dailyVerse.verse_number}
                </span>
              </div>
              
              <p className="font-hindi font-black text-lg sm:text-xl text-gray-900 whitespace-pre-line leading-relaxed mb-3">
                {getDisplayVerse(dailyVerse.sanskrit)}
              </p>
              
              <p className="text-gray-600 font-hindi text-sm sm:text-base border-l-2 border-orange-400 pl-3">
                {dailyVerse.meaning}
              </p>
            </div>

            <div className="relative z-10 flex flex-row md:flex-col items-center gap-3 w-full md:w-auto">
              {/* Script Selector */}
              <div className="flex items-center bg-white border border-orange-200 rounded-xl px-3 py-2 shadow-sm w-full md:w-auto justify-center">
                <FaLanguage className="text-orange-500 mr-2" size={16} />
                <select 
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="bg-transparent text-gray-700 font-bold text-xs focus:outline-none cursor-pointer"
                >
                  {supportedScripts.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                </select>
              </div>
              
              <button
                onClick={handleWhatsAppShare}
                className="w-full bg-[#25D366] hover:bg-[#1EBE5D] text-white px-5 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
              >
                <FaWhatsapp size={16} /> शेयर करें
              </button>
            </div>
          </div>
        )}

        {/* ==========================================
            3. ALL 18 CHAPTERS GRID
            ========================================== */}
        <div className="space-y-6 pt-4">
          <div className="flex items-center gap-3 border-b border-gray-200 pb-3">
            <h2 className="text-2xl font-black font-hindi text-gray-900">अध्याय सूची</h2>
            <span className="bg-orange-100 text-orange-800 text-[10px] font-black px-2 py-1 rounded-md">18 Chapters</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {chapters.map((ch) => (
              <Link
                key={ch.chapter_number}
                href={`/bhagavad-gita/chapter/${ch.chapter_number}`}
                className="bg-white p-5 rounded-[1.5rem] border border-orange-100/60 hover:border-orange-400 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
                
                <div className="flex justify-between items-start z-10 mb-4">
                  <div className="w-12 h-12 rounded-full bg-orange-50 text-orange-600 font-black flex items-center justify-center text-lg border border-orange-100 group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {ch.chapter_number}
                  </div>
                  <div className="text-gray-300 group-hover:text-orange-500 transition-colors bg-gray-50 group-hover:bg-orange-50 p-2.5 rounded-full">
                    <FaArrowRight size={12} />
                  </div>
                </div>

                <div className="z-10">
                  <h3 className="font-black text-gray-900 font-hindi text-xl mb-1 group-hover:text-orange-700 transition-colors">
                    {ch.name_sanskrit}
                  </h3>
                  <div className="flex items-center justify-between w-full mt-2">
                    <p className="text-xs text-gray-500 font-bold bg-gray-50 px-2.5 py-1.5 rounded-lg border border-gray-100">
                      {ch.name_translation}
                    </p>
                    <p className="text-[11px] text-orange-600 font-black flex items-center gap-1 bg-orange-50 px-2 py-1.5 rounded-lg">
                      <FaBookOpen /> {ch.verses_count} श्लोक
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}