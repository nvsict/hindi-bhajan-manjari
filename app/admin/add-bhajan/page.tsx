"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase';
import { FaPlus, FaTrash } from 'react-icons/fa';
// 🌟 IMPORT YOUR COMPONENT HERE (Adjust the path as needed)
import BhajanArtistManager from '@/components/admin/BhajanArtistManager'; 

export default function AddBhajanPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [deities, setDeities] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  // 🌟 NEW: State to hold artists selected from the manager before submission
  const [selectedArtists, setSelectedArtists] = useState<{ artist_id: string; role: string }[]>([]);

  const [formData, setFormData] = useState({
    title_hindi: '',
    title_hinglish: '',
    slug: '',
    lyrics_hindi: '',
    lyrics_hinglish: '',
    video_embed_url: '',
    tarz: '',
    explanation: '',
    tags: '', 
    selected_categories: [] as string[], 
    deity_id: '',
    new_category_hinglish: '',
    new_category_hindi: '',
    new_deity_hinglish: '',
    new_deity_hindi: '',
    // 🌟 NEW SEO FIELDS ADDED HERE
    seo_title: '',
    meta_description: '',
    alt_queries: '',
  });

  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  useEffect(() => {
    const fetchDropdownData = async () => {
      const { data: catData } = await supabase.from('categories').select('id, name_hinglish');
      const { data: deityData } = await supabase.from('deities').select('id, name_hinglish');
      if (catData) setCategories(catData);
      if (deityData) setDeities(deityData);
    };
    fetchDropdownData();
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const titleParam = params.get('title');
      const lyricsParam = params.get('lyrics');
      
      if (titleParam || lyricsParam) {
        setFormData(prev => ({
          ...prev,
          title_hindi: titleParam || '',
          title_hinglish: titleParam || '',
          slug: (titleParam || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
          lyrics_hindi: lyricsParam || '',
        }));
      }
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const generatedSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    setFormData({ ...formData, title_hinglish: title, slug: generatedSlug });
  };

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
    setMessage("Processing...");

    try {
      let finalDeityId = formData.deity_id;
      let finalCategories = [...formData.selected_categories];

      // 1. Create New Deity if requested
      if (formData.deity_id === 'new') {
        const deitySlug = formData.new_deity_hinglish.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const { data: newDeity, error: deityError } = await supabase
          .from('deities')
          .insert([{ name_hinglish: formData.new_deity_hinglish, name_hindi: formData.new_deity_hindi, slug: deitySlug }])
          .select('id').single();
        if (deityError) throw new Error(`Deity Error: ${deityError.message}`);
        finalDeityId = newDeity.id;
      }

      // 2. Create New Category if requested
      if (formData.new_category_hinglish) {
        const catSlug = formData.new_category_hinglish.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        const { data: newCat, error: catError } = await supabase
          .from('categories')
          .insert([{ name_hinglish: formData.new_category_hinglish, name_hindi: formData.new_category_hindi, slug: catSlug }])
          .select('id').single();
        if (catError) throw new Error(`Category Error: ${catError.message}`);
        finalCategories.push(newCat.id);
      }

      const cleanFaqs = faqs.filter(f => f.question.trim() !== '' && f.answer.trim() !== '');

      // 3. Insert the Main Bhajan (Now includes SEO fields)
      const { data: bhajanData, error: bhajanError } = await supabase.from('bhajans').insert([
        {
          title_hindi: formData.title_hindi,
          title_hinglish: formData.title_hinglish,
          slug: formData.slug,
          lyrics_hindi: formData.lyrics_hindi,
          lyrics_hinglish: formData.lyrics_hinglish,
          video_embed_url: formData.video_embed_url,
          tarj_parody: formData.tarz,
          singer_details: null, // 🌟 Legacy field, left as null
          deity_id: finalDeityId === 'new' ? null : finalDeityId || null,
          explanation: formData.explanation || null, 
          faqs: cleanFaqs.length > 0 ? cleanFaqs : null,
          // 🌟 INJECTED SEO COLUMNS 
          seo_title: formData.seo_title || null,
          meta_description: formData.meta_description || null,
          alt_queries: formData.alt_queries || null
        }
      ]).select('id').single();

      if (bhajanError) throw new Error(bhajanError.message);
      const newBhajanId = bhajanData.id;

      // 4. Insert Junction Table: Categories
      if (finalCategories.length > 0) {
        const categoryMapData = finalCategories.map(catId => ({
          bhajan_id: newBhajanId,
          category_id: catId
        }));
        await supabase.from('bhajan_category_map').insert(categoryMapData);
      }

      // 🌟 5. Insert Junction Table: Artists (From BhajanArtistManager)
      if (selectedArtists.length > 0) {
        const artistMapData = selectedArtists.map(artist => ({
          bhajan_id: newBhajanId,
          artist_id: artist.artist_id,
          role: artist.role
        }));
        const { error: artistError } = await supabase.from('bhajan_artist_map').insert(artistMapData);
        if (artistError) throw new Error(`Artist Mapping Error: ${artistError.message}`);
      }

      // 6. Process & Insert Tags
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
            bhajan_id: newBhajanId,
            tag_id: tag.id
          }));
          await supabase.from('bhajan_tag_map').insert(tagMapData);
        }
      }

      setMessage("✅ Bhajan, Artists & SEO data published successfully!");
      
      // Reset Form (Including SEO fields)
      setFormData({ 
        title_hindi: '', title_hinglish: '', slug: '', lyrics_hindi: '', lyrics_hinglish: '', 
        video_embed_url: '', tarz: '', explanation: '', tags: '', selected_categories: [], deity_id: '', 
        new_category_hinglish: '', new_category_hindi: '', new_deity_hinglish: '', new_deity_hindi: '',
        seo_title: '', meta_description: '', alt_queries: '' 
      });
      setFaqs([{ question: '', answer: '' }]);
      setSelectedArtists([]); // Reset artists

    } catch (err: any) {
      setMessage(`❌ ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-gray-100 mb-20">
      <h1 className="text-3xl font-black text-gray-900 mb-8">Upload New Bhajan</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-xl font-bold ${message.includes('❌') ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
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
              <input required type="text" value={formData.title_hinglish} onChange={handleTitleChange} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="e.g. Hanuman Chalisa" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Title (Hindi) *</label>
              <input required type="text" value={formData.title_hindi} onChange={(e) => setFormData({...formData, title_hindi: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="e.g. हनुमान चालीसा" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug *</label>
              <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-500 font-mono text-sm" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">तर्ज / Tarz (Tune - Optional)</label>
              <input type="text" value={formData.tarz} onChange={(e) => setFormData({...formData, tarz: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="e.g. Ramayan Chaupai" />
            </div>
          </div>
        </div>

        {/* --- 2. Lyrics & Meaning --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">2. Content & Meaning</h2>
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lyrics (Hindi) *</label>
              <textarea required rows={8} value={formData.lyrics_hindi} onChange={(e) => setFormData({...formData, lyrics_hindi: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500 font-sans"></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Lyrics (Hinglish) <span className="text-gray-500 font-normal">Optional</span></label>
              <textarea rows={8} value={formData.lyrics_hinglish} onChange={(e) => setFormData({...formData, lyrics_hinglish: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500 font-sans"></textarea>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Meaning / Bhavarth (SEO Value Add)</label>
            <textarea rows={4} value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="Provide the spiritual meaning or story behind this bhajan..."></textarea>
          </div>
        </div>

        {/* --- 3. Classification & SEO Tags --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">3. Classification & SEO</h2>
          
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
            
            <div className="mt-4 flex gap-4 items-center">
               <span className="text-sm font-medium text-gray-500">Or add new:</span>
               <input type="text" placeholder="Hinglish Name" value={formData.new_category_hinglish} onChange={(e) => setFormData({...formData, new_category_hinglish: e.target.value})} className="p-2 text-sm rounded-lg border border-gray-200" />
               <input type="text" placeholder="Hindi Name" value={formData.new_category_hindi} onChange={(e) => setFormData({...formData, new_category_hindi: e.target.value})} className="p-2 text-sm rounded-lg border border-gray-200" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-3">
              <label className="block text-sm font-bold text-gray-700">Deity</label>
              <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500">
                <option value="">-- Select Deity --</option>
                <option value="new" className="font-bold text-orange-600">➕ Create New Deity...</option>
                {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish}</option>)}
              </select>

              {formData.deity_id === 'new' && (
                <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-3">
                  <input type="text" placeholder="New Deity (Hinglish)" value={formData.new_deity_hinglish} onChange={(e) => setFormData({...formData, new_deity_hinglish: e.target.value})} className="w-full p-2 rounded-lg border border-orange-200" />
                  <input type="text" placeholder="New Deity (Hindi)" value={formData.new_deity_hindi} onChange={(e) => setFormData({...formData, new_deity_hindi: e.target.value})} className="w-full p-2 rounded-lg border border-orange-200" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">SEO Tags (Comma Separated)</label>
              <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="e.g. diwali, morning pooja, peaceful" />
              <p className="text-xs text-gray-500 mt-1">These will become clickable links at the bottom of the page.</p>
            </div>
          </div>

          {/* 🌟 NEW SEO FIELDS ADDED HERE */}
          <div className="mt-8 border-t border-gray-200 pt-6">
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

        {/* --- 4. FAQs Schema --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <div className="flex justify-between items-center mb-4 border-b pb-2">
             <h2 className="text-xl font-bold text-gray-800">4. FAQs (For Google Snippets)</h2>
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

        {/* --- 5. Media & Artists --- */}
        <div className="bg-gray-50/50 p-6 rounded-2xl border border-gray-100">
          <h2 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">5. Media & Artists</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 mb-2">Video URL (YouTube or Instagram Reel)</label>
            <input type="text" value={formData.video_embed_url} onChange={(e) => setFormData({...formData, video_embed_url: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl focus:outline-orange-500" placeholder="https://youtube.com/..." />
          </div>

          {/* 🌟 INTEGRATED BHAJAN ARTIST MANAGER */}
          <div className="mt-8 border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Assign Artists to this Bhajan</h3>
            <p className="text-sm text-gray-500 mb-4">Select singers, writers, or composers. They will be linked to this bhajan upon publishing.</p>
            
            <BhajanArtistManager 
               selectedArtists={selectedArtists} 
               onChange={setSelectedArtists} 
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full md:w-auto px-10 py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5">
            {isSubmitting ? 'Uploading to Database...' : 'Publish Bhajan & Schema'}
          </button>
        </div>

      </form>
    </div>
  );
}