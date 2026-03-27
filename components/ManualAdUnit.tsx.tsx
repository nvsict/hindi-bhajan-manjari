"use client";

import { useEffect, useRef } from "react";

export default function ManualAdUnit() {
  // 🌟 FIX: React Strict Mode डबल-रेंडर को रोकने के लिए Ref
  const adLoaded = useRef(false);

  useEffect(() => {
    // अगर इस ऐड के लिए push() पहले ही कॉल हो चुका है, तो वापस लौट जाओ
    if (adLoaded.current) return;

    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      
      // 🌟 मार्क कर दिया कि इस कंपोनेंट का ऐड लोड हो गया है
      adLoaded.current = true; 
    } catch (err: any) {
      // अगर फिर भी कोई पुराना डुप्लीकेट एरर आता है, तो उसे इग्नोर करें
      if (err.message && err.message.includes("already have ads")) {
        console.log("AdSense: Ad already filled, safely skipping.");
      } else {
        console.error("AdSense Client Error:", err);
      }
    }
  }, []);

  return (
    <div className="w-full my-8 flex flex-col items-center justify-center overflow-hidden">
      
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-3 font-sans select-none">
        Advertisement
      </span>

      <div className="w-full max-w-[800px] min-h-[250px] flex justify-center items-center bg-transparent">
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