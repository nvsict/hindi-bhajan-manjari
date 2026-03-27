"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export default function AdSense() {
  const pathname = usePathname();

  // 🛑 THE BLOCKER: अगर URL में '/admin' है, तो Ads लोड मत करो!
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // ✅ बाकी पूरी वेबसाइट पर Ads लोड करो
  return (
    <Script
      id="adsbygoogle-init"
      strategy="afterInteractive"
      crossOrigin="anonymous"
      src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5565563905050993"
    />
  );
}