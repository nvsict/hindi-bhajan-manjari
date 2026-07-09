"use client";

import Link from 'next/link';
import { FaHeart, FaHandsPraying, FaStar } from 'react-icons/fa6'; // 🌟 Changed to FaStar

export default function AnnouncementStrip() {
  const ANNOUNCEMENTS = [
    {
      text: "Support Hindi Bhajan Manjari in spreading Sanatan Dharma worldwide",
      ctaText: "Donate Now",
      href: "/donate",
      icon: <FaHeart className="text-yellow-300" size={12} />
    },
    {
      text: "सनातन धर्म के प्रचार-प्रसार में अपना अमूल्य योगदान दें",
      ctaText: "सहयोग करें",
      href: "/donate",
      icon: <FaHandsPraying className="text-yellow-300" size={12} />
    },
    {
      text: "Explore our new Sanatan Shabdkosh (Spiritual Dictionary)",
      ctaText: "Explore",
      href: "/shabdkosh",
      icon: <FaStar className="text-yellow-300" size={12} /> // 🌟 Changed here
    }
  ];

  return (
    <div className="relative flex overflow-hidden bg-gradient-to-r from-orange-600 via-red-600 to-orange-600 text-white py-2.5 z-[100] border-b border-orange-700/50 shadow-sm">
      
      {/* 🌟 CUSTOM MARQUEE ANIMATION */}
      <style suppressHydrationWarning>{`
        @keyframes infinite-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-infinite-marquee {
          animation: infinite-marquee 30s linear infinite;
          display: flex;
          width: max-content;
        }
        .animate-infinite-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      <div className="animate-infinite-marquee">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center justify-center">
            {ANNOUNCEMENTS.map((item, idx) => (
              <div key={idx} className="flex items-center mx-6">
                
                <span className="text-[12px] md:text-[13px] font-bold tracking-wide text-orange-50 font-hindi">
                  {item.text}
                </span>

                <Link 
                  href={item.href}
                  className="ml-3 md:ml-4 flex items-center gap-1.5 bg-white/20 hover:bg-white/30 border border-white/20 px-3 py-1 rounded-full transition-all duration-300 active:scale-95 text-[11px] font-black uppercase tracking-wider shadow-sm"
                >
                  {item.ctaText} {item.icon}
                </Link>

                <span className="mx-6 text-orange-300/40 font-light">|</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}