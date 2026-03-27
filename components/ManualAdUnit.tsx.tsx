"use client";

import { useEffect } from "react";

export default function ManualAdUnit() {
  useEffect(() => {
    try {
      // 🌟 यह कोड AdSense को बताता है कि "इस खाली जगह पर नेटिव इन-आर्टिकल ऐड भर दो"
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense Client Error:", err);
    }
  }, []);

  return (
    // 🛡️ my-8 से ऐड के ऊपर-नीचे सुरक्षित जगह रहेगी, ताकि गलत क्लिक न हों।
    <div className="w-full my-8 flex flex-col items-center justify-center overflow-hidden">
      
      {/* 🛡️ साफ-सुथरा लेबल: ताकि यूज़र को पता रहे कि यह भजन का हिस्सा नहीं, विज्ञापन है */}
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-3 font-sans select-none">
        Advertisement
      </span>

      {/* 🛡️ min-h-[250px]: इससे लेआउट अचानक ऊपर-नीचे नहीं उछलेगा (Perfect SEO/UX) */}
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