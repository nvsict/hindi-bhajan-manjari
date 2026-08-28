"use server";

import { createClient } from '@supabase/supabase-js';

// ============================================================================
// 🌟 SUPABASE ADMIN INITIALIZATION
// Bypasses RLS to safely manage subscribers server-side
// ============================================================================
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const SENDER_INFO = { 
  name: "Hindi Bhajan Manjari", 
  email: "contact@hindibhajanmanjari.com" 
};

// ============================================================================
// 1. ADD SUBSCRIBER (Frontend Collector)
// ============================================================================
export async function addSubscriberAction(email: string) {
  try {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .insert([{ email }]); 

    // Postgres error 23505 is a unique constraint violation (already subscribed)
    if (error && error.code !== '23505') throw new Error(error.message);

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 2. REMOVE SUBSCRIBER (Unsubscribe Logic)
// ============================================================================
export async function removeSubscriberAction(email: string) {
  try {
    const { error } = await supabaseAdmin
      .from('subscribers')
      .delete()
      .eq('email', email);

    if (error) throw new Error(error.message);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 3. GET SUBSCRIBER COUNT (Dashboard Stats)
// ============================================================================
export async function getSubscriberCountAction() {
  try {
    const { count, error } = await supabaseAdmin
      .from('subscribers')
      .select('*', { count: 'exact', head: true });

    if (error) throw new Error(error.message);
    return { success: true, count: count || 0 };
  } catch (error: any) {
    return { success: false, count: 0, error: error.message };
  }
}

// ============================================================================
// 4. GET PAGINATED SUBSCRIBERS (For Admin Data Table)
// ============================================================================
export async function getSubscribersListAction(page: number = 1, limit: number = 50) {
  try {
    const offset = (page - 1) * limit;
    
    const { data, count, error } = await supabaseAdmin
      .from('subscribers')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw new Error(error.message);
    
    return { 
      success: true, 
      subscribers: data, 
      total: count || 0,
      totalPages: Math.ceil((count || 0) / limit)
    };
  } catch (error: any) {
    return { success: false, subscribers: [], total: 0, error: error.message };
  }
}

// ============================================================================
// 5. SEND TEST EMAIL (For Rich-Text Composer Validation)
// ============================================================================
export async function sendTestEmailAction(testEmail: string, subject: string, htmlContent: string) {
  if (!process.env.BREVO_API_KEY) return { success: false, error: "Missing BREVO_API_KEY" };

  try {
    const payload = {
      sender: SENDER_INFO,
      to: [{ email: testEmail }],
      subject: `[TEST] ${subject}`,
      htmlContent: htmlContent,
    };

    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Brevo API Error");
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// ============================================================================
// 6. SEND BULK NEWSLETTER (Production Broadcast)
// ============================================================================
export async function sendBulkNewsletterAction(subject: string, htmlContent: string) {
  if (!process.env.BREVO_API_KEY) return { success: false, error: "Missing BREVO_API_KEY" };

  try {
    // 1. Fetch the entire audience (For lists > 10k, this requires chunking, but fine for now)
    const { data: subscribers, error: dbError } = await supabaseAdmin
      .from('subscribers')
      .select('email');

    if (dbError) throw new Error(dbError.message);
    if (!subscribers || subscribers.length === 0) throw new Error("No subscribers found in database.");

    // 2. Format payload using Brevo's messageVersions for fast, single-call bulk sending
    const messageVersions = subscribers.map((sub) => ({
      to: [{ email: sub.email }],
    }));

    const payload = {
      sender: SENDER_INFO,
      subject: subject,
      htmlContent: htmlContent,
      messageVersions: messageVersions,
    };

    // 3. Dispatch to Brevo
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to send broadcast via Brevo");
    }

    return { success: true, totalSent: subscribers.length };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}