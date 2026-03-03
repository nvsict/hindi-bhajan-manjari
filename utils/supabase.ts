import { createClient } from '@supabase/supabase-js';

// 🌟 THE FIX: Supabase strictly requires a full URL (http/https). 
// We append the current website's origin to the proxy path for the browser.
const supabaseUrl = typeof window !== 'undefined' 
  ? `${window.location.origin}/supabase-proxy` 
  : process.env.NEXT_PUBLIC_SUPABASE_URL!;

const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);