"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { updateCampaignSettings } from '@/app/actions/campaign';
import { FaSave, FaImage, FaCode, FaToggleOn, FaToggleOff } from 'react-icons/fa';

export default function CampaignManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  const [settings, setSettings] = useState({
    campaign_id: '',
    is_active: false,
    delay_ms: 3000,
    type: 'image',
    image_src: '',
    image_alt: '',
    image_link: '',
    html_content: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data } = await supabase.from('campaign_settings').select('*').eq('id', 1).single();
    if (data) setSettings(data);
    setLoading(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    const result = await updateCampaignSettings(settings);
    
    if (result.success) {
      setMsg({ type: 'success', text: '✅ Campaign updated successfully!' });
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } else {
      setMsg({ type: 'error', text: `❌ Error: ${result.error}` });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center font-bold">Loading Settings...</div>;

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 mb-20">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-gray-900">Campaign Manager</h1>
        <p className="text-gray-500 font-medium">Control the global announcement modal for your website.</p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-8">
        
        {/* 🌟 1. Master Switch */}
        <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-200">
          <div>
            <h3 className="font-bold text-lg text-gray-900">Enable Popup</h3>
            <p className="text-sm text-gray-500">Turn the modal ON or OFF for all users.</p>
          </div>
          <button 
            type="button"
            onClick={() => setSettings({ ...settings, is_active: !settings.is_active })}
            className={`text-5xl transition-colors ${settings.is_active ? 'text-green-500' : 'text-gray-300'}`}
          >
            {settings.is_active ? <FaToggleOn /> : <FaToggleOff />}
          </button>
        </div>

        {/* 🌟 2. Core Settings */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Campaign ID (Version)</label>
            <input 
              type="text" 
              value={settings.campaign_id} 
              onChange={(e) => setSettings({...settings, campaign_id: e.target.value})} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" 
              placeholder="e.g. diwali_offer_v1" 
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">Change this ID to show the popup again to users who previously closed it.</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Delay (Milliseconds)</label>
            <input 
              type="number" 
              value={settings.delay_ms} 
              onChange={(e) => setSettings({...settings, delay_ms: parseInt(e.target.value)})} 
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none" 
              required
            />
            <p className="text-[10px] text-gray-400 mt-1">1000 = 1 Second. Default: 3000</p>
          </div>
        </div>

        {/* 🌟 3. Mode Selector */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Modal Content Type</label>
          <div className="flex bg-gray-100 p-1.5 rounded-xl w-max">
            <button type="button" onClick={() => setSettings({...settings, type: 'image'})} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${settings.type === 'image' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}>
              <FaImage /> Image Banner
            </button>
            <button type="button" onClick={() => setSettings({...settings, type: 'html'})} className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all ${settings.type === 'html' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500'}`}>
              <FaCode /> Custom HTML
            </button>
          </div>
        </div>

        {/* 🌟 4. Dynamic Inputs based on Type */}
        <div className="p-6 bg-orange-50/50 rounded-2xl border border-orange-100">
          {settings.type === 'image' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Image URL</label>
                <input type="text" value={settings.image_src} onChange={(e) => setSettings({...settings, image_src: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="https://..." />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Target Link (On Click)</label>
                <input type="text" value={settings.image_link} onChange={(e) => setSettings({...settings, image_link: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="/shabdkosh" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">Alt Text</label>
                <input type="text" value={settings.image_alt} onChange={(e) => setSettings({...settings, image_alt: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="Special Offer" />
              </div>
            </div>
          ) : (
            <div>
               <label className="block text-xs font-bold text-gray-600 mb-1">HTML Content</label>
               <textarea rows={8} value={settings.html_content} onChange={(e) => setSettings({...settings, html_content: e.target.value})} className="w-full p-4 bg-gray-900 text-green-400 font-mono text-sm border border-gray-700 rounded-xl focus:outline-none" placeholder="<div class='p-4'>...</div>" />
            </div>
          )}
        </div>

        {/* 🌟 5. Submit */}
        <div className="pt-4 border-t border-gray-100 flex items-center gap-4">
          <button type="submit" disabled={saving} className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-black flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
            {saving ? 'Saving...' : <><FaSave /> Save Changes</>}
          </button>
          {msg.text && <span className={`font-bold text-sm ${msg.type === 'error' ? 'text-red-600' : 'text-green-600'}`}>{msg.text}</span>}
        </div>
      </form>
    </div>
  );
}