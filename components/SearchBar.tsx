"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaSearch, FaMusic } from 'react-icons/fa';

interface SearchItem {
  title_hinglish: string;
  title_hindi: string;
  slug: string;
}

interface SearchBarProps {
  onClose?: () => void; 
}

export default function SearchBar({ onClose }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false); // Added loading state
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter(); 

  // 🌟 NEW: Server-Side Search Function
  const fetchSearchResults = async (searchTerm: string) => {
    if (searchTerm.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    setIsSearching(true);
    try {
      // 🌟 MAGIC: We hit your new API route, bypassing ISP blocks and AdBlockers
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
      
      if (!response.ok) throw new Error("Search failed");
      
      const data = await response.json();
      setResults(data || []);
      setIsOpen(true);
    } catch (error) {
      console.error("Instant Search Error:", error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  // 🌟 Debounce the search so we don't spam the API on every single keystroke
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        fetchSearchResults(query);
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300); // Wait 300ms after typing stops before searching

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      setIsOpen(false); 
      if (onClose) onClose(); 
      router.push(`/search?q=${encodeURIComponent(q)}`); 
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative w-full z-50" ref={searchRef}>
      
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <FaSearch className={`absolute left-4 ${isSearching ? 'text-orange-200 animate-pulse' : 'text-orange-400'}`} />
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search for a bhajan, aarti, or chalisa... (Press Enter for all)"
          className="w-full bg-gray-50 border-2 border-gray-100 focus:border-orange-400 focus:bg-white focus:shadow-xl focus:shadow-orange-900/5 rounded-2xl py-4 pl-14 pr-14 text-base md:text-lg text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400"
        />
      </form>

      {/* Instant Dropdown Results */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-orange-100 overflow-hidden py-2">
          {results.map((item) => (
            <Link 
              href={`/bhajan/${item.slug}`} 
              key={item.slug}
              onClick={() => { setIsOpen(false); if (onClose) onClose(); }}
              className="block hover:bg-orange-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="flex items-center gap-3 px-5 py-3">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center shrink-0">
                  <FaMusic size={12} />
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 line-clamp-1">{item.title_hindi}</h4>
                  <p className="text-xs text-gray-500 font-medium">{item.title_hinglish}</p>
                </div>
              </div>
            </Link>
          ))}
          
          <button 
            type="button"
            onClick={handleSubmit}
            className="w-full text-center py-3 bg-gray-50 text-orange-600 text-sm font-bold hover:bg-orange-100 transition-colors"
          >
            See all results for "{query}" &rarr;
          </button>
        </div>
      )}

      {/* No Results Fallback */}
      {isOpen && !isSearching && query.length >= 2 && results.length === 0 && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-orange-100 p-6 text-center">
          <p className="text-gray-500 font-medium">No exact matches found.</p>
          <button 
            type="button"
            onClick={handleSubmit}
            className="mt-3 px-4 py-2 bg-orange-50 text-orange-600 rounded-full text-sm font-bold hover:bg-orange-100"
          >
            Search entire database
          </button>
        </div>
      )}
    </div>
  );
}