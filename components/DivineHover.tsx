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

  // 🌟 Message Logic (Random message picker)
  const showRandomMessage = useCallback(() => {
    let newMessage;
    do {
      newMessage = JANMASHTAMI_MESSAGES[Math.floor(Math.random() * JANMASHTAMI_MESSAGES.length)];
    } while (newMessage === activeMessage && JANMASHTAMI_MESSAGES.length > 1);

    setActiveMessage(newMessage);

    // 4 सेकंड बाद मैसेज गायब हो जाएगा
    if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    messageTimerRef.current = setTimeout(() => {
      setActiveMessage(null);
    }, 4000);
  }, [activeMessage]);

  // 🌟 Auto-Message: हर 8 सेकंड में अपने आप कुछ बोलेंगे
  useEffect(() => {
    if (!showMascot) return;
    
    // शुरुआत में 1 सेकंड बाद पहला मैसेज दिखाएं
    const initialTimer = setTimeout(() => showRandomMessage(), 1000);

    const autoInterval = setInterval(() => {
      showRandomMessage();
    }, 8000); // 8 seconds

    return () => {
      clearTimeout(initialTimer);
      clearInterval(autoInterval);
      if (messageTimerRef.current) clearTimeout(messageTimerRef.current);
    };
  }, [showMascot, showRandomMessage]);

  return (
    // 🌟 w-fit लगाना सबसे ज़रूरी है! यह बॉक्स को सिर्फ टेक्स्ट जितना ही चौड़ा रखेगा
    <div className="relative inline-block w-fit mt-16 select-none">
      
      {/* 🌟 LITTLE KRISHNA MASCOT & SPEECH BUBBLE */}
      {showMascot && (
        // 🌟 PERFECT SITTING: -top-[70px] और -right-[30px] उन्हें हमेशा टेक्स्ट के टॉप-राईट कोने पर चिपका कर रखेगा
        <div className="absolute -top-[110px] -right-[10px] z-30 pointer-events-auto">
          <div className="relative group cursor-pointer" onClick={showRandomMessage}>
            
            {/* 🌟 Speech Bubble (मैसेज बॉक्स) */}
            <AnimatePresence>
              {activeMessage && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  // मैसेज बॉक्स बाल कृष्ण के सिर के पास बाईं ओर (Left) खुलेगा
                  className="absolute bottom-[85%] right-[50%] mb-2 bg-white text-orange-600 px-4 py-2 rounded-2xl rounded-br-none shadow-xl border border-orange-200 text-xs sm:text-sm font-black whitespace-nowrap z-50 pointer-events-none"
                >
                  {activeMessage}
                  {/* छोटी सी पूंछ (Tail) */}
                  <div className="absolute top-full right-4 w-3 h-3 bg-white border-b border-r border-orange-200 transform rotate-45 -mt-1.5"></div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 🌟 Mascot Image */}
            <Image 
              src="/images/mascot_title.webp" 
              alt="Little Krishna Mascot" 
              width={135} 
              height={135} 
              className="drop-shadow-[0_15px_25px_rgba(0,0,0,0.35)] transition-transform duration-300 origin-bottom"
              unoptimized 
            />
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