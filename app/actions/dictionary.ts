"use server";

import { createClient } from '@supabase/supabase-js';

// यह की केवल सर्वर पर चलती है, ब्राउज़र तक नहीं पहुँचती
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function upsertDictionaryWords(data: any[]) {
  try {
    const { data: result, error } = await supabaseAdmin
      .from('dictionary')
      .upsert(data, { onConflict: 'word_hi' });

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}