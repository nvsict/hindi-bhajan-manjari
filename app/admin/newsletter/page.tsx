"use client";

import { useState, useEffect, useCallback } from 'react';
import { 
  getSubscriberCountAction, 
  getSubscribersListAction, 
  removeSubscriberAction, 
  sendTestEmailAction, 
  sendBulkNewsletterAction 
} from '@/app/actions/newsletterActions';
import { 
  FaPaperPlane, FaUsers, FaSpinner, FaCheckCircle, 
  FaExclamationTriangle, FaEnvelope, FaTrash, FaVial, 
  FaChevronLeft, FaChevronRight, FaEye, FaPen 
} from 'react-icons/fa';

export default function FullNewsletterAdmin() {
  // ==========================================
  // 🌟 STATE MANAGEMENT
  // ==========================================
  const [activeTab, setActiveTab] = useState<'compose' | 'audience'>('compose');
  const [viewMode, setViewMode] = useState<'edit' | 'preview'>('edit'); // 🌟 NEW: Live Preview Toggle
  const [message, setMessage] = useState({ type: '', text: '' });

  // Compose State
  const [subject, setSubject] = useState('');
  const [content, setContent] = useState('');
  const [testEmail, setTestEmail] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);

  // Audience State
  const [subscribers, setSubscribers] = useState<any[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingAudience, setIsLoadingAudience] = useState(true);

  // ==========================================
  // 🌟 DATA FETCHING
  // ==========================================
  const fetchAudienceData = useCallback(async (page: number) => {
    setIsLoadingAudience(true);
    const countRes = await getSubscriberCountAction();
    if (countRes.success) setTotalCount(countRes.count);

    const listRes = await getSubscribersListAction(page, 20); // 20 per page
    if (listRes.success) {
      setSubscribers(listRes.subscribers);
      setTotalPages(listRes.totalPages || 1);
    }
    setIsLoadingAudience(false);
  }, []);

  useEffect(() => {
    fetchAudienceData(currentPage);
  }, [currentPage, fetchAudienceData]);

  const showNotification = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 8000); 
  };

  // ==========================================
  // 🌟 HANDLERS & HTML GENERATOR
  // ==========================================
  // 🌟 ENHANCED: HTML Template (Live Preview uses this same template)
  const getFormattedHtml = () => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333; border: 1px solid #eaeaea; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
      <div style="background-color: #D35400; padding: 24px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 24px;">Hindi Bhajan Manjari</h1>
      </div>
      <div style="padding: 32px; background-color: #ffffff; line-height: 1.6; font-size: 16px;">
        <h2 style="color: #D35400; margin-top: 0;">${subject || 'यहाँ आपका विषय (Subject) दिखेगा'}</h2>
        <div>${content ? content.replace(/\n/g, '<br/>') : 'यहाँ आपका मुख्य संदेश दिखेगा...'}</div>
      </div>
      <div style="background-color: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eaeaea;">
        <p style="font-size: 12px; color: #999; margin: 0;">
          आप यह ईमेल इसलिए प्राप्त कर रहे हैं क्योंकि आप Hindi Bhajan Manjari से जुड़े हैं।
        </p>
      </div>
    </div>
  `;

  const handleTestSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content || !testEmail) return showNotification('error', 'Subject, Content, और Test Email भरना अनिवार्य है।');
    
    setIsTesting(true);
    const res = await sendTestEmailAction(testEmail, subject, getFormattedHtml());
    if (res.success) {
      showNotification('success', `टेस्ट ईमेल ${testEmail} पर सफलतापूर्वक भेज दिया गया!`);
    } else {
      showNotification('error', `टेस्ट ईमेल फेल: ${res.error}`);
    }
    setIsTesting(false);
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !content) return showNotification('error', 'Subject और Content भरना अनिवार्य है।');
    
    if (!window.confirm(`⚠️ चेतावनी: क्या आप सच में ${totalCount} सब्सक्राइबर्स को यह ईमेल ब्रॉडकास्ट (Broadcast) करना चाहते हैं?`)) return;

    setIsBroadcasting(true);
    const res = await sendBulkNewsletterAction(subject, getFormattedHtml());
    
    if (res.success) {
      showNotification('success', `🎉 बधाई हो! ${res.totalSent} लोगों को आपका न्यूज़लेटर भेज दिया गया।`);
      setSubject('');
      setContent('');
      setViewMode('edit'); // ब्रॉडकास्ट के बाद वापस एडिट मोड में आ जाएं
    } else {
      showNotification('error', `ब्रॉडकास्ट फेल: ${res.error}`);
    }
    setIsBroadcasting(false);
  };

  const handleDeleteSubscriber = async (email: string) => {
    if (!window.confirm(`क्या आप ${email} को लिस्ट से हटाना चाहते हैं?`)) return;
    
    const res = await removeSubscriberAction(email);
    if (res.success) {
      showNotification('success', `${email} को सब्सक्राइबर्स लिस्ट से हटा दिया गया है।`);
      fetchAudienceData(currentPage);
    } else {
      showNotification('error', `डिलीट करने में समस्या हुई: ${res.error}`);
    }
  };

  // ==========================================
  // 🌟 UI COMPONENTS
  // ==========================================
  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 font-sans">
      
      {/* HEADER & STATS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Newsletter HQ</h1>
          <p className="text-gray-500 font-medium mt-1">अपने पाठकों से सीधे जुड़ें और उन्हें नए अपडेट्स भेजें।</p>
        </div>
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 rounded-2xl flex items-center gap-4 shadow-lg shadow-orange-500/20 text-white">
          <FaUsers size={28} className="opacity-80" />
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest opacity-80">Total Audience</p>
            <p className="text-2xl font-black leading-none">{totalCount}</p>
          </div>
        </div>
      </div>

      {/* NOTIFICATIONS */}
      {message.text && (
        <div className={`p-4 mb-6 rounded-xl font-bold flex items-center gap-3 border shadow-sm animate-fade-in-up ${
          message.type === 'error' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-green-50 text-green-700 border-green-100'
        }`}>
          {message.type === 'success' ? <FaCheckCircle size={18} /> : <FaExclamationTriangle size={18} />}
          {message.text}
        </div>
      )}

      {/* TABS NAVIGATION */}
      <div className="flex gap-2 mb-8 bg-gray-100 p-1.5 rounded-xl md:w-fit">
        <button 
          onClick={() => setActiveTab('compose')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'compose' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <FaPaperPlane /> Compose & Send
        </button>
        <button 
          onClick={() => setActiveTab('audience')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm transition-all ${
            activeTab === 'audience' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-800'
          }`}
        >
          <FaUsers /> Audience Data
        </button>
      </div>

      {/* ==========================================
          TAB 1: COMPOSE & SEND
          ========================================== */}
      {activeTab === 'compose' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* 🌟 ENHANCED: Editor / Preview Column */}
          <div className="lg:col-span-2 bg-white p-6 md:p-8 rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)]">
            
            {/* View Mode Toggle */}
            <div className="flex gap-4 border-b border-gray-100 pb-4 mb-6">
              <button 
                onClick={(e) => { e.preventDefault(); setViewMode('edit'); }}
                className={`flex items-center gap-2 font-bold pb-2 border-b-2 transition-all ${
                  viewMode === 'edit' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <FaPen size={14} /> Write Message
              </button>
              <button 
                onClick={(e) => { e.preventDefault(); setViewMode('preview'); }}
                className={`flex items-center gap-2 font-bold pb-2 border-b-2 transition-all ${
                  viewMode === 'preview' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                <FaEye size={14} /> Live Email Preview
              </button>
            </div>

            {viewMode === 'edit' ? (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Subject (ईमेल का विषय)</label>
                  <input 
                    type="text" 
                    value={subject} onChange={(e) => setSubject(e.target.value)}
                    placeholder="उदा: आज के नए भजन और सुविचार..."
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium"
                  />
                </div>
                <div>
                  <div className="flex justify-between items-end mb-2">
                    <label className="block text-sm font-bold text-gray-700">Message (आपका मुख्य संदेश)</label>
                    <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">Supports HTML (e.g., &lt;b&gt;bold&lt;/b&gt;)</span>
                  </div>
                  <textarea 
                    rows={12} value={content} onChange={(e) => setContent(e.target.value)}
                    placeholder="यहाँ अपना न्यूज़लेटर लिखें... (Enter दबाने पर लाइन ब्रेक अपने आप ईमेल में बन जाएगा।)"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-4 focus:ring-orange-500/10 focus:border-orange-400 outline-none transition-all font-medium resize-y leading-relaxed"
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="animate-fade-in bg-gray-50 p-4 md:p-8 rounded-xl border border-gray-200 flex justify-center overflow-x-auto">
                {/* 🌟 LIVE HTML PREVIEW RENDERER */}
                <div 
                  className="w-full max-w-[600px] shadow-sm bg-white"
                  dangerouslySetInnerHTML={{ __html: getFormattedHtml() }} 
                />
              </div>
            )}
          </div>

          {/* Action Column (Untouched) */}
          <div className="space-y-6">
            
            {/* Step 1: Test Email */}
            <div className="bg-blue-50/50 p-6 rounded-[2rem] border border-blue-100">
              <h3 className="font-black text-blue-900 mb-4 flex items-center gap-2">
                <FaVial className="text-blue-500" /> 1. Send Test Draft
              </h3>
              <p className="text-xs text-blue-700 mb-4 font-medium">सबको भेजने से पहले खुद को भेज कर डिज़ाइन और स्पेलिंग चेक करें।</p>
              <form onSubmit={handleTestSend} className="space-y-3">
                <input 
                  type="email" value={testEmail} onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="आपका पर्सनल ईमेल..." required
                  className="w-full px-4 py-3 bg-white border border-blue-200 rounded-lg outline-none text-sm font-medium focus:border-blue-500"
                />
                <button type="submit" disabled={isTesting} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold text-sm transition-colors flex justify-center items-center gap-2">
                  {isTesting ? <FaSpinner className="animate-spin" /> : <FaEnvelope />} {isTesting ? 'Sending...' : 'Send Test'}
                </button>
              </form>
            </div>

            {/* Step 2: Broadcast */}
            <div className="bg-orange-50/50 p-6 rounded-[2rem] border border-orange-100">
              <h3 className="font-black text-orange-900 mb-4 flex items-center gap-2">
                <FaPaperPlane className="text-orange-500" /> 2. Broadcast to All
              </h3>
              <p className="text-xs text-orange-700 mb-4 font-medium">
                यह बटन दबाते ही आपका ईमेल सभी <b>{totalCount}</b> सब्सक्राइबर्स के इनबॉक्स में तुरंत चला जाएगा।
              </p>
              <button 
                onClick={handleBroadcast} disabled={isBroadcasting || totalCount === 0}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-500 text-white py-4 rounded-xl font-black text-sm shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(234,88,12,0.4)] transition-all flex justify-center items-center gap-2 disabled:opacity-50 disabled:pointer-events-none"
              >
                {isBroadcasting ? <FaSpinner className="animate-spin text-lg" /> : 'Send Live Broadcast'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ==========================================
          TAB 2: AUDIENCE MANAGER (Untouched)
          ========================================== */}
      {activeTab === 'audience' && (
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.05)] overflow-hidden">
          <div className="p-6 md:p-8 border-b border-gray-100">
            <h2 className="text-xl font-black text-gray-900">Subscriber Database</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase tracking-widest text-gray-500">
                  <th className="p-4 pl-8 font-bold">Email Address</th>
                  <th className="p-4 font-bold">Joined Date</th>
                  <th className="p-4 pr-8 font-bold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {isLoadingAudience ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-medium"><FaSpinner className="animate-spin inline text-xl mr-2"/> Loading data...</td></tr>
                ) : subscribers.length === 0 ? (
                  <tr><td colSpan={3} className="p-8 text-center text-gray-400 font-medium">कोई सब्सक्राइबर नहीं मिला।</td></tr>
                ) : (
                  subscribers.map((sub, i) => (
                    <tr key={i} className="hover:bg-orange-50/30 transition-colors">
                      <td className="p-4 pl-8 font-semibold text-gray-800">{sub.email}</td>
                      <td className="p-4 text-sm font-medium text-gray-500">
                        {new Date(sub.created_at).toLocaleDateString('hi-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="p-4 pr-8 text-right">
                        <button 
                          onClick={() => handleDeleteSubscriber(sub.email)}
                          className="text-red-400 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-colors"
                          title="Remove Subscriber"
                        >
                          <FaTrash size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
              <button 
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(p => p - 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100"
              >
                <FaChevronLeft /> Previous
              </button>
              <span className="text-sm font-bold text-gray-500">
                Page {currentPage} of {totalPages}
              </span>
              <button 
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 disabled:opacity-50 hover:bg-gray-100"
              >
                Next <FaChevronRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}