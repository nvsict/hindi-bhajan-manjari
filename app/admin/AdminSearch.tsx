"use client";

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useState, useRef } from 'react';
import { FaSearch } from 'react-icons/fa';

export default function AdminSearch() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // URL से इनिशियल वैल्यू उठाएं
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  
  // टाइमर को सेव करने के लिए useRef का इस्तेमाल (No useEffect needed!)
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // 🌟 यह फंक्शन सिर्फ तब चलेगा जब यूज़र सच में कुछ टाइप करेगा
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value); // तुरंत UI में टेक्स्ट अपडेट करें

    // अगर पहले से कोई टाइमर चल रहा है, तो उसे रोकें
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // नया टाइमर सेट करें (300ms बाद URL अपडेट होगा)
    debounceTimer.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      
      if (value) {
        params.set('q', value);
      } else {
        params.delete('q');
      }
      
      // 🌟 URL को शांति से अपडेट करें, बिना पेज को जंप कराए
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
  };

  return (
    <div className="relative w-full md:w-80">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <FaSearch className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder="Search bhajans..."
        value={searchTerm}
        onChange={handleSearchChange} // 👈 Direct bind, no useEffect
        className="w-full pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-2xl text-sm font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all shadow-sm"
      />
    </div>
  );
}