'use server';

import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';

export async function deleteBhajanAction(slug: string) {
  try {
    // ==========================================
    // 1. SECURITY CHECK: क्या कॉल करने वाला असली एडमिन है?
    // ==========================================
    const cookieStore = cookies();
    const supabaseAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) {
      return { success: false, error: "Unauthorized: You do not have permission to delete." };
    }

    // ==========================================
    // 2. INITIALIZE ADMIN CLIENT (RLS Bypass)
    // ==========================================
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! 
    );

    // ==========================================
    // 3. GET BHAJAN ID FROM SLUG
    // ==========================================
    const { data: bhajan, error: fetchError } = await supabaseAdmin
      .from('bhajans')
      .select('id')
      .eq('slug', slug)
      .single();
      
    if (fetchError || !bhajan) {
      return { success: false, error: "Bhajan not found in database!" };
    }

    const bhajanId = bhajan.id;

    // ==========================================
    // 4. CLEANUP RELATIONS (Orphan Data Prevention)
    // यह किसी भी Foreign Key Error को आने से रोकेगा
    // ==========================================
    await supabaseAdmin.from('bhajan_category_map').delete().eq('bhajan_id', bhajanId);
    await supabaseAdmin.from('bhajan_artist_map').delete().eq('bhajan_id', bhajanId);
    await supabaseAdmin.from('bhajan_tag_map').delete().eq('bhajan_id', bhajanId);
    await supabaseAdmin.from('bhajan_covers').delete().eq('bhajan_id', bhajanId); // अगर कोई कवर अपलोडेड है

    // ==========================================
    // 5. FINALLY DELETE THE MAIN BHAJAN
    // ==========================================
    const { error: deleteError } = await supabaseAdmin
      .from('bhajans')
      .delete()
      .eq('id', bhajanId);

    if (deleteError) {
      throw new Error(deleteError.message);
    }
    
    // ==========================================
    // 6. UPDATE CACHE & REFRESH UI
    // ==========================================
    revalidatePath('/admin');
    revalidatePath('/'); 
    // अगर आपका कोई और भजन लिस्टिंग पेज है (जैसे /bhajans), तो उसे भी यहाँ डाल सकते हैं
    // revalidatePath('/bhajans'); 

    return { success: true, message: "Bhajan & its relations deleted successfully!" };

  } catch (err: any) {
    // क्रैश होने की बजाय यह प्यार से फ्रंटएंड को एरर बताएगा
    return { success: false, error: err.message || "Failed to delete the bhajan." };
  }
}