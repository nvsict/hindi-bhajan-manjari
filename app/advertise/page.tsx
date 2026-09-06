"use client";

import { useState, useCallback } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  FaChartLine, 
  FaUsers, 
  FaClock, 
  FaSearch, 
  FaMapMarkerAlt, 
  FaMale, 
  FaFemale, 
  FaBullhorn, 
  FaRegNewspaper, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaSpinner, 
  FaImages,
  FaMobileAlt,
  FaStar
} from 'react-icons/fa';
import { HiArrowRight } from 'react-icons/hi';
import { GiLotusFlower } from 'react-icons/gi';
import Link from 'next/link';

export default function AdvertisePage() {
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    budget: 'Custom / Open to discussion',
    campaign: 'App Launch Partner',
    customCampaign: '',
    message: ''
  });

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); 
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    triggerHaptic();

    if (!formData.name.trim() || !formData.email.trim() || !formData.company.trim()) {
      alert("Please fill out all required fields.");
      return;
    }

    setLoading(true);

    try {
      const actualCampaign = formData.campaign === 'Other / Custom Proposal' && formData.customCampaign 
        ? formData.customCampaign 
        : formData.campaign;

      const formattedMessage = `[SPONSORSHIP INQUIRY]\nCompany/Brand: ${formData.company.trim()}\nTarget Budget: ${formData.budget}\nCampaign Type: ${actualCampaign}\n\nMessage:\n${formData.message.trim()}`;

      const { error } = await supabase
        .from('contact_submissions')
        .insert([
          { 
            name: formData.name.trim(), 
            email: formData.email.trim(), 
            message: formattedMessage
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({ 
        name: '', company: '', email: '', 
        budget: 'Custom / Open to discussion', 
        campaign: 'App Launch Partner', 
        customCampaign: '', message: '' 
      });
    } catch (error) {
      alert("Something went wrong. Please try again or contact us via email.");
      console.error("Submission Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden selection:bg-orange-100 selection:text-orange-900 font-sans">
      
      <title>Advertise With Us - Hindi Bhajan Manjari | Media Kit</title>
      <meta name="description" content="Reach over 169,000 highly engaged monthly devotees on Hindi Bhajan Manjari. Explore app launch partnerships, premium banners, and festival sponsorships." />

      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-[500px] bg-gradient-to-b from-orange-50/80 to-transparent pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 text-orange-500/5 pointer-events-none">
        <GiLotusFlower size={500} />
      </div>

      <div className="max-w-7xl mx-auto py-16 md:py-24 px-4 sm:px-6 relative z-10">
        
        {/* --- HERO HEADER --- */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <span className="inline-block bg-orange-100 border border-orange-200 text-orange-700 px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest shadow-sm mb-6">
            Official Media Kit & Partnerships
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter leading-tight">
            Partner with <br className="hidden md:block" /> <span className="text-orange-600 font-hindi">Hindi Bhajan Manjari</span>
          </h1>
          <p className="text-gray-600 text-lg md:text-xl leading-relaxed font-medium max-w-3xl mx-auto">
            Connect your brand with India's fastest-growing digital devotional library. We provide premium advertising placements and exclusive app launch partnerships for spiritual brands.
          </p>
        </div>

        {/* --- CURRENT GOAL: APP LAUNCH PARTNERSHIP --- */}
        <div className="bg-gradient-to-br from-orange-600 to-red-700 rounded-[2.5rem] p-8 md:p-12 mb-20 shadow-2xl relative overflow-hidden text-white">
          <div className="relative z-10 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-widest mb-6 border border-white/30">
                <FaStar className="text-yellow-300" /> Current Milestone
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
                Become our Founding App Launch Partner
              </h2>
              <p className="text-orange-100 text-lg leading-relaxed mb-8">
                We are preparing to launch the official Hindi Bhajan Manjari mobile app to our audience of 169K+ monthly active users. We are seeking a limited number of founding brands to headline this launch.
              </p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-400 mt-1 shrink-0" />
                  <span className="text-orange-50 font-medium">"Presented by [Your Brand]" launch association</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-400 mt-1 shrink-0" />
                  <span className="text-orange-50 font-medium">Prominent visibility on app welcome screens</span>
                </li>
                <li className="flex items-start gap-3">
                  <FaCheckCircle className="text-yellow-400 mt-1 shrink-0" />
                  <span className="text-orange-50 font-medium">Cross-promotion across website and launch emails</span>
                </li>
              </ul>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-sm bg-white/10 backdrop-blur-sm p-8 rounded-3xl border border-white/20 text-center">
                <FaMobileAlt className="text-6xl text-yellow-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold mb-2">Launch Package</h3>
                <p className="text-orange-100 text-sm mb-6">Secure exclusive founding placement before our nationwide rollout.</p>
                <div className="text-3xl font-black text-white mb-6">₹1,00,000+</div>
                <a href="#contact-form" className="inline-block w-full bg-white text-orange-700 font-bold py-3 rounded-xl hover:bg-orange-50 transition-colors">
                  Inquire About App Sponsorship
                </a>
              </div>
            </div>
          </div>
          {/* Decorative background logo */}
          <GiLotusFlower className="absolute -right-24 -bottom-24 text-white/5 text-[25rem] pointer-events-none" />
        </div>

        {/* --- THE NUMBERS (DATA GRID) --- */}
        <div className="mb-20">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 hover:-translate-y-1 hover:border-orange-200 transition-all text-center">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaUsers size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">169K+</h3>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Monthly Active Users</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 hover:-translate-y-1 hover:border-orange-200 transition-all text-center">
              <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaChartLine size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">300K+</h3>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Monthly Pageviews</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 hover:-translate-y-1 hover:border-orange-200 transition-all text-center">
              <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaSearch size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">92%</h3>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Organic Search Traffic</p>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-900/5 hover:-translate-y-1 hover:border-orange-200 transition-all text-center">
              <div className="w-14 h-14 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FaClock size={24} />
              </div>
              <h3 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">1m 21s</h3>
              <p className="text-gray-500 text-sm font-bold uppercase tracking-wider">Avg. Engagement Time</p>
            </div>
          </div>
        </div>

        {/* --- DEMOGRAPHICS --- */}
        <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 mb-20 shadow-2xl border border-gray-800 relative overflow-hidden">
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-black text-white mb-4">Who is our audience?</h2>
              <p className="text-gray-400 text-lg leading-relaxed mb-8">
                Our platform attracts a highly intent-driven, young, and spiritually active demographic across India's largest metropolitan and Tier-2 cities.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                    <FaMapMarkerAlt size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Top Geographies</h4>
                    <p className="text-gray-400 text-sm">Indore, Delhi, Lucknow, Jaipur, Bhopal, Agra, and Patna.</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center text-white shrink-0">
                    <FaUsers size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold mb-1">Age Distribution</h4>
                    <p className="text-gray-400 text-sm">Dominated by the 18-24 and 25-34 age brackets.</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Gender Split Visual */}
            <div className="bg-black/40 p-8 rounded-3xl border border-white/10 text-center">
              <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-6">Gender Split</h4>
              <div className="flex justify-center gap-8">
                <div className="flex flex-col items-center">
                  <FaMale className="text-blue-400 text-5xl mb-3" />
                  <span className="text-3xl font-black text-white">72%</span>
                  <span className="text-gray-500 text-xs font-bold uppercase mt-1">Male</span>
                </div>
                <div className="w-px bg-white/10"></div>
                <div className="flex flex-col items-center">
                  <FaFemale className="text-pink-400 text-5xl mb-3" />
                  <span className="text-3xl font-black text-white">28%</span>
                  <span className="text-gray-500 text-xs font-bold uppercase mt-1">Female</span>
                </div>
              </div>
            </div>
          </div>
          <FaChartLine className="absolute -right-12 -bottom-12 text-white/5 text-[20rem] pointer-events-none" />
        </div>

        {/* --- OPPORTUNITIES --- */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4">Website Advertising Options</h2>
            <p className="text-gray-600 text-lg">Beyond the app, choose a placement that aligns perfectly with your marketing goals.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: FaImages, title: "Premium Header Banner", desc: "Maximum visibility. Your brand banner displayed prominently at the top of every page site-wide." },
              { icon: FaBullhorn, title: "In-Content Ads", desc: "Contextual placement directly inside high-traffic Bhajan lyrics and Aarti reading areas." },
              { icon: FaRegNewspaper, title: "Sponsored Articles", desc: "Dedicated, SEO-friendly articles or Sanatan Gyan posts promoting your spiritual products or services." },
              { icon: FaCalendarAlt, title: "Festival Takeovers", desc: "Exclusive branding during major traffic surges like Janmashtami, Navratri, and Diwali." }
            ].map((opp, idx) => (
              <div key={idx} className="bg-orange-50/50 p-8 rounded-[2rem] border border-orange-100 hover:bg-orange-50 transition-colors">
                <div className="w-12 h-12 bg-white text-orange-600 rounded-xl shadow-sm flex items-center justify-center mb-5">
                  <opp.icon size={20} />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{opp.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{opp.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* --- CONTACT FORM --- */}
        <div id="contact-form" className="max-w-4xl mx-auto scroll-mt-24">
          {submitted ? (
            <div className="bg-white p-12 md:p-16 rounded-[2.5rem] border border-orange-100 text-center shadow-2xl shadow-orange-900/10 animate-fade-in-up">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                <FaCheckCircle size={48} />
              </div>
              <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tighter">Inquiry Received!</h2>
              <p className="text-gray-600 text-lg mb-8 font-medium">
                Thank you for your interest in partnering with us. Our team will review your requirements and reply with a custom proposal and media kit PDF shortly.
              </p>
              <button 
                onClick={() => { triggerHaptic(); setSubmitted(false); }}
                className="px-8 py-3 bg-orange-50 text-orange-600 font-bold rounded-full hover:bg-orange-100 transition-colors"
              >
                Submit another inquiry
              </button>
            </div>
          ) : (
            <div className="bg-white p-8 md:p-12 rounded-[2.5rem] border border-gray-100 shadow-2xl shadow-gray-900/5">
              
              <div className="mb-8 border-b border-gray-100 pb-8">
                <h3 className="text-2xl font-black text-gray-900 mb-3">Request a Partnership Proposal</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Fill out the details below to start a conversation. Whether you're looking for a standard banner trial or a bespoke app launch partnership, we are open to creative ideas.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Your Name</label>
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
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Company / Brand</label>
                    <input 
                      required
                      type="text" 
                      placeholder="e.g. Puja Samagri Store"
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900" 
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Work Email</label>
                    <input 
                      required
                      type="email" 
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900" 
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Target Budget</label>
                    <select
                      required
                      value={formData.budget}
                      onChange={(e) => setFormData({...formData, budget: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer"
                    >
                      <option value="Custom / Open to discussion">Custom / Open to discussion</option>
                      <option value="Trial (₹5,000 - ₹10,000)">Trial (₹5,000 - ₹10,000)</option>
                      <option value="Standard (₹10,000 - ₹25,000)">Standard (₹10,000 - ₹25,000)</option>
                      <option value="Premium (₹25,000 - ₹50,000)">Premium (₹25,000 - ₹50,000)</option>
                      <option value="App Launch Partner (₹1,00,000+)">App Launch Partner (₹1,00,000+)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Interest / Campaign Type</label>
                  <select
                    required
                    value={formData.campaign}
                    onChange={(e) => setFormData({...formData, campaign: e.target.value})}
                    className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900 appearance-none cursor-pointer mb-3"
                  >
                    <option value="App Launch Partner">App Launch Partner</option>
                    <option value="Banner Advertisement">Banner Advertisement</option>
                    <option value="Sponsored Article / Post">Sponsored Article / Post</option>
                    <option value="Festival Sponsorship">Festival Sponsorship</option>
                    <option value="Other / Custom Proposal">Other / Custom Proposal</option>
                  </select>
                  
                  {formData.campaign === 'Other / Custom Proposal' && (
                    <input 
                      type="text" 
                      placeholder="Please specify your custom campaign idea..."
                      value={formData.customCampaign}
                      onChange={(e) => setFormData({...formData, customCampaign: e.target.value})}
                      className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-900 animate-fade-in-up" 
                      required
                    />
                  )}
                </div>
                
                <div>
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Message / Details</label>
                  <textarea 
                    required
                    placeholder="Tell us about your brand, what you wish to promote, or any specific requirements you have..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="w-full p-4 bg-gray-50/50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all resize-none font-medium text-gray-900"
                  ></textarea>
                </div>

                <button 
                  disabled={loading}
                  type="submit"
                  className="w-full bg-gray-900 text-white font-black py-4 md:py-5 rounded-2xl hover:bg-orange-600 transition-all shadow-lg flex items-center justify-center gap-3 disabled:bg-gray-400 disabled:shadow-none hover:-translate-y-0.5 active:scale-[0.98] group text-lg"
                >
                  {loading ? (
                    <FaSpinner className="animate-spin text-2xl" />
                  ) : (
                    <>
                      Send Inquiry 
                      <HiArrowRight className="group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}