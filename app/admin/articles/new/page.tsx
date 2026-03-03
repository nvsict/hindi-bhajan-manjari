"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function NewArticlePage() {
  const router = useRouter();
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
    author_name: 'Mohit Tarkar', // Default E-E-A-T
    author_slug: 'mohit-tarkar',
  });

  // Fetch bridging data for the dropdowns
  useEffect(() => {
    const fetchSelectData = async () => {
      const [{ data: deityData }, { data: categoryData }] = await Promise.all([
        supabase.from('deities').select('id, name_hinglish').order('name_hinglish'),
        supabase.from('categories').select('id, name_hinglish').order('name_hinglish')
      ]);
      if (deityData) setDeities(deityData);
      if (categoryData) setCategories(categoryData);
    };
    fetchSelectData();
  }, []);

  // Auto-generate slug from Hinglish title
  const handleHinglishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title_hinglish: value, slug: generatedSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.from('articles').insert([{
      ...formData,
      deity_id: formData.deity_id || null,
      category_id: formData.category_id || null,
    }]);

    setLoading(false);

    if (error) {
      alert(`Error saving article: ${error.message}`);
    } else {
      router.push('/admin/articles');
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <Link href="/admin/articles" className="text-gray-500 hover:text-orange-600 flex items-center gap-2 mb-6 font-medium transition-colors">
        <FaArrowLeft /> Back to Articles
      </Link>

      <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Write New Gyan Article</h1>

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

          {/* 🌟 KNOWLEDGE GRAPH BRIDGES */}
          <div className="p-5 bg-orange-50 rounded-2xl border border-orange-100 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-orange-900 mb-2">Link to Deity (For Read Next)</label>
              <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full border border-orange-200 rounded-xl p-3 outline-none">
                <option value="">-- No Deity --</option>
                {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-orange-900 mb-2">Link to Category</label>
              <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full border border-orange-200 rounded-xl p-3 outline-none">
                <option value="">-- No Category --</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_hinglish}</option>)}
              </select>
            </div>
          </div>

          {/* CONTENT HTML */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Article Content (HTML Supported) *</label>
            <div className="text-xs text-gray-500 mb-2">Tip: Use &lt;h2&gt; for subheadings, &lt;p&gt; for paragraphs, and &lt;ul&gt;&lt;li&gt; for bullet points.</div>
            <textarea required value={formData.content_html} onChange={(e) => setFormData({...formData, content_html: e.target.value})} rows={15} className="w-full font-mono text-sm border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-900 text-green-400" placeholder="<p>Write your article content here...</p>" />
          </div>

          {/* PUBLISH TOGGLE & SUBMIT */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-100">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500" />
              <span className="font-bold text-gray-700">Publish Immediately</span>
            </label>

            <button type="submit" disabled={loading} className="bg-orange-600 text-white px-8 py-3 rounded-xl font-black text-lg flex items-center gap-2 hover:bg-orange-700 transition-colors disabled:opacity-50">
              {loading ? 'Saving...' : <><FaSave /> Save Article</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}