"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter, useParams } from 'next/navigation';
import { FaPenNib, FaCircleCheck, FaSpinner } from 'react-icons/fa6';

const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export default function EditMereVicharPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [categories, setCategories] = useState<any[]>([]);
  const [deities, setDeities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    title_hindi: '',
    title_hinglish: '',
    slug: '',
    quote_text: '',
    explanation: '',
    deity_id: '',
    selected_categories: [] as string[],
    seo_title: '',
    meta_description: '',
    is_published: true,
  });

  // 1. Fetch Dropdowns & Existing Data in Parallel
  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      setIsLoading(true);
      const [catResponse, deityResponse, vicharResponse] = await Promise.all([
        supabase.from('categories').select('id, name_hinglish, name_hindi'),
        supabase.from('deities').select('id, name_hinglish, name_hindi'),
        supabase.from('mere_vichar').select('*').eq('id', id).single()
      ]);
      
      if (catResponse.data) setCategories(catResponse.data);
      if (deityResponse.data) setDeities(deityResponse.data);
      
      if (vicharResponse.data) {
        const v = vicharResponse.data;
        setFormData({
          title_hindi: v.title_hindi || '',
          title_hinglish: v.title_hinglish || '',
          slug: v.slug || '',
          quote_text: v.quote_text || '',
          explanation: v.explanation || '',
          deity_id: v.deity_id || '',
          selected_categories: v.category_id ? [v.category_id] : [],
          seo_title: v.seo_title || '',
          meta_description: v.meta_description || '',
          is_published: v.is_published ?? true,
        });
      } else {
        setMessage("❌ रचना नहीं मिली!");
      }
      setIsLoading(false);
    };

    fetchData();
  }, [id]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData(prev => ({ 
      ...prev, 
      title_hinglish: title, 
      slug: generateSlug(title) 
    }));
  };

  const handleCategoryToggle = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_categories: prev.selected_categories.includes(catId)
        ? prev.selected_categories.filter(cid => cid !== catId)
        : [...prev.selected_categories, catId]
    }));
  };

  // 2. Handle Update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Updating...");

    try {
      const { error } = await supabase
        .from('mere_vichar')
        .update({
          title_hindi: formData.title_hindi,
          title_hinglish: formData.title_hinglish,
          slug: formData.slug,
          quote_text: formData.quote_text,
          explanation: formData.explanation || null,
          deity_id: formData.deity_id || null,
          category_id: formData.selected_categories[0] || null,
          seo_title: formData.seo_title || null,
          meta_description: formData.meta_description || null,
          is_published: formData.is_published,
        })
        .eq('id', id);

      if (error) throw new Error(error.message);

      setMessage("✅ रचना सफलतापूर्वक अपडेट हो गई! Redirecting...");
      
      setTimeout(() => {
        router.push('/admin/mere-vichar');
      }, 1500);

    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
      setIsSubmitting(false);
    } 
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-16 rounded-3xl shadow-sm border border-gray-100 text-center my-20">
        <div className="flex items-center justify-center gap-3 text-lg font-bold text-gray-600">
          <FaSpinner className="animate-spin text-orange-600" size={24} /> डेटा लोड हो रहा है...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-20">
      
      {/* Header */}
      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md">
          <FaPenNib size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Edit Vichar</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">अपनी इस रचना में बदलाव करें और अपडेट करें</p>
        </div>
      </div>

      {message && (
        <div className={`p-4 mb-6 rounded-xl font-bold flex items-center gap-2 ${message.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
          {!message.includes('❌') && <FaCircleCheck size={18} />}
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- 1. Basic Info --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">1. Basic Information</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hinglish) *</label>
              <input required type="text" value={formData.title_hinglish} onChange={handleTitleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hindi) *</label>
              <input required type="text" value={formData.title_hindi} onChange={(e) => setFormData({...formData, title_hindi: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500 font-hindi" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
            <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono text-sm" />
          </div>
        </div>

        {/* --- 2. Poetry & Meaning --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Poetry & Meaning</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">कविता / श्लोक (Quote Text) *</label>
            <textarea required rows={6} value={formData.quote_text} onChange={(e) => setFormData({...formData, quote_text: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-orange-500 font-hindi text-lg leading-relaxed"></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">भावार्थ / Explanation</label>
            <textarea rows={6} value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-orange-500 font-hindi leading-relaxed"></textarea>
          </div>
        </div>

        {/* --- 3. Relations --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Classification & Relations</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">Categories</label>
            <div className="flex flex-wrap gap-3">
              {categories.map(c => (
                <label key={c.id} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${formData.selected_categories.includes(c.id) ? 'bg-orange-100 border-orange-500 text-orange-800 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <input type="checkbox" className="hidden" checked={formData.selected_categories.includes(c.id)} onChange={() => handleCategoryToggle(c.id)} />
                  {c.name_hinglish} ({c.name_hindi})
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Deity</label>
            <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500">
              <option value="">-- Select Deity --</option>
              {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish} ({d.name_hindi})</option>)}
            </select>
          </div>
        </div>

        {/* --- 4. SEO Overrides --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">4. Advanced SEO Overrides</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">SEO Title Override</label>
            <input type="text" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Custom Meta Description</label>
            <textarea rows={2} value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500"></textarea>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 mt-6">
            <input type="checkbox" id="is_published" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer" />
            <label htmlFor="is_published" className="text-sm font-bold text-gray-800 cursor-pointer">
              Publish Immediately (Make Live on Website)
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-10 py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5">
            {isSubmitting ? 'Updating Database...' : 'Update Vichar & Schema'}
          </button>
        </div>

      </form>
    </div>
  );
}