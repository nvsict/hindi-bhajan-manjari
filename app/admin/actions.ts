'use server';

import { createClient } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';

export async function deleteBhajanAction(slug: string) {
  // 1. Initialize the master admin client to bypass Row Level Security
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY! 
  );
  
  // 2. Delete the bhajan securely from the backend
  const { error } = await supabaseAdmin.from('bhajans').delete().eq('slug', slug);
  
  if (error) {
    throw new Error(error.message);
  }
  
  // 3. Force Next.js to clear its cache and instantly update the dashboard
  revalidatePath('/admin');
  revalidatePath('/'); 
}