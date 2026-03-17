"use client";

import { GoogleAnalytics } from '@next/third-parties/google';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';

// 1. We move the logic into an inner component
function AnalyticsInner({ gaId }: { gaId: string }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isInternal, setIsInternal] = useState(false);

  useEffect(() => {
    if (searchParams?.get('admin') === 'true') {
      localStorage.setItem('is_admin_device', 'true');
      alert('Analytics tracking disabled for this device!');
    }

    if (localStorage.getItem('is_admin_device') === 'true') {
      setIsInternal(true);
    }
  }, [searchParams]);

  if (pathname?.startsWith('/admin') || isInternal) {
    return null; 
  }

  return <GoogleAnalytics gaId={gaId} />;
}

// 2. We wrap the inner component in a Suspense boundary so the Next.js build doesn't crash
export default function AnalyticsWrapper({ gaId }: { gaId: string }) {
  return (
    <Suspense fallback={null}>
      <AnalyticsInner gaId={gaId} />
    </Suspense>
  );
}