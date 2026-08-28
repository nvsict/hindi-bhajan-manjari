import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// 1. Initialize Supabase Admin (Bypasses RLS to read all subs)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 2. Configure Web Push with your VAPID keys
webpush.setVapidDetails(
  'mailto:contact@hindibhajanmanjari.com', // Must be a valid email (or your subject URL)
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

// ============================================================================
// GET: Fetch total live subscriber count for your Dashboard
// ============================================================================
export async function GET() {
  try {
    const { count, error } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(error.message);
    return NextResponse.json({ count: count || 0 });
  } catch (error: any) {
    return NextResponse.json({ count: 0, error: error.message }, { status: 500 });
  }
}

// ============================================================================
// POST: Execute the Broadcast safely
// ============================================================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, message, url } = body;

    if (!title || !message) {
      return NextResponse.json({ error: 'Title and message are required' }, { status: 400 });
    }

    // 1. Fetch all subscriptions from Supabase
    const { data: subscriptions, error: dbError } = await supabaseAdmin
      .from('push_subscriptions')
      .select('*');

    if (dbError) throw new Error(dbError.message);
    if (!subscriptions || subscriptions.length === 0) {
      return NextResponse.json({ success: true, totalSent: 0, removed: 0 });
    }

    const payload = JSON.stringify({
      title,
      message,
      url: url || 'https://hindibhajanmanjari.com',
    });

    let successCount = 0;
    let removedCount = 0;

    // 2. Map through subs and send individually so one failure doesn't break the loop
    const sendPromises = subscriptions.map(async (sub) => {
      const pushSubscription = {
        endpoint: sub.endpoint,
        keys: {
          p256dh: sub.p256dh,
          auth: sub.auth,
        },
      };

      try {
        await webpush.sendNotification(pushSubscription, payload);
        successCount++;
      } catch (error: any) {
        // 3. Auto-clean Dead Subscriptions
        // 410 (Gone) or 404 (Not Found) means the user unsubscribed or token expired
        if (error.statusCode === 410 || error.statusCode === 404) {
          await supabaseAdmin
            .from('push_subscriptions')
            .delete()
            .eq('endpoint', sub.endpoint);
          removedCount++;
        } else {
          console.error(`Failed to push to endpoint ${sub.endpoint}:`, error);
        }
      }
    });

    // 4. Wait for all pushes to attempt delivery
    await Promise.all(sendPromises);

    return NextResponse.json({ 
      success: true, 
      totalSent: successCount, 
      removed: removedCount 
    });

  } catch (error: any) {
    console.error('Broadcast Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}