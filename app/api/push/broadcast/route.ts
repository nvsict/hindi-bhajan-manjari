import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import webpush from 'web-push';

// Configure the web-push library with your VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:admin@hindibhajanmanjari.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    // 1. Get the message details from your admin form
    const { title, body, url } = await req.json();

    if (!title || !body) {
      return NextResponse.json({ error: 'Title and body are required' }, { status: 400 });
    }

    // 2. Fetch all active subscribers from your database
    const { data: subscriptions, error } = await supabase
      .from('push_subscriptions')
      .select('*');

    if (error) throw error;
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ message: 'No subscribers found.' });
    }

    // 3. Prepare the encrypted payload
    const payload = JSON.stringify({
      title: title,
      body: body,
      url: url || '/', // Default to homepage if no URL is provided
    });

    let successCount = 0;
    let failCount = 0;

    // 4. Fire them all off simultaneously
    const pushPromises = subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
          payload
        );
        successCount++;
      } catch (err: any) {
        failCount++;
        // 🌟 AUTO-CLEANUP: If the user revoked permission, delete them from the database
        if (err.statusCode === 410 || err.statusCode === 404) {
          console.log(`Subscriber ${sub.id} expired. Cleaning up...`);
          await supabase.from('push_subscriptions').delete().eq('id', sub.id);
        } else {
          console.error('Push error for subscriber:', sub.id, err);
        }
      }
    });

    // Wait for all messages to finish sending
    await Promise.all(pushPromises);

    return NextResponse.json({ 
      success: true, 
      message: `Broadcast complete! Sent: ${successCount}, Failed/Cleaned: ${failCount}` 
    });

  } catch (error: any) {
    console.error('Broadcast API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// ... existing POST function ...

export async function GET() {
  try {
    const { count, error } = await supabase
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    return NextResponse.json({ count: count || 0 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}