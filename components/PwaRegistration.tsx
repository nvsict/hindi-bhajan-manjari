"use client";

import { useEffect } from "react";

export default function PwaRegistration() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("🚀 PWA Service Worker registered silently:", registration.scope);
          })
          .catch((error) => {
            console.error("PWA registration failed:", error);
          });
      });
    }
  }, []);

  // Returns nothing to the UI. No prompts, no banners.
  return null; 
}