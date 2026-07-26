"use client";

import { useEffect, useRef } from 'react';
import { db } from '@/utils/db';

interface ReadingTrackerProps {
  slug: string;
}

export default function ReadingTracker({ slug }: ReadingTrackerProps) {
  const isInitialMount = useRef(true);

  useEffect(() => {
    // 1. 🌟 Record Reading History
    const recordHistory = async () => {
      try {
        await db.readingHistory.add({
          slug: slug,
          openedAt: new Date().toISOString()
        });
      } catch (error) {
        console.error("Failed to save history", error);
      }
    };
    recordHistory();

    // 2. 🌟 Resume Scroll Position (Continue Reading)
    const resumeScroll = async () => {
      try {
        const setting = await db.appSettings.get(`scroll_${slug}`);
        if (setting && setting.value > 0) {
          // थोडा डिले देते हैं ताकि पेज का कंटेंट पूरा रेंडर हो जाए
          setTimeout(() => {
            window.scrollTo({ top: setting.value, behavior: 'smooth' });
          }, 500);
        }
      } catch (error) {}
    };
    resumeScroll();

    // 3. 🌟 Track and Save Scroll Position on Scroll
    let scrollTimeout: NodeJS.Timeout;
    const handleScroll = () => {
      // Debounce logic ताकि हर पिक्सेल स्क्रॉल पर डेटाबेस सेव न हो (परफॉरमेंस के लिए)
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(async () => {
        const currentScrollY = window.scrollY;
        // सिर्फ तभी सेव करें जब यूज़र थोड़ा नीचे गया हो
        if (currentScrollY > 100) {
          await db.appSettings.put({ key: `scroll_${slug}`, value: currentScrollY });
        }
      }, 1000); // यूज़र के स्क्रॉल रोकने के 1 सेकंड बाद सेव होगा
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [slug]);

  return null; // यह कंपोनेंट UI में कुछ नहीं दिखाएगा
}