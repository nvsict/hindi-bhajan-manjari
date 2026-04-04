import { supabase } from '../../utils/supabase';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Suspense } from 'react';
import { 
  FaMusic, FaPrayingHands, FaFolderOpen, FaSearch, 
  FaEye, FaEdit, FaInbox, FaPlus, FaExternalLinkAlt, FaRocket, FaClock 
} from 'react-icons/fa';
import DeleteButton from './DeleteButton';
import AdminSearch from './AdminSearch'; 
import CopyLinkButton from './CopyLinkButton'; 

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
    <div className="max-w-7xl mx-auto space-y-10 py-10 mb-20 px-4 sm:px-6 selection:bg-orange-100 selection:text-orange-900">
      
      {/* ==========================================
          🚀 1. HERO COMMAND CENTER (Animated Mesh)
          ========================================== */}
      <div className="relative overflow-hidden bg-white p-10 md:p-12 rounded-[2.5rem] border border-orange-100 shadow-[0_20px_60px_-15px_rgba(234,88,12,0.1)]">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-50%] right-[-10%] w-[600px] h-[600px] bg-gradient-to-br from-orange-400/20 to-red-400/10 blur-[100px] rounded-full animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[400px] h-[400px] bg-gradient-to-tr from-yellow-400/20 to-orange-500/10 blur-[80px] rounded-full animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-[1.5rem] flex items-center justify-center shrink-0 border border-orange-200 shadow-inner relative group cursor-default">
              <FaRocket className="text-3xl text-orange-600 group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" />
              <div className="absolute -bottom-2 w-10 h-2 bg-orange-600/20 blur-md rounded-full group-hover:scale-150 transition-all duration-500"></div>
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter mb-2">Command Center</h1>
              <p className="text-gray-500 font-medium text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Online. All systems operational.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link 
              href="/" 
              target="_blank"
              className="text-gray-500 hover:text-orange-600 font-bold text-sm flex items-center gap-2 transition-all px-5 py-3 bg-gray-50 hover:bg-orange-50 rounded-xl border border-transparent hover:border-orange-100"
            >
              View Live Site <FaExternalLinkAlt size={12} />
            </Link>
            <Link 
              href="/admin/add-bhajan" 
              className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-8 py-4 rounded-xl font-black text-sm flex items-center gap-3 shadow-[0_4px_20px_0_rgba(234,88,12,0.3)] hover:shadow-[0_8px_30px_rgba(234,88,12,0.4)] transition-all hover:-translate-y-1 active:scale-95 group overflow-hidden relative"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"></div>
              <FaPlus className="relative z-10 group-hover:rotate-90 transition-transform duration-500" /> 
              <span className="relative z-10">New Bhajan</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ==========================================
          📊 2. INTERACTIVE STATS GRID
          ========================================== */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* Stat 1: Total Bhajans */}
        <div className="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-orange-100/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500 shadow-sm relative z-10 mb-6">
            <FaMusic size={24} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest mb-1">Total Bhajans</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">{bhajanCount || 0}</h2>
          </div>
        </div>

        {/* Stat 2: Deities */}
        <div className="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-100/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-sm relative z-10 mb-6">
            <FaPrayingHands size={24} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest mb-1">Deities Master</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">{deityCount || 0}</h2>
          </div>
        </div>

        {/* Stat 3: Categories */}
        <div className="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-100/50 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
          
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500 shadow-sm relative z-10 mb-6">
            <FaFolderOpen size={24} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest mb-1">Categories</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">{categoryCount || 0}</h2>
          </div>
        </div>

        {/* Stat 4: Pending (Radar Animated) */}
        <Link 
          href="/admin/pending" 
          className="group relative bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden hover:-translate-y-2 hover:border-red-200 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {pendingCount && pendingCount > 0 ? (
            <>
              {/* Radar Rings Effect */}
              <div className="absolute top-10 left-10 w-20 h-20 border border-red-200 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite] opacity-75"></div>
              <div className="absolute top-10 left-10 w-20 h-20 border-2 border-red-100 rounded-full animate-[ping_3s_cubic-bezier(0,0,0.2,1)_infinite] opacity-50"></div>
              <div className="absolute -right-12 -top-12 w-32 h-32 bg-red-500 rotate-45 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-500 shadow-lg z-0"></div>
            </>
          ) : null}
          
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 shadow-sm relative z-10 mb-6 ${pendingCount && pendingCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-600'}`}>
            <FaInbox size={24} className="group-hover:scale-110 transition-transform duration-500" />
          </div>
          
          <div className="relative z-10">
            <p className={`font-bold text-[11px] uppercase tracking-widest mb-1 ${pendingCount && pendingCount > 0 ? 'text-red-600' : 'text-gray-500'}`}>Pending Submissions</p>
            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
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

      {/* ==========================================
          📂 3. MAGIC DATA TABLE
          ========================================== */}
      <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col">
        
        {/* Table Header & Search */}
        <div className="p-8 md:p-10 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white relative z-10">
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
              Content Library 
              {searchQuery && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 animate-fade-in-up">
                  Filtering: "{searchQuery}"
                </span>
              )}
            </h2>
            <p className="text-sm text-gray-500 font-medium mt-2">Recently added and updated bhajans in your database.</p>
          </div>
          <div className="w-full md:w-auto relative z-20">
            {/* 🌟 WRAPPED ADMIN SEARCH IN SUSPENSE */}
            <Suspense fallback={<div className="w-full md:w-80 h-12 bg-gray-100 animate-pulse rounded-2xl"></div>}>
              <AdminSearch />
            </Suspense>
          </div>
        </div>
        
        {/* Table Body */}
        <div className="w-full overflow-x-auto custom-scrollbar relative z-0">
          <table className="w-full text-left border-collapse table-auto min-w-[800px]">
            <thead>
              <tr className="bg-gray-50/50 text-gray-500 text-[11px] uppercase tracking-widest border-b border-gray-100">
                <th className="p-6 font-bold pl-8 md:pl-10 w-1/3">Bhajan Title</th>
                <th className="p-6 font-bold w-1/3">URL Slug</th>
                <th className="p-6 font-bold text-right">Views</th>
                <th className="p-6 font-bold text-right">Date Added</th>
                <th className="p-6 font-bold text-center pr-8 md:pr-10">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50/80">
              {recentBhajans?.map((bhajan) => (
                <tr key={bhajan.slug} className="hover:bg-orange-50/30 transition-colors duration-300 group">
                  
                  <td className="p-5 pl-8 md:pl-10">
                    <div className="font-bold text-gray-900 text-lg font-hindi leading-tight mb-1 truncate max-w-[300px] group-hover:text-orange-600 transition-colors">
                      {bhajan.title_hindi}
                    </div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate max-w-[300px]">
                      {bhajan.title_hinglish}
                    </div>
                  </td>
                  
                  <td className="p-5">
                    <div className="bg-gray-50 group-hover:bg-white text-gray-500 px-4 py-2 rounded-xl text-xs font-mono border border-gray-100 group-hover:border-orange-200 group-hover:text-orange-600 transition-all truncate max-w-[250px] inline-block shadow-sm">
                      /{bhajan.slug}
                    </div>
                  </td>
                  
                  <td className="p-5 text-right">
                    <div className="inline-flex items-center justify-end gap-2 text-gray-600 font-bold text-sm bg-gray-50 px-3 py-1.5 rounded-lg group-hover:bg-white transition-colors shadow-sm border border-gray-100">
                      <FaEye className="text-gray-500 group-hover:text-blue-500 transition-colors" /> 
                      {bhajan.view_count?.toLocaleString() || 0}
                    </div>
                  </td>
                  
                  <td className="p-5 text-right text-gray-500 text-xs font-bold uppercase tracking-wider">
                    <div className="flex items-center justify-end gap-2">
                      <FaClock className="text-gray-300" />
                      {new Date(bhajan.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </div>
                  </td>
                  
                  <td className="p-5 pr-8 md:pr-10 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {/* 🌟 NEW COPY LINK BUTTON */}
                      <CopyLinkButton slug={bhajan.slug} />

                      <Link 
                        href={`/admin/edit-bhajan/${bhajan.slug}`} 
                        className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-[0_4px_15px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:scale-95"
                        title="Edit Bhajan"
                      >
                        <FaEdit size={16} />
                      </Link>
                      <DeleteButton slug={bhajan.slug} title={bhajan.title_hindi} />
                    </div>
                  </td>

                </tr>
              ))}
              
              {/* ==========================================
                  🎨 4. CUSTOM "LOTTIE-STYLE" EMPTY STATE
                  ========================================== */}
              {(!recentBhajans || recentBhajans.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-20 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-gray-500 max-w-md mx-auto">
                      
                      {/* Animated SVG Illustration */}
                      <div className="relative w-32 h-32 mb-8 flex justify-center items-center">
                        <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl animate-pulse opacity-50"></div>
                        <svg className="w-24 h-24 text-gray-200 relative z-10 animate-[bounce_3s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        <div className="absolute bottom-0 w-16 h-2 bg-gray-200 blur-sm rounded-[100%] animate-[pulse_3s_ease-in-out_infinite]"></div>
                      </div>

                      <p className="text-2xl font-black text-gray-900 tracking-tighter mb-3">No bhajans found</p>
                      
                      {searchQuery ? (
                        <p className="text-base font-medium text-gray-500 leading-relaxed">
                          We couldn't find anything matching <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-md">"{searchQuery}"</span>. Try adjusting your search.
                        </p>
                      ) : (
                        <p className="text-base font-medium text-gray-500 leading-relaxed">
                          Your spiritual library is currently empty. Click the <strong>New Bhajan</strong> button above to add your first composition!
                        </p>
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