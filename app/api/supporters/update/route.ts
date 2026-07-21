import { NextResponse } from 'next/server'; // 🌟 next/val को next/server से बदल दिया गया है
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { paymentId, name, message, photo_url, is_anonymous } = body;

    if (!paymentId) {
      return NextResponse.json({ error: "Payment ID is required" }, { status: 400 });
    }

    // 🌟 Update the existing row in 'supporters' table
    const { data, error } = await supabase
      .from('supporters')
      .update({
        name: name,
        message: message,
        photo_url: photo_url,
        is_anonymous: is_anonymous,
        status: 'completed' 
      })
      .eq('razorpay_payment_id', paymentId);

    if (error) {
      console.error("Supabase update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });

  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}