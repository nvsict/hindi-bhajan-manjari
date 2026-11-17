import { NextRequest, NextResponse } from "next/server";
import {
  activateRazorpaySubscription,
  getSupabaseAdmin,
  verifyRazorpayWebhookSignature,
} from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dedicated Razorpay Subscriptions Webhook for Hindi Bhajan Manjari Android App.
 * Configure this URL in Razorpay Dashboard -> Account & Settings -> Webhooks:
 *   https://www.hindibhajanmanjari.com/api/app-sub/webhook
 *
 * Events to enable:
 *   - subscription.authenticated
 *   - subscription.activated
 *   - subscription.charged
 *   - subscription.halted
 *   - subscription.cancelled
 *   - subscription.completed
 */
export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-razorpay-signature") || "";
  const rawBody = await req.text();

  if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
    console.error("[app-sub/webhook] Invalid Razorpay signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const payload = JSON.parse(rawBody);
    const eventType = String(payload?.event || "");
    const subEntity = payload?.payload?.subscription?.entity;
    const payEntity = payload?.payload?.payment?.entity;

    const rzpSubId = String(subEntity?.id || "");
    if (!rzpSubId) {
      return NextResponse.json({ status: "IGNORED" });
    }

    // 1. Initial Mandate Auth / Activation / Recurring Auto-Debit Charged
    if (
      eventType === "subscription.authenticated" ||
      eventType === "subscription.activated" ||
      eventType === "subscription.charged"
    ) {
      const amountInr = payEntity?.amount
        ? Math.round(Number(payEntity.amount) / 100)
        : undefined;

      await activateRazorpaySubscription({
        subscriptionId: rzpSubId,
        paymentId: payEntity?.id ? String(payEntity.id) : null,
        amountInr,
        periodStartUnix: subEntity?.current_start || null,
        periodEndUnix: subEntity?.current_end || null,
        eventType,
        rawPayload: payload.payload,
      });
    }

    // 2. Recurring Subscription Halted / Cancelled / Expired / Completed
    if (
      eventType === "subscription.halted" ||
      eventType === "subscription.cancelled" ||
      eventType === "subscription.completed" ||
      eventType === "subscription.expired"
    ) {
      const statusMap: Record<string, "halted" | "cancelled" | "expired"> = {
        "subscription.halted": "halted",
        "subscription.cancelled": "cancelled",
        "subscription.completed": "expired",
        "subscription.expired": "expired",
      };

      const nextStatus = statusMap[eventType] || "expired";
      const supabaseAdmin = getSupabaseAdmin();

      await supabaseAdmin
        .from("app_subscriptions")
        .update({
          status: nextStatus,
          auto_renew: false,
          updated_at: new Date().toISOString(),
        })
        .eq("rzp_subscription_id", rzpSubId);
    }

    return NextResponse.json({ status: "OK" });
  } catch (err: any) {
    console.error("[app-sub/webhook] Processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
