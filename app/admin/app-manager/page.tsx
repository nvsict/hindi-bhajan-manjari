import { createClient } from "@supabase/supabase-js";
import { getLiveAppRelease } from "@/lib/appRelease";
import AppManagerClient from "./AppManagerClient";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Android App Manager | Admin Panel",
};

async function safeSelect<T>(
  promise: PromiseLike<{ data: T[] | null; error: { message?: string; code?: string } | null }>,
): Promise<{ rows: T[]; missing: boolean }> {
  try {
    const { data, error } = await promise;
    if (error) {
      const msg = (error.message || "").toLowerCase();
      const missing =
        error.code === "42P01" ||
        error.code === "PGRST205" ||
        msg.includes("does not exist") ||
        msg.includes("could not find the table");
      return { rows: [], missing };
    }
    return { rows: data || [], missing: false };
  } catch {
    return { rows: [], missing: true };
  }
}

export default async function AdminAppManagerPage() {
  const sb = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Fetch all Android app tables in parallel (gracefully handles any optional tables not yet created)
  const [
    releaseConfig,
    releaseTableCheck,
    profilesRes,
    subsRes,
    plansRes,
    logsRes,
    devicesRes,
    savedRes,
    trialsRes,
    festivalsRes,
  ] = await Promise.all([
    getLiveAppRelease(),
    safeSelect(sb.from("app_release_config").select("id").limit(1)),
    safeSelect(
      sb
        .from("app_profiles")
        .select("user_id, phone, email, full_name, created_at, updated_at")
        .order("created_at", { ascending: false })
        .limit(500),
    ),
    safeSelect(
      sb
        .from("app_subscriptions")
        .select(
          "id, user_id, plan_id, status, auto_renew, amount_inr, current_period_start, current_period_end, rzp_subscription_id, rzp_payment_id, created_at, updated_at",
        )
        .order("updated_at", { ascending: false })
        .limit(1000),
    ),
    safeSelect(
      sb
        .from("app_plans")
        .select(
          "id, name_hi, name_en, description_hi, price_inr, duration_days, rzp_plan_id, is_active, updated_at",
        )
        .order("price_inr", { ascending: true }),
    ),
    safeSelect(
      sb
        .from("app_payment_logs")
        .select(
          "id, user_id, subscription_id, rzp_subscription_id, rzp_payment_id, event_type, amount_inr, status, raw_payload, created_at",
        )
        .order("created_at", { ascending: false })
        .limit(300),
    ),
    safeSelect(
      sb
        .from("app_device_sessions")
        .select("id, user_id, device_id, device_name, platform, last_seen_at, created_at")
        .order("last_seen_at", { ascending: false })
        .limit(1000),
    ),
    safeSelect(
      sb
        .from("app_user_saved_bhajans")
        .select("user_id, bhajan_slug, saved_at")
        .order("saved_at", { ascending: false })
        .limit(3000),
    ),
    safeSelect(
      sb
        .from("app_device_trials")
        .select("device_id, first_seen_at, trial_expires_at")
        .order("first_seen_at", { ascending: false })
        .limit(200),
    ),
    safeSelect(
      sb
        .from("app_festivals")
        .select(
          "id, festival_id, start_date, end_date, custom_title_hi, custom_tagline_hi, is_active, created_at",
        )
        .order("start_date", { ascending: true }),
    ),
  ]);

  // Compute top saved bhajan slugs + per-user saved counts
  const savedCountByUser: Record<string, number> = {};
  const savedCountBySlug: Record<string, number> = {};
  for (const row of savedRes.rows as Array<{ user_id: string; bhajan_slug: string }>) {
    if (row.user_id) {
      savedCountByUser[row.user_id] = (savedCountByUser[row.user_id] || 0) + 1;
    }
    if (row.bhajan_slug) {
      savedCountBySlug[row.bhajan_slug] =
        (savedCountBySlug[row.bhajan_slug] || 0) + 1;
    }
  }

  const topSavedSlugs = Object.entries(savedCountBySlug)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([slug, count]) => ({ slug, count }));

  return (
    <AppManagerClient
      initialRelease={releaseConfig}
      releaseTableMissing={releaseTableCheck.missing}
      festivalsTableMissing={festivalsRes.missing}
      initialProfiles={profilesRes.rows as any[]}
      initialSubscriptions={subsRes.rows as any[]}
      initialPlans={plansRes.rows as any[]}
      initialLogs={logsRes.rows as any[]}
      initialDevices={devicesRes.rows as any[]}
      initialTrials={trialsRes.rows as any[]}
      initialFestivals={festivalsRes.rows as any[]}
      savedCountByUser={savedCountByUser}
      totalSavedBhajans={savedRes.rows.length}
      topSavedSlugs={topSavedSlugs}
    />
  );
}
