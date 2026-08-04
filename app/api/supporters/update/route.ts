import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 1. सही की (Key) का चयन और डायग्नोस्टिक चेतावनी
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    '⚠️ [API /supporters/update] SUPABASE_SERVICE_ROLE_KEY नहीं मिली! ANON_KEY का उपयोग किया जा रहा है। कृपया सुनिश्चित करें कि RLS पॉलिसी सही है।'
  );
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // 2. Multi-Key Support (किसी भी नाम से Payment ID आए, यह पकड़ लेगा)
    const paymentId =
      body.paymentId || body.razorpay_payment_id || body.payment_id;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // 3. सेफ पेलोड तैयार करें
    const updatePayload: Record<string, any> = {
      status: 'completed',
      updated_at: new Date().toISOString(),
    };

    if (body.name !== undefined) updatePayload.name = body.name;
    if (body.message !== undefined) updatePayload.message = body.message;
    if (body.photo_url !== undefined) updatePayload.photo_url = body.photo_url;
    if (body.is_anonymous !== undefined) {
      updatePayload.is_anonymous = Boolean(body.is_anonymous);
    }
    if (body.amount !== undefined) {
      updatePayload.amount = Number(body.amount) || 0;
    }

    // 4. पहले UPDATE करने का प्रयास करें
    const { data: updatedRows, error: updateError } = await supabaseAdmin
      .from('supporters')
      .update(updatePayload)
      .eq('razorpay_payment_id', paymentId)
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

    // 5. अगर रिकॉर्ड नहीं मिला (Empty array), तो नया INSERT करें (Upsert Fallback)
    if (!updatedRows || updatedRows.length === 0) {
      const insertPayload = {
        razorpay_payment_id: paymentId,
        name:
          body.name || (body.is_anonymous ? 'गुप्त दानकर्ता' : 'सनातन सहयोगी'),
        message: body.message || '',
        photo_url: body.photo_url || '',
        is_anonymous: Boolean(body.is_anonymous),
        amount: Number(body.amount) || 0,
        status: 'completed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: insertedData, error: insertError } = await supabaseAdmin
        .from('supporters')
        .insert([insertPayload])
        .select();

      if (insertError) {
        console.error(
          '❌ [API /supporters/update] Insert fallback error:',
          insertError.message,
          insertError.details
        );
        return NextResponse.json(
          { error: insertError.message || 'Failed to insert supporter record' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true, data: insertedData });
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