import { createClient } from '@supabase/supabase-js';

// 🌟 THE CLEANUP: अब हमें किसी प्रॉक्सी की ज़रूरत नहीं है! 
// यह सीधे आपकी .env.local फाइल से असली Supabase URL लेगा और सबसे तेज़ स्पीड देगा।
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);