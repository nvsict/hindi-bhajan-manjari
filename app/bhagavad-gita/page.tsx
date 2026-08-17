"use client";

import React, { useState } from 'react';
import { FaWhatsapp, FaFont, FaBookOpen, FaSearch, FaArrowRight, FaLanguage } from 'react-icons/fa';

export default function BhagavadGitaBasePage() {
  // 🌟 1. UI States (Font Size & Script)
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'xlarge'>('normal');
  const [script, setScript] = useState<'devanagari' | 'gujarati' | 'bengali' | 'roman'>('devanagari');

  // फॉन्ट साइज डायनेमिक क्लासेस
  const getVerseFontClass = () => {
    if (fontSize === 'large') return 'text-2xl leading-relaxed';
    if (fontSize === 'xlarge') return 'text-3xl leading-loose';
    return 'text-lg leading-relaxed';
  };

  const getMeaningFontClass = () => {
    if (fontSize === 'large') return 'text-xl leading-relaxed';
    if (fontSize === 'xlarge') return 'text-2xl leading-relaxed';
    return 'text-base leading-relaxed';
  };

  // फॉन्ट टॉगल हैंडलर
  const toggleFontSize = () => {
    if (fontSize === 'normal') setFontSize('large');
    else if (fontSize === 'large') setFontSize('xlarge');
    else setFontSize('normal');
  };

  // 🌟 2. Mock Data (बाद में इसे डेटाबेस से फेच करेंगे)
  // यहाँ मल्टी-लिपि का डेमो दिया गया है
  const todaysVerse = {
    chapter: 1,
    verse: 1,
    scripts: {
      devanagari: "धृतराष्ट्र उवाच |\nधर्मक्षेत्रे कुरुक्षेत्रे समवेता युयुत्सवः |\nमामकाः पाण्डवाश्चैव किमकुर्वत सञ्जय ||१-१||",
      gujarati: "ધૃતરાષ્ટ્ર ઉવાચ |\nધર્મક્ષેત્રે કુરુક્ષેત્રે સમવેતા યુયુત્સવઃ |\nમામકાઃ પાણ્ડવાશ્ચૈવ કિમકુર્વત સઞ્જય ||૧-૧||",
      bengali: "ধৃতরাষ্ট্র উবাচ |\nধর্মক্ষেত্রে কুরুক্ষেত্রে সমবেতা যুযুত্সবঃ |\nমামকাঃ পাণ্ডবাশ্চৈব কিমকুর্বত সঞ্জয ||১-১||",
      roman: "dhṛtarāṣṭra uvāca .\ndharmakṣetre kurukṣetre samavetā yuyutsavaḥ .\nmāmakāḥ pāṇḍavāścaiva kimakurvata sañjaya ||1-1||"
    },
    hindiMeaning: "धृतराष्ट्र ने कहा — हे संजय! धर्मभूमि कुरुक्षेत्र में एकत्र हुए, युद्ध के इच्छुक मेरे और पाण्डु के पुत्रों ने क्या किया?"
  };

  const chaptersList = [
    { number: 1, name: "अर्जुनविषादयोग", translation: "Arjuna Visada Yoga", verses: 47 },
    { number: 2, name: "सांख्ययोग", translation: "Sankhya Yoga", verses: 72 },
    { number: 3, name: "कर्मयोग", translation: "Karma Yoga", verses: 43 },
    { number: 4, name: "ज्ञानकर्मसंन्यासयोग", translation: "Jnana Karma Sanyasa Yoga", verses: 42 },
    { number: 5, name: "कर्मसंन्यासयोग", translation: "Karma Sanyasa Yoga", verses: 29 },
    { number: 6, name: "ध्यानयोग", translation: "Dhyana Yoga", verses: 47 },
  ];

  // WhatsApp शेयरिंग
  const handleWhatsAppShare = () => {
    const selectedVerse = todaysVerse.scripts[script];
    const text = `✨ *आज का दिव्य श्लोक (श्रीमद् भगवद्गीता)* ✨\n\n` +
                 `📖 *अध्याय ${todaysVerse.chapter}, श्लोक ${todaysVerse.verse}*\n\n` +
                 `🕉️ *श्लोक:*\n${selectedVerse}\n\n` +
                 `🇮🇳 *अर्थ:*\n${todaysVerse.hindiMeaning}\n\n` +
                 `👉 *अपनी भाषा में पूरी गीता पढ़ने के लिए क्लिक करें:* ${window.location.href}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <main className="min-h-screen bg-[#fafaf9] text-gray-900 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* ==========================================
            1. TOP NAVBAR / CONTROL PANEL
            ========================================== */}
        <div className="flex flex-col lg:flex-row items-center justify-between bg-white border border-orange-100 rounded-[2rem] p-4 sm:p-6 shadow-sm gap-6 sticky top-4 z-50">
          
          {/* Title & Branding */}
          <div className="text-center lg:text-left">
            <span className="text-orange-600 font-bold text-[10px] sm:text-xs tracking-widest uppercase bg-orange-50 px-3 py-1 rounded-full border border-orange-200">
              संपूर्ण श्रीमद् भगवद्गीता
            </span>
            <h1 className="text-2xl sm:text-3xl font-black font-hindi text-gray-900 mt-2">
              परमार्थ का मार्ग
            </h1>
          </div>

          {/* Elder-Friendly Controls (Script & Font) */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Script Selector */}
            <div className="relative flex items-center bg-orange-50 border border-orange-200 rounded-2xl px-3 py-2">
              <FaLanguage className="text-orange-600 mr-2" size={18} />
              <select 
                value={script}
                onChange={(e) => setScript(e.target.value as any)}
                className="bg-transparent text-orange-900 font-bold text-sm focus:outline-none cursor-pointer appearance-none pr-4"
              >
                <option value="devanagari">देवनागरी (हिंदी/संस्कृत)</option>
                <option value="gujarati">ગુજરાતી (Gujarati)</option>
                <option value="bengali">বাংলা (Bengali)</option>
                <option value="roman">English (Roman)</option>
              </select>
            </div>

            {/* Font Size Toggle */}
            <button
              onClick={toggleFontSize}
              className="flex items-center gap-2 bg-orange-50 hover:bg-orange-100 text-orange-900 font-bold px-4 py-2.5 rounded-2xl border border-orange-200 text-sm transition-all active:scale-95 shadow-sm"
              title="अक्षर छोटे/बड़े करें"
            >
              <FaFont size={16} />
              <span className="hidden sm:inline">फॉन्ट साइज़: {fontSize.toUpperCase()}</span>
            </button>
          </div>
        </div>

        {/* ==========================================
            2. HERO SECTION / VERSE OF THE DAY
            ========================================== */}
        <div className="bg-gradient-to-br from-[#fff7ed] to-[#ffedd5] border border-orange-200 rounded-[2.5rem] p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 text-orange-500/10 pointer-events-none select-none">
            <FaBookOpen size={250} />
          </div>

          <div className="relative z-10 max-w-3xl space-y-6">
            <div className="flex items-center gap-3">
              <span className="bg-orange-600 text-white text-xs font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                आज का श्लोक
              </span>
              <span className="text-sm font-bold text-orange-800/80">
                अध्याय {todaysVerse.chapter} • श्लोक {todaysVerse.verse}
              </span>
            </div>

            {/* Dynamic Sanskrit/Script Verse */}
            <div className="min-h-[100px]">
              <p className={`font-hindi font-black text-gray-900 whitespace-pre-line transition-all duration-300 ${getVerseFontClass()}`}>
                {todaysVerse.scripts[script]}
              </p>
            </div>

            {/* Hindi Meaning */}
            <div className="bg-white/70 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-orange-100 shadow-sm">
              <p className="text-xs font-bold text-orange-700 uppercase mb-2 tracking-wide">सरल भावार्थ:</p>
              <p className={`text-gray-800 font-hindi transition-all duration-300 ${getMeaningFontClass()}`}>
                {todaysVerse.hindiMeaning}
              </p>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 pt-2">
              <button
                onClick={handleWhatsAppShare}
                className="bg-[#25D366] hover:bg-[#1EBE5D] text-white px-6 py-3 rounded-2xl font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-[#25D366]/30 transition-all active:scale-95 w-full sm:w-auto"
              >
                <FaWhatsapp size={20} /> WhatsApp पर शेयर करें
              </button>
            </div>
          </div>
        </div>

        {/* ==========================================
            3. SEARCH & EXPLORE SECTION
            ========================================== */}
        <div className="relative max-w-2xl mx-auto py-4">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-gray-400">
            <FaSearch size={18} />
          </div>
          <input
            type="text"
            placeholder="श्लोक खोजें या कोई शब्द टाइप करें (जैसे: कर्म, योग, शांति)..."
            className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-3xl shadow-sm focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-base font-medium transition-all"
          />
        </div>

        {/* ==========================================
            4. CHAPTERS GRID (अध्यायों की सूची)
            ========================================== */}
        <div className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-gray-200 pb-4">
            <div>
              <h2 className="text-3xl font-black font-hindi text-gray-900">सभी 18 अध्याय</h2>
              <p className="text-gray-500 text-sm mt-1">किसी भी अध्याय पर क्लिक करके उसके सभी श्लोक और सारांश पढ़ें।</p>
            </div>
            <span className="text-sm text-orange-600 font-bold bg-orange-50 px-4 py-1.5 rounded-full">
              कुल 700 श्लोक
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {chaptersList.map((ch) => (
              <a
                key={ch.number}
                href={`/bhagavad-gita/chapter/${ch.number}`}
                className="bg-white p-6 rounded-3xl border border-gray-100 hover:border-orange-300 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-orange-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-0"></div>
                
                <div className="flex justify-between items-start z-10">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 font-black flex items-center justify-center text-xl group-hover:bg-orange-500 group-hover:text-white transition-colors">
                    {ch.number}
                  </div>
                  <div className="text-gray-300 group-hover:text-orange-500 transition-colors bg-gray-50 group-hover:bg-orange-50 p-2 rounded-full">
                    <FaArrowRight size={14} />
                  </div>
                </div>

                <div className="mt-5 z-10">
                  <h3 className="font-black text-gray-900 font-hindi text-xl mb-1 group-hover:text-orange-700 transition-colors">
                    {ch.name}
                  </h3>
                  <div className="flex items-center justify-between w-full mt-3">
                    <p className="text-xs text-gray-500 font-bold bg-gray-50 px-2 py-1 rounded-md">
                      {ch.translation}
                    </p>
                    <p className="text-xs text-orange-600 font-bold">
                      {ch.verses} श्लोक
                    </p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}