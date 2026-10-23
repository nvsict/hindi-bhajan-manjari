import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🔒 Service role key is mandatory. No fallback to the public anon key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

function cleanText(value: unknown, maxLength: number): string {
  return String(value ?? '').trim().slice(0, maxLength);
}

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    if (!supabaseServiceKey) {
      console.error('❌ [API /supporters/update] SUPABASE_SERVICE_ROLE_KEY missing');
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const body = await req.json();

    // Multi-Key Support (किसी भी नाम से Payment ID आए, यह पकड़ लेगा)
    const rawPaymentId =
      body.paymentId || body.razorpay_payment_id || body.payment_id;

    if (!rawPaymentId || typeof rawPaymentId !== 'string' || rawPaymentId.length > 100) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }
    const paymentId = rawPaymentId.trim();

    // 🔒 सिर्फ़ दिखावटी (cosmetic) फ़ील्ड बदले जा सकते हैं.
    // status और amount सिर्फ़ webhook/verify (server-side payment check) से बदलेंगे.
    const updatePayload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = cleanText(body.name, 100);
    if (body.message !== undefined) updatePayload.message = cleanText(body.message, 500);
    if (body.is_anonymous !== undefined) {
      updatePayload.is_anonymous = Boolean(body.is_anonymous);
    }
    if (body.photo_url !== undefined) {
      const photo = cleanText(body.photo_url, 500);
      if (photo === '' || isSafeHttpUrl(photo)) {
        updatePayload.photo_url = photo;
      } else {
        return NextResponse.json({ error: 'Invalid photo URL' }, { status: 400 });
      }
    }

    // 🔒 सिर्फ़ उसी रिकॉर्ड को अपडेट करें जो पहले से verified payment के रूप में मौजूद है.
    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from('supporters')
      .update(updatePayload)
      .eq('razorpay_payment_id', paymentId)
      .eq('status', 'completed')
      .select();

    if (updateError) {
      console.error(
        '❌ [API /supporters/update] Supabase update error:',
        updateError.message,
        updateError.details
      );
      return NextResponse.json(
        { error: updateError.message || 'Failed to update database' },
        { status: 500 }
      );
    }

    // 🔒 कोई नया रिकॉर्ड नहीं बनेगा: अगर पेमेंट verify नहीं हुआ तो 404.
    if (!updatedRows || updatedRows.length === 0) {
      return NextResponse.json(
        { error: 'Verified payment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updatedRows });
  } catch (error: any) {
    console.error(
      '❌ [API /supporters/update] Internal Server Error:',
      error.message || error
    );
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}