import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const { paymentId, isPublic, name, message, photoUrl } = await req.json();

    if (!paymentId) {
      return NextResponse.json({ error: "paymentId required" }, { status: 400 });
    }

    // Keyed by razorpay_payment_id, not a client-supplied row id — this is
    // the value that actually proves "this browser was the one that paid,"
    // since it only ever exists in this session because a real payment
    // was verified against Razorpay for it.
    const { data, error } = await supabaseAdmin
      .from("supporters")
      .update({
        name: isPublic ? (name ?? '').trim() || null : null,
        message: isPublic ? (message ?? '').trim() || null : null,
        photo_url: photoUrl ?? null,
        is_anonymous: !isPublic,
      })
      .eq("razorpay_payment_id", paymentId)
      .select()
      .single();

    if (error) {
      console.error("Supporter details update error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, supporter: data });
  } catch (err) {
    console.error("Supporter details route error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}