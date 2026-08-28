"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import Image from "next/image";
import { usePathname } from "next/navigation"; // 🌟 THE DETECTIVE HOOK

const MIN_DELAY = 10000; 
const MAX_DELAY = 20000; 
const PEEK_DURATION = 5000; 

// ==========================================
// 🌟 1. THE MASCOT DICTIONARY (Data Structure)
// ==========================================
type Mascot = {
  id: string;
  name: string;
  src: string;
  triggers: string[]; // URL में क्या ढूँढना है
  messages: string[];
};

const MASCOTS: Mascot[] = [
  {
    id: "krishna",
    name: "Baal Krishna",
    src: "/images/little-krishna.webp",
    triggers: ["krishna", "shyam", "radha", "vishnu", "khatu", "banke", "hari", "gopal", "kanha"],
    messages: [
      "राधे राधे! 🦚", 
      "मुस्कुराते रहो! ✨", 
      "जय श्री कृष्णा! 🙏", 
      "चिंता मत करो, मैं हूँ ना! 🪈", 
      "माखन खाओगे? 🧈"
    ]
  },
  {
    id: "jagannath",
    name: "Lord Jagannath",
    src: "/images/little-jagannath.webp",
    triggers: ["jagannath", "puri", "balabhadra", "subhadra", "rath", "nilachal", "nandighosha"],
    messages: [
      "जय जगन्नाथ! 🕉️", 
      "नीलाचल निवासाय नमः! 🌊", 
      "महाप्रसाद पाओगे? 🍚", 
      "सबका मंगल हो! 🌺"
    ]
  },
  {
    id: "hanuman",
    name: "Bal Hanuman",
    src: "/images/bal-hanuman.webp",
    triggers: ["hanuman", "bajrang", "maruti", "anjaneya", "pawan", "sankat", "ram", "sita", "ayodhya", "salasar", "mehandipur"],
    messages: [
      "जय श्री राम! 🚩", 
      "संकट कटे मिटे सब पीरा! 🙏", 
      "पवनसुत हनुमान की जय! 🐒", 
      "राम राम! ✨",
      "राम काज कीन्हें बिनु मोहि कहाँ बिश्राम! 🌸"
    ]
  },
  {
    id: "sherawali-lion",
    name: "Sherawali Mata ka Sher",
    src: "/images/lion.webp",
    triggers: ["durga", "sherawali", "ambe", "mata", "maa", "navratri", "bhavani", "vaishno", "devi", "jagadambe", "sher"],
    messages: [
      "जय माता दी! 🦁", 
      "माँ शेरावाली की जय! ✨", 
      "सच्चे दरबार की जय! 🙏", 
      "माँ जगदम्बे सबकी रक्षा करें! 🌺",
      "भय मत कर, माँ तेरे साथ है! 🔱"
    ]
  }
];

type Position = "bottom-right" | "bottom-left" | "middle-right" | "middle-left";
const POSITIONS: Position[] = ["bottom-right", "bottom-left", "middle-right", "middle-left"];

export default function DivinePeek() {
  const pathname = usePathname(); 
  
  const [showMascot, setShowMascot] = useState(false);
  const [position, setPosition] = useState<Position>("bottom-right");
  const [message, setMessage] = useState<string | null>(null); 
  const [currentMascot, setCurrentMascot] = useState<Mascot>(MASCOTS[0]); 
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const autoHideRef = useRef<NodeJS.Timeout | null>(null);

  // ==========================================
  // 🌟 PERFORMANCE: TAB VISIBILITY (Battery Saver)
  // ==========================================
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // जब टैब बैकग्राउंड में हो, तो टाइमर्स रोक दें (पॉज़)
        if (timerRef.current) clearTimeout(timerRef.current);
        if (autoHideRef.current) clearTimeout(autoHideRef.current);
        setShowMascot(false); 
      } else {
        // जब टैब वापस एक्टिव हो, तो थोड़ी देर बाद फिर से शुरू करें
        triggerPeek(Math.floor(Math.random() * (4000) + 2000));
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  // ==========================================
  // 🌟 SMART SELECTION LOGIC
  // ==========================================
  const determineMascot = useCallback(() => {
    if (!pathname) return MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
    const urlText = pathname.toLowerCase();
    
    for (const mascot of MASCOTS) {
      if (mascot.triggers.some(trigger => urlText.includes(trigger))) {
        return mascot; 
      }
    }
    return MASCOTS[Math.floor(Math.random() * MASCOTS.length)];
  }, [pathname]);

  const getRandomDifferentPosition = (currentPos: Position): Position => {
    const available = POSITIONS.filter(p => p !== currentPos);
    return available[Math.floor(Math.random() * available.length)];
  };

  const triggerPeek = useCallback((delay: number, forcePosition?: Position) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);

    timerRef.current = setTimeout(() => {
      if (document.hidden) return; // अगर बैकग्राउंड में है तो ट्रिगर मत करो

      const nextMascot = determineMascot();

      // 🌟 PERFORMANCE: SMART PRELOADING 
      // इमेज को ब्राउज़र की कैश में लोड करना ताकि पॉपअप होते ही ब्लैंक ना दिखे
      if (typeof window !== "undefined") {
        const img = new window.Image();
        img.src = nextMascot.src;
      }

      setCurrentMascot(nextMascot);
      setPosition(prev => forcePosition || getRandomDifferentPosition(prev));
      setShowMascot(true);
      setMessage(null); 

      autoHideRef.current = setTimeout(() => {
        setShowMascot(false);
        const randomDelay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY);
        triggerPeek(randomDelay);
      }, PEEK_DURATION);
    }, delay);
  }, [determineMascot]);

  useEffect(() => {
    const initialDelay = Math.floor(Math.random() * (MAX_DELAY - MIN_DELAY) + MIN_DELAY);
    triggerPeek(initialDelay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (autoHideRef.current) clearTimeout(autoHideRef.current);
    };
  }, [triggerPeek]);


  // ==========================================
  // 🌟 SMART UX: TIME-OF-DAY CONTEXT
  // ==========================================
  const getTimeSpecificMessage = () => {
    const currentHour = new Date().getHours();
    if (currentHour >= 6 && currentHour < 9) {
      return "सुप्रभात! चलिए आज की आरती से शुरुआत करें। 🪔";
    }
    if (currentHour >= 21 && currentHour < 23) {
      return "शुभ रात्रि! सोने से पहले प्रभु का ध्यान कर लें। ✨";
    }
    return null; // सामान्य समय के लिए
  };

  const handleTouchOrClick = () => {
    if (message) return; 
    
    if (timerRef.current) clearTimeout(timerRef.current);
    if (autoHideRef.current) clearTimeout(autoHideRef.current);

    // 🌟 टाइम के आधार पर मैसेज चुनें (50% चांस है कि टाइम वाला मैसेज आएगा, वरना रेगुलर)
    const timeMessage = getTimeSpecificMessage();
    let finalMessage = "";

    if (timeMessage && Math.random() > 0.4) {
      finalMessage = timeMessage;
    } else {
      finalMessage = currentMascot.messages[Math.floor(Math.random() * currentMascot.messages.length)];
    }

    setMessage(finalMessage);

    setTimeout(() => {
      setShowMascot(false);
      setTimeout(() => setMessage(null), 500); 
      triggerPeek(5000);
    }, 2500);
  };

  const isRight = position.includes("right");

  const variants: Variants = {
    hidden: { x: isRight ? "100%" : "-100%", y: "0%", rotate: isRight ? 15 : -15, opacity: 0, scale: 0.9 },
    visible: { x: isRight ? "25%" : "-25%", y: "0%", rotate: isRight ? -5 : 5, opacity: 1, scale: 1, transition: { type: "spring", stiffness: 60, damping: 12, mass: 1 } },
    exit: { x: isRight ? "120%" : "-120%", rotate: isRight ? 30 : -30, opacity: 0, scale: 0.85, transition: { type: "spring", stiffness: 70, damping: 14, mass: 0.8 } },
  };

  let positionClasses = "";
  if (position === "bottom-right") positionClasses = "bottom-24 right-0 origin-bottom-right";
  else if (position === "bottom-left") positionClasses = "bottom-24 left-0 origin-bottom-left";
  else if (position === "middle-right") positionClasses = "top-[40%] right-0 origin-right";
  else if (position === "middle-left") positionClasses = "top-[40%] left-0 origin-left";

  return (
    <div className="fixed inset-y-0 inset-x-0 pointer-events-none z-[70] overflow-hidden">
      <AnimatePresence>
        {showMascot && (
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
              src={currentMascot.src} 
              alt={currentMascot.name}
              fill
              sizes="(max-width: 768px) 200px, 300px"
              loading="lazy" 
              className={`object-contain ${!isRight ? "scale-x-[-1]" : ""}`} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}