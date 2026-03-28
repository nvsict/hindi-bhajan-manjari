import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import Link from 'next/link';
import { FaTrash, FaCheckCircle, FaUser, FaClock, FaArrowLeft } from 'react-icons/fa';

export default async function PendingSubmissionsPage() {
  // 1. Master admin client to read the locked table
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );

  // Fetch all pending requests, newest first
  const { data: pendingBhajans } = await supabaseAdmin
    .from('pending_bhajans')
    .select('*')
    .order('created_at', { ascending: false });

  // 2. SECURE SERVER ACTION: Deletes a rejected submission
  async function deleteSubmission(formData: FormData) {
    'use server';
    const id = formData.get('id');
    const adminDb = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );
    
    await adminDb.from('pending_bhajans').delete().eq('id', id);
    
    // Tell Next.js to refresh the page and the dashboard counts
    revalidatePath('/admin/pending');
    revalidatePath('/admin'); 
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 mb-20 px-4 sm:px-6">
      
      <div className="flex items-center gap-4">
        <Link href="/admin" className="w-10 h-10 bg-white border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:text-orange-600 hover:border-orange-200 shadow-sm transition-all">
          <FaArrowLeft />
        </Link>
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">Pending Submissions</h1>
          <p className="text-gray-500 mt-1 font-medium">Review and approve community contributions.</p>
        </div>
      </div>

      {(!pendingBhajans || pendingBhajans.length === 0) ? (
        <div className="bg-white p-12 rounded-3xl border border-gray-200 shadow-sm text-center">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800">All caught up!</h2>
          <p className="text-gray-500 mt-2">There are no pending bhajans waiting for review.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pendingBhajans.map((bhajan) => (
            <div key={bhajan.id} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-200 shadow-sm flex flex-col gap-4">
              
              {/* Header Info */}
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="text-2xl font-black text-gray-900">{bhajan.title}</h3>
                  <p className="text-sm text-gray-500 flex items-center gap-2 mt-2 font-medium">
                    <FaUser className="text-orange-500" /> {bhajan.contributor_name || 'Anonymous User'}
                  </p>
                </div>
                <p className="text-xs text-gray-500 flex items-center gap-1 font-bold bg-gray-50 px-3 py-1.5 rounded-full shrink-0">
                  <FaClock /> {new Date(bhajan.created_at).toLocaleDateString()}
                </p>
              </div>

              {/* Lyrics Snippet */}
              <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 max-h-60 overflow-y-auto">
                <pre className="text-sm text-gray-700 font-sans whitespace-pre-wrap">{bhajan.lyrics}</pre>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 mt-4">
                {/* Approve Button -> Redirects to Add Bhajan and passes the data via URL */}
                <Link 
                  href={`/admin/add-bhajan?title=${encodeURIComponent(bhajan.title)}&lyrics=${encodeURIComponent(bhajan.lyrics)}`}
                  className="flex-1 bg-green-600 text-white py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-green-700 shadow-sm transition-colors"
                >
                  <FaCheckCircle /> Approve & Publish
                </Link>

                {/* Reject Button -> Triggers the Server Action */}
                <form action={deleteSubmission} className="flex-1">
                  <input type="hidden" name="id" value={bhajan.id} />
                  <button type="submit" className="w-full h-full bg-red-50 text-red-600 py-3.5 rounded-xl font-bold flex justify-center items-center gap-2 hover:bg-red-600 hover:text-white transition-colors">
                    <FaTrash /> Reject & Delete
                  </button>
                </form>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}