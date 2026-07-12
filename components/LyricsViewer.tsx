"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaWhatsapp, FaHeart, FaRegHeart,
  FaLightbulb, FaRegLightbulb, FaMusic, FaYoutube, FaLanguage,
  FaChevronDown, FaCheck, FaFont, FaXmark, FaBookOpen, FaSpinner
} from 'react-icons/fa6';
import PdfDownloadButton from './PdfDownloadButton';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from '@/components/MagneticButton'; // सुनिश्चित करें कि पाथ सही हो

import PushPrompt from './PushPrompt';

interface LyricsViewerProps {
  title: string;
  lyricsHindi: string;
  lyricsHinglish?: string | null;
  slug: string;
  videoEmbedUrl?: string | null;
  tarz?: string | null;
}

const SCRIPT_OPTIONS = [
  { id: 'devanagari', label: 'हिंदी (Hindi)' },
  { id: 'hinglish', label: 'English' },
  { id: 'gujarati', label: 'ગુજરાતી (Gujarati)' },
  { id: 'bengali', label: 'বাংলা (Bengali)' },
  { id: 'kannada', label: 'ಕನ್ನಡ (Kannada)' },
  { id: 'telugu', label: 'తెలుగు (Telugu)' },
  { id: 'malayalam', label: 'മലയാളം (Malayalam)' },
  { id: 'oriya', label: 'ଓଡ଼ିଆ (Odia)' }
];

const FONT_OPTIONS = [
  { id: 'font-hindi', name: 'Hind (Standard)', className: 'font-hindi', googleFont: '' }, // यह डिफ़ॉल्ट है, पहले से लोड होगा
  { id: 'font-noto-serif', name: 'Noto Serif (Granth)', className: 'font-noto-serif', googleFont: 'Noto+Serif' },
  { id: 'font-amita', name: 'Amita (Calligraphy)', className: 'font-amita', googleFont: 'Amita' },
  { id: 'font-poppins', name: 'Poppins (Modern)', className: 'font-poppins', googleFont: 'Poppins' },
  { id: 'font-kalam', name: 'Kalam (Diary)', className: 'font-kalam', googleFont: 'Kalam' },
];

// 🌟 ZERO-ERROR THUMBNAIL COMPONENT
const YouTubeThumbnail = ({ embedId, title }: { embedId: string, title: string }) => {
  // We default to 'hqdefault.jpg' because YouTube guarantees it exists for 100% of videos.
  // This completely eliminates the 404 network errors in the console.
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${embedId}/hqdefault.jpg`);
  const [hasError, setHasError] = useState(false);

  return (
    <img 
      src={imgSrc} 
      alt={`${title} Video`} 
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90" 
      onError={() => {
        // Ultimate fallback just in case even hqdefault drops (prevents infinite loop)
        if (!hasError) {
          setImgSrc(`https://img.youtube.com/vi/${embedId}/mqdefault.jpg`);
          setHasError(true);
        }
      }} 
    />
  );
};

const InstagramEmbed = ({ embedId }: { embedId: string }) => {
  const [isIntersecting, setIntersecting] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIntersecting(true); },
      { rootMargin: '200px' }
    );
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (isIntersecting) {
      const script = document.createElement('script');
      script.src = 'https://www.instagram.com/embed.js';
      script.async = true;
      document.body.appendChild(script);
      return () => { document.body.removeChild(script); };
    }
  }, [isIntersecting]);

  return (
    <div ref={containerRef} className="mt-6 flex justify-center w-full min-h-[450px]">
      {isIntersecting ? (
        <div className="bg-white p-2 rounded-3xl shadow-md border border-orange-100 w-full max-w-[400px] overflow-hidden flex justify-center">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={`https://www.instagram.com/p/${embedId}/?utm_source=ig_embed`}
            data-instgrm-version="14"
            style={{ background: '#FFF', border: '0', borderRadius: '16px', margin: '0', maxWidth: '400px', minWidth: '300px', padding: '0', width: '100%' }}
          >
            <div className="p-8 text-center text-gray-500 text-sm font-medium animate-pulse">Loading Instagram...</div>
          </blockquote>
        </div>
      ) : (
        <div className="w-full max-w-[400px] h-[450px] bg-gray-50 rounded-3xl border border-dashed border-gray-200 flex items-center justify-center text-gray-500 text-sm">
          Scrolling to load video...
        </div>
      )}
    </div>
  );
};

export default function LyricsViewer({ 
  title, lyricsHindi, lyricsHinglish, slug, videoEmbedUrl, tarz 
}: LyricsViewerProps) {

  const [fontSize, setFontSize] = useState(20);
  const [selectedFont, setSelectedFont] = useState(FONT_OPTIONS[0].className);
  const [isFontMenuOpen, setIsFontMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeScript, setActiveScript] = useState<string>('devanagari');
  
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBigHeart, setShowBigHeart] = useState(false);

  // 🌟 MASSIVE PERFORMANCE FIX: Dynamic Lyrics State
  const [displayLyrics, setDisplayLyrics] = useState<string>(lyricsHindi);

  // DICTIONARY STATE
  const [dictionaryData, setDictionaryData] = useState<any>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isFetchingMeaning, setIsFetchingMeaning] = useState(false);

  const videoRef = useRef<HTMLDivElement>(null);
  const scriptDropdownRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    setFontSize(window.innerWidth < 768 ? 17 : 22);
    const savedFavorites = JSON.parse(localStorage.getItem('bhajan_favorites') || '[]');
    if (savedFavorites.some((fav: any) => fav.slug === slug)) setIsFavorite(true);
    const savedFont = localStorage.getItem('preferred_lyrics_font');
    if (savedFont) setSelectedFont(savedFont);
  }, [slug]);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); 
  }, []);

  // 🌟 MASSIVE PERFORMANCE FIX: Lazy Loading Sanscript (Saves ~3MB on initial load)
  useEffect(() => {
    if (activeScript === 'devanagari') {
      setDisplayLyrics(lyricsHindi);
      return;
    }
    if (activeScript === 'hinglish' && lyricsHinglish) {
      setDisplayLyrics(lyricsHinglish);
      return;
    }
    
    let isMounted = true;
    import('sanscript').then((Sanscript) => {
      if (!isMounted) return;
      try {
        const from = 'devanagari';
        const to = activeScript === 'hinglish' ? 'iast' : activeScript;
        const s = Sanscript.default || Sanscript;
        setDisplayLyrics(s.t(lyricsHindi, from, to));
      } catch (e) { console.error("Transliteration Error:", e); }
    });

    return () => { isMounted = false; };
  }, [activeScript, lyricsHindi, lyricsHinglish]);

  const handleWordClick = async (clickedWord: string) => {
    if (!clickedWord || clickedWord.length < 2) return;
    const cleanText = clickedWord.replace(/[.,!?'"(){}\[\]|;:\-\n\r]/g, '').trim();
    if (!cleanText) return;

    setIsFetchingMeaning(true);
    let searchWord = cleanText;

    if (activeScript !== 'devanagari') {
      try {
        const Sanscript = await import('sanscript'); // Lazy load for dictionary too
        const fromScript = activeScript === 'hinglish' ? 'iast' : activeScript;
        const s = Sanscript.default || Sanscript;
        searchWord = s.t(cleanText, fromScript, 'devanagari');
      } catch (e) { console.error("Reverse transliteration failed", e); }
    }

    try {
      const safeText = cleanText.replace(/[^a-zA-Z\u0900-\u097F]/g, '');
      const { data, error } = await supabase
        .from('dictionary')
        .select('*')
        .or(`word_hi.eq.${searchWord},word_en.ilike.${safeText}`)
        .limit(1)
        .maybeSingle();

      if (data) {
        setDictionaryData(data);
        setIsDictionaryOpen(true);
        triggerHaptic();
      }
    } catch (err) {
      console.error("Dictionary Fetch Error:", err);
    } finally {
      setIsFetchingMeaning(false);
    }
  };

  // 🌟 MASSIVE PERFORMANCE FIX: Event Delegation for 1000s of words
  const handleLyricsContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.tagName === 'SPAN' && target.textContent) {
      handleWordClick(target.textContent);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (scriptDropdownRef.current && !scriptDropdownRef.current.contains(target)) setIsDropdownOpen(false);
      if (fontDropdownRef.current && !fontDropdownRef.current.contains(target)) setIsFontMenuOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight <= 0) return;
      setScrollProgress(Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100)));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDoubleTap = () => {
    triggerHaptic();
    if (!isFavorite) toggleFavorite(false); 
    setShowBigHeart(true);
    setTimeout(() => setShowBigHeart(false), 1000); 
  };

  const scrollToVideo = () => {
    triggerHaptic();
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // 🌟 SMART LAZY LOADER FOR FONTS
  const loadFontDynamically = (fontClass: string) => {
    const fontObj = FONT_OPTIONS.find(f => f.className === fontClass);
    if (!fontObj || !fontObj.googleFont) return; // अगर डिफ़ॉल्ट है तो कुछ मत करो

    const linkId = `dynamic-font-${fontClass}`;
    // चेक करो कि क्या यह फॉन्ट पहले से लोड हो चुका है?
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontObj.googleFont}:wght@400;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  };

  useEffect(() => {
    setFontSize(window.innerWidth < 768 ? 17 : 22);
    const savedFavorites = JSON.parse(localStorage.getItem('bhajan_favorites') || '[]');
    if (savedFavorites.some((fav: any) => fav.slug === slug)) setIsFavorite(true);
    
    // 🌟 Check Local Storage and Load Font On-Demand
    const savedFont = localStorage.getItem('preferred_lyrics_font');
    if (savedFont) {
      setSelectedFont(savedFont);
      loadFontDynamically(savedFont); // सिर्फ तभी लोड करो जब यूज़र की सेव की हुई प्रेफरेंस हो
    }
  }, [slug]);

  // 🌟 When user clicks a new font
  const changeFont = (fontClass: string) => {
    triggerHaptic();
    setSelectedFont(fontClass);
    localStorage.setItem('preferred_lyrics_font', fontClass);
    setIsFontMenuOpen(false);
    
    loadFontDynamically(fontClass); // फॉन्ट क्लिक करते ही डाउनलोड शुरू!
  };

  const toggleFavorite = (withHaptic = true) => {
    if (withHaptic) triggerHaptic(); 
    let savedFavorites = JSON.parse(localStorage.getItem('bhajan_favorites') || '[]');
    if (isFavorite) {
      savedFavorites = savedFavorites.filter((fav: any) => fav.slug !== slug);
      setIsFavorite(false);
    } else {
      savedFavorites.push({ title, slug, addedAt: new Date().toISOString() });
      setIsFavorite(true);
    }
    localStorage.setItem('bhajan_favorites', JSON.stringify(savedFavorites));
  };

  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) return; 
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockActive(true);
      wakeLockRef.current.addEventListener('release', () => setWakeLockActive(false));
    } catch (err: any) { setWakeLockActive(false); }
  };

  useEffect(() => {
    requestWakeLock();
    const handleVisibilityChange = () => { if (document.visibilityState === 'visible') requestWakeLock(); };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, []);

  const toggleWakeLock = async () => {
    triggerHaptic(); 
    if (!('wakeLock' in navigator)) return;
    if (wakeLockActive && wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
    } else { await requestWakeLock(); }
  };

  const handleWhatsAppShare = async () => {
    triggerHaptic(); 
    const teaser = String(displayLyrics).split('\n').filter((l) => l.trim() !== "").slice(0, 4).join('\n');
    const message = `✨ *${title}* ✨\n\n${teaser}\n...\n\n📖 *पूरा भजन पढ़ने के लिए:* \n${window.location.href}\n\n🙏 *Hindi Bhajan Manjari*`;
    if (navigator.share) {
      try { await navigator.share({ title, text: message }); return; } catch (err: any) {}
    }
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`, '_blank');
  };

  let embedType = null;
  let embedId = null;
  if (videoEmbedUrl) {
    if (videoEmbedUrl.includes('youtube.com') || videoEmbedUrl.includes('youtu.be')) {
      embedType = 'youtube';
      const match = videoEmbedUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
      embedId = (match && match[2].length === 11) ? match[2] : null;
    } else if (videoEmbedUrl.includes('instagram.com')) {
      embedType = 'instagram';
      const match = videoEmbedUrl.match(/(?:instagram\.com.*\/p\/|instagram\.com.*\/reel\/|instagram\.com.*\/reels\/)([A-Za-z0-9_-]+)/i);
      embedId = match ? match[1] : null;
    }
  }

  const cleanHinglishTitle = slug.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="relative w-full">

      {/* 🌟 SEO & INTERNAL LINKING: Clickable Tarz */}
      {tarz && (
        <div className="mb-6 flex justify-center relative z-20">
          <Link 
            href={`/search?q=${encodeURIComponent(tarz)}`}
            title={`Search all bhajans on the melody of: ${tarz}`}
            className="group inline-flex items-center gap-2.5 bg-orange-100/80 hover:bg-orange-200/90 border border-orange-200 text-orange-900 px-6 py-3 rounded-full shadow-sm transition-all active:scale-95"
          >
            <FaMusic className="text-orange-600 group-hover:animate-pulse text-sm" />
            <p className="text-sm md:text-base font-medium">
              <span className="font-bold font-hindi text-orange-800">तर्ज:</span> <span className="font-hindi group-hover:underline underline-offset-4">{tarz}</span>
            </p>
          </Link>
        </div>
      )}

      {/* ACTION BAR */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-3 mb-8 relative z-20 w-full max-w-3xl mx-auto px-4">
        <div className="relative flex-1 min-w-[140px]" ref={scriptDropdownRef}>
          <MagneticButton type="button" aria-label="Select Language" onClick={() => { triggerHaptic(); setIsDropdownOpen(!isDropdownOpen); setIsFontMenuOpen(false); }} className="flex items-center justify-between w-full gap-2 bg-white hover:bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2 overflow-hidden">
              <FaLanguage className="text-orange-500 text-lg shrink-0" />
              <span className="text-gray-800 font-bold text-sm truncate">{SCRIPT_OPTIONS.find(opt => opt.id === activeScript)?.label}</span>
            </div>
            <FaChevronDown className={`text-orange-400 text-xs shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </MagneticButton>
          <div className={`absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-200 origin-top z-40 ${isDropdownOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
            <div className="py-1.5 max-h-[60vh] overflow-y-auto hide-scrollbar">
              {SCRIPT_OPTIONS.map((option) => (
                <button key={option.id} onClick={() => { triggerHaptic(); setActiveScript(option.id); setIsDropdownOpen(false); }} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${activeScript === option.id ? 'bg-orange-50/80 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  {option.label} {activeScript === option.id && <FaCheck className="text-orange-500 text-xs" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex-1 min-w-[140px]" ref={fontDropdownRef}>
          <MagneticButton type="button" aria-label="Select Font" onClick={() => { triggerHaptic(); setIsFontMenuOpen(!isFontMenuOpen); setIsDropdownOpen(false); }} className="flex items-center justify-between w-full gap-2 bg-white hover:bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2 overflow-hidden">
              <FaFont className="text-orange-500 text-sm shrink-0" />
              <span className="text-gray-800 font-bold text-sm truncate">{FONT_OPTIONS.find(f => f.className === selectedFont)?.name.split(' ')[0]}</span>
            </div>
            <FaChevronDown className={`text-orange-400 text-xs shrink-0 transition-transform duration-300 ${isFontMenuOpen ? 'rotate-180' : ''}`} />
          </MagneticButton>
          <div className={`absolute top-full left-0 mt-2 w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-200 origin-top z-40 ${isFontMenuOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
            <div className="py-1.5">
              {FONT_OPTIONS.map((font) => (
                <button key={font.id} onClick={() => changeFont(font.className)} className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${selectedFont === font.className ? 'bg-orange-50/80 text-orange-600' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
                  <span className={font.className}>{font.name}</span> {selectedFont === font.className && <FaCheck className="text-orange-500 text-xs" />}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="w-full sm:w-auto sm:flex-none">
          <PdfDownloadButton titleHindi={title} titleHinglish={cleanHinglishTitle} lyricsHindi={displayLyrics} />
        </div>
      </div>

      {/* DICTIONARY HINT UI */}
      <div className="flex justify-center mb-6 px-4 relative z-10">
        <div className="bg-blue-50/80 border border-blue-100/80 text-blue-900 text-[13px] md:text-sm font-medium px-5 py-3.5 rounded-2xl shadow-sm flex items-start sm:items-center gap-3 max-w-2xl w-full backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1 h-full bg-blue-400 rounded-l-2xl"></div>
          <FaLightbulb className="text-blue-500 text-lg shrink-0 mt-0.5 sm:mt-0" />
          <p className="leading-relaxed">
            <strong className="font-black">Sanatan Dictionary:</strong> Tap on any difficult word in the lyrics to instantly know its spiritual meaning! ✨
          </p>
          {isFetchingMeaning && <FaSpinner className="absolute right-4 top-1/2 -translate-y-1/2 text-blue-400 animate-spin" />}
        </div>
      </div>

      {/* LYRICS CONTAINER */}
      <div 
        className="bg-orange-50/30 rounded-3xl p-6 md:p-12 border border-orange-100/50 relative overflow-hidden shadow-sm select-none transition-all duration-300 hover:shadow-md" 
        onDoubleClick={handleDoubleTap}
        onClick={handleLyricsContainerClick}
      >
        {/* 🌟 FIX: Added aria-hidden="true" so Googlebot ignores this text */}
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-6xl md:text-9xl font-black rotate-[-45deg] whitespace-nowrap uppercase tracking-tighter">
            Hindi Bhajan Manjari
          </span>
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-300 z-50 ${showBigHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <FaHeart className="text-red-500 text-[120px] md:text-[180px] drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]" />
        </div>
        
        <AnimatePresence mode="wait">
  <motion.div 
    key={activeScript} // 🌟 यह key ही जादू करेगी (भाषा बदलते ही एनीमेशन ट्रिगर होगा)
    initial={{ opacity: 0, filter: "blur(8px)", y: 5 }}
    animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
    exit={{ opacity: 0, filter: "blur(8px)", y: -5 }}
    transition={{ duration: 0.3, ease: "easeInOut" }}
    className={`relative z-10 text-center font-bold tracking-normal text-gray-900 antialiased leading-relaxed ${selectedFont}`} 
    style={{ fontSize: `${fontSize}px` }}
  >
    {String(displayLyrics).split(/\n\s*\n/).map((stanza: string, index: number, array: string[]) => {
            const shouldShowAd = index === 1 || (index > 2 && (index - 1) % 5 === 0);
            const adCount = Math.floor((index - 1) / 5) + 1;
            const isAllowedAd = shouldShowAd && adCount <= 3;

            return (
              <div key={index} className="flex flex-col items-center w-full">
                <div className="w-full">
                  {stanza.split('\n').map((line: string, lineIndex: number) => (
                    <div key={lineIndex} className="min-h-[1.5em]">
                      {line.split(' ').map((word: string, wordIndex: number, wordsArray: string[]) => (
                        <span key={wordIndex}>
                          <span className="cursor-pointer active:bg-orange-200/80 lg:hover:bg-orange-100/60 transition-colors rounded-md">{word}</span>
                          {wordIndex < wordsArray.length - 1 ? ' ' : ''}
                        </span>
                      ))}
                    </div>
                  ))}
                </div>
                
                {index < array.length - 1 && (
                  <div className={`flex items-center justify-center opacity-60 w-full ${isAllowedAd ? 'pt-6 md:pt-8 pb-2' : 'py-6 md:py-8'}`}>
                    <div className="w-3/4 md:w-1/2 max-w-md h-[1px] bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                  </div>
                )}

              </div>
            );
          })}
  </motion.div>
</AnimatePresence>
</div>

      {/* MEDIA PLAYERS */}
      <div ref={videoRef} className="scroll-mt-24">
        {embedType === 'youtube' && embedId && (
          <div className="mt-6 rounded-3xl overflow-hidden shadow-md border border-orange-100 bg-white p-2 w-full">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 group">
              {!isVideoPlaying ? (
                <div className="w-full h-full cursor-pointer relative" onClick={() => setIsVideoPlaying(true)}>
                  <YouTubeThumbnail key={embedId} embedId={embedId} title={title} />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 transition-all"><FaYoutube className="text-red-600 text-6xl md:text-7xl drop-shadow-[0_4px_15px_rgba(0,0,0,0.6)] group-hover:scale-110 transition-transform" /></div>
                </div>
              ) : (
                <iframe src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`} title={`${title} Video`} allowFullScreen className="absolute top-0 left-0 w-full h-full border-0"></iframe>
              )}
            </div>
          </div>
        )}
        {embedType === 'instagram' && embedId && <InstagramEmbed embedId={embedId} />}
      </div>

      {/* FLOATING TOOLBAR */}
      <div className="fixed bottom-[85px] md:bottom-8 left-1/2 -translate-x-1/2 z-[90] w-max max-w-[95vw] transition-all duration-300">
        <div className="relative px-3 md:px-4 py-2 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full">
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 left-0 h-[3px] bg-orange-500 transition-all duration-150 ease-out opacity-80" style={{ width: `${scrollProgress}%` }}></div>
          </div>
          
          <div className="relative z-10 flex items-center gap-1.5 sm:gap-3">
            <PushPrompt />
            <button 
              onClick={toggleWakeLock} 
              className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shrink-0 ${wakeLockActive ? 'bg-yellow-100' : 'hover:bg-yellow-50'}`}
              aria-label={wakeLockActive ? "Disable Keep Screen On" : "Enable Keep Screen On"}
              title={wakeLockActive ? "Disable Keep Screen On" : "Enable Keep Screen On"}
            >
              {wakeLockActive ? <FaLightbulb className="text-yellow-500 text-xl" /> : <FaRegLightbulb className="text-gray-500 text-xl hover:text-yellow-500" />}
            </button>
            
            <button 
              onClick={() => toggleFavorite(true)} 
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors shrink-0"
              aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
            >
              {isFavorite ? <FaHeart className="text-red-500 text-xl transition-transform scale-110" /> : <FaRegHeart className="text-gray-500 text-xl hover:text-red-400" />}
            </button>
            
            <div className="w-[1px] h-6 bg-gray-300"></div>
            
            <div className="flex items-center gap-1 shrink-0">
              <button 
                onClick={() => { triggerHaptic(); setFontSize(prev => Math.max(14, prev - 2)); }} 
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors rounded-full font-serif font-bold text-lg"
                aria-label="Decrease font size"
                title="Decrease font size"
              >
                A-
              </button>
              <button 
                onClick={() => { triggerHaptic(); setFontSize(prev => Math.min(40, prev + 2)); }} 
                className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors rounded-full font-serif font-bold text-lg"
                aria-label="Increase font size"
                title="Increase font size"
              >
                A+
              </button>
            </div>
            
            <div className="w-[1px] h-6 bg-gray-300 hidden sm:block"></div>
            
            {videoEmbedUrl && (
              <button 
                onClick={scrollToVideo} 
                className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 bg-orange-600 text-white rounded-full hover:bg-orange-700 font-bold shadow-md hover:-translate-y-0.5 transition-all shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                aria-label="Watch Video"
                title="Watch Video"
              >
                <FaYoutube size={18} /> <span className="hidden sm:inline ml-2">Video</span>
              </button>
            )}
            
            <button 
              onClick={handleWhatsAppShare} 
              className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 bg-[#25D366] text-white rounded-full hover:bg-[#20b858] font-bold shadow-md hover:-translate-y-0.5 transition-all shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-green-400"
              aria-label="Share on WhatsApp"
              title="Share on WhatsApp"
            >
              <FaWhatsapp size={20} /> <span className="hidden sm:inline ml-2">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* SANATAN SHABDKOSH POPUP */}
      <div className={`fixed inset-0 z-[150] flex items-end sm:items-center justify-center transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${isDictionaryOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-400" onClick={() => setIsDictionaryOpen(false)} />
        <div className={`relative w-full sm:w-[500px] bg-white rounded-t-[2.5rem] sm:rounded-[2rem] shadow-2xl transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 ${isDictionaryOpen ? 'translate-y-0 scale-100' : 'translate-y-full sm:translate-y-10 sm:scale-95'}`}>
          <div className="w-full flex justify-center pt-5 pb-2 sm:hidden cursor-pointer" onClick={() => setIsDictionaryOpen(false)}>
            <div className="w-12 h-1.5 bg-gray-300 rounded-full" />
          </div>

          {dictionaryData && (
            <div className="p-7 sm:p-9 overflow-y-auto">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <div className="flex items-center gap-2 text-orange-600 text-xs font-black uppercase tracking-widest mb-2.5">
                    <FaBookOpen /> Sanatan Shabdkosh
                  </div>
                  <h3 className="text-3xl sm:text-4xl font-black text-gray-900 font-hindi mb-1.5">{dictionaryData.word_hi}</h3>
                  <p className="text-gray-500 font-bold tracking-wider uppercase text-sm">{dictionaryData.word_en}</p>
                </div>
                <button onClick={() => setIsDictionaryOpen(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-200 hover:text-gray-900 transition-colors shrink-0">
                  <FaXmark size={20} />
                </button>
              </div>

              <div className="space-y-4 mb-8">
                <div className="bg-orange-50/70 border border-orange-100/80 rounded-2xl p-6">
                  <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest mb-2">Hindi Meaning</p>
                  <p className="text-gray-900 font-bold font-hindi text-[18px] leading-relaxed">{dictionaryData.meaning_hi}</p>
                </div>
                {dictionaryData.meaning_en && (
                  <div className="bg-blue-50/70 border border-blue-100/80 rounded-2xl p-6">
                    <p className="text-[11px] font-black text-blue-500 uppercase tracking-widest mb-2">English Meaning</p>
                    <p className="text-gray-900 font-bold text-[16px] leading-relaxed">{dictionaryData.meaning_en}</p>
                  </div>
                )}
              </div>

              {dictionaryData.slug && (
                <a href={`/shabdkosh/${dictionaryData.slug}`} className="block w-full text-center bg-gray-900 hover:bg-black text-white text-[15px] font-black tracking-wide py-4 rounded-2xl transition-transform active:scale-95 shadow-md">
                  Read Deep Spiritual Explanation
                </a>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}