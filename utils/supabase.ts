import { createClient } from '@supabase/supabase-js';

// अगर आपने Supabase से Database Types जनरेट किए हैं, तो उसे यहाँ इंपोर्ट करें (Optional but Recommended)
// import { Database } from '@/types/supabase'; 

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 🌟 FIX 1: Hard Error Check (Vercel पर घंटों की डीबगिंग बचाएगा)
if (!supabaseUrl || !supabaseKey) {
  throw new Error("❌ URGENT: Supabase URL or Anon Key is missing in your Environment Variables!");
}

// 🌟 FIX 2: Optimized Client Initialization
// अगर आपके पास Database Types हैं, तो createClient<Database>(...) लिखें
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // अगर आप SSR (Server-Side Rendering) में इसका इस्तेमाल कर रहे हैं, 
    // तो यह सुनिश्चित करता है कि क्लाइंट फालतू में बैकग्राउंड में टोकन रिफ्रेश न करे
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      // 🌟 FIX 3: App का नाम भेजने से Supabase डैशबोर्ड में लॉग्स पढ़ना आसान हो जाता है
      'x-application-name': 'hindi-bhajan-manjari',
    },
  },
});