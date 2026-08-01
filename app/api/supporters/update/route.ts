import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 🌟 FIX 1: सेफ एनवायरनमेंट चेक और Fallback (500 क्रैश से बचाने के लिए)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ [API /supporters/update] Missing Supabase URL or Key in environment variables.");
}

const supabase = createClient(
  supabaseUrl || '',
  supabaseKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    }
  }
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, name, message, photo_url, is_anonymous } = body;

    if (!paymentId) {
      return NextResponse.json(
        { error: "Payment ID is required" }, 
        { status: 400 }
      );
    }

    // 🌟 FIX 2: डेटा क्लीनिंग ताकि undefined वैल्यूज से Supabase एरर न दे
    const updatePayload: Record<string, any> = {
      status: 'completed',
    };

    if (name !== undefined) updatePayload.name = name;
    if (message !== undefined) updatePayload.message = message;
    if (photo_url !== undefined) updatePayload.photo_url = photo_url;
    if (is_anonymous !== undefined) updatePayload.is_anonymous = Boolean(is_anonymous);

    // 🌟 FIX 3: Supabase Update Query
    const { data, error } = await supabase
      .from('supporters')
      .update(updatePayload)
      .eq('razorpay_payment_id', paymentId)
      .select();

    if (error) {
      console.error("❌ [API /supporters/update] Supabase error:", error.message, error.details);
      return NextResponse.json(
        { error: error.message || "Failed to update database" }, 
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });

  } catch (error: any) {
    console.error("❌ [API /supporters/update] Internal Server Error:", error.message || error);
    return NextResponse.json(
      { error: error.message || "Internal Server Error" }, 
      { status: 500 }
    );
  }
}