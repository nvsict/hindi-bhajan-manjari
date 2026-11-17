import crypto from "crypto";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

export function getRazorpayKeyId(): string {
  const keyId =
    process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "";
  if (!keyId) {
    throw new Error("Missing NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_ID");
  }
  return keyId.trim();
}

export function getRazorpayKeySecret(): string {
  const secret = process.env.RAZORPAY_KEY_SECRET || "";
  if (!secret) {
    throw new Error("Missing RAZORPAY_KEY_SECRET");
  }
  return secret.trim();
}

export function getRazorpayWebhookSecret(): string {
  const secret =
    process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
  if (!secret) {
    throw new Error("Missing RAZORPAY_WEBHOOK_SECRET");
  }
  return secret.trim();
}

export function getSiteBaseUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.hindibhajanmanjari.com";
  return raw.replace(/\/+$/, "");
}

export function getSupabaseAdmin(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY",
    );
  }
  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

export function normalizeIndianPhone(raw: unknown): string {
  const digits = String(raw || "").replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith("0")) {
    return digits.slice(1);
  }
  return digits;
}

export function isValidIndianPhone(phone: string): boolean {
  return /^[6-9]\d{9}$/.test(phone);
}

export function normalizeEmail(raw: unknown): string | null {
  const trimmed = String(raw || "").trim().toLowerCase();
  return trimmed.length > 0 ? trimmed : null;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}

export function isValidPassword(password: unknown): boolean {
  return typeof password === "string" && password.length >= 6 && password.length <= 72;
}

export function deriveAuthEmail(phone: string, email: string | null): string {
  return email || `${phone}@phone.hindibhajanmanjari.com`;
}

/**
 * Call Razorpay REST API v1 with Basic Auth.
 */
export async function rzpFetch(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  const keyId = getRazorpayKeyId();
  const keySecret = getRazorpayKeySecret();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  return fetch(`https://api.razorpay.com/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...(init.headers || {}),
    },
  });
}

/**
 * Ensures a Razorpay Recurring Plan exists for the given `app_plans` row.
 * If `rzp_plan_id` is missing OR `price_inr` was changed in Supabase,
 * automatically creates a fresh Razorpay Plan at the new price and caches its ID!
 */
export async function ensureRazorpayPlan(plan: {
  id: string;
  name_en: string;
  name_hi: string;
  description_hi: string | null;
  price_inr: number;
  duration_days: number;
  rzp_plan_id?: string | null;
  rzp_plan_price_inr?: number | null;
}): Promise<string> {
  const currentPrice = Number(plan.price_inr);
  if (
    plan.rzp_plan_id &&
    (!plan.rzp_plan_price_inr || Number(plan.rzp_plan_price_inr) === currentPrice)
  ) {
    return plan.rzp_plan_id;
  }

  const period = Number(plan.duration_days) >= 300 ? "yearly" : "monthly";
  const res = await rzpFetch("/plans", {
    method: "POST",
    body: JSON.stringify({
      period,
      interval: 1,
      item: {
        name: `Hindi Bhajan Manjari — ${plan.name_en}`,
        amount: Math.round(currentPrice * 100), // paise
        currency: "INR",
        description:
          plan.description_hi ||
          `Hindi Bhajan Manjari Android App ${plan.name_en}`,
      },
      notes: {
        app_plan_id: plan.id,
        price_inr: String(currentPrice),
      },
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data?.id) {
    console.error("[app-sub] Failed to create Razorpay plan:", res.status, data);
    throw new Error(
      data?.error?.description ||
        "Razorpay प्लान बनाने में समस्या आई। कृपया पुनः प्रयास करें।",
    );
  }

  const supabaseAdmin = getSupabaseAdmin();
  await supabaseAdmin
    .from("app_plans")
    .update({
      rzp_plan_id: data.id,
      rzp_plan_price_inr: currentPrice,
      updated_at: new Date().toISOString(),
    })
    .eq("id", plan.id);

  return String(data.id);
}

/**
 * Verifies Razorpay Checkout handler signature for Subscriptions:
 * HMAC_SHA256(razorpay_payment_id + "|" + razorpay_subscription_id, RAZORPAY_KEY_SECRET)
 */
export function verifyRazorpaySubscriptionSignature(
  paymentId: string,
  subscriptionId: string,
  signature: string,
): boolean {
  if (!paymentId || !subscriptionId || !signature) return false;
  const secret = getRazorpayKeySecret();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(`${paymentId}|${subscriptionId}`)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature.trim(), "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Verifies Razorpay Webhook signature (`x-razorpay-signature` header):
 * HMAC_SHA256(rawBody, RAZORPAY_WEBHOOK_SECRET)
 */
export function verifyRazorpayWebhookSignature(
  rawBody: string,
  signature: string,
): boolean {
  if (!rawBody || !signature) return false;
  const secret = getRazorpayWebhookSecret();
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex");

  const expectedBuf = Buffer.from(expected, "utf8");
  const actualBuf = Buffer.from(signature.trim(), "utf8");
  if (expectedBuf.length !== actualBuf.length) return false;
  return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

/**
 * Creates a Supabase Auth user + `app_profiles` row with strict duplicate checks.
 * Used by BOTH `/api/app-sub/auth/register` AND 1-step `/api/app-sub/create`.
 */
export async function createAppUserAccount(params: {
  phone: string;
  email: string | null;
  password: string;
  fullName: string;
}): Promise<
  | {
      userId: string;
      authEmail: string;
      phone: string;
      email: string | null;
      fullName: string;
    }
  | { error: string; code: string; status: number }
> {
  const supabaseAdmin = getSupabaseAdmin();
  const { phone, email, password, fullName } = params;

  const { data: existingPhone } = await supabaseAdmin
    .from("app_profiles")
    .select("user_id")
    .eq("phone", phone)
    .maybeSingle();

  if (existingPhone) {
    return {
      error: "यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।",
      code: "PHONE_EXISTS",
      status: 409,
    };
  }

  if (email) {
    const { data: existingEmail } = await supabaseAdmin
      .from("app_profiles")
      .select("user_id")
      .ilike("email", email)
      .maybeSingle();

    if (existingEmail) {
      return {
        error: "यह ईमेल पता पहले से पंजीकृत है। कृपया लॉगिन करें।",
        code: "EMAIL_EXISTS",
        status: 409,
      };
    }
  }

  const authEmail = deriveAuthEmail(phone, email);

  const { data: createdAuth, error: authErr } =
    await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        phone,
        full_name: fullName || "",
        source: "android_app",
      },
    });

  if (authErr || !createdAuth?.user) {
    const msg = (authErr?.message || "").toLowerCase();
    if (msg.includes("already") || msg.includes("registered")) {
      return {
        error: "यह खाता पहले से मौजूद है। कृपया लॉगिन करें।",
        code: "ACCOUNT_EXISTS",
        status: 409,
      };
    }
    return {
      error: "खाता बनाने में समस्या आई। कृपया पुनः प्रयास करें।",
      code: "AUTH_CREATE_FAILED",
      status: 500,
    };
  }

  const userId = createdAuth.user.id;

  const { error: profileErr } = await supabaseAdmin.from("app_profiles").insert([
    {
      user_id: userId,
      phone,
      email,
      full_name: fullName || null,
      auth_email: authEmail,
    },
  ]);

  if (profileErr) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return {
      error: "प्रोफ़ाइल सहेजने में त्रुटि आई। कृपया पुनः प्रयास करें।",
      code: "PROFILE_CREATE_FAILED",
      status: 500,
    };
  }

  return {
    userId,
    authEmail,
    phone,
    email,
    fullName,
  };
}

/**
 * Idempotently activates or extends a Razorpay subscription in `app_subscriptions`
 * and writes an audit row in `app_payment_logs`.
 */
export async function activateRazorpaySubscription(params: {
  subscriptionId: string;
  paymentId?: string | null;
  amountInr?: number;
  periodStartUnix?: number | null;
  periodEndUnix?: number | null;
  eventType: string;
  rawPayload: unknown;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const {
    subscriptionId,
    paymentId,
    amountInr,
    periodStartUnix,
    periodEndUnix,
    eventType,
    rawPayload,
  } = params;

  const { data: subRow, error: findErr } = await supabaseAdmin
    .from("app_subscriptions")
    .select("*")
    .eq("rzp_subscription_id", subscriptionId)
    .maybeSingle();

  if (findErr || !subRow) {
    return { activated: false, reason: "subscription_not_found" as const };
  }

  const { data: planRow } = await supabaseAdmin
    .from("app_plans")
    .select("duration_days, price_inr")
    .eq("id", subRow.plan_id)
    .maybeSingle();

  const durationDays =
    planRow?.duration_days || (subRow.plan_id === "annual" ? 365 : 30);

  const now = new Date();
  let nextStart =
    periodStartUnix && periodStartUnix > 0
      ? new Date(periodStartUnix * 1000)
      : subRow.current_period_start
        ? new Date(subRow.current_period_start)
        : now;

  let nextEnd: Date;
  if (periodEndUnix && periodEndUnix > 0) {
    nextEnd = new Date(periodEndUnix * 1000);
  } else {
    const base =
      subRow.current_period_end && new Date(subRow.current_period_end) > now
        ? new Date(subRow.current_period_end)
        : now;
    nextEnd = new Date(base.getTime() + durationDays * 24 * 60 * 60 * 1000);
  }

  // Never shorten an existing valid period
  if (
    subRow.current_period_end &&
    new Date(subRow.current_period_end).getTime() > nextEnd.getTime()
  ) {
    nextEnd = new Date(subRow.current_period_end);
  }

  const effectiveAmount =
    amountInr && amountInr > 0
      ? Math.round(amountInr)
      : subRow.amount_inr || planRow?.price_inr || 0;

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("app_subscriptions")
    .update({
      status: "active",
      auto_renew: true,
      rzp_payment_id: paymentId || subRow.rzp_payment_id || null,
      amount_inr: effectiveAmount,
      current_period_start: nextStart.toISOString(),
      current_period_end: nextEnd.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", subRow.id)
    .select()
    .single();

  if (updateErr) {
    throw updateErr;
  }

  // Only log actual Razorpay payment charges (`pay_...`) so lifecycle webhooks
  // like `subscription.authenticated` never create duplicate rows in Payment History.
  if (paymentId && paymentId.startsWith("pay_")) {
    await supabaseAdmin.from("app_payment_logs").upsert(
      [
        {
          user_id: subRow.user_id,
          subscription_id: subRow.id,
          rzp_subscription_id: subscriptionId,
          rzp_payment_id: paymentId,
          event_type: eventType,
          amount_inr: effectiveAmount,
          status: "SUCCESS",
          raw_payload: rawPayload,
        },
      ],
      { onConflict: "rzp_payment_id", ignoreDuplicates: true },
    );
  }

  // If the user upgraded (e.g. Monthly -> Annual), automatically cancel any OTHER
  // active Razorpay subscription for this user so they are never double-charged!
  try {
    const { data: olderActiveSubs } = await supabaseAdmin
      .from("app_subscriptions")
      .select("id, rzp_subscription_id")
      .eq("user_id", subRow.user_id)
      .eq("status", "active")
      .neq("id", subRow.id);

    if (Array.isArray(olderActiveSubs) && olderActiveSubs.length > 0) {
      for (const oldSub of olderActiveSubs) {
        if (
          oldSub.rzp_subscription_id &&
          oldSub.rzp_subscription_id !== subscriptionId
        ) {
          await rzpFetch(
            `/subscriptions/${encodeURIComponent(oldSub.rzp_subscription_id)}/cancel`,
            {
              method: "POST",
              body: JSON.stringify({ cancel_at_cycle_end: 0 }),
            },
          ).catch(() => {});
        }

        await supabaseAdmin
          .from("app_subscriptions")
          .update({
            status: "cancelled",
            auto_renew: false,
            updated_at: now.toISOString(),
          })
          .eq("id", oldSub.id);
      }
    }
  } catch (cancelErr) {
    console.error("[app-sub] Old subscription cancel warning:", cancelErr);
  }

  return { activated: true, subscription: updated };
}
