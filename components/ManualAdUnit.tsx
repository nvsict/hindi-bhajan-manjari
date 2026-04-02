"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function ManualAdUnit() {
  const pathname = usePathname();
  const adLoaded = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  const [isUnfilled, setIsUnfilled] = useState(false);
  
  // 🌟 HYDRATION FIX: AdBlockers से बचने के लिए
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return; // जब तक Hydration पूरा न हो, रुको
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

  if (pathname?.startsWith("/admin")) return null;
  if (isUnfilled) return null;

  // 🌟 HYDRATION SAFE PLACEHOLDER: सर्वर से सिर्फ खाली डब्बा जाएगा
  if (!isMounted) {
    return <div className="w-full my-8 min-h-[250px]"></div>;
  }

  return (
    <div className="w-full my-8 flex flex-col items-center justify-center overflow-hidden clear-both min-h-[250px] transition-all duration-500 ease-in-out has-[ins[data-ad-status='unfilled']]:hidden has-[ins[data-ad-status='unfilled']]:h-0 has-[ins[data-ad-status='unfilled']]:min-h-0 has-[ins[data-ad-status='unfilled']]:my-0">
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-3 font-sans select-none">
        Sponsored
      </span>
      <div className="w-full max-w-[800px] overflow-hidden flex justify-center">
        <ins
          ref={insRef}
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center", width: "100%" }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="3700312750"
        />
      </div>
    </div>
  );
}