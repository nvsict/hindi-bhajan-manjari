"use client";

import { useState, useEffect, useCallback, useRef, memo } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HiMenuAlt3, HiX } from 'react-icons/hi';
import { GiLotusFlower } from 'react-icons/gi';
import {
  FaSearch, FaPenNib, FaInstagram,
  FaFacebookF, FaHeart, FaChevronRight, FaBookOpen, FaChevronDown, FaMusic
} from 'react-icons/fa';
import { FaOm, FaHandsPraying } from 'react-icons/fa6';
import dynamic from 'next/dynamic';
import { Hind } from 'next/font/google';
import { useLenis } from 'lenis/react';
import Image from 'next/image';
import ThemeToggle from './ThemeToggle'; // 🌟 Added ThemeToggle Import

const hind = Hind({
  subsets: ['devanagari', 'latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

// ─── 🌟 PREMIUM MEGA MENU DATA STRUCTURE ────────────────────────────────────
const NAV_ITEMS = [
  { name: 'Home', href: '/' },
  {
    name: 'Deities',
    megaMenu: {
      featured: {
        title: 'Divine Darshan',
        desc: 'Explore our sacred collection of deity-specific Bhajans, Aartis, and Mantras.',
        icon: <FaOm className="text-4xl text-orange-200 mb-4 opacity-80" />,
        href: '/deity',
        bg: 'from-orange-500 to-red-600',
      },
      links: [
        { name: 'Shri Hanuman', href: '/deity/hanuman', icon: '🚩', desc: 'Sankat Mochan' },
        { name: 'Shri Ram', href: '/deity/shri-ram', icon: '🏹', desc: 'Maryada Purushottam' },
        { name: 'Shri Krishna', href: '/deity/shri-krishna', icon: '🦚', desc: 'Bhakti & Leela' },
        { name: 'Shiv Ji', href: '/deity/shiv-ji', icon: '🔱', desc: 'Mahadev Chants' },
        { name: 'Mata Rani', href: '/deity/mata-rani', icon: '🦁', desc: 'Shakti & Devotion' },
        { name: 'Shri Hari', href: '/deity/shri-hari', icon: '🐚', desc: 'Vishnu Mantras' },
      ]
    }
  },
  {
    name: 'Categories',
    megaMenu: {
      featured: {
        title: 'Daily Devotion',
        desc: 'Start your morning with powerful Aartis and peaceful Chalisa recitations.',
        icon: <FaHandsPraying className="text-4xl text-amber-200 mb-4 opacity-80" />,
        href: '/category/aarti',
        bg: 'from-amber-500 to-orange-500',
      },
      links: [
        { name: 'Devi Maa', href: '/category/mata-ke-bhajan', icon: <FaMusic/>, desc: 'Mata Rani Devotional Songs' },
        { name: 'Aarti', href: '/category/aarti', icon: <GiLotusFlower/>, desc: 'Morning & Evening Prayers' },
        { name: 'Chalisa', href: '/category/chalisa', icon: <FaBookOpen/>, desc: 'Powerful 40-Verse Hymns' },
        { name: 'Stotram', href: '/category/stotram', icon: <FaOm/>, desc: 'Ancient Sanskrit Chants' },
        { name: 'Pad', href: '/category/pad', icon: <FaPenNib/>, desc: 'Classical Poetic Verses' },
      ]
    }
  },
  { name: 'Gyan Hub', href: '/gyan' },
];

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

const SearchBar = dynamic(() => import('./SearchBar'), { ssr: false });

const UtilityBar = memo(function UtilityBar() {
  return (
    <div className="hidden md:block bg-gradient-to-r from-[#1a0a00] via-[#2c1200] to-[#1a0a00] border-b border-orange-900/30 relative z-50 transition-colors duration-300">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-600/40 to-transparent" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-9">
        <nav className="flex items-center gap-5 text-[11px] font-bold tracking-wider uppercase text-orange-100">
          <Link href="/saved" className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors">
            <FaHeart size={10} /> My Sangrah
          </Link>
          <span className="w-px h-3 bg-orange-800" />
          <Link href="/submit" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <FaPenNib size={10} /> Submit Bhajan
          </Link>
          <span className="w-px h-3 bg-orange-800" />
          <Link href="/about" className="hover:text-white transition-colors">About</Link>
          <Link href="/contact" className="hover:text-white transition-colors">Contact</Link>
        </nav>
        <div className="flex items-center gap-4">
          {SOCIAL_LINKS.map(({ Icon, href, label, hoverColor }) => (
            <a key={label} href={href} aria-label={label} className={`text-orange-200 ${hoverColor} transition-transform hover:scale-110`} target="_blank" rel="noopener noreferrer">
              <Icon size={14} />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
});

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);
  
  const [scrolled, setScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  
  // 🌟 Desktop Hover Animation States
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [pillStyle, setPillStyle] = useState({ left: 0, width: 0, opacity: 0 });
  const navRefs = useRef<{ [key: string]: HTMLElement | null }>({});
  const hoverTimeout = useRef<NodeJS.Timeout | null>(null);

  const lastScrollY = useRef(0);
  const pathname = usePathname();
  const lenis = useLenis();

  // Scroll logic
  useLenis(({ scroll }) => {
    setScrolled(scroll > 10);
    if (scroll < 120) setIsHidden(false); 
    else if (scroll > lastScrollY.current) setIsHidden(true);  
    else if (scroll < lastScrollY.current) setIsHidden(false); 
    lastScrollY.current = scroll;
  });

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) setIsHidden(false);
  }, [isMenuOpen, isSearchOpen]);

  useEffect(() => {
    if (isMenuOpen || isSearchOpen) lenis?.stop();
    else lenis?.start();
    return () => { lenis?.start(); };
  }, [isMenuOpen, isSearchOpen, lenis]);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setExpandedMobileMenu(null);
    setHoveredMenu(null);
  }, [pathname]);

  const openSearch = useCallback(() => setIsSearchOpen(true), []);
  const closeSearch = useCallback(() => setIsSearchOpen(false), []);
  const openMenu = useCallback(() => setIsMenuOpen(true), []);
  const closeMenu = useCallback(() => setIsMenuOpen(false), []);

  const isActive = useCallback(
    (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href)),
    [pathname],
  );

  // 🌟 Mouse Handlers for Desktop Shared Animation
  const handleNavMouseEnter = (name: string) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    setHoveredMenu(name);
    
    // Update sliding pill background
    const el = navRefs.current[name];
    if (el) {
      setPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    }
  };

  const handleNavMouseLeave = () => {
    hoverTimeout.current = setTimeout(() => {
      setHoveredMenu(null);
      setPillStyle((prev) => ({ ...prev, opacity: 0 }));
    }, 200); // 200ms delay gives user time to move mouse diagonally into the dropdown
  };

  const hasActiveMegaMenu = hoveredMenu && NAV_ITEMS.find(i => i.name === hoveredMenu)?.megaMenu;

  return (
    <> 
      <UtilityBar />

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isHidden && !isSearchOpen && !isMenuOpen && !hoveredMenu ? '-translate-y-full' : 'translate-y-0'
        } ${
          scrolled 
            ? 'bg-white/95 dark:bg-[#0c0804]/95 backdrop-blur-xl shadow-[0_10px_30px_-10px_rgba(234,88,12,0.1)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] border-b border-orange-100/60 dark:border-white/10' 
            : 'bg-white dark:bg-[#0c0804] border-b border-orange-100/80 dark:border-white/5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[72px]">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group shrink-0 outline-none rounded-lg z-10 relative">
              <div className={`relative flex items-center justify-center origin-left transition-transform duration-300 ease-out group-hover:-rotate-6 w-11 h-11 ${scrolled ? 'scale-[0.85]' : 'scale-100'} bg-orange-50 dark:bg-gray-800 rounded-xl shadow-sm border border-transparent dark:border-white/10`}>
                <Image 
                  src="/favicon.ico" 
                  alt="Hindi Bhajan Manjari" 
                  width={32} 
                  height={32} 
                  className="object-contain drop-shadow-md brightness-110"
                />
              </div>
              <div className="flex flex-col leading-none">
                <span className={`font-black tracking-tight text-gray-900 dark:text-white text-xl md:text-2xl origin-left inline-block transition-all duration-300 ${scrolled ? 'scale-[0.9]' : 'scale-100'}`}>
                  HINDI<span className="text-orange-600">BHAJAN</span>
                </span>
                <span className="text-[9px] md:text-[10px] font-bold text-gray-500 dark:text-gray-400 tracking-[0.3em] uppercase mt-0.5">Manjari</span>
              </div>
            </Link>

            {/* 🌟 PREMIUM DESKTOP NAV WITH SHARED ANIMATION */}
            <nav 
              className="hidden lg:flex items-center gap-1 mx-6 relative h-full"
              onMouseLeave={handleNavMouseLeave}
            >
              {/* Magic Hover Pill Background */}
              <div 
                className="absolute h-10 bg-orange-50 dark:bg-gray-800 rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none"
                style={{
                  left: pillStyle.left,
                  width: pillStyle.width,
                  opacity: pillStyle.opacity,
                  transform: `scale(${pillStyle.opacity === 0 ? 0.9 : 1})`,
                }}
              />

              {NAV_ITEMS.map((item) => {
                const isItemActive = item.href ? isActive(item.href) : item.megaMenu?.links.some(d => isActive(d.href));
                const isHovered = hoveredMenu === item.name;
                
                return (
                  <div 
                    key={item.name} 
                    className="relative flex items-center h-full"
                    ref={(el) => { navRefs.current[item.name] = el; }}
                    onMouseEnter={() => handleNavMouseEnter(item.name)}
                  >
                    {item.megaMenu ? (
                      <button className={`relative z-10 flex items-center gap-1.5 px-5 py-2.5 text-[14px] font-bold uppercase tracking-widest rounded-full transition-colors duration-200 ${
                        isItemActive || isHovered ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.name}
                        <FaChevronDown size={10} className={`transition-transform duration-300 opacity-60 ${isHovered ? 'rotate-180' : ''}`} />
                      </button>
                    ) : (
                      <Link href={item.href!} className={`relative z-10 flex items-center gap-1.5 px-5 py-2.5 text-[14px] font-bold uppercase tracking-widest rounded-full transition-colors duration-200 ${
                        isItemActive || isHovered ? 'text-orange-700 dark:text-orange-400' : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {item.name}
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* 🌟 SHARED MEGA MENU DROPDOWN CONTAINER */}
              {/* Renders one single floating box that morphs its inner content */}
              <div 
                className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top z-50 ${
                  hasActiveMegaMenu ? 'opacity-100 visible translate-y-0 scale-100' : 'opacity-0 invisible translate-y-3 scale-95 pointer-events-none'
                }`}
                onMouseEnter={() => { if (hoverTimeout.current) clearTimeout(hoverTimeout.current); }} // Keep open if mouse moves into the box
              >
                <div className="w-[720px] bg-white/95 dark:bg-[#111] backdrop-blur-2xl rounded-[2rem] shadow-[0_25px_70px_-15px_rgba(234,88,12,0.2)] dark:shadow-[0_25px_70px_-15px_rgba(0,0,0,0.8)] border border-white dark:border-white/10 ring-1 ring-black/5 dark:ring-white/5 p-2 grid relative overflow-hidden transition-colors duration-300">
                  
                  {/* Render content based on active hovered menu. CSS Grid allows overlap for cross-fade */}
                  {NAV_ITEMS.filter(i => i.megaMenu).map((item) => {
                    const isContentActive = hoveredMenu === item.name;
                    return (
                      <div 
                        key={item.name}
                        className={`col-start-1 row-start-1 flex transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                          isContentActive ? 'opacity-100 translate-x-0 pointer-events-auto z-10' : 'opacity-0 -translate-x-4 pointer-events-none z-0'
                        }`}
                      >
                        {/* Left Featured Column */}
                        <div className={`w-[260px] shrink-0 bg-gradient-to-br ${item.megaMenu!.featured.bg} p-8 rounded-[1.5rem] flex flex-col justify-between relative overflow-hidden`}>
                          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/20 rounded-full blur-3xl pointer-events-none" />
                          <div className="relative z-10">
                            {item.megaMenu!.featured.icon}
                            <h3 className="text-white font-black text-2xl leading-tight mb-2 tracking-tight">
                              {item.megaMenu!.featured.title}
                            </h3>
                            <p className="text-white/80 font-medium text-sm leading-relaxed">
                              {item.megaMenu!.featured.desc}
                            </p>
                          </div>
                          <Link href={item.megaMenu!.featured.href} onClick={closeMenu} className="relative z-10 mt-8 inline-flex items-center gap-2 text-white font-bold text-sm bg-white/20 hover:bg-white/30 px-5 py-2.5 rounded-xl w-fit transition-colors backdrop-blur-md">
                            Explore Now <FaChevronRight size={10} />
                          </Link>
                        </div>

                        {/* Right Grid Column */}
                        <div className="flex-1 p-6 grid grid-cols-2 gap-x-4 gap-y-3 content-start">
                          {item.megaMenu!.links.map((subItem) => (
                            <Link 
                              key={subItem.name} 
                              href={subItem.href}
                              onClick={closeMenu}
                              className={`group/link flex items-start gap-4 p-3 rounded-2xl transition-all duration-200 ${isActive(subItem.href) ? 'bg-orange-50 dark:bg-orange-900/20' : 'hover:bg-gray-50 dark:hover:bg-white/5'}`}
                            >
                              <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center text-lg transition-colors ${isActive(subItem.href) ? 'bg-orange-200/50 text-orange-700 dark:text-orange-400' : 'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-500 dark:text-gray-400 shadow-sm group-hover/link:bg-orange-100 dark:group-hover/link:bg-orange-900/50 group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400 group-hover/link:border-orange-200 dark:group-hover/link:border-orange-500/30'}`}>
                                {subItem.icon}
                              </div>
                              <div>
                                <p className={`font-bold text-[15px] leading-tight mb-0.5 transition-colors ${isActive(subItem.href) ? 'text-orange-800 dark:text-orange-400' : 'text-gray-900 dark:text-gray-200 group-hover/link:text-orange-600 dark:group-hover/link:text-orange-400'}`}>
                                  {subItem.name}
                                </p>
                                <p className="text-[12px] text-gray-500 dark:text-gray-400 font-medium leading-snug">
                                  {subItem.desc}
                                </p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </nav>

            {/* Desktop Actions */}
            <div className="hidden lg:flex items-center gap-2 shrink-0 z-10">
              {/* 🌟 THE THEME TOGGLE ADDED HERE 🌟 */}
              <ThemeToggle />
              
              <button onClick={openSearch} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:text-orange-600 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors">
                <FaSearch size={16} />
              </button>
              <div className="w-px h-5 bg-gray-200 dark:bg-gray-700 mx-1" />
              <Link href="/saved" className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <FaHeart size={16} />
              </Link>
            </div>

            {/* Mobile Actions */}
            <div className="lg:hidden flex items-center gap-1 z-10 relative">
              {/* 🌟 THE THEME TOGGLE ADDED HERE FOR MOBILE TOO 🌟 */}
              <ThemeToggle />
              
              <button onClick={openSearch} className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 dark:text-gray-400 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors">
                <FaSearch size={18} />
              </button>
              <button onClick={openMenu} className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-600 text-white hover:bg-orange-700 transition-colors shadow-md ml-1 active:scale-95">
                <HiMenuAlt3 size={24} />
              </button>
            </div>
          </div>
        </div>

        {/* Search Panel */}
        <div className={`absolute top-full inset-x-0 bg-white/95 dark:bg-[#111]/95 backdrop-blur-xl border-t border-orange-100 dark:border-white/10 shadow-2xl z-50 transition-all duration-300 origin-top ${isSearchOpen ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-95 pointer-events-none'}`}>
          <div className="max-w-3xl mx-auto px-4 py-6">
            <div className="relative">
              {isSearchOpen && <SearchBar onClose={closeSearch} />}
              <button onClick={closeSearch} className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <HiX size={18} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Overlays */}
      {isSearchOpen && <div onClick={closeSearch} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity" />}
      {isMenuOpen && <div onClick={closeMenu} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110] lg:hidden transition-opacity" />}

      {/* MOBILE DRAWER */}
      <aside className={`fixed top-0 right-0 h-full w-[85%] max-w-[360px] z-[120] lg:hidden flex flex-col bg-white dark:bg-[#111] shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <Image 
              src="/favicon.ico" 
              alt="Menu Logo" 
              width={36} 
              height={36} 
              className="object-contain drop-shadow-sm brightness-110"
            />
            <span className="font-black text-gray-900 dark:text-white tracking-widest text-sm uppercase">Menu</span>
          </div>
          <button onClick={closeMenu} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <HiX size={20} />
          </button>
        </div>

        <nav data-lenis-prevent="true" className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-2 bg-gray-50/50 dark:bg-black/20">
          {NAV_ITEMS.map((item) => (
            <div key={item.name}>
              {item.megaMenu ? (
                <div className="bg-white dark:bg-gray-900/50 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden transition-colors duration-300">
                  <button 
                    onClick={() => setExpandedMobileMenu(expandedMobileMenu === item.name ? null : item.name)}
                    className="w-full flex items-center justify-between px-5 py-4 font-bold text-[15px] text-gray-800 dark:text-gray-200 active:bg-gray-50 dark:active:bg-gray-800 transition-colors"
                  >
                    {item.name}
                    <FaChevronDown size={12} className={`text-gray-400 dark:text-gray-500 transition-transform duration-300 ${expandedMobileMenu === item.name ? 'rotate-180' : ''}`} />
                  </button>
                  <div className={`grid transition-all duration-300 ease-in-out ${expandedMobileMenu === item.name ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                    <div className="overflow-hidden bg-gray-50/50 dark:bg-gray-800/30">
                      <div className="px-3 pb-4 pt-1 flex flex-col gap-1">
                        {item.megaMenu.links.map(subItem => (
                          <Link 
                            key={subItem.name} 
                            href={subItem.href}
                            onClick={closeMenu}
                            className={`flex items-center gap-3 py-3 px-4 rounded-xl transition-colors ${isActive(subItem.href) ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold shadow-sm' : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-800 hover:shadow-sm font-semibold'}`}
                          >
                            <span className={`w-8 h-8 flex items-center justify-center rounded-lg text-lg ${isActive(subItem.href) ? 'bg-orange-200/50 dark:bg-orange-800/50' : 'bg-white dark:bg-gray-900 shadow-sm border border-gray-100 dark:border-gray-800'}`}>
                              {subItem.icon}
                            </span>
                            {subItem.name}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href!}
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-5 py-4 rounded-2xl font-bold text-[15px] transition-all duration-200 ${isActive(item.href!) ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 shadow-sm border border-orange-200/50 dark:border-orange-500/30' : 'bg-white dark:bg-gray-900/50 text-gray-700 dark:text-gray-300 hover:shadow-sm border border-gray-100 dark:border-gray-800'}`}
                >
                  <span>{item.name}</span>
                  {isActive(item.href!) ? <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm" /> : <FaChevronRight size={14} className="text-gray-400 dark:text-gray-600" />}
                </Link>
              )}
            </div>
          ))}
          
          <div className="my-4 border-t border-gray-200/60 dark:border-gray-800/60 mx-2" />
          
          <Link href="/saved" onClick={closeMenu} className="flex items-center gap-4 px-5 py-3 rounded-2xl text-gray-700 dark:text-gray-300 font-semibold bg-white dark:bg-gray-900/50 hover:shadow-sm transition-all border border-gray-100 dark:border-gray-800">
            <span className="w-9 h-9 flex items-center justify-center rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400"><FaHeart size={16} /></span> My Sangrah
          </Link>
        </nav>
      </aside>
    </> 
  );
}