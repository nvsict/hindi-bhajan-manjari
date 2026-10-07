"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import { 
  FaPlus, FaSpinner, FaBook, FaLink, FaImage, FaTag, FaRupeeSign, 
  FaListOl, FaTrash, FaCheckCircle, FaTimesCircle, FaGlobe, 
  FaFilePdf, FaSync, FaChevronDown, FaCheck, FaExclamationTriangle 
} from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';

// Custom Multi-Select Component
const MultiSelect = ({ label, options, selected, onChange, icon: Icon }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((item: string) => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 cursor-pointer flex justify-between items-center hover:border-orange-500 transition-all"
      >
        <div className="flex items-center gap-2 overflow-hidden whitespace-nowrap">
          <Icon className="text-gray-400 shrink-0" />
          <span className={selected.length === 0 ? "text-gray-400" : ""}>
            {selected.length === 0 ? `Select ${label}...` : `${selected.length} Selected`}
          </span>
        </div>
        <FaChevronDown className={`text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </div>

      {isOpen && (
        <div className="absolute z-20 w-full mt-2 bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto">
          {options.map((option: string, idx: number) => (
            <label key={idx} className="flex items-center gap-3 px-4 py-3 hover:bg-orange-50 dark:hover:bg-orange-900/20 cursor-pointer border-b border-gray-100 dark:border-white/5 last:border-0">
              <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${selected.includes(option) ? 'bg-orange-500 border-orange-500' : 'border-gray-300 dark:border-gray-600'}`}>
                {selected.includes(option) && <FaCheck className="text-white text-[10px]" />}
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{option}</span>
            </label>
          ))}
        </div>
      )}
      
      {/* Pills Display */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((item: string) => (
            <span key={item} className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-1 rounded-md text-[10px] font-black tracking-wide flex items-center gap-1">
              {item}
              <button onClick={(e) => { e.stopPropagation(); toggleOption(item); }} className="hover:text-red-500"><FaTimesCircle /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export default function EbookManagerClient() {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [generatingSlug, setGeneratingSlug] = useState<string | null>(null);
  
  const [ebooks, setEbooks] = useState<any[]>([]);
  const [deities, setDeities] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [message, setMessage] = useState({ text: '', type: '' });

  // 🌟 Upgraded Form State
  const [formData, setFormData] = useState({
    title: '', slug: '', subtitle: '', cover_image_url: '', 
    price: 49, original_price: 99, tag: 'Best Seller', target_count: 21, 
    filter_deities: [] as string[], 
    filter_categories: [] as string[]
  });

  // 🌟 Verification State
  const [verification, setVerification] = useState({ isVerifying: false, isVerified: false, availableCount: 0, error: '' });

  const fetchAllData = async () => {
    setFetching(true);
    const { data: ebookData } = await supabase.from('ebook_templates').select('*').order('created_at', { ascending: false });
    if (ebookData) setEbooks(ebookData);

    const { data: deityData } = await supabase.from('deities').select('name_hindi');
    if (deityData) setDeities(deityData.map(d => d.name_hindi).filter(Boolean));

    const { data: categoryData } = await supabase.from('categories').select('name_hindi');
    if (categoryData) setCategories(categoryData.map(c => c.name_hindi).filter(Boolean));

    setFetching(false);
  };

  useEffect(() => { fetchAllData(); }, []);

  // Invalidate verification if filters change
  useEffect(() => {
    if (verification.isVerified || verification.error) {
      setVerification({ isVerifying: false, isVerified: false, availableCount: 0, error: '' });
    }
  }, [formData.target_count, formData.filter_deities, formData.filter_categories]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title.toLowerCase().trim().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '');
    setFormData({ ...formData, title, slug });
  };

  // 🌟 NEW: Verify Count Function
  const handleVerify = async () => {
    setVerification({ ...verification, isVerifying: true, error: '' });
    try {
      let countQuery = supabase.from('mv_bhajan_details').select('*', { count: 'exact', head: true });
      
      if (formData.filter_deities.length > 0) {
        countQuery = countQuery.in('deity->>name_hindi', formData.filter_deities);
      }
      if (formData.filter_categories.length > 0) {
        // Applying AND condition if multiple categories selected
        formData.filter_categories.forEach(cat => {
          countQuery = countQuery.contains('categories', JSON.stringify([{ name_hindi: cat }]));
        });
      }

      const { count, error: countErr } = await countQuery;
      if (countErr) throw new Error('Failed to query database.');

      const availableCount = count || 0;
      if (formData.target_count > availableCount) {
        setVerification({ isVerifying: false, isVerified: false, availableCount, error: `Only ${availableCount} bhajans available with these filters. Reduce target count.` });
      } else {
        setVerification({ isVerifying: false, isVerified: true, availableCount, error: '' });
      }
    } catch (err: any) {
      setVerification({ isVerifying: false, isVerified: false, availableCount: 0, error: err.message });
    }
  };

  const generatePdfForEbook = async (targetSlug: string) => {
    setGeneratingSlug(targetSlug);
    try {
      const res = await fetch('/api/admin/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: targetSlug })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setMessage({ text: 'E-Book & PDF successfully generated! 🎉', type: 'success' });
      fetchAllData();
    } catch (err: any) {
      setMessage({ text: `E-Book saved, but PDF failed: ${err.message}`, type: 'error' });
    } finally {
      setGeneratingSlug(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verification.isVerified) {
      setMessage({ text: 'Please verify the rule engine count before publishing.', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      // 🌟 STEP 2: INSERT E-BOOK
      const payload = { ...formData };
      const { error } = await supabase.from('ebook_templates').insert([payload]);
      if (error) throw error;

      setMessage({ text: 'E-Book Saved! Generating PDF in background... ⏳', type: 'success' });
      
      const savedSlug = formData.slug;
      setFormData({ title: '', slug: '', subtitle: '', cover_image_url: '', price: 49, original_price: 99, tag: 'Best Seller', target_count: 21, filter_deities: [], filter_categories: [] });
      setVerification({ isVerifying: false, isVerified: false, availableCount: 0, error: '' });
      
      await generatePdfForEbook(savedSlug);
    } catch (error: any) {
      setMessage({ text: error.message || 'Error creating E-Book', type: 'error' });
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase.from('ebook_templates').update({ is_active: !currentStatus }).eq('id', id);
    if (!error) fetchAllData();
  };

  const handleDelete = async (id: string, slug: string) => {
    if (!confirm("Are you sure you want to delete this E-Book and its PDF?")) return;
    await supabase.from('ebook_templates').delete().eq('id', id);
    await supabase.storage.from('ebook_pdfs').remove([`${slug}.pdf`]);
    fetchAllData();
  };

  const inputStyle = "w-full bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 dark:text-gray-200 outline-none focus:border-orange-500 focus:bg-white dark:focus:bg-black/40 transition-all appearance-none";

  return (
    <div className="max-w-[95rem] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
      
      {/* 🌟 LEFT COLUMN: UPGRADED FORM */}
      <div className="xl:col-span-5 xl:sticky xl:top-28 relative z-10">
        <div className="backdrop-blur-xl bg-white/90 dark:bg-[#1a120b]/90 border border-gray-200/80 dark:border-white/5 p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-orange-900/5">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <FaPlus className="text-orange-500" /> Create New E-Book
          </h2>

          {message.text && (
            <div className={`p-4 rounded-xl mb-6 text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* SECTION: BASIC INFO */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/10 pb-2">Basic Details</h3>
              
              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">Book Title</label>
                <div className="relative">
                  <FaBook className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input type="text" required value={formData.title} onChange={handleTitleChange} className={`pl-10 ${inputStyle}`} placeholder="उदा. श्री राम 51 भजन संग्रह" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">URL Slug</label>
                  <div className="relative">
                    <FaLink className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="text" required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className={`pl-10 ${inputStyle}`} placeholder="shri-ram-51" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">Cover Image URL</label>
                  <div className="relative">
                    <FaImage className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="url" required value={formData.cover_image_url} onChange={(e) => setFormData({...formData, cover_image_url: e.target.value})} className={`pl-10 ${inputStyle}`} placeholder="https://..." />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">Subtitle (Description)</label>
                <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className={inputStyle} placeholder="भावार्थ सहित सम्पूर्ण संग्रह" />
              </div>
            </div>

            {/* SECTION: PRICING */}
            <div className="space-y-4">
              <h3 className="text-xs font-black text-gray-400 uppercase tracking-widest border-b border-gray-100 dark:border-white/10 pb-2">Marketing & Pricing</h3>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">Price</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="number" required value={formData.price} onChange={(e) => setFormData({...formData, price: Number(e.target.value) || 0})} className={`pl-7 ${inputStyle}`} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">Orig. Price</label>
                  <div className="relative">
                    <FaRupeeSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="number" required value={formData.original_price} onChange={(e) => setFormData({...formData, original_price: Number(e.target.value) || 0})} className={`pl-7 ${inputStyle}`} />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-1 block">Badge Tag</label>
                  <div className="relative">
                    <FaTag className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs" />
                    <input type="text" value={formData.tag} onChange={(e) => setFormData({...formData, tag: e.target.value})} className={`pl-8 ${inputStyle}`} placeholder="Best Seller" />
                  </div>
                </div>
              </div>
            </div>

            {/* 🌟 SECTION: DYNAMIC RULES ENGINE (UPGRADED) */}
            <div className="bg-orange-50/50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 rounded-2xl p-5 shadow-inner">
              <h3 className="text-sm font-black text-orange-800 dark:text-orange-400 mb-4 flex items-center justify-between">
                <span className="flex items-center gap-2"><FaListOl /> Content Generator Rules</span>
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <MultiSelect 
                    label="Filter by Deities" 
                    icon={FaListOl} 
                    options={deities} 
                    selected={formData.filter_deities} 
                    onChange={(val: string[]) => setFormData({...formData, filter_deities: val})} 
                  />
                  <MultiSelect 
                    label="Filter by Categories" 
                    icon={FaListOl} 
                    options={categories} 
                    selected={formData.filter_categories} 
                    onChange={(val: string[]) => setFormData({...formData, filter_categories: val})} 
                  />
                </div>

                <div className="flex flex-col sm:flex-row items-end gap-4 pt-2">
                  <div className="w-full sm:w-1/3">
                    <label className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase mb-1 block">Target Count</label>
                    <input type="number" required value={formData.target_count} onChange={(e) => setFormData({...formData, target_count: Number(e.target.value) || 0})} className={inputStyle} />
                  </div>
                  
                  {/* 🌟 VERIFY BUTTON & STATUS */}
                  <div className="w-full sm:w-2/3 flex items-center gap-3">
                    <button 
                      type="button" 
                      onClick={handleVerify}
                      disabled={verification.isVerifying}
                      className={`flex-1 py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                        verification.isVerified 
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-800 hover:bg-gray-700 text-white shadow-md'
                      }`}
                    >
                      {verification.isVerifying ? <FaSpinner className="animate-spin" /> : verification.isVerified ? <FaCheckCircle /> : <FaSync />}
                      {verification.isVerified ? 'Verified' : 'Verify Availability'}
                    </button>
                  </div>
                </div>

                {/* Validation Feedback */}
                {verification.error && (
                  <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 p-3 rounded-lg border border-red-100">
                    <FaExclamationTriangle className="text-sm shrink-0" /> {verification.error}
                  </div>
                )}
                {verification.isVerified && (
                  <div className="flex items-center gap-2 text-green-700 text-xs font-bold bg-green-50 p-3 rounded-lg border border-green-100">
                    <FaCheckCircle className="text-sm shrink-0" /> Awesome! Found {verification.availableCount} matching bhajans for your target of {formData.target_count}.
                  </div>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading || generatingSlug !== null || !verification.isVerified} 
              className={`w-full py-4 rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 font-black text-white ${
                !verification.isVerified ? 'bg-gray-300 dark:bg-gray-700 cursor-not-allowed' : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
              }`}
            >
              {loading ? <FaSpinner className="animate-spin" /> : 'Publish E-Book Template'}
            </button>
          </form>
        </div>
      </div>

      {/* RIGHT COLUMN: LIST (Remains largely the same, optimized formatting) */}
      <div className="xl:col-span-7">
        <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1a120b]/80 border border-gray-200/80 dark:border-white/5 p-6 sm:p-8 rounded-[2rem] shadow-2xl shadow-orange-900/5">
          <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2 border-b border-gray-100 dark:border-white/10 pb-4">
            <FaBook className="text-orange-500" /> Live E-Books Inventory
          </h2>

          {fetching ? (
            <div className="py-20 flex justify-center text-orange-500"><FaSpinner className="animate-spin text-3xl" /></div>
          ) : ebooks.length === 0 ? (
            <div className="py-20 text-center text-gray-500 font-bold bg-gray-50 dark:bg-white/5 rounded-2xl">No E-books found. Create your first template!</div>
          ) : (
            <div className="space-y-4">
              {ebooks.map((ebook) => (
                <div key={ebook.id} className="bg-white dark:bg-black/20 border border-gray-100 dark:border-white/5 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-center sm:items-stretch shadow-sm hover:shadow-md transition-shadow">
                  
                  <div className="relative w-24 h-32 shrink-0 rounded-lg overflow-hidden border border-gray-200">
                    <Image src={ebook.cover_image_url} alt={ebook.title} fill className="object-cover" />
                  </div>

                  <div className="flex-1 text-center sm:text-left flex flex-col justify-center">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-full ${ebook.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {ebook.is_active ? 'Live' : 'Hidden'}
                      </span>
                      <span className="bg-orange-100 text-orange-700 px-2 py-0.5 text-[10px] font-black uppercase rounded-full">
                        {ebook.target_count} Bhajans
                      </span>
                      {ebook.pdf_url ? (
                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                          <FaCheckCircle /> PDF Ready
                        </span>
                      ) : (
                        <span className="bg-gray-100 text-gray-500 px-2 py-0.5 text-[10px] font-black uppercase rounded-full flex items-center gap-1">
                          <FaFilePdf /> No PDF
                        </span>
                      )}
                    </div>
                    
                    <h3 className="font-black text-lg text-gray-900 dark:text-white leading-tight">{ebook.title}</h3>
                    <p className="text-xs font-mono text-gray-400 mt-1">/{ebook.slug}</p>
                    
                    <div className="mt-3 flex items-center justify-center sm:justify-start gap-4 text-sm font-bold flex-wrap">
                      <span className="text-orange-600">₹{ebook.price} <span className="line-through text-gray-400 text-xs ml-1">₹{ebook.original_price}</span></span>
                    </div>
                  </div>

                  <div className="flex flex-row sm:flex-col gap-2 justify-center shrink-0 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-white/10 pt-4 sm:pt-0 sm:pl-4">
                    <button 
                      onClick={() => generatePdfForEbook(ebook.slug)} 
                      disabled={generatingSlug === ebook.slug}
                      className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-100 flex items-center justify-center transition-colors disabled:opacity-50" 
                      title="Regenerate/Create PDF"
                    >
                      {generatingSlug === ebook.slug ? <FaSpinner className="animate-spin" /> : <FaSync />}
                    </button>
                    
                    <Link href={`/ebook/${ebook.slug}`} target="_blank" className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-600 hover:bg-orange-50 hover:text-orange-600 flex items-center justify-center transition-colors" title="View Page">
                      <FaGlobe />
                    </Link>
                    <button onClick={() => toggleStatus(ebook.id, ebook.is_active)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${ebook.is_active ? 'bg-red-50 text-red-500 hover:bg-red-100' : 'bg-green-50 text-green-500 hover:bg-green-100'}`} title={ebook.is_active ? "Hide Book" : "Make Live"}>
                      {ebook.is_active ? <FaTimesCircle /> : <FaCheckCircle />}
                    </button>
                    <button onClick={() => handleDelete(ebook.id, ebook.slug)} className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 text-gray-400 hover:bg-red-50 hover:text-red-600 flex items-center justify-center transition-colors" title="Delete">
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