"use client";

import { useState, useEffect } from 'react';
import { supabase } from '@/utils/supabase'; // Adjust path if needed
import { useRouter } from 'next/navigation';
import { FaUserCircle, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

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
      router.push('/admin'); // Or wherever your admin dashboard is
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="p-2 bg-white text-gray-500 hover:text-orange-600 rounded-full shadow-sm border border-gray-200 transition-colors">
              <FaArrowLeft />
            </Link>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FaUserCircle className="text-orange-500" /> 
              Add New Artist
            </h1>
          </div>
        </div>

        {/* The Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">

            {/* Row 1: Names */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Name (Hinglish) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name_hinglish"
                  required
                  value={formData.name_hinglish}
                  onChange={handleChange}
                  placeholder="e.g. Raghvendra Brajwasi"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Name (Hindi)
                </label>
                <input
                  type="text"
                  name="name_hindi"
                  value={formData.name_hindi}
                  onChange={handleChange}
                  placeholder="e.g. राघवेन्द्र ब्रजवासी"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
                />
              </div>
            </div>

            {/* Row 2: URL Slug */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                URL Slug (Auto-generated) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center">
                <span className="bg-gray-100 border border-r-0 border-gray-300 px-4 py-3 rounded-l-xl text-gray-500 text-sm">
                  /artist/
                </span>
                <input
                  type="text"
                  name="slug"
                  required
                  value={formData.slug}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all bg-orange-50/30"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">This is the link Google uses. Keep it all lowercase with hyphens.</p>
            </div>

            {/* Row 3: Contact Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address / City</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Mathura, Uttar Pradesh"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
                />
              </div>
            </div>

            {/* Row 4: Image */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Profile Image URL</label>
              <input
                type="url"
                name="profile_image_url"
                value={formData.profile_image_url}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Row 5: Bio */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Biography (SEO optimized)</label>
              <textarea
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                placeholder="Write a short description about the singer/writer to help this page rank on Google..."
                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"
              ></textarea>
            </div>

          </div>

          {/* Footer / Submit */}
          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-3 px-8 rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-2"
            >
              <FaSave />
              {isSubmitting ? 'Saving...' : 'Save Artist Profile'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}