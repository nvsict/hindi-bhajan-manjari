import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase'; // Adjust this path to wherever your supabase client is!

interface SearchResult {
  title_hindi: string;
  title_hinglish: string;
  slug: string;
  type: 'bhajan' | 'article';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    // 1. SCENARIO 1: If there is NO query, return Trending Bhajans (Using our Materialized View for 0ms load!)
    if (!query || query.trim().length === 0) {
      const { data, error } = await supabase
        .from('mv_bhajan_details') // 🌟 Changed to Materialized View
        .select('title_hinglish, title_hindi, slug')
        .order('view_count', { ascending: false })
        .limit(5);

      if (error) throw error;
      
      const formattedData: SearchResult[] = (data || []).map(item => ({ 
        title_hindi: item.title_hindi,
        title_hinglish: item.title_hinglish,
        slug: item.slug,
        type: 'bhajan' 
      }));
      
      return NextResponse.json(formattedData);
    }

    // 2. SCENARIO 2: OMNI-SEARCH (Using Full Text Search 'fts_search' instead of slow .ilike())
    const sanitizedQuery = query.trim().replace(/[^\w\sà-ūÀ-Ū]/gi, ''); // Clean special chars for FTS

    const [bhajansResponse, articlesResponse] = await Promise.all([
      // A. Search Bhajans using FTS (Super fast!)
      supabase
        .from('bhajans')
        .select('title_hinglish, title_hindi, slug')
        .textSearch('fts_search', sanitizedQuery, {
          type: 'plain',
          config: 'simple'
        })
        .limit(5),

      // B. Search Articles (Gyan) - Published ones
      supabase
        .from('articles')
        .select('title_hindi, title_hinglish, slug')
        .eq('is_published', true)
        .or(`title_hindi.ilike.%${query}%,title_hinglish.ilike.%${query}%`)
        .limit(3)
    ]);

    if (bhajansResponse.error) throw bhajansResponse.error;
    if (articlesResponse.error) throw articlesResponse.error;
    
    // 3. Combine and categorize the results
    const results: SearchResult[] = [];

    if (bhajansResponse.data) {
      bhajansResponse.data.forEach((item: any) => {
        results.push({ 
          title_hindi: item.title_hindi,
          title_hinglish: item.title_hinglish,
          slug: item.slug,
          type: 'bhajan' 
        });
      });
    }

    if (articlesResponse.data) {
      articlesResponse.data.forEach((item: any) => {
        results.push({ 
          title_hindi: item.title_hindi,
          title_hinglish: item.title_hinglish,
          slug: item.slug,
          type: 'article' 
        });
      });
    }

    return NextResponse.json(results);

  } catch (error: any) {
    console.error("Omni-Search API Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}