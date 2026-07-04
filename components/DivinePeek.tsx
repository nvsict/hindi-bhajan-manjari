"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";

const MIN_DELAY = 10000; 
const MAX_DELAY = 20000; 
const PEEK_DURATION = 5000; 

// 🌟 KRISHNA'S CUTE MESSAGES (आप इसमें और भी जोड़ सकते हैं)
const KRISHNA_MESSAGES = [
  "राधे राधे! 🦚",
  "मुस्कुराते रहो! ✨",
  "जय श्री कृष्णा! 🙏",
  "सब अच्छा होगा! 🌸",
  "चिंता मत करो! 🪈",
  "हरे कृष्ण! 🌷",
  "मैं साथ हूँ! 💖"
];

type Position = "bottom-right" | "bottom-left" | "middle-right" | "middle-left";
const POSITIONS: Position[] = ["bottom-right", "bottom-left", "middle-right", "middle-left"];

export default function DivinePeek() {
  const [showKrishna, setShowKrishna] = useState(false);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [message, setMessage] = useState<string | null>(null); // 🌟 Tooltip State
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoHideRef = useRef<NodeJS.Timeout | null>(null);

  const getRandomDifferentPosition = (currentPos: Position): Position => {
    const available = POSITIONS.filter(p => p !== currentPos);
    return available[Math.floor(Math.random() * available.length)];
  };

  const triggerPeek = useCallback((delay: number, forcePosition?: Position) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);

    timerRef.current = setTimeout(() => {
      setPosition(prev => forcePosition || getRandomDifferentPosition(prev));
      setShowKrishna(true);
      setMessage(null); // नया पीक आते ही पुराना मैसेज हटा दें

      autoHideRef.current = setTimeout(() => {
        setShowKrishna(false);
        const randomDelay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY);
        triggerPeek(randomDelay);
      }, PEEK_DURATION);
    }, delay);
  }, []);

  useEffect(() => {
    const initialDelay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY);
    triggerPeek(initialDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    };
  }, [triggerPeek]);

  // 🌟 SMART CLICK INTERACTION WITH TOOLTIP
  const handleTouchOrClick = () => {
    if (message) return; // अगर टूलटिप पहले से दिख रहा है, तो दोबारा क्लिक इग्नोर करें
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);

    // 1. रैंडम मैसेज चुनें और दिखाएं
    const randomMsg = KRISHNA_MESSAGES[Math.floor(Math.random() * KRISHNA_MESSAGES.length)];
    setMessage(randomMsg);

    // 2. मैसेज पढ़ने के लिए 2.5 सेकंड रुकें, फिर छुपा दें
    setTimeout(() => {
      setShowKrishna(false);
      
      // 3. छुपने के 5 सेकंड बाद वापस किसी नई जगह से लाएं
      setTimeout(() => {
        setMessage(null);
      }, 500); // एनिमेशन खत्म होने के बाद मैसेज क्लियर करें
      triggerPeek(5000);
    }, 2500);
  };

  const isRight = position.includes("right");

  const variants: Variants = {
    hidden: {
      x: isRight ? "100%" : "-100%",
      y: "0%",
      rotate: isRight ? 15 : -15,
      opacity: 0,
      scale: 0.9, 
    },
    visible: {
      x: isRight ? "25%" : "-25%", 
      y: "0%",
      rotate: isRight ? -5 : 5, 
      opacity: 1,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60, 
        damping: 12,   
        mass: 1,
      },
    },
    exit: {
      x: isRight ? "120%" : "-120%", 
      rotate: isRight ? 30 : -30,
      opacity: 0,
      scale: 0.85, 
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 14,
        mass: 0.8,
      },
    },
  };

  let positionClasses = "";
  if (position === "bottom-right") positionClasses = "bottom-24 right-0 origin-bottom-right";
  else if (position === "bottom-left") positionClasses = "bottom-24 left-0 origin-bottom-left";
  else if (position === "middle-right") positionClasses = "top-[40%] right-0 origin-right";
  else if (position === "middle-left") positionClasses = "top-[40%] left-0 origin-left";

  return (
    <div className="fixed inset-y-0 inset-x-0 pointer-events-none z-[70] overflow-hidden">
      <AnimatePresence>
        {showKrishna && (
          <motion.div
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.92, rotate: isRight ? -8 : 8 }}
            className={`absolute pointer-events-auto cursor-pointer ${positionClasses} w-[120px] h-[160px] md:w-[180px] md:h-[240px] filter drop-shadow-[0_10px_20px_rgba(234,88,12,0.3)]`}
            onClick={handleTouchOrClick}
            onTouchStart={handleTouchOrClick}
          >
            {/* 🌟 CUTE SPEECH BUBBLE (TOOLTIP) */}
            <AnimatePresence>
              {message && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.5, y: 15 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: 5 }}
                  transition={{ type: "spring", stiffness: 250, damping: 15 }}
                  className={`absolute -top-10 md:-top-12 ${
                    isRight ? "right-10 md:right-16 rounded-br-sm" : "left-10 md:left-16 rounded-bl-sm"
                  } bg-white text-orange-600 px-4 py-2 rounded-[1.2rem] text-[11px] md:text-sm font-black font-hindi shadow-[0_8px_20px_rgba(234,88,12,0.25)] border border-orange-100 whitespace-nowrap z-50 pointer-events-none`}
                >
                  {message}
                </motion.div>
              )}
            </AnimatePresence>

            <Image
              src="/images/little-krishna.webp" 
              alt="Baal Krishna"
              fill
              sizes="(max-width: 768px) 200px, 300px"
              priority
              className={`object-contain ${!isRight ? "scale-x-[-1]" : ""}`} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}