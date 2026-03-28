"use client";

import { useEffect, useRef } from "react";

export default function ManualAdUnit() {
  const adLoaded = useRef(false);

  useEffect(() => {
    if (adLoaded.current) return;

    // 🌟 FIX 1: DOM Paint Delay
    // React को HTML रेंडर करने का समय दें ताकि AdSense को डेस्कटॉप पर सही Width मिल सके
    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adLoaded.current = true; 
        }
      } catch (err: any) {
        if (err.message && err.message.includes("already have ads")) {
          console.log("AdSense: Ad already filled, safely skipping.");
        } else {
          console.error("AdSense Client Error:", err);
        }
      }
    }, 250); // 250ms delay is the sweet spot for Next.js

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    // 🌟 FIX 2: Added min-h-[280px] to prevent Layout Shift (CLS) while ad loads
    <div className="w-full my-10 flex flex-col items-center justify-center overflow-hidden clear-both min-h-[280px] ad-container-wrapper">
      
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-3 font-sans select-none">
        Advertisement
      </span>

      <div className="w-full max-w-[800px] overflow-hidden flex justify-center">
        <ins
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center", width: "100%" }}
          data-ad-layout="in-article"
          // 🌟 FIX 3: Tells AdSense to use fluid first, but fallback to auto display if no article ad exists
          data-ad-format="fluid, auto" 
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="1920154812"
          // 🌟 FIX 4: Forces AdSense to respect desktop margins
          data-full-width-responsive="true"
        />
      </div>
    </div>
  );
}