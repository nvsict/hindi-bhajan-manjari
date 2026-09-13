"use server";

import { cookies } from 'next/headers';
import { createServerClient, type CookieOptions } from '@supabase/ssr';

export async function updateCampaignSettings(payload: any) {
  try {
    const cookieStore = cookies();

    // 1. Create an authenticated Supabase client using Next.js cookies
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value;
          },
          set(name: string, value: string, options: CookieOptions) {
            cookieStore.set({ name, value, ...options });
          },
          remove(name: string, options: CookieOptions) {
            cookieStore.delete({ name, ...options });
          },
        },
      }
    );

    // 2. Separate ID from the payload to avoid Primary Key conflicts
    const { id, ...dataToSave } = payload; 
    let result;

    if (id) {
      // UPDATE existing campaign
      result = await supabase
        .from('campaign_settings')
        .update(dataToSave)
        .eq('id', id)
        .select();
    } else {
      // INSERT new campaign
      result = await supabase
        .from('campaign_settings')
        .insert([dataToSave])
        .select();
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    // 3. Catch RLS Silent Failures
    if (!result.data || result.data.length === 0) {
      return { 
        success: false, 
        error: "Action blocked by RLS. Ensure your authenticated role has UPDATE/INSERT permissions for this table." 
      };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}