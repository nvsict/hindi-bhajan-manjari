'use client';

import { useEffect } from 'react';

export default function PwaRegistration() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('PWA Ready: Offline Caching Enabled');
          })
          .catch((error) => {
            console.error('PWA Registration failed:', error);
          });
      });
    }
  }, []);

  return null; // This component is invisible
}