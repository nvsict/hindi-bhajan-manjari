"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter, useParams } from 'next/navigation';
import { FaSave, FaArrowLeft, FaSpinner, FaImage, FaLanguage, FaGlobe } from 'react-icons/fa';
import Link from 'next/link';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [deities, setDeities] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // 🌟 NEW: Tab State for switching languages
  const [activeTab, setActiveTab] = useState<'hi' | 'en'>('hi');

  // 🌟 UPGRADED Form State (Now includes English columns)
  const [formData, setFormData] = useState({
    // Common
    featured_image_url: '',
    read_time_minutes: 5,
    deity_id: '',
    category_id: '',
    author_name: 'Mohit Tarkar',
    author_slug: 'mohit-tarkar',
    
    // Hindi (Original)
    title_hindi: '',
    title_hinglish: '',
    slug: '',
    meta_description: '',
    content_html: '',
    is_published: true,

    // English (New)
    title_english: '',
    slug_english: '',
    meta_description_english: '',
    content_html_english: '',
    is_published_english: false,
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
              // Common
              featured_image_url: article.featured_image_url || '',
              read_time_minutes: article.read_time_minutes || 5,
              deity_id: article.deity_id || '',
              category_id: article.category_id || '',
              author_name: article.author_name || 'Mohit Tarkar',
              author_slug: article.author_slug || 'mohit-tarkar',
              
              // Hindi
              title_hindi: article.title_hindi || '',
              title_hinglish: article.title_hinglish || '',
              slug: article.slug || '',
              meta_description: article.meta_description || '',
              content_html: article.content_html || '',
              is_published: article.is_published ?? true,

              // English
              title_english: article.title_english || '',
              slug_english: article.slug_english || '',
              meta_description_english: article.meta_description_english || '',
              content_html_english: article.content_html_english || '',
              is_published_english: article.is_published_english ?? false,
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
  const handleHinglishChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title_hinglish: value, slug: generatedSlug });
  };

  // Auto-generate slug from English title
  const handleEnglishTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const generatedSlug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title_english: value, slug_english: generatedSlug });
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
        // Make empty english slug null to avoid UNIQUE constraint errors
        slug_english: formData.slug_english || null,
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
            Edit Gyan Article
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1">
              <FaGlobe /> Global Ready
            </span>
          </h1>
          <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold w-fit">
            ID: {id?.substring(0, 8)}...
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* ========================================== */}
          {/* 🌟 SECTION 1: COMMON SETTINGS (Shared)     */}
          {/* ========================================== */}
          <div className="space-y-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <h2 className="text-sm font-black text-gray-500 uppercase tracking-widest border-b border-gray-200 pb-2">Common Settings (Shared)</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Read Time (Minutes) *</label>
                <input required type="number" min="1" value={formData.read_time_minutes} onChange={(e) => setFormData({...formData, read_time_minutes: parseInt(e.target.value)})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none bg-white" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Link to Deity</label>
                <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 outline-none bg-white">
                  <option value="">-- No Deity --</option>
                  {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Link to Category</label>
                <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 outline-none bg-white">
                  <option value="">-- No Category --</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.name_hinglish}</option>)}
                </select>
              </div>
            </div>

            <div className="p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
              <label className="flex items-center gap-2 text-sm font-bold text-blue-900 mb-2">
                <FaImage className="text-blue-500" /> 
                Featured Image URL (For Both Languages)
              </label>
              <input 
                type="url" 
                value={formData.featured_image_url} 
                onChange={(e) => setFormData({...formData, featured_image_url: e.target.value})} 
                className="w-full border border-blue-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none bg-white" 
                placeholder="https://example.com/image.jpg" 
              />
              
              {/* Live Image Preview */}
              {formData.featured_image_url && (
                <div className="mt-4 relative w-full md:w-1/2 aspect-[21/9] rounded-xl overflow-hidden border border-blue-200 shadow-sm bg-gray-100 flex items-center justify-center">
                  <img 
                    src={formData.featured_image_url} 
                    alt="Featured Preview" 
                    className="object-cover w-full h-full"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x630?text=Invalid+Image+URL' }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* ========================================== */}
          {/* 🌟 SECTION 2: MULTILINGUAL TABS            */}
          {/* ========================================== */}
          <div>
            <div className="flex gap-4 border-b border-gray-200 mb-6">
              <button
                type="button"
                onClick={() => setActiveTab('hi')}
                className={`pb-3 px-4 text-lg font-black transition-all flex items-center gap-2 ${activeTab === 'hi' ? 'border-b-4 border-orange-500 text-orange-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                🇮🇳 Hindi Content
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('en')}
                className={`pb-3 px-4 text-lg font-black transition-all flex items-center gap-2 ${activeTab === 'en' ? 'border-b-4 border-blue-500 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
              >
                🇬🇧 English Content
              </button>
            </div>

            {/* ----------------- 🇮🇳 HINDI TAB ----------------- */}
            <div className={activeTab === 'hi' ? 'block space-y-6' : 'hidden'}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hindi) *</label>
                  <input required={activeTab === 'hi'} type="text" value={formData.title_hindi} onChange={(e) => setFormData({...formData, title_hindi: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. आरती और भजन में क्या अंतर है?" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hinglish - For Slug) *</label>
                  <input required={activeTab === 'hi'} type="text" value={formData.title_hinglish} onChange={handleHinglishChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="e.g. Aarti aur Bhajan me kya antar hai" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hindi URL Slug *</label>
                <input required={activeTab === 'hi'} type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hindi SEO Meta Description *</label>
                <textarea required={activeTab === 'hi'} value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Short 160-character summary..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Hindi Content (HTML) *</label>
                <textarea required={activeTab === 'hi'} value={formData.content_html} onChange={(e) => setFormData({...formData, content_html: e.target.value})} rows={12} className="w-full font-mono text-sm border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-orange-500 outline-none bg-gray-900 text-green-400" placeholder="<p>Hindi Content Here...</p>" />
              </div>

              <div className="bg-orange-50 p-4 rounded-xl border border-orange-100 inline-block">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500 cursor-pointer" />
                  <span className="font-bold text-orange-900">Publish Hindi Version</span>
                </label>
              </div>
            </div>

            {/* ----------------- 🇬🇧 ENGLISH TAB ----------------- */}
            <div className={activeTab === 'en' ? 'block space-y-6' : 'hidden'}>
              <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 mb-4 flex items-center gap-3">
                <FaLanguage className="text-blue-500 text-xl" />
                <p className="text-sm text-blue-900 font-medium">Leave this blank if you are not ready to write the English version yet. You can always add it later.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">English Title</label>
                <input type="text" value={formData.title_english} onChange={handleEnglishTitleChange} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="e.g. Difference between Aarti and Bhajan" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">English URL Slug</label>
                <input type="text" value={formData.slug_english} onChange={(e) => setFormData({...formData, slug_english: e.target.value})} className="w-full border border-gray-300 bg-gray-50 rounded-xl p-3 outline-none" />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">English SEO Meta Description</label>
                <textarea value={formData.meta_description_english} onChange={(e) => setFormData({...formData, meta_description_english: e.target.value})} rows={2} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="English 160-character summary..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">English Content (HTML)</label>
                <textarea value={formData.content_html_english} onChange={(e) => setFormData({...formData, content_html_english: e.target.value})} rows={12} className="w-full font-mono text-sm border border-gray-300 rounded-xl p-4 focus:ring-2 focus:ring-blue-500 outline-none bg-slate-900 text-blue-400" placeholder="<p>English Content Here...</p>" />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 inline-block">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" checked={formData.is_published_english} onChange={(e) => setFormData({...formData, is_published_english: e.target.checked})} className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" />
                  <span className="font-bold text-blue-900">Publish English Version</span>
                </label>
              </div>
            </div>
          </div>

          {/* ========================================== */}
          {/* 🌟 FINAL SUBMIT BUTTON                     */}
          {/* ========================================== */}
          <div className="pt-6 border-t border-gray-100 flex justify-end">
            <button type="submit" disabled={loading} className="bg-gray-900 text-white px-10 py-4 rounded-2xl font-black text-lg flex items-center gap-2 hover:bg-black transition-transform active:scale-95 disabled:opacity-50 shadow-lg">
              {loading ? <><FaSpinner className="animate-spin" /> Updating...</> : <><FaSave /> Update Article (Both Versions)</>}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}