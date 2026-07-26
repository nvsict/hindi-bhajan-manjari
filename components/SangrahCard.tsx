"use client";

import Link from 'next/link';
import { FaTrash, FaArrowRight, FaWhatsapp, FaThumbtack } from 'react-icons/fa';
import { GiLotusFlower } from 'react-icons/gi';

interface SavedBhajan {
  title: string;
  slug: string;
  addedAt: string;
  isPinned?: number;
}

interface SangrahCardProps {
  bhajan: SavedBhajan;
  onRemove: (slug: string) => void;
  onTogglePin: (slug: string, currentStatus: number) => void;
}

export default function SangrahCard({ bhajan, onRemove, onTogglePin }: SangrahCardProps) {
  
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/bhajan/${bhajan.slug}`;
    const text = `मैंने यह सुंदर भजन सेव किया है: *${bhajan.title}*। आप भी यहाँ पढ़ सकते हैं:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formattedDate = new Date(bhajan.addedAt).toLocaleDateString('hi-IN', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });

  return (
    <div className={`relative group bg-white/60 backdrop-blur-lg p-6 rounded-[2rem] border shadow-[0_4px_20px_-10px_rgba(234,88,12,0.1)] hover:shadow-[0_8px_30px_-10px_rgba(234,88,12,0.2)] hover:bg-white transition-all duration-300 flex flex-col overflow-hidden ${bhajan.isPinned ? 'border-orange-300 bg-orange-50/30' : 'border-orange-100'}`}>
      
      {/* 📌 Pin Badge */}
      {bhajan.isPinned === 1 && (
        <div className="absolute top-0 right-6 bg-orange-500 text-white px-3 py-1 rounded-b-xl shadow-sm text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 z-20">
          <FaThumbtack /> Pinned
        </div>
      )}

      {/* Subtle Lotus Background */}
      <div className="absolute -bottom-6 -right-6 text-orange-500/5 pointer-events-none group-hover:scale-110 transition-transform duration-500 z-0">
        <GiLotusFlower size={120} />
      </div>

      <div className="relative z-10 flex-1 mt-2">
        <div className="flex items-start justify-between gap-4 mb-2">
          <h3 className="text-2xl font-black font-hindi text-gray-900 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors">
            {bhajan.title}
          </h3>
          
          <div className="flex gap-2 shrink-0">
            {/* Pin Button */}
            <button 
              onClick={() => onTogglePin(bhajan.slug, bhajan.isPinned || 0)}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 border shadow-sm ${bhajan.isPinned ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-gray-300 hover:text-orange-500 border-gray-100 hover:border-orange-100'}`}
              title={bhajan.isPinned ? "Unpin" : "Pin to Top"}
            >
              <FaThumbtack size={13} className={bhajan.isPinned ? '' : '-rotate-45'} />
            </button>
            {/* Delete Button */}
            <button 
              onClick={() => onRemove(bhajan.slug)}
              className="text-gray-300 hover:text-red-500 bg-white hover:bg-red-50 w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-95 border border-gray-100 hover:border-red-100 shadow-sm"
              title="संग्रह से हटाएं (Remove)"
            >
              <FaTrash size={13} />
            </button>
          </div>
        </div>
        <p className="text-[11px] font-bold text-orange-400 uppercase tracking-widest">
          Saved: {formattedDate}
        </p>
      </div>
      
      <div className="relative z-10 mt-6 pt-4 border-t border-orange-100/50 flex items-center justify-between">
        <Link 
          href={`/bhajan/${bhajan.slug}`} 
          className="text-white text-[13px] font-black uppercase tracking-wider flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          पढ़ें <FaArrowRight size={12} />
        </Link>
        <button 
          onClick={handleShare}
          className="text-[#25D366] hover:bg-[#25D366]/10 px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-bold transition-colors"
        >
          <FaWhatsapp size={18} /> <span className="hidden xs:inline">Share</span>
        </button>
      </div>
    </div>
  );
}