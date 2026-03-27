"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, memo } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  yOffset?: number;
  duration?: number;
  className?: string;
  once?: boolean;
}

const ScrollReveal = memo(function ScrollReveal({ 
  children, 
  delay = 0, 
  yOffset = 30,  // 🌟 FIX 1: Reduced default offset (40px is too much jump for mobile screens)
  duration = 0.5, // 🌟 FIX 2: Slightly faster duration makes mobile feel extremely snappy
  className = "",
  once = true 
}: ScrollRevealProps) {
  
  // 🌟 FIX 3: Respects battery saver mode and low-end devices
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ 
        opacity: 0, 
        y: yOffset 
      }}
      whileInView={{ 
        opacity: 1, 
        y: 0 
      }}
      viewport={{ 
        once: once, 
        // 🌟 FIX 4: Positive bottom margin. It triggers the animation *just before* // it enters the screen, avoiding the laggy "pop-in" effect on fast mobile scrolls.
        margin: "0px 0px 50px 0px", 
        amount: 0.1
      }}
      transition={{
        duration: duration,
        delay: delay,
        // 🌟 FIX 5: Natively optimized easeOut is much lighter on mobile CPUs than custom cubic-bezier
        ease: "easeOut", 
      }}
      // 🚨 REMOVED: style={{ willChange: "opacity, transform" }}
      // Why? Forcing this on 50+ list items permanently destroys mobile GPU memory. 
      // Framer Motion automatically applies and removes willChange ONLY during the active animation now!
      className={className}
    >
      {children}
    </motion.div>
  );
});

export default ScrollReveal;