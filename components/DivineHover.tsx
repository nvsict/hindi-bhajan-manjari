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
  const [activeMessage, setActiveMessage] = useState<string | null>(null);
  const messageTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showRandomMessage = useCallback(() => {
    setActiveMessage((currentActive) => {
      let newMessage;
      do {
        newMessage = JANMASHTAMI_MESSAGES[Math.floor(Math.random() * JANMASHTAMI_MESSAGES.length)];
      } while (newMessage === currentActive && JANMASHTAMI_MESSAGES.length > 1);
      return newMessage;
    });

    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => {
      setActiveMessage(null);
    }, 4000);
  }, []);

  useEffect(() => {
    if (!showMascot) return;
    
    const initialTimer = setTimeout(() => {
      showRandomMessage();
    }, 1500);

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
    // 👇 यहाँ mt-[80px] (मोबाइल के लिए) और sm:mt-[120px] (PC के लिए) जोड़ा गया है।
    // अगर आपको और ज्यादा जगह चाहिए, तो 120px को बढ़ाकर 150px कर दें। कम चाहिए तो 100px कर दें।
    <div className="relative inline-block w-fit select-none z-[100] mt-[80px] sm:mt-[75px]">
      
      {/* 🌟 LITTLE KRISHNA MASCOT & SPEECH BUBBLE */}
      {showMascot && (
        <div className="absolute -top-[70px] sm:-top-[100px] -right-[-45px] sm:-right-[-50px] z-[110] pointer-events-auto">
          <div className="relative group cursor-pointer" onClick={showRandomMessage}>
            
            {/* 🌟 Speech Bubble */}
            <AnimatePresence>
              {activeMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="absolute bottom-[90%] right-[50%] mb-2 bg-white text-orange-600 px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl rounded-br-none shadow-xl border border-orange-200 text-[12px] sm:text-sm font-black whitespace-nowrap z-[120] pointer-events-none"
                >
                  {activeMessage}
                  <div className="absolute top-full right-4 w-3 h-3 bg-white border-b border-r border-orange-200 transform rotate-45 -mt-1.5"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🌟 CSS ANIMATED MASCOT */}
            <motion.div 
              animate={{ 
                y: [0, -8, 0],
                rotate: [0, -2, 2, 0]
              }} 
              transition={{ 
                repeat: Infinity,
                duration: 4,
                ease: "easeInOut" 
              }}
              className="w-[130px] h-[130px] sm:w-[190px] sm:h-[190px] relative"
            >
              <Image 
                src="/images/mascot_title.webp" 
                alt="Little Krishna Mascot" 
                fill
                style={{ objectFit: "contain" }}
                className="drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)] origin-bottom"
                unoptimized 
              />
            </motion.div>
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