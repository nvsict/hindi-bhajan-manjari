"use client";

import React, { useState } from 'react';
import { FaWhatsapp, FaFont, FaBookOpen, FaSearch, FaArrowRight, FaBookmark } from 'react-icons/fa';

export default function FullBhagavadGitaPage() {
  // 🌟 1. Elder-Friendly Font Size State ('normal' | 'large' | 'xlarge')
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');

  // फॉन्ट साइज स्विच करने का फंक्शन
  const toggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  // डायनेमिक क्लास पिकर
  const getFontSizeClass = () => {
    if (fontSize === 'large') return 'text-2xl';
    if (fontSize === 'xlarge') return 'text-3xl';
    return 'text-lg';
  };

  // आज का डमी श्लोक (जिसे बाद में आप अपने डेटाबेस से जोड़ेंगे)
  const todaysVerse = {
    chapter: 1,
    verse: 1,
    sanskrit: "धृतराष्ट्र उवाच |\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||१-१||",
    hindi: "धृतराष्ट्र ने कहा — हे संजय! धर्मभूमि कुरुक्षेत्र में एकत्र हुए, युद्ध के इच्छुक मेरे और पाण्डु के पुत्रों ने क्या किया?"
  };

  // 18 अध्यायों की लिस्ट (शुरुआती उदाहरण)
  const chaptersList = [
    { number: 1, name: "अर्जुनविषादयोग", translation: "Arjuna Visada Yoga", verses: 47 },
    { number: 2, name: "सांख्ययोग", translation: "Sankhya Yoga", verses: 72 },
    { number: 3, name: "कर्मयोग", translation: "Karma Yoga", verses: 43 },
    { number: 4, name: "ज्ञानकर्मसंन्यासयोग", translation: "Jnana Karma Sanyasa Yoga", verses: 42 },
    // इसी तरह बाकी अध्याय भी डेटाबेस से आ जाएंगे
  ];

  // WhatsApp शेयरिंग फंक्शन
  const handleWhatsAppShare = () => {
    const text = `✨ *आज का दिव्य श्लोक (श्रीमद् भगवद्गीता)* ✨\n\n` +
                 `📖 *अध्याय ${todaysVerse.chapter}, श्लोक ${todaysVerse.verse}*\n\n` +
                 `🕉️ *श्लोक:*\n${todaysVerse.sanskrit}\n\n` +
                 `🇮🇳 *अर्थ:*\n${todaysVerse.hindi}\n\n` +
                 `👉 *पूरी गीता पढ़ने के लिए क्लिक करें:* ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#fafaf9] text-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        
        {/* 🌟 1. TOP HEADER & ELDER-FRIENDLY CONTROLS */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white border border-orange-100 rounded-3xl p-6 shadow-sm gap-4">
          <div>
            <span className="text-orange-600 font-bold text-xs tracking-widest uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              श्रीमद् भगवद्गीता • आत्मज्ञान
            </span>
            <h1 className="text-3xl font-black font-hindi text-gray-900 mt-2">
              पवित्र भगवद्गीता ग्रंथ
            </h1>
            <p className="text-gray-500 text-sm">बिना किसी विज्ञापन या रुकावट के, अपनी भाषा में पढ़ें।</p>
          </div>

          {/* Elder Friendly Font & Theme Control Bar */}
          <div className="flex items-center gap-3">
            <button
              onClick={toggleFontSize}
              className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-800 font-bold px-4 py-2.5 rounded-2xl border border-orange-200 text-xs transition-all active:scale-95 shadow-sm"
              title="अक्षर छोटे/बड़े करें"
            >
              <FaFont size={14} />
              <span>फॉन्ट साइज़: {fontSize.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* 🌟 2. VERSE OF THE DAY (आज का श्लोक विजेट) */}
        <div className="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border border-orange-200 rounded-[2.5rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 text-orange-500/10 pointer-events-none select-none">
            <FaBookOpen size={180} />
          </div>

          <div className="relative z-10 space-y-4">
            <div className="flex items-center justify-between border-b border-orange-200/60 pb-3">
              <span className="bg-orange-600 text-white text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
                आज का श्लोक (Verse of the Day)
              </span>
              <span className="text-xs font-bold text-orange-800/70">
                अध्याय {todaysVerse.chapter} • श्लोक {todaysVerse.verse}
              </span>
            </div>

            {/* संस्कृत श्लोक (फॉन्ट साइज स्टेट के साथ डायनेमिक) */}
            <p className={`font-hindi font-black text-gray-900 leading-relaxed whitespace-pre-line transition-all duration-300 ${getFontSizeClass()}`}>
              {todaysVerse.sanskrit}
            </p>

            {/* हिंदी अर्थ */}
            <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-orange-100">
              <p className="text-xs font-bold text-orange-700 uppercase mb-1">सरल अर्थ:</p>
              <p className={`text-gray-700 font-hindi leading-relaxed ${fontSize === 'xlarge' ? 'text-xl' : 'text-base'}`}>
                {todaysVerse.hindi}
              </p>
            </div>

            {/* एक्शन बटन्स */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={handleWhatsAppShare}
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-2xl font-bold text-sm flex items-center gap-2 shadow-md transition-all active:scale-95"
              >
                <FaWhatsapp size={18} /> WhatsApp पर शेयर करें
              </button>
            </div>
          </div>
        </div>

        {/* 🌟 3. SEARCH & QUICK NAVIGATION BAR */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
            <FaSearch size={16} />
          </div>
          <input
            type="text"
            placeholder="श्लोक खोजें या कोई शब्द टाइप करें (जैसे: कर्म, योग, शांति)..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:border-orange-500 text-sm font-medium transition-all"
          />
        </div>

        {/* 🌟 4. ALL 18 CHAPTERS GRID (अध्यायों की सूची) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-black font-hindi text-gray-900">सभी 18 अध्याय</h2>
            <span className="text-xs text-gray-500 font-bold">संपूर्ण सार सहित</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {chaptersList.map((ch) => (
              <a
                key={ch.number}
                href={`/bhagavad-gita/chapter/${ch.number}`}
                className="bg-white p-5 rounded-3xl border border-gray-200 hover:border-orange-300 hover:shadow-md transition-all flex items-center justify-between group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 font-black flex items-center justify-center text-lg border border-orange-100 group-hover:bg-orange-600 group-hover:text-white transition-colors">
                    {ch.number}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 font-hindi text-lg group-hover:text-orange-600 transition-colors">
                      {ch.name}
                    </h3>
                    <p className="text-xs text-gray-500 font-medium">
                      {ch.translation} • {ch.verses} श्लोक
                    </p>
                  </div>
                </div>
                <div className="text-gray-300 group-hover:text-orange-600 transition-colors pr-2">
                  <FaArrowRight size={14} />
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}