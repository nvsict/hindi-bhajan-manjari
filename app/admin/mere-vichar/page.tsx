"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { supabase } from '@/utils/supabase';
import { 
  FaPlus, 
  FaTrash, 
  FaPenToSquare, 
  FaEye, 
  FaEyeSlash, 
  FaMagnifyingGlass,
  FaSpinner
} from 'react-icons/fa6';

export default function ManageMereVicharPage() {
  const [vichars, setVichars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  // 1. Fetch all data on load
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

  // 3. Toggle Publish/Draft Status
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('mere_vichar')
      .update({ is_published: !currentStatus })
      .eq('id', id);

    if (error) {
      showMessage('error', 'स्टेटस अपडेट नहीं हो पाया!');
    } else {
      // Optimistic UI Update
      setVichars(vichars.map(v => v.id === id ? { ...v, is_published: !currentStatus } : v));
      showMessage('success', !currentStatus ? 'रचना पब्लिश हो गई!' : 'रचना ड्राफ्ट में डाल दी गई!');
    }
  };

  // 4. Delete Entry
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`क्या आप सच में "${title}" को डिलीट करना चाहते हैं? यह वापस नहीं आएगा!`)) {
      return;
    }

    const { error } = await supabase
      .from('mere_vichar')
      .delete()
      .eq('id', id);

    if (error) {
      showMessage('error', 'डिलीट करने में समस्या हुई!');
    } else {
      setVichars(vichars.filter(v => v.id !== id));
      showMessage('success', 'रचना सफलतापूर्वक डिलीट कर दी गई!');
    }
  };

  // 5. Search Filter Logic
  const filteredVichars = vichars.filter(v => 
    v.title_hindi.includes(searchQuery) || 
    v.title_hinglish.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100 mb-20">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Manage Vichar</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">
            कुल रचनाएँ: {vichars.length} | यहाँ से अपनी रचनाओं को एडिट या डिलीट करें
          </p>
        </div>
        
        <Link 
          href="/admin/mere-vichar/add" 
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
        >
          <FaPlus /> Add New Vichar
        </Link>
      </div>

      {/* --- NOTIFICATIONS --- */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-xl font-bold border ${message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-600 border-green-100'}`}>
          {message.text}
        </div>
      )}

      {/* --- SEARCH BAR --- */}
      <div className="relative mb-6">
        <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
        <input 
          type="text" 
          placeholder="हिंदी या Hinglish टाइटल से सर्च करें..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-orange-500 focus:bg-white transition-colors"
        />
      </div>

      {/* --- DATA TABLE --- */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wide">Title</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wide">Date</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wide text-center">Views</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wide text-center">Status</th>
                <th className="p-4 text-sm font-bold text-gray-600 uppercase tracking-wide text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium">
                    <div className="flex items-center justify-center gap-2">
                      <FaSpinner className="animate-spin text-orange-500" size={20} /> डेटा लोड हो रहा है...
                    </div>
                  </td>
                </tr>
              ) : filteredVichars.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500 font-medium bg-gray-50/50">
                    कोई रचना नहीं मिली।
                  </td>
                </tr>
              ) : (
                filteredVichars.map((vichar) => (
                  <tr key={vichar.id} className="border-b border-gray-100 hover:bg-orange-50/30 transition-colors group">
                    
                    {/* 1. Title Column */}
                    <td className="p-4">
                      <div className="font-bold text-gray-900 font-hindi text-lg">{vichar.title_hindi}</div>
                      <div className="text-sm text-gray-500">{vichar.title_hinglish}</div>
                    </td>
                    
                    {/* 2. Date Column */}
                    <td className="p-4 text-sm font-medium text-gray-600">
                      {new Date(vichar.created_at).toLocaleDateString('hi-IN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </td>

                    {/* 3. Views Column */}
                    <td className="p-4 text-center">
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-bold">
                        {vichar.view_count || 0}
                      </span>
                    </td>

                    {/* 4. Status Column */}
                    <td className="p-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                        vichar.is_published 
                          ? 'bg-green-100 text-green-700 border border-green-200' 
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}>
                        {vichar.is_published ? 'Live' : 'Draft'}
                      </span>
                    </td>

                    {/* 5. Actions Column */}
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                        
                        {/* Toggle Status Button */}
                        <button 
                          onClick={() => handleTogglePublish(vichar.id, vichar.is_published)}
                          title={vichar.is_published ? "Unpublish (Make Draft)" : "Publish (Make Live)"}
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
                        >
                          {vichar.is_published ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        
                        {/* Edit Button (Link to an edit page if you create one later) */}
                        <Link 
                          href={`/admin/mere-vichar/edit/${vichar.id}`}
                          title="Edit"
                          className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white transition-colors"
                        >
                          <FaPenToSquare />
                        </Link>
                        
                        {/* Delete Button */}
                        <button 
                          onClick={() => handleDelete(vichar.id, vichar.title_hindi)}
                          title="Delete"
                          className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-500 hover:text-white transition-colors"
                        >
                          <FaTrash />
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