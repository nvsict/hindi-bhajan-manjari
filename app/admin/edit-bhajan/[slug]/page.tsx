"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabase'; // Ensure this path is correct for your project
import { useRouter } from 'next/navigation';
import { FaPlus, FaTrash } from 'react-icons/fa';
import BhajanArtistManager from '@/components/admin/BhajanArtistManager';

export default function EditBhajanPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [categories, setCategories] = useState<any[]>([]);
  const [deities, setDeities] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    id: '',
    title_hindi: '',
    title_hinglish: '',
    slug: '',
    lyrics_hindi: '',
    lyrics_hinglish: '',
    video_embed_url: '',
    tarz: '',
    
    // 🌟 SEO Content
    explanation: '',
    tags: '', 
    
    // 🌟 NEW Advanced SEO Overrides
    seo_title: '',
    meta_description: '',
    alt_queries: '',
    
    // 🌟 Relations
    selected_categories: [] as string[], 
    deity_id: ''
  });

  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 🌟 OPTIMIZATION: Fetch Categories and Deities in parallel for faster loading
        const [catResponse, deityResponse] = await Promise.all([
          supabase.from('categories').select('id, name_hinglish'),
          supabase.from('deities').select('id, name_hinglish')
        ]);
        
        if (catResponse.data) setCategories(catResponse.data);
        if (deityResponse.data) setDeities(deityResponse.data);

        // Fetch the specific bhajan AND its junction tables
        const { data: bhajan, error } = await supabase
          .from('bhajans')
          .select(`
            *,
            bhajan_category_map ( category_id ),
            bhajan_tag_map ( tags ( name ) )
          `)
          .eq('slug', resolvedParams.slug)
          .single();

        if (error || !bhajan) {
          setFetchError("❌ Bhajan not found or database error.");
          setIsLoading(false);
          return;
        }

        // Format previously selected categories and tags
        const fetchedCategories = bhajan.bhajan_category_map?.map((map: any) => map.category_id) || [];
        const fetchedTags = bhajan.bhajan_tag_map?.map((map: any) => map.tags?.name).filter(Boolean).join(', ') || '';

        // Pre-fill the form
        setFormData({
          id: bhajan.id,
          title_hindi: bhajan.title_hindi || '',
          title_hinglish: bhajan.title_hinglish || '',
          slug: bhajan.slug || '',
          lyrics_hindi: bhajan.lyrics_hindi || '',
          lyrics_hinglish: bhajan.lyrics_hinglish || '',
          video_embed_url: bhajan.video_embed_url || '',
          tarz: bhajan.tarj_parody || '',
          explanation: bhajan.explanation || '',
          tags: fetchedTags,
          
          // 🌟 Populate SEO Fields
          seo_title: bhajan.seo_title || '',
          meta_description: bhajan.meta_description || '',
          alt_queries: bhajan.alt_queries || '',

          selected_categories: fetchedCategories,
          deity_id: bhajan.deity_id || ''
        });

        // Pre-fill FAQs
        if (bhajan.faqs && Array.isArray(bhajan.faqs) && bhajan.faqs.length > 0) {
          setFaqs(bhajan.faqs);
        }
      } catch (err) {
        setFetchError("❌ An unexpected error occurred while fetching data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [resolvedParams.slug]);

  const handleCategoryToggle = (catId: string) => {
    setFormData(prev => ({
      ...prev,
      selected_categories: prev.selected_categories.includes(catId)
        ? prev.selected_categories.filter(id => id !== catId)
        : [...prev.selected_categories, catId]
    }));
  };

  const addFaqRow = () => setFaqs([...faqs, { question: '', answer: '' }]);
  const removeFaqRow = (index: number) => setFaqs(faqs.filter((_, i) => i !== index));
  const updateFaq = (index: number, field: 'question' | 'answer', value: string) => {
    const newFaqs = [...faqs];
    newFaqs[index][field] = value;
    setFaqs(newFaqs);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Updating...");

    try {
      const cleanFaqs = faqs.filter(f => f.question.trim() !== '' && f.answer.trim() !== '');

      // 1. Update the Main Bhajan Table
      const { error: bhajanError } = await supabase
        .from('bhajans')
        .update({
          title_hindi: formData.title_hindi,
          title_hinglish: formData.title_hinglish,
          slug: formData.slug,
          lyrics_hindi: formData.lyrics_hindi,
          lyrics_hinglish: formData.lyrics_hinglish,
          video_embed_url: formData.video_embed_url,
          tarj_parody: formData.tarz,
          deity_id: formData.deity_id || null,
          explanation: formData.explanation || null,
          faqs: cleanFaqs.length > 0 ? cleanFaqs : null,
          // 🌟 Push Updated SEO Fields to DB
          seo_title: formData.seo_title || null,
          meta_description: formData.meta_description || null,
          alt_queries: formData.alt_queries || null,
          // We set singer_details to null here since we moved to the new relational tables
          singer_details: null 
        })
        .eq('id', formData.id);

      if (bhajanError) throw new Error(bhajanError.message);

      // 2. Refresh Category Mappings
      await supabase.from('bhajan_category_map').delete().eq('bhajan_id', formData.id);
      if (formData.selected_categories.length > 0) {
        const categoryMapData = formData.selected_categories.map(catId => ({
          bhajan_id: formData.id,
          category_id: catId
        }));
        await supabase.from('bhajan_category_map').insert(categoryMapData);
      }

      // 3. Refresh Tag Mappings
      await supabase.from('bhajan_tag_map').delete().eq('bhajan_id', formData.id);
      if (formData.tags.trim()) {
        const tagNames = formData.tags.split(',').map(t => t.trim()).filter(Boolean);
        const tagsToUpsert = tagNames.map(name => ({
          name: name,
          slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')
        }));

        const { data: upsertedTags, error: tagError } = await supabase
          .from('tags')
          .upsert(tagsToUpsert, { onConflict: 'slug' })
          .select('id');
          
        if (!tagError && upsertedTags) {
          const tagMapData = upsertedTags.map(tag => ({
            bhajan_id: formData.id,
            tag_id: tag.id
          }));
          await supabase.from('bhajan_tag_map').insert(tagMapData);
        }
      }

      setMessage("✅ Bhajan updated successfully!");
      
      // Auto-hide the success message after 4 seconds
      setTimeout(() => {
        setMessage("");
      }, 4000);

    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-gray-500 font-bold">Loading Bhajan Data...</div>;

  if (fetchError) return (
    <div className="max-w-4xl mx-auto mt-20 p-8 text-center bg-red-50 border border-red-200 rounded-3xl">
      <h2 className="text-xl font-bold text-red-600 mb-4">{fetchError}</h2>
      <button onClick={() => router.push('/admin')} className="text-gray-700 underline hover:text-black">
        Return to Dashboard
      </button>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-black text-gray-900">Edit Bhajan</h1>
        <button onClick={() => router.push('/admin')} className="text-gray-500 hover:text-gray-800 font-bold">Back to Dashboard</button>
      </div>

      {/* =========================================================
          MAIN BHAJAN FORM
          ========================================================= */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- 1. Basic Info --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hinglish) *</label>
              <input required type="text" value={formData.title_hinglish} onChange={(e) => setFormData({...formData, title_hinglish: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hindi) *</label>
              <input required type="text" value={formData.title_hindi} onChange={(e) => setFormData({...formData, title_hindi: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug * (Changing breaks old links)</label>
              <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">तर्ज / Tarz (Tune - Optional)</label>
              <input type="text" value={formData.tarz} onChange={(e) => setFormData({...formData, tarz: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="e.g. Ramayan Chaupai" />
            </div>
          </div>
        </div>

        {/* --- 2. Lyrics & Meaning --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lyrics (Hindi) *</label>
              <textarea required rows={10} value={formData.lyrics_hindi} onChange={(e) => setFormData({...formData, lyrics_hindi: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-sans"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lyrics (Hinglish)</label>
              <textarea rows={10} value={formData.lyrics_hinglish} onChange={(e) => setFormData({...formData, lyrics_hinglish: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl font-sans"></textarea>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Meaning / Bhavarth (SEO Value Add)</label>
            <textarea rows={4} value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="Provide the spiritual meaning or story behind this bhajan..."></textarea>
          </div>
        </div>

        {/* --- 3. Classification & SEO --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-3">Categories (Select Multiple)</label>
            <div className="flex flex-wrap gap-3">
              {categories.map(c => (
                <label key={c.id} className={`cursor-pointer flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${formData.selected_categories.includes(c.id) ? 'bg-orange-100 border-orange-500 text-orange-800 font-bold' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                  <input type="checkbox" className="hidden" checked={formData.selected_categories.includes(c.id)} onChange={() => handleCategoryToggle(c.id)} />
                  {c.name_hinglish}
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Deity</label>
              <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl">
                <option value="">-- Select Deity --</option>
                {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">SEO Tags (Comma Separated)</label>
              <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="e.g. diwali, morning pooja, peaceful" />
            </div>
          </div>

          {/* 🌟 NEW SEO FIELDS BLOCK ADDED HERE */}
          <div className="pt-6 border-t border-gray-200">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Advanced SEO Overrides</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">SEO Title Override</label>
                <input type="text" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="e.g. Achyutam Keshavam Lyrics PDF Download" />
                <p className="text-xs text-gray-500 mt-1">Leave empty to use default auto-generated title.</p>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Alternative Queries (Also Known As)</label>
                <input type="text" value={formData.alt_queries} onChange={(e) => setFormData({...formData, alt_queries: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="e.g. Kaun Kehte Hai Bhagwan, Hey Nath" />
                <p className="text-xs text-gray-500 mt-1">Starting lines users might search for.</p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Custom Meta Description</label>
              <textarea rows={2} value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="Custom snippet for Google. Leave empty to use auto-generated description..."></textarea>
              <div className="flex justify-end mt-1">
                <span className={`text-xs font-bold ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.meta_description.length} / 160 chars
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- 4. FAQs & Media --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="mb-8">
            <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (YouTube or Instagram Reel)</label>
            <input type="text" value={formData.video_embed_url} onChange={(e) => setFormData({...formData, video_embed_url: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="https://www.youtube.com/watch?v=..." />
          </div>

          <div className="flex justify-between items-center mb-4 border-b pb-2">
             <h2 className="text-xl font-bold text-gray-800">FAQs (For Google Snippets)</h2>
             <button type="button" onClick={addFaqRow} className="text-orange-600 flex items-center gap-1 text-sm font-bold hover:underline">
               <FaPlus /> Add FAQ
             </button>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="flex gap-4 items-start">
                <div className="flex-1 space-y-2">
                  <input type="text" placeholder="Question (e.g. Who wrote this Bhajan?)" value={faq.question} onChange={(e) => updateFaq(idx, 'question', e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm" />
                  <textarea placeholder="Answer..." rows={2} value={faq.answer} onChange={(e) => updateFaq(idx, 'answer', e.target.value)} className="w-full p-2 bg-white border border-gray-200 rounded-lg text-sm"></textarea>
                </div>
                {faqs.length > 1 && (
                  <button type="button" onClick={() => removeFaqRow(idx)} className="mt-2 text-red-500 hover:text-red-700 p-2">
                    <FaTrash />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 🌟 OPTIMIZED SUBMIT AREA: Message is now directly above the button */}
        <div className="pt-4 pb-8 border-b border-gray-200 flex flex-col items-start gap-4">
          
          {message && (
            <div className={`px-5 py-3 rounded-xl font-bold w-full md:w-auto flex items-center shadow-sm border ${message.includes('❌') ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
              {message}
            </div>
          )}

          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white font-black rounded-xl hover:bg-gray-800 disabled:opacity-50 transition-colors shadow-md hover:shadow-lg hover:-translate-y-0.5">
            {isSubmitting ? 'Saving Text Changes...' : 'Save Bhajan Text Changes'}
          </button>
        </div>

      </form>

      {/* =========================================================
          ARTIST / SINGER MANAGER (The New Addition!)
          ========================================================= */}
      {formData.id && (
        <div className="mt-12">
          <BhajanArtistManager bhajanId={formData.id} />
        </div>
      )}
      
    </div>
  );
}