"use client";

import { useState, useEffect } from 'react';
import { db } from '@/utils/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { FaHeart, FaRegHeart, FaTimes, FaFolder, FaPlus } from 'react-icons/fa';

interface SaveProps {
  slug: string;
  title: string;
  // Phase 3 (Offline) के लिए हम बाकी डिटेल्स भी ले सकते हैं, अभी के लिए slug और title काफी है
}

export default function SaveToSangrahButton({ slug, title }: SaveProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');

  // 1. चेक करें कि क्या यह भजन पहले से सेव है?
  useEffect(() => {
    const checkStatus = async () => {
      const existing = await db.savedBhajans.get(slug);
      setIsSaved(!!existing);
    };
    checkStatus();
  }, [slug]);

  // 2. डेटाबेस से सारे यूनिक फोल्डर्स निकालें
  const existingFolders = useLiveQuery(async () => {
    const allItems = await db.savedBhajans.toArray();
    const uniqueFolders = new Set(allItems.map(i => i.folder));
    return ['All', ...Array.from(uniqueFolders).filter(f => f !== 'All')];
  }, []) || ['All'];

  // 3. सेव करने का मुख्य फंक्शन
  const handleSaveToFolder = async (folderName: string) => {
    try {
      await db.savedBhajans.put({
        slug,
        title,
        folder: folderName,
        isPinned: 0,
        addedAt: new Date().toISOString()
      });
      setIsSaved(true);
      setShowModal(false);
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  // 4. अगर पहले से सेव है, तो क्लिक करने पर रिमूव करें (Un-save)
  const handleToggle = async () => {
    if (isSaved) {
      await db.savedBhajans.delete(slug);
      setIsSaved(false);
    } else {
      // अगर सेव नहीं है, तो फोल्डर चुनने वाला पॉपअप दिखाएं
      setShowModal(true);
    }
  };

  const createAndSaveFolder = () => {
    if (newFolderName.trim()) {
      handleSaveToFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  return (
    <>
      {/* 🌟 The Heart Button */}
      <button 
        onClick={handleToggle}
        className={`w-12 h-12 flex items-center justify-center rounded-full transition-all active:scale-95 shadow-sm border ${
          isSaved 
            ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' 
            : 'bg-white text-gray-400 border-gray-100 hover:text-red-400 hover:border-red-100'
        }`}
        title={isSaved ? "संग्रह से हटाएं" : "संग्रह में सेव करें"}
      >
        {isSaved ? <FaHeart size={22} className="animate-in zoom-in" /> : <FaRegHeart size={22} />}
      </button>

      {/* 🌟 Folder Selection Modal (Bottom Sheet style for Mobile, Centered for Desktop) */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          
          <div className="bg-white w-full sm:max-w-md sm:rounded-[2rem] rounded-t-[2rem] p-6 sm:p-8 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300">
            
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-gray-900 font-hindi">कहाँ सेव करें?</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                <FaTimes />
              </button>
            </div>

            {/* List of existing folders */}
            <div className="space-y-3 max-h-[40vh] overflow-y-auto custom-scrollbar pr-2 mb-6">
              {existingFolders.map(folder => (
                <button 
                  key={folder}
                  onClick={() => handleSaveToFolder(folder)}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-orange-300 hover:bg-orange-50 transition-all group"
                >
                  <span className="flex items-center gap-3 font-bold text-gray-700 group-hover:text-orange-600">
                    <FaFolder className="text-orange-300 group-hover:text-orange-500" />
                    {folder}
                  </span>
                  <span className="text-xs font-bold text-orange-600 bg-white px-3 py-1 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    सेव करें
                  </span>
                </button>
              ))}
            </div>

            {/* Create New Folder Field */}
            <div className="pt-4 border-t border-gray-100">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">या नया फोल्डर बनाएं</p>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  placeholder="e.g. Morning Aarti"
                  className="flex-1 bg-gray-50 border border-gray-200 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 text-sm font-bold text-gray-700"
                  onKeyDown={(e) => e.key === 'Enter' && createAndSaveFolder()}
                />
                <button 
                  onClick={createAndSaveFolder}
                  disabled={!newFolderName.trim()}
                  className="bg-gray-900 hover:bg-black text-white w-12 h-12 flex items-center justify-center rounded-xl disabled:opacity-50 transition-all active:scale-95 shadow-md"
                >
                  <FaPlus />
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}