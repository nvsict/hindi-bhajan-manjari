"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../utils/supabase'; // ड्रॉपडाउन्स (Categories/Deities) लोड करने के लिए
import { publishBhajanAction } from '@/app/actions/bhajanActions';
import { 
  FaPlus, FaTrash, FaMusic, FaBookOpen, FaTags, 
  FaVideo, FaGlobe, FaCheckCircle, FaSpinner, FaLayerGroup 
} from 'react-icons/fa';
import { useRouter } from 'next/navigation';

import BhajanArtistManager from '@/components/admin/BhajanArtistManager'; 

const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
};

export default function AddBhajanPage() {
  const router = useRouter();

  const [categories, setCategories] = useState<any[]>([]);
  const [deities, setDeities] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");

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
    seo_title: '',
    meta_description: '',
    alt_queries: '',
  });

  const [faqs, setFaqs] = useState([{ question: '', answer: '' }]);

  // पेज लोड होते ही Categories और Deities फेच करना (Client Side से पढ़ना बिल्कुल सेफ है)
  useEffect(() => {
    const fetchDropdownData = async () => {
      const [catResponse, deityResponse] = await Promise.all([
        supabase.from('categories').select('id, name_hinglish'),
        supabase.from('deities').select('id, name_hinglish')
      ]);
      
      if (catResponse.data) setCategories(catResponse.data);
      if (deityResponse.data) setDeities(deityResponse.data);
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
          slug: generateSlug(titleParam || ''),
          lyrics_hindi: lyricsParam || '',
        }));
      }
    }
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData({ ...formData, title_hinglish: title, slug: generateSlug(title) });
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
    newFaqs[index] = { ...newFaqs[index], [field]: value };
    setFaqs(newFaqs);
  };

  // 🌟 SUPERCHARGED FORM SUBMIT 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Sending data to secure server...");

    try {
      // Server Action को भेजने के लिए पूरा पैकेज तैयार किया
      const payload = {
        formData: formData,
        faqs: faqs,
        selectedArtists: selectedArtists,
        categories: formData.selected_categories
      };

      // 🌟 जादू यहाँ है: ब्राउज़र से सीधा सर्वर को डाटा भेज दिया (No direct Supabase write)
      const response = await publishBhajanAction(payload);

      if (response.success) {
        setMessage("success");
        setTimeout(() => {
          router.push('/admin');
          router.refresh(); // डेटा रिफ्रेश करने के लिए
        }, 1500);
      } else {
        // अगर Server Action से कोई एरर आया (जैसे Database Conflict)
        setMessage(`❌ ${response.error}`);
        setIsSubmitting(false);
      }

    } catch (err: any) {
      // अगर नेटवर्क टूट गया या 500 Server Error आया
      setMessage(`❌ Network Error: Could not reach the server.`);
      setIsSubmitting(false);
    } 
  };

  return (
    <div className="max-w-4xl mx-auto bg-white/90 backdrop-blur-xl p-6 md:p-10 rounded-[2.5rem] shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] border border-gray-100 mb-24">
      
      {/* Header Banner */}
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
        <div className="w-14 h-14 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
          <FaMusic />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Upload New Bhajan</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Add lyrics, SEO details, and metadata to publish instantly.</p>
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
              <span>Bhajan published securely via Server! Redirecting...</span>
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
              <input required type="text" value={formData.title_hinglish} onChange={handleTitleChange} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-bold text-gray-900 transition-all" placeholder="e.g. Hanuman Chalisa" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Title (Hindi) *</label>
              <input required type="text" value={formData.title_hindi} onChange={(e) => setFormData({...formData, title_hindi: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-bold text-gray-900 transition-all" placeholder="e.g. हनुमान चालीसा" />
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">URL Slug (Auto-generated)</label>
              <input required type="text" value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full p-4 bg-gray-100/80 border border-gray-200 rounded-2xl text-gray-500 font-mono text-xs select-all" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">तर्ज / Tarz (Tune - Optional)</label>
              <input type="text" value={formData.tarz} onChange={(e) => setFormData({...formData, tarz: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-medium text-gray-900 transition-all" placeholder="e.g. Ramayan Chaupai" />
            </div>
          </div>
        </div>

        {/* --- 2. Lyrics & Meaning --- */}
        <div className="bg-gray-50/60 p-6 md:p-8 rounded-3xl border border-gray-100/80">
          <div className="flex items-center gap-2.5 text-orange-600 font-extrabold text-lg mb-6">
            <FaMusic size={18} />
            <h2>2. Lyrics & Spiritual Meaning</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Lyrics (Hindi) *</label>
                <span className="text-[10px] font-bold text-gray-400">{formData.lyrics_hindi.length} chars</span>
              </div>
              <textarea required rows={10} value={formData.lyrics_hindi} onChange={(e) => setFormData({...formData, lyrics_hindi: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none text-sm font-hindi leading-relaxed transition-all" placeholder="यहाँ हिंदी में लिरिक्स लिखें..."></textarea>
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Lyrics (Hinglish) <span className="text-gray-400 font-normal">Optional</span></label>
                <span className="text-[10px] font-bold text-gray-400">{formData.lyrics_hinglish.length} chars</span>
              </div>
              <textarea rows={10} value={formData.lyrics_hinglish} onChange={(e) => setFormData({...formData, lyrics_hinglish: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none text-sm leading-relaxed transition-all" placeholder="Write lyrics in English alphabets..."></textarea>
            </div>
          </div>
          
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Meaning / Bhavarth (SEO Value Add)</label>
            <textarea rows={4} value={formData.explanation} onChange={(e) => setFormData({...formData, explanation: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none text-sm transition-all" placeholder="Provide the spiritual meaning or story behind this bhajan..."></textarea>
          </div>
        </div>

        {/* --- 3. Classification & SEO --- */}
        <div className="bg-gray-50/60 p-6 md:p-8 rounded-3xl border border-gray-100/80">
          <div className="flex items-center gap-2.5 text-orange-600 font-extrabold text-lg mb-6">
            <FaLayerGroup size={18} />
            <h2>3. Classification & SEO</h2>
          </div>
          
          {/* Categories Pill Selector */}
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
               <input type="text" placeholder="Hindi Name" value={formData.new_category_hindi} onChange={(e) => setFormData({...formData, new_category_hindi: e.target.value})} className="w-full p-2.5 text-xs rounded-xl border border-gray-200 outline-none focus:border-orange-400" />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500">Deity</label>
              <select value={formData.deity_id} onChange={(e) => setFormData({...formData, deity_id: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none font-bold text-gray-900 transition-all">
                <option value="">-- Select Deity --</option>
                <option value="new" className="font-extrabold text-orange-600">➕ Create New Deity...</option>
                {deities.map(d => <option key={d.id} value={d.id}>{d.name_hinglish}</option>)}
              </select>

              {formData.deity_id === 'new' && (
                <div className="p-4 bg-orange-50/80 border border-orange-100 rounded-2xl space-y-3 animate-fadeIn">
                  <input type="text" placeholder="New Deity (Hinglish)" value={formData.new_deity_hinglish} onChange={(e) => setFormData({...formData, new_deity_hinglish: e.target.value})} className="w-full p-3 bg-white text-xs rounded-xl border border-orange-200 outline-none font-bold" />
                  <input type="text" placeholder="New Deity (Hindi)" value={formData.new_deity_hindi} onChange={(e) => setFormData({...formData, new_deity_hindi: e.target.value})} className="w-full p-3 bg-white text-xs rounded-xl border border-orange-200 outline-none font-bold" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">SEO Tags (Comma Separated)</label>
              <input type="text" value={formData.tags} onChange={(e) => setFormData({...formData, tags: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none text-sm transition-all" placeholder="e.g. diwali, morning pooja, peaceful" />
              <p className="text-[11px] text-gray-400 mt-1.5">These will become clickable links at the bottom of the page.</p>
            </div>
          </div>

          {/* Advanced SEO */}
          <div className="pt-6 border-t border-gray-200/80">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-700 mb-4">Advanced SEO Overrides</h3>
            
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">SEO Title Override</label>
                <input type="text" value={formData.seo_title} onChange={(e) => setFormData({...formData, seo_title: e.target.value})} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:border-orange-400 outline-none" placeholder="e.g. Achyutam Keshavam Lyrics PDF" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2">Alternative Queries (Also Known As)</label>
                <input type="text" value={formData.alt_queries} onChange={(e) => setFormData({...formData, alt_queries: e.target.value})} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:border-orange-400 outline-none" placeholder="e.g. Kaun Kehte Hai Bhagwan" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 mb-2">Custom Meta Description</label>
              <textarea rows={2} value={formData.meta_description} onChange={(e) => setFormData({...formData, meta_description: e.target.value})} className="w-full p-3.5 bg-white border border-gray-200 rounded-2xl text-sm focus:border-orange-400 outline-none" placeholder="Custom snippet for Google..."></textarea>
              <div className="flex justify-end mt-1">
                <span className={`text-[11px] font-bold ${formData.meta_description.length > 160 ? 'text-red-500' : 'text-gray-400'}`}>
                  {formData.meta_description.length} / 160 chars
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* --- 4. FAQs Schema --- */}
        <div className="bg-gray-50/60 p-6 md:p-8 rounded-3xl border border-gray-100/80">
          <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2.5 text-orange-600 font-extrabold text-lg">
               <FaGlobe size={18} />
               <h2>4. FAQs (For Google Snippets)</h2>
             </div>
             <button type="button" onClick={addFaqRow} className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-4 py-2 rounded-xl flex items-center gap-1.5 text-xs font-black uppercase tracking-wider transition-all">
               <FaPlus size={10} /> Add FAQ
             </button>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="flex gap-3 items-start bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs">
                <div className="flex-1 space-y-3">
                  <input type="text" placeholder="Question (e.g. Who wrote this Bhajan?)" value={faq.question} onChange={(e) => updateFaq(idx, 'question', e.target.value)} className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-orange-400" />
                  <textarea placeholder="Answer..." rows={2} value={faq.answer} onChange={(e) => updateFaq(idx, 'answer', e.target.value)} className="w-full p-3 bg-gray-50/50 border border-gray-200 rounded-xl text-xs outline-none focus:border-orange-400"></textarea>
                </div>
                {faqs.length > 1 && (
                  <button type="button" onClick={() => removeFaqRow(idx)} className="text-red-400 hover:text-red-600 p-2.5 rounded-xl hover:bg-red-50 transition-all">
                    <FaTrash size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- 5. Media & Artists --- */}
        <div className="bg-gray-50/60 p-6 md:p-8 rounded-3xl border border-gray-100/80">
          <div className="flex items-center gap-2.5 text-orange-600 font-extrabold text-lg mb-6">
            <FaVideo size={18} />
            <h2>5. Media & Artists</h2>
          </div>
          
          <div className="mb-6">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">Video URL (YouTube or Instagram Reel)</label>
            <input type="text" value={formData.video_embed_url} onChange={(e) => setFormData({...formData, video_embed_url: e.target.value})} className="w-full p-4 bg-white border border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none text-sm transition-all" placeholder="https://youtube.com/watch?v=..." />
          </div>

          <div className="pt-6 border-t border-gray-200/80">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-700 mb-1">Assign Artists</h3>
            <p className="text-xs text-gray-400 mb-4">Select singers, writers, or composers linked to this bhajan.</p>
            
            <BhajanArtistManager 
               selectedArtists={selectedArtists} 
               onChange={setSelectedArtists} 
            />
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
              <><FaSpinner className="animate-spin text-lg" /> Sending to Server...</>
            ) : (
              <>Publish Bhajan Securely <FaCheckCircle /></>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}