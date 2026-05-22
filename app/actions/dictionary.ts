"use server";

import { createClient } from '@supabase/supabase-js';

export async function upsertDictionaryWords(data: any[]) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  // 🌟 यहाँ हमें पता चल जाएगा कि की है या नहीं
  console.log("URL:", url ? "Set" : "MISSING");
  console.log("Key Length:", key ? key.length : "MISSING");

  if (!key) {
    return { success: false, error: "Critical Error: Service Role Key is undefined!" };
  }

  const supabaseAdmin = createClient(url!, key);

  try {
    const { error } = await supabaseAdmin
      .from('dictionary')
      .upsert(data, { onConflict: 'word_hi' });

    if (error) {
      console.error("Supabase DB Error Details:", error); // यह टर्मिनल में असली वजह बताएगा
      throw error;
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}