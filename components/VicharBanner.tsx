"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaPenNib, FaArrowRight } from 'react-icons/fa';
// 🌟 FIX: Changed GiPeacockFeather to GiFeather (which exists in the library)
import { GiFeather, GiLotusFlower } from 'react-icons/gi';

interface Vichar {
  slug: string;
  title_hindi: string;
  quote_text: string;
}

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
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 my-12">
      <div className="relative overflow-hidden bg-white rounded-[2.5rem] border border-orange-100 shadow-[0_15px_50px_-15px_rgba(234,88,12,0.1)] group">
        
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white pointer-events-none" />
        <GiLotusFlower className="absolute -top-10 -left-10 text-[180px] text-orange-500/5 rotate-[-20deg] pointer-events-none" />
        
        {/* 🌟 FIX: Used GiFeather here */}
        <GiFeather className="absolute -bottom-10 -right-4 text-[150px] text-orange-500/5 rotate-[20deg] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center p-8 md:p-12 text-center min-h-[300px]">
          
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 text-orange-600 border border-orange-200/50 mb-6 shadow-sm">
            <FaPenNib size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">आज का विचार</span>
          </div>

          <div className="flex-1 flex flex-col justify-center w-full max-w-2xl">
            <h3 
              className={`text-2xl md:text-3xl lg:text-4xl font-black text-gray-800 font-hindi leading-[1.6] md:leading-[1.8] whitespace-pre-line transition-all duration-700 transform ${
                isFading ? 'opacity-0 scale-95 blur-sm' : 'opacity-100 scale-100 blur-0'
              }`}
            >
              {currentVichar.quote_text}
            </h3>
            
            <p className={`mt-4 text-orange-500 font-bold text-sm tracking-wide transition-all duration-700 delay-100 ${
                isFading ? 'opacity-0' : 'opacity-100'
              }`}>
              — {currentVichar.title_hindi} —
            </p>
          </div>

          <div className={`mt-8 transition-all duration-700 delay-200 ${isFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <Link 
              href={`/mere-vichar/${currentVichar.slug}`}
              className="inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gray-900 text-white font-bold text-sm hover:bg-orange-600 hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              संपूर्ण भावार्थ पढ़ें <FaArrowRight size={14} />
            </Link>
          </div>
          
        </div>
        
        {vichars.length > 1 && (
          <>
            <div className="absolute bottom-0 left-0 h-1 bg-gray-100 w-full">
              <div 
                className="h-full bg-orange-500"
                style={{ 
                  animation: 'vicharProgress 8s infinite linear' 
                }}
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