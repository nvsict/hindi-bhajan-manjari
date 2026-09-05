"use client";

import { useState } from 'react';
import { FaPaperPlane, FaBell, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';

export default function PushBroadcaster() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [url, setUrl] = useState('');
  
  const [isSending, setIsSending] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setStatus({ type: null, message: '' });

    try {
      // 🌟 FIX: Updated payload key from 'body' to 'message' to match API expectation
      const res = await fetch('/api/push/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title, 
          message: body, 
          url: url || 'https://hindibhajanmanjari.com' 
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to send broadcast');

      // 🌟 FIX: Safely parse message based on backend return fields (totalSent and removed)
      const successMsg = `Successfully broadcasted to ${data.totalSent || 0} subscribers!` + 
        (data.removed > 0 ? ` (Cleaned up ${data.removed} dead subscriptions)` : '');

      setStatus({ type: 'success', message: successMsg });
      setTitle('');
      setBody('');
      setUrl('');
    } catch (error: any) {
      setStatus({ type: 'error', message: error.message });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-white shadow-xl shadow-gray-900/5 border border-gray-100 rounded-[2rem] p-6 md:p-8 font-sans">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600">
          <FaBell size={18} />
        </div>
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Broadcast Notification</h2>
          <p className="text-sm font-medium text-gray-500">Send a push message to all subscribers instantly.</p>
        </div>
      </div>

      {status.message && (
        <div className={`p-4 mb-6 rounded-xl font-bold flex items-center gap-2 text-sm ${status.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
          {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationCircle />}
          {status.message}
        </div>
      )}

      <form onSubmit={handleBroadcast} className="space-y-5">
        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Message Title *</label>
          <input 
            type="text" 
            required 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            placeholder="e.g., 🙏 Start your morning with Hanuman Chalisa"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-bold text-gray-900" 
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Message Body *</label>
          <textarea 
            required 
            rows={2}
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
            placeholder="e.g., Tap here to read the full lyrics in Hindi and understand the deep meaning."
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium text-gray-800 resize-none" 
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 ml-1">Target URL (Optional)</label>
          <input 
            type="text" 
            value={url} 
            onChange={(e) => setUrl(e.target.value)} 
            placeholder="e.g., https://www.hindibhajanmanjari.com/bhajan/hanuman-chalisa"
            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:bg-white focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-mono text-sm text-gray-600" 
          />
        </div>

        <button 
          type="submit" 
          disabled={isSending} 
          className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-2xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:pointer-events-none"
        >
          {isSending ? 'Broadcasting...' : <><FaPaperPlane /> Send to All Subscribers</>}
        </button>
      </form>
    </div>
  );
}