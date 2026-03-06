"use client";

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { GiLotusFlower } from 'react-icons/gi';
import {
  FaSearch, FaWhatsapp, FaPenNib, FaInstagram,
  FaFacebookF, FaHeart, FaChevronRight, FaBookOpen
} from 'react-icons/fa';
import dynamic from 'next/dynamic';
import { Hind } from 'next/font/google';
import { useLenis } from 'lenis/react'; // 🌟 1. Imported Lenis

// ─── Font ─────────────────────────────────────────────────────────────────────
const hind = Hind({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// ─── Constants (outside component — zero re-allocation on renders) ────────────
const NAV_LINKS = [
  { name: 'Home',    href: '/' },
  { name: 'Gyan',    href: '/gyan' },
  { name: 'Aarti',   href: '/category/aarti' },
  { name: 'Chalisa', href: '/category/chalisa' },
  { name: 'Pad',     href: '/category/pad' },
] as const;

const SOCIAL_LINKS = [
  {
    Icon: FaInstagram,
    href: 'https://www.instagram.com/imp.erfecto_?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==',
    label: 'Instagram',
    hoverColor: 'hover:text-pink-500',
  },
  {
    Icon: FaFacebookF,
    href: 'https://www.facebook.com/mohit.tarkar.7121/',
    label: 'Facebook',
    hoverColor: 'hover:text-blue-500',
  },
] as const;

// ─── Lazy SearchBar (zero cost on initial paint) ──────────────────────────────
const SearchBar = dynamic(() => import('./SearchBar'), { ssr: false });

// ─── Memoized: UtilityBar never needs to re-render ───────────────────────────
const UtilityBar = memo(function UtilityBar() {
  return (
    <div className="hidden md:block bg-gradient-to-r from-[#1a0a00] via-[#2c1200] to-[#1a0a00] border-b border-orange-900/30 relative z-50">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-600/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-9">
        <nav className="flex items-center gap-5 text-[11px] font-bold tracking-wider uppercase text-orange-100">
          <Link
            href="/saved"
            className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors duration-200"
          >
            <FaHeart size={10} /> My Sangrah
          </Link>
          <span className="w-px h-3 bg-orange-800" />
          <Link
            href="/submit"
            className="flex items-center gap-1.5 hover:text-white transition-colors duration-200"
          >
            <FaPenNib size={10} /> Submit Bhajan
          </Link>
          <span className="w-px h-3 bg-orange-800" />
          <Link href="/about"   className="hover:text-white transition-colors duration-200">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors duration-200">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map(({ Icon, href, label, hoverColor }) => (
            <a
              key={label}
              href={href}
              aria-label={label}
              className={`text-orange-200 ${hoverColor} transition-transform duration-300 hover:scale-110`}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Header() {
  const [isMenuOpen,   setIsMenuOpen]   = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  // Smart sticky states
  const [scrolled,     setScrolled]     = useState(false);
  const [isHidden,     setIsHidden]     = useState(false);
  const lastScrollY                     = useRef(0);

  const pathname       = usePathname();
  const closeMenuRef   = useRef<HTMLButtonElement>(null);
  const openMenuBtnRef = useRef<HTMLButtonElement>(null);
  const lenis          = useLenis(); // 🌟 Grab lenis instance for pause/play

  // ── Scroll detection (🌟 Lenis Optimized) ───────────────────────────────────
  useLenis(({ scroll }) => {
    // React's `useState` automatically bails out if the value hasn't changed,
    // making this extremely efficient inside the rAF loop.
    setScrolled(scroll > 10);

    // Smart sticky logic
    if (scroll < 120) {
      setIsHidden(false); 
    } else if (scroll > lastScrollY.current) {
      setIsHidden(true);  
    } else if (scroll < lastScrollY.current) {
      setIsHidden(false); 
    }
    
    lastScrollY.current = scroll;
  });

  // Ensure header isn't hidden if a user interacts with a dropdown
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) setIsHidden(false);
  }, [isMenuOpen, isSearchOpen]);

  // ── Body-scroll lock (🌟 Lenis Optimized) ────────────────────────────────────
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      lenis?.stop(); // Beautifully freezes the page without layout shifts!
    } else {
      lenis?.start();
    }
    
    // Cleanup if component unmounts
    return () => { lenis?.start(); };
  }, [isMenuOpen, isSearchOpen, lenis]);

  // ── Route change: close everything ──────────────────────────────────────────
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  // ── ESC key: close whichever layer is topmost ─────────────────────────────────
  useEffect(() => {
    if (!isMenuOpen && !isSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (isSearchOpen) { setIsSearchOpen(false); return; }
      if (isMenuOpen)   { setIsMenuOpen(false); openMenuBtnRef.current?.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [isMenuOpen, isSearchOpen]);

  // ── Focus management: move focus into drawer on open ────────────────────────
  useEffect(() => {
    if (isMenuOpen) {
      const id = setTimeout(() => closeMenuRef.current?.focus(), 50);
      return () => clearTimeout(id);
    }
  }, [isMenuOpen]);

  // ── Stable callbacks (no inline functions in JSX) ────────────────────────────
  const openSearch  = useCallback(() => setIsSearchOpen(true),  []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openMenu    = useCallback(() => setIsMenuOpen(true),    []);
  const closeMenu   = useCallback(() => setIsMenuOpen(false),   []);

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href)),
    [pathname],
  );

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <> 

      {/* 1 ── Top utility bar */}
      <UtilityBar />

      {/* 2 ── Smart Sticky main header */}
      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-in-out focus-within:translate-y-0 ${
          isHidden && !isSearchOpen && !isMenuOpen 
            ? '-translate-y-full' 
            : 'translate-y-0'
        } ${
          scrolled
            ? 'bg-white/95 backdrop-blur-xl shadow-md border-b border-orange-100/60'
            : 'bg-white border-b border-orange-100/80'
        }`}
      >

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link
              href="/"
              className="flex items-center gap-3 group shrink-0 select-none outline-none focus-visible:ring-2 focus-visible:ring-orange-500 rounded-lg"
              aria-label="HindiBhajan Manjari — Home"
            >
              <div
                className={`relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center origin-left transition-[transform,box-shadow] duration-300 group-hover:shadow-orange-500/50 group-hover:-rotate-6 will-change-transform w-11 h-11 ${
                  scrolled ? 'scale-[0.85]' : 'scale-100'
                }`}
              >
                <div className="absolute inset-0 rounded-xl bg-white/10" />
                <GiLotusFlower className="text-white relative z-10 text-2xl" />
              </div>

              <div className="flex flex-col leading-none">
                <span
                  className={`font-black tracking-tight text-gray-900 text-xl md:text-2xl origin-left inline-block transition-transform duration-300 ${
                    scrolled ? 'scale-[0.9]' : 'scale-100'
                  }`}
                >
                  HINDI<span className="text-orange-600">BHAJAN</span>
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 tracking-[0.3em] uppercase mt-0.5">
                  Manjari
                </span>
              </div>
            </Link>

            {/* ── Desktop nav ── */}
            <nav className="hidden lg:flex items-center gap-1 mx-6" aria-label="Primary navigation">
              {NAV_LINKS.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={`relative px-4 py-2 text-[14px] font-bold uppercase tracking-widest rounded-full transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                      active
                        ? 'text-orange-700 bg-orange-50 shadow-sm'
                        : 'text-gray-600 hover:text-orange-700 hover:bg-orange-50/50'
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span
                        aria-hidden="true"
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50"
                      />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Desktop actions ── */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              <button
                onClick={openSearch}
                aria-label="Open search"
                aria-expanded={isSearchOpen}
                aria-controls="search-panel"
                className="group w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
              >
                <FaSearch size={16} className="group-hover:scale-110 transition-transform" />
              </button>

              <div aria-hidden="true" className="w-px h-5 bg-gray-200 mx-1" />

              <Link
                href="/saved"
                aria-label="My Sangrah — saved bhajans"
                className="group w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-red-500"
              >
                <FaHeart size={16} className="group-hover:scale-110 transition-transform" />
              </Link>

              <a
                href="https://whatsapp.com/channel/0029VbBxMM7Ae5VutiItov27"
                target="_blank"
                rel="noopener noreferrer"
                className="group ml-1 flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/25 text-[#20b858] hover:bg-[#25D366] hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-[#25D366]/30 hover:-translate-y-0.5 px-4 py-2.5 rounded-full font-bold text-[14px] transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
              >
                <FaWhatsapp size={18} className="group-hover:scale-110 transition-transform" />
                Community
              </a>
            </div>

            {/* ── Mobile actions ── */}
            <div className="lg:hidden flex items-center gap-1">
              <button
                onClick={openSearch}
                aria-label="Open search"
                aria-expanded={isSearchOpen}
                aria-controls="search-panel"
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <FaSearch size={18} />
              </button>
              <Link
                href="/saved"
                aria-label="My Sangrah"
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <FaHeart size={18} />
              </Link>
              <button
                ref={openMenuBtnRef}
                onClick={openMenu}
                aria-label="Open navigation menu"
                aria-expanded={isMenuOpen}
                aria-controls="mobile-menu"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 transition-colors ml-1 shadow-md shadow-orange-600/25"
              >
                <HiMenuAlt3 size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Search panel ── */}
        <div
          id="search-panel"
          role="search"
          aria-hidden={!isSearchOpen}
          className={`absolute top-full inset-x-0 bg-white border-t border-orange-100 shadow-2xl z-50 transition-all duration-300 origin-top ${
            isSearchOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'
          }`}
        >
          <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
            <div className="relative">
              {isSearchOpen && <SearchBar onClose={closeSearch} />}
              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-900 transition-colors z-50 outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
              >
                <HiX size={18} />
              </button>
            </div>
            <p className="text-[12px] text-gray-500 mt-3 ml-2 font-medium tracking-wide">
              Press{' '}
              <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-mono text-[11px] border border-gray-200">
                ESC
              </kbd>{' '}
              to close
            </p>
          </div>
        </div>
      </header>

      {/* Search backdrop */}
      <div
        aria-hidden="true"
        onClick={closeSearch}
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300 ${
          isSearchOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 3 ── Mobile drawer: backdrop ── */}
      <div
        aria-hidden="true"
        onClick={closeMenu}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 3 ── Mobile drawer: panel ── */}
      <aside
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 h-full w-[85%] max-w-[360px] z-[120] lg:hidden flex flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] will-change-transform ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/30">
              <GiLotusFlower className="text-white text-lg" />
            </div>
            <span className="font-black text-gray-900 tracking-widest text-sm uppercase">Menu</span>
          </div>
          <button
            ref={closeMenuRef}
            onClick={closeMenu}
            aria-label="Close menu"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-gray-400"
          >
            <HiX size={20} />
          </button>
        </div>

        {/* Nav links */}
        <nav
          aria-label="Mobile primary navigation"
          data-lenis-prevent="true" /* 🌟 4. Prevents menu scroll from moving the background website! */
          className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-1.5 bg-gray-50/30"
        >
          {NAV_LINKS.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={closeMenu}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 active:scale-[0.98] ${
                  active
                    ? 'bg-orange-100/80 text-orange-700 shadow-sm border border-orange-200/50'
                    : 'text-gray-700 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm'
                }`}
              >
                <span>{link.name}</span>
                {active
                  ? <span aria-hidden="true" className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" />
                  : <FaChevronRight size={14} aria-hidden="true" className="text-gray-400" />
                }
              </Link>
            );
          })}

          <div aria-hidden="true" className="my-4 border-t border-gray-200/60 mx-2" />

          {[
            {
              href: '/saved',
              icon: <FaHeart size={16} />,
              iconBg: 'bg-red-100/80 text-red-500',
              label: 'My Sangrah',
            },
            {
              href: '/gyan',
              icon: <FaBookOpen size={16} />,
              iconBg: 'bg-orange-100/80 text-orange-600',
              label: 'Sanatan Gyan',
            },
            {
              href: '/about',
              icon: <span className="text-sm font-black">ⓘ</span>,
              iconBg: 'bg-gray-200/80 text-gray-700',
              label: 'About Us',
            },
          ].map(({ href, icon, iconBg, label }) => (
            <Link
              key={href}
              href={href}
              onClick={closeMenu}
              className="flex items-center gap-4 px-5 py-3.5 rounded-2xl text-gray-700 font-semibold hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-gray-100"
            >
              <span className={`w-9 h-9 flex items-center justify-center rounded-xl ${iconBg}`}>
                {icon}
              </span>
              {label}
            </Link>
          ))}
        </nav>

        {/* Drawer footer */}
        <div className="px-6 pb-8 pt-6 bg-white border-t border-gray-100 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.05)]">
          <div className="flex items-center justify-center gap-8 mb-5">
            {SOCIAL_LINKS.map(({ Icon, href, label, hoverColor }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-gray-400 ${hoverColor} transition-transform duration-300 hover:scale-110 p-2`}
              >
                <Icon size={22} />
              </a>
            ))}
          </div>
          <a
            href="https://whatsapp.com/channel/0029VbBxMM7Ae5VutiItov27"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5e] active:bg-[#18a852] text-white py-4 rounded-2xl font-bold text-[15px] shadow-lg shadow-[#25D366]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 outline-none focus-visible:ring-2 focus-visible:ring-[#25D366]"
          >
            <FaWhatsapp size={22} />
            Join WhatsApp Channel
          </a>
        </div>
      </aside>
    </> 
  );
}