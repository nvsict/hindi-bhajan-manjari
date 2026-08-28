"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
// 🌟 FIX: यहाँ हमने सुरक्षित Server Actions को इम्पोर्ट किया है
import { toggleVicharStatusAction, deleteVicharAction } from '@/app/actions/vicharActions';
import { 
  FaPlus, 
  FaTrash, 
  FaPenToSquare, 
  FaEye, 
  FaEyeSlash, 
  FaMagnifyingGlass,
  FaListUl
} from 'react-icons/fa6';
import { FaSpinner, FaCheckCircle } from 'react-icons/fa';

export default function ManageMereVicharPage() {
  const [vichars, setVichars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Fetch all data on load (GET रिक्वेस्ट RLS में सेफ होती है)
  const fetchVichars = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('mere_vichar')
      .select('id, title_hindi, title_hinglish, slug, created_at, view_count, is_published')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching data:", error);
      showMessage('error', 'डेटा लाने में समस्या हुई!');
    } else {
      setVichars(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchVichars();
  }, []);

  // 2. Helper to show temp messages
  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  // 3. Toggle Publish/Draft Status (🌟 Upgraded to Server Action)
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    // Optimistic Update (UI को तुरंत बदलने के लिए ताकि यूज़र को इंतज़ार न करना पड़े)
    setVichars(vichars.map(v => v.id === id ? { ...v, is_published: !currentStatus } : v));
    
    // सुरक्षित रूप से बैकएंड कॉल
    const response = await toggleVicharStatusAction(id, currentStatus);

    if (!response.success) {
      // अगर सर्वर पर एरर आया, तो बदलाव वापस (Rollback) कर दें
      setVichars(vichars.map(v => v.id === id ? { ...v, is_published: currentStatus } : v));
      showMessage('error', `एरर: ${response.error || 'स्टेटस अपडेट नहीं हो पाया'}`);
    } else {
      showMessage('success', !currentStatus ? 'रचना लाइव हो गई!' : 'रचना ड्राफ्ट में डाल दी गई!');
    }
  };

  // 4. Delete Entry (🌟 Upgraded to Server Action)
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`⚠️ क्या आप सच में "${title}" को हमेशा के लिए डिलीट करना चाहते हैं?`)) {
      return;
    }

    // Optimistic Update: तुरंत UI से गायब करें
    const previousVichars = [...vichars];
    setVichars(vichars.filter(v => v.id !== id));

    // सुरक्षित रूप से बैकएंड कॉल
    const response = await deleteVicharAction(id);

    if (!response.success) {
      // अगर फेल हुआ तो लिस्ट में वापस ले आएं
      setVichars(previousVichars);
      showMessage('error', `डिलीट फेल: ${response.error || 'समस्या हुई'}`);
    } else {
      showMessage('success', 'रचना सफलतापूर्वक डिलीट कर दी गई!');
    }
  };

  // 5. Search Filter Logic
  const filteredVichars = vichars.filter(v => 
    v.title_hindi.includes(searchQuery) || 
    v.title_hinglish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    // 🌟 MATCHING UI: Premium Glassmorphism Container
    <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 mb-24">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-gray-100 pb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner shrink-0">
            <FaListUl />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Manage Vichar</h1>
            <p className="text-sm font-medium text-gray-500 mt-1">
              कुल रचनाएँ: <span className="font-bold text-orange-600">{vichars.length}</span> | Edit or remove your published poetry.
            </p>
          </div>
        </div>
        
        <Link 
          href="/admin/mere-vichar/add" 
          className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3.5 rounded-xl font-black text-sm flex items-center gap-2 shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 whitespace-nowrap"
        >
          <FaPlus /> New Vichar
        </Link>
      </div>

      {/* --- NOTIFICATIONS --- */}
      {message.text && (
        <div className={`p-4 mb-8 rounded-2xl font-bold flex items-center gap-3 transition-all animate-fade-in-up border ${
          message.type === 'error' 
            ? 'bg-red-50 text-red-600 border-red-100' 
            : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          {message.type === 'success' && <FaCheckCircle className="text-lg shrink-0" />}
          {message.text}
        </div>
      )}

      {/* --- SEARCH BAR --- */}
      <div className="relative mb-8 max-w-md">
        <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="हिंदी या Hinglish टाइटल से सर्च करें..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 focus:bg-white outline-none transition-all text-sm font-medium"
        />
      </div>

      {/* --- MAGIC DATA TABLE --- */}
      <div className="bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-[0_5px_20px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                <th className="p-5 pl-8 w-2/5">Title & Slug</th>
                <th className="p-5">Date</th>
                <th className="p-5 text-center">Views</th>
                <th className="p-5 text-center">Status</th>
                <th className="p-5 pr-8 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              
              {loading ? (
                /* Loading State */
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-orange-500">
                      <FaSpinner className="animate-spin text-4xl mb-4" />
                      <p className="font-bold text-sm tracking-widest uppercase">Fetching Data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredVichars.length === 0 ? (
                /* Empty / Not Found State */
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-gray-400">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                        <FaMagnifyingGlass className="text-3xl text-gray-300" />
                      </div>
                      <p className="font-black text-gray-800 text-xl mb-1">No Vichar Found</p>
                      <p className="text-sm">We couldn't find any data matching your search.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                /* Data Rows */
                filteredVichars.map((vichar) => (
                  <tr key={vichar.id} className="hover:bg-orange-50/40 transition-colors duration-300 group">
                    
                    {/* 1. Title Column */}
                    <td className="p-4 pl-8">
                      <div className="font-bold text-gray-900 font-hindi text-[17px] mb-1 group-hover:text-orange-600 transition-colors">
                        {vichar.title_hindi}
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">
                        {vichar.title_hinglish}
                      </div>
                    </td>
                    
                    {/* 2. Date Column */}
                    <td className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                      {new Date(vichar.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>

                    {/* 3. Views Column */}
                    <td className="p-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[3rem] bg-gray-50 border border-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold group-hover:bg-white group-hover:border-orange-200 transition-all">
                        <FaEye className="mr-1.5 text-gray-400" /> {vichar.view_count || 0}
                      </span>
                    </td>

                    {/* 4. Status Column */}
                    <td className="p-4 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                        vichar.is_published 
                          ? 'bg-green-50 text-green-600 border border-green-100' 
                          : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}>
                        {vichar.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>

                    {/* 5. Actions Column */}
                    <td className="p-4 pr-8 text-right">
                      <div className="flex items-center justify-end gap-2">
                        
                        {/* Toggle Status Button */}
                        <button 
                          onClick={() => handleTogglePublish(vichar.id, vichar.is_published)}
                          title={vichar.is_published ? "Unpublish (Make Draft)" : "Publish (Make Live)"}
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-50 text-gray-500 hover:bg-gray-800 hover:text-white transition-all shadow-sm hover:-translate-y-0.5 active:scale-95"
                        >
                          {vichar.is_published ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                        </button>
                        
                        {/* Edit Button */}
                        <Link 
                          href={`/admin/mere-vichar/edit/${vichar.id}`}
                          title="Edit"
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(37,99,235,0.3)] active:scale-95"
                        >
                          <FaPenToSquare size={14} />
                        </Link>
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(vichar.id, vichar.title_hindi)}
                          title="Delete"
                          className="w-10 h-10 flex items-center justify-center rounded-xl bg-red-50 text-red-500 hover:bg-red-600 hover:text-white transition-all shadow-sm hover:-translate-y-0.5 hover:shadow-[0_4px_10px_rgba(220,38,38,0.3)] active:scale-95"
                        >
                          <FaTrash size={14} />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}