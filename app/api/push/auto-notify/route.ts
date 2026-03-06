import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import webpush from 'web-push';

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:nvsict06@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('x-webhook-secret');
    if (authHeader !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { record, table, type } = body;

    if (type !== 'INSERT' || !record) {
      return NextResponse.json({ message: 'Ignore: Not an insert event' });
    }

    // 1. DYNAMIC CONTENT LOGIC 🌟
    let title = "🙏 New Update";
    let message = "New content available"; 
    let path = "/";

    // ✅ टेबल का नाम 'bhajans' ही है (जैसा आपके स्कीमा में है)
    if (table === 'bhajans') {
      title = "🎵 New Bhajan Published";
      
      // ✅ FIX 1: स्कीमा के अनुसार 'title_hindi' का उपयोग किया गया है
      const bhajanTitle = record.title_hindi || record.title_hinglish || "एक नया शानदार भजन";
      message = `प्रस्तुत है: ${bhajanTitle}`;
      
      // ✅ FIX 2: /bhajans/ की जगह /bhajan/ कर दिया गया है
      const bhajanSlug = record.slug || '';
      path = `/bhajan/${bhajanSlug}`;
      
    } else if (table === 'articles') {
      title = "📖 New Gyan Article";
      message = record.title_hindi || record.title || "नया लेख";
      path = `/articles/${record.slug || ''}`;
    }

    // 2. CONSTRUCT FULL URL
    const fullUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://www.hindibhajanmanjari.com'}${path}`;

    const payload = JSON.stringify({ 
      title: title, 
      body: message, 
      url: fullUrl 
    });

    // 3. BROADCAST
    const { data: subscriptions } = await supabase.from('push_subscriptions').select('*');

    if (!subscriptions || subscriptions.length === 0) return NextResponse.json({ success: true });

    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
        } catch (err: any) {
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          }
        }
      })
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Auto-push error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}