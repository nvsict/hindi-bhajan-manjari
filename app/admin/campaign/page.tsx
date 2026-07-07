"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase';
import { updateCampaignSettings } from '@/app/actions/campaign';
import { FaSave, FaImage, FaCode, FaToggleOn, FaToggleOff, FaPlus, FaListUl } from 'react-icons/fa';

const DEFAULT_SETTINGS = {
  id: null, // New campaigns won't have an ID until saved
  campaign_id: '',
  is_active: false,
  delay_ms: 3000,
  type: 'image',
  image_src: '',
  image_alt: '',
  image_link: '',
  html_content: ''
};

export default function CampaignManager() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  
  // 🌟 New: Handle Multiple Campaigns
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);

  const [settings, setSettings] = useState<any>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('campaign_settings').select('*').order('id', { ascending: true });
    
    if (data && data.length > 0) {
      setCampaigns(data);
      setSettings(data[0]); // पहले बैनर को डिफ़ॉल्ट सेलेक्ट करें
      setIsCreatingNew(false);
    } else {
      setIsCreatingNew(true);
    }
    setLoading(false);
  };

  const handleSelectCampaign = (camp: any) => {
    setSettings(camp);
    setIsCreatingNew(false);
    setMsg({ type: '', text: '' });
  };

  const handleCreateNew = () => {
    setSettings({ ...DEFAULT_SETTINGS, campaign_id: `campaign_${Date.now()}` });
    setIsCreatingNew(true);
    setMsg({ type: '', text: '' });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg({ type: '', text: '' });

    // Server action call (ensure your action handles both insert and update based on ID presence)
    const result = await updateCampaignSettings(settings);
    
    if (result.success) {
      setMsg({ type: 'success', text: '✅ Campaign saved successfully!' });
      await fetchCampaigns(); // लिस्ट को रिफ्रेश करें
      setTimeout(() => setMsg({ type: '', text: '' }), 3000);
    } else {
      setMsg({ type: 'error', text: `❌ Error: ${result.error}` });
    }
    setSaving(false);
  };

  if (loading) return <div className="p-10 text-center font-bold text-gray-500 animate-pulse">Loading Campaigns...</div>;

  return (
    <div className="max-w-6xl mx-auto py-10 px-4 mb-20 flex flex-col lg:flex-row gap-8">
      
      {/* ==========================================
          🌟 LEFT SIDEBAR: Campaign List
          ========================================== */}
      <div className="w-full lg:w-1/3 shrink-0 space-y-4">
        <div className="mb-6">
          <h1 className="text-3xl font-black text-gray-900 leading-tight">Campaign<br/>Manager</h1>
          <p className="text-gray-500 font-medium text-sm mt-2">Manage multiple smart banners.</p>
        </div>

        <button 
          onClick={handleCreateNew}
          className={`w-full p-4 rounded-2xl font-bold flex items-center gap-3 transition-all ${isCreatingNew ? 'bg-orange-600 text-white shadow-md' : 'bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200'}`}
        >
          <FaPlus /> Add New Campaign
        </button>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-widest">
            <FaListUl /> Existing Campaigns
          </div>
          <div className="flex-1 overflow-y-auto max-h-[400px] p-2 space-y-1">
            {campaigns.map((camp) => (
              <button
                key={camp.id}
                onClick={() => handleSelectCampaign(camp)}
                className={`w-full text-left p-3 rounded-xl transition-all flex items-center justify-between group ${!isCreatingNew && settings.id === camp.id ? 'bg-gray-900 text-white shadow-md' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <div className="flex flex-col truncate pr-2">
                  <span className="font-bold truncate text-sm">{camp.campaign_id}</span>
                  <span className={`text-[10px] uppercase tracking-wider font-bold ${camp.is_active ? (!isCreatingNew && settings.id === camp.id ? 'text-green-400' : 'text-green-500') : 'text-gray-400'}`}>
                    {camp.is_active ? 'Active' : 'Paused'}
                  </span>
                </div>
                <div className={`w-2 h-2 rounded-full ${camp.is_active ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-300'}`}></div>
              </button>
            ))}
            {campaigns.length === 0 && (
              <div className="p-4 text-center text-sm text-gray-400 font-medium">No campaigns found.</div>
            )}
          </div>
        </div>
      </div>

      {/* ==========================================
          🌟 RIGHT PANEL: Campaign Editor Form
          ========================================== */}
      <div className="flex-1">
        <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-sm space-y-8 relative">
          
          <div className="absolute top-6 right-8">
             <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-bold tracking-widest uppercase">
               {isCreatingNew ? 'Drafting New' : `Editing ID: ${settings.id}`}
             </span>
          </div>

          <div className="pb-4 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900">{isCreatingNew ? 'Create New Banner' : 'Edit Banner Settings'}</h2>
          </div>
          
          {/* 🌟 1. Master Switch */}
          <div className="flex items-center justify-between bg-gray-50 p-6 rounded-2xl border border-gray-200">
            <div>
              <h3 className="font-bold text-lg text-gray-900">Enable this Banner</h3>
              <p className="text-sm text-gray-500">Add or remove it from the active smart queue.</p>
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
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Campaign ID (Unique Name)</label>
              <input 
                type="text" 
                value={settings.campaign_id} 
                onChange={(e) => setSettings({...settings, campaign_id: e.target.value})} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium" 
                placeholder="e.g. diwali_offer_2026" 
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">Used for tracking if a user closed it.</p>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Delay (Milliseconds)</label>
              <input 
                type="number" 
                value={settings.delay_ms} 
                onChange={(e) => setSettings({...settings, delay_ms: parseInt(e.target.value)})} 
                className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:outline-none font-medium" 
                required
              />
              <p className="text-[10px] text-gray-400 mt-1">Used as fallback delay if smart timer is off.</p>
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
                  <input type="text" value={settings.image_src || ''} onChange={(e) => setSettings({...settings, image_src: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="https://..." />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Target Link (On Click)</label>
                  <input type="text" value={settings.image_link || ''} onChange={(e) => setSettings({...settings, image_link: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="/shabdkosh" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">Alt Text</label>
                  <input type="text" value={settings.image_alt || ''} onChange={(e) => setSettings({...settings, image_alt: e.target.value})} className="w-full p-3 bg-white border border-gray-200 rounded-xl" placeholder="Special Offer" />
                </div>
              </div>
            ) : (
              <div>
                 <label className="block text-xs font-bold text-gray-600 mb-1">HTML Content</label>
                 <textarea rows={8} value={settings.html_content || ''} onChange={(e) => setSettings({...settings, html_content: e.target.value})} className="w-full p-4 bg-gray-900 text-green-400 font-mono text-sm border border-gray-700 rounded-xl focus:outline-none shadow-inner" placeholder="<div class='p-4'>...</div>" />
              </div>
            )}
          </div>

          {/* 🌟 5. Submit */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
            <button type="submit" disabled={saving} className="px-8 py-3.5 bg-gray-900 hover:bg-black text-white rounded-xl font-black flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg">
              {saving ? 'Saving...' : <><FaSave /> {isCreatingNew ? 'Save New Campaign' : 'Update Campaign'}</>}
            </button>
            
            {msg.text && (
              <span className={`font-bold text-sm px-4 py-2 rounded-lg ${msg.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                {msg.text}
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}