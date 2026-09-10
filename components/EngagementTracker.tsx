"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function EngagementTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // 1. Track pageviews per session
    const views = parseInt(sessionStorage.getItem('hbm_page_views') || '0') + 1;
    sessionStorage.setItem('hbm_page_views', views.toString());

    // 2. Track time on current page
    const startTime = Date.now();
    
    // 3. Track scroll depth
    let maxScroll = 0;
    const handleScroll = () => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
      );
      if (scrollPercent > maxScroll) maxScroll = scrollPercent;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      const timeSpent = Math.round((Date.now() - startTime) / 1000);
      sessionStorage.setItem('last_time_on_page', timeSpent.toString());
      sessionStorage.setItem('last_scroll_depth', maxScroll.toString());
    };
  }, [pathname]);

  return null;
}