"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase'; // Adjust path based on your folder structure
import { usePathname } from 'next/navigation';
import { FaHandsPraying, FaSpinner, FaRegCircleCheck, FaXmark } from 'react-icons/fa6';

export default function ExitFeedbackManager() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'initial' | 'found' | 'missing' | 'thanks'>('initial');
  const [formData, setFormData] = useState({ feedback: '', requested_content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isTrapped = useRef(false);

  useEffect(() => {
    // एडमिन पेजों पर इसे ना दिखाएं
    if (pathname.startsWith('/admin')) return;

    const hasSubmitted = localStorage.getItem('exit_feedback_submitted');
    const dismissedAt = localStorage.getItem('exit_feedback_dismissed_at');
    const sessionPrompted = sessionStorage.getItem('exit_prompted_this_session');
    
    if (hasSubmitted) return;
    if (sessionPrompted) return; 
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => {
      const pageViews = parseInt(sessionStorage.getItem('hbm_page_views') || '1');
      
      // कम से कम 2 पेज देखने के बाद ही ट्रिगर होगा
      if (pageViews >= 2) { 
        window.history.pushState({ exitTrapped: true }, '', window.location.href);
        isTrapped.current = true;
        
        const handlePopState = (e: PopStateEvent) => {
          if (isTrapped.current && !isOpen) {
            sessionStorage.setItem('exit_prompted_this_session', 'true');
            setIsOpen(true);
            window.history.pushState({ modalOpen: true }, '', window.location.href);
          }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
      }
    }, 30000); // 30 सेकंड का टाइमर

    return () => clearTimeout(timer);
  }, [pathname, isOpen]);

  const executeSafeExit = (dismiss: boolean = false) => {
    if (dismiss) localStorage.setItem('exit_feedback_dismissed_at', Date.now().toString());
    setIsOpen(false);
    isTrapped.current = false;
    window.history.go(-2); 
  };

  const handleSubmit = async (e: React.FormEvent, reason: string) => {
    e.preventDefault();
    if (step === 'missing' && !formData.requested_content.trim()) return;
    
    setIsSubmitting(true);
    
    const timeOnPage = parseInt(sessionStorage.getItem('last_time_on_page') || '0');
    const scrollDepth = parseInt(sessionStorage.getItem('last_scroll_depth') || '0');
    const sessionId = sessionStorage.getItem('hbm_session_id') || crypto.randomUUID();
    sessionStorage.setItem('hbm_session_id', sessionId);

    try {
      // 1. एनालिटिक्स के लिए exit_feedback टेबल में डेटा सेव करें
      const { error: feedbackError } = await supabase
        .from('exit_feedback')
        .insert([{ 
          session_id: sessionId,
          pathname,
          time_on_page: timeOnPage,
          scroll_depth: scrollDepth,
          exit_reason: reason,
          feedback_answer: formData.feedback.trim(),
          requested_content: formData.requested_content.trim()
        }]);

      if (feedbackError) throw feedbackError;

      // 2. अगर यूज़र ने कोई भजन माँगा है, तो उसे content_requests टेबल (To-Do List) में भी सेव करें
      if (reason === 'missing_content' && formData.requested_content.trim()) {
        const { error: requestError } = await supabase
          .from('content_requests')
          .insert([{
            requested_term: formData.requested_content.trim(),
            exit_url: pathname,
            status: 'pending'
          }]);
        
        if (requestError) throw requestError;
      }
      
      localStorage.setItem('exit_feedback_submitted', 'true');
      setStep('thanks');
    } catch (error) {
      console.error("Submission error:", error);
      executeSafeExit();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    // 🌟 FIX: यहाँ style={{ fontFamily: 'var(--font-hind), sans-serif' }} लगाया गया है ताकि फोंट 100% अप्लाई हो
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in tracking-wide"
      style={{ fontFamily: 'var(--font-hind), sans-serif' }}
    >
      <div className="bg-white dark:bg-[#120804] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100 dark:border-orange-900/50 animate-slide-up relative">
        
        <button onClick={() => executeSafeExit(true)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10 transition-colors">
          <FaXmark size={20} />
        </button>

        {/* Branch 1: Initial Hook */}
        {step === 'initial' && (
          <div className="p-8 text-center">
            <FaHandsPraying className="text-orange-500 text-5xl mx-auto mb-4 drop-shadow-sm" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-orange-50 mb-2">जाने से पहले...</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg font-medium">
              क्या आपको वह भजन या जानकारी मिली, जिसे आप आज खोज रहे थे?
            </p>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => setStep('found')} className="w-full py-3.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-bold text-lg rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition border border-orange-100 dark:border-orange-900/50">
                😊 हाँ, मिल गया
              </button>
              <button onClick={() => setStep('missing')} className="w-full py-3.5 bg-orange-600 text-white font-bold text-lg rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-600/30">
                😕 नहीं, मुझे कुछ और चाहिए था
              </button>
            </div>
          </div>
        )}

        {/* Branch 2A: Found It */}
        {step === 'found' && (
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-orange-50 mb-2">यह जानकर खुशी हुई! 🌸</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-base">हम अपनी वेबसाइट को और बेहतर कैसे बना सकते हैं? आपके सुझाव हमारे लिए बहुत महत्वपूर्ण हैं।</p>
            <form onSubmit={(e) => handleSubmit(e, 'found_content')}>
              <textarea 
                autoFocus
                rows={3}
                placeholder="अपने सुझाव यहाँ लिखें (वैकल्पिक)..."
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                className="w-full p-4 mb-4 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-orange-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-gray-900 dark:text-white text-base"
              />
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-orange-600 text-white font-bold text-lg rounded-xl hover:bg-orange-700 transition flex items-center justify-center gap-2 shadow-lg shadow-orange-600/30">
                {isSubmitting ? <FaSpinner className="animate-spin" /> : "सबमिट करें"}
              </button>
            </form>
          </div>
        )}

        {/* Branch 2B: Missing */}
        {step === 'missing' && (
          <div className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-orange-50 mb-2">हम आपकी मदद करेंगे!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-base leading-relaxed">
              हम अपनी लाइब्रेरी रोज़ अपडेट करते हैं। आप कौन सा <strong>भजन, आरती या चालीसा</strong> खोज रहे थे? हमें बताएँ, हम उसे जल्द जोड़ेंगे।
            </p>
            <form onSubmit={(e) => handleSubmit(e, 'missing_content')}>
              <input 
                autoFocus
                type="text" 
                placeholder="उदाहरण: किशोरी कुछ ऐसा इंतज़ाम हो जाए..."
                value={formData.requested_content}
                onChange={(e) => setFormData({...formData, requested_content: e.target.value})}
                className="w-full p-4 mb-5 bg-orange-50/50 dark:bg-black/50 border border-orange-200 dark:border-orange-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white text-lg placeholder-gray-400"
                required
              />
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-orange-600 text-white font-bold text-lg rounded-xl hover:bg-orange-700 transition shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2">
                {isSubmitting ? <FaSpinner className="animate-spin" /> : "भजन के लिए निवेदन करें"}
              </button>
            </form>
          </div>
        )}

        {/* Branch 3: Thank You */}
        {step === 'thanks' && (
          <div className="p-8 text-center bg-orange-50 dark:bg-orange-950/20">
            <FaRegCircleCheck className="text-green-500 text-6xl mx-auto mb-4 drop-shadow-sm" />
            <h3 className="text-2xl font-bold text-gray-900 dark:text-orange-50 mb-3">धन्यवाद! 🙏</h3>
            
            {/* 🌟 यहाँ हमने स्मार्ट लॉजिक लगाया है */}
            {formData.requested_content ? (
              // अगर उसने कुछ माँगा है (Missing Content)
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                हमें आपका निवेदन मिल गया है! हमारी टीम इसे जाँचेगी और <strong className="text-orange-600 dark:text-orange-400">24 घंटे के अंदर</strong> इस भजन को वेबसाइट पर जोड़ देगी। कृपया कल फिर चेक करें!
              </p>
            ) : (
              // अगर उसने सिर्फ फीडबैक दिया है (Found Content)
              <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-lg">
                आपके कीमती सुझाव और समय के लिए बहुत-बहुत धन्यवाद! इससे हमें हिंदी भजन मंजरी को और भी बेहतर बनाने में मदद मिलेगी। 🌸
              </p>
            )}

            <button onClick={() => executeSafeExit()} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-lg rounded-xl hover:bg-gray-800 transition shadow-lg shadow-gray-900/20">
              बंद करें और वापस जाएँ
            </button>
          </div>
        )}
      </div>
    </div>
  );
}