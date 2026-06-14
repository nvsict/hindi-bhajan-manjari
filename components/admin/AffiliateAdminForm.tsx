'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { supabase } from '@/utils/supabase'; // अपने supabase क्लाइंट का सही पाथ दें

export default function AffiliateAdminForm() {
  const [amazonUrl, setAmazonUrl] = useState('');
  const [formData, setFormData] = useState({ title: '', imageUrl: '', price: '', deityId: '' });
  const [deities, setDeities] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  // 🌟 सीधे Supabase से Deities फेच करें
  useEffect(() => {
    const fetchDeities = async () => {
      const { data } = await supabase.from('deities').select('id, name_hinglish, name_hindi');
      if (data) setDeities(data);
    };
    fetchDeities();
  }, []);

  const fetchAmazonData = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!amazonUrl) return alert("कृपया अमेज़न का लिंक डालें!");
    
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/fetch-amazon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: amazonUrl })
      });
      const data = await res.json();
      
      if (res.ok) {
        setFormData(prev => ({
          ...prev,
          title: data.title || '',
          imageUrl: data.imageUrl || '',
          price: data.price || ''
        }));
        setMessage('✅ डेटा सफलतापूर्वक फेच हो गया! अब आप इसे एडिट कर सकते हैं।');
      } else {
        setMessage(`❌ ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ कुछ गलत हो गया। कृपया मैन्युअली डिटेल्स भरें।");
    }
    setLoading(false);
  };

  // 🌟 अपडेटेड सेव लॉजिक
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Processing...");

    try {
      // 🌟 Supabase Database Insert
      const insertData = {
        title: formData.title,
        amazon_link: amazonUrl,
        image_url: formData.imageUrl,
        price: formData.price,
        // अगर जनरल सेलेक्ट किया है, तो database में null भेजें
        deity_id: formData.deityId === '' ? null : formData.deityId 
      };

      const { error } = await supabase.from('affiliate_products').insert([insertData]);
      
      if (error) throw new Error(error.message);

      setMessage("✅ एफिलिएट प्रोडक्ट सफलतापूर्वक पब्लिश हो गया!");
      
      // फॉर्म को रिसेट करें
      setTimeout(() => {
        setAmazonUrl('');
        setFormData({ title: '', imageUrl: '', price: '', deityId: '' });
        setMessage('');
        // 🌟 पेज को हल्का सा रिफ्रेश करें ताकि लिस्ट में नया प्रोडक्ट दिख जाए
        window.location.reload(); 
      }, 1500);

    } catch (err: any) {
      setMessage(`❌ एरर: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#0c0804] p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-white/10">
      <h1 className="text-3xl font-black text-gray-900 dark:text-orange-50 mb-8">Add Affiliate Product</h1>

      {message && (
        <div className={`p-4 mb-6 rounded-xl font-bold ${message.includes('❌') ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* --- 1. Smart Fetch Section --- */}
        <div className="bg-gray-50/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-white/10 pb-2">1. Smart Amazon Fetch</h2>
          <div className="flex flex-col md:flex-row gap-4 mb-2">
            <div className="flex-1">
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Amazon Product Link *</label>
              <input 
                required 
                type="url" 
                value={amazonUrl}
                onChange={(e) => setAmazonUrl(e.target.value)}
                placeholder="https://amazon.in/dp/..." 
                className="w-full p-3 bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-orange-500 text-gray-900 dark:text-white transition-colors" 
              />
            </div>
            <div className="md:self-end">
              <button 
                onClick={fetchAmazonData}
                disabled={loading}
                className="w-full md:w-auto px-8 py-3 bg-gray-800 dark:bg-white/10 text-white font-bold rounded-xl hover:bg-gray-700 dark:hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                {loading ? 'Fetching...' : 'Auto-Fetch Data'}
              </button>
            </div>
          </div>
        </div>

        {/* --- 2. Editable Content Section --- */}
        <div className="bg-gray-50/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-white/10 pb-2">2. Product Details</h2>
          
          <div className="mb-6">
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Product Title (Editable) *</label>
            <input 
              required 
              type="text" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})} 
              className="w-full p-3 bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-orange-500 text-gray-900 dark:text-white" 
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Image URL *</label>
              <input 
                required 
                type="text" 
                value={formData.imageUrl}
                onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} 
                className="w-full p-3 bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-orange-500 text-gray-900 dark:text-white font-mono text-sm" 
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Price (Optional)</label>
              <input 
                type="text" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})} 
                className="w-full p-3 bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-orange-500 text-gray-900 dark:text-white" 
                placeholder="e.g. ₹499" 
              />
            </div>
          </div>

          {/* 🌟 Image Preview Block (Updated with sizes) */}
          {formData.imageUrl && (
            <div className="mt-4 p-4 border border-gray-200 dark:border-white/10 rounded-xl bg-white dark:bg-[#1a120b] flex items-center gap-4">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white">
                <Image 
                  src={formData.imageUrl} 
                  alt="Preview" 
                  fill 
                  sizes="64px"
                  className="object-contain p-1" 
                />
              </div>
              <span className="text-sm font-bold text-gray-500 dark:text-gray-400">Live Image Preview</span>
            </div>
          )}
        </div>

        {/* --- 3. Classification Section --- */}
        <div className="bg-gray-50/50 dark:bg-white/5 p-6 rounded-2xl border border-gray-100 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 border-b dark:border-white/10 pb-2">3. Classification & Targeting</h2>
          
          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Linked Deity (For Smart Ads Placement)</label>
            <select 
              value={formData.deityId}
              onChange={(e) => setFormData({...formData, deityId: e.target.value})}
              className="w-full p-3 bg-white dark:bg-[#1a120b] border border-gray-200 dark:border-white/10 rounded-xl focus:outline-orange-500 text-gray-900 dark:text-white appearance-none"
            >
              <option value="">-- General Store (दिखेगा पूरी साइट पर) --</option>
              {deities.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name_hinglish} ({d.name_hindi})
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2">अगर आप इसे किसी देवता से जोड़ेंगे, तो यह सिर्फ उनके पेजों पर सबसे पहले दिखेगा।</p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full md:w-auto px-10 py-4 bg-orange-600 text-white font-black rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50 text-lg shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            {isSubmitting ? 'Uploading to Database...' : 'Publish Affiliate Product'}
          </button>
        </div>

      </form>
    </div>
  );
}