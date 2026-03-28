"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function ManualAdUnit() {
  const pathname = usePathname();
  const adLoaded = useRef(false);
  const insRef = useRef<HTMLModElement>(null);
  
  // 🌟 THE SMART STATE: ट्रैक करेगा कि ऐड लोड हुआ या खाली रह गया
  const [isUnfilled, setIsUnfilled] = useState(false);

  useEffect(() => {
    // 🛑 एडमिन पैनल में एड्स मत चलाओ
    if (pathname?.startsWith("/admin")) return;
    if (adLoaded.current) return;

    let observer: MutationObserver;

    const timeoutId = setTimeout(() => {
      try {
        if (typeof window !== "undefined") {
          // @ts-ignore
          (window.adsbygoogle = window.adsbygoogle || []).push({});
          adLoaded.current = true;

          // 🕵️ THE SMART DETECTOR: AdSense के <ins> टैग की जासूसी
          if (insRef.current) {
            observer = new MutationObserver((mutations) => {
              mutations.forEach((mutation) => {
                if (mutation.attributeName === 'data-ad-status') {
                  const status = insRef.current?.getAttribute('data-ad-status');
                  // अगर AdSense ने कहा "unfilled" (ऐड नहीं है)
                  if (status === 'unfilled') {
                    console.log('AdSense: No ad inventory available. Collapsing space gracefully.');
                    setIsUnfilled(true); // स्टेट अपडेट करो और जगह को सिकोड़ दो
                  }
                }
              });
            });

            // जासूस (Observer) को काम पर लगाओ
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

  // 🌟 SMART COLLAPSE: अगर ऐड नहीं मिला, तो पूरा डब्बा (Blank Space) गायब कर दो!
  if (isUnfilled) return null;

  return (
    // 🌟 CSS TRICK: Tailwind का `has-[]` क्लास भी लगाया है। 
    // यह React के State अपडेट होने से पहले ही CSS के ज़रिए डब्बे को गायब कर देगा!
    <div className="w-full my-8 flex flex-col items-center justify-center overflow-hidden clear-both min-h-[250px] transition-all duration-500 ease-in-out has-[ins[data-ad-status='unfilled']]:hidden has-[ins[data-ad-status='unfilled']]:h-0 has-[ins[data-ad-status='unfilled']]:min-h-0 has-[ins[data-ad-status='unfilled']]:my-0">
      
      <span className="text-[10px] text-gray-400 uppercase tracking-[0.2em] mb-3 font-sans select-none">
        Advertisement
      </span>

      <div className="w-full max-w-[800px] overflow-hidden flex justify-center">
        <ins
          ref={insRef} // जासूस को यहाँ कनेक्ट किया
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