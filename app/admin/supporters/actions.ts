'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';

// Update a supporter record
export async function updateSupporterAction(id: string, updateData: any) {
  try {
    const { error } = await supabase
      .from('supporters')
      .update(updateData)
      .eq('id', id);

    if (error) throw new Error(error.message);

    // Revalidate admin page and homepage (to refresh the MV data if needed)
    revalidatePath('/admin/supporters');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Delete a supporter record
export async function deleteSupporterAction(id: string) {
  try {
    const { error } = await supabase
      .from('supporters')
      .delete()
      .eq('id', id);

    if (error) throw new Error(error.message);

    revalidatePath('/admin/supporters');
    revalidatePath('/');
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}