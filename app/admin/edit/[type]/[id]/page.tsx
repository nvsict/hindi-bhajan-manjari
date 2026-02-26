"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { updateItem } from '@/app/actions/manage';
import { FaArrowLeft, FaSave, FaImage, FaSyncAlt } from 'react-icons/fa';

export default function EditPage() {
  const { type, id } = useParams(); // e.g., 'deities' or 'categories'
  const router = useRouter();
  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadItem = async () => {
      const { data, error } = await supabase
        .from(type as string)
        .select('*')
        .eq('id', id)
        .single();
        
      if (!error) {
        setFormData(data);
      } else {
        alert("Record not found.");
        router.push('/admin/manage');
      }
      setLoading(false);
    };
    loadItem();
  }, [type, id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    // Clean up data before sending (we don't update ID or creation date)
    const dataToUpdate = { ...formData };
    delete dataToUpdate.id;
    delete dataToUpdate.created_at;

    const res = await updateItem(type as string, id as string, dataToUpdate);
    
    if (res.success) {
      router.push('/admin/manage');
    } else {
      alert("Error saving: " + res.error);
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-400">
        <FaSyncAlt className="animate-spin text-4xl mb-4 text-orange-400" />
        <p className="font-bold text-lg">Loading record details...</p>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-slate-200 rounded-xl text-slate-500 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl font-black text-slate-900 capitalize tracking-tight">
              Edit {type?.toString().slice(0, -1)}
            </h1>
            <p className="text-slate-500 font-medium mt-1">
              ID: <span className="font-mono text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">{id}</span>
            </p>
          </div>
        </div>
        
        {/* Smart Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(formData).map((key) => {
              // Skip system fields
              if (['id', 'created_at', 'view_count'].includes(key)) return null;

              const isImage = key.includes('image');
              const isLongText = key.includes('description') || key.includes('lyrics');
              const value = formData[key] || '';

              return (
                <div 
                  key={key} 
                  className={`flex flex-col gap-2 ${isImage || isLongText ? 'md:col-span-2' : ''}`}
                >
                  <label className="text-sm font-bold text-slate-700 capitalize tracking-wide flex items-center gap-2">
                    {key.replace(/_/g, ' ')}
                    {isImage && <FaImage className="text-slate-400" />}
                  </label>

                  {/* Smart Input Rendering */}
                  {isImage ? (
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-1 w-full">
                        <input
                          type="url"
                          value={value}
                          placeholder="https://..."
                          onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                          className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all"
                        />
                        <p className="text-xs text-slate-400 mt-2">Paste a valid image URL to see the preview.</p>
                      </div>
                      
                      {/* Image Preview Window */}
                      <div className="w-24 h-24 shrink-0 rounded-xl border-2 border-slate-100 bg-slate-50 overflow-hidden flex items-center justify-center text-slate-300">
                        {value ? (
                          <img src={value} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <FaImage size={24} />
                        )}
                      </div>
                    </div>
                  ) : isLongText ? (
                    <textarea
                      value={value}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none min-h-[120px] transition-all"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 focus:bg-white outline-none transition-all font-medium text-slate-800"
                    />
                  )}
                </div>
              );
            })}
          </div>

          <hr className="border-slate-100" />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => router.back()} 
              disabled={saving}
              className="px-6 py-3 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-70"
            >
              {saving ? (
                <>
                  <FaSyncAlt className="animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}