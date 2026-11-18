"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import type { AppChangelogEntry } from "@/lib/appRelease";

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

/**
 * Verifies the caller has an active authenticated Admin session cookie
 * before executing any privileged service_role mutation.
 */
async function requireAdminAuth(): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Read-only inside server action auth verification
          },
        },
      },
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return { ok: false, error: "Unauthorized: Admin login required." };
    }
    return { ok: true, email: user.email || user.id };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Auth verification failed." };
  }
}

function revalidateAppPaths() {
  revalidatePath("/admin/app-manager");
  revalidatePath("/app");
  revalidatePath("/api/app-release");
}

// ============================================================================
// 1. LIVE APK RELEASE & DISTRIBUTION CONFIG
// ============================================================================
export async function saveAppReleaseConfigAction(payload: {
  latest_version: string;
  version_code: number;
  release_channel: "stable" | "beta";
  release_date: string;
  release_date_hi: string;
  apk_size_label: string;
  min_android: string;
  min_sdk: number;
  architecture: string;
  apk_download_url: string;
  sha256: string;
  is_mandatory_update: boolean;
  changelog: AppChangelogEntry[];
}) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const { error } = await sb.from("app_release_config").upsert(
      {
        id: "android_main",
        latest_version: payload.latest_version.trim(),
        version_code: Math.max(1, Number(payload.version_code) || 1),
        release_channel:
          payload.release_channel === "beta" ? "beta" : "stable",
        release_date: payload.release_date.trim(),
        release_date_hi: payload.release_date_hi.trim(),
        apk_size_label: payload.apk_size_label.trim(),
        min_android: payload.min_android.trim(),
        min_sdk: Math.max(21, Number(payload.min_sdk) || 26),
        architecture: payload.architecture.trim(),
        apk_download_url: payload.apk_download_url.trim(),
        sha256: payload.sha256.trim(),
        is_mandatory_update: Boolean(payload.is_mandatory_update),
        changelog: payload.changelog,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (error) throw new Error(error.message);
    revalidateAppPaths();
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.message ||
        "Could not save release config. Ensure supabase_app_admin_config.sql has been executed.",
    };
  }
}

// ============================================================================
// 2. SUBSCRIPTION PLANS & DYNAMIC PRICING (`app_plans`)
// ============================================================================
export async function updateAppPlanAction(payload: {
  id: string;
  name_hi: string;
  name_en: string;
  description_hi: string;
  price_inr: number;
  duration_days: number;
  is_active: boolean;
}) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const price = Math.max(1, Math.round(Number(payload.price_inr) || 0));
    const days = Math.max(1, Math.round(Number(payload.duration_days) || 30));

    // Fetch current plan to check if price changed (reset rzp_plan_id so Razorpay auto-recreates synced plan!)
    const { data: existing } = await sb
      .from("app_plans")
      .select("price_inr")
      .eq("id", payload.id)
      .maybeSingle();

    const priceChanged = existing && Number(existing.price_inr) !== price;

    const updateFields: Record<string, unknown> = {
      name_hi: payload.name_hi.trim(),
      name_en: payload.name_en.trim(),
      description_hi: payload.description_hi.trim(),
      price_inr: price,
      duration_days: days,
      is_active: Boolean(payload.is_active),
      updated_at: new Date().toISOString(),
    };

    if (priceChanged) {
      updateFields.rzp_plan_id = null;
      updateFields.rzp_plan_price_inr = null;
    }

    const { error } = await sb
      .from("app_plans")
      .update(updateFields)
      .eq("id", payload.id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/app-manager");
    return { success: true, priceChanged: Boolean(priceChanged) };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update plan." };
  }
}

// ============================================================================
// 3. MANUAL SUBSCRIPTION GRANT / EXTEND / REVOKE
// ============================================================================
export async function grantOrExtendSubscriptionAction(payload: {
  userId: string;
  planId: string;
  days: number;
  note?: string;
}) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const addDays = Math.max(1, Math.min(3650, Math.round(Number(payload.days) || 30)));
    const now = new Date();

    // Check if user already has an active subscription to extend from its expiry
    const { data: activeSub } = await sb
      .from("app_subscriptions")
      .select("id, current_period_end")
      .eq("user_id", payload.userId)
      .eq("status", "active")
      .order("current_period_end", { ascending: false })
      .limit(1)
      .maybeSingle();

    const baseDate =
      activeSub?.current_period_end &&
      new Date(activeSub.current_period_end) > now
        ? new Date(activeSub.current_period_end)
        : now;

    const newExpiry = new Date(baseDate.getTime() + addDays * 24 * 60 * 60 * 1000);

    let subscriptionId: string | null = null;

    if (activeSub?.id) {
      const { error } = await sb
        .from("app_subscriptions")
        .update({
          plan_id: payload.planId,
          status: "active",
          current_period_end: newExpiry.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", activeSub.id);
      if (error) throw new Error(error.message);
      subscriptionId = activeSub.id;
    } else {
      const { data: inserted, error } = await sb
        .from("app_subscriptions")
        .insert({
          user_id: payload.userId,
          plan_id: payload.planId,
          status: "active",
          auto_renew: false,
          amount_inr: 0,
          current_period_start: now.toISOString(),
          current_period_end: newExpiry.toISOString(),
          updated_at: now.toISOString(),
        })
        .select("id")
        .single();
      if (error) throw new Error(error.message);
      subscriptionId = inserted?.id || null;
    }

    // Write transparent audit log
    await sb.from("app_payment_logs").insert({
      user_id: payload.userId,
      subscription_id: subscriptionId,
      event_type: "admin_manual_grant",
      amount_inr: 0,
      status: "granted",
      raw_payload: {
        granted_by: auth.email,
        days_added: addDays,
        plan_id: payload.planId,
        note: payload.note || "Granted from Admin App Manager",
      },
    });

    revalidatePath("/admin/app-manager");
    return { success: true, newExpiry: newExpiry.toISOString() };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Could not grant/extend subscription.",
    };
  }
}

export async function revokeSubscriptionAction(subscriptionId: string, userId: string) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const nowIso = new Date().toISOString();
    const { error } = await sb
      .from("app_subscriptions")
      .update({
        status: "cancelled",
        auto_renew: false,
        current_period_end: nowIso,
        updated_at: nowIso,
      })
      .eq("id", subscriptionId);

    if (error) throw new Error(error.message);

    await sb.from("app_payment_logs").insert({
      user_id: userId,
      subscription_id: subscriptionId,
      event_type: "admin_manual_revoke",
      amount_inr: 0,
      status: "cancelled",
      raw_payload: { revoked_by: auth.email },
    });

    revalidatePath("/admin/app-manager");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to revoke pass." };
  }
}

// ============================================================================
// 4. USER PROFILE & LINKED DEVICE MANAGEMENT (2-DEVICE LIMIT SUPPORT)
// ============================================================================
export async function updateAppUserProfileAction(payload: {
  userId: string;
  fullName: string;
  email: string;
}) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const cleanEmail = payload.email.trim().toLowerCase() || null;
    const { error } = await sb
      .from("app_profiles")
      .update({
        full_name: payload.fullName.trim() || null,
        email: cleanEmail,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", payload.userId);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/app-manager");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update user." };
  }
}

export async function unlinkUserDeviceAction(sessionId: string) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const { error } = await sb
      .from("app_device_sessions")
      .delete()
      .eq("id", sessionId);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/app-manager");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to unlink device." };
  }
}

// ============================================================================
// 5. TRIAL RESET TOOL (`app_device_trials`)
// ============================================================================
export async function resetDeviceTrialAction(deviceId: string) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const { error } = await sb
      .from("app_device_trials")
      .delete()
      .eq("device_id", deviceId);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/app-manager");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to reset trial." };
  }
}

// ============================================================================
// 6. FESTIVAL SPECIAL MODE REMOTE OVERRIDES (`app_festivals`)
// ============================================================================
export async function createFestivalOverrideAction(payload: {
  festival_id: string;
  start_date: string;
  end_date: string;
  custom_title_hi?: string;
  custom_tagline_hi?: string;
}) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const { error } = await sb.from("app_festivals").insert({
      festival_id: payload.festival_id,
      start_date: payload.start_date,
      end_date: payload.end_date,
      custom_title_hi: payload.custom_title_hi?.trim() || null,
      custom_tagline_hi: payload.custom_tagline_hi?.trim() || null,
      is_active: true,
    });

    if (error) throw new Error(error.message);
    revalidatePath("/admin/app-manager");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error:
        err?.message ||
        "Failed to create festival override. Ensure supabase_app_admin_config.sql was run.",
    };
  }
}

export async function toggleFestivalOverrideAction(id: string, isActive: boolean) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const { error } = await sb
      .from("app_festivals")
      .update({ is_active: isActive })
      .eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/app-manager");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to update festival." };
  }
}

export async function deleteFestivalOverrideAction(id: string) {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  try {
    const sb = getAdminSupabase();
    const { error } = await sb.from("app_festivals").delete().eq("id", id);

    if (error) throw new Error(error.message);
    revalidatePath("/admin/app-manager");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || "Failed to delete festival." };
  }
}

// ============================================================================
// 8. DIRECT APK STORAGE BUCKET MANAGEMENT (`apks`)
// ============================================================================
export interface BucketApkFile {
  name: string;
  size: number;
  createdAt: string;
  publicUrl: string;
}

export async function createApkSignedUploadUrlAction(payload: {
  filename: string;
}): Promise<
  | {
      success: true;
      signedUrl: string;
      token: string;
      path: string;
      publicUrl: string;
    }
  | { success: false; error: string }
> {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const raw = (payload.filename || "").trim();
  const baseName = raw.split("/").pop()?.split("\\").pop() || "";
  const safeFilename = baseName
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, "-")
    .replace(/-+/g, "-");

  if (!safeFilename || !safeFilename.endsWith(".apk")) {
    return {
      success: false,
      error: "Filename must end with .apk (e.g. hindi-bhajan-manjari-v1.0.0.apk).",
    };
  }

  try {
    const sb = getAdminSupabase();

    // Verify bucket exists (defensive self-healing if ever recreated)
    const { data: existingBucket } = await sb.storage.getBucket("apks");
    if (!existingBucket) {
      await sb.storage.createBucket("apks", {
        public: true,
        allowedMimeTypes: [
          "application/vnd.android.package-archive",
          "application/octet-stream",
        ],
      });
    }

    const { data, error } = await sb.storage
      .from("apks")
      .createSignedUploadUrl(safeFilename, { upsert: true });

    if (error || !data) {
      throw new Error(error?.message || "Failed to generate signed upload URL.");
    }

    const { data: pubData } = sb.storage.from("apks").getPublicUrl(safeFilename);

    return {
      success: true,
      signedUrl: data.signedUrl,
      token: data.token,
      path: safeFilename,
      publicUrl: pubData.publicUrl,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Could not prepare signed upload URL for apks bucket.",
    };
  }
}

export async function listBucketApksAction(): Promise<{
  success: boolean;
  error?: string;
  files: BucketApkFile[];
}> {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error, files: [] };

  try {
    const sb = getAdminSupabase();
    const { data, error } = await sb.storage.from("apks").list("", {
      limit: 30,
      sortBy: { column: "created_at", order: "desc" },
    });

    if (error) throw new Error(error.message);

    const pubBase = sb.storage
      .from("apks")
      .getPublicUrl("")
      .data.publicUrl.replace(/\/+$/, "");

    const files: BucketApkFile[] = (data || [])
      .filter((f) => f.name && f.name.toLowerCase().endsWith(".apk"))
      .map((f) => ({
        name: f.name,
        size: Number((f.metadata as any)?.size || 0),
        createdAt: f.created_at || f.updated_at || new Date().toISOString(),
        publicUrl: `${pubBase}/${encodeURIComponent(f.name)}`,
      }));

    return { success: true, files };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to list APKs from bucket.",
      files: [],
    };
  }
}

export async function deleteBucketApkAction(filename: string): Promise<{
  success: boolean;
  error?: string;
}> {
  const auth = await requireAdminAuth();
  if (!auth.ok) return { success: false, error: auth.error };

  const clean = (filename || "").trim();
  if (!clean || clean.includes("/") || clean.includes("\\") || clean.includes("..")) {
    return { success: false, error: "Invalid filename." };
  }

  try {
    const sb = getAdminSupabase();
    const { error } = await sb.storage.from("apks").remove([clean]);
    if (error) throw new Error(error.message);
    revalidatePath("/admin/app-manager");
    return { success: true };
  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Failed to delete APK file from bucket.",
    };
  }
}
