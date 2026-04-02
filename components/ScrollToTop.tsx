"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    // जैसे ही URL (pathname) बदलेगा, यह यूज़र को तुरंत पेज के 0,0 (सबसे ऊपर) पर ले जाएगा
    if (typeof window !== "undefined") {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: "instant", // 'smooth' नहीं, 'instant' ताकि ऐड कटते ही सीधा ऊपर रहे
      });
    }
  }, [pathname]);

  return null;
}