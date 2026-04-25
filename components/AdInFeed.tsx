"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdInFeed() {
  const pathname = usePathname();
  const adLoaded = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  
  const [isUnfilled, setIsUnfilled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Hydration Error से बचने के लिए
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    if (pathname?.startsWith("/admin")) return;
    if (adLoaded.current) return;

    let observer: MutationObserver;
    
    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // 🌟 TWEAK: Push करने से पहले चेक करें कि <ins> टैग अभी भी स्क्रीन पर है या नहीं
          if (!insRef.current) return;

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
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [pathname, isMounted]);

  if (!isMounted || pathname?.startsWith("/admin")) return <div className="min-h-[120px] w-full my-4"></div>;
  if (isUnfilled) return null;

  return (
    <div className="w-full flex flex-col overflow-hidden min-h-[120px] my-4 transition-all">
      <span className="text-[10px] text-gray-300 uppercase tracking-[0.2em] mb-2 font-sans select-none text-center">
        Sponsored
      </span>
      <div className="w-full overflow-hidden flex justify-center">
        <ins
          ref={insRef}
          className="adsbygoogle"
          // 🌟 TWEAK: width: "100%" लगाना ज़रूरी है ताकि availableWidth=0 एरर न आए
          style={{ display: "block", width: "100%" }}
          data-ad-format="fluid"
          data-ad-layout-key="-fg+5r+6l-ft+4e" 
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="3596971010" 
        />
      </div>
    </div>
  );
}