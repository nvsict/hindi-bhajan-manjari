"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { 
  FaArrowLeft, FaPlayCircle, FaPauseCircle, FaBookOpen, 
  FaThLarge, FaListUl, FaLanguage, FaOm, FaSpinner 
} from 'react-icons/fa';

// 🌟 ग्लोबल इन-मेमोरी कैश (ताकि बार-बार लोड न हो)
const chapterCache: Record<string, any> = {};

export default function PremiumChapterPage() {
  const params = useParams();
  const router = useRouter();
  const chapterNum = Number(params.chapter_number) || 1;

  // 🌟 UI States
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [summaryLang, setSummaryLang] = useState<'hi' | 'en'>('hi');
  const [isPlaying, setIsPlaying] = useState(false); // For Audio UI
  
  // 🌟 Data States
  const [chapterData, setChapterData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 🌟 डेटाबेस (Supabase) से अध्याय फेच करना
  useEffect(() => {
    let isMounted = true;

    const fetchChapter = async () => {
      setIsLoading(true);
      setError(null);

      // 1. कैश चेक करें
      if (chapterCache[chapterNum]) {
        if (isMounted) {
          setChapterData(chapterCache[chapterNum]);
          setIsLoading(false);
        }
        return;
      }

      try {
        if (!supabase) throw new Error("Supabase कनेक्शन सेट नहीं है!");

        // 2. gita_chapters टेबल से डेटा लाएं
        const { data, error } = await supabase
          .from('gita_chapters')
          .select('*')
          .eq('chapter_number', chapterNum)
          .single();

        if (error || !data) {
          throw new Error("अध्याय का डेटा नहीं मिला।");
        }

        // कैश में सेव करें
        chapterCache[chapterNum] = data;

        if (isMounted) {
          setChapterData(data);
        }
      } catch (err: any) {
        console.error(err);
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchChapter();

    return () => { isMounted = false; };
  }, [chapterNum]);

  // लोडिंग स्टेट
  if (isLoading && !chapterData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] space-y-4">
        <FaSpinner className="animate-spin text-orange-500 text-4xl" />
        <p className="text-orange-800 font-bold font-hindi animate-pulse">अध्याय लोड हो रहा है...</p>
      </div>
    );
  }

  // एरर स्टेट
  if (error && !chapterData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] p-4 text-center space-y-4">
        <div className="w-20 h-20 bg-red-100 text-red-500 rounded-full flex items-center justify-center mb-4">
          <FaBookOpen size={30} />
        </div>
        <h2 className="text-2xl font-black text-gray-800">अध्याय नहीं मिला</h2>
        <p className="text-gray-500">{error}</p>
        <button onClick={() => router.push('/bhagavad-gita')} className="bg-orange-500 text-white px-6 py-2 rounded-xl font-bold mt-4">
          वापस गीता होम पर जाएं
        </button>
      </div>
    );
  }

  // श्लोकों की लिस्ट (Array of numbers from 1 to verses_count)
  const versesList = Array.from({ length: chapterData?.verses_count || 0 }, (_, i) => i + 1);

  return (
    <main className="min-h-screen bg-[#FDFBF7] text-gray-900 py-6 px-3 sm:px-6 lg:px-8 font-sans selection:bg-orange-200">
      <div className="max-w-5xl mx-auto space-y-6 sm:space-y-8">
        
        {/* ==========================================
            1. PREMIUM TOP NAVIGATION
            ========================================== */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white/80 backdrop-blur-md border border-orange-100 p-4 rounded-[2rem] shadow-sm sticky top-2 sm:top-4 z-50">
          <Link href="/bhagavad-gita" className="w-12 h-12 flex flex-shrink-0 items-center justify-center bg-orange-50 border border-orange-100 rounded-full hover:bg-orange-600 hover:text-white text-orange-600 transition-all shadow-sm">
            <FaArrowLeft size={16} />
          </Link>
          
          <div className="flex-1">
            <span className="text-[10px] sm:text-xs text-orange-500 font-bold uppercase tracking-widest">
              अध्याय {chapterData.chapter_number}
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-hindi text-gray-900 mt-0.5">
              {chapterData.name_sanskrit} 
              <span className="text-gray-400 text-lg lg:text-2xl ml-2 font-normal">({chapterData.name_translation})</span>
            </h1>
          </div>
        </div>

        {/* ==========================================
            2. HERO SECTION & AUDIO HUB (Spotify Style)
            ========================================== */}
        <div className="relative bg-gradient-to-br from-white to-[#FFF6EA] border border-orange-200/60 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 shadow-lg shadow-orange-900/5 overflow-hidden w-full flex flex-col lg:flex-row items-center gap-8">
          
          <div className="absolute -right-10 -bottom-10 text-orange-500/5 pointer-events-none select-none">
            <FaOm size={250} />
          </div>

          <div className="relative z-10 flex-1 space-y-4 text-center lg:text-left">
            <h2 className="text-2xl sm:text-3xl font-black text-orange-900 font-hindi">
              {summaryLang === 'hi' ? chapterData.meaning_hi : chapterData.meaning_en}
            </h2>
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
              <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-xs font-bold border border-orange-200">
                कुल श्लोक: {chapterData.verses_count}
              </span>
              <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                {chapterData.name_transliteration}
              </span>
            </div>
          </div>

          {/* Audio Player Hub */}
          <div className="relative z-10 w-full lg:w-[350px] bg-white/60 backdrop-blur-md border border-orange-100 rounded-3xl p-5 shadow-sm">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-3 text-center">संपूर्ण अध्याय सुनें</p>
            <div className="flex items-center justify-center gap-6">
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:scale-105 transition-transform"
              >
                {isPlaying ? <FaPauseCircle size={28} /> : <FaPlayCircle size={28} className="ml-1" />}
              </button>
            </div>
            {/* Fake Audio Timeline */}
            <div className="mt-4 flex items-center gap-2 text-[10px] font-bold text-gray-400">
              <span>0:00</span>
              <div className="h-1.5 flex-1 bg-orange-100 rounded-full overflow-hidden relative">
                <div className={`absolute top-0 left-0 h-full bg-orange-500 rounded-full transition-all duration-1000 ${isPlaying ? 'w-1/3' : 'w-0'}`}></div>
              </div>
              <span>24:15</span>
            </div>
          </div>
        </div>

        {/* ==========================================
            3. BILINGUAL SUMMARY SECTION
            ========================================== */}
        <div className="bg-white border border-orange-100 rounded-[2rem] p-6 sm:p-8 shadow-sm relative overflow-hidden group hover:border-orange-200 transition-colors">
          
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6 border-b border-orange-50 pb-4">
            <h3 className="text-lg font-black text-orange-900 uppercase tracking-wider flex items-center gap-2">
              <FaBookOpen className="text-orange-500" /> 
              {summaryLang === 'hi' ? 'अध्याय का सार' : 'Chapter Summary'}
            </h3>
            
            {/* Language Toggle */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
              <button 
                onClick={() => setSummaryLang('hi')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${summaryLang === 'hi' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                हिंदी
              </button>
              <button 
                onClick={() => setSummaryLang('en')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${summaryLang === 'en' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                English
              </button>
            </div>
          </div>

          <p className={`text-gray-700 leading-relaxed sm:leading-loose ${summaryLang === 'hi' ? 'font-hindi text-lg sm:text-xl' : 'text-base sm:text-lg'}`}>
            {summaryLang === 'hi' ? (chapterData.summary_hi || "सार उपलब्ध नहीं है।") : (chapterData.summary_en || "Summary not available.")}
          </p>
        </div>

        {/* ==========================================
            4. VERSES LIST (Grid vs List View)
            ========================================== */}
        <div className="pt-4">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-black text-gray-900 font-hindi flex items-center gap-2">
              <span className="w-6 h-1 bg-orange-500 rounded-full"></span>
              सभी श्लोक ({chapterData.verses_count})
            </h3>
            
            {/* View Mode Toggle */}
            <div className="flex items-center bg-white border border-gray-200 rounded-xl p-1 shadow-sm w-fit">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'grid' ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-gray-800'}`}
              >
                <FaThLarge /> ग्रिड
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'list' ? 'bg-orange-50 text-orange-600' : 'text-gray-400 hover:text-gray-800'}`}
              >
                <FaListUl /> लिस्ट
              </button>
            </div>
          </div>

          {/* 🌟 VIEW RENDERER */}
          {viewMode === 'grid' ? (
            // GRID VIEW
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-8 gap-3 sm:gap-4">
              {versesList.map((verseNum) => (
                <Link 
                  key={verseNum}
                  href={`/bhagavad-gita/chapter/${chapterNum}/verse/${verseNum}`}
                  className="bg-white border border-orange-100/50 p-4 rounded-2xl flex flex-col items-center justify-center hover:border-orange-400 hover:shadow-md hover:-translate-y-1 hover:bg-orange-50 transition-all group"
                >
                  <span className="text-orange-300 text-[10px] font-bold uppercase tracking-widest mb-1 group-hover:text-orange-500">श्लोक</span>
                  <span className="text-2xl font-black text-gray-700 group-hover:text-orange-700 transition-colors">
                    {verseNum}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            // LIST VIEW
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {versesList.map((verseNum) => (
                <Link 
                  key={verseNum}
                  href={`/bhagavad-gita/chapter/${chapterNum}/verse/${verseNum}`}
                  className="bg-white border border-gray-100 p-4 rounded-2xl flex justify-between items-center hover:border-orange-300 hover:shadow-md hover:bg-orange-50/50 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center font-black group-hover:bg-orange-600 group-hover:text-white transition-colors">
                      {verseNum}
                    </div>
                    <span className="font-bold text-gray-700 group-hover:text-orange-700 font-hindi">
                      श्लोक पढ़ें
                    </span>
                  </div>
                  <FaPlayCircle className="text-gray-200 group-hover:text-orange-500 transition-colors" size={20} />
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  );
}