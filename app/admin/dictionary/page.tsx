"use client";

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/utils/supabase';
import { upsertDictionaryWords } from '@/app/actions/dictionary'; // 🌟 Server Action Import

import { 
  FaUpload, FaDownload, FaFileDownload, FaSearch, 
  FaCheckSquare, FaRegSquare, FaChartPie, FaPlus, FaTimes, FaInfoCircle
} from 'react-icons/fa';
import Papa from 'papaparse';
export default function DictionaryManager() {
  const [activeTab, setActiveTab] = useState<'studio' | 'bulk'>('studio');
  const [bhajans, setBhajans] = useState<any[]>([]);
  const [dictionaryWords, setDictionaryWords] = useState<Set<string>>(new Set());
  
  // Smart States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quickAddWord, setQuickAddWord] = useState<string | null>(null);
  const [newWordData, setNewWordData] = useState({ word_hi: '', word_en: '', meaning_hi: '', meaning_en: '' });
  
  // Bulk States
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: bData } = await supabase.from('bhajans').select('id, title_hindi, lyrics_hindi').order('created_at', { ascending: false });
    if (bData) setBhajans(bData);

    const { data: dData } = await supabase.from('dictionary').select('word_hi');
    if (dData) setDictionaryWords(new Set(dData.map(d => d.word_hi)));
  };

  // --- STUDIO MODE LOGIC ---

  const filteredBhajans = useMemo(() => {
    return bhajans.filter(b => b.title_hindi.includes(searchQuery));
  }, [bhajans, searchQuery]);

  const selectedBhajansList = useMemo(() => {
    return bhajans.filter(b => selectedIds.has(b.id));
  }, [bhajans, selectedIds]);

  const toggleSelection = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredBhajans.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredBhajans.map(b => b.id)));
    }
  };

  const calculateCoverage = (lyrics: string) => {
    if (!lyrics) return 0;
    const words = lyrics.split(/[\s\n]+/).map(w => w.replace(/[.,!?'"(){}\[\]|;:\-\n\r]/g, '')).filter(Boolean);
    if (words.length === 0) return 0;
    const known = words.filter(w => dictionaryWords.has(w)).length;
    return ((known / words.length) * 100).toFixed(1);
  };

  const handleExportSelectedLyrics = () => {
    if (selectedBhajansList.length === 0) return;
    const combinedText = selectedBhajansList.map(b => 
      `--- TITLE: ${b.title_hindi} ---\n${b.lyrics_hindi}\n\n`
    ).join('');

    const blob = new Blob([combinedText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Batch_Lyrics_Export_${selectedBhajansList.length}_files.txt`;
    a.click();
  };

  const handleExtractMissingWords = () => {
    const missing = new Set<string>();
    selectedBhajansList.forEach(b => {
      b.lyrics_hindi.split(/[\s\n]+/).forEach((w: string) => {
        const clean = w.replace(/[.,!?'"(){}\[\]|;:\-\n\r]/g, '');
        if (clean && !dictionaryWords.has(clean)) missing.add(clean);
      });
    });

    const csvContent = Array.from(missing).map(word => `${word},,,`).join('\n');
    const header = "word_hi,word_en,meaning_hi,meaning_en\n";
    
    const blob = new Blob([header + csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Missing_Words_Template.csv`;
    a.click();
  };

  const handleQuickAddWord = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const payload = {
      ...newWordData,
      slug: newWordData.word_hi.toLowerCase().replace(/[^a-z0-9]+/g, '-')
    };

    const { error } = await supabase.from('dictionary').upsert([payload], { onConflict: 'word_hi' });
    
    if (!error) {
      setDictionaryWords(prev => new Set(prev).add(newWordData.word_hi));
      setQuickAddWord(null);
      setNewWordData({ word_hi: '', word_en: '', meaning_hi: '', meaning_en: '' });
    }
    setLoading(false);
  };

  // --- BULK ACTIONS LOGIC ---

  const handleExportDictionary = async () => {
    setLoading(true);
    const { data } = await supabase.from('dictionary').select('word_hi, word_en, meaning_hi, meaning_en');
    if (data) {
      const csv = Papa.unparse(data);
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sanatan_dictionary_${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    }
    setLoading(false);
  };

  // --- BULK ACTIONS LOGIC ---

  const handleImport = async () => {
    if (!inputText.trim()) {
      setMsg({ type: 'error', text: 'Please paste some CSV data first.' });
      return;
    }
    
    setLoading(true);
    setMsg({ type: '', text: '' });
    
    try {
      // 1. Parse CSV
      const parsed = Papa.parse(inputText, { header: true, skipEmptyLines: true });
      
      // 2. Filter out invalid rows and auto-generate slugs
      const finalData = parsed.data
        .filter((row: any) => row.word_hi && row.word_hi.trim() !== '')
        .map((row: any) => ({
          ...row,
          slug: row.word_hi.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        }));

      if (finalData.length === 0) {
        throw new Error("No valid data found. Ensure your CSV has a 'word_hi' column.");
      }

      // 🌟 3. Call Server Action (No Supabase client needed here)
      const result = await upsertDictionaryWords(finalData);

      // 4. Handle Server Response
      if (!result.success) {
        throw new Error(result.error || 'Failed to update dictionary via server.');
      }

      setMsg({ type: 'success', text: `Successfully processed ${finalData.length} words via Server Action! Duplicates were merged.` });
      setInputText('');
      fetchData(); // Refresh the dictionary set on the UI
      
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'An error occurred during import.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-10 px-4">
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Dictionary Studio</h1>
          <p className="text-gray-500">Manage spiritual words & prepare content for AI processing.</p>
        </div>
        <div className="flex bg-gray-200 p-1.5 rounded-xl">
          <button 
            onClick={() => setActiveTab('studio')} 
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'studio' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Studio Mode
          </button>
          <button 
            onClick={() => setActiveTab('bulk')} 
            className={`px-6 py-2.5 rounded-lg font-bold transition-all ${activeTab === 'bulk' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
          >
            Bulk Actions
          </button>
        </div>
      </div>

      {/* TAB VIEWS */}
      {activeTab === 'studio' ? (
        
        /* ---------------- STUDIO MODE ---------------- */
        <div className="grid lg:grid-cols-12 gap-6 h-[750px]">
          {/* LEFT PANEL: Selection & Search */}
          <div className="lg:col-span-4 bg-white rounded-3xl border border-gray-100 flex flex-col shadow-sm overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="relative mb-3">
                <FaSearch className="absolute left-3 top-3 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search bhajans..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="flex justify-between items-center text-sm font-bold text-gray-600 px-1">
                <button onClick={toggleSelectAll} className="hover:text-blue-600 transition-colors">
                  {selectedIds.size === filteredBhajans.length && filteredBhajans.length > 0 ? 'Deselect All' : 'Select All'}
                </button>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-md">{selectedIds.size} selected</span>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {filteredBhajans.map(b => (
                <div key={b.id} 
                  className={`flex items-center gap-3 p-3 rounded-xl transition-all cursor-pointer ${selectedIds.has(b.id) ? 'bg-blue-50 border border-blue-100' : 'hover:bg-gray-50 border border-transparent'}`}
                  onClick={() => toggleSelection(b.id)}
                >
                  <button className="text-blue-600 text-lg flex-shrink-0">
                    {selectedIds.has(b.id) ? <FaCheckSquare /> : <FaRegSquare className="text-gray-300" />}
                  </button>
                  <span className={`font-bold flex-1 truncate ${selectedIds.has(b.id) ? 'text-blue-900' : 'text-gray-700'}`}>{b.title_hindi}</span>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: Workspace */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-gray-100 p-6 flex flex-col shadow-sm relative overflow-hidden">
            
            {/* Multi-Select View */}
            {selectedIds.size > 1 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center text-4xl mb-2">
                  <FaChartPie />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-gray-900 mb-3">{selectedIds.size} Bhajans Selected</h2>
                  <p className="text-gray-500 max-w-md mx-auto">You are in batch processing mode. Choose an action below to process multiple files at once.</p>
                </div>
                <div className="flex gap-4 mt-4">
                  <button onClick={handleExportSelectedLyrics} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-md">
                    <FaFileDownload /> Export Combined Lyrics
                  </button>
                  <button onClick={handleExtractMissingWords} className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-md">
                    <FaDownload /> Extract Unknown Words CSV
                  </button>
                </div>
              </div>
            ) : selectedIds.size === 1 ? (
              
              /* Single Select View */
              <>
                <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-100">
                  <div>
                    <h2 className="font-black text-2xl text-gray-900">{selectedBhajansList[0].title_hindi}</h2>
                    <span className="inline-flex items-center gap-1.5 mt-2 px-3 py-1 bg-green-100 text-green-800 text-sm font-bold rounded-full">
                      <FaChartPie /> {calculateCoverage(selectedBhajansList[0].lyrics_hindi)}% Dictionary Coverage
                    </span>
                  </div>
                  <button onClick={handleExportSelectedLyrics} className="flex items-center gap-2 bg-gray-900 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-800 transition-all">
                    <FaFileDownload /> Export .txt
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-6 bg-gray-50 rounded-2xl border border-gray-100 font-hindi text-lg leading-relaxed text-gray-700 shadow-inner">
                   {selectedBhajansList[0].lyrics_hindi.split('\n').map((line: string, i: number) => (
                      <div key={i} className="mb-2">
                        {line.split(' ').map((word: string, j: number) => {
                          const clean = word.replace(/[.,!?'"(){}\[\]|;:\-\n\r]/g, '');
                          const isKnown = dictionaryWords.has(clean);
                          return (
                            <span 
                              key={j} 
                              onClick={() => {
                                if (!isKnown && clean) {
                                  setQuickAddWord(clean);
                                  setNewWordData({ word_hi: clean, word_en: '', meaning_hi: '', meaning_en: '' });
                                }
                              }}
                              className={`transition-all rounded px-0.5 ${isKnown ? 'bg-green-200 text-green-900 font-bold border-b-2 border-green-500' : 'cursor-pointer hover:bg-red-100 hover:text-red-700 border-b border-transparent hover:border-red-400'}`}
                              title={isKnown ? 'In Dictionary' : 'Click to add to dictionary'}
                            >
                              {word}{' '}
                            </span>
                          );
                        })}
                      </div>
                    ))}
                </div>

                {/* Inline Add Word Modal */}
                {quickAddWord && (
                  <div className="absolute bottom-6 left-6 right-6 bg-white shadow-[0_0_40px_rgba(0,0,0,0.1)] rounded-2xl p-6 border border-gray-100 z-10 transition-all">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="font-bold text-gray-900 flex items-center gap-2 text-lg">
                        <span className="bg-blue-100 p-2 rounded-lg text-blue-600"><FaPlus size={14}/></span> 
                        Add Word: <span className="text-blue-600 ml-1">{quickAddWord}</span>
                      </h3>
                      <button onClick={() => setQuickAddWord(null)} className="p-2 bg-gray-100 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                        <FaTimes />
                      </button>
                    </div>
                    <form onSubmit={handleQuickAddWord} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input required placeholder="English Transliteration (e.g. Ram)" value={newWordData.word_en} onChange={e => setNewWordData({...newWordData, word_en: e.target.value})} className="p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      <input required placeholder="Meaning in English" value={newWordData.meaning_en} onChange={e => setNewWordData({...newWordData, meaning_en: e.target.value})} className="p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      <input placeholder="Meaning in Hindi (Optional)" value={newWordData.meaning_hi} onChange={e => setNewWordData({...newWordData, meaning_hi: e.target.value})} className="p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all" />
                      <button type="submit" disabled={loading} className="bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:opacity-50 transition-all shadow-md">
                        {loading ? 'Saving...' : 'Save to Dictionary'}
                      </button>
                    </form>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4 text-gray-400">
                <FaCheckSquare className="text-6xl text-gray-200 mb-2" />
                <p className="text-lg font-medium text-gray-500">Select a bhajan from the left to inspect.</p>
              </div>
            )}
          </div>
        </div>

      ) : (

        /* ---------------- BULK ACTIONS MODE ---------------- */
        <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
          
          {/* EXPORT CARD */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <div>
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center text-2xl mb-6">
                <FaDownload />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-3">Export Database</h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                Download your entire spiritual dictionary as a standard CSV file. You can use this for external backups, sharing with translators, or editing in Excel/Google Sheets before re-uploading.
              </p>
            </div>
            
            <button 
              onClick={handleExportDictionary} 
              disabled={loading} 
              className="w-full px-6 py-4 bg-green-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-green-700 transition-all shadow-md disabled:opacity-50"
            >
              <FaFileDownload /> Export Full Dictionary (CSV)
            </button>
          </div>

          {/* IMPORT CARD */}
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl">
                <FaUpload />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900">Bulk Import Data</h2>
                <p className="text-sm text-gray-500">Paste CSV data to update or add words.</p>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-6 flex items-start gap-3">
              <FaInfoCircle className="text-blue-500 mt-1 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-bold mb-1">Required CSV Header Format:</p>
                <code className="bg-white px-2 py-1 rounded text-blue-700 block text-xs">word_hi, word_en, meaning_hi, meaning_en</code>
                <p className="mt-2 text-xs opacity-80">Existing Hindi words will be updated; new ones will be added.</p>
              </div>
            </div>

            <textarea 
              rows={6} 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              className="w-full p-4 border border-gray-200 rounded-xl mb-4 font-mono text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none" 
              placeholder="word_hi,word_en,meaning_hi,meaning_en&#10;राम,Ram,भगवान,God"
            ></textarea>
            
            <button 
              onClick={handleImport} 
              disabled={loading || !inputText.trim()} 
              className="w-full px-6 py-4 bg-gray-900 text-white rounded-xl font-black hover:bg-gray-800 transition-all shadow-md disabled:opacity-50"
            >
               {loading ? 'Processing Data...' : 'Run Bulk Import'}
            </button>

            {msg.text && (
              <div className={`mt-4 p-4 rounded-xl font-bold text-sm animate-fade-in-up ${msg.type === 'error' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                {msg.text}
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}