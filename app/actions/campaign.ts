"use server";

import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function updateCampaignSettings(data: any) {
  try {
    const { error } = await supabaseAdmin
      .from('campaign_settings')
      .upsert({ id: 1, ...data }); // id हमेशा 1 रहेगी ताकि एक ही रो अपडेट हो

    if (error) throw error;
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}