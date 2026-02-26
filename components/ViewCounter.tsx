"use client";

import { useEffect } from 'react';
import { supabase } from '../utils/supabase';

export default function ViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const recordView = async () => {
      // 1. Check if we already counted this user's view during this session
      const hasViewed = sessionStorage.getItem(`viewed_${slug}`);
      
      if (!hasViewed) {
        // 2. If not, trigger our Supabase SQL function
        const { error } = await supabase.rpc('increment_view_count', { 
          bhajan_slug: slug 
        });

        if (!error) {
          // 3. Mark as viewed in the browser so we don't double-count on refresh
          sessionStorage.setItem(`viewed_${slug}`, 'true');
        } else {
          console.error("Failed to record view:", error);
        }
      }
    };

    recordView();
  }, [slug]);

  // This component renders absolutely nothing to the screen
  return null; 
}