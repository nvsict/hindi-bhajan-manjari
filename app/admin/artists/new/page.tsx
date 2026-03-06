"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

// 🌟 IMPORT YOUR NEW UPLOADER
import ImageUploader from '@/components/admin/ImageUploader';

export default function AddArtistPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name_hinglish: '',
    name_hindi: '',
    slug: '',
    phone: '',
    address: '',
    profile_image_url: '',
    bio: ''
  });

  // Auto-generate the slug when the Hinglish name changes
  useEffect(() => {
    if (formData.name_hinglish) {
      const generatedSlug = formData.name_hinglish
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // Replace non-alphanumeric chars with hyphens
        .replace(/(^-|-$)+/g, '');   // Remove leading/trailing hyphens
      
      setFormData(prev => ({ ...prev, slug: generatedSlug }));
    }
  }, [formData.name_hinglish]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!formData.name_hinglish || !formData.slug) {
      alert('Hinglish Name and Slug are required!');
      setIsSubmitting(false);
      return;
    }

    const { error } = await supabase
      .from('artists')
      .insert([formData]);

    if (error) {
      if (error.code === '23505') {
        alert('An artist with this exact Slug already exists. Please modify the slug.');
      } else {
        alert('Error saving artist: ' + error.message);
      }
      setIsSubmitting(false);
    } else {
      alert('Artist created successfully!');
      router.push('/admin/manage'); // Redirect back to metadata manager
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin/manage" className="p-3 bg-white text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-xl shadow-sm border border-gray-200 transition-all">
              <FaArrowLeft />
            </Link>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tighter">
              <FaUserCircle className="text-orange-500" /> 
              Add New Artist
            </h1>
          </div>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-xl shadow-gray-900/5 border border-gray-100 rounded-[2rem] overflow-hidden">
          <div className="p-6 md:p-10 space-y-8">

            {/* Row 1: Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Name (Hinglish) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_hinglish"
                  required
                  value={formData.name_hinglish}
                  onChange={handleChange}
                  placeholder="e.g. Raghvendra Brajwasi"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                  Name (Hindi)
                </label>
                <input
                  type="text"
                  name="name_hindi"
                  value={formData.name_hindi}
                  onChange={handleChange}
                  placeholder="e.g. राघवेन्द्र ब्रजवासी"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-bold font-hindi text-lg text-gray-900"
                />
              </div>
            </div>

            {/* Row 2: URL Slug */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">
                URL Slug (Auto-generated) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-stretch">
                <span className="bg-gray-100 border border-r-0 border-gray-200 px-5 flex items-center justify-center rounded-l-2xl text-gray-500 text-sm font-bold font-mono">
                  /artist/
                </span>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full p-4 bg-orange-50/50 border border-orange-100 rounded-r-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-mono text-gray-700 font-bold"
                />
              </div>
              <p className="text-xs text-gray-400 font-medium ml-1">This is the link Google uses. Keep it all lowercase with hyphens.</p>
            </div>

            {/* Row 3: Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-bold text-gray-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Address / City</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Mathura, Uttar Pradesh"
                  className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-bold text-gray-900"
                />
              </div>
            </div>

            {/* 🌟 Row 4: THE NEW DRAG & DROP IMAGE UPLOADER */}
            <div className="pt-4 border-t border-gray-100">
              <ImageUploader 
                currentImageUrl={formData.profile_image_url} 
                folderName="artists" 
                onUploadSuccess={(url) => setFormData(prev => ({ ...prev, profile_image_url: url }))} 
              />
            </div>

            {/* Row 5: Bio */}
            <div className="pt-4 border-t border-gray-100">
              <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Biography (SEO optimized)</label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write a short description about the singer/writer to help this page rank on Google..."
                className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all resize-y font-medium text-gray-800"
              ></textarea>
            </div>

          </div>

          {/* Footer / Submit */}
          <div className="bg-gray-50/80 p-6 md:px-10 border-t border-gray-100 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-500 disabled:bg-orange-300 text-white font-black py-4 px-10 rounded-2xl shadow-[0_4px_14px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] hover:-translate-y-0.5 active:scale-95 transition-all flex items-center gap-3"
            >
              <FaSave size={18} />
              {isSubmitting ? 'Saving to Database...' : 'Save Artist Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}