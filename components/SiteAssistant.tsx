"use client";

import { useState, useRef, useEffect } from 'react';
import { FaRobot, FaChevronDown, FaPaperPlane } from 'react-icons/fa';
import Link from 'next/link';

// 🌟 1. EXTENSIVE KNOWLEDGE BASE (बॉट का मास्टर डेटाबेस)
const botKnowledge = [
  {
    keywords: ["pdf", "download", "save", "पीडीएफ", "डाउनलोड", "offline", "प्रिंट", "print"],
    answer: "आप किसी भी भजन को पढ़ते समय स्क्रीन पर दिए गए 'Download PDF' बटन पर क्लिक कर सकते हैं। इससे भजन आपके फोन में सेव हो जाएगा और आप उसे बिना इंटरनेट (Offline) के भी पढ़ सकेंगे।"
  },
  {
    keywords: ["gyan", "meaning", "bhavarth", "ज्ञान", "अर्थ", "भावार्थ", "article", "blog", "रहस्य", "कथा", "story"],
    answer: "सनातन धर्म के रहस्य, पूजा के नियम और भजनों के गहरे अर्थ जानने के लिए आप हमारा 'सनातन ज्ञान' सेक्शन पढ़ सकते हैं। यह हिंदी और इंग्लिश दोनों में उपलब्ध है।",
    link: { text: "📖 सनातन ज्ञान पढ़ें", url: "/gyan" }
  },
  {
    keywords: ["shabdkosh", "dictionary", "word", "शब्द", "शब्दकोश", "कठिन", "vocab", "डिक्शनरी"],
    answer: "भजनों या ग्रंथों में आने वाले संस्कृत और अवधी के कठिन शब्दों का सरल हिंदी अर्थ जानने के लिए हमने 'सनातन शब्दकोश' बनाया है।",
    link: { text: "📙 शब्दकोश देखें", url: "/shabdkosh" }
  },
  {
    keywords: ["deity", "bhagwan", "god", "भगवान", "देवता", "shiv", "hanuman", "ram", "krishna", "mata", "ganesh", "vishnu", "इष्ट"],
    answer: "हमारे पास शिव जी, हनुमान जी, राम जी, कृष्ण जी, माता रानी और सभी प्रमुख देवी-देवताओं के भजनों का विशाल संग्रह है। आप यहाँ से अपने इष्ट देव को चुन सकते हैं:",
    link: { text: "🕉️ देवी-देवता चुनें", url: "/deity" }
  },
  {
    keywords: ["category", "aarti", "chalisa", "mantra", "आरती", "चालीसा", "मंत्र", "stotra", "स्तोत्र", "अष्टकम", "कैटिगरी", "श्रेणी"],
    answer: "आप अपनी आवश्यकता के अनुसार आरती, चालीसा, मंत्र, स्तोत्र या स्तुति को अलग-अलग श्रेणियों (Categories) में खोज सकते हैं।",
    link: { text: "🗂️ श्रेणियाँ देखें", url: "/category" }
  },
  {
    keywords: ["singer", "artist", "lyricist", "गायक", "कलाकार", "लेखक", "sing", "लिरिक्स", "गाने वाले"],
    answer: "क्या आप अपने पसंदीदा गायक (जैसे लखबीर सिंह लक्खा, गुलशन कुमार) के भजन ढूंढ रहे हैं? हमारे आर्टिस्ट सेक्शन में जाएँ:",
    link: { text: "🎤 गायक और कलाकार खोजें", url: "/artist" }
  },
  {
    keywords: ["language", "english", "gujarati", "bengali", "kannada", "telugu", "translate", "भाषा", "इंग्लिश", "अंग्रेजी", "बंगाली", "गुजराती"],
    answer: "आप किसी भी भजन को अपनी क्षेत्रीय भाषा में पढ़ सकते हैं! भजन के पेज पर 'Language' (🌐) बटन पर क्लिक करें और हिंदी को इंग्लिश, गुजराती, बंगाली, कन्नड़ या तेलुगु में बदलें।"
  },
  {
    keywords: ["font", "size", "screen", "display", "फ़ॉन्ट", "बड़ा", "छोटा", "light", "आंखों", "अक्षर"],
    answer: "भजन पढ़ते समय स्क्रीन के नीचे एक टूलबार होता है। आप 'A+' दबाकर अक्षर बड़े कर सकते हैं, 'A-' से छोटे कर सकते हैं, और 💡 (बल्ब) आइकन दबाकर स्क्रीन को बंद होने से रोक (Wake Lock) सकते हैं।"
  },
  {
    keywords: ["tarz", "melody", "tune", "तर्ज", "धुन", "पैरोडी"],
    answer: "अगर आपको किसी खास धुन (तर्ज) पर भजन गाना पसंद है, तो आप सर्च बार में उस धुन का नाम लिखकर उसी तर्ज पर आधारित अन्य भजन खोज सकते हैं।"
  },
  {
    keywords: ["app", "install", "ऐप", "एप्लीकेशन", "मोबाइल"],
    answer: "आप 'Hindi Bhajan Manjari' को एक ऐप की तरह अपने फोन में इंस्टॉल कर सकते हैं! ब्राउज़र के मेन्यू में जाकर 'Install App' या 'Add to Home Screen' पर क्लिक करें।"
  },
  {
    keywords: ["search", "find", "खोजें", "ढूंढना", "सर्च", "bhajan", "song", "लिरिक्स", "गाना"],
    answer: "आप किसी भी भजन की पहली लाइन, देवता का नाम, या गायक का नाम लिखकर उसे सीधे हमारी वेबसाइट पर खोज सकते हैं।",
    link: { text: "🔍 भजन खोजें", url: "/search" }
  },
  {
    keywords: ["contact", "about", "team", "mohit", "admin", "संपर्क", "कौन", "डेवलपर", "developer"],
    answer: "हिंदी भजन मंजरी का उद्देश्य सनातन धर्म के भजनों और ज्ञान को शुद्ध रूप में आप तक पहुँचाना है। किसी भी सुझाव के लिए आप हमसे संपर्क कर सकते हैं।"
  },
  {
    keywords: ["hello", "hi", "namaste", "राम राम", "प्रणाम", "radhe radhe", "जय श्री राम", "जय माता दी", "हर हर महादेव", "ओम"],
    answer: "जय श्री राम! 🙏 मैं मंजरी गाइड हूँ। मैं इस वेबसाइट पर आपकी मदद कैसे कर सकता हूँ?"
  }
];

// 🌟 2. SUGGESTION CHIPS (यूज़र के लिए क्विक शॉर्टकट्स)
const quickQuestions = [
  "🔍 भजन कैसे खोजें?",
  "📄 PDF कैसे डाउनलोड करें?",
  "🔠 भाषा कैसे बदलें?",
  "📖 सनातन ज्ञान क्या है?",
  "📙 कठिन शब्दों के अर्थ?",
  "📱 ऐप कैसे इंस्टॉल करें?"
];

export default function SiteAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{sender: 'bot' | 'user', text: string, link?: {text: string, url: string}}[]>([
    { sender: 'bot', text: "राम राम! 🙏 मैं मंजरी गाइड हूँ। वेबसाइट को इस्तेमाल करने में अगर आपको कोई मदद चाहिए, तो आप नीचे दिए गए विकल्पों में से चुन सकते हैं या अपना सवाल लिख सकते हैं।" }
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) scrollToBottom();
  }, [messages, isOpen]);

  const handleSend = (textInput: string) => {
    const text = textInput.trim();
    if (!text) return;

    // Add User Message
    setMessages(prev => [...prev, { sender: 'user', text }]);
    setInput("");

    // 🌟 THE BRAIN: Keyword Matching Logic
    setTimeout(() => {
      const lowerText = text.toLowerCase();
      let matched = false;

      for (const rule of botKnowledge) {
        if (rule.keywords.some(keyword => lowerText.includes(keyword))) {
          setMessages(prev => [...prev, { sender: 'bot', text: rule.answer, link: rule.link }]);
          matched = true;
          break;
        }
      }

      // Fallback Answer if nothing matches
      if (!matched) {
        setMessages(prev => [...prev, { 
          sender: 'bot', 
          text: "क्षमा करें, मैं आपका सवाल पूरी तरह से समझ नहीं पाया। क्या आप हमारे सर्च पेज पर सीधे उस भजन या जानकारी को खोजना चाहेंगे?",
          link: { text: "🔍 वेबसाइट पर खोजें", url: `/search?q=${encodeURIComponent(text)}` }
        }]);
      }
    }, 400); // 400ms delay to feel natural
  };

  return (
    <>
      {/* FLOATING BUTTON */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-full shadow-[0_10px_25px_rgba(234,88,12,0.4)] flex items-center justify-center hover:scale-110 transition-transform duration-300 z-50 ${isOpen ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'}`}
        aria-label="Open Assistant"
      >
        <FaRobot size={24} />
      </button>

      {/* CHAT WINDOW */}
      <div className={`fixed bottom-6 right-6 sm:bottom-8 sm:right-8 w-[calc(100vw-3rem)] sm:w-[380px] h-[500px] max-h-[80vh] bg-white/95 backdrop-blur-xl border border-white/40 shadow-2xl rounded-3xl flex flex-col overflow-hidden transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] z-50 ${isOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 to-orange-500 p-4 text-white flex justify-between items-center shadow-md z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20">
              <FaRobot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Manjari Guide</h3>
              <p className="text-[11px] text-orange-100 uppercase tracking-widest font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Online
              </p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <FaChevronDown size={14} />
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-orange-50/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm font-medium ${msg.sender === 'user' ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-tr-sm' : 'bg-white text-gray-800 border border-orange-100/60 rounded-tl-sm'}`}>
                {msg.text}
                {msg.link && (
                  <div className="mt-3">
                    <Link href={msg.link.url} onClick={() => setIsOpen(false)} className="inline-block bg-orange-50 text-orange-700 border border-orange-200 px-4 py-2 rounded-xl text-xs font-bold hover:bg-orange-100 hover:shadow-sm transition-all active:scale-95">
                      {msg.link.text}
                    </Link>
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Chips (Suggestion Buttons) */}
        <div className="px-4 py-3 bg-white border-t border-gray-100 flex gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap shadow-[0_-4px_10px_rgba(0,0,0,0.02)] z-10">
          {quickQuestions.map((q, i) => (
            <button 
              key={i} 
              onClick={() => handleSend(q)}
              className="bg-orange-50 hover:bg-orange-100 border border-orange-100/80 text-orange-700 px-4 py-2 rounded-full text-xs font-bold transition-colors shrink-0 active:scale-95"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 focus-within:border-orange-400 focus-within:bg-white focus-within:shadow-sm transition-all"
          >
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="यहाँ अपना सवाल लिखें..." 
              className="flex-1 bg-transparent border-none outline-none text-sm text-gray-800 placeholder-gray-400 font-medium"
            />
            <button 
              type="submit" 
              disabled={!input.trim()}
              className="w-8 h-8 rounded-full bg-orange-500 text-white flex items-center justify-center hover:bg-orange-600 disabled:opacity-50 disabled:hover:bg-orange-500 transition-colors shrink-0"
            >
              <FaPaperPlane size={12} className="-ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </>
  );
}