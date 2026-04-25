"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdMultiplex() {
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
    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // 🌟 TWEAK 1: Push करने से पहले चेक करें कि <ins> टैग अभी भी स्क्रीन पर है या नहीं
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

  if (!isMounted || pathname?.startsWith("/admin")) return <div className="min-h-[300px] w-full my-8"></div>;
  if (isUnfilled) return null;

  return (
    <div className="w-full my-10 flex flex-col overflow-hidden min-h-[300px]">
      {/* 🌟 BONUS: Dark mode text color added for consistency */}
      <h3 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-4 tracking-tight border-b border-gray-100 dark:border-gray-800 pb-2 transition-colors duration-300">
        You May Also Like
      </h3>
      <div className="w-full overflow-hidden">
        <ins
          ref={insRef}
          className="adsbygoogle"
          // 🌟 TWEAK 2: width: "100%" लगाना ज़रूरी है ताकि availableWidth=0 एरर न आए
          style={{ display: "block", width: "100%" }}
          data-ad-format="autorelaxed"
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="6558176273"
        />
      </div>
    </div>
  );
}