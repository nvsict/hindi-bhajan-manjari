'use server';

import { supabase } from '@/utils/supabase';
import { revalidatePath } from 'next/cache';

// 1. The Delete Action
export async function deleteItem(table: 'categories' | 'deities' | 'bhajans', id: string) {
  try {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;

    revalidatePath('/'); 
    revalidatePath('/admin/manage');
    revalidatePath(table === 'deities' ? '/deity' : `/${table}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Delete Error:", error.message);
    return { success: false, error: error.message };
  }
}

// 2. The Update Action
export async function updateItem(table: string, id: string, formData: any) {
  try {
    const { error } = await supabase
      .from(table)
      .update(formData)
      .eq('id', id);

    if (error) throw error;

    revalidatePath('/');
    revalidatePath('/admin/manage');
    revalidatePath(table === 'deities' ? '/deity' : `/${table}`);
    
    return { success: true };
  } catch (error: any) {
    console.error("Update Error:", error.message);
    return { success: false, error: error.message };
  }
}