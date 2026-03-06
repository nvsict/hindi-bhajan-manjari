"use client";

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;       // For cascading grid effects
  yOffset?: number;     // How far down it starts
  duration?: number;
  className?: string;
  once?: boolean;       // Should it only animate once? (Usually yes)
}

export default function ScrollReveal({ 
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
        margin: "-50px" // 🌟 Triggers the animation when the element is 50px inside the viewport, preventing premature triggering
      }}
      transition={{
        duration: duration,
        delay: delay,
        ease: [0.21, 0.47, 0.32, 0.98], // 🌟 The "Apple" easing curve: fast start, buttery smooth deceleration
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}