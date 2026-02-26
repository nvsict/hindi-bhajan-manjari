'use server';

import { supabase } from '../../utils/supabase';

export async function addSubscriber(email: string) {
  try {
    const { error } = await supabase
      .from('subscribers')
      .insert([{ email: email.toLowerCase().trim() }]);

    if (error) {
      // Supabase error code '23505' means "Unique violation" (Email already exists)
      if (error.code === '23505') {
        return { success: false, message: "You are already subscribed!" };
      }
      return { success: false, message: "Something went wrong. Try again." };
    }

    return { success: true, message: "Successfully subscribed!" };
  } catch (err) {
    return { success: false, message: "Server error occurred." };
  }
}