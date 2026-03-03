"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter, useParams } from 'next/navigation';
import { FaSave, FaArrowLeft, FaSpinner } from 'react-icons/fa';
import Link from 'next/link';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deities, setDeities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    title_hindi: '',
    title_hinglish: '',
    slug: '',
    meta_description: '',
    content_html: '',
    read_time_minutes: 5,
    deity_id: '',
    category_id: '',
    is_published: true,
    author_name: 'Mohit Tarkar',
    author_slug: 'mohit-tarkar',
  });

  // Fetch bridging data for dropdowns AND the existing article
  useEffect(() => {
    const fetchInitialData = async () => {
      setInitialLoading(true);

      try {
        // 1. Fetch Categories & Deities
        const [{ data: deityData }, { data: categoryData }] = await Promise.all([
          supabase.from('deities').select('id, name_hinglish').order('name_hinglish'),
          supabase.from('categories').select('id, name_hinglish').order('name_hinglish')
        ]);
        
        if (deityData) setDeities(deityData);
        if (categoryData) setCategories(categoryData);

        // 2. Fetch the existing article
        if (id) {
          const { data: article, error } = await supabase
            .from('articles')
            .select('*')
            .eq('id', id)
            .single();

          if (error) throw error;

          if (article) {
            setFormData({
              title_hindi: article.title_hindi || '',
              title_hinglish: article.title_hinglish || '',
              slug: article.slug || '',
              meta_description: article.meta_description || '',
              content_html: article.content_html || '',
              read_time_minutes: article.read_time_minutes || 5,
              deity_id: article.deity_id || '',
              category_id: article.category_id || '',
              is_published: article.is_published ?? true,
              author_name: article.author_name || 'Mohit Tarkar',
              author_slug: article.author_slug || 'mohit-tarkar',
            });
          }
        }
      } catch (err) {
        console.error("Error fetching article:", err);
        alert("Could not load the article. It may have been deleted.");
        router.push('/admin/articles');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchInitialData();
  }, [id, router]);

  // Auto-generate slug from Hinglish title
  // Note: Changing the title after publishing changes the slug. Be careful with SEO!
  const handleHinglishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title_hinglish: value, slug: generatedSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Update instead of insert
    const { error } = await supabase
      .from('articles')
      .update({
        ...formData,
        deity_id: formData.deity_id || null,
        category_id: formData.category_id || null,
      })
      .eq('id', id);

    setLoading(false);

    if (error) {
      alert(`Error updating article: ${error.message}`);
    } else {
      router.push('/admin/articles');
    }
  };

  if (initialLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <FaSpinner className="animate-spin text-orange-500 text-3xl" />
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <Link href="/admin/articles" className="text-gray-500 hover:text-orange-600 flex items-center gap-2 mb-6 font-medium transition-colors">
        <FaArrowLeft /> Back to Articles
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-black text-gray-900">Edit Gyan Article</h1>
            <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold">ID: {id?.substring(0, 8)}...</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hindi) *</label>
              <input required type="text" value={formData.title_hindi} onChange={(e) => setFormData({...formData, title_hindi: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. आरती और भजन में क्या अंतर है?" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hinglish) *</label>
              <input required type="text" value={formData.title_hinglish} onChange={handleHinglishChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Aarti aur Bhajan me kya antar hai" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
              <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Read Time (Minutes) *</label>
              <input required type="number" min="1" value={formData.read_time_minutes} onChange={(e) => setFormData({...formData, read_time_minutes: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">SEO Meta Description *</label>
            <textarea required value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Short 160-character summary for Google..." />
          </div>

          <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-orange-900 mb-2">Link to Deity (For Read Next)</label>
              <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full border border-orange-200 rounded-xl p-3 outline-none bg-white">
                <option value="">-- No Deity --</option>
                {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-orange-900 mb-2">Link to Category</label>
              <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full border border-orange-200 rounded-xl p-3 outline-none bg-white">
                <option value="">-- No Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_hinglish}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Article Content (HTML Supported) *</label>
            <div className="text-xs text-gray-500 mb-2">Tip: Use &lt;h2&gt; for subheadings, &lt;p&gt; for paragraphs, and &lt;ul&gt;&lt;li&gt; for bullet points.</div>
            <textarea required value={formData.content_html} onChange={(e) => setFormData({...formData, content_html: e.target.value})} rows={15} className="w-full font-mono text-sm border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-900 text-green-400" placeholder="<p>Write your article content here...</p>" />
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" />
              <span className="font-bold text-gray-700">Publish Immediately</span>
            </label>

            <button type="submit" disabled={loading} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-lg flex items-center gap-2 hover:bg-orange-700 transition-colors disabled:opacity-50">
              {loading ? <><FaSpinner className="animate-spin" /> Updating...</> : <><FaSave /> Update Article</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}