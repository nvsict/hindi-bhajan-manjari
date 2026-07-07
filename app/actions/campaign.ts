"use server";

import { supabase } from "@/utils/supabase"; 

export async function updateCampaignSettings(payload: any) {
  try {
    let result;

    if (payload.id) {
      // 🌟 UPDATE (पुराना बैनर): अगर ID मौजूद है, तो अपडेट करें
      result = await supabase
        .from('campaign_settings')
        .update(payload)
        .eq('id', payload.id);
    } else {
      // 🌟 INSERT (नया बैनर): अगर ID नहीं है, तो नया बनाएं
      
      // जादुई लाइन: यहाँ हम payload में से 'id' को पूरी तरह से निकाल कर 
      // बाकी सारा डेटा 'insertData' नाम के नए ऑब्जेक्ट में डाल रहे हैं
      const { id, ...insertData } = payload; 
      
      result = await supabase
        .from('campaign_settings')
        .insert([insertData]); // अब डेटाबेस को 'id' दिखेगा ही नहीं और वो खुद जनरेट कर लेगा
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}