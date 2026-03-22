"use client";

import { motion } from 'framer-motion';
import { ReactNode, memo } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;       // For cascading grid effects
  yOffset?: number;     // How far down it starts
  duration?: number;
  className?: string;
  once?: boolean;       // Should it only animate once? (Usually yes)
}

// 🌟 OPTIMIZATION 1: Wrapped in React.memo to prevent unnecessary re-renders
const ScrollReveal = memo(function ScrollReveal({ 
  children, 
  delay = 0, 
  yOffset = 40, 
  duration = 0.8,
  className = "",
  once = true 
}: ScrollRevealProps) {
  
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
        margin: "-50px", // Triggers the animation when the element is 50px inside the viewport
        amount: 0.1      // 🌟 Ensures it triggers smoothly without waiting for the whole element
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98], // The "Apple" easing curve
      }}
      // 🌟 OPTIMIZATION 2: Hardware Acceleration! Offloads work from CPU to GPU
      style={{
        willChange: "opacity, transform" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
});

export default ScrollReveal;