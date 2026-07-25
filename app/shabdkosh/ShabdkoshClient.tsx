"use client";

import { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaVolumeUp, FaBookOpen, FaArrowUp } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import Link from 'next/link';

interface DictionaryWord {
  id: number;
  word_hi: string;
  word_en: string;
  meaning_hi: string;
  meaning_en?: string;
  slug?: string;
}

export default function ShabdkoshClient({ initialWords }: { initialWords: DictionaryWord[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);

  // 🌟 1. SCROLL TO TOP LOGIC
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 400) {
        setShowScrollButton(true);
      } else {
        setShowScrollButton(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🌟 2. SMART FILTERING
  const filteredWords = useMemo(() => {
    if (!searchTerm) return initialWords;
    const lowerSearch = searchTerm.toLowerCase();
    return initialWords.filter(word => 
      word.word_hi.includes(lowerSearch) || 
      word.word_en.toLowerCase().includes(lowerSearch) ||
      word.meaning_hi.includes(lowerSearch)
    );
  }, [searchTerm, initialWords]);

  // 🌟 3. ALPHABETICAL GROUPING (A-Z)
  const groupedWords = useMemo(() => {
    const groups: Record<string, DictionaryWord[]> = {};
    filteredWords.forEach(word => {
      const firstLetter = word.word_en.charAt(0).toUpperCase();
      const letter = /^[A-Z]$/.test(firstLetter) ? firstLetter : '#';
      
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(word);
    });

    return Object.keys(groups).sort().reduce((acc, key) => {
      acc[key] = groups[key];
      return acc;
    }, {} as Record<string, DictionaryWord[]>);
  }, [filteredWords]);

  const alphabets = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const scrollToLetter = (letter: string) => {
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      const yOffset = -120; 
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-8 md:py-12 bg-white min-h-screen rounded-t-[3rem] shadow-2xl -mt-16 border-t border-gray-100">
      
      {/* --- STICKY SEARCH & INDEX --- */}
      <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl pt-4 pb-6 border-b border-gray-100">
        <div className="relative max-w-3xl mx-auto">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <FaSearch className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="खोजें (e.g., Moksha, सनातन)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 bg-gray-50/50 border border-gray-200 rounded-2xl text-gray-900 font-medium text-lg focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white transition-all shadow-inner"
          />
        </div>

        {!searchTerm && (
          <div className="max-w-4xl mx-auto mt-6 flex flex-wrap justify-center gap-1.5 md:gap-2">
            {alphabets.map(letter => {
              const hasWords = !!groupedWords[letter];
              return (
                <button
                  key={letter}
                  onClick={() => scrollToLetter(letter)}
                  disabled={!hasWords}
                  className={`w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-lg text-sm font-bold transition-all
                    ${hasWords 
                      ? 'bg-orange-50 text-orange-700 hover:bg-orange-500 hover:text-white cursor-pointer shadow-sm border border-orange-100' 
                      : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                    }`}
                >
                  {letter}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* --- DICTIONARY LIST --- */}
      <div className="max-w-4xl mx-auto mt-8">
        {Object.keys(groupedWords).length > 0 ? (
          Object.entries(groupedWords).map(([letter, words]) => (
            <div key={letter} id={`letter-${letter}`} className="mb-12 scroll-mt-32">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center text-2xl font-black font-serif shadow-md">
                  {letter}
                </div>
                <div className="h-px bg-gray-200 flex-1"></div>
              </div>

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
                      <div className="flex items-center gap-2 text-gray-500 mb-1">
                        <span className="text-sm font-bold uppercase tracking-widest">{word.word_en}</span>
                        <FaVolumeUp className="text-gray-300 text-xs" />
                      </div>
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
            </div>
          ))
        ) : (
          <div className="text-center py-20">
            <h3 className="text-2xl font-black text-gray-900">शब्द नहीं मिला</h3>
          </div>
        )}
      </div>

      {/* 🌟 SMART FLOATING BACK TO TOP BUTTON */}
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