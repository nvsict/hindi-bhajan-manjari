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

/*
 * Keep the announcement content focused and consistent.
 * Only one message is shown at a time so the top bar remains an
 * announcement area rather than becoming a continuous advertising ticker.
 *
 * Defined outside the component so it's not recreated (and doesn't need
 * to be a useEffect dependency) on every render.
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

export default function AnnouncementStrip() {
  const pathname = usePathname();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const isAdmin = pathname.startsWith('/admin');

  /*
   * Rotate one announcement at a time.
   *
   * Hooks must run unconditionally on every render — the admin bail-out
   * happens in the return below, never before a hook call, so the hook
   * order never changes between renders (fixes the previous "Rendered
   * fewer hooks than expected" crash when navigating to/from /admin).
   */
  useEffect(() => {
    if (isAdmin || isPaused) {
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
  }, [isAdmin, isPaused]);

  /*
   * Admin pages should have no promotional announcement strip.
   * This check now happens after all hooks have run, per the Rules of Hooks.
   */
  if (isAdmin) {
    return null;
  }

  const activeAnnouncement = ANNOUNCEMENTS[activeIndex];

  return (
    <div
      className="relative flex overflow-hidden bg-orange-100/80 backdrop-blur-md border-b border-orange-200/60 py-1.5 sm:py-1 z-[100]"
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
        className="w-full flex items-center animate-announcement-fade px-3 sm:px-4 md:justify-center"
        aria-live="polite"
      >
        {/*
         * min-w-0 is required for the text below to actually be allowed to
         * shrink/truncate inside a flex row — without it, flex items default
         * to a min-width based on their content, which is exactly what let
         * the CTA button get pushed off-screen on narrow phones before.
         */}
        <div className="flex items-center min-w-0 w-full md:w-auto">

          <span className="min-w-0 flex-1 md:flex-none truncate text-[11px] sm:text-[12px] font-bold tracking-wide text-orange-900 font-hindi">
            {activeAnnouncement.text}
          </span>

          <Link
            href={activeAnnouncement.href}
            className="ml-2.5 sm:ml-3 flex items-center gap-1.5 bg-orange-600 hover:bg-orange-700 text-white px-2.5 sm:px-3 py-1 rounded-full transition-all duration-300 active:scale-95 text-[9px] font-black uppercase tracking-wider shadow-sm shrink-0"
          >
            {activeAnnouncement.ctaText}
            {activeAnnouncement.icon}
          </Link>

          {/*
           * Purely decorative separator — dropped below md so it never
           * competes with the text/CTA for space on small screens, which
           * is exactly where that space is scarcest.
           */}
          <span
            className="hidden md:inline ml-8 md:ml-12 text-orange-400/40 text-[10px] md:text-xs shrink-0"
            aria-hidden="true"
          >
            ❖
          </span>
        </div>
      </div>
    </div>
  );
}