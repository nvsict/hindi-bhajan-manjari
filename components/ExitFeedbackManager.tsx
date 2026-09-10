"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase'; // Adjust path
import { usePathname } from 'next/navigation';
import { FaHandsPraying, FaSpinner, FaRegCircleCheck, FaXmark } from 'react-icons/fa6';

export default function ExitFeedbackManager() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'initial' | 'found' | 'missing' | 'thanks'>('initial');
  // Removed user_email since we are not collecting it anymore
  const [formData, setFormData] = useState({ feedback: '', requested_content: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const isTrapped = useRef(false);

  useEffect(() => {
    if (pathname.startsWith('/admin')) return;

    const hasSubmitted = localStorage.getItem('exit_feedback_submitted');
    const dismissedAt = localStorage.getItem('exit_feedback_dismissed_at');
    const sessionPrompted = sessionStorage.getItem('exit_prompted_this_session');
    
    if (hasSubmitted) return;
    if (sessionPrompted) return; 
    if (dismissedAt && Date.now() - parseInt(dismissedAt) < 7 * 24 * 60 * 60 * 1000) return;

    const timer = setTimeout(() => {
      const pageViews = parseInt(sessionStorage.getItem('hbm_page_views') || '1');
      
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
    }, 30000); 

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
      const { error } = await supabase
        .from('exit_feedback')
        .insert([{ 
          session_id: sessionId,
          pathname,
          time_on_page: timeOnPage,
          scroll_depth: scrollDepth,
          exit_reason: reason,
          feedback_answer: formData.feedback.trim(),
          requested_content: formData.requested_content.trim()
          // user_email is removed from payload
        }]);

      if (error) throw error;
      
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-[#120804] w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-orange-100 dark:border-orange-900/50 animate-slide-up relative">
        
        <button onClick={() => executeSafeExit(true)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 z-10 transition-colors">
          <FaXmark size={20} />
        </button>

        {/* Branch 1: Initial Hook */}
        {step === 'initial' && (
          <div className="p-8 text-center">
            <FaHandsPraying className="text-orange-500 text-4xl mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-orange-50 mb-2">Before you leave...</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 font-medium">Did you find what you were looking for today?</p>
            
            <div className="flex flex-col gap-3">
              <button onClick={() => setStep('found')} className="w-full py-3.5 bg-orange-50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 font-bold rounded-xl hover:bg-orange-100 dark:hover:bg-orange-900/50 transition">
                😊 Yes, I found it
              </button>
              <button onClick={() => setStep('missing')} className="w-full py-3.5 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-md shadow-orange-600/20">
                😕 Not quite
              </button>
            </div>
          </div>
        )}

        {/* Branch 2A: Found It */}
        {step === 'found' && (
          <div className="p-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-orange-50 mb-2">That's great!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">Help us do more of what works. What did you like most about this page?</p>
            <form onSubmit={(e) => handleSubmit(e, 'found_content')}>
              <textarea 
                autoFocus
                rows={3}
                placeholder="Optional feedback..."
                value={formData.feedback}
                onChange={(e) => setFormData({...formData, feedback: e.target.value})}
                className="w-full p-4 mb-4 bg-gray-50 dark:bg-black/50 border border-gray-200 dark:border-orange-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none text-gray-900 dark:text-white"
              />
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition flex items-center justify-center gap-2">
                {isSubmitting ? <FaSpinner className="animate-spin" /> : "Submit"}
              </button>
            </form>
          </div>
        )}

        {/* Branch 2B: Missing */}
        {step === 'missing' && (
          <div className="p-8">
            <h3 className="text-xl font-black text-gray-900 dark:text-orange-50 mb-2">Help us improve</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6 text-sm">We update our library daily. Which bhajan, aarti, or topic were you searching for?</p>
            <form onSubmit={(e) => handleSubmit(e, 'missing_content')}>
              <input 
                autoFocus
                type="text" 
                placeholder="e.g. Kishori Kuch Aisa Intezam..."
                value={formData.requested_content}
                onChange={(e) => setFormData({...formData, requested_content: e.target.value})}
                className="w-full p-4 mb-5 bg-orange-50/50 dark:bg-black/50 border border-orange-200 dark:border-orange-900/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900 dark:text-white"
                required
              />
              <button type="submit" disabled={isSubmitting} className="w-full py-4 bg-orange-600 text-white font-bold rounded-xl hover:bg-orange-700 transition shadow-md flex items-center justify-center gap-2">
                {isSubmitting ? <FaSpinner className="animate-spin" /> : "Request Content"}
              </button>
            </form>
          </div>
        )}

        {/* Branch 3: Thank You (Updated Message) */}
        {step === 'thanks' && (
          <div className="p-8 text-center bg-orange-50 dark:bg-orange-950/20">
            <FaRegCircleCheck className="text-green-500 text-5xl mx-auto mb-4" />
            <h3 className="text-xl font-black text-gray-900 dark:text-orange-50 mb-3">Thank you!</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed text-sm">
              We have received your request! Our team will verify and add this bhajan to the website <strong className="text-orange-600 dark:text-orange-400">within 24 hours</strong>. Please check back tomorrow! 🙏
            </p>
            <button onClick={() => executeSafeExit()} className="w-full py-4 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold rounded-xl hover:bg-gray-800 transition">
              Close & Go Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}