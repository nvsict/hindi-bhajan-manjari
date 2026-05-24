"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { HiX } from 'react-icons/hi';
import { supabase } from '@/utils/supabase';

export default function CampaignModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [campaign, setCampaign] = useState<any>(null);

  useEffect(() => {
    const fetchCampaign = async () => {
      const { data } = await supabase.from('campaign_settings').select('*').eq('id', 1).single();
      
      if (data && data.is_active) {
        setCampaign(data);
        
        // चेक करें कि यूज़र पहले देख चुका है या नहीं
        const hasSeen = localStorage.getItem(`campaign_${data.campaign_id}`);
        
        if (!hasSeen) {
          const timer = setTimeout(() => {
            setIsOpen(true);
            setTimeout(() => setIsVisible(true), 50);
          }, data.delay_ms || 3000);
          
          return () => clearTimeout(timer);
        }
      }
    };

    fetchCampaign();
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsOpen(false);
      if (campaign) {
        localStorage.setItem(`campaign_${campaign.campaign_id}`, 'closed');
      }
    }, 300); 
  };

  if (!isOpen || !campaign) return null;

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

        {campaign.type === 'image' ? (
          <div className="relative w-full bg-white">
            <Link href={campaign.image_link || '#'} onClick={handleClose} className="block group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={campaign.image_src} 
                alt={campaign.image_alt || "Announcement"} 
                className="w-full h-auto object-cover rounded-[2rem] transition-transform duration-500 group-hover:scale-[1.02]"
              />
            </Link>
          </div>
        ) : (
          <div 
            className="w-full bg-white rounded-[2rem] overflow-hidden"
            dangerouslySetInnerHTML={{ __html: campaign.html_content }} 
          />
        )}
      </div>
    </div>
  );
}