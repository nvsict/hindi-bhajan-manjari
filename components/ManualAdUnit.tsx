"use client";

import { useEffect, useRef } from "react";

export default function ManualAdUnit() {
  const adLoaded = useRef(false);

  useEffect(() => {
    if (adLoaded.current) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      adLoaded.current = true; 
    } catch (err: any) {
      if (err.message && err.message.includes("already have ads")) {
        console.log("AdSense: Ad already filled, safely skipping.");
      } else {
        console.error("AdSense Client Error:", err);
      }
    }
  }, []);

  return (
    // 🌟 FIX: Removed complex flexbox. Using pure text-center and block for AdSense compatibility
    <div className="w-full my-8 text-center overflow-hidden clear-both">
      
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-3 block font-sans select-none">
        Advertisement
      </span>

      {/* 🌟 FIX: mx-auto centers it, display:block ensures AdSense can calculate desktop width */}
      <div className="w-full max-w-[800px] mx-auto min-h-[250px] bg-transparent block">
        <ins
          className="adsbygoogle"
          style={{ display: "block", textAlign: "center", width: "100%" }}
          data-ad-layout="in-article"
          data-ad-format="fluid"
          data-ad-client="ca-pub-5565563905050993"
          data-ad-slot="1920154812"
        />
      </div>
    </div>
  );
}