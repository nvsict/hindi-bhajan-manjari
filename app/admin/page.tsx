import { supabase } from '../../utils/supabase';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  FaMusic, FaPrayingHands, FaFolderOpen, FaSearch, 
  FaEye, FaEdit, FaInbox, FaPlus, FaExternalLinkAlt 
} from 'react-icons/fa';
import DeleteButton from './DeleteButton';
import AdminSearch from './AdminSearch'; 

export default async function AdminDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || '';

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  const { count: bhajanCount } = await supabase.from('bhajans').select('*', { count: 'exact', head: true });
  const { count: deityCount } = await supabase.from('deities').select('*', { count: 'exact', head: true });
  const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: pendingCount } = await supabaseAdmin.from('pending_bhajans').select('*', { count: 'exact', head: true });

  let query = supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, view_count, created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (searchQuery) {
    query = query.or(`title_hindi.ilike.%${searchQuery}%,title_hinglish.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
  }

  const { data: recentBhajans } = await query;

  return (
    <div className="max-w-7xl mx-auto space-y-10 py-10 mb-20 px-4 sm:px-6">
      
      {/* --- HEADER & QUICK ACTIONS --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5">
        <div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Command Center</h1>
          <p className="text-gray-500 font-medium text-lg">Manage your content, database, and analytics.</p>
        </div>
        <div className="flex flex-wrap items-center gap-4">
          <Link 
            href="/" 
            target="_blank"
            className="text-gray-500 hover:text-orange-600 font-bold text-sm flex items-center gap-2 transition-colors px-4 py-2"
          >
            View Live Site <FaExternalLinkAlt size={12} />
          </Link>
          <Link 
            href="/admin/add-bhajan" 
            className="bg-orange-600 text-white px-6 py-3.5 rounded-xl font-black hover:bg-orange-500 text-sm flex items-center gap-2 shadow-[0_4px_14px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] transition-all hover:-translate-y-0.5 active:scale-95"
          >
            <FaPlus /> New Bhajan
          </Link>
        </div>
      </div>

      {/* --- STATS GRID --- */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
            <FaMusic size={24} />
          </div>
          <div>
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-1">Total Bhajans</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{bhajanCount || 0}</h2>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
            <FaPrayingHands size={24} />
          </div>
          <div>
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-1">Deities Master</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{deityCount || 0}</h2>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 flex flex-col gap-4 group hover:-translate-y-1 transition-all duration-300">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
            <FaFolderOpen size={24} />
          </div>
          <div>
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-1">Categories</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">{categoryCount || 0}</h2>
          </div>
        </div>

        <Link 
          href="/admin/pending" 
          className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 flex flex-col gap-4 relative overflow-hidden group hover:border-red-200 hover:-translate-y-1 transition-all duration-300"
        >
          {pendingCount && pendingCount > 0 ? (
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 rotate-45 translate-x-12 -translate-y-12 group-hover:bg-red-600 transition-colors shadow-lg"></div>
          ) : null}
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-colors shadow-sm relative z-10">
            <FaInbox size={24} />
          </div>
          <div className="relative z-10">
            <p className="text-gray-400 font-bold text-[11px] uppercase tracking-widest mb-1">Pending Submissions</p>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
              {pendingCount || 0}
              {pendingCount && pendingCount > 0 ? (
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              ) : null}
            </h2>
          </div>
        </Link>

      </div>

      {/* --- DATABASE MANAGEMENT TABLE --- */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-900/5 overflow-hidden flex flex-col">
        
        {/* Table Header & Search */}
        <div className="p-6 md:p-8 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white">
          <div>
            <h2 className="text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
              Content Library 
              {searchQuery && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100">
                  Filtering: "{searchQuery}"
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-1">Recently added and updated bhajans.</p>
          </div>
          <div className="w-full md:w-auto">
            <AdminSearch />
          </div>
        </div>
        
        {/* Table Body */}
        <div className="w-full overflow-x-auto">
          <table className="w-full text-left border-collapse table-auto min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-100">
                <th className="p-5 font-bold pl-6 md:pl-8">Bhajan Title</th>
                <th className="p-5 font-bold">URL Slug</th>
                <th className="p-5 font-bold text-right">Views</th>
                <th className="p-5 font-bold text-right">Date Added</th>
                <th className="p-5 font-bold text-center pr-6 md:pr-8">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentBhajans?.map((bhajan) => (
                <tr key={bhajan.slug} className="hover:bg-orange-50/30 transition-colors group">
                  
                  <td className="p-5 pl-6 md:pl-8">
                    {/* 🌟 FIX: Applied font-hindi and tracking rules */}
                    <div className="font-bold text-gray-900 text-lg font-hindi leading-tight mb-1 truncate max-w-[300px]">
                      {bhajan.title_hindi}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate max-w-[300px]">
                      {bhajan.title_hinglish}
                    </div>
                  </td>
                  
                  <td className="p-5">
                    <div className="bg-gray-50 group-hover:bg-white text-gray-500 px-3 py-1.5 rounded-lg text-xs font-mono border border-transparent group-hover:border-gray-200 transition-colors truncate max-w-[200px] inline-block shadow-sm">
                      /{bhajan.slug}
                    </div>
                  </td>
                  
                  <td className="p-5 text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-600 font-bold text-sm">
                      <FaEye className="text-gray-400" /> {bhajan.view_count?.toLocaleString() || 0}
                    </div>
                  </td>
                  
                  <td className="p-5 text-right text-gray-500 text-xs font-bold uppercase tracking-wider">
                    {new Date(bhajan.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  
                  <td className="p-5 pr-6 md:pr-8 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <Link 
                        href={`/admin/edit-bhajan/${bhajan.slug}`} 
                        className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-md"
                        title="Edit Bhajan"
                      >
                        <FaEdit />
                      </Link>
                      <DeleteButton slug={bhajan.slug} title={bhajan.title_hindi} />
                    </div>
                  </td>

                </tr>
              ))}
              
              {/* Empty State */}
              {(!recentBhajans || recentBhajans.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-16 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-gray-400">
                      <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                        <FaSearch className="text-3xl text-gray-300" />
                      </div>
                      <p className="text-xl font-black text-gray-900 tracking-tighter mb-2">No bhajans found</p>
                      {searchQuery ? (
                        <p className="text-sm font-medium text-gray-500">We couldn't find anything matching "{searchQuery}".</p>
                      ) : (
                        <p className="text-sm font-medium text-gray-500">Your library is empty. Upload your first bhajan to get started!</p>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}