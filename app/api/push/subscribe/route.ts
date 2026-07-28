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

    // 🌟 1. VALIDATION: Check if valid subscription object is received
    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json({ error: 'Invalid subscription payload' }, { status: 400 });
    }

    // 🌟 2. SAVE TO DATABASE
    const { error } = await supabase
      .from('push_subscriptions') // Ensure this matches your table name exactly
      .upsert({ 
        endpoint: subscription.endpoint, 
        p256dh: subscription.keys.p256dh, 
        auth: subscription.keys.auth 
      }, { onConflict: 'endpoint' });

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    // 🌟 3. INSTANT WELCOME NOTIFICATION (Themed for your site)
    const welcomePayload = JSON.stringify({
      title: "🙏 भजन मंजरी में आपका स्वागत है!",
      body: "सब्सक्राइब करने के लिए धन्यवाद! अब आपको रोज़ाना नए भजन और आरती के अपडेट्स मिलेंगे। ✨",
      url: "/"
    });

    // We use .catch() here so that even if the welcome message fails to send (e.g. network glitch), 
    // it doesn't crash the API and the user still gets successfully registered in the database.
    webpush.sendNotification(subscription, welcomePayload).catch((err) => {
      console.error('Welcome notification delivery failed:', err);
    });

    return NextResponse.json({ success: true, message: 'Subscribed successfully' });
    
  } catch (error: any) {
    console.error('Subscription API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}