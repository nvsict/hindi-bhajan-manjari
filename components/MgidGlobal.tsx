"use client";

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import MgidWidget from './MgidWidget';

export default function MgidGlobal() {
  const pathname = usePathname();

  // 🌟 अगर URL '/admin' से शुरू होता है, तो कोई ऐड स्क्रिप्ट या विजेट लोड न करें!
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <>
      {/* 🌟 MGID Global Loader: यह सिर्फ पब्लिक पेजों पर ही लोड होगा */}
      <Script 
        src="https://jsc.mgid.com/site/1114048.js" 
        strategy="afterInteractive" 
      />
      
      {/* 🌟 In-Site Notification Widget (ID: 2090466) */}
      <MgidWidget widgetId="2090466" minHeight={0} label="" className="!m-0 !p-0" />
    </>
  );
}