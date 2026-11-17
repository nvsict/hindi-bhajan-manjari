import { NextResponse } from "next/server";
import {
  activateRazorpaySubscription,
  getSupabaseAdmin,
  rzpFetch,
  verifyRazorpaySubscriptionSignature,
} from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Verifies a Razorpay Recurring Subscription live and activates it in `app_subscriptions`.
 * Supports BOTH:
 * 1) Instant signature verification right from Razorpay Checkout handler
 * 2) Live Razorpay Subscriptions API status lookup (e.g., manual "Verify" button after UPI app switch)
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const subscriptionId = String(
      body.subscriptionId || body.orderId || "",
    ).trim();
    const paymentId = String(body.paymentId || "").trim();
    const signature = String(body.signature || "").trim();

    if (!subscriptionId) {
      return NextResponse.json(
        { paid: false, error: "अमान्य सदस्यता आईडी।" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Layer 0: Already activated by webhook? Return immediately!
    const { data: existingActive } = await supabaseAdmin
      .from("app_subscriptions")
      .select("*")
      .eq("rzp_subscription_id", subscriptionId)
      .eq("status", "active")
      .maybeSingle();

    if (existingActive) {
      return NextResponse.json({
        paid: true,
        subscription: existingActive,
      });
    }

    // Fetch live Razorpay subscription status for authoritative period timestamps
    let liveSub: any = null;
    try {
      const rzpRes = await rzpFetch(
        `/subscriptions/${encodeURIComponent(subscriptionId)}`,
        { method: "GET" },
      );
      if (rzpRes.ok) {
        liveSub = await rzpRes.json().catch(() => null);
      }
    } catch {
      // continue to signature check if live fetch momentarily hiccuped
    }

    // Layer 1: Cryptographic signature verification from Checkout handler
    const signatureValid =
      Boolean(paymentId && signature) &&
      verifyRazorpaySubscriptionSignature(paymentId, subscriptionId, signature);

    // Layer 2: Live Razorpay subscription status check
    const liveStatus = String(liveSub?.status || "").toLowerCase();
    const liveAuthorized =
      liveStatus === "authenticated" ||
      liveStatus === "active" ||
      Number(liveSub?.paid_count || 0) >= 1;

    if (!signatureValid && !liveAuthorized) {
      return NextResponse.json({ paid: false });
    }

    const result = await activateRazorpaySubscription({
      subscriptionId,
      paymentId: paymentId || null,
      periodStartUnix: liveSub?.current_start || null,
      periodEndUnix: liveSub?.current_end || null,
      eventType: signatureValid
        ? "VERIFY_RZP_SIGNATURE_SUCCESS"
        : "VERIFY_RZP_API_SUCCESS",
      rawPayload: liveSub || { subscriptionId, paymentId },
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
