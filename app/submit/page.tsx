"use client";

import { useState } from 'react';
import { supabase } from '../../utils/supabase';
import { FaPrayingHands } from 'react-icons/fa';

export default function SubmitBhajan() {
  const [title, setTitle] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [contributor, setContributor] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    const { error } = await supabase
      .from('pending_bhajans')
      .insert([{ title, lyrics, contributor_name: contributor }]);

    if (error) {
      console.error(error);
      setStatus('error');
    } else {
      setStatus('success');
      setTitle('');
      setLyrics('');
      setContributor('');
    }
  };

  return (
    <div className="min-h-screen bg-orange-50/30 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-orange-100">
        
        <div className="text-center mb-10">
          <FaPrayingHands className="text-5xl text-orange-500 mx-auto mb-4" />
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-2">Submit a Bhajan</h1>
          <p className="text-gray-600">Help us grow our collection. Submit missing lyrics and we will add them to the website after review!</p>
        </div>

        {status === 'success' ? (
          <div className="bg-green-50 text-green-800 p-6 rounded-2xl border border-green-200 text-center">
            <h3 className="text-xl font-bold mb-2">🙏 Thank You!</h3>
            <p>Your bhajan has been submitted successfully. Our team will review and publish it soon.</p>
            <button 
              onClick={() => setStatus('idle')}
              className="mt-4 px-6 py-2 bg-green-600 text-white font-bold rounded-full hover:bg-green-700 transition-colors"
            >
              Submit Another
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Bhajan Title *</label>
              <input 
                type="text" 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Achyutam Keshavam"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Full Lyrics (Hindi or English) *</label>
              <textarea 
                required
                rows={8}
                value={lyrics}
                onChange={(e) => setLyrics(e.target.value)}
                placeholder="Paste the full lyrics here..."
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Your Name (Optional)</label>
              <input 
                type="text" 
                value={contributor}
                onChange={(e) => setContributor(e.target.value)}
                placeholder="So we can credit you!"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>

            {status === 'error' && (
              <p className="text-red-500 text-sm font-bold">Something went wrong. Please try again.</p>
            )}

            <button 
              type="submit" 
              disabled={status === 'loading'}
              className="w-full py-4 bg-orange-600 text-white font-bold text-lg rounded-xl hover:bg-orange-700 active:scale-[0.98] transition-all disabled:opacity-70 flex justify-center items-center"
            >
              {status === 'loading' ? 'Submitting...' : 'Submit Bhajan'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}