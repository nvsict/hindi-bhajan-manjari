"use client";

import { motion } from "framer-motion";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // 🌟 FIX: 'x' को हटाकर 'y' कर दिया गया है। 
      // अब पेज राइट से नहीं, बल्कि नीचे से बहुत सॉफ्टली ऊपर आएगा।
      initial={{ y: 25, opacity: 0, filter: "blur(8px)" }} 
      animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25, 
        mass: 0.5,
      }}
      className="will-change-transform will-change-opacity will-change-filter"
    >
      {children}
    </motion.div>
  );
}