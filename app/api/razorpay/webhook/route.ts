import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(body)
    .digest("hex");

  if (expected !== signature) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const event = JSON.parse(body);

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    const { error } = await supabaseAdmin
      .from("supporters")
      .upsert(
        [{
          amount: Math.round(Number(payment.amount) / 100),
          is_anonymous: true,
          status: "completed",
          razorpay_payment_id: payment.id,
        }],
        { onConflict: "razorpay_payment_id", ignoreDuplicates: true } // 🌟 don't clobber a row verify/DETAILS may have already updated with a name
      );

    if (error) console.error("Webhook upsert error:", error);
  }

  return NextResponse.json({ received: true });
}