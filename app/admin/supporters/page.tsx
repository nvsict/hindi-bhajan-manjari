import { supabase } from '@/utils/supabase';
import SupportersClient from './SupportersClient';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Supporters Management | Admin Panel',
};

export default async function AdminSupportersPage() {
  const { data: supporters, error } = await supabase
    .from('supporters')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Failed to fetch supporters:", error.message);
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0c0804] py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              Supporters Management
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
              View, edit, and manage all Razorpay transactions and supporter profiles.
            </p>
          </div>
          <div className="bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 px-4 py-2 rounded-xl shadow-sm text-sm font-bold">
            Total Records: <span className="text-orange-600">{supporters?.length || 0}</span>
          </div>
        </div>

        <SupportersClient initialData={supporters || []} />
      </div>
    </div>
  );
}