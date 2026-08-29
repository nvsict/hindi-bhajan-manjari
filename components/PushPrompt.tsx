"use client";

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { FaBell, FaTriangleExclamation, FaXmark, FaCheck, FaGear } from 'react-icons/fa6';

// Helper to convert VAPID key for PushManager
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

export default function PushPrompt() {
  const [showBell, setShowBell] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission | 'unsupported'>('default');
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); 

    // Check if push notifications are supported in this browser
    if (typeof window === "undefined" || !('serviceWorker' in navigator) || !('PushManager' in window)) {
      setPermissionStatus('unsupported');
      return;
    }

    const init = async () => {
      setPermissionStatus(Notification.permission);
      const hasSeenThisSession = sessionStorage.getItem('has_seen_bell_session');
      
      if (Notification.permission !== 'granted' && !hasSeenThisSession) {
        setShowBell(true);
      }
    };

    init();
  }, []);

  const handleBellClick = () => {
    setPermissionStatus(Notification.permission);
    setShowModal(true);
    sessionStorage.setItem('has_seen_bell_session', 'true');
  };

  // 🌟 THE UPGRADED & BULLETPROOF SUBSCRIBE HANDLER
  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      // 🌟 FIX 1: Cross-browser safe permission request (Handles both Promises and Callbacks for older Safari)
      const permission = await new Promise<NotificationPermission>((resolve) => {
        const permPromise = Notification.requestPermission((result) => resolve(result));
        if (permPromise) {
          permPromise.then(resolve);
        }
      });
      
      setPermissionStatus(permission);

      if (permission === 'granted') {
        // 🌟 FIX 2: Force register SW first. Prevents hanging on .ready if the mobile OS suspended the worker.
        const registration = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready; // Now 100% safe to await
        
        const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
        
        if (publicVapidKey) {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
          });

          // Send to backend
          const response = await fetch('/api/push/subscribe', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(subscription)
          });

          if (!response.ok) {
            throw new Error("Failed to save subscription on server");
          }
          
          setShowModal(false);
          setShowBell(false);
        } else {
          console.error("VAPID Key is missing in environment variables!");
        }
      }
    } catch (error) {
      console.error("Subscription failed:", error);
      alert("कुछ तकनीकी समस्या आ रही है। कृपया पेज रीफ्रेश करके दोबारा प्रयास करें।");
    } finally {
      // 🌟 Ensures the button ALWAYS resets, even if the user closes the prompt or an error occurs
      setIsSubscribing(false);
    }
  };

  if (!mounted) return null; 

  const modalContent = showModal ? (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm md:max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border border-orange-100 animate-in zoom-in-95 duration-300">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-b from-orange-500 to-orange-600 p-8 md:p-10 flex justify-center relative">
          <button 
            onClick={() => setShowModal(false)}
            className="absolute top-4 right-4 text-white/80 hover:text-white p-2 outline-none"
          >
            <FaXmark size={20} />
          </button>
          
          {/* LOGO CONTAINER */}
          <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-[1.25rem] md:rounded-[1.5rem] flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,0,0,0.15)] relative overflow-hidden p-1">
            {permissionStatus === 'denied' ? (
              <FaTriangleExclamation className="text-4xl md:text-5xl text-orange-500 animate-pulse" />
            ) : (
              <Image 
                src="/logo.png" 
                alt="Hindi Bhajan Manjari Logo" 
                width={80} 
                height={80} 
                className="w-full h-full object-contain drop-shadow-sm"
              />
            )}
          </div>
        </div>

        <div className="p-6 md:p-8 text-center pt-8 md:pt-10">
          {permissionStatus === 'denied' ? (
            /* 🚩 BLOCKED STATE CONTENT */
            <>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 md:mb-3 font-hindi">🔔 नोटिफिकेशन्स ब्लॉक हैं</h3>
              <p className="text-gray-600 text-[13px] md:text-base leading-relaxed mb-5 md:mb-6">
                ऐसा लगता है कि आपने नोटिफिकेशन्स बंद कर रखे हैं। रोज़ाना <span className="text-orange-600 font-bold">नए भजन और आध्यात्मिक संदेश</span> पाने के लिए कृपया इन्हें चालू करें।
              </p>
              
              <div className="bg-orange-50 rounded-2xl p-4 mb-6 text-left border border-orange-100">
                <p className="text-[12px] font-black text-orange-800 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                  <FaGear /> 🔓 चालू (Unblock) कैसे करें:
                </p>
                <ol className="text-[13px] text-gray-700 space-y-2.5 font-medium">
                  <li><span className="font-bold text-orange-600">1.</span> ब्राउज़र के ऊपर 🔒 (Lock) आइकॉन पर क्लिक करें।</li>
                  <li><span className="font-bold text-orange-600">2.</span> 'Notifications' को <b>Allow (अनुमति दें)</b> पर सेट करें।</li>
                  <li><span className="font-bold text-orange-600">3.</span> इस पेज को एक बार 🔄 रीफ्रेश करें।</li>
                </ol>
              </div>

              <button 
                onClick={() => setShowModal(false)}
                className="w-full py-3.5 bg-gray-900 text-white rounded-2xl font-bold text-sm hover:bg-black transition-all active:scale-95 outline-none"
              >
                ठीक है, समझ गया
              </button>
            </>
          ) : (
            /* 🕊️ DEFAULT STATE CONTENT */
            <>
              <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 md:mb-3 font-hindi">🪔 भजन और आरती अपडेट्स</h3>
              <p className="text-gray-600 text-[13px] md:text-base leading-relaxed mb-6 md:mb-8">
                अपने दिन की शुरुआत प्रभु के आशीर्वाद से करें। हम रोज़ सुबह आपको <span className="text-orange-600 font-bold">एक नया भजन या आरती</span> भेजेंगे।
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleSubscribe}
                  disabled={isSubscribing}
                  className="w-full py-3.5 md:py-4 bg-orange-600 text-white rounded-2xl font-black text-sm md:text-base shadow-[0_8px_20px_rgba(234,88,12,0.3)] hover:bg-orange-700 transition-all active:scale-95 flex items-center justify-center gap-2 outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubscribing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      चालू हो रहा है...
                    </>
                  ) : (
                    "🙏 हाँ, अपडेट्स चालू करें"
                  )} 
                </button>
                <button 
                  onClick={() => setShowModal(false)}
                  disabled={isSubscribing}
                  className="w-full py-2 md:py-3 text-gray-400 font-bold text-sm hover:text-gray-600 transition-colors outline-none disabled:opacity-50"
                >
                  अभी नहीं (Later)
                </button>
              </div>
            </>
          )}
        </div>

        {/* Footer Trust Signal */}
        <div className="bg-gray-50 py-3 text-center border-t border-gray-100">
          <p className="text-[10px] md:text-[11px] text-gray-500 uppercase tracking-widest font-bold">
            ✨ 100% सुरक्षित • कोई फालतू मैसेज नहीं (No Spam)
          </p>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      {/* 🌟 THE TOOLBAR BUTTON */}
      {showBell && (
        <button
          onClick={handleBellClick}
          className="relative w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center rounded-full hover:bg-orange-50 transition-colors shrink-0 group outline-none"
          aria-label="Notifications"
        >
          <span className="absolute top-1 right-1 sm:top-2 sm:right-2 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-orange-500 border-[1.5px] border-white"></span>
          </span>
          <FaBell className="text-lg sm:text-xl text-gray-500 group-hover:text-orange-500 transition-colors" />
        </button>
      )}

      {/* 🌟 Modal Portal */}
      {typeof document !== 'undefined' && createPortal(modalContent, document.body)}
    </>
  );
}