"use client";

import { useState, useEffect } from 'react';
import { FaCode, FaCopy, FaCheck, FaPaintBrush, FaGlobe, FaLaptopCode, FaSearch, FaPrayingHands, FaWhatsapp, FaCalendarAlt } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

// 🌟 THE WIDGET REGISTRY
// To add a new widget later, literally just add one object to this array. 
// The entire page will build itself automatically!
const WIDGET_REGISTRY = [
  {
    id: 'daily',
    name: 'Daily Bhajan Widget',
    icon: GiLotusFlower,
    path: 'daily-bhajan',
    height: '320',
    needsSlug: false,
    hasShadow: true,
  },
  {
    id: 'search',
    name: 'Mini Search Bar',
    icon: FaSearch,
    path: 'mini-search',
    height: '140',
    needsSlug: false,
    hasShadow: false,
  },
  {
    id: 'lyrics',
    name: 'Embed Lyrics Box',
    icon: FaCode,
    path: 'embed-lyrics',
    height: '450',
    needsSlug: true, // Tells the UI to show the "Bhajan URL Slug" input box
    hasShadow: false,
  },
  {
    id: 'jaap',
    name: 'Interactive Jaap Mala',
    icon: FaPrayingHands,
    path: 'jaap-mala',
    height: '350',
    needsSlug: false,
    hasShadow: true,
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp Quote Generator',
    icon: FaWhatsapp,
    path: 'whatsapp-status',
    height: '380',
    needsSlug: false,
    hasShadow: true,
  },
  {
    id: 'panchang',
    name: 'Daily Panchang Card',
    icon: FaCalendarAlt,
    path: 'panchang',
    height: '280',
    needsSlug: false,
    hasShadow: true,
  },
];

export default function DevelopersPage() {
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Widget Customization State
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [language, setLanguage] = useState<'hindi' | 'hinglish'>('hindi');
  const [targetSlug, setTargetSlug] = useState('hanuman-chalisa');
  
  // Active Widget State (Defaults to the first item in the registry)
  const [activeWidgetId, setActiveWidgetId] = useState(WIDGET_REGISTRY[0].id);

  useEffect(() => setMounted(true), []);

  // 🌟 DYNAMIC CODE GENERATOR (No more messy if/else statements!)
  const activeWidget = WIDGET_REGISTRY.find(w => w.id === activeWidgetId) || WIDGET_REGISTRY[0];
  
  const productionUrl = "https://www.hindibhajanmanjari.com";
  const slugParam = activeWidget.needsSlug ? `&slug=${targetSlug}` : '';
  
  const previewSrc = `/widget/${activeWidget.path}?theme=${theme}&lang=${language}${slugParam}`;
  const productionSrc = `${productionUrl}/widget/${activeWidget.path}?theme=${theme}&lang=${language}${slugParam}`;
  
  const embedCode = `<div style="max-width: 400px; margin: 0 auto;">
  <iframe 
    src="${productionSrc}" 
    width="100%" 
    height="${activeWidget.height}" 
    style="border:none; border-radius:16px; ${activeWidget.hasShadow ? 'box-shadow: 0 4px 20px rgba(0,0,0,0.08);' : ''}"
    title="${activeWidget.name}"
  ></iframe>
  <p style="text-align: center; font-size: 11px; margin-top: 8px; font-family: sans-serif;">
    <a href="${productionUrl}" target="_blank" style="color: #ea580c; text-decoration: none; font-weight: 600;">
      Powered by Hindi Bhajan Manjari
    </a>
  </p>
</div>`;

  const handleCopy = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-orange-50/30 pb-20">
      
      {/* 🌟 HERO SECTION */}
      <div className="bg-gradient-to-br from-[#1a0a00] via-[#2c1200] to-[#1a0a00] text-white py-16 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500/20 text-orange-400 mb-6 border border-orange-500/30">
            <FaLaptopCode size={30} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
            Manjari <span className="text-orange-500">For Developers</span>
          </h1>
          <p className="text-lg text-orange-100/70 max-w-2xl mx-auto font-medium">
            Embed the rich spiritual heritage of India directly into your temple website, blog, or app. 100% free forever.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        
        {/* 🌟 AUTO-GENERATED WIDGET TABS */}
        <div className="flex gap-4 mb-8 overflow-x-auto pb-4 scrollbar-hide">
          {WIDGET_REGISTRY.map((widget) => {
            const isActive = activeWidgetId === widget.id;
            const Icon = widget.icon;
            
            return (
              <button 
                key={widget.id}
                onClick={() => setActiveWidgetId(widget.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all whitespace-nowrap ${
                  isActive 
                    ? 'bg-white border-2 border-orange-500 text-orange-600 shadow-md shadow-orange-500/20' 
                    : 'bg-white/50 border-2 border-transparent text-gray-500 hover:bg-white'
                }`}
              >
                <Icon size={18} /> {widget.name}
              </button>
            );
          })}
        </div>

        {/* 🌟 MAIN DASHBOARD */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Controls & Code */}
          <div className="lg:col-span-7 space-y-6">
            
            <div className="bg-white p-6 rounded-3xl border border-orange-100 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <FaPaintBrush className="text-orange-500" /> Customize Widget
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Theme Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3">Color Theme</label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setTheme('light')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${theme === 'light' ? 'bg-white text-gray-900 shadow' : 'text-gray-500 hover:text-gray-700'}`}>Light Mode</button>
                    <button onClick={() => setTheme('dark')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${theme === 'dark' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:text-gray-700'}`}>Dark Mode</button>
                  </div>
                </div>

                {/* Language Selector */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                    <FaGlobe className="text-gray-400" /> Language Preference
                  </label>
                  <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button onClick={() => setLanguage('hindi')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${language === 'hindi' ? 'bg-white text-orange-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>हिंदी (Hindi)</button>
                    <button onClick={() => setLanguage('hinglish')} className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${language === 'hinglish' ? 'bg-white text-orange-600 shadow' : 'text-gray-500 hover:text-gray-700'}`}>Hinglish</button>
                  </div>
                </div>

                {/* 🌟 CONDITIONAL SLUG INPUT (Automatically shows if widget.needsSlug is true) */}
                {activeWidget.needsSlug && (
                  <div className="sm:col-span-2 pt-4 border-t border-gray-100">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Bhajan URL Slug (What to embed)</label>
                    <div className="flex gap-2">
                      <span className="inline-flex items-center px-3 rounded-xl border border-r-0 border-gray-200 bg-gray-50 text-gray-500 sm:text-sm">hindibhajanmanjari.com/bhajan/</span>
                      <input type="text" value={targetSlug} onChange={(e) => setTargetSlug(e.target.value)} placeholder="e.g. hanuman-chalisa" className="flex-1 block w-full min-w-0 rounded-none rounded-r-xl border border-gray-200 px-3 py-2 focus:border-orange-500 focus:ring-orange-500 sm:text-sm" />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Code Generator Panel */}
            <div className="bg-gray-900 rounded-3xl overflow-hidden shadow-xl border border-gray-800">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800 bg-black/30">
                <span className="text-xs font-mono text-gray-400">Embed Code (HTML)</span>
                <button onClick={handleCopy} className={`flex items-center gap-2 text-xs font-bold px-4 py-2 rounded-lg transition-all ${copied ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                  {copied ? <><FaCheck /> Copied!</> : <><FaCopy /> Copy Code</>}
                </button>
              </div>
              <div className="p-6 overflow-x-auto">
                <pre className="text-sm font-mono text-gray-300 leading-relaxed"><code>{embedCode}</code></pre>
              </div>
            </div>
            
          </div>

          {/* RIGHT COLUMN: Live Preview */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-orange-100 shadow-sm sticky top-28">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Live Preview</h3>
              </div>
              
              <div className="bg-gray-50 rounded-2xl p-4 border border-gray-100 flex items-center justify-center min-h-[400px] overflow-hidden">
                <iframe 
                  src={previewSrc} 
                  width="100%" 
                  height={activeWidget.height} 
                  className={`w-full max-w-[400px] border-none rounded-2xl transition-all duration-300 ${activeWidget.hasShadow ? 'shadow-[0_4px_20px_rgba(0,0,0,0.08)]' : ''}`}
                  title="Widget Preview"
                />
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}