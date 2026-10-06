"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  FaPenNib,
  FaArrowRight,
  FaPause,
  FaPlay,
  FaChevronLeft,
  FaChevronRight,
  FaChevronDown,
  FaChevronUp,
  FaRegCopy,
  FaCheck,
  FaWhatsapp,
  FaDownload, // 🌟 ADDED DOWNLOAD ICON
} from 'react-icons/fa';
import { GiFeather, GiLotusFlower } from 'react-icons/gi';
import * as htmlToImage from 'html-to-image'; // 🌟 ADDED IMAGE EXPORT LIB

interface Vichar {
  slug: string;
  title_hindi: string;
  quote_text: string;
}

/* ------------------------------------------------------------------ */
/* Tunables                                                           */
/* ------------------------------------------------------------------ */
const CLAMP_LINES = 6;          // visible lines before "पूरा पढ़ें" appears
const FADE_MS = 600;            // matches the 700ms CSS transition (as before)
const MIN_SLIDE_MS = 8000;      // shortest time a quote stays on screen
const MAX_SLIDE_MS = 20000;     // longest time (for very long quotes)
const TOUCH_PAUSE_MS = 10000;   // how long a touch pauses autoplay
const MAX_DOTS = 8;             // above this, show "3 / 12" instead of dots

/**
 * Font size tiers. Short quotes keep the original big size; longer quotes step
 * down, but never below 20px (mobile) / 26px (desktop).
 */
const getTextClasses = (text: string) => {
  const len = text.length;
  const lines = text.split('\n').length;

  if (len <= 110 && lines <= 3) {
    return 'text-2xl md:text-3xl lg:text-4xl leading-[1.6] md:leading-[1.8]';
  }
  if (len <= 260 && lines <= 5) {
    return 'text-[22px] md:text-[28px] lg:text-[32px] leading-[1.65] md:leading-[1.75]';
  }
  return 'text-xl md:text-[26px] lg:text-[28px] leading-[1.7] md:leading-[1.75]';
};

const getSlideDuration = (text: string) =>
  Math.min(MAX_SLIDE_MS, Math.max(MIN_SLIDE_MS, 4000 + (text?.length || 0) * 40));

const buildShareText = (v: Vichar) =>
  `${v.quote_text}\n\n— ${v.title_hindi}\n${window.location.origin}/mere-vichar/${v.slug}`;

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to legacy method */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

const iconBtn =
  'inline-flex items-center justify-center w-9 h-9 rounded-full border border-orange-100 dark:border-[#2a1d12] text-orange-600 dark:text-orange-400 bg-white/70 dark:bg-white/5 hover:bg-orange-50 dark:hover:bg-orange-900/30 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50';

const pillBtn =
  'inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-orange-100 dark:border-[#2a1d12] text-gray-700 dark:text-gray-200 bg-white/70 dark:bg-white/5 text-xs font-bold hover:bg-orange-50 dark:hover:bg-orange-900/30 hover:text-orange-600 dark:hover:text-orange-400 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50';

export default function VicharBanner({ vichars }: { vichars: Vichar[] }) {
  const count = vichars?.length ?? 0;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [clampable, setClampable] = useState<boolean[]>([]);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false); // 🌟 DOWNLOAD STATE

  // --- pause reasons ---
  const [manualPaused, setManualPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusedByKeyboard, setFocusedByKeyboard] = useState(false);
  const [touchPaused, setTouchPaused] = useState(false);
  const [selecting, setSelecting] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);
  const quoteCardRef = useRef<HTMLDivElement | null>(null); // 🌟 REF FOR IMAGE EXPORT
  const textRefs = useRef<(HTMLHeadingElement | null)[]>([]);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const safeIndex = count ? Math.min(currentIndex, count - 1) : 0;
  const autoplayEnabled = count > 1 && !reducedMotion;
  // 🌟 Pause autoplay while downloading so the slide doesn't change mid-export
  const paused =
    manualPaused || hovered || focusedByKeyboard || touchPaused || selecting || tabHidden || expanded || downloading;

  /* ---------------- navigation ---------------- */
  const goTo = useCallback(
    (target: number) => {
      if (count < 2 || fadeTimer.current || downloading) return; // Prevent change during download
      const next = ((target % count) + count) % count;
      if (next === safeIndex) return;

      const apply = () => {
        setCurrentIndex(next);
        setExpanded(false);
        setIsFading(false);
        fadeTimer.current = null;
      };

      if (reducedMotion) {
        apply();
        return;
      }
      setIsFading(true);
      fadeTimer.current = setTimeout(apply, FADE_MS);
    },
    [count, safeIndex, reducedMotion, downloading]
  );

  const goNext = useCallback(() => goTo(safeIndex + 1), [goTo, safeIndex]);
  const goPrev = useCallback(() => goTo(safeIndex - 1), [goTo, safeIndex]);

  /* ---------------- effects ---------------- */

  // prefers-reduced-motion
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  // pause when the tab is hidden
  useEffect(() => {
    const onVis = () => setTabHidden(document.hidden);
    onVis();
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // pause while the reader has text selected
  useEffect(() => {
    const onSelection = () => {
      const sel = document.getSelection();
      const root = rootRef.current;
      const active =
        !!sel && !sel.isCollapsed && !!root && !!sel.anchorNode && root.contains(sel.anchorNode);
      setSelecting(active);
    };
    document.addEventListener('selectionchange', onSelection);
    return () => document.removeEventListener('selectionchange', onSelection);
  }, []);

  // measure clamps
  const measure = useCallback(() => {
    setClampable((prev) => {
      const next = vichars.map((_, i) => {
        const el = textRefs.current[i];
        if (!el) return prev[i] ?? false;
        if (el.dataset.clamped !== 'true') return prev[i] ?? false;
        return el.scrollHeight > el.clientHeight + 1;
      });
      const same = next.length === prev.length && next.every((v, i) => v === prev[i]);
      return same ? prev : next;
    });
  }, [vichars]);

  useEffect(() => {
    if (!count) return;
    measure();
    const ro = new ResizeObserver(measure);
    if (rootRef.current) ro.observe(rootRef.current);
    if (document.fonts?.ready) document.fonts.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  }, [count, measure]);

  useEffect(() => {
    measure();
  }, [measure, expanded, safeIndex]);

  useEffect(() => {
    return () => {
      if (fadeTimer.current) clearTimeout(fadeTimer.current);
      if (touchTimer.current) clearTimeout(touchTimer.current);
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  /* ---------------- handlers ---------------- */
  const handleCopy = async () => {
    const ok = await copyToClipboard(buildShareText(vichars[safeIndex]));
    if (!ok) return;
    setCopied(true);
    if (copyTimer.current) clearTimeout(copyTimer.current);
    copyTimer.current = setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsApp = () => {
    const text = buildShareText(vichars[safeIndex]);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank', 'noopener,noreferrer');
  };

  // 🌟 NEW: THE IMAGE DOWNLOAD ENGINE
  const handleDownloadImage = async () => {
    if (!quoteCardRef.current || downloading) return;
    
    setDownloading(true);
    // Expand to show full text for the image if it was clamped
    const wasExpanded = expanded;
    if (!expanded && clampable[safeIndex]) {
      setExpanded(true);
      // Wait a tiny bit for the DOM to expand before capturing
      await new Promise((resolve) => setTimeout(resolve, 100)); 
    }

    try {
      const dataUrl = await htmlToImage.toPng(quoteCardRef.current, {
        quality: 1.0,
        pixelRatio: 2, // High resolution for Retina displays
        // Optionally filter out buttons from the image itself
        filter: (node) => {
           if (node.classList?.contains('hide-in-export')) return false;
           return true;
        },
        style: {
          // Force a slight background if it's transparent in dark mode
          backgroundColor: document.documentElement.classList.contains('dark') ? '#0c0804' : '#ffffff',
          borderRadius: '2rem',
          margin: '0',
          transform: 'none',
        }
      });

      // Trigger automatic download
      const link = document.createElement('a');
      link.download = `Vichar-${vichars[safeIndex].slug}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('Unable to generate image. Please try again.');
    } finally {
      // Revert expansion state if we forced it open
      if (!wasExpanded && clampable[safeIndex]) {
         setExpanded(false);
      }
      setDownloading(false);
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
    setTouchPaused(true);
    if (touchTimer.current) clearTimeout(touchTimer.current);
    touchTimer.current = setTimeout(() => setTouchPaused(false), TOUCH_PAUSE_MS);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start || count < 2) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - start.x;
    const dy = t.clientY - start.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      dx < 0 ? goNext() : goPrev();
    }
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (count < 2) return;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    }
  };

  if (!vichars || count === 0) return null;

  const currentVichar = vichars[safeIndex];

  return (
    <div className="w-full mb-8 md:mb-12">
      <div
        ref={rootRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="मेरी कलम से — विचार"
        onKeyDown={onKeyDown}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onPointerEnter={(e) => e.pointerType === 'mouse' && setHovered(true)}
        onPointerLeave={(e) => e.pointerType === 'mouse' && setHovered(false)}
        onFocus={(e) => {
          if ((e.target as HTMLElement).matches(':focus-visible')) setFocusedByKeyboard(true);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocusedByKeyboard(false);
        }}
        // 🌟 ADDED REF HERE FOR IMAGE CAPTURE
        ref={quoteCardRef} 
        className="relative overflow-hidden bg-white dark:bg-[#0c0804] rounded-[2rem] md:rounded-[2.5rem] border border-orange-100 dark:border-[#2a1d12] shadow-sm hover:shadow-md dark:shadow-none group transition-all duration-300"
      >

        {/* Backgrounds & Icons */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-950/20 dark:to-transparent pointer-events-none" />
        <GiLotusFlower className="absolute -top-10 -left-10 text-[160px] md:text-[180px] text-orange-500/5 dark:text-orange-500/10 rotate-[-20deg] pointer-events-none" />
        <GiFeather className="absolute -bottom-10 -right-4 text-[130px] md:text-[150px] text-orange-500/5 dark:text-orange-500/10 rotate-[20deg] pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center p-6 sm:p-8 md:p-12 pb-8 text-center min-h-[300px] md:min-h-[320px]">

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100/50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/50 mb-6 shadow-sm">
            <FaPenNib size={12} />
            <span className="text-[10px] font-black uppercase tracking-widest">मेरी कलम से</span>
          </div>

          <div
            className="grid w-full max-w-3xl mx-auto items-center"
            aria-live={autoplayEnabled && !paused ? 'off' : 'polite'}
          >
            {vichars.map((vichar, index) => {
              const isCurrent = index === safeIndex;
              const isActive = isCurrent && !isFading;
              const isExpandedHere = isCurrent && expanded;
              const isClamped = !isExpandedHere;
              const overflowing = !!clampable[index];
              const showFade = isClamped && overflowing;

              return (
                <div
                  key={vichar.slug}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${index + 1} / ${count}`}
                  aria-hidden={!isActive}
                  className={`col-start-1 row-start-1 flex flex-col items-center justify-center transition-all duration-700 transform motion-reduce:transition-none ${
                    isActive
                      ? 'opacity-100 scale-100 blur-0 z-10 pointer-events-auto select-text'
                      : 'opacity-0 scale-95 blur-sm motion-reduce:scale-100 motion-reduce:blur-0 z-0 pointer-events-none select-none'
                  }`}
                >
                  <h3
                    ref={(el) => {
                      textRefs.current[index] = el;
                    }}
                    data-clamped={isClamped ? 'true' : 'false'}
                    className={`${getTextClasses(vichar.quote_text || '')} font-black text-gray-800 dark:text-gray-100 font-hindi whitespace-pre-line text-center w-full ${
                      isClamped ? 'vichar-clamp' : ''
                    } ${showFade ? 'vichar-fade' : ''}`}
                  >
                    {vichar.quote_text}
                  </h3>

                  {/* Hide expanding button in the final exported image */}
                  {(overflowing || isExpandedHere) && (
                    <button
                      type="button"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => setExpanded((v) => !v)}
                      aria-expanded={isExpandedHere}
                      className="hide-in-export mt-3 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-100/50 dark:bg-orange-900/30 border border-orange-200/50 dark:border-orange-800/50 hover:bg-orange-100 dark:hover:bg-orange-900/50 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50"
                    >
                      {isExpandedHere ? (
                        <>कम दिखाएँ <FaChevronUp size={10} /></>
                      ) : (
                        <>पूरा पढ़ें <FaChevronDown size={10} /></>
                      )}
                    </button>
                  )}

                  <p className="mt-4 text-orange-500 font-bold text-sm tracking-wide">
                    — {vichar.title_hindi} —
                  </p>
                </div>
              );
            })}
          </div>

          {/* Actions - Hidden from the final PNG image to make it clean */}
          <div
            className={`hide-in-export mt-8 flex flex-wrap items-center justify-center gap-3 transition-all duration-700 delay-200 motion-reduce:transition-none ${
              isFading ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
            }`}
          >
            <Link
              href={`/mere-vichar/${currentVichar.slug}`}
              className="inline-flex items-center gap-3 px-6 md:px-8 py-3 md:py-3.5 rounded-2xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold text-xs md:text-sm hover:bg-orange-600 dark:hover:bg-orange-500 hover:text-white dark:hover:text-white hover:shadow-[0_8px_25px_rgba(234,88,12,0.4)] transition-all duration-300 hover:-translate-y-1"
            >
              संपूर्ण भावार्थ पढ़ें <FaArrowRight size={12} className="md:w-3.5 md:h-3.5" />
            </Link>

            <button type="button" onClick={handleCopy} className={pillBtn} aria-label="विचार कॉपी करें">
              {copied ? <FaCheck size={12} className="text-green-600" /> : <FaRegCopy size={12} />}
              <span>{copied ? 'कॉपी हो गया' : 'कॉपी'}</span>
            </button>

            <button type="button" onClick={handleWhatsApp} className={pillBtn} aria-label="WhatsApp पर शेयर करें">
              <FaWhatsapp size={14} className="text-green-600" />
              <span className="hidden sm:inline">शेयर</span>
            </button>

            {/* 🌟 NEW DOWNLOAD BUTTON */}
            <button 
              type="button" 
              onClick={handleDownloadImage} 
              disabled={downloading}
              className={`${pillBtn} ${downloading ? 'opacity-50 cursor-wait' : ''}`} 
              aria-label="इमेज डाउनलोड करें"
            >
              <FaDownload size={12} className={downloading ? 'animate-bounce text-orange-500' : 'text-orange-500'} />
              <span className="hidden sm:inline">{downloading ? '...' : 'सेव'}</span>
            </button>

          </div>

          {/* Carousel controls - Hidden from the exported image */}
          {count > 1 && (
            <div className="hide-in-export mt-5 flex items-center justify-center gap-2">
              <button type="button" onClick={goPrev} className={iconBtn} aria-label="पिछला विचार">
                <FaChevronLeft size={12} />
              </button>

              {count <= MAX_DOTS ? (
                <div className="flex items-center">
                  {vichars.map((v, i) => (
                    <button
                      key={v.slug}
                      type="button"
                      onClick={() => goTo(i)}
                      aria-label={`विचार ${i + 1}`}
                      aria-current={i === safeIndex}
                      className="p-2 outline-none focus-visible:ring-2 focus-visible:ring-orange-500/50 rounded-full"
                    >
                      <span
                        className={`block h-2 rounded-full transition-all duration-300 ${
                          i === safeIndex
                            ? 'w-6 bg-orange-500'
                            : 'w-2 bg-orange-200 dark:bg-orange-900/60'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              ) : (
                <span className="px-3 text-xs font-bold text-gray-500 dark:text-gray-400 tabular-nums">
                  {safeIndex + 1} / {count}
                </span>
              )}

              <button type="button" onClick={goNext} className={iconBtn} aria-label="अगला विचार">
                <FaChevronRight size={12} />
              </button>

              {autoplayEnabled && (
                <button
                  type="button"
                  onClick={() => setManualPaused((v) => !v)}
                  className={`${iconBtn} ml-2`}
                  aria-label={manualPaused ? 'ऑटो-स्लाइड चलाएँ' : 'ऑटो-स्लाइड रोकें'}
                  aria-pressed={manualPaused}
                >
                  {manualPaused ? <FaPlay size={11} /> : <FaPause size={11} />}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Progress bar */}
        {autoplayEnabled && (
          <div className="hide-in-export absolute bottom-0 left-0 h-1 bg-gray-100 dark:bg-gray-800/50 w-full" aria-hidden="true">
            <div
              key={safeIndex}
              className="h-full bg-orange-500"
              style={{
                animation: `vicharProgress ${getSlideDuration(currentVichar.quote_text)}ms linear forwards`,
                animationPlayState: paused ? 'paused' : 'running',
              }}
              onAnimationEnd={goNext}
            />
          </div>
        )}

        <style>{`
          @keyframes vicharProgress {
            from { width: 0%; }
            to { width: 100%; }
          }
          .vichar-clamp {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: ${CLAMP_LINES};
            overflow: hidden;
          }
          .vichar-fade {
            -webkit-mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
            mask-image: linear-gradient(to bottom, #000 70%, transparent 100%);
          }
        `}</style>
      </div>
    </div>
  );
}