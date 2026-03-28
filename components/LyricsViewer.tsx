"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  FaWhatsapp, FaHeart, FaRegHeart,
  FaLightbulb, FaRegLightbulb, FaMusic, FaYoutube, FaLanguage,
  FaChevronDown, FaCheck, FaFont
} from 'react-icons/fa6';
import PdfDownloadButton from './PdfDownloadButton';
import FeatureHighlight from './FeatureHighlight';

// 🌟 THE FIX: Imported directly so the Service Worker cannot block it!
// @ts-ignore
import Sanscript from 'sanscript';
import ManualAdUnit from './ManualAdUnit';

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
  { id: 'font-hindi', name: 'Hind (Standard)', className: 'font-hindi' },
  { id: 'font-noto-serif', name: 'Noto Serif (Granth)', className: 'font-noto-serif' },
  { id: 'font-amita', name: 'Amita (Calligraphy)', className: 'font-amita' },
  { id: 'font-poppins', name: 'Poppins (Modern)', className: 'font-poppins' },
  { id: 'font-kalam', name: 'Kalam (Diary)', className: 'font-kalam' },
];

// 🌟 OPTIMIZED INSTAGRAM EMBED (Safe Lazy Load)
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
    <div ref={containerRef} className="mt-10 flex justify-center w-full min-h-[450px]">
      {isIntersecting ? (
        <div className="bg-white p-2 rounded-3xl shadow-md border border-orange-100 w-full max-w-[400px] overflow-hidden flex justify-center">
          <blockquote
            className="instagram-media"
            data-instgrm-permalink={`https://www.instagram.com/p/${embedId}/?utm_source=ig_embed`}
            data-instgrm-version="14"
            style={{ background: '#FFF', border: '0', borderRadius: '16px', margin: '0', maxWidth: '400px', minWidth: '300px', padding: '0', width: '100%' }}
          >
            <div className="p-8 text-center text-gray-500 text-sm font-medium animate-pulse">Loading Instagram Post...</div>
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

  const videoRef = useRef<HTMLDivElement>(null);
  const scriptDropdownRef = useRef<HTMLDivElement>(null);
  const fontDropdownRef = useRef<HTMLDivElement>(null);
  const wakeLockRef = useRef<any>(null);

  useEffect(() => {
    setFontSize(window.innerWidth < 768 ? 18 : 22);
    const savedFavorites = JSON.parse(localStorage.getItem('bhajan_favorites') || '[]');
    if (savedFavorites.some((fav: any) => fav.slug === slug)) setIsFavorite(true);
    const savedFont = localStorage.getItem('preferred_lyrics_font');
    if (savedFont) setSelectedFont(savedFont);
  }, [slug]);

  const triggerHaptic = useCallback(() => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30); 
  }, []);

  // 🌟 BULLETPROOF TRANSLITERATION LOGIC (No Promises, No Waiting)
  const displayLyrics = useMemo(() => {
    if (activeScript === 'devanagari') return lyricsHindi;
    if (activeScript === 'hinglish' && lyricsHinglish) return lyricsHinglish;
    
    try {
      const from = 'devanagari';
      const to = activeScript === 'hinglish' ? 'iast' : activeScript;
      return Sanscript.t(lyricsHindi, from, to);
    } catch (e) { 
      console.error("Transliteration Error:", e);
      return lyricsHindi; 
    }
  }, [activeScript, lyricsHindi, lyricsHinglish]);

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

  const changeFont = (fontClass: string) => {
    triggerHaptic();
    setSelectedFont(fontClass);
    localStorage.setItem('preferred_lyrics_font', fontClass);
    setIsFontMenuOpen(false);
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
    <div className="relative pb-28">
      {tarz && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2.5 bg-orange-100/80 border border-orange-200 text-orange-900 px-6 py-3 rounded-full shadow-sm">
            <FaMusic className="text-orange-600 animate-pulse text-sm" />
            <p className="text-sm md:text-base font-medium">
              <span className="font-bold font-hindi text-orange-800">तर्ज:</span> <span className="font-hindi">{tarz}</span>
            </p>
          </div>
        </div>
      )}

      {/* ACTION BAR */}
      <div className="flex flex-row flex-wrap items-center justify-center gap-3 mb-8 relative z-20 w-full max-w-3xl mx-auto px-4">
        <div className="relative flex-1 min-w-[140px]" ref={scriptDropdownRef}>
          <button type="button" aria-label="Select Language" onClick={() => { triggerHaptic(); setIsDropdownOpen(!isDropdownOpen); setIsFontMenuOpen(false); }} className="flex items-center justify-between w-full gap-2 bg-white hover:bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2 overflow-hidden">
              <FaLanguage className="text-orange-500 text-lg shrink-0" />
              <span className="text-gray-800 font-bold text-sm truncate">{SCRIPT_OPTIONS.find(opt => opt.id === activeScript)?.label}</span>
            </div>
            <FaChevronDown className={`text-orange-400 text-xs shrink-0 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>
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
          <button type="button" aria-label="Select Font" onClick={() => { triggerHaptic(); setIsFontMenuOpen(!isFontMenuOpen); setIsDropdownOpen(false); }} className="flex items-center justify-between w-full gap-2 bg-white hover:bg-orange-50 border border-orange-100 px-4 py-2.5 rounded-xl shadow-sm transition-all duration-200">
            <div className="flex items-center gap-2 overflow-hidden">
              <FaFont className="text-orange-500 text-sm shrink-0" />
              <span className="text-gray-800 font-bold text-sm truncate">{FONT_OPTIONS.find(f => f.className === selectedFont)?.name.split(' ')[0]}</span>
            </div>
            <FaChevronDown className={`text-orange-400 text-xs shrink-0 transition-transform duration-300 ${isFontMenuOpen ? 'rotate-180' : ''}`} />
          </button>
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

      {/* LYRICS CONTAINER */}
      <div className="bg-orange-50/30 rounded-3xl p-6 md:p-12 border border-orange-100/50 relative overflow-hidden shadow-sm select-none transition-all duration-300 hover:shadow-md" onDoubleClick={handleDoubleTap}>
        
        {/* Background Watermark & Heart */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-6xl md:text-9xl font-black rotate-[-45deg] whitespace-nowrap uppercase tracking-tighter">Hindi Bhajan Manjari</span>
        </div>
        <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none transition-all duration-300 z-50 ${showBigHeart ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}>
          <FaHeart className="text-red-500 text-[120px] md:text-[180px] drop-shadow-[0_0_40px_rgba(239,68,68,0.5)]" />
        </div>
        
        <div className={`relative z-10 text-center font-bold tracking-normal text-gray-900 antialiased leading-relaxed ${selectedFont}`} style={{ fontSize: `${fontSize}px` }}>
          
          {String(displayLyrics).split(/\n\s*\n/).map((stanza: string, index: number, array: string[]) => {
            
            const shouldShowAd = index === 1 || (index > 2 && (index - 1) % 5 === 0);
            const adCount = Math.floor((index - 1) / 5) + 1;
            const isAllowedAd = shouldShowAd && adCount <= 3;

            return (
              <div key={index} className="flex flex-col items-center w-full">
                <p className="whitespace-pre-wrap w-full">{stanza.trim()}</p>
                
                {/* 🌟 THE BULLETPROOF FORMATTING FIX 🌟 */}
                {/* हम इस सॉफ्ट लाइन को हमेशा रेंडर करेंगे ताकि लेआउट कभी न टूटे */}
                {index < array.length - 1 && (
                  <div className={`flex items-center justify-center opacity-60 w-full ${isAllowedAd ? 'pt-6 md:pt-8 pb-2' : 'py-6 md:py-8'}`}>
                    <div className="w-3/4 md:w-1/2 max-w-md h-[1px] bg-gradient-to-r from-transparent via-orange-300 to-transparent"></div>
                  </div>
                )}

                {/* 🌟 AD UNIT 🌟 */}
                {/* अगर ऐड आएगा, तो वह लाइन के ठीक नीचे एक प्रोफेशनल स्पॉन्सर ब्रेक की तरह दिखेगा।
                    अगर ऐड खाली रहता है, तो यह गायब हो जाएगा और हमारी ऊपर वाली लाइन फॉर्मेटिंग को बचा लेगी! */}
                {isAllowedAd && index < array.length - 1 && (
                  <div className="w-full mb-4 md:mb-6">
                    <ManualAdUnit />
                  </div>
                )}
              </div>
            );
          })}

        </div>
      </div>

      {/* MEDIA PLAYERS */}
      <div ref={videoRef} className="scroll-mt-24">
        {embedType === 'youtube' && embedId && (
          <div className="mt-10 rounded-3xl overflow-hidden shadow-md border border-orange-100 bg-white p-2">
            <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 group">
              {!isVideoPlaying ? (
                <div className="w-full h-full cursor-pointer relative" onClick={() => setIsVideoPlaying(true)}>
                  <img src={`https://img.youtube.com/vi/${embedId}/maxresdefault.jpg`} alt={`${title} Video`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90" onError={(e) => { (e.target as HTMLImageElement).src = `https://img.youtube.com/vi/${embedId}/hqdefault.jpg`; }} />
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
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-max max-w-[95vw]">
        <div className="relative px-4 py-2.5 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full">
          <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-0">
            <div className="absolute top-0 left-0 h-[3px] bg-orange-500 transition-all duration-150 ease-out opacity-80" style={{ width: `${scrollProgress}%` }}></div>
          </div>
          <div className="relative z-10 flex items-center gap-2 sm:gap-4">
            
            <FeatureHighlight featureId="wake_lock" title="Keep Screen On" description="Stop your phone from sleeping while you sing." position="top" delay={20000}>
              <button 
                onClick={toggleWakeLock} 
                className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shrink-0 ${wakeLockActive ? 'bg-yellow-100' : 'hover:bg-yellow-50'}`}
                aria-label={wakeLockActive ? "Disable Keep Screen On" : "Enable Keep Screen On"}
                title={wakeLockActive ? "Disable Keep Screen On" : "Enable Keep Screen On"}
              >
                {wakeLockActive ? <FaLightbulb className="text-yellow-500 text-xl" /> : <FaRegLightbulb className="text-gray-500 text-xl hover:text-yellow-500" />}
              </button>
            </FeatureHighlight>
            
            <FeatureHighlight featureId="save_bhajan" title="Save to Sangrah" description="Bookmark this bhajan to easily find it later." position="top" delay={45000}>
              <button 
                onClick={() => toggleFavorite(true)} 
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors shrink-0"
                aria-label={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
              >
                {isFavorite ? <FaHeart className="text-red-500 text-xl transition-transform scale-110" /> : <FaRegHeart className="text-gray-500 text-xl hover:text-red-400" />}
              </button>
            </FeatureHighlight>
            
            <div className="w-[1px] h-6 bg-gray-300"></div>
            
            <FeatureHighlight featureId="font_size" title="Adjust Text Size" description="Make the lyrics larger or smaller for easy reading." position="top" delay={80000}>
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
            </FeatureHighlight>
            
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
    </div>
  );
}