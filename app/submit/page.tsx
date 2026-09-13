"use client";

import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { 
  FaPrayingHands, 
  FaHandSparkles, 
  FaGlobe, 
  FaPenFancy, 
  FaCheckCircle,
  FaMusic,
  FaBell
} from 'react-icons/fa';
import { FaHeart } from 'react-icons/fa6';
import Link from 'next/link';

export default function SubmitBhajan() {
  const [title, setTitle] = useState('');
  const [tarz, setTarz] = useState(''); // 🌟 NEW: तर्ज़ (Melody)
  const [lyrics, setLyrics] = useState('');
  const [contributor, setContributor] = useState('');
  const [contactInfo, setContactInfo] = useState(''); // 🌟 NEW: Smart Contact Field
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    // 🌟 Make sure your 'pending_bhajans' table has 'tarz' and 'contact_info' columns
    const { error } = await supabase
      .from('pending_bhajans')
      .insert([{ 
        title, 
        lyrics, 
        contributor_name: contributor,
        tarz: tarz,
        contact_info: contactInfo 
      }]);

    if (error) {
      console.error("Submission Error:", error);
      setStatus('error');
    } else {
      setStatus('success');
      setTitle('');
      setTarz('');
      setLyrics('');
      setContributor('');
      setContactInfo('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] relative flex items-center justify-center py-12 px-4 sm:px-6 overflow-hidden">
      
      {/* 🌟 Ambient Background Glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-400/20 dark:bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-red-400/20 dark:bg-red-900/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl w-full bg-white/90 dark:bg-[#111]/90 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(234,88,12,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-white/50 dark:border-white/10 overflow-hidden relative z-10">
        
        <div className="grid grid-cols-1 lg:grid-cols-5 h-full">
          
          {/* --- LEFT SIDE: The Pitch (Persuasive Section) --- */}
          <div className="lg:col-span-2 bg-gradient-to-br from-orange-500 to-red-600 p-8 md:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[length:20px_20px]" />
            <FaPrayingHands className="absolute -right-10 -bottom-10 text-[200px] text-white/10 drop-shadow-2xl -rotate-12 pointer-events-none" />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-4 py-1.5 rounded-full text-sm font-bold tracking-wide uppercase mb-6 shadow-inner">
                <FaHandSparkles className="text-yellow-300" /> Share the Devotion
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-6">
                Become a <br/><span className="text-yellow-300">Contributor.</span>
              </h1>
              <p className="text-white/90 text-lg leading-relaxed font-medium mb-10">
  Help us preserve and share devotional traditions. Your submitted Bhajans, Aartis, and Chalisas may help other devotees discover and understand these sacred compositions.
</p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                    <FaGlobe className="text-xl text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Share with Devotees</h3>
<p className="text-white/80 text-sm mt-1">
  Approved submissions may be made available to readers in supported languages and scripts.
</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                    <FaPenFancy className="text-xl text-yellow-300" />
                  </div>
                  <div>
                   <h3 className="font-bold text-lg">Get Credited</h3>
<p className="text-white/80 text-sm mt-1">
  If you provide your name, we may credit you as the contributor or submitter where appropriate.
</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
                    <FaHeart className="text-xl text-yellow-300" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">Earn Blessings</h3>
                    <p className="text-white/80 text-sm mt-1">Help others connect with the divine through your shared knowledge.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* --- RIGHT SIDE: The Form --- */}
          <div className="lg:col-span-3 p-8 md:p-10 lg:p-12 flex items-center bg-transparent">
            <div className="w-full mx-auto">
              
              {status === 'success' ? (
                <div className="text-center max-w-lg mx-auto animate-in zoom-in-95 duration-500">
                  <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_40px_rgba(34,197,94,0.3)] border border-green-200 dark:border-green-800">
                    <FaCheckCircle className="text-5xl text-green-500" />
                  </div>
                  <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
                    Jai Shri Ram! 🙏
                  </h2>
                  <p className="text-gray-600 dark:text-gray-400 text-lg mb-8 leading-relaxed">
                    Your bhajan has been received successfully. Our editorial team will review it, and if you provided contact details, we'll notify you once it's published!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => setStatus('idle')}
                      className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
                    >
                      Submit Another
                    </button>
                    <Link 
                      href="/"
                      className="px-8 py-3.5 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold rounded-xl shadow-sm transition-all outline-none focus-visible:ring-2 focus-visible:ring-gray-500"
                    >
                      Back to Home
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="w-full">
                  <div className="mb-8 lg:hidden">
                    <h2 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">Add a Bhajan</h2>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">Fill out the details below to contribute.</p>
                  </div>

                  {/* Added max-height and custom scrollbar for shorter screens */}
                  <form onSubmit={handleSubmit} className="space-y-5 max-h-[75vh] overflow-y-auto pr-2" style={{ scrollbarWidth: 'thin' }}>
                    
                    {/* 🌟 ROW 1: Title & Tarz (Desktop Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Title Input */}
                      <div className="space-y-2 relative group">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400">
                          Bhajan Title <span className="text-red-500">*</span>
                        </label>
                        <input 
                          type="text" 
                          required
                          value={title}
                          onChange={(e) => setTitle(e.target.value)}
                          placeholder="e.g., Achyutam Keshavam..."
                          className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#0c0804] focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all duration-300 shadow-sm placeholder:text-gray-400 font-medium"
                        />
                      </div>

                      {/* 🌟 NEW: Tarz (Melody) Input */}
                      <div className="space-y-2 relative group">
                        <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400">
                          Tarz / Melody <span className="text-[10px] text-gray-400 font-normal uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">Optional</span>
                        </label>
                        <div className="relative">
                          <input 
                            type="text" 
                            value={tarz}
                            onChange={(e) => setTarz(e.target.value)}
                            placeholder="e.g., 'Ram Darbar' ki tarz par"
                            className="w-full pl-11 pr-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#0c0804] focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all duration-300 shadow-sm placeholder:text-gray-400 font-medium"
                          />
                          <FaMusic className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                        </div>
                      </div>
                    </div>

                    {/* Lyrics Input */}
                    <div className="space-y-2 relative group">
                      <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400">
                        Full Lyrics (Hindi or English) <span className="text-red-500">*</span>
                      </label>
                      <textarea 
                        required
                        rows={6}
                        value={lyrics}
                        onChange={(e) => setLyrics(e.target.value)}
                        placeholder="Enter the lyrics or text you have permission to submit. Don't worry about formatting, we'll clean it up! ✨"
                        className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#0c0804] focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all duration-300 shadow-sm placeholder:text-gray-400 font-medium resize-y"
                      />
                    </div>

                    {/* 🌟 ROW 3: Name & Smart Contact Field (Desktop Grid) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Contributor Input */}
                      <div className="space-y-2 relative group flex flex-col justify-end">
                        <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-orange-600 dark:group-focus-within:text-orange-400">
                          Your Name (For Credits) <span className="text-[10px] text-gray-400 font-normal uppercase tracking-wider bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-1">Optional</span>
                        </label>
                        <input 
                          type="text" 
                          value={contributor}
                          onChange={(e) => setContributor(e.target.value)}
                          placeholder="How should we credit you?"
                          className="w-full px-5 py-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-white/10 text-gray-900 dark:text-white focus:bg-white dark:focus:bg-[#0c0804] focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all duration-300 shadow-sm placeholder:text-gray-400 font-medium"
                        />
                      </div>

                      {/* 🌟 NEW: Smart Contact Field */}
                      <div className="space-y-2 relative group bg-orange-50/50 dark:bg-orange-900/10 p-3 rounded-2xl border border-orange-100 dark:border-orange-500/20">
                        <label className="flex items-center gap-2 text-sm font-bold text-orange-800 dark:text-orange-300 transition-colors">
                          <FaBell className="animate-pulse" /> Publication Updates <span className="text-[10px] text-orange-600/70 dark:text-orange-400/70 font-normal uppercase tracking-wider bg-orange-100 dark:bg-orange-950 px-2 py-0.5 rounded-full">Optional</span>
                        </label>
                        <input 
                          type="text" 
                          value={contactInfo}
                          onChange={(e) => setContactInfo(e.target.value)}
                          placeholder="Email OR WhatsApp Number"
                          className="w-full px-4 py-3 rounded-xl bg-white dark:bg-black/40 border border-orange-200 dark:border-orange-500/30 text-gray-900 dark:text-white focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500 outline-none transition-all duration-300 shadow-sm placeholder:text-gray-400 font-medium text-sm"
                        />
                        <p className="text-[11px] text-orange-700/80 dark:text-orange-300/80 font-medium px-1">
                          Provide this if you want us to ping you when your submission goes live! 🚀
                        </p>
                      </div>
                    </div>

                    {/* Error Message */}
                    {status === 'error' && (
                      <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded-r-xl">
                        <p className="text-red-700 dark:text-red-400 text-sm font-bold">⚠️ Something went wrong connecting to the server. Please try again.</p>
                      </div>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button 
                        type="submit" 
                        disabled={status === 'loading'}
                        className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white font-black text-lg uppercase tracking-widest rounded-xl shadow-[0_10px_20px_rgba(234,88,12,0.3)] hover:shadow-[0_15px_30px_rgba(234,88,12,0.4)] active:scale-[0.98] transition-all disabled:opacity-70 disabled:grayscale flex justify-center items-center gap-3 outline-none focus-visible:ring-4 focus-visible:ring-orange-500/50 group"
                      >
                        {status === 'loading' ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Submitting...
                          </>
                        ) : (
                          <>
                            Submit Bhajan <FaHandSparkles className="text-orange-200 group-hover:scale-125 transition-transform" />
                          </>
                        )}
                      </button>
                      
                     <p className="text-center text-xs text-gray-500 dark:text-gray-500 font-medium mt-4">
  By submitting, you confirm that you have the right or permission to submit this content and agree to our{' '}
  <Link href="/terms" className="text-orange-600 hover:underline">
    Terms of Service
  </Link>{' '}
  and{' '}
  <Link href="/privacy" className="text-orange-600 hover:underline">
    Privacy Policy
  </Link>.
</p>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}