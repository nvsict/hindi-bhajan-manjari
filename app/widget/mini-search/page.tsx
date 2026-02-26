"use client";

import { useState, Suspense } from 'react';
import { FaSearch } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';
import { useSearchParams } from 'next/navigation';

function SearchWidgetContent() {
  const searchParams = useSearchParams();
  const theme = searchParams.get('theme') || 'light';
  const isDark = theme === 'dark';
  const [query, setQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    // 🌟 MUST BE ABSOLUTE URL & OPEN IN NEW TAB
    const baseUrl = 'https://www.hindibhajanmanjari.com';
    window.open(`${baseUrl}/search?q=${encodeURIComponent(query.trim())}`, '_blank');
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 font-sans transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-transparent text-gray-900'}`}>
      <div className="w-full max-w-sm">
        
        {/* Branding Header */}
        <div className="flex items-center gap-2 mb-3 justify-center">
          <GiLotusFlower className={isDark ? "text-orange-400" : "text-orange-600"} size={18} />
          <span className={`font-black tracking-tight text-[13px] uppercase ${isDark ? "text-gray-200" : "text-gray-800"}`}>
            HINDI<span className="text-orange-500">BHAJAN</span> Search
          </span>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 10,000+ Bhajans..."
            required
            className={`w-full pl-4 pr-12 py-3 rounded-full text-sm font-medium outline-none transition-all border shadow-sm ${
              isDark
                ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                : 'bg-white border-orange-200 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
            }`}
          />
          <button
            type="submit"
            aria-label="Search"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 flex items-center justify-center bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-full hover:scale-105 active:scale-95 transition-all shadow-md shadow-orange-500/30"
          >
            <FaSearch size={13} />
          </button>
        </form>
        
      </div>
    </div>
  );
}

// Wrap in Suspense because we are using useSearchParams() on the client
export default function MiniSearchWidget() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-transparent"></div>}>
      <SearchWidgetContent />
    </Suspense>
  );
}