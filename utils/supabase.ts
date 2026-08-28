import { createBrowserClient } from '@supabase/ssr';

// अगर आपने Supabase से Database Types जनरेट किए हैं, तो उसे यहाँ इंपोर्ट करें (Optional)
// import { Database } from '@/types/supabase'; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🌟 FIX 1: Hard Error Check (Vercel/Self-Hosted पर घंटों की डीबगिंग बचाएगा)
if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ URGENT: Supabase URL or Anon Key is missing in your Environment Variables!");
}

// 🌟 FIX 2: Supabase SSR Browser Client
// यह Next.js 16 में कुकीज़ (Cookies) से आपका एडमिन सेशन खुद-ब-खुद पढ़ लेगा।
// अब आपको 401 Unauthorized का एरर नहीं आएगा क्योंकि यह आपके लॉगिन टोकन को हर रिक्वेस्ट के साथ भेजेगा।
export const supabase = createBrowserClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      // 🌟 FIX 3: App का नाम भेजने से Supabase डैशबोर्ड में लॉग्स पढ़ना आसान हो जाता है
      'x-application-name': 'hindi-bhajan-manjari',
    },
  },
});