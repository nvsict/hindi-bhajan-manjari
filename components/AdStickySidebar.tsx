"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdStickySidebar() {
  const pathname = usePathname();
  const adLoaded = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  
  const [isUnfilled, setIsUnfilled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (pathname?.startsWith("/admin")) return;
    if (adLoaded.current) return;

    let observer: MutationObserver;
    let checkInterval: NodeJS.Timeout;

    const pushAd = () => {
      if (!insRef.current) return;

      if (insRef.current.offsetWidth === 0 || insRef.current.clientWidth === 0) {
        checkInterval = setTimeout(pushAd, 200);
        return;
      }

      try {
        if (typeof window !== "undefined") {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adLoaded.current = true;

          if (insRef.current) {
            observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-ad-status') {
                  const status = insRef.current?.getAttribute('data-ad-status');
                  if (status === 'unfilled') setIsUnfilled(true);
                }
              });
            });
            observer.observe(insRef.current, { attributes: true });
          }
        }
      } catch (err: any) {
        if (!err.message?.includes("already have ads")) console.error("AdSense Error:", err);
      }
    };

    checkInterval = setTimeout(pushAd, 100);

    return () => {
      clearTimeout(checkInterval);
      if (observer) observer.disconnect();
    };
  }, [pathname, isMounted]);

  // 🌟 Hides on mobile (hidden lg:block) to prevent layout breakages
  if (!isMounted || pathname?.startsWith("/admin")) return <div className="hidden lg:block min-h-[600px] w-full max-w-[300px]"></div>;
  if (isUnfilled) return null;

  return (
    // 🌟 sticky top-24 keeps the ad on screen as the user scrolls the lyrics
    <div className="hidden lg:block sticky top-24 w-full max-w-[300px] mx-auto overflow-hidden min-h-[600px]">
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-sans select-none text-center block">
        Sponsored
      </span>
      {/* Premium subtle glass/container effect */}
      <div className="w-full overflow-hidden flex justify-center bg-gray-50 dark:bg-gray-900/30 rounded-xl min-h-[600px]">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%", height: "100%" }}
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="4692483693"
          data-ad-format="vertical" 
        />
      </div>
    </div>
  );
}