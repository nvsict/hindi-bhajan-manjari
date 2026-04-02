"use client";

import { useEffect } from 'react';
import { supabase } from '@/utils/supabase';

export default function ArticleViewCounter({ slug }: { slug: string }) {
  useEffect(() => {
    const recordView = async () => {
      // 1. Session check so we don't spam the database
      const hasViewed = sessionStorage.getItem(`viewed_article_${slug}`);
      
      if (!hasViewed) {
        // 2. Call the NEW SQL function for articles
        const { error } = await supabase.rpc('increment_article_view', { 
          article_slug: slug 
        });

        if (!error) {
          sessionStorage.setItem(`viewed_article_${slug}`, 'true');
        } else {
          console.error("Failed to record article view:", error);
        }
      }
    };

    recordView();
  }, [slug]);

  return null; 
}