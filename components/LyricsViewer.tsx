"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  FaWhatsapp, FaHeart, FaRegHeart,
  FaLightbulb, FaRegLightbulb, FaMusic, FaYoutube, FaLanguage,
  FaChevronDown, FaCheck
} from 'react-icons/fa';
import PdfDownloadButton from './PdfDownloadButton';
// @ts-ignore
import Sanscript from 'sanscript';
import FeatureHighlight from './FeatureHighlight';

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

// 🌟 NEW: Bulletproof Instagram Embed Component
const InstagramEmbed = ({ embedId }: { embedId: string }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://www.instagram.com/embed.js';
    script.async = true;
    document.body.appendChild(script);
    
    if ((window as any).instgrm) {
      setTimeout(() => {
        (window as any).instgrm.Embeds.process();
      }, 0);
    }
  }, [embedId]);

  return (
    <div className="mt-10 flex justify-center w-full">
      <div className="bg-white p-2 rounded-3xl shadow-md border border-orange-100 w-full max-w-[400px] overflow-hidden flex justify-center">
        <blockquote
          className="instagram-media"
          data-instgrm-permalink={`https://www.instagram.com/p/${embedId}/?utm_source=ig_embed`}
          data-instgrm-version="14"
          style={{
            background: '#FFF',
            border: '0',
            borderRadius: '16px',
            margin: '0',
            maxWidth: '400px',
            minWidth: '300px',
            padding: '0',
            width: '100%'
          }}
        >
          <div className="p-8 text-center text-gray-400 text-sm font-medium animate-pulse">
            Loading Instagram Post...
          </div>
        </blockquote>
      </div>
    </div>
  );
};

export default function LyricsViewer({ 
  title, lyricsHindi, lyricsHinglish, slug, videoEmbedUrl, tarz 
}: LyricsViewerProps) {
  
 // 1. Set a standard fallback size for Server-Side Rendering (SSR)
  const [fontSize, setFontSize] = useState(20);

  // 2. 🌟 NEW: Detect screen size on load and set the perfect default
  useEffect(() => {
    // 768px is the standard breakpoint for tablets/desktops
    if (window.innerWidth < 768) {
      setFontSize(18); // Default size for Mobile phones
    } else {
      setFontSize(22); // Default size for Desktop and Tablets
    }
  }, []); // 🌟 Slightly larger default for readability
  const [pageUrl, setPageUrl] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  
  const [activeScript, setActiveScript] = useState<string>('devanagari');
  const [displayLyrics, setDisplayLyrics] = useState(lyricsHindi);
  
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBigHeart, setShowBigHeart] = useState(false);

  const triggerHaptic = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50); 
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight <= 0) return;
      
      const progress = Math.min(100, Math.max(0, (totalScroll / windowHeight) * 100));
      setScrollProgress(progress);
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleDoubleTap = () => {
    triggerHaptic();
    if (!isFavorite) {
      toggleFavorite(false); 
    }
    setShowBigHeart(true);
    setTimeout(() => setShowBigHeart(false), 1000); 
  };

  useEffect(() => {
    try {
      if (activeScript === 'devanagari') {
        setDisplayLyrics(lyricsHindi);
      } else if (activeScript === 'hinglish') {
        setDisplayLyrics(lyricsHinglish || Sanscript.t(lyricsHindi, 'devanagari', 'iast'));
      } else {
        setDisplayLyrics(Sanscript.t(lyricsHindi, 'devanagari', activeScript));
      }
    } catch (error) {
      setDisplayLyrics(lyricsHindi); 
    }
  }, [activeScript, lyricsHindi, lyricsHinglish]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [wakeLockActive, setWakeLockActive] = useState(false);
  const wakeLockRef = useRef<any>(null);

  const requestWakeLock = async () => {
    if (!('wakeLock' in navigator)) return; 
    try {
      wakeLockRef.current = await navigator.wakeLock.request('screen');
      setWakeLockActive(true);
      wakeLockRef.current.addEventListener('release', () => setWakeLockActive(false));
    } catch (err: any) {
      setWakeLockActive(false);
    }
  };

  useEffect(() => {
    requestWakeLock();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock();
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (wakeLockRef.current) wakeLockRef.current.release();
    };
  }, []);

  const toggleWakeLock = async () => {
    triggerHaptic(); 
    if (!('wakeLock' in navigator)) {
      alert("Wake Lock is not supported on this browser.");
      return;
    }
    if (wakeLockActive && wakeLockRef.current) {
      await wakeLockRef.current.release();
      wakeLockRef.current = null;
      setWakeLockActive(false);
    } else {
      await requestWakeLock();
    }
  };

  useEffect(() => {
    setPageUrl(window.location.href);
    const savedFavorites = JSON.parse(localStorage.getItem('bhajan_favorites') || '[]');
    if (savedFavorites.some((fav: any) => fav.slug === slug)) setIsFavorite(true);
  }, [slug]);

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

  const getShareableText = () => {
    const lyricsLines = displayLyrics.split('\n').filter(line => line.trim() !== "");
    const teaser = lyricsLines.slice(0, 4).join('\n');
    const message = `✨ *${title}* ✨\n\n${teaser}\n...\n\n📖 *पूरा भजन पढ़ने के लिए नीचे लिंक पर क्लिक करें:* \n👇👇👇\n${pageUrl}\n\n🙏 *हिंदी भजन मंजरी* - भजनों का अनमोल संग्रह`;
    return message;
  };

  const handleWhatsAppShare = async () => {
    triggerHaptic(); 
    const message = getShareableText();
    if (navigator.share) {
      try {
        await navigator.share({ title: title, text: message });
        return; 
      } catch (err: unknown) {
        if (err instanceof Error && err.name === 'AbortError') return;
      }
    }
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  let embedType = null;
  let embedId = null;

  if (videoEmbedUrl) {
    if (videoEmbedUrl.includes('youtube.com') || videoEmbedUrl.includes('youtu.be')) {
      embedType = 'youtube';
      const ytRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
      const match = videoEmbedUrl.match(ytRegex);
      embedId = (match && match[2].length === 11) ? match[2] : null;
    } else if (videoEmbedUrl.includes('instagram.com')) {
      embedType = 'instagram';
      const igRegex = /(?:instagram\.com.*\/p\/|instagram\.com.*\/reel\/|instagram\.com.*\/reels\/)([A-Za-z0-9_-]+)/i;
      const match = videoEmbedUrl.match(igRegex);
      embedId = match ? match[1] : null;
    }
  }

  const cleanHinglishTitle = slug.replace(/-/g, ' ').toUpperCase();

  return (
    <div className="relative pb-28">
      
      {/* --- TARZ / TUNE REFERENCE --- */}
      {tarz && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2.5 bg-orange-100/80 border border-orange-200 text-orange-900 px-6 py-3 rounded-full shadow-sm">
            <FaMusic className="text-orange-600 animate-pulse text-sm" />
            <p className="text-sm md:text-base font-medium">
              {/* 🌟 FIX: Injected font-hindi to properly render the Tarz text */}
              <span className="font-bold font-hindi text-orange-800">तर्ज (Tune):</span> <span className="font-hindi">{tarz}</span>
            </p>
          </div>
        </div>
      )}

      {/* 🌟 ACTION BAR */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 relative z-20 w-[90%] max-w-xs sm:max-w-none sm:w-full mx-auto">
        
        {/* CUSTOM DROPDOWN */}
        <div className="w-full sm:w-auto flex flex-col">
          <FeatureHighlight 
            featureId="language_switcher"
            title="Change Script"
            description="Read instantly in Gujarati, Bengali & more."
            position="bottom"
            delay={1000}
          >
            <div className="relative w-full" ref={dropdownRef}>
              <button 
                type="button"
                onClick={() => { triggerHaptic(); setIsDropdownOpen(!isDropdownOpen); }}
                className="flex items-center justify-between w-full sm:w-auto gap-3 bg-white hover:bg-orange-50 border border-orange-100 px-5 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center gap-2">
                  <FaLanguage className="text-orange-500 text-lg shrink-0" />
                  <span className="text-gray-800 font-bold text-sm">
                    {SCRIPT_OPTIONS.find(opt => opt.id === activeScript)?.label}
                  </span>
                </div>
                <FaChevronDown className={`text-orange-400 text-xs transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <div 
                className={`absolute top-full left-0 sm:-left-4 mt-2 w-full sm:w-56 bg-white border border-gray-100 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.08)] overflow-hidden transition-all duration-200 origin-top z-40 ${
                  isDropdownOpen ? 'opacity-100 scale-y-100 translate-y-0' : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                }`}
              >
                <div className="py-1.5 max-h-[60vh] overflow-y-auto hide-scrollbar">
                  {SCRIPT_OPTIONS.map((option) => (
                    <button
                      type="button"
                      key={option.id}
                      onClick={() => {
                        triggerHaptic();
                        setActiveScript(option.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${
                        activeScript === option.id 
                          ? 'bg-orange-50/80 text-orange-600' 
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                      }`}
                    >
                      {option.label}
                      {activeScript === option.id && <FaCheck className="text-orange-500 text-xs" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </FeatureHighlight>
        </div>
        
        {/* Dynamic PDF Download */}
        <div className="w-full sm:w-auto flex flex-col [&>button]:w-full sm:[&>button]:w-auto [&>button]:justify-center">
          <PdfDownloadButton 
            titleHindi={title} 
            titleHinglish={cleanHinglishTitle} 
            lyricsHindi={displayLyrics} 
          />
        </div>
      </div>

      {/* --- 1. THE LYRICS --- */}
      <div 
        className="bg-orange-50/30 rounded-3xl p-6 md:p-12 border border-orange-100/50 relative overflow-hidden shadow-sm select-none transition-all duration-300 hover:shadow-md"
        onDoubleClick={handleDoubleTap}
      >
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-6xl md:text-9xl font-black rotate-[-45deg] whitespace-nowrap">HINDI BHAJAN</span>
        </div>

        {/* INSTAGRAM-STYLE GLOWING HEART OVERLAY */}
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-300 z-50 ${showBigHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <FaHeart className="text-red-500 text-[120px] md:text-[180px] drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]" />
        </div>

        {/* 🌟 CHANGED: font-medium is now font-bold */}
        {/* 🌟 UPGRADED: Lyrics split into Stanzas with elegant dividers */}
        <div 
          className="relative z-10 transition-all duration-300 ease-in-out text-center font-hindi font-bold tracking-normal text-gray-900 antialiased leading-relaxed"
          style={{ fontSize: `${fontSize}px` }}
        >
          {displayLyrics.split(/\n\s*\n/).map((stanza, index, array) => (
            <div key={index}>
              {/* Individual Stanza */}
              <p className="whitespace-pre-wrap">{stanza.trim()}</p>
              
              {/* Elegant Divider (Only shows between stanzas, not after the last one) */}
              {index < array.length - 1 && (
                <div className="flex items-center justify-center py-6 md:py-8 opacity-60">
                  {/* 🌟 CHANGED: Width is now much longer (w-3/4 on mobile, md:w-1/2 on desktop) */}
                  <div className="w-3/4 md:w-1/2 max-w-md h-[1px] bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* --- 2. MEDIA PLAYERS --- */}
      {embedType === 'youtube' && embedId && (
        <div className="mt-10 rounded-3xl overflow-hidden shadow-md border border-orange-100 bg-white p-2">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 group">
            {!isVideoPlaying ? (
              <div className="w-full h-full cursor-pointer relative" onClick={() => setIsVideoPlaying(true)}>
                <img 
                  src={`https://img.youtube.com/vi/${embedId}/maxresdefault.jpg`} 
                  alt={`${title} Video`} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`;
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-all">
                  <FaYoutube className="text-red-600 text-6xl md:text-7xl drop-shadow-[0_4px_15px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
            ) : (
              <iframe src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`} title={`${title} Video`} allowFullScreen className="absolute top-0 left-0 w-full h-full border-0"></iframe>
            )}
          </div>
        </div>
      )}

      {embedType === 'instagram' && embedId && (
        <InstagramEmbed embedId={embedId} />
      )}

      {/* --- 3. FLOATING TOOLBAR --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[95vw]">
        
        <div className="relative px-4 py-2.5 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full">
          
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0">
            <div 
              className="absolute top-0 left-0 h-[3px] bg-orange-500 transition-all duration-150 ease-out opacity-80"
              style={{ width: `${scrollProgress}%` }}
            ></div>
          </div>

          <div className="relative z-10 flex items-center gap-2 sm:gap-4">
            
            <FeatureHighlight featureId="wake_lock" title="Keep Screen On" description="Stop your phone from sleeping while you sing." position="top" delay={20000}>
              <button onClick={toggleWakeLock} className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shrink-0 ${wakeLockActive ? 'bg-yellow-100' : 'hover:bg-yellow-50'}`}>
                {wakeLockActive ? <FaLightbulb className="text-yellow-500 text-xl" /> : <FaRegLightbulb className="text-gray-500 text-xl hover:text-yellow-500" />}
              </button>
            </FeatureHighlight>

            <FeatureHighlight featureId="save_bhajan" title="Save to Sangrah" description="Bookmark this bhajan to easily find it later." position="top" delay={45000}>
              <button onClick={() => toggleFavorite(true)} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors shrink-0">
                {isFavorite ? <FaHeart className="text-red-500 text-xl transition-transform scale-110" /> : <FaRegHeart className="text-gray-500 text-xl hover:text-red-400" />}
              </button>
            </FeatureHighlight>

            <div className="w-[1px] h-6 bg-gray-300"></div>

            <FeatureHighlight featureId="font_size" title="Adjust Text Size" description="Make the lyrics larger or smaller for easy reading." position="top" delay={80000}>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => { triggerHaptic(); setFontSize(prev => Math.max(14, prev - 2)); }} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors rounded-full font-serif font-bold text-lg">A-</button>
                <button onClick={() => { triggerHaptic(); setFontSize(prev => Math.min(40, prev + 2)); }} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors rounded-full font-serif font-bold text-lg">A+</button>
              </div>
            </FeatureHighlight>

            <div className="w-[1px] h-6 bg-gray-300 hidden sm:block"></div>

            <button onClick={handleWhatsAppShare} className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 bg-[#25D366] text-white rounded-full hover:bg-[#20b858] font-bold shadow-md hover:-translate-y-0.5 transition-all shrink-0">
              <FaWhatsapp size={20} />
              <span className="hidden sm:inline ml-2">Share</span>
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}