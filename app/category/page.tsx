import { Metadata } from 'next';
import { supabase } from '@/utils/supabase';
import CategoriesClient from './CategoriesClient';

export const revalidate = 3600; // Cache for 1 hour

// 🌟 SEO Metadata
export const metadata: Metadata = {
  title: 'Browse All Categories | Hindi Bhajan Manjari',
  description: 'Explore our vast collection of Hindu devotional songs, structured by categories like Aarti, Chalisa, Mantra, Stotram, and more.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/category',
  },
};

export default async function AllCategoriesPage() {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name_hinglish, name_hindi, slug')
    .order('name_hinglish', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error);
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] bg-orange-50/30 dark:bg-[#0c0804] px-4">
        <div className="bg-white dark:bg-[#120804] p-8 rounded-3xl shadow-xl border border-red-100 dark:border-red-900/30 text-center max-w-md">
          <p className="text-red-600 dark:text-red-400 font-bold text-xl mb-2">Connection Error</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm">We couldn't load the categories at this moment. Please try again later.</p>
        </div>
      </div>
    );
  }

  return <CategoriesClient initialCategories={categories || []} />;
}