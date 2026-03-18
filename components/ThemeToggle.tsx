"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { FaSun, FaMoon } from "react-icons/fa6";

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div className="w-9 h-9" />; // Invisible placeholder to prevent layout shift
  }

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="w-9 h-9 flex items-center justify-center rounded-full bg-orange-100 dark:bg-gray-800 text-orange-600 dark:text-orange-400 hover:bg-orange-200 dark:hover:bg-gray-700 transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
      aria-label="Toggle Theme"
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
    >
      {theme === 'dark' ? (
        <FaSun size={16} className="animate-in spin-in-90 duration-300" />
      ) : (
        <FaMoon size={16} className="animate-in spin-in-[-90deg] duration-300" />
      )}
    </button>
  );
}