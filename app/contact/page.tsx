"use client";

import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { FaEnvelope, FaWhatsapp, FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';

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
    <div className="min-h-screen bg-orange-50/20 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-16">
          <span className="bg-orange-100 text-orange-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest">
            Contact Us
          </span>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mt-4 mb-4">
            Get in <span className="text-orange-600">Touch</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            Whether you want to suggest a Bhajan or report a typo, we're here to listen. 
            Devotion is better when shared.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-12 items-start">
          
          {/* Info Side (2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-8 rounded-[2rem] border border-orange-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-orange-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-orange-200">
                <FaEnvelope size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Email Us</h3>
              <p className="text-gray-500 mb-4 text-sm leading-relaxed">
                For detailed feedback or collaboration inquiries.
              </p>
              <a href="mailto:nvsict06@gmail.com" className="text-orange-600 font-bold hover:underline underline-offset-4">
                nvsict06@gmail.com
              </a>
            </div>

            <div className="bg-white p-8 rounded-[2rem] border border-green-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-[#25D366] text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-green-200">
                <FaWhatsapp size={24} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp Support</h3>
              <p className="text-gray-500 mb-4 text-sm leading-relaxed">
                The fastest way to send us corrections or quick suggestions.
              </p>
              <a 
                href="https://wa.me/918384844353" 
                target="_blank" 
                className="text-green-600 font-bold hover:underline underline-offset-4"
              >
                +91 8384844353
              </a>
            </div>
          </div>

          {/* Form Side (3 Columns) */}
          <div className="lg:col-span-3">
            {submitted ? (
              <div className="bg-white p-12 rounded-[2.5rem] border border-orange-100 text-center shadow-xl shadow-orange-900/5">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FaCheckCircle size={40} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-2">Jai Shri Ram!</h2>
                <p className="text-gray-600 mb-8">Your message has been received. We will get back to you shortly.</p>
                <button 
                  onClick={() => setSubmitted(false)}
                  className="text-orange-600 font-bold hover:text-orange-700 underline"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form 
                onSubmit={handleSubmit}
                className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-orange-100 shadow-xl shadow-orange-900/5 space-y-5"
              >
                <div className="grid md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Full Name</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Rahul Sharma"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Email Address</label>
                    <input 
                      required
                      type="email" 
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all" 
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2 ml-1">Your Message</label>
                  <textarea 
                    required
                    placeholder="How can we help you today?"
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-500 outline-none transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-orange-600 text-white font-black py-5 rounded-2xl hover:bg-orange-700 transition-all shadow-lg shadow-orange-200 flex items-center justify-center gap-3 disabled:bg-gray-400 group"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <>
                      Send Message 
                      <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-center text-xs text-gray-400">
                  We usually respond within 24-48 hours.
                </p>
              </form>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}