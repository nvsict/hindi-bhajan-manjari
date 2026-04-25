"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FaBell, FaXmark, FaCheck } from 'react-icons/fa6';

const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export default function SlideInPrompt() {
  const [showSlideIn, setShowSlideIn] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 

    if (typeof window === "undefined" || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      return;
    }

    const checkEligibility = () => {
      const hasSeenPrompt = localStorage.getItem('has_seen_push_slidein');
      const isAlreadySubscribed = Notification.permission === 'granted';
      const isDenied = Notification.permission === 'denied';

      // अगर यूज़र ने पहले ही देख लिया है, या सब्सक्राइब कर चुका है, या ब्लॉक कर दिया है, तो कुछ मत दिखाओ
      if (hasSeenPrompt || isAlreadySubscribed || isDenied) {
        return false;
      }
      return true;
    };

    if (checkEligibility()) {
      let isTriggered = false;

      // 🌟 TRIGGER 1: 30 Seconds Delay
      const timer = setTimeout(() => {
        if (!isTriggered) {
          setShowSlideIn(true);
          isTriggered = true;
          localStorage.setItem('has_seen_push_slidein', 'true');
        }
      }, 30000); // 30 seconds

      // 🌟 TRIGGER 2: 40% Scroll Depth
      const handleScroll = () => {
        if (isTriggered) return;
        
        const scrollTop = window.scrollY;
        const docHeight = document.body.offsetHeight;
        const winHeight = window.innerHeight;
        const scrollPercent = scrollTop / (docHeight - winHeight);

        if (scrollPercent > 0.4) {
          setShowSlideIn(true);
          isTriggered = true;
          localStorage.setItem('has_seen_push_slidein', 'true');
          window.removeEventListener('scroll', handleScroll);
        }
      };

      window.addEventListener('scroll', handleScroll, { passive: true });

      return () => {
        clearTimeout(timer);
        window.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        const registration = await navigator.serviceWorker.ready;
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (publicVapidKey) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });

          await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });
          
          setIsSuccess(true);
          // Success message 3 seconds tak dikhao, fir toast hide kardo
          setTimeout(() => setShowSlideIn(false), 3000);
        }
      } else {
        // User denied inside the browser prompt
        setShowSlideIn(false);
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      setShowSlideIn(false);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setShowSlideIn(false);
    // You can set a cookie here to not bother them for 7 days if you want
  };

  if (!mounted) return null; 

  const slideInContent = (
    <div 
      className={`fixed bottom-24 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-2rem)] sm:w-[380px] z-[9999] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
        showSlideIn ? 'translate-x-0 opacity-100' : 'translate-x-[120%] opacity-0'
      }`}
    >
      <div className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-orange-100 overflow-hidden relative">
        
        {/* Close Button */}
        <button 
          onClick={handleDismiss}
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          aria-label="Close"
        >
          <FaXmark size={14} />
        </button>

        {isSuccess ? (
          // 🌟 SUCCESS STATE
          <div className="p-8 text-center bg-gradient-to-br from-green-50 to-white">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg text-white">
              <FaCheck size={30} />
            </div>
            <h3 className="text-xl font-black text-gray-900 mb-2 font-hindi">धन्यवाद! 🙏</h3>
            <p className="text-gray-600 text-sm font-medium">आप हमारे परिवार से जुड़ गए हैं। अब आपको रोज़ाना नए भजन मिला करेंगे।</p>
          </div>
        ) : (
          // 🌟 PROMPT STATE
          <div className="p-6">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100 shadow-sm relative overflow-hidden">
                <Image 
                  src="/logo.png" 
                  alt="Hindi Bhajan Manjari" 
                  width={40} 
                  height={40} 
                  className="object-contain"
                />
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white"></span>
                </span>
              </div>
              
              <div>
                <h3 className="text-lg font-black text-gray-900 leading-tight mb-1 font-hindi">दैनिक भजन और आरती</h3>
                <p className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">Free Subscription</p>
              </div>
            </div>

            {/* 🌟 THE EMOTIONAL HOOK */}
            <p className="text-gray-700 text-[14px] leading-relaxed font-hindi font-medium mb-6 bg-orange-50/50 p-4 rounded-2xl border-l-4 border-orange-500">
              🙏 जय श्री राम! हमारे 5,000+ भक्तों के परिवार से जुड़ें और दैनिक पूजा के लिए नए भजन सीधे अपने फोन पर पाएँ।
            </p>

            <div className="flex gap-3">
              <button 
                onClick={handleSubscribe}
                disabled={isSubscribing}
                className="flex-1 py-3 bg-orange-600 text-white rounded-xl font-bold text-sm shadow-[0_4px_15px_rgba(234,88,12,0.3)] hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {isSubscribing ? (
                  <span className="animate-pulse">चालू हो रहा है...</span>
                ) : (
                  <>
                    <FaBell /> हाँ, बिल्कुल!
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(slideInContent, document.body) : null;
}