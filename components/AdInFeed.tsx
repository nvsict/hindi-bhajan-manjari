"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdInFeed() {
  const pathname = usePathname();
  const adLoaded = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  
  const [isUnfilled, setIsUnfilled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 🌟 Hydration Fix: Ensure component only renders fully on the client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted) return;
    // Admin routes par ads nahi dikhane hain
    if (pathname?.startsWith("/admin")) return;
    if (adLoaded.current) return;

    let observer: MutationObserver;
    
    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adLoaded.current = true;

          // 🌟 MutationObserver to hide the ad box completely if AdSense says "unfilled"
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
        // Ignore the benign "already have ads" error
        if (!err.message?.includes("already have ads")) {
          console.error("AdSense Error:", err);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [pathname, isMounted]);

  // Prevent rendering on admin pages or before hydration
  if (!isMounted || pathname?.startsWith("/admin")) {
    return <div className="min-h-[120px] w-full"></div>;
  }
  
  // Hide completely if Google didn't find an ad to show
  if (isUnfilled) return null;

  return (
    <div className="w-full flex flex-col overflow-hidden min-h-[120px] my-2 transition-all">
      <span className="text-[10px] text-gray-300 uppercase tracking-[0.2em] mb-2 font-sans select-none text-center">
        Sponsored
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        // 👇 नीचे वाले दोनों को अपने AdSense कोड से बदलें 👇
        data-ad-layout-key="-fg+5r+6l-ft+4e" 
        data-ad-client="ca-pub-5565563905050993"
        data-ad-slot="1234567890" 
        // 👆 ऊपर वाले दोनों को अपने AdSense कोड से बदलें 👆
      />
    </div>
  );
}