import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase'; // ⚠️ सुनिश्चित करें कि यह Service Role Key का उपयोग कर रहा हो
import webpush from 'web-push';

// VAPID Configuration
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:nvsict06@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    // 🌟 1. SECURITY CHECK: Validate Webhook Secret
    const authHeader = req.headers.get('x-webhook-secret');
    if (authHeader !== process.env.WEBHOOK_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { record, table, type } = body;

    // 🌟 2. EVENT CHECK: Only proceed for new INSERTs
    if (type !== 'INSERT' || !record) {
      return NextResponse.json({ message: 'Ignored: Not an insert event' });
    }

    // 🌟 3. DYNAMIC CONTENT LOGIC
    let title = "🙏 New Update";
    let message = "New content available"; 
    let path = "/";

    if (table === 'bhajans') {
      title = "🎵 New Bhajan Published";
      const bhajanTitle = record.title_hindi || record.title_hinglish || "एक नया शानदार भजन";
      message = `प्रस्तुत है: ${bhajanTitle}`;
      const bhajanSlug = record.slug || '';
      path = `/bhajan/${bhajanSlug}`;
      
    } else if (table === 'articles') {
      title = "📖 New Gyan Article";
      message = record.title_hindi || record.title || "नया लेख";
      const articleSlug = record.slug || '';
      path = `/gyan/${articleSlug}`; // ज्ञान आर्टिकल्स के लिए पाथ
    }

    // 🌟 4. CONSTRUCT FULL URL
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.hindibhajanmanjari.com';
    const fullUrl = `${baseUrl}${path}`;

    const payload = JSON.stringify({ 
      title: title, 
      body: message, 
      url: fullUrl 
    });

    // 🌟 5. FETCH SUBSCRIBERS
    const { data: subscriptions, error } = await supabase.from('push_subscriptions').select('*');

    if (error) {
      throw new Error(`Failed to fetch subscriptions: ${error.message}`);
    }

    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscribers found' });
    }

    // 🌟 6. BROADCAST & CLEANUP DEAD SUBSCRIPTIONS
    await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          await webpush.sendNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            payload
          );
        } catch (err: any) {
          // 410 (Gone) or 404 (Not Found) means the user unsubscribed or cleared browser data
          if (err.statusCode === 410 || err.statusCode === 404) {
            await supabase.from('push_subscriptions').delete().eq('id', sub.id);
          } else {
             console.error(`Push error for endpoint ${sub.endpoint}:`, err);
          }
        }
      })
    );

    return NextResponse.json({ success: true, message: `Broadcasted to ${subscriptions.length} users` });
    
  } catch (error: any) {
    console.error('Auto-push error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}