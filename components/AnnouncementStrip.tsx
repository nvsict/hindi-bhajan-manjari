"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FaStar, FaBook, FaBullhorn } from 'react-icons/fa6';

interface Announcement {
  text: string;
  ctaText: string;
  href: string;
  icon: React.ReactNode;
}

export default function AnnouncementStrip() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /*
   * Keep the announcement content focused and consistent.
   * Only one message is shown at a time so the top bar remains an
   * announcement area rather than becoming a continuous advertising ticker.
   */
  const ANNOUNCEMENTS: Announcement[] = [
    {
      text: "अपनी मनपसंद भजनों की कस्टमाइज़्ड ई-पुस्तिका (PDF) तैयार करें",
      ctaText: "बुक बनाएँ",
      href: "/publication-test",
      icon: (
        <FaBook
          className="text-orange-100"
          size={10}
          aria-hidden="true"
        />
      ),
    },
    {
      text: "Hindi Bhajan Manjari App के Founding Partner बनें",
      ctaText: "Partner बनें",
      href: "/advertise",
      icon: (
        <FaStar
          className="text-orange-100"
          size={10}
          aria-hidden="true"
        />
      ),
    },
    {
      text: "अपने आध्यात्मिक ब्रांड का प्रचार करें",
      ctaText: "प्रचार करें",
      href: "/advertise",
      icon: (
        <FaBullhorn
          className="text-orange-100"
          size={10}
          aria-hidden="true"
        />
      ),
    },
  ];

  /*
   * Admin pages should have no promotional announcement strip.
   */
  if (pathname.startsWith('/admin')) {
    return null;
  }

  /*
   * Rotate one announcement at a time.
   *
   * The visual size/styling of the original announcement strip is retained.
   */
  useEffect(() => {
    if (isPaused) {
      return;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (
        (current + 1) % ANNOUNCEMENTS.length
      ));
    }, 6000);

    return () => {
      window.clearInterval(timer);
    };
  }, [isPaused, ANNOUNCEMENTS.length]);

  const activeAnnouncement = ANNOUNCEMENTS[activeIndex];

  return (
    <div
      className="relative flex overflow-hidden bg-orange-100/80 dark:bg-[#120804]/90 backdrop-blur-md border-b border-orange-200/60 dark:border-orange-900/40 py-1 z-[100]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {/* Announcement transition only — original strip dimensions preserved */}
      <style suppressHydrationWarning>{`
        @keyframes announcement-fade {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-announcement-fade {
          animation: announcement-fade 350ms ease-out both;
        }

        @media (prefers-reduced-motion: reduce) {
          .animate-announcement-fade {
            animation: none;
          }
        }
      `}</style>

      {/* Main Announcement */}
      <div
        key={activeIndex}
        className="w-full flex items-center justify-center animate-announcement-fade"
        aria-live="polite"
      >
        <div className="flex items-center shrink-0 whitespace-nowrap mx-4 md:mx-6">

          <span className="text-[12px] md:text-[12px] font-bold tracking-wide text-orange-900 dark:text-orange-100/90 font-hindi">
            {activeAnnouncement.text}
          </span>

          <Link
            href={activeAnnouncement.href}
            className="ml-3 flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-3 py-1 rounded-full transition-all duration-300 active:scale-95 text-[9px] font-black uppercase tracking-wider shadow-sm shrink-0"
          >
            {activeAnnouncement.ctaText}
            {activeAnnouncement.icon}
          </Link>

          <span
            className="ml-8 md:ml-12 text-orange-400/40 dark:text-orange-800/60 text-[10px] md:text-xs shrink-0"
            aria-hidden="true"
          >
            ❖
          </span>
        </div>
      </div>
    </div>
  );
}