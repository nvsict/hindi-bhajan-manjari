"use client";

import { FaVolumeUp, FaShareAlt } from 'react-icons/fa';
import { useCallback } from 'react';

interface WordActionProps {
  wordHi: string;
  wordEn: string;
  meaning: string;
}

export default function WordActionButtons({ wordHi, wordEn, meaning }: WordActionProps) {
  
  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); 
  }, []);

  // 🌟 NATIVE TEXT-TO-SPEECH (HINDI)
  const handleTTS = () => {
    triggerHaptic();
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(wordHi);
      utterance.lang = 'hi-IN'; // Sets the accent to Hindi
      utterance.rate = 0.9;     // Slightly slower for clear pronunciation
      utterance.pitch = 1;
      
      window.speechSynthesis.speak(utterance);
    } else {
      alert("क्षमा करें, आपका ब्राउज़र आवाज़ सपोर्ट नहीं करता।");
    }
  };

  // 🌟 NATIVE WEB SHARE API
  const handleShare = async () => {
    triggerHaptic();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${wordHi} - Spiritual Meaning`,
          text: `सनातन शब्दकोश:\n\n*${wordHi}* (${wordEn})\nअर्थ: ${meaning}\n\nविस्तृत जानकारी के लिए यहाँ पढ़ें:`,
          url: window.location.href,
        });
      } catch (error) {
        console.log("Sharing failed or was cancelled.", error);
      }
    } else {
      // Fallback: Copy to clipboard if Web Share is not supported (like on desktop)
      navigator.clipboard.writeText(window.location.href);
      alert("लिंक कॉपी कर लिया गया है!");
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button 
        onClick={handleTTS}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center hover:bg-orange-600 hover:text-white transition-all shadow-sm border border-orange-100 active:scale-95" 
        title="Pronounce Word"
        aria-label="Pronounce in Hindi"
      >
        <FaVolumeUp size={18} />
      </button>
      
      <button 
        onClick={handleShare}
        className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-gray-50 text-gray-500 flex items-center justify-center hover:bg-gray-200 hover:text-gray-900 transition-all shadow-sm border border-gray-100 active:scale-95" 
        title="Share this word"
        aria-label="Share"
      >
        <FaShareAlt size={16} />
      </button>
    </div>
  );
}