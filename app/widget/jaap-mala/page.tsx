"use client";

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaPrayingHands, FaRedo } from 'react-icons/fa';

function JaapMalaContent() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme') || 'light';
  const isDark = theme === 'dark';
  
  const [count, setCount] = useState(0);
  const target = 108;
  const isComplete = count >= target;

  const handleChant = () => {
    if (count < target) setCount(prev => prev + 1);
  };

  const productionUrl = "https://www.hindibhajanmanjari.com";

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-6 font-sans transition-colors duration-300 text-center select-none ${isDark ? 'bg-gray-900' : 'bg-orange-50'}`}>
      
      <h2 className={`text-lg font-black tracking-widest uppercase mb-6 ${isDark ? 'text-gray-300' : 'text-gray-800'}`}>
        Digital Jaap Mala
      </h2>

      {/* The Interactive Bead */}
      <div className="relative mb-6">
        {/* Progress Ring */}
        <svg className="absolute -inset-4 w-32 h-32 -rotate-90">
          <circle cx="64" cy="64" r="60" className={`${isDark ? 'stroke-gray-800' : 'stroke-orange-200'}`} strokeWidth="8" fill="none" />
          <circle 
            cx="64" cy="64" r="60" 
            className="stroke-orange-500 transition-all duration-300 ease-out" 
            strokeWidth="8" fill="none" 
            strokeDasharray="377" 
            strokeDashoffset={377 - (377 * count) / target} 
            strokeLinecap="round" 
          />
        </svg>

        <button 
          onClick={handleChant}
          disabled={isComplete}
          className={`relative z-10 w-24 h-24 rounded-full flex flex-col items-center justify-center shadow-xl transition-transform active:scale-95 disabled:active:scale-100 ${
            isComplete 
              ? 'bg-green-500 text-white shadow-green-500/40' 
              : isDark 
                ? 'bg-gray-800 text-orange-400 border border-gray-700 shadow-orange-900/20 hover:bg-gray-700' 
                : 'bg-white text-orange-600 border border-orange-100 hover:bg-orange-50'
          }`}
        >
          {isComplete ? (
            <span className="text-2xl font-black">ॐ</span>
          ) : (
            <>
              <span className="text-3xl font-black leading-none">{count}</span>
              <span className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-1">/ 108</span>
            </>
          )}
        </button>
      </div>

      {isComplete ? (
        <div className="animate-fade-in-up">
          <p className={`text-sm font-bold mb-4 ${isDark ? 'text-green-400' : 'text-green-600'}`}>Jaap Complete! 🙏</p>
          <a 
            href={productionUrl} target="_blank" rel="noopener noreferrer"
            className="px-6 py-2.5 rounded-full bg-orange-600 text-white font-bold text-xs hover:bg-orange-700 transition-colors shadow-md"
          >
            Read a Bhajan
          </a>
        </div>
      ) : (
        <p className={`text-xs font-medium mb-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Tap the bead to count your chant
        </p>
      )}

      {/* Reset Button */}
      <button 
        onClick={() => setCount(0)}
        className={`mt-2 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-md transition-colors ${isDark ? 'text-gray-500 hover:bg-gray-800 hover:text-gray-300' : 'text-gray-400 hover:bg-orange-100 hover:text-orange-600'}`}
      >
        <FaRedo size={10} /> Reset
      </button>

    </div>
  );
}

export default function JaapMalaWidget() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent"></div>}>
      <JaapMalaContent />
    </Suspense>
  );
}