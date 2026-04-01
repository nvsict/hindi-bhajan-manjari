"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function DisplayAdUnit() {
  const pathname = usePathname();
  const adLoaded = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
    if (pathname?.startsWith("/admin")) return;
    if (adLoaded.current) return;

    let observer: MutationObserver;

    const timeoutId = setTimeout(() => {
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
                  if (status === 'unfilled') {
                    setIsUnfilled(true);
                  }
                }
              });
            });
            observer.observe(insRef.current, { attributes: true });
          }
        }
      } catch (err: any) {
        if (!err.message?.includes("already have ads")) {
          console.error("AdSense Error:", err);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;
  if (isUnfilled) return null;

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden clear-both min-h-[250px] transition-all duration-500 ease-in-out has-[ins[data-ad-status='unfilled']]:hidden has-[ins[data-ad-status='unfilled']]:h-0 has-[ins[data-ad-status='unfilled']]:min-h-0 has-[ins[data-ad-status='unfilled']]:my-0">
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-2 font-sans select-none">
        Sponsered
      </span>
      <div className="w-full max-w-[800px] overflow-hidden flex justify-center">
        {/* 🌟 OLD DISPLAY AD UNIT */}
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", width: "100%" }}
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="1922873836"
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}