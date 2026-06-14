import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url || !url.includes('amazon.')) {
      return NextResponse.json({ error: 'Valid Amazon URL is required' }, { status: 400 });
    }

    // अमेज़न के बॉट-ब्लॉकर से बचने के लिए एक असली ब्राउज़र जैसा User-Agent
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    if (!response.ok) throw new Error('Failed to fetch Amazon page');

    const html = await response.text();
    const $ = cheerio.load(html);

    // 🌟 टाइटल और इमेज को स्मार्टली ढूँढना
    const title = $('#productTitle').text().trim() || $('meta[property="og:title"]').attr('content') || '';
    const imageUrl = $('#landingImage').attr('src') || $('meta[property="og:image"]').attr('content') || '';
    
    // प्राइस निकालना (अमेज़न अक्सर प्राइस के क्लास बदलता रहता है, यह सबसे कॉमन वाला है)
    const price = $('.a-price-whole').first().text().replace('.', '').trim() || '';

    return NextResponse.json({ 
      title, 
      imageUrl, 
      price: price ? `₹${price}` : '' 
    });

  } catch (error) {
    console.error('Amazon Fetch Error:', error);
    return NextResponse.json({ error: 'Failed to scrape Amazon data. Please enter manually.' }, { status: 500 });
  }
}