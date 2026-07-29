"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaWhatsapp, FaHeart, FaRegHeart,
  FaLightbulb, FaRegLightbulb, FaMusic, FaYoutube, FaLanguage,
  FaChevronDown, FaCheck, FaFont, FaXmark, FaBookOpen, FaSpinner,
  FaMagnifyingGlass 
} from 'react-icons/fa6';
import PdfDownloadButton from './PdfDownloadButton';
import { supabase } from '@/utils/supabase';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import MagneticButton from '@/components/MagneticButton'; 
import SaveToSangrahButton from '@/components/SaveToSangrahButton';
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
  { id: 'font-hindi', name: 'Hind (Standard)', className: 'font-hindi', googleFont: 'Hind', fontFamily: '"Hind", sans-serif' },
  { id: 'font-baloo', name: 'Baloo 2 (Round)', className: 'font-baloo', googleFont: 'Baloo+2', fontFamily: '"Baloo 2", cursive' },
  { id: 'font-mukta', name: 'Mukta (Clean)', className: 'font-mukta', googleFont: 'Mukta', fontFamily: '"Mukta", sans-serif' },
  { id: 'font-poppins', name: 'Poppins (Modern)', className: 'font-poppins', googleFont: 'Poppins', fontFamily: '"Poppins", sans-serif' },
  { id: 'font-google-sans', name: 'Google Sans', className: 'font-google-sans', googleFont: 'Noto+Sans+Devanagari', fontFamily: '"Google Sans", "Noto Sans Devanagari", sans-serif' },
];

const YouTubeThumbnail = ({ embedId, title }: { embedId: string, title: string }) => {
  const [imgSrc, setImgSrc] = useState(`https://img.youtube.com/vi/${embedId}/hqdefault.jpg`);
  const [hasError, setHasError] = useState(false);

  return (
    <img 
      src={imgSrc} 
      alt={`${title} Video`} 
      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90" 
      onError={() => {
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
  
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [wakeLockActive, setWakeLockActive] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBigHeart, setShowBigHeart] = useState(false);
  const [isRecordingActive, setIsRecordingActive] = useState(false); 

  const [isScrollingDown, setIsScrollingDown] = useState(false);
  const lastScrollY = useRef(0);

  const [displayLyrics, setDisplayLyrics] = useState<string>(lyricsHindi);

  const [dictionaryData, setDictionaryData] = useState<any>(null);
  const [isDictionaryOpen, setIsDictionaryOpen] = useState(false);
  const [isFetchingMeaning, setIsFetchingMeaning] = useState(false);

  const videoRef = useRef<HTMLDivElement>(null);
  const scriptDropdownRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<any>(null);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); 
  }, []);

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
        const Sanscript = await import('sanscript'); 
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
    const handleRecordingState = (e: any) => setIsRecordingActive(e.detail.active);
    window.addEventListener('bhajan-recording-state', handleRecordingState);
    return () => window.removeEventListener('bhajan-recording-state', handleRecordingState);
  }, []);

  const isRecordingActiveRef = useRef(false);

  useEffect(() => {
    isRecordingActiveRef.current = isRecordingActive; 
  }, [isRecordingActive]);

  useEffect(() => {
    const handleScroll = () => {
      if (isRecordingActiveRef.current) return; 
      const currentScrollY = window.scrollY;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      
      if (windowHeight > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (currentScrollY / windowHeight) * 100)));
      }

      if (currentScrollY > lastScrollY.current + 15) {
        setIsScrollingDown(true);
      } else if (currentScrollY < lastScrollY.current - 15 || currentScrollY < 50) {
        setIsScrollingDown(false);
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDoubleTap = () => {
    triggerHaptic();
    setShowBigHeart(true);
    setTimeout(() => setShowBigHeart(false), 1000); 
  };

  const scrollToVideo = () => {
    triggerHaptic();
    videoRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const loadFontDynamically = (fontClass: string) => {
    const fontObj = FONT_OPTIONS.find(f => f.className === fontClass);
    if (!fontObj || !fontObj.googleFont) return; 

    const linkId = `dynamic-font-${fontClass}`;
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
    
    const savedFont = localStorage.getItem('preferred_lyrics_font');
    if (savedFont) {
      setSelectedFont(savedFont);
      loadFontDynamically(savedFont); 
    }
  }, [slug]);

  const changeFont = (fontClass: string) => {
    triggerHaptic();
    setSelectedFont(fontClass);
    localStorage.setItem('preferred_lyrics_font', fontClass);
    setIsFontMenuOpen(false);
    
    loadFontDynamically(fontClass); 
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
    <div className="relative w-full max-w-4xl mx-auto">

      {/* 🌟 1. TARZ (Clickable Reference Button) */}
      {tarz && (
        <div className="mb-4 flex justify-center relative z-20">
          <Link 
            href={`/search?q=${encodeURIComponent(tarz)}`}
            title={`Search all bhajans on the melody of: ${tarz}`}
            className="group flex items-center gap-2 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 text-gray-700 hover:text-orange-800 px-5 py-2 rounded-full shadow-sm transition-all text-sm font-medium"
          >
            <FaMagnifyingGlass className="text-gray-400 group-hover:text-orange-500" />
            <span>तर्ज: <strong className="font-hindi tracking-wide">{tarz}</strong></span>
          </Link>
        </div>
      )}

      {/* 🌟 2. UNIFIED READING TOOLBAR (Now without A-/A+ for cleaner look) */}
      <div className="bg-white border border-gray-200 rounded-2xl p-2 md:p-3 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-2 z-20 relative">
        
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          {/* Language Dropdown */}
          <div className="relative flex-1" ref={scriptDropdownRef}>
            <button onClick={() => { triggerHaptic(); setIsDropdownOpen(!isDropdownOpen); setIsFontMenuOpen(false); }} className="flex items-center justify-between w-full gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors text-sm border border-transparent hover:border-gray-200">
              <div className="flex items-center gap-2 overflow-hidden">
                <FaLanguage className="text-gray-500 text-lg shrink-0" />
                <span className="text-gray-800 font-bold truncate">{SCRIPT_OPTIONS.find(opt => opt.id === activeScript)?.label}</span>
              </div>
              <FaChevronDown className="text-gray-400 text-xs shrink-0" />
            </button>
            <div className={`absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-40 transition-all origin-top ${isDropdownOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
              <div className="py-1 max-h-[50vh] overflow-y-auto">
                {SCRIPT_OPTIONS.map((opt) => (
                  <button key={opt.id} onClick={() => { triggerHaptic(); setActiveScript(opt.id); setIsDropdownOpen(false); }} className={`w-full flex justify-between px-4 py-2.5 text-sm font-medium ${activeScript === opt.id ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                    {opt.label} {activeScript === opt.id && <FaCheck />}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Font Dropdown */}
          <div className="relative flex-1" ref={fontDropdownRef}>
            <button onClick={() => { triggerHaptic(); setIsFontMenuOpen(!isFontMenuOpen); setIsDropdownOpen(false); }} className="flex items-center justify-between w-full gap-2 bg-gray-50 hover:bg-gray-100 px-3 py-2 rounded-xl transition-colors text-sm border border-transparent hover:border-gray-200">
              <div className="flex items-center gap-2 overflow-hidden">
                <FaFont className="text-gray-500 text-sm shrink-0" />
                <span className="text-gray-800 font-bold truncate">{FONT_OPTIONS.find(f => f.className === selectedFont)?.name.split(' ')[0]}</span>
              </div>
              <FaChevronDown className="text-gray-400 text-xs shrink-0" />
            </button>
            <div className={`absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-xl shadow-lg z-40 transition-all origin-top ${isFontMenuOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'}`}>
              <div className="py-1">
                {FONT_OPTIONS.map((font) => (
                  <button key={font.id} onClick={() => changeFont(font.className)} className={`w-full flex justify-between px-4 py-2.5 text-sm ${selectedFont === font.className ? 'bg-orange-50 text-orange-600' : 'text-gray-700 hover:bg-gray-50'}`}>
                    <span style={{ fontFamily: font.fontFamily }}>{font.name}</span>
                    {selectedFont === font.className && <FaCheck />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: PDF ONLY (A-/A+ removed from here) */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 border-gray-100 pt-2 sm:pt-0">
          <PdfDownloadButton titleHindi={title} titleHinglish={cleanHinglishTitle} lyricsHindi={displayLyrics} />
        </div>
      </div>

      {/* 🌟 3. DICTIONARY PILL */}
      <div className="flex justify-center mb-6 relative z-10 px-4">
        <div className="inline-flex items-center gap-2 bg-blue-50/80 text-blue-700 text-xs md:text-sm font-bold px-4 py-2 rounded-full border border-blue-100 shadow-sm backdrop-blur-sm">
          <FaLightbulb className="text-blue-500 shrink-0" />
          <span>Tap any word to see its meaning</span>
          {isFetchingMeaning && <FaSpinner className="animate-spin shrink-0 text-blue-500" />}
        </div>
      </div>

      {/* LYRICS CONTAINER */}
      <div 
        className="bg-orange-50/30 rounded-3xl p-6 md:p-12 border border-orange-100/50 relative overflow-hidden shadow-sm select-none transition-all duration-300 hover:shadow-md" 
        onDoubleClick={handleDoubleTap}
        onClick={handleLyricsContainerClick}
      >
        <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-6xl md:text-9xl font-black rotate-[-45deg] whitespace-nowrap uppercase tracking-tighter">Hindi Bhajan Manjari</span>
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-300 z-50 ${showBigHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <FaHeart className="text-red-500 text-[120px] md:text-[180px] drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]" />
        </div>
        
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeScript} 
            initial={{ opacity: 0, filter: "blur(8px)", y: 5 }}
            animate={{ opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ opacity: 0, filter: "blur(8px)", y: -5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`relative z-10 text-center font-bold tracking-normal text-gray-900 antialiased leading-relaxed`} 
            style={{ 
              fontSize: `${fontSize}px`,
              fontFamily: FONT_OPTIONS.find(f => f.className === selectedFont)?.fontFamily || '"Hind", sans-serif'
            }}
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

      {/* 🌟 4. ASYMMETRICAL ADAPTIVE FLOATING TOOLBAR */}
      {/* Container adopts a unique Teardrop/Pill Shape: full circle left, tighter curve right */}
      <div 
        className={`fixed bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 z-[90] w-max max-w-[95vw] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] hover:opacity-100 hover:scale-100 ${isScrollingDown ? 'opacity-40 scale-95' : 'opacity-100 scale-100'}`}
      >
        <div className="relative p-1.5 md:p-2 bg-white/95 backdrop-blur-xl border border-gray-200 shadow-[0_8px_30px_rgba(0,0,0,0.12)] rounded-l-[2.5rem] rounded-r-2xl flex items-center gap-1 sm:gap-1.5">
          
          <div className="absolute inset-0 rounded-l-[2.5rem] rounded-r-2xl overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 left-0 h-[2px] bg-orange-500 transition-all duration-150 ease-out opacity-80" style={{ width: `${scrollProgress}%` }}></div>
          </div>
          
          {/* 🌟 Big Bulb Button (Primary Prominent Action) */}
          <button 
            onClick={toggleWakeLock} 
            className={`relative z-10 flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 rounded-full transition-colors shrink-0 shadow-sm border ${wakeLockActive ? 'bg-yellow-100 border-yellow-200 text-yellow-600' : 'bg-gray-50 border-gray-200 text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
            aria-label={wakeLockActive ? "Disable Keep Screen On" : "Enable Keep Screen On"}
            title={wakeLockActive ? "Disable Keep Screen On" : "Enable Keep Screen On"}
          >
            {wakeLockActive ? <FaLightbulb className="text-2xl sm:text-3xl" /> : <FaRegLightbulb className="text-2xl sm:text-3xl" />}
          </button>
          
          <div className="relative z-10 w-[1px] h-6 bg-gray-200 shrink-0 mx-0.5"></div>
          
          {/* 🌟 A- / A+ Controls (Integrated inside the floating bar) */}
          <div className="relative z-10 flex items-center bg-gray-50 border border-gray-100 rounded-xl px-1 h-9 sm:h-10 shrink-0">
            <button onClick={() => { triggerHaptic(); setFontSize(prev => Math.max(14, prev - 2)); }} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:text-black font-bold font-serif text-sm">A-</button>
            <div className="w-px h-4 bg-gray-200"></div>
            <button onClick={() => { triggerHaptic(); setFontSize(prev => Math.min(40, prev + 2)); }} className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center text-gray-600 hover:text-black font-bold font-serif text-sm">A+</button>
          </div>

          <div className="relative z-10 w-[1px] h-6 bg-gray-200 shrink-0 mx-0.5"></div>
          
          {/* 🌟 Secondary Small Icons */}
          <div className="relative z-10 shrink-0 text-gray-600 hover:text-gray-900">
            <SaveToSangrahButton slug={slug} title={title} />
          </div>
          
          {videoEmbedUrl && (
            <button 
              onClick={scrollToVideo} 
              className="relative z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-red-400"
              aria-label="Watch Video"
              title="Watch Video"
            >
              <FaYoutube className="text-lg sm:text-xl text-red-500" />
            </button>
          )}
          
          <button 
            onClick={handleWhatsAppShare} 
            className="relative z-10 flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-green-400"
            aria-label="Share on WhatsApp"
            title="Share on WhatsApp"
          >
            <FaWhatsapp className="text-lg sm:text-xl text-[#25D366]" />
          </button>

          <div className="relative z-10 shrink-0 ml-0.5">
            <PushPrompt />
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