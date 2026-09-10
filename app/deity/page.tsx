import { Metadata } from 'next';
import { supabase } from '@/utils/supabase';
import DeitiesClient from './DeitiesClient';

export const revalidate = 3600; 

export const metadata: Metadata = {
  title: 'All Hindu Deities - Bhajans, Aartis & Chalisa | Hindi Bhajan Manjari',
  description: 'Browse our complete collection of bhajans, aartis, and mantras dedicated to Hindu Gods and Goddesses. Read authentic lyrics and meanings.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/deity',
  }
};

export default async function DeitiesPage() {
  const { data: deities, error } = await supabase
    .from('deities')
    .select('id, name_hindi, name_hinglish, slug, image_url')
    .order('name_hinglish', { ascending: true });

  if (error) {
    console.error("Supabase Error:", error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-orange-50/30 dark:bg-[#0c0804] px-4">
        <div className="bg-white dark:bg-[#120804] p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 font-bold text-xl mb-2">Connection Error</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">We couldn't load the deities at this moment. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return <DeitiesClient initialDeities={deities || []} />;
}