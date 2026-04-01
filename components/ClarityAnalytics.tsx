"use client";

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';

export default function ClarityAnalytics() {
  useEffect(() => {
    // 🛑 हम इसे सिर्फ Production (Live) वेबसाइट पर चलाएंगे, Localhost पर नहीं!
    if (process.env.NODE_ENV === 'production') {
      const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
      
      if (projectId) {
        try {
          // Clarity को चालू करें
          Clarity.init(projectId);
          console.log("Clarity Initialized! 🚀");
        } catch (error) {
          console.error("Clarity failed to initialize:", error);
        }
      } else {
        console.warn("Clarity Project ID is missing in .env");
      }
    }
  }, []);

  // यह UI में कोई जगह नहीं लेगा
  return null; 
}