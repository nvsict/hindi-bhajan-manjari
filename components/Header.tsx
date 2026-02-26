"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { GiLotusFlower } from 'react-icons/gi';
import {
  FaSearch, FaWhatsapp, FaPenNib, FaYoutube, FaInstagram,
  FaFacebookF, FaHeart, FaChevronRight, FaTimes
} from 'react-icons/fa';
import dynamic from 'next/dynamic';

// ─── Nav links ────────────────────────────────────────────────────────────────
const navLinks = [
  { name: 'Home',   href: '/' },
  { name: 'Aarti',  href: '/category/aarti' },
  { name: 'Chalisa',href: '/category/chalisa' },
  { name: 'Bhajan', href: '/category/bhajan' },
];

const socialLinks = [
  { Icon: FaYoutube,   href: '#', label: 'YouTube',   hoverColor: 'hover:text-red-500' },
  { Icon: FaInstagram, href: '#', label: 'Instagram', hoverColor: 'hover:text-pink-500' },
  { Icon: FaFacebookF, href: '#', label: 'Facebook',  hoverColor: 'hover:text-blue-500' },
];

const SearchBar = dynamic(() => import('./SearchBar'), { 
  ssr: false, // We don't need to server-render the search dropdown
});
// ─── Component ────────────────────────────────────────────────────────────────
export default function Header() {
  const [isMenuOpen,   setIsMenuOpen]   = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery,  setSearchQuery]  = useState('');
  const [scrolled,     setScrolled]     = useState(false);

  const router         = useRouter();
  const pathname       = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Scroll detection
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Auto-focus search input
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    }
  }, [isSearchOpen]);

  // Lock body scroll when menu/search is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isSearchOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMenuOpen, isSearchOpen]);

  // Close search on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setIsSearchOpen(false); setIsMenuOpen(false); }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Close menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      router.push(`/search?q=${encodeURIComponent(q)}`);
      setIsSearchOpen(false);
      setSearchQuery('');
    }
  }, [searchQuery, router]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ════════════════════════════════════════════════════════════════════════
          1. TOP UTILITY BAR — desktop only
      ════════════════════════════════════════════════════════════════════════ */}
      <div className="hidden md:block bg-gradient-to-r from-[#1a0a00] via-[#2c1200] to-[#1a0a00] border-b border-orange-900/30 relative z-50">
        {/* subtle shimmer line */}
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-600/40 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-9">

          {/* Left utility links */}
          <nav className="flex items-center gap-5 text-[11px] font-semibold tracking-wider uppercase text-orange-200/60">
            <Link href="/saved" className="flex items-center gap-1.5 text-red-400/80 hover:text-red-300 transition-colors duration-200">
              <FaHeart size={10} /> My Sangrah
            </Link>
            <span className="w-px h-3 bg-orange-900/60" />
            <Link href="/submit" className="flex items-center gap-1.5 hover:text-orange-200 transition-colors duration-200">
              <FaPenNib size={10} /> Submit Bhajan
            </Link>
            <span className="w-px h-3 bg-orange-900/60" />
            <Link href="/about"   className="hover:text-orange-200 transition-colors duration-200">About</Link>
            <Link href="/contact" className="hover:text-orange-200 transition-colors duration-200">Contact</Link>
          </nav>

          {/* Right social icons */}
          <div className="flex items-center gap-4">
            {socialLinks.map(({ Icon, href, label, hoverColor }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`text-orange-200/40 ${hoverColor} transition-all duration-200 hover:scale-110`}
              >
                <Icon size={13} />
              </a>
            ))}
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════════════════════
          2. MAIN STICKY HEADER
      ════════════════════════════════════════════════════════════════════════ */}
      <header
        className={`sticky top-0 z-40 w-full transition-colors duration-300 ${
          scrolled
            ? 'bg-white/90 backdrop-blur-xl shadow-[0_2px_20px_-4px_rgba(0,0,0,0.12)] border-b border-orange-100/60'
            : 'bg-white border-b border-orange-100/80'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 🌟 Removed transition-all from height. Let the scaling contents do the work naturally */}
          <div className="flex items-center justify-between h-[72px]">

            {/* ── Logo ── */}
            <Link href="/" className="flex items-center gap-3 group shrink-0 select-none">
              
              {/* 🌟 FIX 2: Fixed size to w-11 h-11, used scale to shrink on scroll */}
              <div 
                className={`relative bg-gradient-to-br from-orange-500 via-orange-600 to-amber-600 rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center origin-left transition-transform duration-300 group-hover:shadow-orange-500/50 group-hover:-rotate-6 w-11 h-11 ${scrolled ? 'scale-[0.8]' : 'scale-100'}`}
              >
                <div className="absolute inset-0 rounded-xl bg-white/10" />
                {/* 🌟 Fixed text size, let the parent scale it */}
                <GiLotusFlower className="text-white relative z-10 text-2xl" />
              </div>
              
              <div className="flex flex-col leading-none">
                {/* 🌟 FIX 3: Fixed text size, used inline-block and scale to shrink */}
                <span 
                  className={`font-black tracking-tight text-gray-900 text-xl md:text-2xl origin-left inline-block transition-transform duration-300 ${scrolled ? 'scale-[0.85]' : 'scale-100'}`}
                >
                  HINDI<span className="text-orange-600">BHAJAN</span>
                </span>
                <span className="text-[8px] md:text-[9px] font-bold text-gray-400 tracking-[0.3em] uppercase mt-0.5">
                  Manjari
                </span>
              </div>
            </Link>

            {/* ── Desktop Nav ── */}
            <nav className="hidden lg:flex items-center gap-1 mx-6">
              {navLinks.map((link) => {
                const active = isActive(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    className={`relative px-4 py-2 text-[13px] font-bold uppercase tracking-widest rounded-full transition-all duration-200 ${
                      active
                        ? 'text-orange-600 bg-orange-50'
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50/80'
                    }`}
                  >
                    {link.name}
                    {active && (
                      <span className="absolute bottom-[5px] left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-orange-500" />
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* ── Desktop Actions ── */}
            <div className="hidden lg:flex items-center gap-2 shrink-0">
              {/* Search toggle */}
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="group w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-all duration-200"
              >
                <FaSearch size={15} className="group-hover:scale-110 transition-transform" />
              </button>

              {/* Divider */}
              <div className="w-px h-5 bg-gray-200 mx-1" />

              {/* Saved */}
              <Link
                href="/saved"
                aria-label="My Sangrah"
                className="group w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-all duration-200"
              >
                <FaHeart size={15} className="group-hover:scale-110 transition-transform" />
              </Link>

              {/* WhatsApp CTA */}
              <a
                href="https://whatsapp.com/channel/0029VbBxMM7Ae5VutiItov27"
                target="_blank"
                rel="noopener noreferrer"
                className="group ml-1 flex items-center gap-2 bg-[#25D366]/10 border border-[#25D366]/25 text-[#25D366] hover:bg-[#25D366] hover:text-white hover:border-transparent hover:shadow-lg hover:shadow-[#25D366]/25 hover:-translate-y-0.5 px-4 py-2.5 rounded-full font-bold text-[13px] transition-all duration-200"
              >
                <FaWhatsapp size={17} className="group-hover:scale-110 transition-transform" />
                Community
              </a>
            </div>

            {/* ── Mobile Actions ── */}
            <div className="lg:hidden flex items-center gap-1">
              <button
                onClick={() => setIsSearchOpen(true)}
                aria-label="Search"
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-orange-600 hover:bg-orange-50 transition-colors"
              >
                <FaSearch size={17} />
              </button>
              <Link
                href="/saved"
                aria-label="My Sangrah"
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <FaHeart size={17} />
              </Link>
              <button
                onClick={() => setIsMenuOpen(true)}
                aria-label="Open menu"
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-700 active:bg-orange-800 transition-colors ml-1 shadow-md shadow-orange-600/25"
              >
                <HiMenuAlt3 size={22} />
              </button>
            </div>
          </div>
        </div>

        {/* ── Search drop-panel (desktop & tablet) ── */}
        <div
          className={`absolute top-full inset-x-0 bg-white border-t border-orange-100 shadow-2xl shadow-black/10 z-50 transition-all duration-300 origin-top ${
            isSearchOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'
          }`}
        >
          <div className="max-w-3xl mx-auto px-4 py-6 md:py-8">
            {/* 🌟 FUZZY SEARCH BAR COMPONENT */}
            <div className="relative">
              {/* Pass the function to close the main header panel */}
              <SearchBar onClose={() => { setIsSearchOpen(false); setSearchQuery(''); }} />
              
              <button
  type="button"
  onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
  className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors z-50"
  aria-label="Close search panel" // 🌟 THE FIX
>
  <HiX size={18} />
</button>
            </div>
            <p className="text-[11px] text-gray-400 mt-3 ml-2 font-medium tracking-wide">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-500 font-mono text-[10px]">ESC</kbd> to close
            </p>
          </div>
        </div>
      </header>

      {/* ── Search Backdrop ── */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-30"
          onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
          aria-hidden
        />
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          3. MOBILE SIDEBAR DRAWER
      ════════════════════════════════════════════════════════════════════════ */}

      {/* Drawer backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden
      />

      {/* Drawer panel */}
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={`fixed top-0 right-0 h-full w-[82%] max-w-[340px] z-[120] lg:hidden flex flex-col bg-white shadow-[−20px_0_60px_rgba(0,0,0,0.25)] transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/30">
              <GiLotusFlower className="text-white text-base" />
            </div>
            <span className="font-black text-gray-800 tracking-widest text-sm uppercase">Menu</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            aria-label="Close menu"
            className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
          >
            <HiX size={18} />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-1">
          {navLinks.map((link) => {
            const active = isActive(link.href);
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center justify-between px-4 py-4 rounded-2xl font-bold text-base transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'bg-orange-50 text-orange-600 shadow-sm'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{link.name}</span>
                {active
                  ? <span className="w-2 h-2 rounded-full bg-orange-500" />
                  : <FaChevronRight size={12} className="text-gray-300" />
                }
              </Link>
            );
          })}

          {/* Divider */}
          <div className="my-3 border-t border-gray-100" />

          {/* Utility links */}
          <Link href="/saved" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-gray-600 font-semibold hover:bg-red-50 hover:text-red-600 transition-colors">
            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-red-100/60 text-red-500">
              <FaHeart size={15} />
            </span>
            My Sangrah
          </Link>
          <Link href="/submit" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-gray-600 font-semibold hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-orange-100/60 text-orange-500">
              <FaPenNib size={14} />
            </span>
            Submit Bhajan
          </Link>
          <Link href="/about" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <span className="text-xs font-black">ⓘ</span>
            </span>
            About Us
          </Link>
          <Link href="/contact" onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3.5 px-4 py-3.5 rounded-2xl text-gray-600 font-semibold hover:bg-gray-50 transition-colors">
            <span className="w-8 h-8 flex items-center justify-center rounded-xl bg-gray-100 text-gray-400">
              <span className="text-xs">✉</span>
            </span>
            Contact
          </Link>
        </nav>

        {/* Social + CTA */}
        <div className="px-5 pb-8 pt-4 bg-gray-50 border-t border-gray-100">
          {/* Social row */}
          <div className="flex items-center justify-center gap-6 mb-4">
            {socialLinks.map(({ Icon, href, label, hoverColor }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className={`text-gray-400 ${hoverColor} transition-all duration-200 hover:scale-110`}
              >
                <Icon size={20} />
              </a>
            ))}
          </div>

          {/* WhatsApp CTA */}
          <a
            href="https://whatsapp.com/channel/0029VbBxMM7Ae5VutiItov27"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1ebe5e] active:bg-[#18a852] text-white py-4 rounded-2xl font-bold text-sm shadow-lg shadow-[#25D366]/30 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            <FaWhatsapp size={20} />
            Join WhatsApp Channel
          </a>
        </div>
      </aside>
    </>
  );
}