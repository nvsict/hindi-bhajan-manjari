"use client";

import { useState } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { FaCloudUploadAlt, FaSpinner, FaCheckCircle, FaTrash } from 'react-icons/fa';

interface ImageUploaderProps {
  currentImageUrl?: string;
  onUploadSuccess: (url: string) => void;
  folderName?: string; // e.g., 'deities' or 'artists'
}

export default function ImageUploader({ currentImageUrl, onUploadSuccess, folderName = 'general' }: ImageUploaderProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setError('');
      setIsUploading(true);

      if (!e.target.files || e.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = e.target.files[0];
      
      // 1. Create a unique file name so images don't overwrite each other
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${folderName}/${fileName}`; // Saves as: deities/1234abc_123456.jpg

      // 2. Upload to Supabase 'images' bucket
      const { error: uploadError } = await supabase.storage
        .from('images')
        .upload(filePath, file, { cacheControl: '3600', upsert: false });

      if (uploadError) throw uploadError;

      // 3. Get the Public URL
      const { data: publicUrlData } = supabase.storage
        .from('images')
        .getPublicUrl(filePath);

      const uploadedUrl = publicUrlData.publicUrl;
      
      // 4. Update the UI and send URL back to the parent form
      setPreviewUrl(uploadedUrl);
      onUploadSuccess(uploadedUrl);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full">
      <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
        Upload Image
      </label>

      {/* ERROR MESSAGE */}
      {error && <p className="text-xs text-red-500 font-bold mb-2">{error}</p>}

      <div className="flex items-center gap-6">
        
        {/* PREVIEW BUBBLE */}
        <div className="w-24 h-24 rounded-2xl border-2 border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0 relative group shadow-sm">
          {previewUrl ? (
            <>
              <Image src={previewUrl} alt="Preview" fill className="object-cover" />
              {/* Overlay to show it was successful */}
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <FaCheckCircle className="text-green-400 text-2xl" />
              </div>
            </>
          ) : (
            <FaCloudUploadAlt className="text-4xl text-gray-300" />
          )}
        </div>

        {/* UPLOAD CONTROLS */}
        <div className="flex-1">
          <div className="relative">
            <input 
              type="file" 
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            />
            <div className={`
              flex items-center justify-center gap-3 w-full py-4 border-2 border-dashed rounded-xl font-bold transition-all
              ${isUploading 
                ? 'bg-orange-50 border-orange-200 text-orange-600' 
                : 'bg-white border-gray-200 text-gray-600 hover:border-orange-400 hover:bg-orange-50 hover:text-orange-600'
              }
            `}>
              {isUploading ? (
                <><FaSpinner className="animate-spin" size={18} /> Uploading to server...</>
              ) : (
                <><FaCloudUploadAlt size={20} /> Click to browse files</>
              )}
            </div>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-2 ml-1">
            Supports JPG, PNG, and WebP. Max size: 2MB.
          </p>
        </div>
      </div>
    </div>
  );
}