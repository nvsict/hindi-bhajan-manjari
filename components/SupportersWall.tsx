"use client";

import { useEffect, useState } from 'react';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import Image from 'next/image';
import { FaHeart, FaOm, FaCrown, FaQuoteLeft } from 'react-icons/fa6';
import ScrollReveal from './ScrollReveal'; 

type Supporter = {
  id: string;
  name: string;
  amount: number;
  message?: string;
  photo_url?: string;
  is_anonymous: boolean;
  created_at: string;
};

export default function SupportersWall() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSupporters = async () => {
      const { data, error } = await supabase
        .from('supporters')
        .select('*')
        .eq('status', 'completed')
        .order('created_at', { ascending: false });
      
      if (data && !error) setSupporters(data);
      setLoading(false);
    };
    fetchSupporters();
  }, []);

  if (loading || supporters.length === 0) return null;

  return (
    <div className="flex flex-col gap-10 w-full py-10">
      
      {/* 👑 PREMIUM BANNER */}
      <ScrollReveal yOffset={20}>
        <div className="relative overflow-hidden bg-gradient-to-r from-orange-50 to-white dark:from-[#120703] dark:to-[#0c0804] border-2 border-orange-200/60 dark:border-orange-900/40 rounded-[2rem] p-6 md:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8 shadow-[0_4px_20px_rgba(234,88,12,0.05)]">
          
          <div className="absolute -right-10 -top-10 opacity-[0.04] dark:opacity-[0.02] pointer-events-none">
             <FaCrown size={180} className="text-orange-600" />
          </div>

          <div className="relative z-10 flex-1 text-center lg:text-left">
            <h3 className="text-2xl md:text-3xl font-black font-hindi text-gray-900 dark:text-orange-50 mb-3 flex items-center justify-center lg:justify-start gap-2.5">
              <FaCrown className="text-orange-500 shrink-0 text-2xl" /> सनातन यज्ञ में आपकी आहुति
            </h3>
            <p className="text-base text-gray-700 dark:text-gray-300 font-hindi leading-relaxed max-w-3xl">
              इन सभी महानुभावों का हृदय से धन्यवाद जिन्होंने इस मंच को सपोर्ट किया है। आज जुड़ने वाले सभी <span className="font-bold text-orange-600 dark:text-orange-400">संस्थापक सदस्यों</span> को भविष्य के प्रीमियम फीचर्स, नई PDF बुक्स का अर्ली-एक्सेस और हमेशा के लिए Ad-Free अनुभव उपहार स्वरूप दिया जाएगा।
            </p>
          </div>
          
          <Link 
            href="/donate" 
            className="relative z-10 whitespace-nowrap px-8 py-3.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold rounded-full shadow-lg shadow-orange-500/30 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-base shrink-0 border border-orange-400 dark:border-orange-500"
          >
            <FaHeart className="animate-pulse" /> आप भी जुड़ें
          </Link>
        </div>
      </ScrollReveal>

      {/* 🌟 SECTION TITLE */}
      <div className="flex items-center gap-2.5 mt-2 px-2">
        <FaHeart className="text-orange-600 text-2xl md:text-3xl shrink-0" />
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          भक्त <span className="text-orange-600">आभार पटल</span>
        </h2>
      </div>

      {/* 🌟 SUPPORTERS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
        {supporters.map((s, index) => (
          <ScrollReveal key={s.id} delay={(index % 4) * 0.05} yOffset={20} className="h-full">
            
            {/* 🌟 CARD CONTAINER (Dynamic Height Fix Applied Here) */}
            <div className="group bg-white dark:bg-[#0c0804] p-5 rounded-[2rem] border border-orange-100 dark:border-orange-950/40 shadow-[0_2px_15px_rgba(234,88,12,0.03)] hover:shadow-[0_8px_30px_rgba(234,88,12,0.08)] hover:border-orange-300 dark:hover:border-orange-800/60 transition-all duration-300 flex items-center gap-4 relative overflow-hidden h-full min-h-[110px] hover:-translate-y-1">
              
              {/* 🖼️ AVATAR */}
              <div className="relative w-14 h-14 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-[#1a0500] via-[#431407] to-[#882b0f] border border-orange-900/20 shadow-inner flex items-center justify-center transition-all duration-300 group-hover:shadow-md">
                {s.is_anonymous ? (
                  <FaOm className="text-3xl text-orange-200/70" />
                ) : s.photo_url ? (
                  <Image 
                    src={s.photo_url} 
                    alt={s.name} 
                    fill
                    quality={95}
                    sizes="56px"
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                ) : (
                  <span className="text-2xl font-black text-orange-100 font-hindi">
                    {s.name.charAt(0)}
                  </span>
                )}
              </div>

              {/* 📝 NAME & AMOUNT (Full Text, No Hiding) */}
              <div className="flex flex-col min-w-0 flex-1 justify-center z-10 py-1">
                <h3 className="text-[17px] font-black font-hindi text-gray-900 dark:text-orange-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug break-words">
                  {s.is_anonymous ? "एक गुप्त भक्त" : s.name}
                </h3>
                <span className="text-orange-600 dark:text-orange-500 text-xs font-bold mt-1 tracking-wide inline-block">
                  ₹{s.amount}
                </span>
              </div>

              {/* 💬 GLASSMORPHISM HOVER TOOLTIP */}
              {s.message && (
                <div className="absolute inset-0 bg-white/95 dark:bg-[#0c0804]/95 backdrop-blur-sm p-4 flex flex-col justify-center translate-y-[110%] group-hover:translate-y-0 transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] z-20 border border-orange-200 dark:border-orange-900/50 rounded-[2rem]">
                  <FaQuoteLeft className="text-orange-200 dark:text-orange-900/50 absolute top-3 right-4 text-xl md:text-2xl" />
                  <p className="text-sm text-gray-800 dark:text-orange-100 italic font-hindi leading-relaxed line-clamp-3 relative z-10 overflow-hidden">
                    "{s.message}"
                  </p>
                </div>
              )}

            </div>
          </ScrollReveal>
        ))}
      </div>
      
    </div>
  );
}