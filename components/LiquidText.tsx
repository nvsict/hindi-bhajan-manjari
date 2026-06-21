"use client";

import { motion, AnimatePresence } from "framer-motion";

interface LiquidTextProps {
  text: string;
  className?: string;
}

export default function LiquidText({ text, className = "" }: LiquidTextProps) {
  return (
    // mode="wait" ensures the old text leaves completely before new text enters
    <AnimatePresence mode="wait">
      <motion.div
        key={text} // The key is important! Changing it triggers the animation
        initial={{ opacity: 0, filter: "blur(10px)", y: 5 }}
        animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
        exit={{ opacity: 0, filter: "blur(10px)", y: -5 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className={className}
      >
        {text}
      </motion.div>
    </AnimatePresence>
  );
}