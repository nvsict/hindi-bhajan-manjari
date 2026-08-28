"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation'; // 🌟 1. usePathname इम्पोर्ट किया
import { FaHandsPraying, FaStar, FaBook } from 'react-icons/fa6';

export default function AnnouncementStrip() {
  const pathname = usePathname(); // 🌟 2. वर्तमान पाथ (URL) निकाला

  // 🌟 3. अगर पाथ /admin से शुरू होता है, तो कुछ भी रिटर्न (रेंडर) मत करो
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const ANNOUNCEMENTS = [
    // 🌟 1. नया ई-पुस्तिका (Publication) मैसेज
    {
      text: "अपनी मनपसंद भजनों की कस्टमाइज़्ड ई-पुस्तिका (PDF) तैयार करें",
      ctaText: "बुक बनाएँ",
      href: "/publication-test",
      icon: <FaBook className="text-orange-100" size={10} />
    },
    // 2. डोनेशन (Donation) मैसेज
    {
      text: "सनातन धर्म के प्रचार-प्रसार में अपना अमूल्य योगदान दें",
      ctaText: "सहयोग करें",
      href: "/donate",
      icon: <FaHandsPraying className="text-orange-100" size={10} />
    },
    // 3. शब्दकोश (Dictionary) मैसेज
    {
      text: "Explore our new Sanatan Shabdkosh (Spiritual Dictionary)",
      ctaText: "Explore",
      href: "/shabdkosh",
      icon: <FaStar className="text-orange-100" size={10} /> 
    }
  ];

  return (
    <div className="relative flex overflow-hidden bg-orange-100/80 dark:bg-[#120804]/90 backdrop-blur-md border-b border-orange-200/60 dark:border-orange-900/40 py-2 z-[100]">
      
      {/* 🌟 CUSTOM MARQUEE ANIMATION */}
      <style suppressHydrationWarning>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-strip {
          display: flex;
          width: max-content;
          animation: marquee 35s linear infinite;
        }
        .animate-marquee-strip:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* 🌟 MAIN WRAPPER */}
      <div className="animate-marquee-strip">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="flex items-center shrink-0" aria-hidden={i === 1 ? "true" : "false"}>
            {ANNOUNCEMENTS.map((item, idx) => (
              <div key={idx} className="flex items-center shrink-0 whitespace-nowrap mx-4 md:mx-6">
                
                <span className="text-[11px] md:text-[13px] font-bold tracking-wide text-orange-900 dark:text-orange-100/90 font-hindi">
                  {item.text}
                </span>

                <Link 
                  href={item.href}
                  className="ml-3 flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-full transition-all duration-300 active:scale-95 text-[10px] font-black uppercase tracking-wider shadow-sm shrink-0"
                >
                  {item.ctaText} {item.icon}
                </Link>

                <span className="ml-8 md:ml-12 text-orange-400/40 dark:text-orange-800/60 text-[10px] md:text-xs shrink-0">
                  ❖
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}