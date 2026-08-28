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

// 🌟 FIX: Force Next.js to render this dynamically because it relies on searchParams
export const dynamic = 'force-dynamic';

export default async function AdminDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || '';

  // 🌟 FIX: Only use the Admin Client for everything on this page.
  // This bypasses RLS safely on the server and prevents SSR hydration mismatches.
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } } // Faster for server-side fetches
  );

  let query = supabaseAdmin
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, view_count, created_at')
    .order('created_at', { ascending: false })
    .limit(50); // 🌟 OPTIMIZATION: Reduced to 50 for faster TTFB (Time to First Byte)

  if (searchQuery) {
    query = query.or(`title_hindi.ilike.%${searchQuery}%,title_hinglish.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
  }

  // 🌟 THE ULTIMATE SPEED FIX: All 5 database queries running in PARALLEL
  const [
    { count: bhajanCount },
    { count: deityCount },
    { count: categoryCount },
    { count: pendingCount },
    { data: recentBhajans }
  ] = await Promise.all([
    supabaseAdmin.from('bhajans').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('deities').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('categories').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('pending_bhajans').select('*', { count: 'exact', head: true }),
    query
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12 selection:bg-orange-100 selection:text-orange-900 w-full overflow-hidden">
      
      {/* ==========================================
          🚀 1. HERO COMMAND CENTER (Animated Mesh)
          ========================================== */}
      <div className="relative overflow-hidden bg-white p-8 md:p-10 lg:p-12 rounded-[2rem] border border-orange-100 shadow-[0_10px_40px_-15px_rgba(234,88,12,0.1)] w-full">
        {/* Animated Background Blobs */}
        <div className="absolute top-[-50%] right-[-10%] w-[400px] md:w-[600px] h-[400px] md:h-[600px] bg-gradient-to-br from-orange-400/20 to-red-400/10 blur-[80px] md:blur-[100px] rounded-full animate-[pulse_6s_ease-in-out_infinite]"></div>
        <div className="absolute bottom-[-30%] left-[-10%] w-[300px] md:w-[400px] h-[300px] md:h-[400px] bg-gradient-to-tr from-yellow-400/20 to-orange-500/10 blur-[60px] md:blur-[80px] rounded-full animate-[pulse_8s_ease-in-out_infinite_reverse]"></div>
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="flex items-start gap-5 md:gap-6">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl md:rounded-[1.5rem] flex items-center justify-center shrink-0 border border-orange-200 shadow-inner relative group cursor-default">
              <FaRocket className="text-2xl md:text-3xl text-orange-600 group-hover:-translate-y-1 md:group-hover:-translate-y-2 group-hover:scale-110 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]" />
              <div className="absolute -bottom-2 w-8 md:w-10 h-1.5 md:h-2 bg-orange-600/20 blur-md rounded-full group-hover:scale-150 transition-all duration-500"></div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter mb-1.5 md:mb-2">Command Center</h1>
              <p className="text-gray-500 font-medium text-sm md:text-base lg:text-lg flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                System Online. Operations nominal.
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full lg:w-auto">
            <Link 
              href="/" 
              target="_blank"
              className="flex-1 lg:flex-none text-center justify-center text-gray-600 hover:text-orange-600 font-bold text-sm flex items-center gap-2 transition-all px-5 py-3.5 bg-gray-50/80 hover:bg-orange-50 rounded-xl border border-gray-100 hover:border-orange-200 shadow-sm"
            >
              View Live Site <FaExternalLinkAlt size={12} />
            </Link>
            <Link 
              href="/admin/add-bhajan" 
              className="flex-1 lg:flex-none text-center justify-center bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 md:px-8 py-3.5 rounded-xl font-black text-sm flex items-center gap-3 shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] transition-all hover:-translate-y-0.5 active:scale-95 group relative overflow-hidden"
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* Stat 1: Total Bhajans */}
        <div className="group relative bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="w-12 h-12 md:w-14 md:h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors duration-500 shadow-sm relative z-10 mb-4 md:mb-6">
            <FaMusic size={20} className="md:text-2xl group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 font-bold text-[10px] md:text-[11px] uppercase tracking-widest mb-1">Total Bhajans</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">{bhajanCount || 0}</h2>
          </div>
        </div>

        {/* Stat 2: Deities */}
        <div className="group relative bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-blue-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors duration-500 shadow-sm relative z-10 mb-4 md:mb-6">
            <FaPrayingHands size={20} className="md:text-2xl group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 font-bold text-[10px] md:text-[11px] uppercase tracking-widest mb-1">Deities Master</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">{deityCount || 0}</h2>
          </div>
        </div>

        {/* Stat 3: Categories */}
        <div className="group relative bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-default">
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="w-12 h-12 md:w-14 md:h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500 shadow-sm relative z-10 mb-4 md:mb-6">
            <FaFolderOpen size={20} className="md:text-2xl group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="relative z-10">
            <p className="text-gray-500 font-bold text-[10px] md:text-[11px] uppercase tracking-widest mb-1">Categories</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter">{categoryCount || 0}</h2>
          </div>
        </div>

        {/* Stat 4: Pending (Radar Animated) */}
        <Link 
          href="/admin/pending" 
          className="group relative bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 overflow-hidden hover:-translate-y-1 md:hover:-translate-y-2 hover:border-red-200 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] block"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-transparent to-red-50/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          {pendingCount && pendingCount > 0 ? (
            <div className="absolute -right-8 -top-8 w-24 h-24 bg-red-500 rotate-45 group-hover:scale-110 group-hover:bg-red-600 transition-all duration-500 shadow-lg z-0 opacity-10"></div>
          ) : null}
          
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-colors duration-500 shadow-sm relative z-10 mb-4 md:mb-6 ${pendingCount && pendingCount > 0 ? 'bg-red-500 text-white' : 'bg-gray-50 text-gray-500 group-hover:bg-gray-100 group-hover:text-gray-600'}`}>
            <FaInbox size={20} className="md:text-2xl group-hover:scale-110 transition-transform duration-500" />
          </div>
          
          <div className="relative z-10">
            <p className={`font-bold text-[10px] md:text-[11px] uppercase tracking-widest mb-1 ${pendingCount && pendingCount > 0 ? 'text-red-600' : 'text-gray-500'}`}>Pending Subs.</p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 tracking-tighter flex items-center gap-3">
              {pendingCount || 0}
              {pendingCount && pendingCount > 0 && (
                <span className="flex h-2.5 w-2.5 md:h-3 md:w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-full w-full bg-red-500"></span>
                </span>
              )}
            </h2>
          </div>
        </Link>

      </div>

      {/* ==========================================
          📂 3. MAGIC DATA TABLE (Fully Responsive)
          ========================================== */}
      <div className="bg-white rounded-[1.5rem] md:rounded-[2rem] border border-gray-100 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.05)] overflow-hidden flex flex-col w-full">
        
        {/* Table Header & Search */}
        <div className="p-6 md:p-8 border-b border-gray-50 flex flex-col md:flex-row md:items-center justify-between gap-5 bg-white relative z-10">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter flex items-center gap-3 flex-wrap">
              Content Library 
              {searchQuery && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full border border-orange-100 animate-fade-in-up">
                  Filtering: "{searchQuery}"
                </span>
              )}
            </h2>
            <p className="text-xs md:text-sm text-gray-500 font-medium mt-1 md:mt-2">Recently added and updated bhajans.</p>
          </div>
          <div className="w-full md:w-80 relative z-20">
            {/* 🌟 WRAPPED ADMIN SEARCH IN SUSPENSE */}
            <Suspense fallback={<div className="w-full h-11 bg-gray-100 animate-pulse rounded-xl"></div>}>
              <AdminSearch />
            </Suspense>
          </div>
        </div>
        
        {/* 🌟 FIX: The crucial overflow wrappers that prevent the table from breaking the layout */}
        <div className="w-full overflow-hidden">
          <div className="w-full overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse min-w-[700px] whitespace-nowrap lg:whitespace-normal">
              <thead>
                <tr className="bg-gray-50/80 text-gray-500 text-[10px] md:text-[11px] uppercase tracking-widest border-b border-gray-100">
                  <th className="p-4 md:p-5 font-bold pl-6 md:pl-8 w-1/3">Bhajan Title</th>
                  <th className="p-4 md:p-5 font-bold w-1/3">URL Slug</th>
                  <th className="p-4 md:p-5 font-bold text-center">Views</th>
                  <th className="p-4 md:p-5 font-bold text-right">Date Added</th>
                  <th className="p-4 md:p-5 font-bold text-center pr-6 md:pr-8">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentBhajans?.map((bhajan) => (
                  <tr key={bhajan.slug} className="hover:bg-orange-50/40 transition-colors duration-200 group">
                    
                    <td className="p-4 md:p-5 pl-6 md:pl-8">
                      {/* 🌟 Truncation to keep table neat */}
                      <div className="font-bold text-gray-900 text-sm md:text-base font-hindi leading-tight mb-1 truncate max-w-[200px] lg:max-w-[300px] group-hover:text-orange-600 transition-colors">
                        {bhajan.title_hindi}
                      </div>
                      <div className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-gray-500 truncate max-w-[200px] lg:max-w-[300px]">
                        {bhajan.title_hinglish}
                      </div>
                    </td>
                    
                    <td className="p-4 md:p-5">
                      <div className="bg-gray-50 group-hover:bg-white text-gray-500 px-3 py-1.5 rounded-lg text-[11px] font-mono border border-gray-100 group-hover:border-orange-200 group-hover:text-orange-600 transition-all truncate max-w-[180px] lg:max-w-[250px] inline-block shadow-sm">
                        /{bhajan.slug}
                      </div>
                    </td>
                    
                    <td className="p-4 md:p-5 text-center">
                      <div className="inline-flex items-center justify-center gap-1.5 text-gray-600 font-bold text-xs md:text-sm bg-gray-50 px-2.5 py-1 rounded-md group-hover:bg-white transition-colors shadow-sm border border-gray-100">
                        <FaEye className="text-gray-400 group-hover:text-blue-500 transition-colors" size={12} /> 
                        {bhajan.view_count?.toLocaleString() || 0}
                      </div>
                    </td>
                    
                    <td className="p-4 md:p-5 text-right text-gray-500 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                      <div className="flex items-center justify-end gap-1.5">
                        <FaClock className="text-gray-300" size={12} />
                        {new Date(bhajan.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric', month: 'short', year: 'numeric'
                        })}
                      </div>
                    </td>
                    
                    <td className="p-4 md:p-5 pr-6 md:pr-8 text-center">
                      <div className="flex items-center justify-center gap-2 md:gap-3">
                        <CopyLinkButton slug={bhajan.slug} />
                        <Link 
                          href={`/admin/edit-bhajan/${bhajan.slug}`} 
                          className="inline-flex items-center justify-center w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all shadow-sm hover:shadow-[0_4px_10px_rgba(37,99,235,0.3)] hover:-translate-y-0.5 active:scale-95"
                          title="Edit Bhajan"
                        >
                          <FaEdit size={14} className="md:w-4 md:h-4" />
                        </Link>
                        <DeleteButton slug={bhajan.slug} title={bhajan.title_hindi} />
                      </div>
                    </td>

                  </tr>
                ))}
                
                {(!recentBhajans || recentBhajans.length === 0) && (
                  <tr>
                    <td colSpan={5} className="p-16 md:p-20 text-center">
                      <div className="inline-flex flex-col items-center justify-center text-gray-500 max-w-md mx-auto">
                        <div className="relative w-24 h-24 md:w-32 md:h-32 mb-6 flex justify-center items-center">
                          <div className="absolute inset-0 bg-orange-100 rounded-full blur-xl animate-pulse opacity-50"></div>
                          <svg className="w-16 h-16 md:w-24 md:h-24 text-gray-200 relative z-10 animate-[bounce_3s_ease-in-out_infinite]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          <div className="absolute bottom-0 w-12 md:w-16 h-1.5 md:h-2 bg-gray-200 blur-sm rounded-[100%] animate-[pulse_3s_ease-in-out_infinite]"></div>
                        </div>
                        <p className="text-xl md:text-2xl font-black text-gray-900 tracking-tighter mb-2 md:mb-3">No bhajans found</p>
                        {searchQuery ? (
                          <p className="text-sm md:text-base font-medium text-gray-500 leading-relaxed">
                            We couldn't find anything matching <span className="text-orange-600 font-bold bg-orange-50 px-2 py-1 rounded-md">"{searchQuery}"</span>. Try adjusting your search.
                          </p>
                        ) : (
                          <p className="text-sm md:text-base font-medium text-gray-500 leading-relaxed">
                            Your spiritual library is currently empty. Click the <strong>New Bhajan</strong> button to add your first composition!
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
    </div>
  );
}