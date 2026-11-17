import { NextRequest, NextResponse } from "next/server";
import {
  activateSubscriptionForOrder,
  getSupabaseAdmin,
  verifyCashfreeSignature,
} from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Dedicated Cashfree Webhook for Android App Subscriptions & Auto-Renewals.
 * Configure this URL in Cashfree Dashboard -> Webhooks:
 *   https://www.hindibhajanmanjari.com/api/app-sub/webhook
 */
export async function POST(req: NextRequest) {
  const timestamp = req.headers.get("x-webhook-timestamp") || "";
  const signature = req.headers.get("x-webhook-signature") || "";
  const rawBody = await req.text();

  if (!verifyCashfreeSignature(timestamp, rawBody, signature)) {
    console.error("[app-sub/webhook] Invalid Cashfree signature");
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  try {
    const event = JSON.parse(rawBody);
    const eventType = String(event?.type || "");

    // 1. Standard Order Payment Success (Initial or Manual Renewal)
    if (eventType === "PAYMENT_SUCCESS_WEBHOOK") {
      const order = event?.data?.order;
      const payment = event?.data?.payment;
      const orderId = String(order?.order_id || "");

      if (orderId.startsWith("HBM_APP_") || order?.order_tags?.type === "app_subscription") {
        await activateSubscriptionForOrder({
          orderId,
          paymentId: String(payment?.cf_payment_id || `wh_${Date.now()}`),
          amountInr: Math.round(Number(order?.order_amount || 0)),
          eventType,
          rawPayload: event.data,
        });
      }
    }

    // 2. Cashfree Recurring Subscription Auto-Renewal Payment Success
    if (
      eventType === "SUBSCRIPTION_PAYMENT_SUCCESS" ||
      eventType === "SUBSCRIPTION_NEW_PAYMENT"
    ) {
      const cfSubId = String(
        event?.data?.subscription_details?.subscription_id ||
          event?.data?.cf_subscription_id ||
          "",
      );
      const cfPayId = String(
        event?.data?.payment_details?.cf_payment_id ||
          event?.data?.cf_payment_id ||
          `subpay_${Date.now()}`,
      );
      const amount = Math.round(
        Number(
          event?.data?.payment_details?.payment_amount ||
            event?.data?.payment_amount ||
            0,
        ),
      );

      if (cfSubId) {
        const supabaseAdmin = getSupabaseAdmin();
        const { data: subRow } = await supabaseAdmin
          .from("app_subscriptions")
          .select("*")
          .eq("cf_subscription_id", cfSubId)
          .maybeSingle();

        if (subRow) {
          const { data: planRow } = await supabaseAdmin
            .from("app_plans")
            .select("duration_days")
            .eq("id", subRow.plan_id)
            .maybeSingle();

          const days = planRow?.duration_days || (subRow.plan_id === "annual" ? 365 : 30);
          const now = new Date();
          const base =
            subRow.current_period_end && new Date(subRow.current_period_end) > now
              ? new Date(subRow.current_period_end)
              : now;
          const nextEnd = new Date(base.getTime() + days * 24 * 60 * 60 * 1000);

          await supabaseAdmin
            .from("app_subscriptions")
            .update({
              status: "active",
              cf_payment_id: cfPayId,
              current_period_end: nextEnd.toISOString(),
              updated_at: now.toISOString(),
            })
            .eq("id", subRow.id);

          await supabaseAdmin.from("app_payment_logs").upsert(
            [
              {
                user_id: subRow.user_id,
                subscription_id: subRow.id,
                cf_subscription_id: cfSubId,
                cf_payment_id: cfPayId,
                event_type: eventType,
                amount_inr: amount || subRow.amount_inr,
                status: "SUCCESS",
                raw_payload: event.data,
              },
            ],
            { onConflict: "cf_payment_id", ignoreDuplicates: true },
          );
        }
      }
    }

    // 3. Cashfree Recurring Subscription Cancelled / Halted
    if (eventType === "SUBSCRIPTION_STATUS_CHANGED") {
      const cfSubId = String(
        event?.data?.subscription_details?.subscription_id || "",
      );
      const nextStatus = String(
        event?.data?.subscription_details?.subscription_status || "",
      ).toUpperCase();

      if (cfSubId && (nextStatus === "CANCELLED" || nextStatus === "ON_HOLD")) {
        const supabaseAdmin = getSupabaseAdmin();
        await supabaseAdmin
          .from("app_subscriptions")
          .update({
            status: nextStatus === "CANCELLED" ? "cancelled" : "halted",
            auto_renew: false,
            updated_at: new Date().toISOString(),
          })
          .eq("cf_subscription_id", cfSubId);
      }
    }

    return NextResponse.json({ status: "OK" });
  } catch (err: any) {
    console.error("[app-sub/webhook] Processing error:", err);
    return NextResponse.json({ error: "Processing failed" }, { status: 500 });
  }
}
