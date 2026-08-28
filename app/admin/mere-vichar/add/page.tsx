"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { FaPenNib, FaCircleCheck } from 'react-icons/fa6';

const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export default function AddMereVicharPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [deities, setDeities] = useState<any[]>([]);
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

  // Fetch Dropdown Data in Parallel (Exact match to your pattern)
  useEffect(() => {
    const fetchDropdownData = async () => {
      const [catResponse, deityResponse] = await Promise.all([
        supabase.from('categories').select('id, name_hinglish, name_hindi'),
        supabase.from('deities').select('id, name_hinglish, name_hindi')
      ]);
      
      if (catResponse.data) setCategories(catResponse.data);
      if (deityResponse.data) setDeities(deityResponse.data);
    };
    fetchDropdownData();
  }, []);

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
        ? prev.selected_categories.filter(id => id !== catId)
        : [...prev.selected_categories, catId]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Processing...");

    try {
      let finalDeityId = formData.deity_id;
      let finalCategories = [...formData.selected_categories];

      // 1. Create New Deity if requested
      if (formData.deity_id === 'new') {
        const deitySlug = generateSlug(formData.new_deity_hinglish);
        const { data: newDeity, error: deityError } = await supabase
          .from('deities')
          .insert([{ name_hinglish: formData.new_deity_hinglish, name_hindi: formData.new_deity_hindi, slug: deitySlug }])
          .select('id').single();
        if (deityError) throw new Error(`Deity Error: ${deityError.message}`);
        finalDeityId = newDeity.id;
      }

      // 2. Create New Category if requested
      if (formData.new_category_hinglish) {
        const catSlug = generateSlug(formData.new_category_hinglish);
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert([{ name_hinglish: formData.new_category_hinglish, name_hindi: formData.new_category_hindi, slug: catSlug }])
          .select('id').single();
        if (catError) throw new Error(`Category Error: ${catError.message}`);
        finalCategories.push(newCat.id);
      }

      // 3. Insert into mere_vichar table
      const { data: vicharData, error: vicharError } = await supabase.from('mere_vichar').insert([
        {
          title_hindi: formData.title_hindi,
          title_hinglish: formData.title_hinglish,
          slug: formData.slug,
          quote_text: formData.quote_text,
          explanation: formData.explanation || null,
          deity_id: finalDeityId === 'new' ? null : finalDeityId || null,
          category_id: finalCategories[0] || null, // Primary category relation if available
          seo_title: formData.seo_title || null,
          meta_description: formData.meta_description || null,
          is_published: formData.is_published,
        }
      ]).select('id').single();

      if (vicharError) throw new Error(vicharError.message);

      setMessage("✅ रचना सफलतापूर्वक पब्लिश हो गई! Redirecting...");
      
      setTimeout(() => {
  window.location.href = '/admin'; // 🌟 Hard redirect to clear cache and update UI instantly
}, 1500);

    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-20">
      
      {/* Header matching your exact theme */}
      <div className="flex items-center gap-4 mb-8 border-b pb-6">
        <div className="w-12 h-12 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md">
          <FaPenNib size={22} />
        </div>
        <div>
          <h1 className="text-3xl font-black text-gray-900">Upload New Vichar</h1>
          <p className="text-gray-500 text-sm font-medium mt-1">अपनी स्वरचित कविताएँ, श्लोक और भावार्थ यहाँ से पब्लिश करें</p>
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
              <input required type="text" value={formData.title_hinglish} onChange={handleTitleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="e.g. Kevat Ka Samarpan" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hindi) *</label>
              <input required type="text" value={formData.title_hindi} onChange={(e) => setFormData({...formData, title_hindi: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500 font-hindi" placeholder="e.g. केवट का समर्पण" />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
            <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono text-sm" />
          </div>
        </div>

        {/* --- 2. Poetry & Meaning Content --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Poetry & Meaning</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">कविता / श्लोक (Quote Text) *</label>
            <p className="text-xs text-gray-500 mb-2">लाइन बदलने के लिए Enter दबाएँ। वेबसाइट पर बिल्कुल वैसा ही दिखेगा।</p>
            <textarea required rows={6} value={formData.quote_text} onChange={(e) => setFormData({...formData, quote_text: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-orange-500 font-hindi text-lg leading-relaxed" placeholder="यहाँ अपनी कविता लिखें..."></textarea>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">भावार्थ / Explanation (SEO & Reader Value)</label>
            <p className="text-xs text-gray-500 mb-2">विस्तृत अर्थ। पैराग्राफ बदलने के लिए दो बार Enter दबाएँ।</p>
            <textarea rows={6} value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-xl focus:outline-orange-500 font-hindi leading-relaxed" placeholder="इस रचना का गहरा अर्थ या मर्म लिखें..."></textarea>
          </div>
        </div>

        {/* --- 3. Classification & Deity --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Classification & Relations</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">Categories (Select Multiple)</label>
            <div className="flex flex-wrap gap-3">
              {categories.map(c => (
                <label key={c.id} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${formData.selected_categories.includes(c.id) ? 'bg-orange-100 border-orange-500 text-orange-800 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <input type="checkbox" className="hidden" checked={formData.selected_categories.includes(c.id)} onChange={() => handleCategoryToggle(c.id)} />
                  {c.name_hinglish} ({c.name_hindi})
                </label>
              ))}
            </div>
            
            <div className="mt-4 flex gap-4 items-center flex-wrap">
               <span className="text-sm font-medium text-gray-500">Or add new:</span>
               <input type="text" placeholder="Hinglish Name" value={formData.new_category_hinglish} onChange={(e) => setFormData({...formData, new_category_hinglish: e.target.value})} className="p-2 text-sm rounded-lg border border-gray-200 bg-white" />
               <input type="text" placeholder="Hindi Name" value={formData.new_category_hindi} onChange={(e) => setFormData({...formData, new_category_hindi: e.target.value})} className="p-2 text-sm rounded-lg border border-gray-200 bg-white font-hindi" />
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-700">Deity</label>
            <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500">
              <option value="">-- Select Deity --</option>
              <option value="new" className="font-bold text-orange-600">➕ Create New Deity...</option>
              {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish} ({d.name_hindi})</option>)}
            </select>

            {formData.deity_id === 'new' && (
              <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                <input type="text" placeholder="New Deity (Hinglish)" value={formData.new_deity_hinglish} onChange={(e) => setFormData({...formData, new_deity_hinglish: e.target.value})} className="w-full p-2.5 rounded-lg border border-orange-200 bg-white" />
                <input type="text" placeholder="New Deity (Hindi)" value={formData.new_deity_hindi} onChange={(e) => setFormData({...formData, new_deity_hindi: e.target.value})} className="w-full p-2.5 rounded-lg border border-orange-200 bg-white font-hindi" />
              </div>
            )}
          </div>
        </div>

        {/* --- 4. Advanced SEO Overrides --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">4. Advanced SEO Overrides</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">SEO Title Override</label>
            <input type="text" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="e.g. Kevat Ka Samarpan Lyrics & Meaning" />
            <p className="text-xs text-gray-500 mt-1">Leave empty to use default auto-generated title.</p>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-bold text-gray-700 mb-2">Custom Meta Description</label>
            <textarea rows={2} value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="Custom snippet for Google (150-160 chars)..."></textarea>
            <div className="flex justify-end mt-1">
              <span className={`text-xs font-bold ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                {formData.meta_description.length} / 160 chars
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-gray-200 mt-6">
            <input type="checkbox" id="is_published" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="w-5 h-5 text-orange-600 rounded border-gray-300 focus:ring-orange-500 cursor-pointer" />
            <label htmlFor="is_published" className="text-sm font-bold text-gray-800 cursor-pointer">
              Publish Immediately (Make Live on Website)
            </label>
          </div>
        </div>

        {/* Submit Button (Exact match to your style) */}
        <div className="pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-10 py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5">
            {isSubmitting ? 'Uploading to Database...' : 'Publish Vichar & Schema'}
          </button>
        </div>

      </form>
    </div>
  );
}