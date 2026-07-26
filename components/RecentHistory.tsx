"use client";

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/utils/db';
import Link from 'next/link';
import { FaHistory, FaPlayCircle } from 'react-icons/fa';

export default function RecentHistory() {
  const recentBhajans = useLiveQuery(async () => {
    // हिस्ट्री को उल्टे क्रम में (सबसे नया पहले) निकालें
    const history = await db.readingHistory.orderBy('openedAt').reverse().toArray();
    
    // डुप्लीकेट्स (एक ही भजन को बार-बार खोलना) हटाएं, सिर्फ ताज़ा टॉप 8 लें
    const uniqueSlugs = Array.from(new Set(history.map(h => h.slug))).slice(0, 8);
    
    const results = [];
    for (const slug of uniqueSlugs) {
      const saved = await db.savedBhajans.get(slug);
      results.push({
        slug,
        title: saved ? saved.title : slug.replace(/-/g, ' ').toUpperCase()
      });
    }
    return results;
  });

  if (!recentBhajans || recentBhajans.length === 0) return null;

  return (
    <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
      <div className="flex items-center gap-2 mb-4 px-1">
        <FaHistory className="text-orange-500" />
        <h2 className="text-xl font-black text-gray-900 font-hindi tracking-tight">हाल ही में पढ़े गए</h2>
      </div>
      
      {/* Horizontal Scroll Container */}
      <div className="flex overflow-x-auto gap-4 pb-4 custom-scrollbar snap-x snap-mandatory">
        {recentBhajans.map((bhajan) => (
          <Link 
            key={bhajan.slug} 
            href={`/bhajan/${bhajan.slug}`}
            className="snap-start shrink-0 w-[240px] bg-white rounded-2xl p-4 border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.15)] hover:border-orange-200 transition-all group relative overflow-hidden"
          >
            <div className="absolute right-[-20px] bottom-[-20px] opacity-[0.03] group-hover:opacity-10 transition-opacity">
              <FaPlayCircle size={100} />
            </div>
            <div className="w-10 h-10 bg-orange-50 text-orange-400 rounded-full flex items-center justify-center mb-3 group-hover:bg-orange-500 group-hover:text-white transition-colors">
              <FaPlayCircle size={18} />
            </div>
            <h3 className="text-lg font-black font-hindi text-gray-900 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
              {bhajan.title}
            </h3>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-3">Continue Reading &rarr;</p>
          </Link>
        ))}
      </div>
    </div>
  );
}