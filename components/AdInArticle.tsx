"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdInArticle() {
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

    // 🌟 SMART CHECK LOGIC
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

  if (!isMounted || pathname?.startsWith("/admin")) return <div className="min-h-[150px] w-full my-6"></div>;
  if (isUnfilled) return null;

  return (
    <div className="w-full my-8 flex flex-col items-center justify-center overflow-hidden min-h-[150px]">
      <span className="text-[10px] text-gray-300 uppercase tracking-[0.2em] mb-3 font-sans select-none">
        Sponsored
      </span>
      {/* 🌟 Width Fixes */}
      <div className="w-full overflow-hidden flex justify-center min-w-[250px]">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center", width: "100%", minWidth: "100px" }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="3700312750"
        />
      </div>
    </div>
  );
}