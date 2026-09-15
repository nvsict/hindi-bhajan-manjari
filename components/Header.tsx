"use client";

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  memo,
} from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { supabase } from "@/utils/supabase";
import { HiMenuAlt3, HiX } from 'react-icons/hi';

import {
  FaSearch,
  FaPenNib,
  FaInstagram,
  FaFacebookF,
  FaHeart,
  FaChevronRight,
  FaBookOpen,
  FaChevronDown,
  FaMusic,
  FaHandHoldingHeart,
  FaDownload,
  FaGlobe,
} from 'react-icons/fa';

import { FaOm, FaHandsPraying } from 'react-icons/fa6';
import dynamic from "next/dynamic";
import { Hind } from "next/font/google";
import { useLenis } from "lenis/react";
import Image from "next/image";

const hind = Hind({
  subsets: ["devanagari", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

// ─── BASE STRUCTURE ─────────────────────────────────────────────────────────
// Fixed links remain here; Deities and Categories are populated from Supabase.
const BASE_NAV_STRUCTURE = [
  {
    name: "Home",
    href: "/",
    title: "Go to Homepage",
  },
  {
    name: "Deities",
    title: "Explore Deity Specific Bhajans",
    megaMenu: {
      featured: {
        title: "दिव्य दर्शन",
        desc: "गहरे आध्यात्मिक जुड़ाव के लिए हमारे देवी-देवताओं के विशेष भजन, आरती और मंत्रों का संग्रह।",
        icon: (
          <FaOm className="text-5xl text-orange-600 mb-5 opacity-90 drop-shadow-sm" />
        ),
        href: "/deity",
        bg: "from-orange-500 to-red-600",
      },
      links: [],
    },
  },
  {
    name: "Categories",
    title: "Browse Bhajan Categories",
    megaMenu: {
      featured: {
        title: "नित्य उपासना",
        desc: "अपनी सुबह की शुरुआत शक्तिशाली आरती और शांतिपूर्ण चालीसा पाठ के साथ करें।",
        icon: (
          <FaHandsPraying className="text-5xl text-amber-200 mb-5 opacity-90 drop-shadow-sm" />
        ),
        href: "/category",
        bg: "from-amber-500 to-orange-500",
      },
      links: [],
    },
  },
  {
    name: "Bhajans",
    href: "/bhajan",
    title: "A-Z Hindi Bhajans Collection",
  },
  {
    name: "Gyan",
    href: "/gyan",
    title: "Sanatan Gyan & Spiritual Articles",
  },
  {
    // Shorter visual label; URL remains unchanged.
    name: "Gita",
    href: "/bhagavad-gita",
    title: "Read Shrimad Bhagavad Gita",
  },
];

const SOCIAL_LINKS = [
  {
    Icon: FaInstagram,
    href: "https://www.instagram.com/hindibhajanmanjari/?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==",
    label: "Follow us on Instagram",
    hoverColor: "hover:text-pink-500",
  },
  {
    Icon: FaFacebookF,
    href: "https://www.facebook.com/mohit.tarkar.7121/",
    label: "Connect on Facebook",
    hoverColor: "hover:text-blue-500",
  },
] as const;

const SearchBar = dynamic(() => import("./SearchBar"), {
  ssr: false,
});

// ─── UTILITY BAR ────────────────────────────────────────────────────────────

const UtilityBar = memo(function UtilityBar() {
  return (
    <div className="hidden md:block bg-gradient-to-r from-[#1a0a00] via-[#2c1200] to-[#1a0a00] border-b border-orange-900/30 relative z-50">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-orange-600/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-10">
        <nav
          aria-label="Utility navigation"
          className="flex items-center gap-6 text-[11px] font-bold tracking-wider uppercase text-orange-100/90"
        >
          <Link
            href="/saved"
            title="View your saved bhajans"
            className="flex items-center gap-2 text-red-400 hover:text-red-300 transition-colors py-1"
          >
            <FaHeart size={11} aria-hidden="true" />
            My Sangrah
          </Link>

          <span className="w-px h-3.5 bg-orange-800/60" aria-hidden="true" />

          <Link
            href="/submit"
            title="Submit a new Bhajan"
            className="flex items-center gap-2 hover:text-white transition-colors py-1"
          >
            <FaPenNib size={11} aria-hidden="true" />
            Submit Bhajan
          </Link>

          <span className="w-px h-3.5 bg-orange-800/60" aria-hidden="true" />

          <Link
            href="/about"
            title="Learn about Hindi Bhajan Manjari"
            className="hover:text-white transition-colors py-1"
          >
            About Us
          </Link>

          <Link
            href="/contact"
            title="Contact our team"
            className="hover:text-white transition-colors py-1"
          >
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-5">
          {SOCIAL_LINKS.map(
            ({ Icon, href, label, hoverColor }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                title={label}
                className={`text-orange-500/80 ${hoverColor} transition-transform hover:scale-110 p-1`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Icon size={15} aria-hidden="true" />
              </a>
            )
          )}
        </div>
      </div>
    </div>
  );
});

// ─── HEADER ─────────────────────────────────────────────────────────────────

export default function Header() {
  const [navItems, setNavItems] = useState<any[]>(
    BASE_NAV_STRUCTURE
  );

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [expandedMobileMenu, setExpandedMobileMenu] =
    useState<string | null>(null);

  const mobileMenuRef = useRef<HTMLElement | null>(null);
const mobileMenuButtonRef = useRef<HTMLButtonElement | null>(null);

  const [scrolled, setScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [hoveredMenu, setHoveredMenu] =
    useState<string | null>(null);

  const [pillStyle, setPillStyle] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const navRefs = useRef<{
    [key: string]: HTMLElement | null;
  }>({});

  const hoverTimeout = useRef<NodeJS.Timeout | null>(
    null
  );

  const megaMenuCloseTimeout = useRef<NodeJS.Timeout | null>(
    null
  );

  const [deferredPrompt, setDeferredPrompt] =
    useState<any>(null);

  const lastScrollY = useRef(0);

  const pathname = usePathname();
  const lenis = useLenis();

  // ──────────────────────────────────────────────────────────────────────────
  // DYNAMIC NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const fetchDynamicNav = async () => {
      try {
        const [
          deitiesRes,
          categoriesRes,
        ] = await Promise.all([
          supabase
            .from("top_deities")
            .select(
              "name, slug, icon, description"
            )
            .limit(6),

          supabase
            .from("top_categories")
            .select(
              "name, slug, icon, description"
            )
            .limit(6),
        ]);

        if (
          deitiesRes.data &&
          categoriesRes.data
        ) {
          const dynamicNav = [
            BASE_NAV_STRUCTURE[0],

            {
              ...BASE_NAV_STRUCTURE[1],
              megaMenu: {
                ...BASE_NAV_STRUCTURE[1].megaMenu,
                links: deitiesRes.data.map(
                  (d: any) => ({
                    name: d.name,
                    href: `/deity/${d.slug}`,
                    icon: d.icon || "🙏",
                    desc:
                      d.description ||
                      "Divine Collection",
                  })
                ),
              },
            },

            {
              ...BASE_NAV_STRUCTURE[2],
              megaMenu: {
                ...BASE_NAV_STRUCTURE[2].megaMenu,
                links: categoriesRes.data.map(
                  (c: any) => ({
                    name: c.name,
                    href: `/category/${c.slug}`,
                    icon: c.icon || "🪔",
                    desc:
                      c.description ||
                      "Spiritual Categories",
                  })
                ),
              },
            },

            BASE_NAV_STRUCTURE[3],
            BASE_NAV_STRUCTURE[4],
            BASE_NAV_STRUCTURE[5],
          ];

          setNavItems(dynamicNav);
        }
      } catch (error) {
        console.error(
          "Failed to fetch dynamic nav items from views:",
          error
        );
      }
    };

    void fetchDynamicNav();
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // PWA INSTALL PROMPT
  // ──────────────────────────────────────────────────────────────────────────

  useEffect(() => {
    const handleBeforeInstallPrompt = (
      e: Event
    ) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener(
      "beforeinstallprompt",
      handleBeforeInstallPrompt
    );

    return () =>
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
  }, []);

  // ──────────────────────────────────────────────────────────────────────────
  // SCROLL BEHAVIOR
  // ──────────────────────────────────────────────────────────────────────────

  useLenis(({ scroll }) => {
    setScrolled((prev) => {
      const isNowScrolled = scroll > 10;
      return prev !== isNowScrolled
        ? isNowScrolled
        : prev;
    });

    setIsHidden((prev) => {
      let shouldHide = prev;

      if (scroll < 120) {
        shouldHide = false;
      } else {
        const diff =
          scroll - lastScrollY.current;

        if (diff > 8) {
          shouldHide = true;
        } else if (diff < -8) {
          shouldHide = false;
        }
      }

      return prev !== shouldHide
        ? shouldHide
        : prev;
    });

    lastScrollY.current = scroll;
  });

  // Never hide the header while a major interaction is open.
  useEffect(() => {
    if (
      isMenuOpen ||
      isSearchOpen ||
      hoveredMenu
    ) {
      setIsHidden(false);
    }
  }, [
    isMenuOpen,
    isSearchOpen,
    hoveredMenu,
  ]);

  // Stop Lenis while overlays/drawer are active.
  useEffect(() => {
    if (isMenuOpen || isSearchOpen) {
      lenis?.stop();
    } else {
      lenis?.start();
    }

    return () => {
      lenis?.start();
    };
  }, [
    isMenuOpen,
    isSearchOpen,
    lenis,
  ]);

  // Close interactive navigation on route change.
  useEffect(() => {
    setIsMenuOpen(false);
    setIsSearchOpen(false);
    setExpandedMobileMenu(null);
    setHoveredMenu(null);

    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }

    if (megaMenuCloseTimeout.current) {
      clearTimeout(
        megaMenuCloseTimeout.current
      );
    }

    setPillStyle((prev) => ({
      ...prev,
      opacity: 0,
    }));
  }, [pathname]);

  // ──────────────────────────────────────────────────────────────────────────
  // ACTION HANDLERS
  // ──────────────────────────────────────────────────────────────────────────

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } =
      await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
  };

  const openSearch = useCallback(
    () => setIsSearchOpen(true),
    []
  );

  const closeSearch = useCallback(
    () => setIsSearchOpen(false),
    []
  );

  const openMenu = useCallback(
    () => setIsMenuOpen(true),
    []
  );

  const closeMenu = useCallback(() => {
  // Move focus out of the drawer before hiding it from assistive technology.
  if (
    mobileMenuRef.current?.contains(document.activeElement)
  ) {
    mobileMenuButtonRef.current?.focus();
  }

  setIsMenuOpen(false);
}, []);

  // ──────────────────────────────────────────────────────────────────────────
  // ACTIVE ROUTE
  // ──────────────────────────────────────────────────────────────────────────

  const isActive = useCallback(
    (href: string) =>
      href === "/"
        ? pathname === "/"
        : pathname.startsWith(href),
    [pathname]
  );

  // ──────────────────────────────────────────────────────────────────────────
  // DESKTOP HOVER NAVIGATION
  // ──────────────────────────────────────────────────────────────────────────

  const handleNavMouseEnter = (
    name: string
  ) => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }

    if (megaMenuCloseTimeout.current) {
      clearTimeout(
        megaMenuCloseTimeout.current
      );
    }

    setHoveredMenu(name);

    const el = navRefs.current[name];

    if (el) {
      setPillStyle({
        left: el.offsetLeft,
        width: el.offsetWidth,
        opacity: 1,
      });
    }
  };

  const scheduleNavClose = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }

    hoverTimeout.current = setTimeout(() => {
      setHoveredMenu(null);

      setPillStyle((prev) => ({
        ...prev,
        opacity: 0,
      }));
    }, 220);
  };

  const keepMegaMenuOpen = () => {
    if (hoverTimeout.current) {
      clearTimeout(hoverTimeout.current);
    }

    if (megaMenuCloseTimeout.current) {
      clearTimeout(
        megaMenuCloseTimeout.current
      );
    }
  };

  const handleMegaMenuLeave = () => {
    if (megaMenuCloseTimeout.current) {
      clearTimeout(
        megaMenuCloseTimeout.current
      );
    }

    megaMenuCloseTimeout.current =
      setTimeout(() => {
        setHoveredMenu(null);

        setPillStyle((prev) => ({
          ...prev,
          opacity: 0,
        }));
      }, 160);
  };

  const hasActiveMegaMenu =
    hoveredMenu &&
    navItems.find(
      (item) => item.name === hoveredMenu
    )?.megaMenu;

  // ──────────────────────────────────────────────────────────────────────────
  // RENDER
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <>
      <UtilityBar />

      <header
        className={`sticky top-0 z-40 w-full transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isHidden &&
          !isSearchOpen &&
          !isMenuOpen &&
          !hoveredMenu
            ? "-translate-y-full"
            : "translate-y-0"
        } ${
          scrolled
            ? "bg-white/95 backdrop-blur-xl shadow-[0_15px_40px_-15px_rgba(234,88,12,0.15)] border-b border-orange-100/60"
            : "bg-white border-b border-orange-100/80"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-[80px]">

            {/* ───────────────────────────────────────────────────────────── */}
            {/* LOGO                                                          */}
            {/* ───────────────────────────────────────────────────────────── */}

            <Link
              href="/"
              title="Hindi Bhajan Manjari Home"
              className="flex items-center gap-2.5 xl:gap-3 group shrink-0 outline-none rounded-lg z-10 relative py-2"
            >
              <div
                className={`relative flex items-center justify-center origin-left transition-transform duration-400 ease-out group-hover:-rotate-6 w-10 h-10 xl:w-12 xl:h-12 ${
                  scrolled
                    ? "scale-[0.85]"
                    : "scale-100"
                } bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl shadow-sm border border-orange-100/50`}
              >
                <Image
                  src="/favicon.ico"
                  alt="Hindi Bhajan Manjari"
                  width={32}
                  height={32}
                  className="object-contain drop-shadow-md brightness-110 xl:w-[36px] xl:h-[36px]"
                />
              </div>

              <div className="flex flex-col leading-none justify-center">
                <span
                  className={`font-black tracking-tight text-gray-900 text-lg xl:text-[24px] origin-left inline-block transition-all duration-400 ${
                    scrolled
                      ? "scale-[0.9]"
                      : "scale-100"
                  }`}
                >
                  HINDI
                  <span className="text-orange-600">
                    BHAJAN
                  </span>
                </span>

                <span className="text-[8px] xl:text-[10px] font-extrabold text-gray-500 tracking-[0.35em] uppercase mt-1">
                  Manjari
                </span>
              </div>
            </Link>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* DESKTOP NAV                                                   */}
            {/* ───────────────────────────────────────────────────────────── */}

            <nav
              aria-label="Primary navigation"
              className="hidden xl:flex items-center gap-0.5 mx-3 relative h-full"
              onMouseLeave={scheduleNavClose}
            >
              {/* Active/hover pill */}
              <div
                aria-hidden="true"
                className="absolute h-10 bg-orange-50 rounded-full transition-all duration-300 ease-[cubic-bezier(0.23,1,0.32,1)] pointer-events-none"
                style={{
                  left: pillStyle.left,
                  width: pillStyle.width,
                  opacity: pillStyle.opacity,
                  transform: `scale(${
                    pillStyle.opacity === 0
                      ? 0.95
                      : 1
                  })`,
                }}
              />

              {navItems.map((item) => {
                const isItemActive = item.href
                  ? isActive(item.href)
                  : item.megaMenu?.links?.some(
                      (d: any) =>
                        isActive(d.href)
                    );

                const isHovered =
                  hoveredMenu === item.name;

                return (
                  <div
                    key={item.name}
                    className="relative flex items-center h-full"
                    ref={(el) => {
                      navRefs.current[
                        item.name
                      ] = el;
                    }}
                    onMouseEnter={() =>
                      handleNavMouseEnter(
                        item.name
                      )
                    }
                  >
                    {item.megaMenu ? (
                      <button
                        type="button"
                        title={item.title}
                        aria-haspopup="true"
                        aria-expanded={
                          isHovered
                        }
                        className={`relative z-10 flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-black uppercase tracking-widest whitespace-nowrap rounded-full transition-colors duration-200 ${
                          isItemActive ||
                          isHovered
                            ? "text-orange-700"
                            : "text-gray-700"
                        }`}
                      >
                        {item.name}

                        <FaChevronDown
                          size={10}
                          aria-hidden="true"
                          className={`transition-transform duration-300 opacity-60 ${
                            isHovered
                              ? "rotate-180 text-orange-600"
                              : ""
                          }`}
                        />
                      </button>
                    ) : (
                      <Link
                        href={item.href!}
                        title={item.title}
                        className={`relative z-10 flex items-center gap-1.5 px-3 py-2.5 text-[12px] font-black uppercase tracking-widest whitespace-nowrap rounded-full transition-all duration-200 ${
                          isItemActive ||
                          isHovered
                            ? "text-orange-700"
                            : "text-gray-700"
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}
                  </div>
                );
              })}

              {/* ───────────────────────────────────────────────────────── */}
              {/* MEGA MENU                                                   */}
              {/* ───────────────────────────────────────────────────────── */}

              <div
                className={`absolute top-[90%] left-1/2 -translate-x-1/2 pt-5 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top z-50 ${
                  hasActiveMegaMenu
                    ? "opacity-100 visible translate-y-0 scale-100"
                    : "opacity-0 invisible translate-y-4 scale-95 pointer-events-none"
                }`}
                onMouseEnter={keepMegaMenuOpen}
                onMouseLeave={handleMegaMenuLeave}
              >
                <div className="w-[780px] bg-white/95 backdrop-blur-2xl rounded-[2.5rem] shadow-[0_30px_80px_-15px_rgba(234,88,12,0.25)] border border-white ring-1 ring-black/5 p-3 grid relative overflow-hidden">

                  {navItems
                    .filter(
                      (item) => item.megaMenu
                    )
                    .map((item) => {
                      const isContentActive =
                        hoveredMenu ===
                        item.name;

                      return (
                        <div
                          key={item.name}
                          className={`col-start-1 row-start-1 flex transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                            isContentActive
                              ? "opacity-100 translate-x-0 z-10"
                              : "opacity-0 -translate-x-6 z-0 pointer-events-none"
                          }`}
                        >
                          {/* Featured panel */}
                          <div
                            className={`w-[280px] shrink-0 bg-gradient-to-br ${item.megaMenu!.featured.bg} p-10 rounded-[2rem] flex flex-col justify-between relative overflow-hidden shadow-inner`}
                          >
                            <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/20 rounded-full blur-3xl pointer-events-none" />

                            <div className="relative z-10">
                              {item.megaMenu!
                                .featured
                                .icon}

                              <h3
                                className={`${hind.className} text-white font-black text-3xl leading-tight mb-3 tracking-tight`}
                              >
                                {
                                  item
                                    .megaMenu!
                                    .featured
                                    .title
                                }
                              </h3>

                              <p
                                className={`${hind.className} text-white/90 font-medium text-[15px] leading-relaxed`}
                              >
                                {
                                  item
                                    .megaMenu!
                                    .featured
                                    .desc
                                }
                              </p>
                            </div>

                            <Link
                              href={
                                item
                                  .megaMenu!
                                  .featured
                                  .href
                              }
                              onClick={
                                closeMenu
                              }
                              className="relative z-10 mt-10 inline-flex items-center justify-center gap-2 text-orange-900 font-black text-[15px] bg-white hover:bg-orange-50 px-6 py-3.5 rounded-xl w-full transition-all shadow-md active:scale-95"
                            >
                              Explore All
                              <FaChevronRight
                                size={12}
                                aria-hidden="true"
                              />
                            </Link>
                          </div>

                          {/* Dynamic links */}
                          <div className="flex-1 p-8 grid grid-cols-2 gap-x-6 gap-y-5 content-start">
                            {item.megaMenu!.links.map(
                              (subItem: any) => (
                                <Link
                                  key={
                                    subItem.name
                                  }
                                  href={
                                    subItem.href
                                  }
                                  title={
                                    subItem.desc
                                  }
                                  onClick={
                                    closeMenu
                                  }
                                  className={`group/link flex items-start gap-4 p-4 rounded-2xl transition-all duration-200 ${
                                    isActive(
                                      subItem.href
                                    )
                                      ? "bg-orange-50 ring-1 ring-orange-200/50"
                                      : "hover:bg-gray-50 hover:shadow-sm"
                                  }`}
                                >
                                  <div
                                    className={`w-12 h-12 shrink-0 rounded-2xl flex items-center justify-center text-xl transition-all duration-300 ${
                                      isActive(
                                        subItem.href
                                      )
                                        ? "bg-orange-200/60 text-orange-700 shadow-sm scale-105"
                                        : "bg-white border border-gray-100 text-gray-500 shadow-sm group-hover/link:bg-orange-100 group-hover/link:text-orange-600 group-hover/link:border-orange-200 group-hover/link:scale-105"
                                    }`}
                                  >
                                    {subItem.icon}
                                  </div>

                                  <div className="flex flex-col justify-center pt-0.5 min-w-0">
                                    <p
                                      className={`${hind.className} font-bold text-[16px] leading-tight mb-1 transition-colors ${
                                        isActive(
                                          subItem.href
                                        )
                                          ? "text-orange-800"
                                          : "text-gray-900 group-hover/link:text-orange-600"
                                      }`}
                                    >
                                      {
                                        subItem.name
                                      }
                                    </p>

                                    <p
                                      className={`${hind.className} text-[13px] text-gray-500 font-medium leading-snug line-clamp-1`}
                                    >
                                      {
                                        subItem.desc
                                      }
                                    </p>
                                  </div>
                                </Link>
                              )
                            )}
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </nav>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* DESKTOP ACTIONS                                               */}
            {/* ───────────────────────────────────────────────────────────── */}

            <div className="hidden xl:flex items-center gap-2 shrink-0 z-10">

              {/* Primary CTA — intentionally remains the only prominent
                  action in the main header. */}
              <Link
                href="/donate"
                title="Support Hindi Bhajan Manjari"
                className="mr-2 flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white text-[13px] font-black tracking-wide rounded-full transition-all shadow-md outline-none focus-visible:ring-4 focus-visible:ring-orange-400/50 active:scale-95 whitespace-nowrap"
              >
                <FaHandHoldingHeart
                  className="text-[16px]"
                  aria-hidden="true"
                />
                Support Us
              </Link>

              {/* Search */}
              <button
                type="button"
                onClick={openSearch}
                aria-label="Open search"
                title="Search Bhajans & Articles"
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-600 hover:text-orange-600 hover:bg-orange-50 transition-colors bg-gray-50/50 border border-gray-100"
              >
                <FaSearch
                  size={15}
                  aria-hidden="true"
                />
              </button>

              {/*
               * My Sangrah heart intentionally removed from desktop.
               * It already exists in UtilityBar, preventing duplicate
               * representations of the same destination.
               */}
            </div>

            {/* ───────────────────────────────────────────────────────────── */}
            {/* MOBILE / TABLET ACTIONS                                       */}
            {/* ───────────────────────────────────────────────────────────── */}

            <div className="xl:hidden flex items-center gap-1.5 z-10 relative">

              {/* My Sangrah remains here because UtilityBar is hidden
                  below md and therefore isn't available on mobile. */}
              <Link
                href="/saved"
                aria-label="My Sangrah"
                title="View Saved Bhajans"
                className="w-11 h-11 flex items-center justify-center rounded-full text-gray-600 hover:text-red-500 hover:bg-red-50 transition-colors"
              >
                <FaHeart
                  size={19}
                  aria-hidden="true"
                />
              </Link>

              {/* Support */}
              <Link
                href="/donate"
                className="w-11 h-11 flex items-center justify-center rounded-full text-orange-600 hover:bg-orange-50 transition-colors relative"
                aria-label="Support Us"
                title="Support Us"
              >
                <FaHandHoldingHeart
                  size={22}
                  aria-hidden="true"
                />
              </Link>

              {/* Search */}
              <button
                type="button"
                onClick={openSearch}
                aria-label="Open search"
                title="Search"
                className="w-11 h-11 flex items-center justify-center rounded-full text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
              >
                <FaSearch
                  size={20}
                  aria-hidden="true"
                />
              </button>

              {/* Menu */}
              <button
  ref={mobileMenuButtonRef}
  type="button"
  onClick={openMenu}
  aria-label="Open mobile menu"
  title="Open Menu"
                className="w-12 h-12 flex items-center justify-center rounded-2xl bg-orange-600 text-white hover:bg-orange-700 transition-all shadow-md shadow-orange-600/20 ml-2 active:scale-95"
              >
                <HiMenuAlt3
                  size={26}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>

        {/* ───────────────────────────────────────────────────────────────── */}
        {/* SEARCH PANEL                                                     */}
        {/* ───────────────────────────────────────────────────────────────── */}

        <div
          className={`absolute top-full inset-x-0 bg-white/95 backdrop-blur-xl border-t border-orange-100 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] z-50 transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] origin-top ${
            isSearchOpen
              ? "opacity-100 scale-y-100 visible"
              : "opacity-0 scale-y-95 pointer-events-none invisible"
          }`}
        >
          <div className="max-w-4xl mx-auto px-4 py-8">
            <div className="relative">
              {isSearchOpen && (
                <SearchBar onClose={closeSearch} />
              )}

              <button
                type="button"
                onClick={closeSearch}
                aria-label="Close search"
                title="Close Search"
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors"
              >
                <HiX
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* OVERLAYS                                                            */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      {isSearchOpen && (
        <div
          onClick={closeSearch}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {isMenuOpen && (
        <div
          onClick={closeMenu}
          className="fixed inset-0 bg-black/60 backdrop-blur-md z-[110] xl:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* MOBILE DRAWER                                                       */}
      {/* ─────────────────────────────────────────────────────────────────── */}

      <aside
  ref={mobileMenuRef}
  className={`fixed top-0 right-0 h-full w-[88%] max-w-[400px] z-[120] xl:hidden flex flex-col bg-white shadow-2xl transition-transform duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          isMenuOpen
            ? "translate-x-0"
            : "translate-x-full"
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="flex items-center justify-between px-7 py-6 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center gap-3.5">
            <Image
              src="/favicon.ico"
              alt="Hindi Bhajan Manjari"
              width={40}
              height={40}
              className="object-contain drop-shadow-sm brightness-110"
            />

            <span className="font-black text-gray-900 tracking-widest text-[15px] uppercase">
              Menu
            </span>
          </div>

          <button
            type="button"
            onClick={closeMenu}
            aria-label="Close menu"
            title="Close Menu"
            className="w-11 h-11 flex items-center justify-center rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors active:scale-95"
          >
            <HiX
              size={22}
              aria-hidden="true"
            />
          </button>
        </div>

        <nav
          data-lenis-prevent="true"
          aria-label="Mobile navigation"
          className="flex-1 overflow-y-auto px-5 pt-6 pb-24 flex flex-col gap-3 bg-gray-50/50"
        >
          {navItems.map((item) => (
            <div key={item.name}>
              {item.megaMenu ? (
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                  <button
                    type="button"
                    aria-expanded={
                      expandedMobileMenu ===
                      item.name
                    }
                    onClick={() =>
                      setExpandedMobileMenu(
                        expandedMobileMenu ===
                          item.name
                          ? null
                          : item.name
                      )
                    }
                    className="w-full flex items-center justify-between px-6 py-5 font-black text-[16px] text-gray-800 active:bg-gray-50 transition-colors"
                  >
                    {item.name}

                    <FaChevronDown
                      size={14}
                      aria-hidden="true"
                      className={`text-gray-400 transition-transform duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                        expandedMobileMenu ===
                        item.name
                          ? "rotate-180 text-orange-500"
                          : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-all duration-400 ease-[cubic-bezier(0.23,1,0.32,1)] ${
                      expandedMobileMenu ===
                      item.name
                        ? "grid-rows-[1fr] opacity-100"
                        : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <div className="overflow-hidden bg-gray-50/80">
                      <div className="px-4 pb-5 pt-1 flex flex-col gap-1.5">
                        {item.megaMenu.links.map(
                          (subItem: any) => (
                            <Link
                              key={
                                subItem.name
                              }
                              href={
                                subItem.href
                              }
                              onClick={
                                closeMenu
                              }
                              className={`${hind.className} flex items-center gap-4 py-3.5 px-4 rounded-2xl transition-colors ${
                                isActive(
                                  subItem.href
                                )
                                  ? "bg-orange-100/80 text-orange-700 font-black shadow-sm ring-1 ring-orange-200/50"
                                  : "text-gray-600 hover:bg-white hover:shadow-sm font-bold"
                              }`}
                            >
                              <span
                                className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl ${
                                  isActive(
                                    subItem.href
                                  )
                                    ? "bg-orange-200/60"
                                    : "bg-white shadow-sm border border-gray-100"
                                }`}
                              >
                                {
                                  subItem.icon
                                }
                              </span>

                              {subItem.name}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <Link
                  href={item.href!}
                  onClick={closeMenu}
                  className={`flex items-center justify-between px-6 py-5 rounded-3xl font-black text-[16px] transition-all duration-200 ${
                    isActive(item.href!)
                      ? "bg-orange-100 text-orange-700 shadow-sm border border-orange-200/50"
                      : "bg-white text-gray-800 hover:shadow-sm border border-gray-100"
                  }`}
                >
                  <span className="truncate">
                    {item.name}
                  </span>

                  {isActive(
                    item.href!
                  ) ? (
                    <span
                      className="w-3 h-3 rounded-full bg-orange-500 shadow-sm shrink-0"
                      aria-hidden="true"
                    />
                  ) : (
                    <FaChevronRight
                      size={14}
                      className="text-gray-400 shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              )}
            </div>
          ))}

          <div className="my-5 border-t border-gray-200/80 mx-3" />

          {/* Install App */}
          {deferredPrompt && (
            <button
              type="button"
              onClick={handleInstallClick}
              aria-label="Install App"
              title="Install App for Offline Access"
              className="flex items-center gap-4 px-6 py-4 mb-2 rounded-3xl text-white font-black bg-gradient-to-r from-orange-500 to-red-500 shadow-lg shadow-orange-500/25 active:scale-95 transition-all w-full border border-orange-400/50 text-left"
            >
              <span className="w-11 h-11 flex items-center justify-center shrink-0 rounded-2xl bg-white/25 backdrop-blur-md text-white">
                <FaDownload
                  size={18}
                  aria-hidden="true"
                />
              </span>

              <div className="flex flex-col items-start leading-tight">
                <span className="text-[17px] mb-0.5">
                  Install App
                </span>

                <span className="text-[11px] text-orange-100/90 font-bold tracking-wide">
                  Fast & Offline Access
                </span>
              </div>
            </button>
          )}

          {/* My Sangrah — required on mobile because UtilityBar is hidden */}
          <Link
            href="/saved"
            onClick={closeMenu}
            aria-label="My Sangrah"
            title="View Saved Items"
            className="flex items-center gap-4 px-6 py-4 rounded-3xl text-gray-800 font-black bg-white shadow-sm hover:shadow-md transition-all border border-gray-100"
          >
            <span className="w-11 h-11 flex items-center justify-center rounded-2xl bg-red-50 text-red-500">
              <FaHeart
                size={18}
                aria-hidden="true"
              />
            </span>

            My Sangrah
          </Link>
        </nav>
      </aside>
    </>
  );
}