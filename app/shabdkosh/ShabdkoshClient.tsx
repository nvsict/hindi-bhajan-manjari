"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { FaSearch, FaVolumeUp, FaBookOpen, FaArrowUp } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';

interface DictionaryWord {
  id: string | number;
  word_hi: string;
  word_en: string | null;
  meaning_hi: string;
  meaning_en?: string | null;
  slug?: string;
}

interface ShabdkoshClientProps {
  words: DictionaryWord[];
  currentLetter: string | null;
  currentSearch: string;
}

export default function ShabdkoshClient({ words, currentLetter, currentSearch }: ShabdkoshClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [inputValue, setInputValue] = useState(currentSearch);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isPending, setIsPending] = useState(false);

  // 🌟 FIX: Smart Debounce Search. Waits 500ms after user stops typing before fetching.
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (inputValue !== currentSearch) {
        setIsPending(true);
        if (inputValue.trim()) {
          router.push(`/shabdkosh?q=${encodeURIComponent(inputValue.trim())}`, { scroll: false });
        } else {
          const letterToRevert = searchParams.get('letter') || 'A';
          router.push(`/shabdkosh?letter=${letterToRevert}`, { scroll: false });
        }
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [inputValue, currentSearch, router, searchParams]);

  // Turn off loading state once props update
  useEffect(() => {
    setIsPending(false);
  }, [words]);

  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 400);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLetterClick = (letter: string) => {
    setIsPending(true);
    setInputValue(''); // Clear search when clicking a letter
    router.push(`/shabdkosh?letter=${letter}`, { scroll: false });
  };

  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 bg-white min-h-screen rounded-t-[3rem] shadow-2xl -mt-16 border-t border-gray-100">
      
      {/* --- STICKY SEARCH & INDEX --- */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl pt-4 pb-6 border-b border-gray-100">
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            {isPending ? (
              <div className="w-4 h-4 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
            ) : (
              <FaSearch className="text-gray-400" />
            )}
          </div>
          <input
            type="text"
            placeholder="खोजें (e.g., Moksha, सनातन)..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-medium text-lg focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {/* ALPHABET NAVIGATION - Only show if not searching */}
        {!inputValue && (
          <div className="max-w-4xl mx-auto mt-6 flex flex-wrap justify-center gap-1.5 md:gap-2">
            {alphabets.map(letter => {
              const isActive = currentLetter === letter;
              return (
                <button
                  key={letter}
                  onClick={() => handleLetterClick(letter)}
                  className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all border shadow-sm
                    ${isActive 
                      ? 'bg-orange-500 text-white border-orange-500 scale-110 shadow-md' 
                      : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'
                    }`}
                >
                  {letter}
                </button>
              );
            })}
            <button
              onClick={() => handleLetterClick('#')}
              className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all border shadow-sm
                ${currentLetter === '#' 
                  ? 'bg-orange-500 text-white border-orange-500 scale-110 shadow-md' 
                  : 'bg-gray-50 text-gray-500 border-gray-200 hover:bg-orange-50 hover:text-orange-700 hover:border-orange-200'
                }`}
            >
              #
            </button>
          </div>
        )}
      </div>

      {/* --- DICTIONARY LIST RESULTS --- */}
      <div className={`max-w-4xl mx-auto mt-8 transition-opacity duration-300 ${isPending ? 'opacity-40' : 'opacity-100'}`}>
        
        {/* Header to show what we are looking at */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-md">
            {currentLetter ? currentLetter : <FaSearch size={20}/>}
          </div>
          <div className="h-px bg-gray-200 flex-1"></div>
          {currentSearch && (
            <span className="text-gray-500 font-medium text-sm">
              "{currentSearch}" के लिए {words.length} परिणाम
            </span>
          )}
        </div>

        {words.length > 0 ? (
          <dl className="space-y-6 md:space-y-8">
            {words.map((word) => (
              <div 
                key={word.id} 
                className="group bg-white p-5 md:p-6 rounded-2xl border border-gray-100 hover:border-orange-200 hover:shadow-lg transition-all duration-300"
              >
                <dt className="flex flex-col sm:flex-row sm:items-end gap-2 sm:gap-4 mb-3">
                  <h2 className="text-2xl md:text-3xl font-black text-orange-600 font-hindi tracking-tight">
                    {word.word_hi}
                  </h2>
                  {word.word_en && (
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <span className="text-sm font-bold uppercase tracking-widest">{word.word_en}</span>
                      <FaVolumeUp className="text-gray-300 text-xs" />
                    </div>
                  )}
                </dt>

                <dd className="space-y-3">
                  <p className="text-gray-800 font-hindi text-[17px] leading-[1.8] font-medium">
                    <span className="text-orange-500 font-bold mr-2">अर्थ:</span>
                    {word.meaning_hi}
                  </p>
                  
                  {word.meaning_en && (
                    <p className="text-gray-600 text-[15px] leading-relaxed border-l-2 border-gray-200 pl-3 italic">
                      <span className="text-gray-400 font-bold mr-2 not-italic text-xs uppercase tracking-wider">Meaning:</span>
                      {word.meaning_en}
                    </p>
                  )}

                  {word.slug && (
                    <div className="mt-4 pt-4 border-t border-gray-50">
                      <Link 
                        href={`/shabdkosh/${word.slug}`}
                        className="inline-flex items-center gap-2 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors"
                      >
                        <FaBookOpen className="mb-0.5" /> विस्तृत जानकारी <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-black text-gray-900 mb-2">शब्द नहीं मिला</h3>
            <p className="text-gray-500">कृपया कुछ और खोज कर देखें।</p>
          </div>
        )}
      </div>

      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-6 md:right-10 z-[60] w-14 h-14 bg-orange-600 text-white rounded-full shadow-[0_8px_30px_rgba(234,88,12,0.4)] flex items-center justify-center transition-all duration-500 hover:bg-orange-700 hover:scale-110 active:scale-90 group ${
          showScrollButton ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20 pointer-events-none'
        }`}
        aria-label="Back to Top"
      >
        <FaArrowUp className="text-xl group-hover:-translate-y-1 transition-transform" />
      </button>

    </div>
  );
}