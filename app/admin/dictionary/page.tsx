"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import { FaBookOpen, FaUpload, FaCheck, FaExclamationTriangle } from 'react-icons/fa';
import Papa from 'papaparse'; // CSV Parsing के लिए (npm install papaparse)

export default function DictionaryManager() {
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<{ total: number; inserted: number; updated: number; failed: number } | null>(null);
  const [error, setError] = useState('');

  // 🌟 HELPER: Slug Generator
  const generateSlug = (text: string) => {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleProcessData = async () => {
    if (!inputText.trim()) {
      setError("Please paste some data first!");
      return;
    }

    setIsProcessing(true);
    setError('');
    setResult(null);

    try {
      // 1. Parse CSV/TSV data automatically
      const parsedData = Papa.parse(inputText, {
        header: true,
        skipEmptyLines: true,
      });

      if (parsedData.errors.length > 0) {
        throw new Error("Invalid format. Ensure you have headers: word_hi, word_en, meaning_hi, meaning_en");
      }

      const rows = parsedData.data as any[];
      if (rows.length === 0) throw new Error("No valid rows found.");

      // 2. Prepare Data for Supabase
      const formattedData = rows.map(row => {
        // Validation check
        if (!row.word_hi) return null;

        return {
          word_hi: row.word_hi.trim(),
          word_en: row.word_en?.trim() || '',
          meaning_hi: row.meaning_hi?.trim() || '',
          meaning_en: row.meaning_en?.trim() || '',
          slug: generateSlug(row.word_en || row.word_hi)
        };
      }).filter(Boolean);

      // 3. 🌟 THE DUPLICACY FIX: Upsert Operation! 
      // onConflict: 'word_hi' (Ensure word_hi is set as UNIQUE in your Supabase table)
      const { data, error: dbError } = await supabase
        .from('dictionary')
        .upsert(formattedData, { 
          onConflict: 'word_hi', 
          ignoreDuplicates: false // False means it will UPDATE existing meanings instead of skipping
        })
        .select();

      if (dbError) throw new Error(dbError.message);

      // 4. Show Success Stats
      setResult({
        total: formattedData.length,
        inserted: data ? data.length : 0, // In bulk upsert, it's hard to distinguish exactly without complex queries, but we show success!
        updated: 0,
        failed: 0
      });
      
      setInputText(''); // Clear input after success

    } catch (err: any) {
      setError(`❌ Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4 sm:px-6">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
          <FaBookOpen size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tighter">Sanatan Shabdkosh (Dictionary)</h1>
          <p className="text-gray-500 font-medium mt-1">Bulk upload spiritual words. Duplicates will automatically update their meanings.</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5">
        
        {/* Format Instructions */}
        <div className="mb-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <h3 className="text-sm font-bold text-gray-700 mb-2">📋 Expected Format (Copy-paste from Excel/CSV):</h3>
          <p className="text-xs text-gray-500 font-mono mb-2">Must include these exact headers in the first row:</p>
          <code className="text-xs bg-white px-3 py-2 rounded-lg border border-gray-200 text-blue-600 block">
            word_hi, word_en, meaning_hi, meaning_en
          </code>
        </div>

        {/* Input Area */}
        <textarea
          rows={12}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="word_hi, word_en, meaning_hi, meaning_en&#10;अमृत, Amrit, अमरत्व देने वाला रस, Nectar of immortality..."
          className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-blue-500 font-mono text-sm mb-6"
        />

        {error && (
          <div className="p-4 mb-6 rounded-xl font-bold bg-red-50 text-red-600 flex items-center gap-2">
            <FaExclamationTriangle /> {error}
          </div>
        )}

        {result && (
          <div className="p-4 mb-6 rounded-xl font-bold bg-green-50 text-green-700 flex items-center gap-2">
            <FaCheck /> Successfully processed {result.total} words! Duplicates were updated.
          </div>
        )}

        <button
          onClick={handleProcessData}
          disabled={isProcessing || !inputText}
          className="w-full sm:w-auto px-10 py-4 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-3 shadow-md"
        >
          {isProcessing ? 'Processing...' : <><FaUpload /> Upload to Dictionary</>}
        </button>

      </div>
    </div>
  );
}