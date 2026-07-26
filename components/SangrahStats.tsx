"use client";

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/utils/db';
import { FaBookmark, FaCalendarCheck, FaTrophy } from 'react-icons/fa';

export default function SangrahStats() {
  const stats = useLiveQuery(async () => {
    // 1. Total Saved
    const totalSaved = await db.savedBhajans.count();

    // 2. Read This Month
    const history = await db.readingHistory.toArray();
    const now = new Date();
    const readThisMonth = history.filter(h => {
      const d = new Date(h.openedAt);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;

    // 3. Most Read (सबसे ज़्यादा पढ़ा गया)
    const frequency: Record<string, number> = {};
    history.forEach(h => {
      frequency[h.slug] = (frequency[h.slug] || 0) + 1;
    });

    let mostReadSlug = '';
    let maxCount = 0;
    for (const slug in frequency) {
      if (frequency[slug] > maxCount) {
        maxCount = frequency[slug];
        mostReadSlug = slug;
      }
    }

    let mostReadTitle = 'अभी शुरू नहीं किया';
    if (mostReadSlug) {
      const bhajan = await db.savedBhajans.get(mostReadSlug);
      // अगर भजन सेव्ड लिस्ट में नहीं है, तो slug को ही टाइटल बना दें
      mostReadTitle = bhajan ? bhajan.title : mostReadSlug.replace(/-/g, ' ').toUpperCase();
    }

    return { totalSaved, readThisMonth, mostReadTitle };
  });

  if (!stats) return null; // Loading state

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Stat 1: Total Saved */}
      <div className="bg-white/70 backdrop-blur-md border border-orange-100 p-5 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
        <div className="w-12 h-12 bg-orange-50 text-orange-500 rounded-full flex items-center justify-center shrink-0">
          <FaBookmark size={20} />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">कुल संग्रह</p>
          <p className="text-xl font-black text-gray-900 leading-none">{stats.totalSaved} <span className="text-sm font-medium text-gray-500">भजन</span></p>
        </div>
      </div>

      {/* Stat 2: Read This Month */}
      <div className="bg-white/70 backdrop-blur-md border border-blue-100 p-5 rounded-[1.5rem] flex items-center gap-4 shadow-sm hover:shadow-md transition-all">
        <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center shrink-0">
          <FaCalendarCheck size={20} />
        </div>
        <div className="overflow-hidden">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">इस महीने पढ़े</p>
          <p className="text-xl font-black text-gray-900 leading-none">{stats.readThisMonth} <span className="text-sm font-medium text-gray-500">बार</span></p>
        </div>
      </div>

      {/* Stat 3: Most Read */}
      <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-5 rounded-[1.5rem] flex items-center gap-4 shadow-md hover:shadow-lg transition-all text-white relative overflow-hidden">
        <div className="absolute -right-4 -bottom-4 opacity-10"><FaTrophy size={80} /></div>
        <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/10 z-10">
          <FaTrophy size={20} className="text-yellow-300" />
        </div>
        <div className="overflow-hidden z-10">
          <p className="text-xs font-bold text-orange-100 uppercase tracking-widest mb-1">सबसे पसंदीदा</p>
          <p className="text-lg font-black font-hindi leading-tight truncate">{stats.mostReadTitle}</p>
        </div>
      </div>

    </div>
  );
}