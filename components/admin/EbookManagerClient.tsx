"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { FaPlus, FaSpinner, FaBook, FaLink, FaImage, FaTag, FaRupeeSign, FaListOl, FaPrayingHands, FaTrash, FaCheckCircle, FaTimesCircle, FaGlobe, FaFolderOpen } from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

export default function EbookManagerClient() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // 🌟 Data States
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [deities, setDeities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [message, setMessage] = useState({ text: '', type: '' });

  // 🌟 Form State
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    subtitle: '',
    cover_image_url: '',
    price: 49,
    original_price: 99,
    tag: 'Best Seller',
    target_count: 21,
    filter_deity_name: '',
    filter_category_name: ''
  });

  // 🌟 Fetch E-Books, Deities, and Categories together
  const fetchAllData = async () => {
    setFetching(true);
    
    // 1. Fetch E-books
    const { data: ebookData } = await supabase
      .from('ebook_templates')
      .select('*')
      .order('created_at', { ascending: false });
    if (ebookData) setEbooks(ebookData);

    // 2. Fetch Deities for Dropdown
    const { data: deityData } = await supabase.from('deities').select('name_hindi');
    if (deityData) setDeities(deityData.map(d => d.name_hindi).filter(Boolean));

    // 3. Fetch Categories for Dropdown
    const { data: categoryData } = await supabase.from('categories').select('name_hindi');
    if (categoryData) setCategories(categoryData.map(c => c.name_hindi).filter(Boolean));

    setFetching(false);
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // 🌟 Auto-generate Slug from Title
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    setFormData({ ...formData, title, slug });
  };

 // 🌟 Submit New E-Book (With Smart Pre-validation)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // ==============================================
      // 🌟 STEP 1: PRE-VALIDATION (Check available bhajans)
      // ==============================================
      let countQuery = supabase.from('mv_bhajan_details').select('*', { count: 'exact', head: true });
      
      if (formData.filter_deity_name) {
        countQuery = countQuery.eq('deity->>name_hindi', formData.filter_deity_name);
      }
      if (formData.filter_category_name) {
        countQuery = countQuery.contains('categories', JSON.stringify([{ name_hindi: formData.filter_category_name }]));
      }

      const { count, error: countErr } = await countQuery;

      if (countErr) throw new Error('डेटाबेस से भजन चेक करने में समस्या आई।');

      const availableCount = count || 0;

      // अगर माँगे गए भजन डेटाबेस में मौजूद भजनों से ज़्यादा हैं, तो एरर दें और रोक दें!
      if (formData.target_count > availableCount) {
        throw new Error(`⚠️ चेतावनी: डेटाबेस में इस फ़िल्टर के सिर्फ ${availableCount} भजन उपलब्ध हैं। कृपया Target Count ${availableCount} या उससे कम रखें!`);
      }

      // ==============================================
      // 🌟 STEP 2: INSERT E-BOOK IF VALIDATION PASSES
      // ==============================================
      const payload = {
        ...formData,
        filter_deity_name: formData.filter_deity_name || null,
        filter_category_name: formData.filter_category_name || null,
      };

      const { error } = await supabase.from('ebook_templates').insert([payload]);

      if (error) throw error;

      setMessage({ text: 'E-Book successfully created! 🎉', type: 'success' });
      setFormData({
        title: '', slug: '', subtitle: '', cover_image_url: '', price: 49, 
        original_price: 99, tag: 'Best Seller', target_count: 21, 
        filter_deity_name: '', filter_category_name: ''
      });
      fetchAllData(); // Refresh list

    } catch (error: any) {
      setMessage({ text: error.message || 'Error creating E-Book', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // 🌟 Toggle Active Status
  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('ebook_templates').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchAllData();
  };

  // 🌟 Delete E-Book
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this E-Book?")) return;
    const { error } = await supabase.from('ebook_templates').delete().eq('id', id);
    if (!error) fetchAllData();
  };

  const inputStyle = "w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-black/40 transition-all appearance-none";

  return (
    <div className="max-w-[90rem] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* ==========================================
          LEFT COLUMN: ADD E-BOOK FORM
          ========================================== */}
      <div className="xl:col-span-5 xl:sticky xl:top-28 relative z-10">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1a120b]/80 border border-gray-200/80 dark:border-white/5 p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-orange-900/5">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaPlus className="text-orange-500" /> Create New E-Book
          </h2>

          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Title & Slug */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Book Title</label>
              <div className="relative">
                <FaBook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={formData.title} onChange={handleTitleChange} className={`pl-10 ${inputStyle}`} placeholder="उदा. श्री राम 51 भजन संग्रह" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">URL Slug</label>
              <div className="relative">
                <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className={`pl-10 ${inputStyle}`} placeholder="shri-ram-51-sangrah" />
              </div>
            </div>

            {/* Subtitle & Image */}
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Subtitle (Description)</label>
              <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className={inputStyle} placeholder="भावार्थ सहित सम्पूर्ण संग्रह" />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Cover Image URL</label>
              <div className="relative">
                <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="url" required value={formData.cover_image_url} onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})} className={`pl-10 ${inputStyle}`} placeholder="https://..." />
              </div>
            </div>

            {/* Price & Tag */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Price</label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value) || 0})} className={`pl-7 ${inputStyle}`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Orig. Price</label>
                <div className="relative">
                  <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="number" required value={formData.original_price} onChange={(e) => setFormData({...formData, original_price: Number(e.target.value) || 0})} className={`pl-7 ${inputStyle}`} />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1 block">Badge Tag</label>
                <div className="relative">
                  <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                  <input type="text" value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} className={`pl-8 ${inputStyle}`} placeholder="Best Seller" />
                </div>
              </div>
            </div>

            {/* 🌟 Rules Engine (Dynamic Filters with Dropdowns) */}
            <div className="bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-xl p-4 mt-2">
              <h3 className="text-sm font-black text-orange-800 dark:text-orange-400 mb-3 flex items-center gap-2">
                <FaListOl /> Dynamic Rules Engine
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1 block">Target Count (Total Bhajans)</label>
                  <input type="number" required value={formData.target_count} onChange={(e) => setFormData({...formData, target_count: Number(e.target.value) || 0})} className={inputStyle} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  {/* Deity Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1 block">Deity (Optional)</label>
                    <div className="relative">
                      <FaPrayingHands className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs z-10" />
                      <select 
                        value={formData.filter_deity_name} 
                        onChange={(e) => setFormData({...formData, filter_deity_name: e.target.value})} 
                        className={`pl-8 pr-4 ${inputStyle} cursor-pointer`}
                      >
                        <option value="">-- सभी देवता --</option>
                        {deities.map((deity, idx) => (
                          <option key={idx} value={deity}>{deity}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Category Dropdown */}
                  <div>
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1 block">Category (Optional)</label>
                    <div className="relative">
                      <FaFolderOpen className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs z-10" />
                      <select 
                        value={formData.filter_category_name} 
                        onChange={(e) => setFormData({...formData, filter_category_name: e.target.value})} 
                        className={`pl-8 pr-4 ${inputStyle} cursor-pointer`}
                      >
                        <option value="">-- सभी श्रेणियाँ --</option>
                        {categories.map((cat, idx) => (
                          <option key={idx} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" disabled={loading} className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
              {loading ? <FaSpinner className="animate-spin" /> : 'Publish E-Book Template'}
            </button>
          </form>
        </div>
      </div>

      {/* ==========================================
          RIGHT COLUMN: E-BOOK MANAGER LIST
          ========================================== */}
      <div className="xl:col-span-7">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1a120b]/80 border border-gray-200/80 dark:border-white/5 p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-orange-900/5">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
            <FaBook className="text-orange-500" /> Live E-Books Inventory
          </h2>

          {fetching ? (
            <div className="py-20 flex justify-center text-orange-500"><FaSpinner className="animate-spin text-3xl" /></div>
          ) : ebooks.length === 0 ? (
            <div className="py-20 text-center text-gray-500 font-bold">No E-books found. Create your first template!</div>
          ) : (
            <div className="space-y-4">
              {ebooks.map((ebook) => (
                <div key={ebook.id} className="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-stretch shadow-sm hover:shadow-md transition-shadow">
                  
                  {/* Cover Preview */}
                  <div className="relative w-24 h-32 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={ebook.cover_image_url} alt={ebook.title} fill className="object-cover" />
                  </div>

                  {/* Details */}
                  <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${ebook.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ebook.is_active ? 'Live' : 'Hidden'}
                      </span>
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 text-[10px] font-black uppercase rounded-full">
                        {ebook.target_count} Bhajans
                      </span>
                    </div>
                    
                    <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight">{ebook.title}</h3>
                    <p className="text-xs font-mono text-gray-400 mt-1">/{ebook.slug}</p>
                    
                    <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-sm font-bold flex-wrap">
                      <span className="text-orange-600">₹{ebook.price} <span className="line-through text-gray-400 text-xs">₹{ebook.original_price}</span></span>
                      {ebook.filter_deity_name && <span className="text-gray-500 text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><FaPrayingHands/> {ebook.filter_deity_name}</span>}
                      {ebook.filter_category_name && <span className="text-gray-500 text-xs flex items-center gap-1 bg-gray-100 px-2 py-1 rounded-md"><FaFolderOpen/> {ebook.filter_category_name}</span>}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-row sm:flex-col gap-2 justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-white/10 pt-4 sm:pt-0 sm:pl-4">
                    <Link href={`/ebook/${ebook.slug}`} target="_blank" className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-colors" title="View Page">
                      <FaGlobe />
                    </Link>
                    <button onClick={() => toggleStatus(ebook.id, ebook.is_active)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${ebook.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`} title={ebook.is_active ? "Hide Book" : "Make Live"}>
                      {ebook.is_active ? <FaTimesCircle /> : <FaCheckCircle />}
                    </button>
                    <button onClick={() => handleDelete(ebook.id)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors" title="Delete">
                      <FaTrash />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
    </div>
  );
}