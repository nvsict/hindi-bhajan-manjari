// E:\Desktop\Tools\hindi-bhajan-manjari\app\api\app-sub\_lib.ts
// Isolated server-only helpers for Android App Auth & Recurring Subscriptions.
// Does NOT touch `supporters` or any existing website table.

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

export const CF_BASE =
  process.env.CASHFREE_BASE_URL || "https://sandbox.cashfree.com";

export const IS_CF_SANDBOX = CF_BASE.toLowerCase().includes("sandbox");

export function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase server env vars are not configured.");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function getSiteBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.hindibhajanmanjari.com"
  ).replace(/\/+$/, "");
}

export async function cfFetch(path: string, init?: RequestInit) {
  const clientId = process.env.CASHFREE_CLIENT_ID;
  const clientSecret = process.env.CASHFREE_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Cashfree server credentials are missing.");
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 14000);
  const baseUrl = CF_BASE.endsWith("/pg") ? CF_BASE : `${CF_BASE}/pg`;

  try {
    return await fetch(`${baseUrl}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-api-version": "2023-08-01",
        "x-client-id": clientId,
        "x-client-secret": clientSecret,
        ...(init?.headers || {}),
      },
      cache: "no-store",
      signal: ctrl.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

export function verifyCashfreeSignature(
  timestamp: string,
  rawBody: string,
  signature: string,
): boolean {
  const secret = process.env.CASHFREE_CLIENT_SECRET || "";
  if (!secret || !timestamp || !signature) return false;
  const expected = crypto
    .createHmac("sha256", secret)
    .update(timestamp + rawBody)
    .digest("base64");
  return expected === signature;
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
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidPassword(password: unknown): boolean {
  const s = String(password || "");
  return s.length >= 6 && s.length <= 72;
}

/**
 * Deterministic auth email for phone-first registration so users can sign in
 * with either phone OR email + password without SMS OTP fees.
 */
export function buildAuthEmail(phone: string, email: string | null): string {
  return email || `${phone}@phone.hindibhajanmanjari.com`;
}

/**
 * Creates a verified Supabase Auth user + `app_profiles` row with strict duplicate checks.
 */
export async function createAppUserAccount(params: {
  phone: string;
  email: string | null;
  password: string;
  fullName?: string | null;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { phone, email, password, fullName } = params;

  // 1. Check duplicate phone
  const { data: existingPhone } = await supabaseAdmin
    .from("app_profiles")
    .select("user_id")
    .eq("phone", phone)
    .maybeSingle();

  if (existingPhone) {
    return {
      error: "यह मोबाइल नंबर पहले से पंजीकृत है। कृपया लॉगिन करें।",
      code: "PHONE_EXISTS" as const,
      status: 409,
    };
  }

  // 2. Check duplicate email (if provided)
  if (email) {
    const { data: existingEmail } = await supabaseAdmin
      .from("app_profiles")
      .select("user_id")
      .ilike("email", email)
      .maybeSingle();

    if (existingEmail) {
      return {
        error: "यह ईमेल पता पहले से पंजीकृत है। कृपया लॉगिन करें।",
        code: "EMAIL_EXISTS" as const,
        status: 409,
      };
    }
  }

  const authEmail = buildAuthEmail(phone, email);
  const cleanName = String(fullName || "").trim().slice(0, 80) || null;

  // 3. Create Supabase Auth user (pre-confirmed for instant frictionless login)
  const { data: authCreated, error: authErr } =
    await supabaseAdmin.auth.admin.createUser({
      email: authEmail,
      password,
      email_confirm: true,
      user_metadata: {
        phone,
        real_email: email,
        full_name: cleanName,
        source: "android_app",
      },
    });

  if (authErr || !authCreated?.user) {
    const msg = authErr?.message || "खाता बनाने में त्रुटि आई।";
    const isDup =
      msg.toLowerCase().includes("already") ||
      msg.toLowerCase().includes("registered");
    return {
      error: isDup
        ? "यह खाता पहले से पंजीकृत है। कृपया लॉगिन करें।"
        : msg,
      code: isDup ? ("ACCOUNT_EXISTS" as const) : ("AUTH_ERROR" as const),
      status: isDup ? 409 : 400,
    };
  }

  const userId = authCreated.user.id;

  // 4. Insert profile row bound to auth.users(id)
  const { error: profileErr } = await supabaseAdmin
    .from("app_profiles")
    .insert([
      {
        user_id: userId,
        phone,
        email,
        full_name: cleanName,
        auth_email: authEmail,
      },
    ]);

  if (profileErr) {
    // Rollback auth user if profile insert fails
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    return {
      error: "प्रोफ़ाइल सहेजने में त्रुटि आई। कृपया पुनः प्रयास करें।",
      code: "PROFILE_ERROR" as const,
      status: 500,
    };
  }

  return {
    userId,
    authEmail,
    phone,
    email,
    fullName: cleanName,
  };
}

/**
 * Idempotent activation of an app subscription upon verified Cashfree payment.
 * Called by BOTH `/api/app-sub/verify` and `/api/app-sub/webhook`.
 */
export async function activateSubscriptionForOrder(params: {
  orderId: string;
  paymentId: string;
  amountInr?: number;
  eventType: string;
  rawPayload?: any;
}) {
  const supabaseAdmin = getSupabaseAdmin();
  const { orderId, paymentId, amountInr, eventType, rawPayload } = params;

  const { data: subRow, error: subErr } = await supabaseAdmin
    .from("app_subscriptions")
    .select("*")
    .eq("cf_order_id", orderId)
    .maybeSingle();

  if (subErr || !subRow) {
    return { activated: false, reason: "SUBSCRIPTION_NOT_FOUND" as const };
  }

  // Already active for this order — idempotent return
  if (subRow.status === "active" && subRow.current_period_end) {
    return { activated: true, subscription: subRow };
  }

  // Fetch plan duration
  const { data: planRow } = await supabaseAdmin
    .from("app_plans")
    .select("duration_days, price_inr")
    .eq("id", subRow.plan_id)
    .maybeSingle();

  const durationDays = planRow?.duration_days || (subRow.plan_id === "annual" ? 365 : 30);

  // If user already has an active future period, extend from that date; otherwise start from now()
  const { data: latestActive } = await supabaseAdmin
    .from("app_subscriptions")
    .select("current_period_end")
    .eq("user_id", subRow.user_id)
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .order("current_period_end", { ascending: false })
    .limit(1)
    .maybeSingle();

  const now = new Date();
  const startBase =
    latestActive?.current_period_end &&
    new Date(latestActive.current_period_end) > now
      ? new Date(latestActive.current_period_end)
      : now;

  const periodEnd = new Date(
    startBase.getTime() + durationDays * 24 * 60 * 60 * 1000,
  );

  const { data: updated, error: updateErr } = await supabaseAdmin
    .from("app_subscriptions")
    .update({
      status: "active",
      cf_payment_id: String(paymentId),
      amount_inr: amountInr ?? subRow.amount_inr,
      current_period_start: now.toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: now.toISOString(),
    })
    .eq("id", subRow.id)
    .select()
    .single();

  if (updateErr) {
    console.error("[app-sub] Failed updating subscription:", updateErr);
    return { activated: false, reason: "DB_UPDATE_ERROR" as const };
  }

  // Log payment idempotently (unique cf_payment_id ignores duplicate webhook/verify races)
  await supabaseAdmin
    .from("app_payment_logs")
    .upsert(
      [
        {
          user_id: subRow.user_id,
          subscription_id: subRow.id,
          cf_order_id: orderId,
          cf_payment_id: String(paymentId),
          event_type: eventType,
          amount_inr: amountInr ?? subRow.amount_inr,
          status: "SUCCESS",
          raw_payload: rawPayload || null,
        },
      ],
      { onConflict: "cf_payment_id", ignoreDuplicates: true },
    );

  return { activated: true, subscription: updated };
}
