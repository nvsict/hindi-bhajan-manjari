'use client';

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface DivineTitleProps {
  children: React.ReactNode;
  showMascot?: boolean;
}

// 🌟 बाल कृष्ण के जन्माष्टमी स्पेशल मैसेजेस
const JANMASHTAMI_MESSAGES = [
  "नंद के आनंद भयो, जय कन्हैया लाल की! 🐘",
  "जन्माष्टमी की हार्दिक शुभकामनाएँ! 🌸",
  "माखन चोर आयो रे! 🧈",
  "राधे-राधे! आज तो मेरे जन्म का दिन है! ✨",
  "हाथी घोड़ा पालकी, जय कन्हैया लाल की! 🦚",
  "यशोदा के नंदन, ब्रज के दुलारे! 🙏",
  "मटकी संभाल के रखना गोपियों! 🏺",
  "भजन गाते रहो, मैं सुन रहा हूँ! 🎶",
  "जय श्री कृष्णा! मुरली वाले की जय! 🪈"
];

export default function DivineTitle({ children, showMascot = true }: DivineTitleProps) {
  // 🌟 Message State
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 🌟 Message Logic (Random message picker बिना री-रेंडर लूप के)
  const showRandomMessage = useCallback(() => {
    setActiveMessage((currentActive) => {
      let newMessage;
      do {
        newMessage = JANMASHTAMI_MESSAGES[Math.floor(Math.random() * JANMASHTAMI_MESSAGES.length)];
      } while (newMessage === currentActive && JANMASHTAMI_MESSAGES.length > 1);
      return newMessage;
    });

    // 4 सेकंड बाद मैसेज स्वतः गायब हो जाएगा
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => {
      setActiveMessage(null);
    }, 4000);
  }, []);

  // 🌟 Auto-Message: ठीक अंतराल पर चलने वाला सुरक्षित लूप
  useEffect(() => {
    if (!showMascot) return;
    
    // शुरुआत में 1.5 सेकंड बाद पहला मैसेज दिखाएं
    const initialTimer = setTimeout(() => {
      showRandomMessage();
    }, 1500);

    // इसके बाद हर 8 सेकंड में रिपीट होगा
    const autoInterval = setInterval(() => {
      showRandomMessage();
    }, 8000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(autoInterval);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, [showMascot, showRandomMessage]);

  return (
    // mt-14 sm:mt-16 मोबाइल और पीसी के लिए मार्जिन सेट किया है ताकि ऊपर जगह बनी रहे
    <div className="relative inline-block w-fit mt-14 sm:mt-16 select-none">
      
      {/* 🌟 LITTLE KRISHNA MASCOT & SPEECH BUBBLE */}
      {showMascot && (
        // 🌟 RESPONSIVE POSITIONING: 
        // मोबाइल पर साइज़ और पोजीशन छोटी (-top-[85px]) है, PC (sm:) पर बड़ी (-top-[110px]) है
        <div className="absolute -top-[55px] sm:-top-[98px] -right-[5px] sm:-right-[10px] z-30 pointer-events-auto">
          <div className="relative group cursor-pointer" onClick={showRandomMessage}>
            
            {/* 🌟 Speech Bubble (मैसेज बॉक्स) */}
            <AnimatePresence>
              {activeMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="absolute bottom-[85%] right-[50%] mb-2 bg-white text-orange-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl rounded-br-none shadow-xl border border-orange-200 text-[11px] sm:text-sm font-black whitespace-nowrap z-50 pointer-events-none"
                >
                  {activeMessage}
                  <div className="absolute top-full right-4 w-3 h-3 bg-white border-b border-r border-orange-200 transform rotate-45 -mt-1.5"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🌟 Mascot Image (Responsive width: mobile par 105px, PC par 135px) */}
            <div className="w-[105px] h-[105px] sm:w-[170px] sm:h-[180px] relative">
              <Image 
                src="/images/mascot_title.webp" 
                alt="Little Krishna Mascot" 
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)] origin-bottom"
                unoptimized 
              />
            </div>
          </div>
        </div>
      )}

      {/* 🌟 THE TITLE TEXT */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
} 