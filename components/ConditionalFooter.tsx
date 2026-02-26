"use client";

import { usePathname } from 'next/navigation';
import Footer from './Footer';

export default function ConditionalFooter() {
  const pathname = usePathname();
  
  // 🌟 THE FIX: Hide footer on BOTH admin and widget routes
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/widget')) {
    return null;
  }

  return <Footer />;
}