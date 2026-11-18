import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ANDROID_PACKAGE_NAME =
  process.env.GOOGLE_PLAY_PACKAGE_NAME || "com.nvsict06.bhajanmanjariapp";

const PRODUCT_TO_PLAN_MAP: Record<string, "monthly" | "annual"> = {
  "com.nvsict06.bhajanmanjariapp.monthly": "monthly",
  "com.nvsict06.bhajanmanjariapp.annual": "annual",
};

interface GoogleServiceAccount {
  client_email: string;
  private_key: string;
  token_uri?: string;
}

function base64UrlEncode(input: Buffer | string): string {
  const buf = typeof input === "string" ? Buffer.from(input, "utf8") : input;
  return buf
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

async function getGooglePlayAccessToken(
  sa: GoogleServiceAccount,
): Promise<string> {
  const nowSec = Math.floor(Date.now() / 1000);
  const tokenUri = sa.token_uri || "https://oauth2.googleapis.com/token";

  const header = base64UrlEncode(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64UrlEncode(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/androidpublisher",
      aud: tokenUri,
      iat: nowSec,
      exp: nowSec + 3600,
    }),
  );

  const signingInput = `${header}.${payload}`;
  const signer = crypto.createSign("RSA-SHA256");
  signer.update(signingInput);
  signer.end();
  const signature = base64UrlEncode(signer.sign(sa.private_key));

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signingInput}.${signature}`,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.access_token) {
    throw new Error(data?.error_description || "Failed to obtain Google OAuth token");
  }
  return String(data.access_token);
}

/**
 * POST /api/app-sub/verify-play
 * Verifies a Google Play Billing subscription purchaseToken via the
 * Google Play Android Developer API (Subscriptions v2) and activates `app_subscriptions`.
 *
 * Requires env var `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON` (stringified GCP service account key).
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (!token) {
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { data: userData, error: userErr } =
      await supabaseAdmin.auth.getUser(token);

    if (userErr || !userData?.user?.id) {
      return NextResponse.json(
        { error: "Invalid session. Please sign in again." },
        { status: 401 },
      );
    }

    const body = await req.json().catch(() => ({}));
    const productId = String(body?.productId || "").trim();
    const purchaseToken = String(body?.purchaseToken || "").trim();

    if (!productId || !purchaseToken) {
      return NextResponse.json(
        { error: "Missing productId or purchaseToken." },
        { status: 400 },
      );
    }

    const planId = PRODUCT_TO_PLAN_MAP[productId];
    if (!planId) {
      return NextResponse.json(
        { error: "Unsupported Google Play product ID." },
        { status: 400 },
      );
    }

    const rawServiceAccount = process.env.GOOGLE_PLAY_SERVICE_ACCOUNT_JSON;
    if (!rawServiceAccount) {
      return NextResponse.json(
        {
          paid: false,
          code: "PLAY_BILLING_NOT_CONFIGURED",
          error:
            "Google Play verification is not configured on the server yet. Please use Razorpay.",
        },
        { status: 503 },
      );
    }

    let serviceAccount: GoogleServiceAccount;
    try {
      serviceAccount = JSON.parse(rawServiceAccount);
    } catch {
      return NextResponse.json(
        { error: "Invalid GOOGLE_PLAY_SERVICE_ACCOUNT_JSON configuration." },
        { status: 500 },
      );
    }

    const accessToken = await getGooglePlayAccessToken(serviceAccount);

    // Call Google Play Developer API — subscriptionsv2.get
    const verifyUrl = `https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${encodeURIComponent(
      ANDROID_PACKAGE_NAME,
    )}/purchases/subscriptionsv2/tokens/${encodeURIComponent(purchaseToken)}`;

    const playRes = await fetch(verifyUrl, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const playData = await playRes.json().catch(() => ({}));
    if (!playRes.ok) {
      console.error("[app-sub/verify-play] Google Play API error:", playRes.status, playData);
      return NextResponse.json(
        { paid: false, error: "Could not verify Google Play purchase." },
        { status: 400 },
      );
    }

    const subState = String(playData?.subscriptionState || "");
    const isActive =
      subState === "SUBSCRIPTION_STATE_ACTIVE" ||
      subState === "SUBSCRIPTION_STATE_IN_GRACE_PERIOD";

    if (!isActive) {
      return NextResponse.json(
        {
          paid: false,
          subscriptionState: subState,
          error: "Google Play subscription is not active.",
        },
        { status: 400 },
      );
    }

    const lineItem = Array.isArray(playData?.lineItems)
      ? playData.lineItems[0]
      : null;
    const expiryIso =
      lineItem?.expiryTime ||
      new Date(
        Date.now() + (planId === "annual" ? 365 : 30) * 24 * 60 * 60 * 1000,
      ).toISOString();
    const startIso = playData?.startTime || new Date().toISOString();
    const autoRenew = Boolean(lineItem?.autoRenewingPlan?.autoRenewEnabled);

    const { data: planRow } = await supabaseAdmin
      .from("app_plans")
      .select("price_inr")
      .eq("id", planId)
      .maybeSingle();

    const amountInr = planRow?.price_inr || (planId === "annual" ? 249 : 29);
    const userId = userData.user.id;
    const nowIso = new Date().toISOString();
    const orderId = String(playData?.latestOrderId || `play_${purchaseToken.slice(0, 24)}`);

    const { data: subRow, error: upsertErr } = await supabaseAdmin
      .from("app_subscriptions")
      .upsert(
        [
          {
            user_id: userId,
            plan_id: planId,
            status: "active",
            auto_renew: autoRenew,
            amount_inr: amountInr,
            current_period_start: startIso,
            current_period_end: expiryIso,
            billing_provider: "google_play",
            play_purchase_token: purchaseToken,
            updated_at: nowIso,
          },
        ],
        { onConflict: "play_purchase_token" },
      )
      .select()
      .single();

    if (upsertErr) {
      console.error("[app-sub/verify-play] Subscription upsert error:", upsertErr);
      return NextResponse.json(
        { paid: false, error: "Could not save Google Play subscription." },
        { status: 500 },
      );
    }

    // Record audit row in payment logs
    try {
      await supabaseAdmin.from("app_payment_logs").upsert(
        [
          {
            user_id: userId,
            subscription_id: subRow.id,
            rzp_payment_id: `play_${orderId}`,
            event_type: "google_play.verified",
            amount_inr: amountInr,
            status: "SUCCESS",
            raw_payload: playData,
          },
        ],
        { onConflict: "rzp_payment_id", ignoreDuplicates: true },
      );
    } catch {
      // ignore non-critical audit log failure
    }

    return NextResponse.json({
      paid: true,
      subscription: subRow,
    });
  } catch (err) {
    console.error("[app-sub/verify-play] Exception:", err);
    return NextResponse.json(
      { paid: false, error: "Unable to verify Google Play purchase right now." },
      { status: 500 },
    );
  }
}
