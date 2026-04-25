"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdDisplay() {
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

    // 🌟 SMART CHECK LOGIC: जब तक चौड़ाई 0 है, इंतज़ार करो
    const pushAd = () => {
      if (!insRef.current) return;

      // अगर चौड़ाई अभी भी 0 है, तो 200ms बाद फिर से चेक करो (यह एरर को 100% खत्म कर देगा)
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

    // पहली बार चेक शुरू करें
    checkInterval = setTimeout(pushAd, 100);

    return () => {
      clearTimeout(checkInterval);
      if (observer) observer.disconnect();
    };
  }, [pathname, isMounted]);

  if (!isMounted || pathname?.startsWith("/admin")) return <div className="min-h-[250px] w-full my-4"></div>;
  if (isUnfilled) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden min-h-[250px] my-4">
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-sans select-none">
        Advertisement
      </span>
      {/* 🌟 min-width देना ज़रूरी है */}
      <div className="w-full overflow-hidden flex justify-center min-w-[250px]">
        <ins
          ref={insRef}
          className="adsbygoogle"
          // 🌟 minWidth: '100px' लगाकर एक फॉलबैक दे दें
          style={{ display: "block", width: "100%", minWidth: "100px" }}
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="1922873836"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}