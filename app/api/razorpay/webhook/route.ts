import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// 🌟 Timing-safe signature comparison — prevents timing-attack based secret guessing
function isValidSignature(body: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const signatureBuf = Buffer.from(signature, "utf8");

  // Lengths must match before timingSafeEqual (it throws on mismatched lengths)
  if (expectedBuf.length !== signatureBuf.length) return false;

  return crypto.timingSafeEqual(expectedBuf, signatureBuf);
}

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!signature || !isValidSignature(body, signature, process.env.RAZORPAY_WEBHOOK_SECRET!)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  let event: any;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  // 🌟 सुरक्षित access, safe fallback
  if (event?.event === "payment.captured") {
    const payment = event?.payload?.payment?.entity;

    if (!payment?.id || !payment?.amount) {
      console.error("Webhook payload missing required fields:", event);
      return NextResponse.json({ error: "Malformed payload" }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from("supporters")
      .upsert(
        [{
          amount: Math.round(Number(payment.amount) / 100),
          is_anonymous: true,
          status: "completed",
          razorpay_payment_id: payment.id,
          razorpay_order_id: payment.order_id ?? null, // 🌟 अब /verify?order_id=... इसी से row ढूंढ सकता है
        }],
        { onConflict: "razorpay_payment_id", ignoreDuplicates: true } // don't clobber a row /verify or /details may have already updated with a name
      );

    if (error) {
      console.error("Webhook upsert error:", error);
      // 🌟 500 भेजें ताकि Razorpay अपने आप दोबारा webhook भेजे (retry mechanism)।
      // पहले यहाँ 200 जाता था, यानी DB फेल होने पर पेमेंट रिकॉर्ड हमेशा के लिए खो सकता था।
      return NextResponse.json({ error: "DB write failed" }, { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}