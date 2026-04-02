"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== "undefined") {
      
      // 🌟 STEP 1: ब्राउज़र की डिफ़ॉल्ट स्क्रॉल याददाश्त (Memory) को हमेशा के लिए बंद करें
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }

      // 🌟 STEP 2: Next.js की रेंडरिंग खत्म होने के ठीक बाद (10ms delay) स्क्रॉल करें
      const timeoutId = setTimeout(() => {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: "instant", 
        });
      }, 10); // यह 10ms का डिले Next.js और Ads दोनों के डिफ़ॉल्ट बिहेवियर को हरा देगा!

      return () => clearTimeout(timeoutId);
    }
  }, [pathname]);

  return null;
}