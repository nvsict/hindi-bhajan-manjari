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

    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // 🌟 TWEAK 1: Push करने से पहले चेक करें कि कंपोनेंट अभी भी स्क्रीन पर है या नहीं
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

  if (!isMounted || pathname?.startsWith("/admin")) return <div className="min-h-[250px] w-full"></div>;
  if (isUnfilled) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden min-h-[250px] my-4">
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-sans select-none">
        Advertisement
      </span>
      <div className="w-full overflow-hidden flex justify-center">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="1922873836"
          data-ad-format="auto"
          /* 🌟 TWEAK 2: इसे true करें ताकि मोबाइल पर ऐड पूरा फैले और कमाई बढ़े */
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}