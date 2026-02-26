"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase'; // Adjust path if needed
import { FaTrash, FaEdit, FaPlus, FaHands, FaTags, FaSearch, FaSyncAlt, FaImage, FaUserCircle } from 'react-icons/fa';
import { deleteItem } from '@/app/actions/manage'; // Adjust path if needed
import Link from 'next/link';
import Image from 'next/image'; // 🌟 1. Imported Next.js Image

// 🌟 Added 'artists' to the TabType
type TabType = 'deities' | 'categories' | 'artists';

export default function MetadataManagePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('deities');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    const { data: result, error } = await supabase
      .from(activeTab)
      .select('*')
      .order('created_at', { ascending: false });
    
    if (!error) setData(result || []);
    setLoading(false);
    setIsRefreshing(false);
  };

  useEffect(() => {
    setSearchQuery(""); // Reset search when switching tabs
    fetchData();
  }, [activeTab]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to delete "${name}"? \n\nWarning: This might affect bhajans linked to it. This action cannot be undone.`)) {
      if (activeTab === 'artists') {
        const { error } = await supabase.from('artists').delete().eq('id', id);
        if (!error) fetchData();
        else alert("Error deleting artist: " + error.message);
      } else {
        const res = await deleteItem(activeTab, id);
        if (res.success) fetchData();
        else alert("Error: " + res.error);
      }
    }
  };

  const filteredData = data.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.name_hinglish?.toLowerCase().includes(query) ||
      item.name_hindi?.includes(query) ||
      item.slug?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Site Metadata</h1>
            <p className="text-slate-500 font-medium mt-1">Manage, search, and edit your {activeTab}.</p>
          </div>
          
          <Link 
            href={activeTab === 'artists' ? "/admin/artists/new" : "/admin/upload"} 
            className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95"
          >
            <FaPlus size={14} /> Add New {activeTab === 'artists' ? 'Artist' : 'Record'}
          </Link>
        </header>

        {/* Action Bar: Tabs & Search */}
        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-6">
          
          {/* Tabs */}
          <div className="flex bg-white p-1.5 rounded-xl shadow-sm border border-slate-200 w-full lg:w-fit overflow-x-auto">
            <button
              onClick={() => setActiveTab('deities')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'deities' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FaHands size={18} /> Deities
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'categories' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FaTags size={18} /> Categories
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all whitespace-nowrap ${
                activeTab === 'artists' ? 'bg-orange-100 text-orange-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
              }`}
            >
              <FaUserCircle size={18} /> Artists
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-3 w-full lg:w-96">
            <div className="relative flex-1">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input 
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
              />
            </div>
            <button 
              onClick={handleRefresh}
              className="p-3.5 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm"
              title="Refresh Data"
            >
              <FaSyncAlt className={isRefreshing ? "animate-spin text-orange-600" : ""} />
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
          
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <span className="text-sm font-bold text-slate-600 uppercase tracking-wider">
              {activeTab} Directory
            </span>
            <span className="bg-slate-200 text-slate-700 text-xs font-bold px-3 py-1 rounded-full">
              {filteredData.length} Records
            </span>
          </div>

          {loading ? (
            <div className="p-20 flex flex-col items-center justify-center text-slate-400">
              <FaSyncAlt className="animate-spin text-3xl mb-4 text-orange-300" />
              <span className="font-medium">Fetching records...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-20 text-center text-slate-500 flex flex-col items-center">
              <FaSearch className="text-5xl text-slate-200 mb-4" />
              <p className="font-bold text-lg text-slate-700">No results found.</p>
              <p className="text-sm mt-1">Try adjusting your search query or add a new record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead className="bg-white border-b border-slate-100">
                  <tr>
                    {(activeTab === 'deities' || activeTab === 'artists') && <th className="px-6 py-4 w-20">Image</th>}
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Name (Hinglish & Hindi)</th>
                    {activeTab === 'artists' && <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Contact</th>}
                    <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">URL Slug</th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase text-slate-400 tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                      
                      {/* Image Column for Deities AND Artists */}
                      {(activeTab === 'deities' || activeTab === 'artists') && (
                        <td className="px-6 py-4">
                          {/* 🌟 2. Added 'relative' class to parent wrapper */}
                          <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-slate-100 bg-slate-50 flex items-center justify-center text-slate-300 shadow-sm group-hover:border-orange-200 transition-colors">
                            {item.image_url || item.profile_image_url ? (
                              // 🌟 3. Implemented Next.js Image component
                              <Image 
                                src={item.image_url || item.profile_image_url} 
                                alt={item.name_hinglish || 'Thumbnail'} 
                                fill
                                className="object-cover"
                                sizes="48px" // Matches the w-12 (48px) size perfectly
                              />
                            ) : (
                              // 🌟 4. Ensured fallback icons stay visible above the background
                              activeTab === 'artists' ? <FaUserCircle size={24} className="relative z-10" /> : <FaImage size={20} className="relative z-10" />
                            )}
                          </div>
                        </td>
                      )}

                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-base">{item.name_hinglish}</div>
                        <div className="text-sm text-orange-600 font-semibold">{item.name_hindi}</div>
                      </td>
                      
                      {/* Extra column just for Artists */}
                      {activeTab === 'artists' && (
                        <td className="px-6 py-4 text-sm text-slate-500">
                           {item.phone ? <div>{item.phone}</div> : <span className="italic text-slate-300">No Phone</span>}
                        </td>
                      )}
                      
                      <td className="px-6 py-4">
                        <span className="px-3 py-1.5 bg-slate-100 text-slate-600 rounded-md text-xs font-mono border border-slate-200">
                          /{item.slug}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => router.push(`/admin/edit/${activeTab}/${item.id}`)}
                            className="p-2.5 bg-white border border-slate-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 rounded-lg transition-all shadow-sm"
                            title="Edit Details"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.name_hinglish)}
                            className="p-2.5 bg-white border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-lg transition-all shadow-sm"
                            title="Delete"
                          >
                            <FaTrash size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}