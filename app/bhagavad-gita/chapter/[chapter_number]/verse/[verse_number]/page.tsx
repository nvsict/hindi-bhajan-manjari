"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase'; 
import Sanscript from '@indic-transliteration/sanscript';
import { 
  FaArrowLeft, FaArrowRight, FaWhatsapp, FaFont, 
  FaLanguage, FaPlay, FaOm, FaBookOpen, FaSpinner 
} from 'react-icons/fa';

// 🌟 ग्लोबल इन-मेमोरी कैश (ताकि जो श्लोक एक बार फेच हो जाए, वो दोबारा नेटवर्क कॉल न करे)
const verseCache: Record<string, any> = {};

export default function PremiumVersePage() {
  const params = useParams();
  
  const chapterNum = Number(params.chapter_number) || 1;
  const verseNum = Number(params.verse_number) || 1;

  // 🌟 UI States
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [script, setScript] = useState<string>('devanagari');
  
  // Data States
  const [verseData, setVerseData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🌟 10 लिपियों की लिस्ट
  const supportedScripts = [
    { id: 'devanagari', label: 'देवनागरी (संस्कृत/हिंदी)' },
    { id: 'hk', label: 'English (Roman)' },
    { id: 'gujarati', label: 'ગુજરાતી (Gujarati)' },
    { id: 'bengali', label: 'বাংলা (Bengali)' },
    { id: 'telugu', label: 'తెలుగు (Telugu)' },
    { id: 'kannada', label: 'ಕನ್ನಡ (Kannada)' },
    { id: 'malayalam', label: 'മലയാളം (Malayalam)' },
    { id: 'oriya', label: 'ଓଡ଼ିଆ (Odia)' },
    { id: 'gurmukhi', label: 'ਗੁਰਮੁਖੀ (Gurmukhi)' },
    { id: 'tamil', label: 'தமிழ் (Tamil)' },
  ];

  const getVerseFontClass = () => {
    if (fontSize === 'large') return 'text-2xl sm:text-3xl lg:text-4xl leading-relaxed';
    if (fontSize === 'xlarge') return 'text-3xl sm:text-4xl lg:text-5xl leading-loose';
    return 'text-xl sm:text-2xl lg:text-3xl leading-relaxed';
  };

  const toggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  // 🌟 कोर फेच फंक्शन (Caching & Smart Fallback के साथ)
  const fetchVerseFromDB = async (c: number, v: number) => {
    const targetVerseId = `BG${c}.${v}`;
    
    if (verseCache[targetVerseId]) {
      return verseCache[targetVerseId];
    }

    try {
      const { data: verseRow, error: verseError } = await supabase
        .from('gita_verses')
        .select('*')
        .eq('id', targetVerseId)
        .single();

      if (verseError || !verseRow) return null;

      const { data: commentsRow } = await supabase
        .from('gita_commentaries')
        .select('*')
        .eq('verse_id', targetVerseId);

      // 🌟 SMART BILINGUAL FALLBACK LOGIC
      let primaryMeaning = "अर्थ उपलब्ध नहीं है।";
      if (commentsRow && commentsRow.length > 0) {
        // प्राथमिकता 1: हिंदी अर्थ ढूँढें
        const hiComm = commentsRow.find(c => ['hi', 'Hindi', 'hindi'].includes(c.language));
        // प्राथमिकता 2: इंग्लिश अर्थ ढूँढें
        const enComm = commentsRow.find(c => ['en', 'English', 'english'].includes(c.language));

        if (hiComm) {
          primaryMeaning = hiComm.content_text;
        } else if (enComm) {
          primaryMeaning = enComm.content_text;
        }
      }

      const finalData = {
        chapter: c,
        verse: v,
        devanagari: verseRow.sanskrit,
        roman: verseRow.transliteration,
        primaryMeaning: primaryMeaning, // मेन कार्ड में दिखाने के लिए
        translations: commentsRow || []   // नीचे लिस्ट में दिखाने के लिए
      };

      verseCache[targetVerseId] = finalData;
      return finalData;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      const data = await fetchVerseFromDB(chapterNum, verseNum);
      
      if (isMounted) {
        if (data) {
          setVerseData(data);
        } else {
          setError("यह श्लोक डेटाबेस में मौजूद नहीं है या अध्याय समाप्त हो गया है।");
        }
        setIsLoading(false);
      }

      // Background Pre-fetching
      fetchVerseFromDB(chapterNum, verseNum + 1);
      if (verseNum > 1) {
        fetchVerseFromDB(chapterNum, verseNum - 1);
      }
    };

    loadData();

    return () => { isMounted = false; };
  }, [chapterNum, verseNum]);

  const getDisplayVerse = () => {
    if (!verseData) return "";
    if (script === 'hk') return verseData.roman;
    if (script === 'devanagari') return verseData.devanagari;
    try {
      return Sanscript.t(verseData.devanagari, 'devanagari', script);
    } catch (e) {
      console.error("Transliteration Error", e);
      return verseData.devanagari;
    }
  };

  const handleWhatsAppShare = () => {
    if (!verseData) return;
    const currentVerseText = getDisplayVerse();
    const text = `✨ *श्रीमद् भगवद्गीता* ✨\n\n📖 *अध्याय ${verseData.chapter}, श्लोक ${verseData.verse}*\n\n🕉️ *श्लोक:*\n${currentVerseText}\n\n🇮🇳 *अर्थ:*\n${verseData.primaryMeaning}\n\n👉 *पढ़ने के लिए क्लिक करें:* ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoading && !verseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] space-y-4">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
        <p className="text-orange-800 font-bold font-hindi animate-pulse">पवित्र श्लोक लोड हो रहा है...</p>
      </div>
    );
  }

  if (error && !verseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-4 text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <FaBookOpen size={30} />
        </div>
        <h2 className="text-2xl font-black text-gray-800">श्लोक नहीं मिला</h2>
        <p className="text-gray-500">{error}</p>
        <Link href="/bhagavad-gita" className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold mt-4">
          वापस गीता होम पर जाएं
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 py-4 sm:py-6 px-3 sm:px-6 lg:px-8 font-sans selection:bg-orange-200 overflow-x-hidden">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* ==========================================
            1. TOP NAVIGATION
            ========================================== */}
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md border border-orange-100 p-3 sm:p-4 rounded-2xl sm:rounded-3xl shadow-sm sticky top-2 sm:top-4 z-50">
          {verseNum > 1 ? (
            <Link 
              href={`/bhagavad-gita/chapter/${chapterNum}/verse/${verseNum - 1}`}
              className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
            >
              <FaArrowLeft /> <span className="hidden sm:inline">पिछला</span>
            </Link>
          ) : (
            <div className="px-3 py-2 opacity-0 cursor-default"><FaArrowLeft /></div>
          )}
          
          <div className="text-center flex flex-col items-center">
            <span className="text-[9px] sm:text-[10px] text-orange-500 font-bold uppercase tracking-widest mb-0.5">
              श्रीमद् भगवद्गीता
            </span>
            <span className="bg-orange-100 text-orange-900 px-3 sm:px-5 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-black border border-orange-200">
              अध्याय {chapterNum} • श्लोक {verseNum}
            </span>
          </div>

          <Link 
            href={`/bhagavad-gita/chapter/${chapterNum}/verse/${verseNum + 1}`}
            className="flex items-center gap-1 sm:gap-2 px-3 py-2 text-xs sm:text-sm font-bold text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all"
          >
            <span className="hidden sm:inline">अगला</span> <FaArrowRight />
          </Link>
        </div>

        {/* ==========================================
            2. THE SACRED VERSE DISPLAY
            ========================================== */}
        <div className="relative bg-white border border-orange-200/60 rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-10 shadow-lg shadow-orange-900/5 overflow-hidden w-full">
          
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-200 via-orange-400 to-orange-200"></div>
          <div className="absolute -left-10 -bottom-10 text-orange-500/5 pointer-events-none select-none transform -rotate-12">
            <FaBookOpen size={200} />
          </div>

          {/* Controls */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 mb-8 pb-4 border-b border-orange-50">
            <div className="flex items-center bg-orange-50 border border-orange-100 rounded-xl px-3 py-1.5 w-full sm:w-auto justify-center">
              <FaLanguage className="text-orange-500 mr-2" size={16} />
              <select 
                value={script}
                onChange={(e) => setScript(e.target.value)}
                className="bg-transparent text-orange-900 font-bold text-xs sm:text-sm focus:outline-none cursor-pointer w-full sm:w-40 text-center sm:text-left"
              >
                {supportedScripts.map(s => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
            </div>
            
            <button 
              onClick={toggleFontSize} 
              className="flex items-center justify-center gap-2 bg-white hover:bg-orange-50 text-orange-900 font-bold px-4 py-2 rounded-xl border border-orange-100 shadow-sm w-full sm:w-auto text-xs sm:text-sm"
            >
              <FaFont className="text-orange-500" /> फॉन्ट: {fontSize.toUpperCase()}
            </button>
          </div>

          {/* 🌟 Dynamic Script Render */}
          <div className="relative z-10 text-center min-h-[120px] flex items-center justify-center mt-6 sm:mt-8 px-2 w-full">
            <FaOm className="absolute text-orange-500/5 top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-0" size={100} />
            <p className={`relative z-10 font-hindi font-black text-[#4A2B11] break-words whitespace-pre-wrap sm:whitespace-pre-line w-full transition-all duration-300 ${getVerseFontClass()}`}>
              {getDisplayVerse()}
            </p>
          </div>

          {/* 🌟 Primary Meaning Block (New) */}
          <div className="relative z-10 mt-8 mb-4 bg-orange-50/50 border border-orange-100 rounded-2xl p-4 sm:p-6 text-center">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-2">सरल अर्थ</p>
            <p className="text-gray-700 font-hindi text-base sm:text-lg leading-relaxed">
              {verseData.primaryMeaning}
            </p>
          </div>

          {/* Action Hub */}
          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <button className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md">
              <FaPlay size={12} /> श्लोक सुनें
            </button>
            <button 
              onClick={handleWhatsAppShare}
              className="w-full sm:w-auto bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-md"
            >
              <FaWhatsapp size={16} /> WhatsApp शेयर
            </button>
          </div>
        </div>

        {/* ==========================================
            3. COMMENTARIES & TRANSLATIONS
            ========================================== */}
        <div className="space-y-4 pt-4">
          <h3 className="text-lg sm:text-xl font-black text-orange-900 font-hindi flex items-center gap-2">
            <span className="w-6 h-1 bg-orange-500 rounded-full"></span>
            विभिन्न आचार्यों के अनुवाद
          </h3>
          
          {verseData.translations.length > 0 ? (
            verseData.translations.map((translation: any) => (
              <div key={translation.id} className="bg-white border border-orange-100 p-5 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
                <div className="absolute left-0 top-0 w-1 sm:w-1.5 h-full bg-orange-300"></div>
                
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 gap-2">
                  <span className="font-bold text-orange-900 text-sm flex items-center gap-2">
                    <FaBookOpen className="text-orange-400" size={12} /> {translation.author_name}
                  </span>
                  <span className="text-[10px] sm:text-xs font-black text-orange-600 uppercase tracking-widest bg-orange-50 px-2 sm:px-3 py-1 rounded-md border border-orange-100 w-fit">
                    {translation.language === 'hi' ? 'Hindi' : 'English'} • {translation.content_type}
                  </span>
                </div>
                
                <p className={`text-gray-700 break-words ${translation.language === 'hi' ? 'font-hindi' : ''} ${fontSize === 'xlarge' ? 'text-xl sm:text-2xl' : fontSize === 'large' ? 'text-lg sm:text-xl' : 'text-base sm:text-lg'} leading-relaxed`}>
                  {translation.content_text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 text-sm bg-white p-4 rounded-xl border border-gray-100 text-center">
              इस श्लोक के लिए विस्तृत अनुवाद उपलब्ध नहीं है।
            </p>
          )}
        </div>

      </div>
    </main>
  );
}