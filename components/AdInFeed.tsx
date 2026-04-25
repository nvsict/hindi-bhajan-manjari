"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function AdInFeed() {
  const pathname = usePathname();
  const adLoaded = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
    // एडमिन पेजों पर ऐड न दिखाएं
    if (pathname?.startsWith("/admin")) return;
    
    // अगर इस कंपोनेंट में ऐड पहले ही लोड हो चुका है, तो दोबारा न चलाएं
    if (adLoaded.current) return;

    let observer: MutationObserver;
    
    // थोड़ा सा डिले (Delay) ताकि In-feed (Fluid) ऐड के लिए जगह अच्छे से बन जाए
    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // मैन्युअल ट्रिगर (यह "Load More" वाले ऐड्स के लिए बहुत ज़रूरी है)
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adLoaded.current = true;

          // 🌟 MutationObserver: अगर Google के पास दिखाने के लिए ऐड नहीं है (Unfilled), 
          // तो खाली सफेद डब्बे को पूरी तरह से गायब कर दो
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
        // "already have ads" एक सामान्य एरर है जब Google का ग्लोबल स्क्रिप्ट ऐड पहले ही लोड कर देता है,
        // इसलिए हम इसे इग्नोर कर रहे हैं।
        if (!err.message?.includes("already have ads")) {
          console.error("AdSense Error:", err);
        }
      }
    }, 300);

    return () => {
      clearTimeout(timeoutId);
      if (observer) observer.disconnect();
    };
  }, [pathname]);

  if (pathname?.startsWith("/admin")) return null;
  
  // अगर ऐड Unfilled है तो खाली जगह न घेरें, पूरा कंपोनेंट छिपा दें
  if (isUnfilled) return null;

  return (
    <div className="w-full flex flex-col overflow-hidden min-h-[120px] my-4 transition-all">
      <span className="text-[10px] text-gray-300 uppercase tracking-[0.2em] mb-2 font-sans select-none text-center">
        Sponsored
      </span>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-format="fluid"
        // 👇 अपने AdSense डैशबोर्ड से मिला हुआ असली In-feed कोड यहाँ डालें 👇
        data-ad-layout-key="-fg+5r+6l-ft+4e" 
        data-ad-client="ca-pub-5565563905050993"
        data-ad-slot="3596971010" 
        // 👆 👆
      />
    </div>
  );
}