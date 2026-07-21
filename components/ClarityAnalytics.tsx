"use client";

import { useEffect } from 'react';
import Clarity from '@microsoft/clarity';
import { usePathname } from 'next/navigation';

export default function ClarityAnalytics() {
  const pathname = usePathname();

  useEffect(() => {
    // 🛑 Do NOT run Clarity on the donate page to save memory during payment
    if (pathname === '/donate' || pathname === '/donate-test') {
      return;
    }

    if (process.env.NODE_ENV === 'production') {
      const projectId = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
      
      if (projectId) {
        try {
          Clarity.init(projectId);
          console.log("Clarity Initialized! 🚀");
        } catch (error) {
          console.error("Clarity failed to initialize:", error);
        }
      } else {
        console.warn("Clarity Project ID is missing in .env");
      }
    }
  }, [pathname]);

  return null; 
}