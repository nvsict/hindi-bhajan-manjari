"use client";

import { motion } from "framer-motion";
import React from "react";

export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      // 🌟 FIX: यहाँ से 'filter: blur' हटा दिया गया है
      initial={{ y: 25, opacity: 0 }} 
      animate={{ y: 0, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 25, 
        mass: 0.5,
      }}
      // 🌟 FIX: यहाँ से 'will-change-transform' और 'will-change-filter' क्लास हटा दी गई है
      // क्योंकि यही क्लास आपके fixed टूलबार को लॉक कर रही थी।
    >
      {children}
    </motion.div>
  );
}