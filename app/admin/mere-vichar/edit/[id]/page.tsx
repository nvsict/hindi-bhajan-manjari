"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { updateVicharAction } from '@/app/actions/vicharActions'; // 🌟 NEW IMPORT
import { useParams } from 'next/navigation';
import { 
  FaPenNib, FaCheckCircle, FaSpinner, FaBookOpen, FaLayerGroup, FaGlobe 
} from 'react-icons/fa';

const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export default function EditMereVicharPage() {
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
    new_category_hinglish: '',
    new_category_hindi: '',
    new_deity_hinglish: '',
    new_deity_hindi: '',
    seo_title: '',
    meta_description: '',
    is_published: true,
  });

  // Fetch Existing Data & Dropdowns
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
        setFormData(prev => ({
          ...prev,
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
        }));
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

  // 🌟 SUBMIT VIA SERVER ACTION
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Sending data to secure server...");

    try {
      const payload = { formData };
      const response = await updateVicharAction(id, payload);

      if (response.success) {
        setMessage("success");
        setTimeout(() => {
          // 🌟 Hard redirect to clear cache and update UI instantly
          window.location.href = '/admin/mere-vichar';
        }, 1500);
      } else {
        setMessage(`❌ ${response.error}`);
        setIsSubmitting(false);
      }
    } catch (err: any) {
      setMessage(`❌ Network Error: Could not reach the server.`);
      setIsSubmitting(false);
    } 
  };

  // 🌟 PREMIUM LOADING STATE
  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl p-16 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 text-center my-20">
        <div className="flex flex-col items-center justify-center gap-4 text-orange-600">
          <FaSpinner className="animate-spin text-5xl" />
          <p className="font-bold tracking-widest uppercase text-sm">रचना का डेटा लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 mb-24">
      
      {/* Header Banner */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
          <FaPenNib />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Edit Vichar</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">अपनी इस रचना में बदलाव करें और अपडेट करें।</p>
        </div>
      </div>

      {/* Message Alert */}
      {message && (
        <div className={`p-4 mb-8 rounded-2xl font-bold flex items-center gap-3 transition-all ${
          message.includes('❌') 
            ? 'bg-red-50 text-red-600 border border-red-100' 
            : 'bg-green-50 text-green-700 border border-green-100'
        }`}>
          {message === 'success' ? (
            <>
              <FaCheckCircle className="text-xl shrink-0 animate-bounce" />
              <span>रचना सफलतापूर्वक अपडेट हो गई! Redirecting...</span>
            </>
          ) : (
            <span>{message}</span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- 1. Basic Info --- */}
        <div className="bg-gray-50/60 p-6 md:p-8 rounded-3xl border border-gray-100/80">
          <div className="flex items-center gap-2.5 text-orange-600 font-extrabold text-lg mb-6">
            <FaBookOpen size={18} />
            <h2>1. Basic Information</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Title (Hinglish) *</label>
              <input required type="text" value={formData.title_hinglish} onChange={handleTitleChange} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-bold text-gray-900 transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Title (Hindi) *</label>
              <input required type="text" value={formData.title_hindi} onChange={(e) => setFormData({...formData, title_hindi: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-bold text-gray-900 transition-all font-hindi" />
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">URL Slug *</label>
            <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full p-4 bg-gray-100/80 border border-gray-200 rounded-2xl text-gray-500 font-mono text-xs" />
          </div>
        </div>

        {/* --- 2. Poetry & Meaning --- */}
        <div className="bg-gray-50/60 p-6 md:p-8 rounded-3xl border border-gray-100/80">
          <div className="flex items-center gap-2.5 text-orange-600 font-extrabold text-lg mb-6">
            <FaPenNib size={18} />
            <h2>2. Poetry & Meaning</h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">कविता / श्लोक (Quote Text) *</label>
            <textarea required rows={6} value={formData.quote_text} onChange={(e) => setFormData({...formData, quote_text: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-hindi text-lg leading-relaxed transition-all"></textarea>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">भावार्थ / Explanation</label>
            <textarea rows={6} value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-hindi leading-relaxed transition-all"></textarea>
          </div>
        </div>

        {/* --- 3. Classification & SEO --- */}
        <div className="bg-gray-50/60 p-6 md:p-8 rounded-3xl border border-gray-100/80">
          <div className="flex items-center gap-2.5 text-orange-600 font-extrabold text-lg mb-6">
            <FaLayerGroup size={18} />
            <h2>3. Classification & Relations</h2>
          </div>
          
          <div className="mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">Categories (Select Multiple)</label>
            <div className="flex flex-wrap gap-2.5">
              {categories.map(c => {
                const isSelected = formData.selected_categories.includes(c.id);
                return (
                  <button
                    type="button"
                    key={c.id}
                    onClick={() => handleCategoryToggle(c.id)}
                    className={`px-4 py-2.5 rounded-xl font-bold text-xs transition-all outline-none border ${
                      isSelected 
                        ? 'bg-orange-600 text-white border-orange-600 shadow-md shadow-orange-500/20 scale-[1.02]' 
                        : 'bg-white text-gray-700 border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    {c.name_hinglish} {isSelected && ' ✓'}
                  </button>
                );
              })}
            </div>
            
            <div className="mt-4 p-4 bg-white rounded-2xl border border-gray-200/80 flex flex-col md:flex-row gap-3 items-center">
               <span className="text-xs font-bold text-gray-500 whitespace-nowrap">➕ Add New Category:</span>
               <input type="text" placeholder="Hinglish Name" value={formData.new_category_hinglish} onChange={(e) => setFormData({...formData, new_category_hinglish: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-orange-400" />
               <input type="text" placeholder="Hindi Name" value={formData.new_category_hindi} onChange={(e) => setFormData({...formData, new_category_hindi: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-orange-400 font-hindi" />
            </div>
          </div>

          <div className="space-y-3 mb-8">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Deity</label>
            <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-bold text-gray-900 transition-all">
              <option value="">-- Select Deity --</option>
              <option value="new" className="font-extrabold text-orange-600">➕ Create New Deity...</option>
              {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish} ({d.name_hindi})</option>)}
            </select>

            {formData.deity_id === 'new' && (
              <div className="p-4 bg-orange-50/80 border border-orange-100 rounded-2xl space-y-3 animate-fadeIn">
                <input type="text" placeholder="New Deity (Hinglish)" value={formData.new_deity_hinglish} onChange={(e) => setFormData({...formData, new_deity_hinglish: e.target.value})} className="w-full p-3 bg-white text-xs rounded-xl border border-orange-200 outline-none font-bold" />
                <input type="text" placeholder="New Deity (Hindi)" value={formData.new_deity_hindi} onChange={(e) => setFormData({...formData, new_deity_hindi: e.target.value})} className="w-full p-3 bg-white text-xs rounded-xl border border-orange-200 outline-none font-bold font-hindi" />
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-200/80">
            <div className="flex items-center gap-2.5 text-orange-600 font-extrabold text-sm mb-4">
              <FaGlobe size={14} />
              <h3>Advanced SEO Overrides</h3>
            </div>
            
            <div className="mb-6">
              <label className="block text-xs font-bold text-gray-500 mb-2">SEO Title Override</label>
              <input type="text" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:border-orange-400 outline-none" />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-500 mb-2">Custom Meta Description</label>
              <textarea rows={2} value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:border-orange-400 outline-none"></textarea>
              <div className="flex justify-end mt-1">
                <span className={`text-[11px] font-bold ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.meta_description.length} / 160 chars
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <input type="checkbox" id="is_published" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer" />
              <label htmlFor="is_published" className="text-sm font-bold text-gray-800 cursor-pointer">
                Publish Immediately (Make Live on Website)
              </label>
            </div>
          </div>
        </div>

        {/* Submit Action Button */}
        <div className="pt-4 flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full md:w-auto px-10 py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white font-black rounded-2xl hover:shadow-[0_10px_25px_rgba(234,88,12,0.4)] transition-all disabled:opacity-50 text-sm uppercase tracking-widest flex items-center justify-center gap-3 cursor-pointer outline-none"
          >
            {isSubmitting ? (
              <><FaSpinner className="animate-spin text-lg" /> Updating...</>
            ) : (
              <>Update Vichar Securely <FaCheckCircle /></>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}