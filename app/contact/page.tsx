"use client";

import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { FaEnvelope, FaWhatsapp, FaCheckCircle, FaSpinner, FaMapMarkerAlt, FaShieldAlt } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { GiLotusFlower } from 'react-icons/gi';
import Link from 'next/link';

export default function ContactPage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            message: formData.message 
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({ name: '', email: '', message: '' });
    } catch (error) {
      alert("Something went wrong. Please try again or use WhatsApp.");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden selection:bg-orange-100 selection:text-orange-900">
      
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-orange-50/50 to-transparent pointer-events-none"></div>
      <div className="absolute -top-24 -right-24 text-orange-500/5 pointer-events-none">
        <GiLotusFlower size={400} />
      </div>

      <div className="max-w-6xl mx-auto py-16 md:py-24 px-6 relative z-10">
        
        {/* --- HEADER --- */}
        <div className="text-center mb-16 md:mb-24">
          <span className="inline-block bg-orange-50 border border-orange-100 text-orange-600 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-6">
            Get in Touch
          </span>
          <h1 className="text-4xl md:text-6xl font-black font-hindi text-gray-900 mb-6 tracking-tighter leading-tight">
            हमसे <span className="text-orange-600">संपर्क करें</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg md:text-xl leading-[1.8] font-hindi font-medium">
            चाहे आपको कोई नया भजन सुझाना हो, या किसी त्रुटि (typo) की जानकारी देनी हो, हम आपके संदेश का स्वागत करते हैं। 
            <span className="block mt-2 text-gray-500 font-sans text-base">We're here to listen. Devotion is better when shared.</span>
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* --- INFO SIDE (2 Columns) --- */}
          <div className="lg:col-span-2 space-y-6">
            
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-orange-900/5 hover:-translate-y-1 hover:border-orange-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-orange-600 group-hover:text-white transition-colors shadow-sm">
                <FaEnvelope size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Email Us</h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed font-medium">
                For detailed feedback, copyright queries, or collaboration inquiries.
              </p>
              <a href="mailto:nvsict06@gmail.com" className="inline-flex items-center gap-2 text-orange-600 font-bold hover:text-orange-700 transition-colors">
                nvsict06@gmail.com <HiArrowRight />
              </a>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-green-900/5 hover:-translate-y-1 hover:border-green-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#25D366] group-hover:text-white transition-colors shadow-sm">
                <FaWhatsapp size={28} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">WhatsApp Support</h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed font-medium">
                The fastest way to send us quick lyric corrections or daily suggestions.
              </p>
              <a 
                href="https://wa.me/918384844353" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-600 font-bold hover:text-green-700 transition-colors"
              >
                +91 8384844353 <HiArrowRight />
              </a>
            </div>

            {/* 🌟 NEW: Location Card (Boosts AdSense Trust & E-E-A-T) */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-blue-900/5 hover:-translate-y-1 hover:border-blue-200 transition-all duration-300 group">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors shadow-sm">
                <FaMapMarkerAlt size={24} />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Our Location</h3>
              <p className="text-gray-500 mb-6 text-sm leading-relaxed font-medium">
                Proudly operating and managing our spiritual digital library from the holy land.
              </p>
              <div className="inline-flex items-center gap-2 text-blue-600 font-bold">
               Farah, Mathura, Uttar Pradesh – 281122, India
              </div>
            </div>

          </div>

          {/* --- FORM SIDE (3 Columns) --- */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white p-12 md:p-16 rounded-[2.5rem] border border-orange-100 text-center shadow-2xl shadow-orange-900/10 animate-fade-in-up">
                <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                  <FaCheckCircle size={48} />
                </div>
                <h2 className="text-4xl font-black font-hindi text-gray-900 mb-4 tracking-tighter">जय श्री राम!</h2>
                <p className="text-gray-600 text-lg mb-8 font-medium">Your message has been received securely. We will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="px-8 py-3 bg-orange-50 text-orange-600 font-bold rounded-full hover:bg-orange-100 transition-colors"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form 
                onSubmit={handleSubmit}
                className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-900/5 space-y-6"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Your Message</label>
                  <textarea 
                    required
                    placeholder="आप अपना संदेश यहाँ लिख सकते हैं..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all resize-none font-medium font-hindi text-gray-900"
                  ></textarea>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-orange-600 text-white font-black py-4 md:py-5 rounded-2xl hover:bg-orange-500 transition-all shadow-[0_4px_14px_0_rgba(234,88,12,0.3)] hover:shadow-[0_6px_20px_rgba(234,88,12,0.4)] flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:shadow-none hover:-translate-y-0.5 active:scale-[0.98] group text-lg"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-2xl" />
                  ) : (
                    <>
                      Send Message 
                      <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                
                {/* 🌟 NEW: Privacy Consent Statement */}
                <div className="flex items-center justify-center gap-2 mt-6 pt-4 border-t border-gray-100">
                  <FaShieldAlt className="text-green-500" />
                  <p className="text-center text-[11px] font-bold text-gray-400 uppercase tracking-wider m-0">
                    Your data is secure. By contacting us, you agree to our <Link href="/privacy-policy" className="text-gray-600 hover:text-orange-600 transition-colors">Privacy Policy</Link>.
                  </p>
                </div>

              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}