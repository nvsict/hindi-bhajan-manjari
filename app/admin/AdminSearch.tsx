"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function AdminSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Initialize state with whatever is currently in the URL
  const initialQuery = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(initialQuery);

  // The Debounce Magic 🪄
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (searchTerm) {
        params.set('q', searchTerm);
      } else {
        params.delete('q');
      }
      
      // Update the URL without reloading the page
      router.replace(`${pathname}?${params.toString()}`);
    }, 300); // Waits 300ms after user stops typing to execute

    // Cleanup function to reset the timer if user keeps typing
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, pathname, router, searchParams]);

  return (
    <div className="relative w-full md:w-72">
      <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
      <input
        type="text"
        placeholder="Search by Title or Slug..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all text-sm shadow-sm"
      />
    </div>
  );
}