"use client";

import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

export default function AmbientDevotion() {
  const [mounted, setMounted] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: 1000, height: 800 });

  useEffect(() => {
    setMounted(true);
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // 🌿 Divine Leaves (Emerging from the Diya)
  const leaves = useMemo(() => 
    Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      targetX: Math.random() * (windowSize.width * 0.8) - 50,
      targetY: -(Math.random() * windowSize.height + 200),
      size: Math.random() * 8 + 6,
      duration: Math.random() * 15 + 10,
      delay: i * 0.8,           // Stagger each leaf evenly
      rotation: Math.random() * 360,
    })),
    [windowSize] // Recalculates if window resizes
  );

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-[60] overflow-hidden">
      
      {/* ==========================================
          🌟 TOP AURA (Divine Light Leak)
          ========================================== */}
      <motion.div 
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[150%] md:w-[80%] h-[20vh] bg-gradient-to-b from-orange-500/15 via-amber-500/5 to-transparent blur-[80px] -z-10"
        animate={{ opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* ==========================================
          🪔 MODERN MINIMALIST DIYA (BOTTOM LEFT)
          ========================================== */}
      <div className="absolute bottom-6 left-6 md:bottom-12 md:left-12 drop-shadow-[0_10px_25px_rgba(234,88,12,0.4)]">
        
        {/* 🌿 DIVINE LEAVES EMERGING FROM DIYA FLAME */}
        {leaves.map((leaf) => (
          <motion.div
            key={leaf.id}
            className="absolute top-0 left-1/2 -translate-x-1/2 bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-300 shadow-[0_0_10px_rgba(251,146,60,0.7)] rounded-tl-full rounded-br-full opacity-75"
            style={{
              width: leaf.size,
              height: leaf.size,
              originX: 0.5,
              originY: 0.5,
            }}
            initial={{ x: 0, y: 0, scale: 0, opacity: 0, rotate: leaf.rotation }}
            animate={{
              x: leaf.targetX,
              y: leaf.targetY,
              scale: [0, 1.2, 0.8, 1],
              opacity: [0, 0.9, 0.9, 0],
              rotate: leaf.rotation + 360,
            }}
            transition={{
              duration: leaf.duration,
              repeat: Infinity,
              delay: leaf.delay,
              ease: [0.25, 0.46, 0.45, 0.94],   // cubic-bezier — slow start, smooth float
              opacity: { duration: leaf.duration * 0.9, ease: "linear" },
              scale: { duration: leaf.duration * 0.3, ease: "easeOut" },
            }}
          />
        ))}

        {/* Glow Aura */}
        <motion.div 
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-32 h-32 bg-orange-500/30 dark:bg-orange-500/20 rounded-full blur-2xl -z-10"
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Diya Flame */}
        <motion.div 
          className="absolute bottom-[24px] left-1/2 -translate-x-1/2 flex flex-col items-center justify-end origin-bottom z-20"
          animate={{ 
            scaleY: [1, 1.1, 0.95, 1.05],
            rotate: [0, -2, 2, -1] 
          }}
          transition={{ duration: 0.35, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-4 h-8 bg-gradient-to-t from-orange-600 to-transparent rounded-[50%_50%_50%_50%/60%_60%_40%_40%] blur-[2px] opacity-80 absolute bottom-0" />
          <div className="w-3 h-6 bg-gradient-to-t from-yellow-400 to-orange-400 rounded-[50%_50%_50%_50%/60%_60%_40%_40%] absolute bottom-1" />
          <div className="w-1 h-3 bg-white rounded-[50%_50%_50%_50%/60%_60%_40%_40%] absolute bottom-1.5 shadow-[0_0_10px_#fff]" />
        </motion.div>

        {/* Elegant Diya Base */}
        <div className="relative mt-2 flex flex-col items-center z-10">
          <div className="w-10 h-3 bg-gradient-to-b from-amber-700 to-amber-900 rounded-[100%] shadow-inner relative z-10 border border-amber-500/30" />
          <div className="w-10 h-5 bg-gradient-to-b from-orange-400 via-amber-600 to-amber-800 rounded-b-full -mt-2 shadow-[0_5px_15px_rgba(0,0,0,0.2)] border-b border-white/20" />
        </div>

      </div>

    </div>
  );
}