import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase'; // Adjust this path to wherever your supabase client is!

// 🌟 THE FIX: Define the exact shape of our combined search results
interface SearchResult {
  title_hindi: string;
  title_hinglish: string;
  slug: string;
  type: 'bhajan' | 'article';
}

export async function GET(request: Request) {
  // 1. Grab the search query from the URL (e.g., /api/search?q=krishna)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    // 2. SCENARIO 1: If there is NO query, return the default "Trending" Bhajans
    if (!query || query.trim().length === 0) {
      const { data, error } = await supabase
        .from('bhajans')
        .select('title_hinglish, title_hindi, slug')
        .order('view_count', { ascending: false }) // Or order by 'created_at'
        .limit(5);

      if (error) throw error;
      
      // Inject the 'type' so the new frontend Omni-Search component can read it
      const formattedData: SearchResult[] = data.map(item => ({ 
        title_hindi: item.title_hindi,
        title_hinglish: item.title_hinglish,
        slug: item.slug,
        type: 'bhajan' 
      }));
      
      return NextResponse.json(formattedData);
    }

    // 3. SCENARIO 2: OMNI-SEARCH (If there IS a query)
    const [bhajansResponse, articlesResponse] = await Promise.all([
      // A. Search Bhajans using Trigram matches
      supabase
        .from('bhajans')
        .select('title_hinglish, title_hindi, slug')
        .or(`title_hinglish.ilike.%${query}%,title_hindi.ilike.%${query}%`)
        .limit(5),

      // B. Search Articles (Gyan) - Only fetching published ones
      supabase
        .from('articles')
        .select('title_hindi, title_hinglish, slug')
        .eq('is_published', true)
        .or(`title_hindi.ilike.%${query}%,title_hinglish.ilike.%${query}%`)
        .limit(3)
    ]);

    if (bhajansResponse.error) throw bhajansResponse.error;
    if (articlesResponse.error) throw articlesResponse.error;
    
    // 4. Combine and categorize the results
    // 🌟 THE FIX: Tell TypeScript this array will strictly hold SearchResult objects
    const results: SearchResult[] = [];

    if (bhajansResponse.data) {
      bhajansResponse.data.forEach(item => {
        results.push({ ...item, type: 'bhajan' });
      });
    }

    if (articlesResponse.data) {
      articlesResponse.data.forEach(item => {
        results.push({ ...item, type: 'article' });
      });
    }

    // 5. Send the unified, categorized data back to the user's browser
    return NextResponse.json(results);

  } catch (error: any) {
    console.error("Omni-Search API Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}