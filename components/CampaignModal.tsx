"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiX } from 'react-icons/hi';
import { supabase } from '@/utils/supabase';

export default function CampaignModal() {
  const pathname = usePathname(); 
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [activeCampaigns, setActiveCampaigns] = useState<any[]>([]);
  const [currentCampaign, setCurrentCampaign] = useState<any>(null);
  
  const [lastPathnameShown, setLastPathnameShown] = useState<string | null>(null);

  // 🌟 1. Fetch All Active Campaigns (With Cache Busting Logic)
  useEffect(() => {
    // 🌟 OPTIMIZATION: Admin pages पर API कॉल भी मत करो
    if (pathname?.startsWith('/admin')) return;

    const fetchCampaigns = async () => {
      // Supabase से सिर्फ Active कैम्पैन्स मंगाएं
      const { data, error } = await supabase
        .from('campaign_settings')
        .select('*')
        .eq('is_active', true);
        
      if (data && !error && data.length > 0) {
        setActiveCampaigns(data);
      } else {
        // अगर कोई भी एक्टिव नहीं है, तो पुरानी मेमोरी क्लियर कर दो
        setActiveCampaigns([]);
        localStorage.removeItem('last_closed_banner_id');
      }
    };
    fetchCampaigns();
  }, [pathname]); // 🌟 FIX: हर पेज चेंज पर लेटेस्ट डेटा चेक करेगा, न कि सिर्फ एक बार

  // 🌟 2. Smart Engine: Page Switch & Timers
  useEffect(() => {
    // 🌟 ADDED: Admin pages या Donate पेज पर टाइमर मत चलाओ
    if (pathname === '/donate' || pathname?.startsWith('/admin')) return;

    if (activeCampaigns.length === 0) return;
    if (isOpen) return; 
    if (pathname === lastPathnameShown) return; 

    // 🌟 🚀 ADMIN TEST MODE: URL में ?test_banner=true लगाने पर सारी लिमिट्स इग्नोर हो जाएंगी
    const isTestMode = typeof window !== 'undefined' && window.location.search.includes('test_banner=true');

    const today = new Date().toDateString();
    const storedDate = localStorage.getItem('banner_daily_date');
    if (storedDate !== today) {
      localStorage.setItem('banner_daily_date', today);
      sessionStorage.setItem('banner_session_count', '0');
      sessionStorage.setItem('banner_shown_ids', '[]');
    }

    const sessionCount = parseInt(sessionStorage.getItem('banner_session_count') || '0', 10);
    
    // 🌟 FIX: अगर Test Mode On है, तो लिमिट्स (2 banners per session) को बाईपास कर दो
    if (sessionCount >= 2 && !isTestMode) return; 

    let shownThisSession = JSON.parse(sessionStorage.getItem('banner_shown_ids') || '[]');
    
    // 🌟 FIX: अगर Test Mode On है, तो पुरानी हिस्ट्री को भी इग्नोर करो
    if (isTestMode) shownThisSession = [];

    let availableBanners = activeCampaigns.filter(c => !shownThisSession.includes(c.campaign_id));
    
    if (availableBanners.length === 0) return;

    const lastClosedId = localStorage.getItem('last_closed_banner_id');
    let selectedBanner = availableBanners[0];
    
    // Reverse Logic
    if (sessionCount === 0 && lastClosedId && !isTestMode) {
       const foundLastClosed = availableBanners.find(c => c.campaign_id === lastClosedId);
       if (foundLastClosed) {
         selectedBanner = foundLastClosed;
       }
    }

    // 🌟 DYNAMIC DELAY LOGIC (टेस्ट मोड में तुरंत 1 सेकंड में खुलेगा)
    let bannerDelay = sessionCount === 0 ? (selectedBanner.delay_ms || 3000) : 35000;
    if (isTestMode) bannerDelay = 1000; // टेस्ट मोड में कोई इंतज़ार नहीं!

    const timer = setTimeout(() => {
      setCurrentCampaign(selectedBanner);
      setLastPathnameShown(pathname); 
      setIsOpen(true);
      setTimeout(() => setIsVisible(true), 50);
    }, bannerDelay); 

    return () => clearTimeout(timer);
  }, [pathname, activeCampaigns, isOpen, lastPathnameShown]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      
      if (currentCampaign) {
        const currentCount = parseInt(sessionStorage.getItem('banner_session_count') || '0', 10);
        sessionStorage.setItem('banner_session_count', (currentCount + 1).toString());
        
        const shownIds = JSON.parse(sessionStorage.getItem('banner_shown_ids') || '[]');
        shownIds.push(currentCampaign.campaign_id);
        sessionStorage.setItem('banner_shown_ids', JSON.stringify(shownIds));

        localStorage.setItem('last_closed_banner_id', currentCampaign.campaign_id);
      }
      
      setCurrentCampaign(null);
    }, 300); 
  };

  if (!isOpen || !currentCampaign) return null;

  // 🌟 ADDED: Exclude Modal strictly on /donate and ANY route starting with /admin
  if (pathname === '/donate' || pathname?.startsWith('/admin')) {
    return null;
  }

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
          className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 text-gray-900 hover:bg-white hover:scale-105 shadow-lg backdrop-blur-md transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          aria-label="Close Announcement"
        >
          <HiX size={20} />
        </button>

        {currentCampaign.type === 'image' ? (
          <div className="relative w-full bg-white">
            <Link href={currentCampaign.image_link || '#'} onClick={handleClose} className="block group outline-none focus-visible:ring-4 focus-visible:ring-orange-500 rounded-[2rem]">
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