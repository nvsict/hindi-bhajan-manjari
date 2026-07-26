"use client";

import { FaSearch, FaSortAmountDown, FaFileDownload, FaThLarge, FaListUl } from 'react-icons/fa';

interface SangrahControlsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  sortBy: 'newest' | 'oldest' | 'a-z';
  setSortBy: (sort: 'newest' | 'oldest' | 'a-z') => void;
  onExport: () => void;
  totalItems: number;
  viewMode: 'grid' | 'list';
  setViewMode: (mode: 'grid' | 'list') => void;
}

export default function SangrahControls({
  searchQuery, setSearchQuery, sortBy, setSortBy, onExport, totalItems, viewMode, setViewMode
}: SangrahControlsProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl p-4 md:p-5 rounded-3xl border border-orange-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      
      <div className="relative w-full md:w-auto flex-1 max-w-md">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-orange-400" />
        <input 
          type="text" 
          placeholder="भजन खोजें (Search your bhajans)..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-orange-50/50 border border-orange-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 focus:bg-white transition-all text-sm font-medium text-gray-700"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        <div className="relative flex-1 md:flex-none">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'a-z')}
            className="w-full appearance-none pl-4 pr-10 py-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700 focus:outline-none focus:border-orange-400 cursor-pointer shadow-sm"
          >
            <option value="newest">सबसे नए (Newest)</option>
            <option value="oldest">सबसे पुराने (Oldest)</option>
            <option value="a-z">A से Z (A-Z)</option>
          </select>
          <FaSortAmountDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        </div>

        {/* 🌟 View Toggle */}
        <div className="flex bg-gray-100 p-1 rounded-2xl shrink-0">
          <button 
            onClick={() => setViewMode('grid')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FaThLarge size={16} />
          </button>
          <button 
            onClick={() => setViewMode('list')}
            className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            <FaListUl size={16} />
          </button>
        </div>

        <button 
          onClick={onExport}
          disabled={totalItems === 0}
          className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
        >
          <FaFileDownload /> <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
}