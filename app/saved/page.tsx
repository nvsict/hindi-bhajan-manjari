"use client";

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/utils/db'; 
import { FaHeart, FaArrowRight, FaPrayingHands, FaSadTear, FaFolder, FaFolderPlus, FaTimes } from 'react-icons/fa';
import SmartRecommendations from '@/components/SmartRecommendations';

import SangrahControls from '@/components/SangrahControls';
import SangrahCard from '@/components/SangrahCard';
import SangrahStats from '@/components/SangrahStats';
import RecentHistory from '@/components/RecentHistory';

export default function SavedBhajansPage() {
  const [isMounted, setIsMounted] = useState(false);
  
  // 🌟 UI States
  const [activeFolder, setActiveFolder] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'a-z'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // 🌟 Custom Modal States
  const [showFolderModal, setShowFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // 1. 🌟 AUTO-MIGRATION (LocalStorage -> Dexie)
  useEffect(() => {
    const migrateData = async () => {
      const oldData = localStorage.getItem('bhajan_favorites');
      if (oldData) {
        try {
          const parsed = JSON.parse(oldData);
          for (const b of parsed) {
            const exists = await db.savedBhajans.get(b.slug);
            if (!exists) {
              await db.savedBhajans.put({
                slug: b.slug,
                title: b.title,
                folder: 'All', 
                isPinned: 0,
                addedAt: b.addedAt || new Date().toISOString()
              });
            }
          }
          localStorage.removeItem('bhajan_favorites'); 
        } catch (e) {
          console.error("Migration Error:", e);
        }
      }
      setIsMounted(true);
    };
    migrateData();
  }, []);

  // 2. 🌟 FETCH ALL DATA FROM DEXIE
  const allSavedBhajans = useLiveQuery(() => db.savedBhajans.toArray(), []) || [];

  // 3. 🌟 EXTRACT UNIQUE FOLDERS FOR TABS
  const folders = useMemo(() => {
    const dbFolders = Array.from(new Set(allSavedBhajans.map(b => b.folder)));
    const finalFolders = ['All', ...dbFolders.filter(f => f !== 'All')];
    if (activeFolder !== 'All' && !finalFolders.includes(activeFolder)) {
      finalFolders.push(activeFolder);
    }
    return finalFolders;
  }, [allSavedBhajans, activeFolder]);

  // 4. 🌟 FILTER & SORT LOGIC
  const processedBhajans = useMemo(() => {
    let result = [...allSavedBhajans];

    if (activeFolder !== 'All') {
      result = result.filter(b => b.folder === activeFolder);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(b => b.title.toLowerCase().includes(query));
    }

    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
      if (sortBy === 'oldest') return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
      if (sortBy === 'a-z') return a.title.localeCompare(b.title, 'hi');
      return 0;
    });

    // Pinned Always on Top
    result.sort((a, b) => (b.isPinned || 0) - (a.isPinned || 0));

    return result;
  }, [allSavedBhajans, activeFolder, searchQuery, sortBy]);

  // 🌟 Extract slugs for Smart Recommendations
  const savedSlugsList = useMemo(() => allSavedBhajans.map(b => b.slug), [allSavedBhajans]);

  // 5. 🌟 ACTIONS
  const handleRemove = async (slug: string) => {
    await db.savedBhajans.delete(slug);
  };

  const handleTogglePin = async (slug: string, currentPinStatus: number) => {
    await db.savedBhajans.update(slug, { isPinned: currentPinStatus === 1 ? 0 : 1 });
  };

  const saveNewFolder = () => {
    if (newFolderName.trim() !== '') {
      setActiveFolder(newFolderName.trim());
      setShowFolderModal(false);
      setNewFolderName('');
    }
  };

  const handleExport = () => {
    if (processedBhajans.length === 0) return;
    let textContent = `🙏 मेरा संग्रह (${activeFolder}) 🙏\n`;
    textContent += "----------------------------------------\n\n";
    processedBhajans.forEach((bhajan, index) => {
      textContent += `${index + 1}. ${bhajan.title}\n   लिंक: ${window.location.origin}/bhajan/${bhajan.slug}\n\n`;
    });
    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Sangrah_${activeFolder}_${new Date().toISOString().split('T')[0]}.txt`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 to-[#faf9f8] py-10 md:py-16 relative">
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 text-red-500 rounded-[1.25rem] flex items-center justify-center rotate-3 shadow-sm shrink-0 border border-red-50">
            <FaHeart size={28} className="drop-shadow-sm" />
          </div>
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tight font-hindi">मेरा संग्रह</h1>
            <p className="text-gray-500 font-medium mt-1">आपकी सहेजी गई पसंदीदा भजनों की सूची।</p>
          </div>
        </div>

        {/* 🌟 Dashboard Stats & History */}
        {isMounted && allSavedBhajans.length > 0 && (
          <>
            <SangrahStats />
            <RecentHistory />
          </>
        )}

        {/* Skeleton / Initial Load */}
        {!isMounted ? (
          <div className="grid sm:grid-cols-2 gap-4 md:gap-6">
            {[1, 2].map((s) => (
              <div key={s} className="bg-white/50 p-6 rounded-[2rem] border border-gray-100 shadow-sm animate-pulse h-[180px]"></div>
            ))}
          </div>
        ) : allSavedBhajans.length === 0 ? (
          
          /* Total Empty State */
          <div className="bg-white/80 backdrop-blur-lg p-12 md:p-16 rounded-[3rem] border border-orange-100/50 shadow-sm text-center flex flex-col items-center">
            <div className="w-28 h-28 bg-gradient-to-br from-orange-50 to-orange-100 rounded-full flex items-center justify-center mb-6">
              <FaPrayingHands className="text-6xl text-orange-500 drop-shadow-sm" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-3 tracking-tight font-hindi">आपका संग्रह खाली है</h2>
            <p className="text-gray-500 mb-8 max-w-md font-medium leading-relaxed">
              भजनों को सेव करें और बिना इंटरनेट के कभी भी यहाँ पढ़ें।
            </p>
            <Link href="/" className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-full font-bold shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:-translate-y-0.5 transition-all flex items-center gap-3">
              भजन खोजें <FaArrowRight />
            </Link>
          </div>
          
        ) : (
          
          <div className="space-y-6">
            
            {/* Folder Tabs */}
            <div className="flex items-center gap-3 overflow-x-auto pb-4 custom-scrollbar">
              {folders.map(folder => (
                <button
                  key={folder}
                  onClick={() => setActiveFolder(folder)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all whitespace-nowrap border-2 ${
                    activeFolder === folder 
                    ? 'bg-orange-500 text-white border-orange-500 shadow-md' 
                    : 'bg-white text-gray-600 border-gray-100 hover:border-orange-200 hover:bg-orange-50'
                  }`}
                >
                  <FaFolder className={activeFolder === folder ? 'text-white' : 'text-orange-300'} /> 
                  {folder}
                </button>
              ))}
              <button 
                onClick={() => setShowFolderModal(true)} 
                className="flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm bg-gray-900 text-white hover:bg-black transition-all whitespace-nowrap ml-2 shadow-md"
              >
                <FaFolderPlus /> नया फोल्डर
              </button>
            </div>

            {/* Controls (Search, Sort, Export, View Toggle) */}
            <SangrahControls 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              sortBy={sortBy}
              setSortBy={setSortBy}
              viewMode={viewMode}
              setViewMode={setViewMode}
              onExport={handleExport}
              totalItems={processedBhajans.length}
            />

            {/* Grid or List View Render (FIXED SYNTAX HERE) */}
            {processedBhajans.length > 0 ? (
              <div className={viewMode === 'grid' ? "grid sm:grid-cols-2 gap-5 md:gap-6 animate-in fade-in" : "flex flex-col gap-4 animate-in fade-in"}>
                {processedBhajans.map((bhajan) => (
                  <SangrahCard 
                    key={bhajan.slug} 
                    bhajan={bhajan} 
                    onRemove={handleRemove} 
                    onTogglePin={handleTogglePin}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            ) : (
              /* Empty Folder / No Search Results */
              <div className="text-center py-16 bg-white/50 backdrop-blur-sm rounded-[2rem] border border-gray-100">
                <FaSadTear className="mx-auto text-4xl text-gray-300 mb-3" />
                <h3 className="text-xl font-bold text-gray-800">यहाँ कुछ नहीं मिला</h3>
                <p className="text-gray-500 mt-1">शायद आपने इस फोल्डर में अभी तक कुछ सेव नहीं किया है।</p>
              </div>
            )}

            {/* 🌟 NEW: SMART RECOMMENDATIONS 🌟 */}
            <SmartRecommendations savedSlugs={savedSlugsList} />
          </div>
        )}
      </main>

      {/* 🌟 BEAUTIFUL CUSTOM FOLDER MODAL */}
      {showFolderModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowFolderModal(false)}></div>
          
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200 border border-orange-100">
            <button onClick={() => setShowFolderModal(false)} className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
              <FaTimes />
            </button>
            
            <div className="w-20 h-20 bg-orange-100 text-orange-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <FaFolderPlus size={32} />
            </div>
            
            <h3 className="text-2xl font-black text-center text-gray-900 mb-2 font-hindi">नया फोल्डर बनाएं</h3>
            <p className="text-sm text-center text-gray-500 mb-8 font-medium">अपने भजनों को व्यवस्थित करने के लिए एक नाम दें।</p>
            
            <input 
              type="text" 
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              placeholder="जैसे: Morning Aarti, Shiv Ji..."
              className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-2xl mb-6 focus:outline-none focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500 transition-all font-bold text-gray-800 text-center"
              onKeyDown={(e) => e.key === 'Enter' && saveNewFolder()}
            />
            
            <button 
              onClick={saveNewFolder}
              disabled={!newFolderName.trim()}
              className="w-full py-4 rounded-2xl font-black text-white bg-gradient-to-r from-orange-600 to-orange-500 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
            >
              फोल्डर बनाएं
            </button>
          </div>
        </div>
      )}
    </div>
  );
}