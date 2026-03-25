'use client';

import { useEffect } from 'react';

export default function PwaRegistration() {
  useEffect(() => {
    // 🌟 THE FIX: Only register Service Worker in PRODUCTION
    if (
      typeof window !== 'undefined' && 
      'serviceWorker' in navigator &&
      process.env.NODE_ENV === 'production'
    ) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA Ready: Offline Caching Enabled 🚀');
          })
          .catch((error) => {
            console.error('PWA Registration failed:', error);
          });
      });
    } else if (process.env.NODE_ENV === 'development') {
      // 🌟 Clean log for local development
      console.log('PWA Service Worker registration skipped in Development mode.');
    }
  }, []);

  return null; // This component is invisible
}