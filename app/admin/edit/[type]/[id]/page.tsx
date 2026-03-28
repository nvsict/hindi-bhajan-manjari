"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/utils/supabase';
import { updateItem } from '@/app/actions/manage';
import { FaArrowLeft, FaSave, FaImage, FaSyncAlt } from 'react-icons/fa';

// 🌟 IMPORT YOUR NEW UPLOADER
import ImageUploader from '@/components/admin/ImageUploader';

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
      <div className="min-h-screen bg-gray-50/50 flex flex-col items-center justify-center text-gray-500 font-sans">
        <FaSyncAlt className="animate-spin text-4xl mb-4 text-orange-400" />
        <p className="font-bold text-lg tracking-wide">Loading record details...</p>
      </div>
    );
  }

  if (!formData) return null;

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => router.back()}
            className="p-3 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all shadow-sm"
          >
            <FaArrowLeft />
          </button>
          <div>
            <h1 className="text-3xl font-black text-gray-900 capitalize tracking-tighter">
              Edit {type?.toString().slice(0, -1)}
            </h1>
            <p className="text-gray-500 font-bold mt-1 text-sm tracking-widest uppercase">
              ID: <span className="font-mono text-[11px] bg-gray-200 px-2 py-0.5 rounded text-gray-700">{id}</span>
            </p>
          </div>
        </div>
        
        {/* Smart Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 md:p-10 rounded-[2rem] shadow-xl shadow-gray-900/5 border border-gray-100 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {Object.keys(formData).map((key) => {
              // Skip system fields
              if (['id', 'created_at', 'view_count'].includes(key)) return null;

              const isImage = key.includes('image');
              const isLongText = key.includes('description') || key.includes('lyrics') || key.includes('bio');
              const value = formData[key] || '';

              return (
                <div 
                  key={key} 
                  className={`flex flex-col gap-2 ${isImage || isLongText ? 'md:col-span-2' : ''}`}
                >
                  <label className="text-[11px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2 ml-1">
                    {key.replace(/_/g, ' ')}
                    {isImage && <FaImage className="text-gray-500" />}
                  </label>

                  {/* Smart Input Rendering */}
                  {isImage ? (
                    // 🌟 REPLACED THE OLD URL INPUT WITH YOUR DRAG & DROP UPLOADER
                    <div className="p-1">
                      <ImageUploader 
                        currentImageUrl={value}
                        folderName={type as string} // Automatically sorts into 'deities', 'categories', etc.
                        onUploadSuccess={(url) => setFormData({ ...formData, [key]: url })}
                      />
                    </div>
                  ) : isLongText ? (
                    <textarea
                      value={value}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none min-h-[120px] transition-all text-gray-800 font-medium resize-y"
                    />
                  ) : (
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className={`w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-bold text-gray-900 ${key === 'slug' ? 'font-mono text-gray-600' : ''}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <hr className="border-gray-100" />

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-2">
            <button 
              type="button" 
              onClick={() => router.back()} 
              disabled={saving}
              className="px-6 py-4 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={saving}
              className="bg-orange-600 hover:bg-orange-500 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:pointer-events-none"
            >
              {saving ? (
                <>
                  <FaSyncAlt className="animate-spin" /> Saving to Database...
                </>
              ) : (
                <>
                  <FaSave size={18} /> Save Changes
                </>
              )}
            </button>
          </div>
          
        </form>
      </div>
    </div>
  );
}