"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaSearch,
  FaMusic,
  FaBookOpen,
  FaTimes,
  FaSpinner,
  FaArrowRight,
  FaFire,
  FaInfoCircle
} from "react-icons/fa";

interface SearchItem {
  title_hinglish: string;
  title_hindi: string;
  slug: string;
  type: "bhajan" | "article";
}

interface SearchBarProps {
  onClose?: () => void;
}

export default function SearchBar({ onClose }: SearchBarProps) {
  // UI States
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  // Data States
  const [results, setResults] = useState<SearchItem[]>([]);
  const [trending, setTrending] = useState<SearchItem[]>([]);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  /* ---------------- AUTO FOCUS ---------------- */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* ---------------- FETCH TRENDING (ONCE) ---------------- */
  useEffect(() => {
    // Fetches trending data once on mount so it doesn't re-fetch on every empty backspace
    fetch(`/api/search?q=`)
      .then((res) => res.json())
      .then((data) => setTrending(data || []))
      .catch(() => console.error("Failed to load trending items"));
  }, []);

  /* ---------------- SMART DEBOUNCE ---------------- */
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => clearTimeout(handler);
  }, [query]);

  /* ---------------- SEARCH FETCH ENGINE ---------------- */
  useEffect(() => {
    if (!debouncedQuery) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);

    fetch(`/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
      signal: controller.signal,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Search failed");
        return res.json();
      })
      .then((data) => {
        setResults(data || []);
      })
      .catch((err) => {
        // Only clear results if it's an actual error, not an abort from fast typing
        if (err.name !== "AbortError") {
          setResults([]);
        }
      })
      .finally(() => {
        setIsSearching(false);
      });

    return () => controller.abort(); // Cancels previous request if user keeps typing
  }, [debouncedQuery]);

  /* ---------------- EVENT LISTENERS (ESC & CLICK OUTSIDE) ---------------- */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
        onClose?.();
      }
    };
    const handleClickOutside = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  /* ---------------- ACTIONS ---------------- */
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setIsFocused(false);
    onClose?.();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const clearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    inputRef.current?.focus();
  };

  // Derived UI logic
  const isTrendingView = !debouncedQuery;
  const displayData = isTrendingView ? trending : results;
  const showDropdown = isFocused && (displayData.length > 0 || isSearching || debouncedQuery);

  const bhajans = displayData.filter((r) => r.type === "bhajan");
  const articles = displayData.filter((r) => r.type === "article");

  return (
    <div ref={containerRef} className="relative w-full z-50">
      
      {/* SEARCH INPUT */}
      <form onSubmit={handleSubmit} className="relative group">
        <FaSearch className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-[16px] md:text-[18px] text-gray-500 group-focus-within:text-orange-500 pointer-events-none transition-colors" />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search bhajans, aartis, or knowledge..."
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-2xl border-2 border-gray-100 bg-white py-4 pl-12 pr-14 text-base md:text-lg font-medium text-gray-900 focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20 outline-none transition-all shadow-sm"
        />

        {/* LOADING OR CLEAR ICON */}
        <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <FaSpinner className="text-orange-500 animate-spin text-[16px] md:text-[18px]" />
          ) : query ? (
            <button
              type="button"
              onClick={clearSearch}
              className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors"
            >
              <FaTimes className="text-[13px] md:text-[14px]" />
            </button>
          ) : null}
        </div>
      </form>

      {/* DROPDOWN MENU */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[70vh] overflow-y-auto custom-scrollbar animate-fade-in-up">
          
          {/* ==========================================
              STATE 1: EMPTY / ERROR FALLBACK
              ========================================== */}
          {!isTrendingView && results.length === 0 && !isSearching && (
            <div className="p-8 text-center flex flex-col items-center justify-center animate-fade-in">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mb-4 border border-orange-100">
                <FaInfoCircle className="text-orange-400 text-2xl" />
              </div>
              <p className="text-gray-900 font-black text-lg mb-1">No instant suggestions found</p>
              <p className="text-gray-500 text-sm font-medium mb-6">We couldn't find a quick match for <span className="font-bold text-gray-800">"{query}"</span> in our suggestions.</p>
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-gray-900 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 hover:bg-black hover:shadow-lg hover:-translate-y-0.5 transition-all"
              >
                <FaSearch size={14} /> Search Entire Database
              </button>
            </div>
          )}

          {/* ==========================================
              STATE 2: RESULTS (ARTICLES & BHAJANS)
              ========================================== */}
          {(articles.length > 0 || bhajans.length > 0) && (
            <div className={isSearching ? "opacity-50 pointer-events-none transition-opacity" : "transition-opacity"}>
              
              {/* ARTICLES SECTION */}
              {articles.length > 0 && (
                <div>
                  <div className="px-4 md:px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-orange-50/80 text-orange-600 flex items-center gap-2 border-y border-orange-100">
                    <FaBookOpen /> Sanatan Gyan
                  </div>
                  {articles.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/gyan/${item.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-center gap-4 px-4 md:px-5 py-3 hover:bg-orange-50/50 transition-colors group border-b border-gray-50 last:border-0"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-orange-100 text-orange-500 group-hover:scale-105 transition-transform">
                        <FaBookOpen size={14} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-hindi font-bold text-[16px] md:text-[17px] text-gray-900 truncate">
                          {item.title_hindi}
                        </div>
                        <div className="text-[11px] md:text-xs font-medium text-gray-500 truncate">
                          {item.title_hinglish}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* BHAJANS SECTION */}
              {bhajans.length > 0 && (
                <div>
                  <div className="px-4 md:px-5 py-2.5 text-[10px] font-black uppercase tracking-widest bg-gray-50 text-gray-500 flex items-center gap-2 border-y border-gray-100">
                    {isTrendingView ? <FaFire className="text-orange-500" /> : <FaMusic />}
                    {isTrendingView ? "Trending Bhajans" : "Bhajans & Aarti"}
                  </div>
                  {bhajans.map((item) => (
                    <Link
                      key={item.slug}
                      href={`/bhajan/${item.slug}`}
                      onClick={() => setIsFocused(false)}
                      className="flex items-center gap-4 px-4 md:px-5 py-3 hover:bg-gray-50 transition-colors group border-b border-gray-50 last:border-0"
                    >
                      <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 group-hover:scale-105 group-hover:bg-orange-100 group-hover:text-orange-600 transition-all">
                        <FaMusic size={12} />
                      </div>
                      <div className="min-w-0">
                        <div className="font-hindi font-bold text-[16px] md:text-[17px] text-gray-900 truncate">
                          {item.title_hindi}
                        </div>
                        <div className="text-[11px] md:text-xs font-medium text-gray-500 truncate">
                          {item.title_hinglish}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ==========================================
              BOTTOM ACTION: VIEW ALL RESULTS
              ========================================== */}
          {!isTrendingView && (results.length > 0 || isSearching) && (
            <div className="p-3 border-t border-gray-100 bg-gray-50/50 sticky bottom-0 z-10">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-orange-100/80 text-orange-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-orange-200 transition-colors"
              >
                View all results for "{query}" <FaArrowRight size={12} />
              </button>
            </div>
          )}

        </div>
      )}
    </div>
  );
}