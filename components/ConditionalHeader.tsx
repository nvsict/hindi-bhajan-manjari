"use client";

import { usePathname } from 'next/navigation';
import Header from './Header'; // Make sure this path is correct

export default function ConditionalHeader() {
  const pathname = usePathname();
  
  // 🌟 THE FIX: Hide the header on both admin pages and embeddable widgets
  if (pathname?.startsWith('/admin') || pathname?.startsWith('/widget')) {
    return null;
  }

  // Otherwise, render the normal public Header
  return <Header />;
}