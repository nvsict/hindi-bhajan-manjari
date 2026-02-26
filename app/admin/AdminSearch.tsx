"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function AdminSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') || '');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/admin?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/admin`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="flex w-full md:max-w-md relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search bhajans by title or slug..."
        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:bg-white transition-all text-sm font-medium text-gray-700"
      />
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <button 
        type="submit" 
        className="hidden" // Hiding the button because pressing 'Enter' works perfectly
      >
        Search
      </button>
    </form>
  );
}