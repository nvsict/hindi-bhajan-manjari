"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  FaBookOpen, FaUpload, FaCheck, FaExclamationTriangle, FaMagic, FaList, 
  FaDownload, FaFileDownload, FaPlus, FaSave, FaSearch, FaTimes, FaLayerGroup 
} from 'react-icons/fa';
import Papa from 'papaparse'; 
import { upsertDictionaryWords } from '@/app/actions/dictionary'; 

export default function DictionaryManager() {
  const [activeTab, setActiveTab] = useState<'studio' | 'bulk'>('studio');
  
  // Data State
  const [bhajans, setBhajans] = useState<any[]>([]);
  const [dictionaryWords, setDictionaryWords] = useState<Set<string>>(new Set());
  
  // Studio Selection & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  // Quick Add Form State
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [newWord, setNewWord] = useState({ word_hi: '', word_en: '', meaning_hi: '', meaning_en: '' });
  const [isSavingWord, setIsSavingWord] = useState(false);
  const [wordMsg, setWordMsg] = useState('');

  // Bulk State
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // 🌟 INITIAL FETCH
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: bData } = await supabase.from('bhajans').select('id, title_hindi, lyrics_hindi').order('created_at', { ascending: false });
    if (bData) setBhajans(bData);

    const { data: dData } = await supabase.from('dictionary').select('word_hi');
    if (dData) setDictionaryWords(new Set(dData.map(d => d.word_hi)));
  };

  // 🌟 SLUG GENERATOR
  const generateSlug = (word_hi: string, word_en: string) => {
    const cleanEn = (word_en || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const cleanHi = (word_hi || '').replace(/[^a-zA-Z0-9\u0900-\u097F]+/g, '-').replace(/(^-|-$)+/g, '');
    if (cleanEn && cleanHi) return `${cleanEn}-${cleanHi}`;
    return cleanEn || cleanHi; 
  };

  // 🌟 FILTERING & SELECTION LOGIC
  const filteredBhajans = useMemo(() => {
    return bhajans.filter(b => b.title_hindi.includes(searchQuery) || b.title_hindi.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [bhajans, searchQuery]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const selectedBhajansData = useMemo(() => {
    return bhajans.filter(b => selectedIds.has(b.id));
  }, [bhajans, selectedIds]);

  // 🌟 COVERAGE CALCULATOR
  const calculateCoverage = (lyrics: string) => {
    if (!lyrics) return 0;
    const words = lyrics.split(/\s+/).map(w => w.replace(/[.,!?'"(){}\[\]|;:\-\n\r]/g, '')).filter(Boolean);
    if (words.length === 0) return 0;
    const knownCount = words.filter(w => dictionaryWords.has(w)).length;
    return Math.round((knownCount / words.length) * 100);
  };

  // 🌟 BATCH EXPORT: Combined Lyrics
  const handleExportCombinedLyrics = () => {
    if (selectedBhajansData.length === 0) return;
    const combinedText = selectedBhajansData.map(b => `=== ${b.title_hindi} ===\n\n${b.lyrics_hindi}\n\n`).join('\n');
    const blob = new Blob([combinedText], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `Batch_${selectedBhajansData.length}_Bhajans_Lyrics.txt`;
    a.click();
  };

  // 🌟 BATCH EXPORT: Extract Unknown Words (The Magic Gap Finder)
  const handleExtractUnknownWords = () => {
    if (selectedBhajansData.length === 0) return;
    
    // Combine all lyrics
    const allLyrics = selectedBhajansData.map(b => b.lyrics_hindi).join('\n');
    // Extract unique words
    const allWords = allLyrics.split(/\s+/).map(w => w.replace(/[.,!?'"(){}\[\]|;:\-\n\r]/g, '').trim()).filter(Boolean);
    const uniqueWords = Array.from(new Set(allWords));
    
    // Find gaps
    const unknownWords = uniqueWords.filter(w => !dictionaryWords.has(w));
    
    // Create CSV Template
    const csvData = unknownWords.map(w => ({ word_hi: w, word_en: '', meaning_hi: '', meaning_en: '' }));
    const csv = Papa.unparse(csvData);
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = window.URL.createObjectURL(blob);
    a.download = `Missing_Words_Template.csv`;
    a.click();
  };

  // 🌟 QUICK ADD SUBMIT
  const handleSaveSingleWord = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word_hi || !newWord.meaning_hi) return;
    setIsSavingWord(true); setWordMsg('');

    try {
      const payload = {
        ...newWord,
        word_hi: newWord.word_hi.trim(),
        meaning_hi: newWord.meaning_hi.trim(),
        slug: generateSlug(newWord.word_hi, newWord.word_en)
      };

      const result = await upsertDictionaryWords([payload]);
      if (!result.success) throw new Error(result.error);

      setWordMsg('✅ Saved!');
      setDictionaryWords(prev => new Set(prev).add(payload.word_hi));
      
      setTimeout(() => {
        setWordMsg('');
        setShowQuickAdd(false);
      }, 1000);
    } catch (err: any) {
      setWordMsg(`❌ ${err.message}`);
    } finally {
      setIsSavingWord(false);
    }
  };

  // 🌟 BULK ACTIONS (Export/Import)
  const handleExportFullDictionary = async () => {
    setLoading(true);
    const { data } = await supabase.from('dictionary').select('word_hi, word_en, meaning_hi, meaning_en');
    if (data) {
      const csv = Papa.unparse(data);
      const a = document.createElement('a');
      a.href = window.URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
      a.download = `Full_Dictionary_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
    setLoading(false);
  };

  // 🌟 BULK IMPORT (With Smart Deduplication Fix)
  const handleBulkImport = async () => {
    if (!inputText.trim()) return;
    setLoading(true); setMsg({ type: '', text: '' });
    
    try {
      const parsed = Papa.parse(inputText, { header: true, skipEmptyLines: true });
      
      // 🚀 THE FIX: Remove duplicates from the pasted data BEFORE sending to Supabase
      const uniqueDataMap = new Map();

      parsed.data.forEach((row: any) => {
        if (row.word_hi && row.word_hi.trim()) {
          const cleanWordHi = row.word_hi.trim();
          
          // Map will automatically overwrite the old entry if a duplicate word_hi comes up
          uniqueDataMap.set(cleanWordHi, {
            ...row,
            word_hi: cleanWordHi,
            slug: generateSlug(cleanWordHi, row.word_en)
          });
        }
      });

      // Convert Map back to an Array
      const finalData = Array.from(uniqueDataMap.values());

      if (finalData.length === 0) throw new Error("No valid data found to upload.");

      // Send the clean, unique data to Server Action
      const result = await upsertDictionaryWords(finalData);
      
      if (!result.success) throw new Error(result.error);
      
      setMsg({ type: 'success', text: `Successfully processed ${finalData.length} unique words! (Duplicates ignored)` });
      setInputText('');
      fetchData();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 mb-20 relative">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Dictionary Command Center</h1>
          <p className="text-gray-500 font-medium">Smart workflows for Bhajans and Vocabulary.</p>
        </div>
        <div className="flex bg-gray-200 p-1.5 rounded-2xl shadow-inner">
          <button onClick={() => setActiveTab('studio')} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'studio' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Studio Mode</button>
          <button onClick={() => setActiveTab('bulk')} className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'bulk' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}>Bulk Actions</button>
        </div>
      </div>

      {activeTab === 'studio' ? (
        <div className="grid lg:grid-cols-12 gap-6 h-[750px]">
          
          {/* ==========================================
              LEFT: BHAJAN SELECTOR (Step 1)
              ========================================== */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50">
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Bhajans..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all text-sm font-bold"
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
              {filteredBhajans.map(b => (
                <label key={b.id} className={`flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all border ${selectedIds.has(b.id) ? 'bg-blue-50/50 border-blue-200' : 'border-transparent hover:bg-gray-50'}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedIds.has(b.id)}
                    onChange={() => toggleSelection(b.id)}
                    className="mt-1 w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />
                  <span className={`font-bold font-hindi text-lg leading-tight ${selectedIds.has(b.id) ? 'text-blue-900' : 'text-gray-700'}`}>{b.title_hindi}</span>
                </label>
              ))}
            </div>
            <div className="p-4 bg-gray-50 border-t border-gray-100 text-sm font-bold text-gray-500 text-center">
              {selectedIds.size} Selected
            </div>
          </div>

          {/* ==========================================
              RIGHT: DYNAMIC WORKSPACE (Step 2A / 2B)
              ========================================== */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden relative">
            
            {selectedIds.size === 0 && (
              <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center">
                <FaMagic className="text-5xl mb-4 opacity-20" />
                <h3 className="text-xl font-bold text-gray-700 mb-2">Workspace Empty</h3>
                <p>Check the box next to one or more bhajans to begin.</p>
              </div>
            )}

            {/* 🌟 STEP 2A: SINGLE SELECTION (DEEP DIVE) */}
            {selectedIds.size === 1 && selectedBhajansData[0] && (() => {
              const b = selectedBhajansData[0];
              const coverage = calculateCoverage(b.lyrics_hindi);
              return (
                <>
                  <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
                    <div>
                      <h2 className="font-black text-2xl text-gray-900 font-hindi">{b.title_hindi}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="w-32 h-2.5 bg-gray-200 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${coverage > 80 ? 'bg-green-500' : coverage > 40 ? 'bg-yellow-400' : 'bg-red-400'}`} style={{ width: `${coverage}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 uppercase tracking-wider">{coverage}% Coverage</span>
                      </div>
                    </div>
                    <button onClick={handleExportCombinedLyrics} className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all shrink-0">
                      <FaFileDownload /> Export .txt
                    </button>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto p-6 lg:p-10 bg-white font-hindi text-xl leading-[2.2] text-gray-700 custom-scrollbar">
                    {b.lyrics_hindi.split('\n').map((line: string, i: number) => (
                      <div key={i} className="mb-2 min-h-[1.5em]">
                        {line.split(' ').map((word: string, j: number) => {
                          const clean = word.replace(/[.,!?'"(){}\[\]|;:\-\n\r]/g, '');
                          const isKnown = dictionaryWords.has(clean);
                          return (
                            <span key={j}>
                              <span 
                                onClick={() => {
                                  if (!isKnown && clean.length > 1) {
                                    setNewWord({ word_hi: clean, word_en: '', meaning_hi: '', meaning_en: '' });
                                    setShowQuickAdd(true);
                                  }
                                }}
                                className={`transition-all rounded px-1 py-0.5 ${
                                  isKnown 
                                    ? 'bg-green-100 text-green-900 font-bold border-b-2 border-green-400 cursor-default' 
                                    : 'cursor-pointer hover:bg-blue-100 hover:text-blue-900 hover:shadow-sm'
                                }`}
                                title={isKnown ? 'Saved in Dictionary' : 'Click to Add'}
                              >
                                {word}
                              </span>
                              {' '}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </>
              );
            })()}

            {/* 🌟 STEP 2B: MULTI SELECTION (BATCH MODE) */}
            {selectedIds.size > 1 && (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-gray-50/30">
                <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6">
                  <FaLayerGroup className="text-4xl text-blue-500" />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Batch Processing</h2>
                <p className="text-gray-500 font-medium mb-10 max-w-md">
                  You have selected <strong className="text-blue-600 text-lg">{selectedIds.size} bhajans</strong>. Choose a batch action below to manage them instantly.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-xl">
                  {/* Action 1: Export Combined */}
                  <div onClick={handleExportCombinedLyrics} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-blue-300 cursor-pointer transition-all group text-left">
                    <FaFileDownload className="text-2xl text-gray-400 group-hover:text-blue-500 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-1">Export Combined Lyrics</h3>
                    <p className="text-xs text-gray-500">Packages all selected songs into a single .txt file for AI context.</p>
                  </div>

                  {/* Action 2: Extract Unknowns (Gap Finder) */}
                  <div onClick={handleExtractUnknownWords} className="bg-white border border-gray-200 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-orange-300 cursor-pointer transition-all group text-left">
                    <FaMagic className="text-2xl text-gray-400 group-hover:text-orange-500 mb-4" />
                    <h3 className="font-bold text-gray-900 mb-1">Extract Unknown Words</h3>
                    <p className="text-xs text-gray-500">Scans all songs and downloads a CSV template of words missing from the dictionary.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* ==========================================
           AREA 2: BULK ACTIONS (Database Admin)
           ========================================== */
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-sm max-w-4xl mx-auto">
          
          {/* Workflow 1: Export */}
          <div className="mb-10 pb-10 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900 mb-2">Workflow 1: Backup & Export</h2>
            <p className="text-sm text-gray-500 mb-6">Download your entire dictionary database as a spreadsheet.</p>
            <button onClick={handleExportFullDictionary} disabled={loading} className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-bold flex items-center gap-3 shadow-md transition-all active:scale-95">
              <FaDownload /> Export Full Dictionary (CSV)
            </button>
          </div>

          {/* Workflow 2: Import */}
          <div>
            <h2 className="text-xl font-black text-gray-900 mb-2">Workflow 2: Mass Update & Import</h2>
            <p className="text-sm text-gray-500 mb-6">Paste data from your spreadsheet (Excel/Google Sheets) to add or update words instantly.</p>
            
            <div className="mb-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
              <p className="text-[11px] font-bold text-blue-800 uppercase tracking-widest mb-2">Required First Row Headers:</p>
              <code className="text-xs bg-white px-3 py-1.5 rounded border border-blue-200 text-blue-600 font-mono">
                word_hi, word_en, meaning_hi, meaning_en
              </code>
            </div>

            <textarea 
              rows={8} 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              className="w-full p-5 bg-gray-50 border border-gray-200 rounded-2xl mb-4 font-mono text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all custom-scrollbar" 
              placeholder="word_hi, word_en, meaning_hi, meaning_en&#10;अमृत, Amrit, अमरत्व देने वाला रस, Nectar of immortality..."
            />
            
            <button onClick={handleBulkImport} disabled={loading || !inputText.trim()} className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black shadow-[0_4px_20px_rgba(37,99,235,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed">
               {loading ? 'Processing Data...' : 'Run Bulk Import'}
            </button>

            {msg.text && (
              <div className={`mt-6 p-5 rounded-xl font-bold flex items-center gap-3 ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {msg.type === 'success' ? <FaCheck className="text-xl" /> : <FaExclamationTriangle className="text-xl" />}
                {msg.text}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: QUICK ADD (Step 2A Inline Add)
          ========================================== */}
      {showQuickAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={() => setShowQuickAdd(false)} />
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="font-black text-lg text-gray-900 flex items-center gap-2"><FaPlus className="text-blue-500"/> Quick Add Word</h3>
              <button onClick={() => setShowQuickAdd(false)} className="text-gray-400 hover:text-gray-900 transition-colors p-2"><FaTimes /></button>
            </div>
            
            <form onSubmit={handleSaveSingleWord} className="p-6 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Word (Hindi) *</label>
                <input required type="text" value={newWord.word_hi} onChange={(e) => setNewWord({...newWord, word_hi: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-hindi text-lg transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Word (English)</label>
                <input type="text" value={newWord.word_en} onChange={(e) => setNewWord({...newWord, word_en: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Meaning (Hindi) *</label>
                <textarea required rows={2} value={newWord.meaning_hi} onChange={(e) => setNewWord({...newWord, meaning_hi: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none font-hindi text-sm transition-all" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Meaning (English)</label>
                <textarea rows={2} value={newWord.meaning_en} onChange={(e) => setNewWord({...newWord, meaning_en: e.target.value})} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all" />
              </div>

              {wordMsg && <div className={`text-center text-sm font-bold mt-2 ${wordMsg.includes('❌') ? 'text-red-500' : 'text-green-600'}`}>{wordMsg}</div>}
              
              <button type="submit" disabled={isSavingWord || !newWord.word_hi} className="w-full mt-2 py-4 bg-gray-900 hover:bg-black text-white font-black rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg active:scale-95">
                {isSavingWord ? 'Saving...' : <><FaSave /> Save to Dictionary</>}
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}