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
    delay: i * 0.8,           // 👈 stagger each leaf evenly
    rotation: Math.random() * 360,
  })),
[windowSize]   // 👈 recalculates if window resizes
);

  if (!mounted) return null;



  // ==========================================
  // 🔔 HELPER COMPONENT: CUTE GOLDEN BELL
  // ==========================================
  const CuteGoldenBell = ({ scale = 1, swingDuration = 4, reverse = false }) => {
    const swingDirection = reverse ? [8, -8] : [-8, 8];
    const clapperDirection = reverse ? [6, -6] : [-6, 6];

    return (
      <motion.div
        className="relative origin-top flex flex-col items-center drop-shadow-[0_10px_15px_rgba(180,83,9,0.3)]"
        style={{ transform: `scale(${scale})` }}
        animate={{ rotate: swingDirection }}
        transition={{ duration: swingDuration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
      >
        {/* 1. Beaded Chain (मोतियों की लड़ी) */}
        <div className="w-1 h-16 md:h-24 border-l-[4px] border-dotted border-amber-600 opacity-90" />

        {/* 2. Cute Traditional Red Bow (कलावा) */}
        <div className="relative z-20 -mb-3 flex items-center justify-center">
          <div className="w-4 h-3 bg-red-600 rounded-full -rotate-45 translate-x-1 shadow-sm" />
          <div className="w-3 h-3 bg-yellow-400 border border-amber-600 rounded-full z-10 shadow-sm" />
          <div className="w-4 h-3 bg-red-600 rounded-full rotate-45 -translate-x-1 shadow-sm" />
        </div>

        {/* 3. Glossy Cute Bell Body */}
        <div className="relative z-10 flex flex-col items-center">
          <svg width="60" height="55" viewBox="0 0 60 55" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="cute-gold" x1="10" y1="0" x2="50" y2="55" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.3" stopColor="#F59E0B" />
                <stop offset="0.7" stopColor="#D97706" />
                <stop offset="1" stopColor="#92400E" />
              </linearGradient>
            </defs>
            
            {/* Main Chubby Body */}
            <path d="M 30 2 C 15 2, 15 32, 6 42 C 3 46, 6 50, 10 50 L 50 50 C 54 50, 57 46, 54 42 C 45 32, 45 2, 30 2 Z" fill="url(#cute-gold)"/>
            
            {/* Thick Bottom Rim */}
            <path d="M 4 45 C 4 52, 10 52, 10 52 L 50 52 C 50 52, 56 52, 56 45 C 56 38, 50 38, 50 38 L 10 38 C 10 38, 4 38, 4 45 Z" fill="#B45309" />
            <path d="M 6 45 C 6 49, 10 50, 10 50 L 50 50 C 50 50, 54 49, 54 45 C 54 41, 50 40, 50 40 L 10 40 C 10 40, 6 41, 6 45 Z" fill="url(#cute-gold)" />

            {/* Embossed Detail Dots */}
            <circle cx="30" cy="30" r="2.5" fill="#78350F" opacity="0.7"/>
            <circle cx="18" cy="28" r="2" fill="#78350F" opacity="0.6"/>
            <circle cx="42" cy="28" r="2" fill="#78350F" opacity="0.6"/>

            {/* Decorative Curved Lines */}
            <path d="M 16 18 Q 30 22 44 18" stroke="#92400E" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.6"/>
            <path d="M 12 38 Q 30 42 48 38" stroke="#92400E" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.5"/>

            {/* Shiny Edge Highlight (For 3D Glossy Plastic/Gold Feel) */}
            <path d="M 22 6 C 16 12, 15 25, 12 35" stroke="#FEF3C7" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8"/>
          </svg>

          {/* 4. Cute Swinging Clapper (लोलक) */}
          <motion.div 
            className="absolute -bottom-3 w-7 h-7 bg-gradient-to-br from-yellow-300 via-amber-500 to-amber-700 rounded-full shadow-[0_4px_6px_rgba(0,0,0,0.4)] border-b-2 border-amber-800 z-0"
            animate={{ x: clapperDirection }}
            transition={{ duration: swingDuration, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
          >
            {/* Clapper Shiny Highlight */}
            <div className="absolute top-1 left-1.5 w-2 h-2 bg-white rounded-full opacity-60" />
          </motion.div>
        </div>
      </motion.div>
    );
  };

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
          🔔 PLACEMENT OF CUTE BELLS
          ========================================== */}
      <div className="absolute -top-4 left-6 md:left-16 lg:left-32">
        <CuteGoldenBell scale={0.9} swingDuration={3.5} />
      </div>

      <div className="absolute -top-6 right-6 md:right-16 lg:right-32">
        <CuteGoldenBell scale={1.05} swingDuration={4} reverse={true} />
      </div>

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