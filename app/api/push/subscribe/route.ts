import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import webpush from 'web-push';

// 🌟 1. INITIALIZE SUPABASE ADMIN (Bypasses RLS to allow database inserts)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configure VAPID keys for the welcome message
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:nvsict06@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

export async function POST(req: Request) {
  try {
    const subscription = await req.json();

    // VALIDATION: Check if valid subscription object is received
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 });
    }

    // 🌟 2. SAVE TO DATABASE (Using Admin Client)
    const { error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({ 
        endpoint: subscription.endpoint, 
        p256dh: subscription.keys.p256dh, 
        auth: subscription.keys.auth 
      }, { onConflict: 'endpoint' });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // 🌟 3. INSTANT WELCOME NOTIFICATION
    // Using 'message' instead of 'body' to perfectly match our new sw.js
    const welcomePayload = JSON.stringify({
      title: "🙏 भजन मंजरी में आपका स्वागत है!",
      message: "सब्सक्राइब करने के लिए धन्यवाद! अब आपको रोज़ाना नए भजन और आरती के अपडेट्स मिलेंगे। ✨",
      url: "/"
    });

    // Send the welcome message. We catch errors so the API still returns 200 OK 
    // even if the user's internet drops immediately after saving to the DB.
    webpush.sendNotification(subscription, welcomePayload).catch((err) => {
      console.error('Welcome notification delivery failed:', err);
    });

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    
  } catch (error: any) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}