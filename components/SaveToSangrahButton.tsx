"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom'; // 🌟 Added Portal to escape toolbar trap
import { db } from '@/utils/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { FaHeart, FaRegHeart, FaTimes, FaFolder, FaPlus } from 'react-icons/fa';

interface SaveProps {
  slug: string;
  title: string;
}

export default function SaveToSangrahButton({ slug, title }: SaveProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [mounted, setMounted] = useState(false); // 🌟 Ensure portal only runs on client

  useEffect(() => {
    setMounted(true);
    const checkStatus = async () => {
      const existing = await db.savedBhajans.get(slug);
      setIsSaved(!!existing);
    };
    checkStatus();
  }, [slug]);

  const existingFolders = useLiveQuery(async () => {
    const allItems = await db.savedBhajans.toArray();
    const uniqueFolders = new Set(allItems.map(i => i.folder));
    return ['All', ...Array.from(uniqueFolders).filter(f => f !== 'All')];
  }, []) || ['All'];

  const handleSaveToFolder = async (folderName: string) => {
    try {
      // 1. Dexie DB में सेव करें (यह बहुत फ़ास्ट है, < 10ms)
      await db.savedBhajans.put({
        slug,
        title,
        folder: folderName,
        isPinned: 0,
        addedAt: new Date().toISOString()
      });

      // 2. 🌟 INSTANT UI UPDATE: डेटाबेस में सेव होते ही पॉपअप बंद कर दें
      setIsSaved(true);
      setShowModal(false);

      // 3. 🌟 BACKGROUND CACHING: इसे बैकग्राउंड में चुपचाप चलने दें (बिना await के)
      if ('caches' in window) {
        caches.open('bhajan-cache-v3').then((cache) => {
          // Promise.all लगा रहे हैं ताकि दोनों पैरेलल (parallel) डाउनलोड हों
          Promise.all([
            cache.add(window.location.pathname),
            cache.add(`${window.location.pathname}?_rsc`)
          ]).catch(err => console.log("Background caching skipped", err));
        });
      }

    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  const handleToggle = async () => {
    if (isSaved) {
      await db.savedBhajans.delete(slug);
      setIsSaved(false);
    } else {
      setShowModal(true);
    }
  };

  const createAndSaveFolder = () => {
    if (newFolderName.trim()) {
      handleSaveToFolder(newFolderName.trim());
      setNewFolderName('');
    }
  };

  // 🌟 The Modal UI
  const modalContent = (
    <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
      
      {/* Modal Card */}
      <div className="bg-white w-full sm:max-w-md sm:rounded-[2rem] rounded-t-[2.5rem] p-6 sm:p-8 shadow-2xl relative z-10 animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-300 max-h-[85vh] flex flex-col my-auto sm:my-0">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-5 shrink-0">
          <h3 className="text-xl font-black text-gray-900 font-hindi">कहाँ सेव करें?</h3>
          <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
            <FaTimes />
          </button>
        </div>

        {/* List of existing folders */}
        <div className="space-y-3 overflow-y-auto custom-scrollbar pr-1 mb-5 flex-1 max-h-[35vh]">
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
        <div className="pt-4 border-t border-gray-100 shrink-0">
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
              className="bg-gray-900 hover:bg-black text-white w-12 h-12 flex items-center justify-center rounded-xl disabled:opacity-50 transition-all active:scale-95 shadow-md shrink-0"
            >
              <FaPlus />
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <>
      <button 
        onClick={handleToggle}
        className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full transition-all active:scale-95 shadow-sm border shrink-0 ${
          isSaved 
            ? 'bg-red-50 text-red-500 border-red-100 hover:bg-red-100' 
            : 'bg-white text-gray-400 border-gray-100 hover:text-red-400 hover:border-red-100'
        }`}
        title={isSaved ? "संग्रह से हटाएं" : "संग्रह में सेव करें"}
      >
        {isSaved ? <FaHeart size={20} className="animate-in zoom-in" /> : <FaRegHeart size={20} />}
      </button>

      {/* 🌟 Magic Portal: Renders the modal outside the toolbar entirely */}
      {mounted && showModal && typeof document !== 'undefined' 
        ? createPortal(modalContent, document.body) 
        : null}
    </>
  );
}