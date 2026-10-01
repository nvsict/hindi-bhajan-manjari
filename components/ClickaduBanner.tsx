"use client";

import { useEffect, useRef } from 'react';

export default function ClickaduBanner() {
  const adContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 1. Ensure the container exists
    if (!adContainerRef.current) return;

    // 2. Inject the Clickadu Ad Spot div
    adContainerRef.current.innerHTML = '<div data-cl-spot="2148973"></div>';

    // 3. Dynamically inject the bn.js script so it fires every time this component loads
    const script = document.createElement('script');
    // 🌟 FIXED: Explicitly forcing HTTPS to bypass CSP blocks
    script.src = "https://earmuffpostnasalrisotto.com/bn.js";
    script.async = true;
    script.setAttribute('data-cfasync', 'false');
    script.setAttribute('data-clbaid', '');

    // Add error/load tracking functions
    script.onerror = () => {
      if (typeof window !== 'undefined' && typeof window.qfqvba === 'function') window.qfqvba(16);
    };
    script.onload = () => {
      if (typeof window !== 'undefined' && typeof window.qfqvba === 'function') window.qfqvba(16);
    };

    // 4. Append script to the container
    adContainerRef.current.appendChild(script);

    // 5. Cleanup when the user navigates away to prevent memory leaks
    return () => {
      if (adContainerRef.current) {
        adContainerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    // Reserving min-height prevents the page from jumping when the ad loads (Good for SEO)
    <div className="flex justify-center items-center w-full min-h-[250px] overflow-hidden rounded-xl bg-gray-50/50 border border-gray-100">
      
      {/* The script and div will be injected securely inside this ref */}
      <div ref={adContainerRef} className="w-full h-full flex justify-center items-center" />
      
    </div>
  );
}