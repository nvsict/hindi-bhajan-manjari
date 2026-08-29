"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPenNib, FaArrowRight } from 'react-icons/fa';
import { GiFeather, GiLotusFlower } from 'react-icons/gi';

interface Vichar {
  slug: string;
  title_hindi: string;
  quote_text: string;
}

// 🌟 FIX 1: Smart JS Truncator
// यह ओरिजिनल फॉर्मेटिंग (Line breaks) को बिना खराब किए टेक्स्ट को काटता है।
const getSnippet = (text: string) => {
  if (!text) return "";
  
  let snippet = text;
  const MAX_CHARS = 160;
  const MAX_LINES = 3;

  // 1. अगर 3 लाइन से ज्यादा है, तो वहीं काट दें
  const lines = snippet.split('\n');
  if (lines.length > MAX_LINES) {
    snippet = lines.slice(0, MAX_LINES).join('\n') + '...';
  }

  // 2. अगर अक्षर बहुत ज्यादा हैं, तो स्पेस (Space) देखकर काटें ताकि शब्द न टूटें
  if (snippet.length > MAX_CHARS) {
    const cut = snippet.substring(0, MAX_CHARS);
    const lastSpace = cut.lastIndexOf(' ');
    snippet = cut.substring(0, lastSpace > 0 ? lastSpace : MAX_CHARS) + '...';
  }

  return snippet;
};

export default function VicharBanner({ vichars }: { vichars: Vichar[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  if (!vichars || vichars.length === 0) return null;

  useEffect(() => {
    if (vichars.length <= 1) return;

    const timer = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % vichars.length);
        setIsFading(false);
      }, 600); 
    }, 8000); 

    return () => clearInterval(timer);
  }, [vichars.length]);

  const currentVichar = vichars[currentIndex];

  return (
    // 🌟 FIX 2: Removed extra max-w, px, and mx-auto. 
    // Now it seamlessly fills the main content column and aligns with other components!
    <div className="w-full mb-8 md:mb-12">
      <div className="relative overflow-hidden bg-white dark:bg-[#0c0804] rounded-[2rem] md:rounded-[2.5rem] border border-orange-100 dark:border-[#2a1d12] shadow-sm hover:shadow-md dark:shadow-none group transition-all duration-300">
        
        {/* Backgrounds & Icons */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-950/20 dark:to-transparent pointer-events-none" />
        <GiLotusFlower className="absolute -top-10 -left-10 text-[160px] md:text-[180px] text-orange-500/5 dark:text-orange-500/10 rotate-[-20deg] pointer-events-none" />
        <GiFeather className="absolute -bottom-10 -right-4 text-[130px] md:text-[150px] text-orange-500/5 dark:text-orange-500/10 rotate-[20deg] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 text-center min-h-[300px] md:min-h-[320px]">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50 mb-6 shadow-sm">
            <FaPenNib size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">मेरी कलम से</span>
          </div>

          {/* 🌟 FIX 3: CSS Grid Overlap (0 CLS) */}
          <div className="grid w-full max-w-3xl mx-auto items-center">
            {vichars.map((vichar, index) => {
              const isActive = index === currentIndex && !isFading;
              const snippet = getSnippet(vichar.quote_text);
              
              return (
                <div 
                  key={vichar.slug}
                  className={`col-start-1 row-start-1 flex flex-col items-center justify-center transition-all duration-700 transform ${
                    isActive 
                      ? 'opacity-100 scale-100 blur-0 z-10 pointer-events-auto' 
                      : 'opacity-0 scale-95 blur-sm z-0 pointer-events-none'
                  }`}
                  aria-hidden={!isActive}
                >
                  <h3 className="text-2xl md:text-3xl lg:text-4xl font-black text-gray-800 dark:text-gray-100 font-hindi leading-[1.6] md:leading-[1.8] whitespace-pre-line text-center w-full">
                    {snippet}
                  </h3>
                  
                  <p className="mt-4 text-orange-500 font-bold text-sm tracking-wide">
                    — {vichar.title_hindi} —
                  </p>
                </div>
              );
            })}
          </div>

          {/* Read More Button */}
          <div className={`mt-8 transition-all duration-700 delay-200 ${isFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <Link 
              href={`/mere-vichar/${currentVichar.slug}`}
              className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs md:text-sm hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              संपूर्ण भावार्थ पढ़ें <FaArrowRight size={12} className="md:w-3.5 md:h-3.5" />
            </Link>
          </div>
          
        </div>
        
        {/* Progress Bar Loader */}
        {vichars.length > 1 && (
          <>
            <div className="absolute bottom-0 left-0 h-1 bg-gray-100 dark:bg-gray-800/50 w-full">
              <div 
                className="h-full bg-orange-500"
                style={{ animation: 'vicharProgress 8s infinite linear' }}
              />
            </div>
            <style>{`
              @keyframes vicharProgress {
                0% { width: 0%; }
                100% { width: 100%; }
              }
            `}</style>
          </>
        )}
      </div>
    </div>
  );
}