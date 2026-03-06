"use client";

import { useState, useEffect } from 'react';
import { FaBell, FaHandsPraying, FaCheck, FaXmark } from 'react-icons/fa6';

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
  const [showPrompt, setShowPrompt] = useState(false);
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const checkSubscription = async () => {
      const registration = await navigator.serviceWorker.register('/sw.js');
      const existingSubscription = await registration.pushManager.getSubscription();
      const hasSeenPrompt = localStorage.getItem('hasSeenPushPrompt');

      if (!existingSubscription && !hasSeenPrompt) {
        setTimeout(() => setShowPrompt(true), 5000); // 5s delay so user can start reading first
      }
    };

    checkSubscription();
  }, []);

  const handleAccept = async () => {
    setIsSubscribing(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') throw new Error('Permission denied');

      const registration = await navigator.serviceWorker.ready;
      const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!publicVapidKey) throw new Error('VAPID public key missing');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });

      setShowPrompt(false);
      localStorage.setItem('hasSeenPushPrompt', 'true');
    } catch (error) {
      console.error("Subscription failed:", error);
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDecline = () => {
    setShowPrompt(false);
    localStorage.setItem('hasSeenPushPrompt', 'true'); 
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 z-[9999] max-w-md w-auto animate-in slide-in-from-bottom-5 fade-in duration-500">
      <div className="bg-white border border-orange-100 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-2xl p-3 md:p-4 flex items-center gap-4">
        
        {/* Compact Icon */}
        <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center shrink-0 text-orange-600">
          <FaHandsPraying className="text-xl animate-bounce" style={{ animationDuration: '3s' }} />
        </div>

        {/* Precise Text */}
        <div className="flex-1 min-w-0">
          <p className="text-[14px] font-bold text-gray-900 leading-tight truncate">
            भजन अपडेट्स पाएं (Daily Updates)
          </p>
          <p className="text-[12px] font-medium text-gray-500 truncate">
            Get daily Bhajans & Aartis.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 border-l border-gray-100 pl-4">
          <button 
            onClick={handleAccept} 
            disabled={isSubscribing}
            className="whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded-lg text-xs font-black transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubscribing ? '...' : 'Allow'}
          </button>
          
          <button 
            onClick={handleDecline} 
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaXmark size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}