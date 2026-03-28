"use client";

import { useState, useEffect } from 'react';
import { FaMobileScreen, FaXmark } from 'react-icons/fa6';

// Define the custom browser event type for TypeScript
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPwaPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const hasDismissed = localStorage.getItem('hasDismissedInstallPrompt');

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome's default mini-infobar from appearing
      e.preventDefault();
      // Save the event so we can trigger it later when the user clicks our button
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      if (!hasDismissed) {
        // 🌟 Delay showing it by 10 seconds so it doesn't fight with your Push Prompt!
        setTimeout(() => setShowPrompt(true), 10000); 
      }
    };

    const handleAppInstalled = () => {
      // If the user installs the app via the browser menu, hide our prompt
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the native browser install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the native prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User installed the Bhajan App!');
    } else {
      console.log('User dismissed the install prompt');
    }

    // The prompt event can only be used once, so we throw it away
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('hasDismissedInstallPrompt', 'true');
  };

  // Only render if Chrome has fired the event AND the user hasn't dismissed it
  if (!showPrompt || !deferredPrompt) return null;

  return (
    // 🌟 Placed at the TOP of the screen so it doesn't overlap your BOTTOM Push Prompt
    <div className="fixed top-4 left-4 right-4 md:left-auto md:right-6 z-[9999] max-w-md w-auto animate-in slide-in-from-top-5 fade-in duration-500">
      <div className="bg-white border border-orange-100 shadow-[0_12px_40px_rgba(234,88,12,0.15)] rounded-2xl p-3 md:p-4 flex items-center gap-4">
        
        {/* App Icon Box */}
        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shrink-0 text-white shadow-inner">
          <FaMobileScreen className="text-xl" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">
            Install App (ऑफ़लाइन पढ़ें)
          </p>
          <p className="text-[12px] font-medium text-gray-500 truncate">
            Read Bhajans without internet.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
          <button 
            onClick={handleInstall} 
            className="whitespace-nowrap bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-lg text-xs font-black transition-all active:scale-95"
          >
            Install
          </button>
          
          <button 
            onClick={handleDismiss} 
            className="p-2 text-gray-500 hover:text-gray-600 transition-colors"
          >
            <FaXmark size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}