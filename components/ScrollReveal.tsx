"use client";

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode, memo, useState, useEffect } from 'react';

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
  yOffset = 30,  
  duration = 0.5, 
  className = "",
  once = true 
}: ScrollRevealProps) {
  
  const shouldReduceMotion = useReducedMotion();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 🌟 PERF FIX: सिर्फ एक बार (Mount पर) चेक करें। 
    // दर्जनों कॉम्पोनेंट्स में resize listener लगाने से बचने के लिए इसे सिंपल रखा है।
    setIsMobile(window.innerWidth < 768);
  }, []);

  // 🌟 THE ULTIMATE MOBILE FIX:
  // अगर डिवाइस मोबाइल है या यूज़र ने Battery Saver (Reduced Motion) ऑन किया है,
  // तो Framer Motion के भारी Intersection Observers को पूरी तरह बायपास कर दें!
  // इससे मोबाइल पर FPS ड्रॉप्स (Lag) 100% खत्म हो जाएंगे।
  if (shouldReduceMotion || isMobile) {
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
        margin: "0px 0px 50px 0px", 
        amount: 0.1
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: "easeOut", 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

export default ScrollReveal;