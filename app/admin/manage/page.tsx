"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase'; // Adjust path if needed
import { FaTrash, FaEdit, FaPlus, FaHands, FaTags, FaSearch, FaSyncAlt, FaImage, FaUserCircle } from 'react-icons/fa';
import { deleteItem } from '@/app/actions/manage'; // Adjust path if needed
import Link from 'next/link';
import Image from 'next/image';

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
    <div className="min-h-screen bg-gray-50/30 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto pb-20">
        
        {/* --- HEADER SECTION --- */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tighter mb-2">Site Metadata</h1>
            <p className="text-gray-500 font-medium text-lg">Manage, search, and edit your {activeTab}.</p>
          </div>
          
          <Link 
            href={activeTab === 'artists' ? "/admin/artists/new" : "/admin/upload"} 
            className="bg-orange-600 text-white px-8 py-4 rounded-xl font-black flex items-center gap-3 transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 active:scale-95"
          >
            <FaPlus size={16} /> Add New {activeTab === 'artists' ? 'Artist' : 'Record'}
          </Link>
        </header>

        {/* --- ACTION BAR: TABS & SEARCH --- */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
          
          {/* Tabs */}
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-gray-100 w-full lg:w-auto overflow-x-auto">
            <button
              onClick={() => setActiveTab('deities')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${
                activeTab === 'deities' ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100' : 'text-gray-500 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <FaHands size={16} /> Deities
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${
                activeTab === 'categories' ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100' : 'text-gray-500 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <FaTags size={16} /> Categories
            </button>
            <button
              onClick={() => setActiveTab('artists')}
              className={`flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all whitespace-nowrap text-sm ${
                activeTab === 'artists' ? 'bg-orange-50 text-orange-700 shadow-sm border border-orange-100' : 'text-gray-500 hover:bg-gray-50 border border-transparent'
              }`}
            >
              <FaUserCircle size={16} /> Artists
            </button>
          </div>

          {/* Search & Refresh */}
          <div className="flex items-center gap-3 w-full lg:w-[400px]">
            <div className="relative flex-1">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-gray-100 bg-white focus:bg-white focus:outline-none focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 transition-all font-medium text-sm shadow-sm"
              />
            </div>
            <button 
              onClick={handleRefresh}
              className="p-4 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all shadow-sm group"
              title="Refresh Data"
            >
              <FaSyncAlt className={`transition-transform duration-500 ${isRefreshing ? "animate-spin text-orange-600" : "group-hover:rotate-180"}`} />
            </button>
          </div>
        </div>

        {/* --- DATA TABLE --- */}
        <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-900/5 overflow-hidden flex flex-col">
          
          <div className="bg-gray-50/50 border-b border-gray-100 px-8 py-5 flex justify-between items-center">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
              {activeTab} Directory
            </span>
            <span className="bg-gray-200 text-gray-700 text-[10px] uppercase tracking-widest font-bold px-3 py-1.5 rounded-full">
              {filteredData.length} Records
            </span>
          </div>

          {loading ? (
            <div className="p-32 flex flex-col items-center justify-center text-gray-400">
              <FaSyncAlt className="animate-spin text-4xl mb-4 text-orange-400" />
              <span className="font-bold tracking-widest uppercase text-xs">Fetching records...</span>
            </div>
          ) : filteredData.length === 0 ? (
            <div className="p-32 text-center flex flex-col items-center">
              <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <FaSearch className="text-4xl text-gray-300" />
              </div>
              <p className="font-black text-2xl text-gray-900 tracking-tighter mb-2">No results found</p>
              <p className="text-gray-500 font-medium">Try adjusting your search query or add a new record.</p>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-white border-b border-gray-100">
                  <tr>
                    {(activeTab === 'deities' || activeTab === 'artists') && <th className="px-8 py-5 w-24"></th>}
                    <th className="px-8 py-5 text-[11px] font-bold uppercase text-gray-400 tracking-widest">Name (Hinglish & Hindi)</th>
                    {activeTab === 'artists' && <th className="px-8 py-5 text-[11px] font-bold uppercase text-gray-400 tracking-widest">Contact</th>}
                    <th className="px-8 py-5 text-[11px] font-bold uppercase text-gray-400 tracking-widest">URL Slug</th>
                    <th className="px-8 py-5 text-right text-[11px] font-bold uppercase text-gray-400 tracking-widest">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                      
                      {/* Image Column */}
                      {(activeTab === 'deities' || activeTab === 'artists') && (
                        <td className="px-8 py-5">
                          <div className="relative w-14 h-14 rounded-[1rem] overflow-hidden border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-300 shadow-sm group-hover:border-orange-200 transition-colors">
                            {item.image_url || item.profile_image_url ? (
                              <Image 
                                src={item.image_url || item.profile_image_url} 
                                alt={item.name_hinglish || 'Thumbnail'} 
                                fill
                                className="object-cover"
                                sizes="56px"
                              />
                            ) : (
                              activeTab === 'artists' ? <FaUserCircle size={28} className="relative z-10" /> : <FaImage size={24} className="relative z-10" />
                            )}
                          </div>
                        </td>
                      )}

                      <td className="px-8 py-5">
                        <div className="font-bold text-gray-900 text-lg mb-1">{item.name_hinglish}</div>
                        {/* 🌟 FIX: Applied font-hindi for crisp rendering */}
                        <div className="text-sm text-orange-600 font-bold font-hindi leading-tight">{item.name_hindi}</div>
                      </td>
                      
                      {/* Extra column just for Artists */}
                      {activeTab === 'artists' && (
                        <td className="px-8 py-5 text-sm text-gray-600 font-medium">
                           {item.phone ? <div>{item.phone}</div> : <span className="text-gray-300 italic">No Phone</span>}
                        </td>
                      )}
                      
                      <td className="px-8 py-5">
                        <span className="px-3 py-1.5 bg-gray-50 group-hover:bg-white text-gray-500 rounded-lg text-xs font-mono border border-transparent group-hover:border-gray-200 transition-colors shadow-sm inline-block">
                          /{item.slug}
                        </span>
                      </td>

                      <td className="px-8 py-5 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => router.push(`/admin/edit/${activeTab}/${item.id}`)}
                            className="p-3 bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md"
                            title="Edit Details"
                          >
                            <FaEdit size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(item.id, item.name_hinglish)}
                            className="p-3 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all shadow-sm hover:shadow-md"
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