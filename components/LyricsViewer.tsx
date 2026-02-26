"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  FaWhatsapp, FaHeart, FaRegHeart, FaLanguage,
  FaLightbulb, FaRegLightbulb, FaMusic, FaYoutube 
} from 'react-icons/fa';

interface LyricsViewerProps {
  title: string;
  lyricsHindi: string;
  lyricsHinglish?: string | null;
  slug: string;
  videoEmbedUrl?: string | null;
  tarz?: string | null;
}

export default function LyricsViewer({ 
  title, lyricsHindi, lyricsHinglish, slug, videoEmbedUrl, tarz 
}: LyricsViewerProps) {
  
  const [fontSize, setFontSize] = useState(20);
  const [pageUrl, setPageUrl] = useState("");
  const [isFavorite, setIsFavorite] = useState(false);
  const [language, setLanguage] = useState<'hindi' | 'hinglish'>('hindi');
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // --- WAKE LOCK LOGIC ---
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

  // --- STANDARD LOGIC ---
  useEffect(() => {
    setPageUrl(window.location.href);
    const savedFavorites = JSON.parse(localStorage.getItem('bhajan_favorites') || '[]');
    if (savedFavorites.some((fav: any) => fav.slug === slug)) setIsFavorite(true);
  }, [slug]);

  const toggleFavorite = () => {
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

  const currentLyrics = language === 'hinglish' && lyricsHinglish ? lyricsHinglish : lyricsHindi;
  // --- UPDATED SHARING LOGIC ---
  const getShareableText = () => {
    // 1. Get first 4 lines of current lyrics as a teaser
    const lyricsLines = currentLyrics.split('\n').filter(line => line.trim() !== "");
    const teaser = lyricsLines.slice(0, 4).join('\n');
    
    // 2. Beautiful Hindi Message
    const message = `✨ *${title}* ✨\n\n${teaser}\n...\n\n📖 *पूरा भजन पढ़ने के लिए नीचे लिंक पर क्लिक करें:* \n👇👇👇\n${pageUrl}\n\n🙏 *हिंदी भजन मंजरी* - भजनों का अनमोल संग्रह`;
    
    return message;
  };

  const handleWhatsAppShare = async () => {
    const message = getShareableText();
    
    // 1. Try Native Mobile Sharing
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: message,
          // Note: We don't necessarily need 'url' here because 
          // getShareableText() already includes the link in the text.
        });
        return; 
      } catch (err: unknown) {
        // Type guard to check if err is an Error object
        if (err instanceof Error && err.name === 'AbortError') {
          return;
        }
        // If it's a real error (not just a cancel), we fall through to the fallback
      }
    }

    // 2. Fallback for Desktop (Direct WhatsApp Link)
    const whatsappUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'hindi' ? 'hinglish' : 'hindi');
  };

  // --- SMART MEDIA EXTRACTION ---
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

  return (
    <div className="relative pb-4">
      
      {/* --- TARZ / TUNE REFERENCE --- */}
      {tarz && (
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center gap-2.5 bg-orange-100/80 border border-orange-200 text-orange-900 px-6 py-3 rounded-full shadow-sm">
            <FaMusic className="text-orange-600 animate-pulse text-sm" />
            <p className="text-sm md:text-base font-medium">
              <span className="font-bold text-orange-800">तर्ज (Tune):</span> {tarz}
            </p>
          </div>
        </div>
      )}

      {/* --- 1. THE LYRICS --- */}
      <div className="bg-orange-50/30 rounded-3xl p-6 md:p-12 border border-orange-100/50 relative overflow-hidden shadow-sm">
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.02] pointer-events-none select-none">
          <span className="text-6xl md:text-9xl font-black rotate-[-45deg] whitespace-nowrap">HINDI BHAJAN</span>
        </div>

        <pre 
          className="whitespace-pre-wrap font-sans leading-[1.8] text-gray-800 text-center drop-shadow-sm transition-opacity duration-300 ease-in-out select-none relative z-10"
          style={{ fontSize: `${fontSize}px` }} 
        >
          {currentLyrics}
        </pre>
      </div>

      {/* --- 2. MEDIA PLAYERS --- */}
      {embedType === 'youtube' && embedId && (
        <div className="mt-10 rounded-3xl overflow-hidden shadow-md border border-orange-100 bg-white p-2">
          <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-gray-900 group">
            
            {/* 🌟 CUSTOM LIGHTWEIGHT YOUTUBE FACADE */}
            {!isVideoPlaying ? (
              <div 
                className="w-full h-full cursor-pointer relative"
                onClick={() => setIsVideoPlaying(true)}
              >
                <img 
                  src={`https://img.youtube.com/vi/${embedId}/maxresdefault.jpg`} 
                  alt={`${title} Video`} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-all">
                  <FaYoutube className="text-red-600 text-6xl md:text-7xl drop-shadow-[0_4px_15px_rgba(0,0,0,0.6)] transition-transform duration-300 group-hover:scale-110" />
                </div>
              </div>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${embedId}?autoplay=1&rel=0`}
                title={`${title} Video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute top-0 left-0 w-full h-full border-0"
              ></iframe>
            )}

          </div>
        </div>
      )}

      {embedType === 'instagram' && embedId && (
        <div className="mt-10 flex justify-center">
          <div className="bg-white p-2 rounded-3xl shadow-md border border-orange-100 w-full max-w-[400px]">
            <iframe
              src={`https://www.instagram.com/p/${embedId}/embed/captioned/`}
              className="w-full h-[600px] rounded-2xl border-0"
              scrolling="no"
              allowTransparency={true}
              allow="encrypted-media"
              loading="lazy" 
            ></iframe>
          </div>
        </div>
      )}

      {/* --- 3. FLOATING TOOLBAR --- */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 sm:gap-4 px-4 py-2.5 bg-white/90 backdrop-blur-xl border border-gray-200 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full w-max max-w-[95vw]">
        
        <button 
          onClick={toggleWakeLock} 
          title="Keep Screen On"
          className={`w-10 h-10 flex items-center justify-center rounded-full transition-colors shrink-0 ${wakeLockActive ? 'bg-yellow-100' : 'hover:bg-yellow-50'}`}
        >
          {wakeLockActive ? (
            <FaLightbulb className="text-yellow-500 text-xl" />
          ) : (
            <FaRegLightbulb className="text-gray-500 text-xl hover:text-yellow-500" />
          )}
        </button>

        <button onClick={toggleFavorite} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-red-50 transition-colors shrink-0">
          {isFavorite ? <FaHeart className="text-red-500 text-xl transition-transform scale-110" /> : <FaRegHeart className="text-gray-500 text-xl hover:text-red-400" />}
        </button>

        {lyricsHinglish && (
          <button 
            onClick={toggleLanguage} 
            className="flex items-center justify-center gap-1.5 px-3 h-10 rounded-full hover:bg-orange-50 text-orange-700 font-bold transition-colors text-sm shrink-0"
          >
            <FaLanguage className="text-lg" />
            <span>{language === 'hindi' ? 'EN' : 'हिं'}</span>
          </button>
        )}

        <div className="w-[1px] h-6 bg-gray-300"></div>

        <div className="flex items-center gap-1 shrink-0">
          <button 
            onClick={() => setFontSize(prev => Math.max(14, prev - 2))} 
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors rounded-full font-serif font-bold text-lg"
          >
            A-
          </button>
          <button 
            onClick={() => setFontSize(prev => Math.min(40, prev + 2))} 
            className="w-10 h-10 flex items-center justify-center text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors rounded-full font-serif font-bold text-lg"
          >
            A+
          </button>
        </div>

        <div className="w-[1px] h-6 bg-gray-300 hidden sm:block"></div>

        <button onClick={handleWhatsAppShare} className="flex items-center justify-center w-10 h-10 sm:w-auto sm:px-4 bg-[#25D366] text-white rounded-full hover:bg-[#20b858] font-bold shadow-md hover:-translate-y-0.5 transition-all shrink-0">
          <FaWhatsapp size={20} />
          <span className="hidden sm:inline ml-2">Share</span>
        </button>

      </div>
    </div>
  );
}