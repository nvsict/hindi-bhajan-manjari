"use client";

import { useState, useEffect, use } from 'react';
import { supabase } from '@/utils/supabase';
import { useRouter } from 'next/navigation';
import { FaUserEdit, FaSave, FaArrowLeft } from 'react-icons/fa';
import Link from 'next/link';

export default function EditArtistPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    id: '',
    name_hinglish: '',
    name_hindi: '',
    slug: '',
    phone: '',
    address: '',
    profile_image_url: '',
    bio: ''
  });

  // Fetch the specific artist data on load
  useEffect(() => {
    const fetchArtist = async () => {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .eq('id', resolvedParams.id)
        .single();

      if (error || !data) {
        setMessage("❌ Artist not found.");
      } else {
        setFormData({
          id: data.id,
          name_hinglish: data.name_hinglish || '',
          name_hindi: data.name_hindi || '',
          slug: data.slug || '',
          phone: data.phone || '',
          address: data.address || '',
          profile_image_url: data.profile_image_url || '',
          bio: data.bio || ''
        });
      }
      setIsLoading(false);
    };

    fetchArtist();
  }, [resolvedParams.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage("Updating...");

    if (!formData.name_hinglish || !formData.slug) {
      setMessage('❌ Hinglish Name and Slug are required!');
      setIsSubmitting(false);
      return;
    }

    // Update the database
    const { error } = await supabase
      .from('artists')
      .update({
        name_hinglish: formData.name_hinglish,
        name_hindi: formData.name_hindi,
        slug: formData.slug,
        phone: formData.phone,
        address: formData.address,
        profile_image_url: formData.profile_image_url,
        bio: formData.bio
      })
      .eq('id', formData.id);

    if (error) {
      if (error.code === '23505') {
        setMessage('❌ This URL Slug is already taken by another artist.');
      } else {
        setMessage(`❌ Error: ${error.message}`);
      }
      setIsSubmitting(false);
    } else {
      setMessage('✅ Artist profile updated successfully!');
      setTimeout(() => {
        router.push('/admin'); // Redirect back to your dashboard
      }, 1500);
    }
  };

  if (isLoading) return <div className="p-12 text-center text-gray-500 font-bold">Loading Artist Data...</div>;

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
              <FaUserEdit className="text-orange-500" /> 
              Edit Artist Profile
            </h1>
          </div>
        </div>

        {message && (
          <div className={`p-4 mb-6 rounded-xl font-bold ${message.includes('❌') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
            {message}
          </div>
        )}

        {/* The Form */}
        <form onSubmit={handleSubmit} className="bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden">
          <div className="p-6 md:p-8 space-y-6">

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name (Hinglish) *</label>
                <input type="text" name="name_hinglish" required value={formData.name_hinglish} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Name (Hindi)</label>
                <input type="text" name="name_hindi" value={formData.name_hindi} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">URL Slug * (Changing breaks old SEO links)</label>
              <div className="flex items-center">
                <span className="bg-gray-100 border border-r-0 border-gray-300 px-4 py-3 rounded-l-xl text-gray-500 text-sm">/artist/</span>
                <input type="text" name="slug" required value={formData.slug} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-r-xl focus:ring-2 focus:ring-orange-500 outline-none bg-orange-50/30" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Address / City</label>
                <input type="text" name="address" value={formData.address} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Profile Image URL</label>
              <input type="url" name="profile_image_url" value={formData.profile_image_url} onChange={handleChange} placeholder="https://..." className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none" />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Biography (SEO optimized)</label>
              <textarea name="bio" rows={4} value={formData.bio} onChange={handleChange} className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 outline-none resize-none"></textarea>
            </div>

          </div>

          <div className="bg-gray-50 p-6 border-t border-gray-200 flex justify-end">
            <button type="submit" disabled={isSubmitting} className="bg-orange-600 hover:bg-orange-700 disabled:bg-orange-400 text-white font-bold py-3 px-8 rounded-xl shadow-md transition-all flex items-center gap-2">
              <FaSave />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}