"use client";

import { useState, useEffect, useRef, useCallback } from "react";
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
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const trendingCache = useRef<SearchItem[] | null>(null);

  /* ---------------- AUTO FOCUS ---------------- */
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  /* ---------------- FETCH SEARCH ---------------- */
  const fetchResults = useCallback(async (term: string) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    if (term === "" && trendingCache.current) {
      setResults(trendingCache.current);
      return;
    }

    setIsSearching(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
        signal: controller.signal,
      });
      if (!res.ok) throw new Error("Search failed");
      const data = await res.json();
      if (term === "") trendingCache.current = data;
      setResults(data || []);
    } catch (err: any) {
      if (err.name !== "AbortError") setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  /* ---------------- DEBOUNCE ---------------- */
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (query.length >= 2 || query.length === 0) {
        fetchResults(query.trim());
      }
    }, 350);

    // 🌟 THE FIX: Properly wrapped cleanup function returns void, not null
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, fetchResults]);

  /* ---------------- ESC CLOSE ---------------- */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
        onClose?.();
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  /* ---------------- OUTSIDE CLICK ---------------- */
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!query.trim()) return;
    setIsFocused(false);
    onClose?.();
    router.push(`/search?q=${encodeURIComponent(query.trim())}`);
  };

  const clearSearch = () => {
    setQuery("");
    inputRef.current?.focus();
    fetchResults("");
  };

  const isTrending = query.trim() === "";
  const showDropdown = isFocused && (results.length > 0 || isSearching);

  const bhajans = results.filter((r) => r.type === "bhajan");
  const articles = results.filter((r) => r.type === "article");

  return (
    <div ref={containerRef} className="relative w-full z-50">
      {/* SEARCH INPUT */}
      <form onSubmit={handleSubmit} className="relative group">
        {/* LEFT ICON */}
        <FaSearch
          className="
          absolute left-4 md:left-5 top-1/2 -translate-y-1/2
          text-[16px] md:text-[18px]
          text-gray-400 group-focus-within:text-orange-500
          pointer-events-none transition
        "
        />

        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder="Search bhajans, aartis, or knowledge..."
          autoComplete="off"
          spellCheck={false}
          className="
          w-full rounded-2xl border-2 border-gray-100 bg-white
          py-4 pl-12 pr-14
          text-base md:text-lg font-medium text-gray-900
          focus:border-orange-400 focus:ring-4 focus:ring-orange-500/20
          outline-none transition-all
        "
        />

        {/* RIGHT ICON */}
        <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2">
          {isSearching ? (
            <FaSpinner className="text-orange-500 animate-spin text-[16px] md:text-[18px]" />
          ) : query ? (
            <button
              type="button"
              onClick={clearSearch}
              className="
              w-8 h-8 md:w-9 md:h-9
              flex items-center justify-center
              rounded-full bg-gray-100
              text-gray-500 hover:bg-red-50 hover:text-red-500
              transition
            "
            >
              <FaTimes className="text-[13px] md:text-[14px]" />
            </button>
          ) : null}
        </div>
      </form>

      {/* DROPDOWN */}
      {showDropdown && (
        <div className="absolute top-full mt-2 w-full rounded-2xl bg-white shadow-2xl border border-gray-100 max-h-[70vh] overflow-y-auto">
          {/* ARTICLES */}
          {articles.length > 0 && (
            <div>
              <div className="px-4 md:px-5 py-2 text-[11px] font-bold uppercase tracking-wider bg-orange-50 text-orange-600 flex items-center gap-2">
                <FaBookOpen className="text-[12px]" /> Sanatan Gyan
              </div>

              {articles.map((item) => (
                <Link
                  key={item.slug}
                  href={`/gyan/${item.slug}`}
                  onClick={() => setIsFocused(false)}
                  className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 hover:bg-orange-50 transition"
                >
                  <div className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-xl bg-orange-100 text-orange-600">
                    <FaBookOpen />
                  </div>
                  <div className="min-w-0">
                    <div className="font-hindi font-semibold text-[16px] md:text-[18px] truncate">
                      {item.title_hindi}
                    </div>
                    <div className="text-[11px] md:text-xs text-gray-500 truncate">
                      {item.title_hinglish}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {/* BHAJANS */}
          {bhajans.length > 0 && (
            <div>
              <div className="px-4 md:px-5 py-2 text-[11px] font-bold uppercase tracking-wider bg-gray-50 text-gray-500 flex items-center gap-2">
                {isTrending ? (
                  <FaFire className="text-orange-500 text-[12px]" />
                ) : (
                  <FaMusic className="text-[12px]" />
                )}
                {isTrending ? "Trending Bhajans" : "Bhajans & Aarti"}
              </div>

              {bhajans.map((item) => (
                <Link
                  key={item.slug}
                  href={`/bhajan/${item.slug}`}
                  onClick={() => setIsFocused(false)}
                  className="flex items-center gap-3 md:gap-4 px-4 md:px-5 py-3 hover:bg-gray-50 transition"
                >
                  <div className="w-9 h-9 md:w-11 md:h-11 flex items-center justify-center rounded-full bg-gray-100 text-gray-500">
                    <FaMusic />
                  </div>
                  <div className="min-w-0">
                    <div className="font-hindi font-semibold text-[16px] md:text-[18px] truncate">
                      {item.title_hindi}
                    </div>
                    <div className="text-[11px] md:text-xs text-gray-500 truncate">
                      {item.title_hinglish}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          {!isTrending && (
            <div className="p-3 border-t">
              <button
                onClick={handleSubmit}
                className="w-full py-3 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center gap-2 hover:bg-orange-200 transition"
              >
                View all results "{query}"
                <FaArrowRight />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}