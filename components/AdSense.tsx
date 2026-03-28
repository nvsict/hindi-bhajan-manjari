"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function AdSense() {
  const pathname = usePathname();

  useEffect(() => {
    // 🛑 THE BLOCKER: अगर URL '/admin' है, तो एड्स का रिफ्रेश लॉजिक मत चलाओ
    if (pathname?.startsWith("/admin")) return;

    // 🚀 THE SPA GHOST FIX (Route Change Ad Refresher)
    // जब भी यूज़र बिना पेज रीलोड किए किसी नए भजन पर क्लिक करेगा, 
    // यह कोड AdSense को 'Wake Up' कॉल भेजेगा ताकि नए Auto Ads रेंडर हो सकें।
    const triggerAutoAds = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // यह खाली PUSH कमांड AdSense के AI को बताता है कि "DOM बदल गया है, नए एड्स लगाओ!"
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
        }
      } catch (err: any) {
        // "already have ads" वाले फालतू वार्निंग्स को हम स्मार्टली इग्नोर कर देंगे
        if (!err.message?.includes("already have ads")) {
          console.error("AdSense SPA Refresh Error:", err);
        }
      }
    }, 1000); // 1 सेकंड का डिले, ताकि Next.js पहले शांति से नया भजन और इमेजेज रेंडर कर ले

    return () => clearTimeout(triggerAutoAds);
  }, [pathname]);

  // 🌟 चूँकि मुख्य स्क्रिप्ट अब layout.tsx के <head> में है, 
  // इसलिए यह कंपोनेंट कोई भी HTML या <Script> टैग रेंडर नहीं करेगा।
  return null;
}