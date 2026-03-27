"use client";

import { ReactLenis } from 'lenis/react';

export default function SmoothScrolling({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis 
      root 
      options={{
        // 🌟 DESKTOP TUNING (Keep this buttery smooth)
        lerp: 0.08,             
        duration: 1.2,          
        wheelMultiplier: 1,     
        
        // 🌟 THE FIX FOR MOBILE
        syncTouch: false, // 👈 Setting this to false lets iOS/Android use their native hardware momentum!
        
        // 🌟 EXTRA FIX FOR DYNAMIC CONTENT (Load More / Lazy Images)
        autoResize: true, 
      }}
    >
      {children}
    </ReactLenis>
  );
}