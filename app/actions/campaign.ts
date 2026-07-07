"use server";

import { supabase } from "@/utils/supabase"; // या जहाँ से भी आप Supabase इंपोर्ट करते हैं

export async function updateCampaignSettings(payload: any) {
  try {
    let result;

    if (payload.id) {
      // 🌟 UPDATE: अगर payload में ID है, मतलब यह पुराना बैनर है, इसे अपडेट करें
      result = await supabase
        .from('campaign_settings')
        .update(payload)
        .eq('id', payload.id);
    } else {
      // 🌟 INSERT: अगर ID नहीं है, मतलब यह नया बैनर है, इसे इन्सर्ट करें
      result = await supabase
        .from('campaign_settings')
        .insert([payload]);
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}