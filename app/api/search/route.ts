import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase'; // Adjust this path to wherever your supabase client is!

export async function GET(request: Request) {
  // 1. Grab the search query from the URL (e.g., /api/search?q=krishna)
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  try {
    // 2. If there is NO query, return the default "Trending" or "Latest" Bhajans
    if (!query) {
      const { data, error } = await supabase
        .from('bhajans')
        .select('title_hinglish, title_hindi, slug')
        .order('view_count', { ascending: false }) // Or order by 'created_at'
        .limit(5);

      if (error) throw error;
      return NextResponse.json(data);
    }

    // 3. If there IS a query, use your high-speed Trigram indexes to find matches!
    const { data, error } = await supabase
      .from('bhajans')
      .select('title_hinglish, title_hindi, slug')
      .or(`title_hinglish.ilike.%${query}%,title_hindi.ilike.%${query}%`)
      .limit(5);

    if (error) throw error;
    
    // 4. Send the clean data back to the user's browser
    return NextResponse.json(data);

  } catch (error: any) {
    console.error("Search API Error:", error.message);
    return NextResponse.json({ error: "Failed to fetch search results" }, { status: 500 });
  }
}