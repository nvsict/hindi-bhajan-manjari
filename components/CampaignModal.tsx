"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiX } from 'react-icons/hi';
import { supabase } from '@/utils/supabase';

export default function CampaignModal() {
  const pathname = usePathname(); // 🌟 पेज ट्रैक करने के लिए
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  
  // ट्रैक करने के लिए कि इस पेज पर बैनर दिख चुका है
  const [lastPathnameShown, setLastPathnameShown] = useState<string | null>(null);

  // 🌟 1. Fetch All Active Campaigns ONCE
  useEffect(() => {
    const fetchCampaigns = async () => {
      // सिंगल ID की जगह सारे एक्टिव कैंपेन मंगाएं
      const { data, error } = await supabase.from('campaign_settings').select('*').eq('is_active', true);
      if (data && !error && data.length > 0) {
        setActiveCampaigns(data);
      }
    };
    fetchCampaigns();
  }, []);

  // 🌟 2. Smart Engine: Page Switch & Timers
  useEffect(() => {
    if (activeCampaigns.length === 0) return;
    if (isOpen) return; // अगर बैनर पहले से खुला है, तो कुछ न करें
    if (pathname === lastPathnameShown) return; // एक पेज पर दोबारा न दिखाएं (Page switch ज़रूरी है)

    // A. Check Session Limit (एक विजिट में सिर्फ 2 बैनर)
    const sessionCount = parseInt(sessionStorage.getItem('banner_session_count') || '0', 10);
    if (sessionCount >= 2) return; 

    // B. Daily Reset (ताकि अगले दिन सब फ्रेश स्टार्ट हो)
    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('banner_daily_date');
    if (storedDate !== today) {
      localStorage.setItem('banner_daily_date', today);
    }

    // C. Start the 35 seconds timer
    const timer = setTimeout(() => {
      // इस सेशन में जो बैनर दिख चुके हैं, उनकी लिस्ट निकालें
      const shownThisSession = JSON.parse(sessionStorage.getItem('banner_shown_ids') || '[]');
      
      // जो नहीं दिखे हैं, उन्हें फिल्टर करें
      let availableBanners = activeCampaigns.filter(c => !shownThisSession.includes(c.campaign_id));
      if (availableBanners.length === 0) return;

      const lastClosedId = localStorage.getItem('last_closed_banner_id');
      let selectedBanner = availableBanners[0];
      
      // 🌟 D. The "Reverse Logic": पिछली बार जो लास्ट था, वो इस बार पहला!
      if (sessionCount === 0 && lastClosedId) {
         const foundLastClosed = availableBanners.find(c => c.campaign_id === lastClosedId);
         if (foundLastClosed) {
           selectedBanner = foundLastClosed;
         }
      }

      setCurrentCampaign(selectedBanner);
      setLastPathnameShown(pathname); // मार्क करें कि इस पेज पर दिख गया
      setIsOpen(true);
      setTimeout(() => setIsVisible(true), 50);

    }, 35000); // ⏱️ 35 Seconds delay

    return () => clearTimeout(timer); // अगर यूज़र 35s से पहले पेज बदल ले, तो टाइमर रिसेट हो जाएगा
  }, [pathname, activeCampaigns, isOpen, lastPathnameShown]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      
      if (currentCampaign) {
        // 1. Session Count बढ़ाएं
        const currentCount = parseInt(sessionStorage.getItem('banner_session_count') || '0', 10);
        sessionStorage.setItem('banner_session_count', (currentCount + 1).toString());
        
        // 2. इस बैनर को "Shown" लिस्ट में डालें
        const shownIds = JSON.parse(sessionStorage.getItem('banner_shown_ids') || '[]');
        shownIds.push(currentCampaign.campaign_id);
        sessionStorage.setItem('banner_shown_ids', JSON.stringify(shownIds));

        // 3. 🌟 Memory: इस बैनर को "Last Closed" सेट करें, ताकि अगली विजिट में ये सबसे पहले आए!
        localStorage.setItem('last_closed_banner_id', currentCampaign.campaign_id);
      }
      
      setCurrentCampaign(null);
    }, 300); 
  };

  if (!isOpen || !currentCampaign) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
      <div 
        className={`absolute inset-0 bg-gray-900/70 backdrop-blur-sm transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`} 
        onClick={handleClose}
      />

      <div 
        className={`relative w-full max-w-md md:max-w-lg bg-transparent rounded-[2rem] shadow-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${isVisible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-8 scale-95'}`}
      >
        <button 
          onClick={handleClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-gray-900 hover:bg-white hover:scale-105 shadow-lg backdrop-blur-md transition-all active:scale-95"
          aria-label="Close Announcement"
        >
          <HiX size={20} />
        </button>

        {currentCampaign.type === 'image' ? (
          <div className="relative w-full bg-white">
            <Link href={currentCampaign.image_link || '#'} onClick={handleClose} className="block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={currentCampaign.image_src} 
                alt={currentCampaign.image_alt || "Announcement"} 
                className="w-full h-auto object-cover rounded-[2rem] transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>
          </div>
        ) : (
          <div 
            className="w-full bg-white rounded-[2rem] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: currentCampaign.html_content }} 
          />
        )}
      </div>
    </div>
  );
}