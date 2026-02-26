import { supabase } from '../../utils/supabase';
import { createClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { 
  FaMusic, FaPrayingHands, FaFolderOpen, FaSearch, 
  FaEye, FaEdit, FaInbox, FaPlus 
} from 'react-icons/fa';
import DeleteButton from './DeleteButton';
import AdminSearch from './AdminSearch'; // <-- Import the new Search Bar!

// Next.js 15 requires searchParams to be a Promise
export default async function AdminDashboard({ 
  searchParams 
}: { 
  searchParams: Promise<{ q?: string }> 
}) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || '';

  // 1. Create a master admin client that bypasses RLS for Pending Submissions
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  // 2. Fetch overall platform statistics
  const { count: bhajanCount } = await supabase.from('bhajans').select('*', { count: 'exact', head: true });
  const { count: deityCount } = await supabase.from('deities').select('*', { count: 'exact', head: true });
  const { count: categoryCount } = await supabase.from('categories').select('*', { count: 'exact', head: true });
  const { count: pendingCount } = await supabaseAdmin.from('pending_bhajans').select('*', { count: 'exact', head: true });

  // 3. Smart Search Query for the Database
  let query = supabase
    .from('bhajans')
    .select('title_hindi, title_hinglish, slug, view_count, created_at')
    .order('created_at', { ascending: false })
    .limit(100); // Increased limit for easier management

  // If a search term exists, filter the database using .ilike (case-insensitive search)
  if (searchQuery) {
    query = query.or(`title_hindi.ilike.%${searchQuery}%,title_hinglish.ilike.%${searchQuery}%,slug.ilike.%${searchQuery}%`);
  }

  const { data: recentBhajans } = await query;

  return (
    <div className="max-w-7xl mx-auto space-y-10 mb-20 px-4 sm:px-6">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Command Center</h1>
          <p className="text-gray-500 mt-2 font-medium">Manage your content, users, and database from one place.</p>
        </div>
        
        {/* Future-Proof Quick Links */}
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/add-bhajan" className="bg-orange-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-orange-700 text-sm flex items-center gap-2 shadow-sm shadow-orange-600/20 transition-all hover:-translate-y-0.5">
            <FaPlus /> New Bhajan
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0">
            <FaMusic size={24} />
          </div>
          <div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Total Bhajans</p>
            <h2 className="text-3xl font-black text-gray-900 leading-none">{bhajanCount || 0}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
            <FaPrayingHands size={24} />
          </div>
          <div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Total Deities</p>
            <h2 className="text-3xl font-black text-gray-900 leading-none">{deityCount || 0}</h2>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6">
          <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0">
            <FaFolderOpen size={24} />
          </div>
          <div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Categories</p>
            <h2 className="text-3xl font-black text-gray-900 leading-none">{categoryCount || 0}</h2>
          </div>
        </div>

        {/* Pending Submissions Card - Now Clickable! */}
        <Link href="/admin/pending" className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-6 relative overflow-hidden group hover:border-purple-200 hover:shadow-md transition-all">
          {pendingCount && pendingCount > 0 ? (
            <div className="absolute top-0 right-0 w-16 h-16 bg-red-500 rotate-45 translate-x-8 -translate-y-8 group-hover:bg-red-600 transition-colors"></div>
          ) : null}
          <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
            <FaInbox size={24} />
          </div>
          <div>
            <p className="text-gray-500 font-bold text-xs uppercase tracking-wider mb-1">Submissions</p>
            <h2 className="text-3xl font-black text-gray-900 leading-none">{pendingCount || 0}</h2>
          </div>
        </Link>
      </div>

      {/* Database Management Table */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
        
        {/* Table Header & Search */}
        <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            Database 
            {searchQuery && <span className="text-sm font-medium text-orange-600 bg-orange-50 px-3 py-1 rounded-full">Results for "{searchQuery}"</span>}
          </h2>
          
          {/* SEARCH BAR COMPONENT */}
          <AdminSearch />
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-200">
                <th className="p-4 font-bold pl-6">Title (Hindi / Hinglish)</th>
                <th className="p-4 font-bold">URL Slug</th>
                <th className="p-4 font-bold text-right">Views</th>
                <th className="p-4 font-bold text-right">Date Added</th>
                <th className="p-4 font-bold text-center pr-6">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentBhajans?.map((bhajan) => (
                <tr key={bhajan.slug} className="hover:bg-orange-50/30 transition-colors group">
                  <td className="p-4 pl-6">
                    <div className="font-bold text-gray-900 text-base">{bhajan.title_hindi}</div>
                    <div className="text-sm text-gray-500">{bhajan.title_hinglish}</div>
                  </td>
                  <td className="p-4">
                    <span className="bg-gray-100 group-hover:bg-white text-gray-600 px-3 py-1 rounded-md text-xs font-mono border border-transparent group-hover:border-gray-200 transition-colors">
                      /{bhajan.slug}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5 text-gray-600 font-medium">
                      <FaEye className="text-gray-400" /> {bhajan.view_count || 0}
                    </div>
                  </td>
                  <td className="p-4 text-right text-gray-500 text-sm font-medium">
                    {new Date(bhajan.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric'
                    })}
                  </td>
                  
                  {/* ACTIONS COLUMN */}
                  <td className="p-4 pr-6 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <Link 
                        href={`/admin/edit-bhajan/${bhajan.slug}`} 
                        className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-orange-50 text-orange-600 hover:bg-orange-600 hover:text-white transition-all shadow-sm"
                        title="Edit Bhajan"
                      >
                        <FaEdit />
                      </Link>
                      
                      {/* DELETE BUTTON */}
                      <DeleteButton slug={bhajan.slug} title={bhajan.title_hindi} />
                    </div>
                  </td>
                </tr>
              ))}
              
              {(!recentBhajans || recentBhajans.length === 0) && (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <div className="inline-flex flex-col items-center justify-center text-gray-400">
                      <FaSearch className="text-4xl mb-4 text-gray-300" />
                      <p className="text-lg font-bold text-gray-500">No bhajans found.</p>
                      {searchQuery ? (
                        <p className="text-sm mt-1">Try adjusting your search query.</p>
                      ) : (
                        <p className="text-sm mt-1">Upload your first bhajan to get started!</p>
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