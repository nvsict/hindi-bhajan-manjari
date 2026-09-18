import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

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
    if (!query || query.trim().length === 0) {
      const { data, error } = await supabase
        .from('mv_bhajan_details')
        .select('title_hinglish, title_hindi, slug')
        .order('view_count', { ascending: false })
        .limit(5);

      if (error) throw error;

      const formattedData: SearchResult[] = (data || []).map((item) => ({
        title_hindi: item.title_hindi,
        title_hinglish: item.title_hinglish,
        slug: item.slug,
        type: 'bhajan',
      }));

      return NextResponse.json(formattedData);
    }

    const rawQuery = query.trim();

    const [bhajansResponse, articlesResponse] = await Promise.all([
      supabase.rpc('search_bhajans', {
        search_query: rawQuery,
        match_limit: 5,
      }),
      supabase.rpc('search_articles', {
        search_query: rawQuery,
        match_limit: 3,
      }),
    ]);

    if (bhajansResponse.error) throw bhajansResponse.error;
    if (articlesResponse.error) throw articlesResponse.error;

    const results: SearchResult[] = [
      ...(bhajansResponse.data || []).map((item: any) => ({
        title_hindi: item.title_hindi,
        title_hinglish: item.title_hinglish || '',
        slug: item.slug,
        type: 'bhajan' as const,
      })),
      ...(articlesResponse.data || []).map((item: any) => ({
        title_hindi: item.title_hindi,
        title_hinglish: item.title_hinglish || '',
        slug: item.slug,
        type: 'article' as const,
      })),
    ];

    return NextResponse.json(results);
  } catch (error: any) {
    console.error('Omni-Search API Error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch search results' }, { status: 500 });
  }
}