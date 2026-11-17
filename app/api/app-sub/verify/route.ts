import { NextResponse } from "next/server";
import {
  activateSubscriptionForOrder,
  cfFetch,
  getSupabaseAdmin,
} from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifies a Cashfree order live against Cashfree's API and activates the user's
 * subscription in `app_subscriptions` if paid.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const orderId = String(body.orderId || "").trim();

    if (!orderId) {
      return NextResponse.json(
        { paid: false, error: "अमान्य ऑर्डर आईडी।" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Layer 0: Already activated by webhook? Return immediately!
    const { data: existingActive } = await supabaseAdmin
      .from("app_subscriptions")
      .select("*")
      .eq("cf_order_id", orderId)
      .eq("status", "active")
      .maybeSingle();

    if (existingActive) {
      return NextResponse.json({
        paid: true,
        subscription: existingActive,
      });
    }

    // Layer 1: Query Cashfree Payments API live
    const cfRes = await cfFetch(`/orders/${encodeURIComponent(orderId)}/payments`, {
      method: "GET",
    });

    const payments = await cfRes.json().catch(() => []);
    if (!cfRes.ok || !Array.isArray(payments)) {
      return NextResponse.json({ paid: false });
    }

    const successPayment = payments.find(
      (p: any) => String(p?.payment_status || "").toUpperCase() === "SUCCESS",
    );

    if (!successPayment) {
      return NextResponse.json({ paid: false });
    }

    const result = await activateSubscriptionForOrder({
      orderId,
      paymentId: String(successPayment.cf_payment_id || `pay_${Date.now()}`),
      amountInr: Math.round(Number(successPayment.payment_amount || 0)),
      eventType: "VERIFY_API_SUCCESS",
      rawPayload: successPayment,
    });

    if (result.activated) {
      return NextResponse.json({
        paid: true,
        subscription: result.subscription,
      });
    }

    return NextResponse.json({ paid: false });
  } catch (err: any) {
    console.error("[app-sub/verify] Error:", err);
    return NextResponse.json(
      { paid: false, error: "भुगतान सत्यापन में समस्या आई।" },
      { status: 500 },
    );
  }
}
