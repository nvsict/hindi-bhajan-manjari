"use client";

import { useState } from 'react';
import { FaWhatsapp, FaShareAlt, FaBookOpen, FaFont } from 'react-icons/fa';

interface VerseProps {
  verse: {
    id: string;
    chapter_number: number;
    verse_number: number;
    sanskrit: string;
    transliteration: string;
    hindi_translation?: string;
  };
}

export default function VerseOfTheDay({ verse }: VerseProps) {
  // 🌟 1. एल्डर-फ्रेंडली फॉन्ट साइज स्टेट (Normal, Large, Extra Large)
  const [fontSize, setFontSize] = useState<'text-lg' | 'text-2xl' | 'text-3xl'>('text-xl');

  // फॉन्ट बदलने का फंक्शन
  const toggleFontSize = () => {
    if (fontSize === 'text-lg') setFontSize('text-2xl');
    else if (fontSize === 'text-2xl') setFontSize('text-3xl');
    else setFontSize('text-lg');
  };

  // 🌟 2. WhatsApp शेयरिंग लॉजिक
  const handleWhatsAppShare = () => {
    const text = `✨ *आज का दिव्य श्लोक (श्रीमद् भगवद्गीता)* ✨\n\n` +
                 `📖 *अध्याय ${verse.chapter_number}, श्लोक ${verse.verse_number}*\n\n` +
                 `🕉️ *श्लोक:*\n${verse.sanskrit}\n\n` +
                 `🇮🇳 *अर्थ:*\n${verse.hindi_translation || 'धर्मक्षेत्रे कुरुक्षेत्रे...'}\n\n` +
                 `👉 *पूरी गीता और भजन डायरी पढ़ने के लिए क्लिक करें:* ${window.location.origin}/bhagavad-gita`;
    
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border border-orange-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm relative overflow-hidden my-6">
      
      {/* सजावट के लिए बैकग्राउंड आइकॉन */}
      <div className="absolute -right-6 -bottom-6 text-orange-500/10 pointer-events-none select-none">
        <FaBookOpen size={180} />
      </div>

      <div className="relative z-10">
        
        {/* टॉप हेडर और एल्डर-फ्रेंडली फॉन्ट कंट्रोल बटन */}
        <div className="flex items-center justify-between mb-4 border-b border-orange-200/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              आज का श्लोक (Verse of the Day)
            </span>
            <span className="text-xs font-bold text-orange-800/70">
              अध्याय {verse.chapter_number} • श्लोक {verse.verse_number}
            </span>
          </div>

          {/* 🔍 Elder-Friendly Font Size Toggle Button */}
          <button 
            onClick={toggleFontSize}
            title="अक्षर बड़ा करें (Change Font Size)"
            className="flex items-center gap-1.5 bg-white hover:bg-orange-50 text-orange-800 text-xs font-bold px-3 py-1.5 rounded-xl border border-orange-200 shadow-sm transition-all active:scale-95"
          >
            <FaFont size={12} />
            <span>फॉन्ट बदलें</span>
          </button>
        </div>

        {/* संस्कृत श्लोक */}
        <div className="mb-4">
          <p className={`font-hindi font-black text-gray-900 leading-relaxed whitespace-pre-line ${fontSize} transition-all duration-300`}>
            {verse.sanskrit}
          </p>
        </div>

        {/* हिंदी अनुवाद */}
        {verse.hindi_translation && (
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100 mb-6">
            <p className="text-xs font-bold text-orange-700 uppercase mb-1">सरल अर्थ:</p>
            <p className="text-gray-700 font-hindi text-sm sm:text-base leading-relaxed">
              {verse.hindi_translation}
            </p>
          </div>
        )}

        {/* एक्शन बटन्स (WhatsApp Share & Read More) */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <button
            onClick={handleWhatsAppShare}
            className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-green-600/20 transition-all active:scale-95"
          >
            <FaWhatsapp size={18} /> WhatsApp पर शेयर करें
          </button>

          <a
            href={`/bhagavad-gita/chapter/${verse.chapter_number}`}
            className="w-full sm:w-auto bg-white hover:bg-orange-50 text-orange-700 border border-orange-200 px-6 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            संपूर्ण अध्याय पढ़ें <FaShareAlt size={12} />
          </a>
        </div>

      </div>
    </div>
  );
}