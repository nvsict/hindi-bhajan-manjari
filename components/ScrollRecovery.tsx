"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function ScrollRecovery() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. जब पेज लोड हो, चेक करो कि क्या इस पेज की कोई पुरानी स्क्रॉल पोज़िशन सेव है?
    const savedPosition = sessionStorage.getItem(`scroll_pos_${pathname}`);
    if (savedPosition) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedPosition, 10),
          behavior: 'instant'
        });
      }, 50); // 50ms का छोटा delay ताकि DOM रेंडर हो सके
    }

    // 2. जब यूज़र पेज स्क्रॉल करे, तो उसकी पोज़िशन सेव करते रहो
    const handleScroll = () => {
      sessionStorage.setItem(`scroll_pos_${pathname}`, window.scrollY.toString());
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [pathname]);

  return null;
}