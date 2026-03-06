import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';
import webpush from 'web-push';

// Configure keys for the welcome message
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:nvsict06@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    // 1. Save to Database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({ 
        endpoint: subscription.endpoint, 
        p256dh: subscription.keys?.p256dh, 
        auth: subscription.keys?.auth 
      }, { onConflict: 'endpoint' });

    if (error) throw error;

    // 2. 🌟 NEW: Send Instant Welcome Notification
    const welcomePayload = JSON.stringify({
      title: "🙏 Welcome to Hindi Bhajan Manjari",
      body: "Thank you for subscribing! You will now receive daily Bhajans and Aartis.",
      url: "/"
    });

    await webpush.sendNotification(subscription, welcomePayload);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Subscription error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}