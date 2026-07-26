"use client";

import Link from 'next/link';
import { FaTrash, FaArrowRight, FaWhatsapp, FaThumbtack, FaShareAlt } from 'react-icons/fa';
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
  viewMode?: 'grid' | 'list'; // 🌟 Added viewMode support
}

export default function SangrahCard({ bhajan, onRemove, onTogglePin, viewMode = 'grid' }: SangrahCardProps) {
  
  const handleShare = () => {
    const shareUrl = `${window.location.origin}/bhajan/${bhajan.slug}`;
    const text = `मैंने यह सुंदर भजन सेव किया है: *${bhajan.title}*। आप भी यहाँ पढ़ सकते हैं:\n${shareUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  const formattedDate = new Date(bhajan.addedAt).toLocaleDateString('hi-IN', { 
    day: 'numeric', month: 'short', year: 'numeric' 
  });

  // ==========================================
  // 🌟 DESIGN 1: LIST VIEW (Sleek & Compact)
  // ==========================================
  if (viewMode === 'list') {
    return (
      <div className={`relative group bg-white/80 backdrop-blur-lg p-4 sm:p-5 rounded-2xl border shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4 overflow-hidden ${bhajan.isPinned ? 'border-orange-300 bg-orange-50/40' : 'border-orange-100'}`}>
        
        {/* Subtle Background Lotus */}
        <div className="absolute -right-4 -bottom-4 text-orange-500/5 pointer-events-none z-0">
          <GiLotusFlower size={80} />
        </div>

        {/* Left: Title & Info */}
        <div className="flex-1 min-w-0 z-10 w-full flex items-start sm:items-center gap-3">
          {bhajan.isPinned === 1 && (
            <div className="bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-0.5 sm:mt-0">
              <FaThumbtack size={10} />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <h3 className="text-lg sm:text-xl font-black font-hindi text-gray-900 leading-tight truncate group-hover:text-orange-600 transition-colors">
              {bhajan.title}
            </h3>
            <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mt-1">
              Saved: {formattedDate}
            </p>
          </div>
        </div>

        {/* Right: Actions (Responsive Row) */}
        <div className="flex items-center gap-2 sm:gap-3 z-10 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-orange-100/50 pt-3 sm:pt-0 mt-1 sm:mt-0">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button 
              onClick={() => onTogglePin(bhajan.slug, bhajan.isPinned || 0)}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border shrink-0 ${bhajan.isPinned ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-gray-50 text-gray-400 hover:text-orange-500 hover:bg-orange-50 border-gray-100'}`}
              title={bhajan.isPinned ? "Unpin" : "Pin"}
            >
              <FaThumbtack size={11} className={bhajan.isPinned ? '' : '-rotate-45'} />
            </button>
            <button 
              onClick={handleShare}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-[#25D366] border border-gray-100 hover:bg-[#25D366]/10 transition-colors shrink-0"
              title="Share"
            >
              <FaShareAlt size={11} />
            </button>
            <button 
              onClick={() => onRemove(bhajan.slug)}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-50 text-gray-400 border border-gray-100 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
              title="Remove"
            >
              <FaTrash size={11} />
            </button>
          </div>
          <Link 
            href={`/bhajan/${bhajan.slug}`} 
            className="text-white text-[11px] sm:text-[12px] font-black uppercase flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 transition-all shadow-md shrink-0"
          >
            पढ़ें <FaArrowRight size={10} />
          </Link>
        </div>
      </div>
    );
  }

  // ==========================================
  // 🌟 DESIGN 2: GRID VIEW (Beautiful Card)
  // ==========================================
  return (
    <div className={`relative group bg-white/60 backdrop-blur-lg p-5 sm:p-6 rounded-[2rem] border shadow-[0_4px_20px_-10px_rgba(234,88,12,0.1)] hover:shadow-[0_8px_30px_-10px_rgba(234,88,12,0.2)] hover:bg-white transition-all duration-300 flex flex-col overflow-hidden h-full ${bhajan.isPinned ? 'border-orange-300 bg-orange-50/30' : 'border-orange-100'}`}>
      
      {/* 📌 Pin Badge */}
      {bhajan.isPinned === 1 && (
        <div className="absolute top-0 right-5 sm:right-6 bg-orange-500 text-white px-3 py-1 rounded-b-xl shadow-sm text-[10px] font-bold tracking-widest uppercase flex items-center gap-1 z-20">
          <FaThumbtack /> Pinned
        </div>
      )}

      {/* Subtle Lotus Background */}
      <div className="absolute -bottom-6 -right-6 text-orange-500/5 pointer-events-none group-hover:scale-110 transition-transform duration-500 z-0">
        <GiLotusFlower size={120} />
      </div>

      <div className="relative z-10 flex-1 mt-3 sm:mt-2">
        <div className="flex items-start justify-between gap-3 mb-2">
          {/* 🌟 FIX: min-w-0 and flex-1 prevents long titles from pushing buttons out */}
          <h3 className="text-xl sm:text-2xl font-black font-hindi text-gray-900 leading-tight line-clamp-2 group-hover:text-orange-600 transition-colors min-w-0 flex-1 break-words pr-1">
            {bhajan.title}
          </h3>
          
          <div className="flex gap-1.5 sm:gap-2 shrink-0 mt-0.5">
            <button 
              onClick={() => onTogglePin(bhajan.slug, bhajan.isPinned || 0)}
              className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all active:scale-95 border shadow-sm shrink-0 ${bhajan.isPinned ? 'bg-orange-100 text-orange-600 border-orange-200' : 'bg-white text-gray-300 hover:text-orange-500 border-gray-100 hover:border-orange-100'}`}
              title={bhajan.isPinned ? "Unpin" : "Pin"}
            >
              <FaThumbtack size={12} className={bhajan.isPinned ? '' : '-rotate-45'} />
            </button>
            <button 
              onClick={() => onRemove(bhajan.slug)}
              className="text-gray-300 hover:text-red-500 bg-white hover:bg-red-50 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all active:scale-95 border border-gray-100 hover:border-red-100 shadow-sm shrink-0"
              title="Remove"
            >
              <FaTrash size={12} />
            </button>
          </div>
        </div>
        <p className="text-[10px] sm:text-[11px] font-bold text-orange-400 uppercase tracking-widest">
          Saved: {formattedDate}
        </p>
      </div>
      
      <div className="relative z-10 mt-5 pt-4 border-t border-orange-100/50 flex items-center justify-between">
        <Link 
          href={`/bhajan/${bhajan.slug}`} 
          className="text-white text-[12px] sm:text-[13px] font-black uppercase tracking-wider flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          पढ़ें <FaArrowRight size={11} />
        </Link>
        <button 
          onClick={handleShare}
          className="text-[#25D366] hover:bg-[#25D366]/10 px-3 py-2 sm:px-4 rounded-xl flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm font-bold transition-colors"
        >
          <FaWhatsapp size={16} className="sm:text-[18px]" /> <span className="hidden xs:inline">Share</span>
        </button>
      </div>
    </div>
  );
}