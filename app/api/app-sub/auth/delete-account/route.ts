import { NextResponse } from "next/server";
import { getSupabaseAdmin, rzpFetch } from "../../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * In-App Account Deletion (Required by Google Play Store policy).
 * - Authenticates user via Bearer JWT
 * - Cancels any active Razorpay recurring subscription immediately so user is never charged again
 * - Permanently deletes Supabase auth.users row (cascading app_profiles & app_subscriptions)
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

    const userId = userData.user.id;

    // 1. Cancel any active Razorpay recurring subscriptions first
    try {
      const { data: activeSubs } = await supabaseAdmin
        .from("app_subscriptions")
        .select("rzp_subscription_id")
        .eq("user_id", userId)
        .eq("status", "active");

      if (Array.isArray(activeSubs)) {
        for (const sub of activeSubs) {
          if (sub.rzp_subscription_id) {
            await rzpFetch(
              `/subscriptions/${encodeURIComponent(sub.rzp_subscription_id)}/cancel`,
              {
                method: "POST",
                body: JSON.stringify({ cancel_at_cycle_end: 0 }),
              },
            ).catch(() => {});
          }
        }
      }
    } catch (rzpErr) {
      console.error("[app-sub/auth/delete-account] Razorpay cancel warning:", rzpErr);
    }

    // 2. Permanently delete Supabase Auth user (cascades app_profiles & app_subscriptions)
    const { error: deleteErr } =
      await supabaseAdmin.auth.admin.deleteUser(userId);

    if (deleteErr) {
      console.error("[app-sub/auth/delete-account] Delete failed:", deleteErr.message);
      return NextResponse.json(
        { error: "Could not delete account right now. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[app-sub/auth/delete-account] Error:", err);
    return NextResponse.json(
      { error: "Unable to delete account right now." },
      { status: 500 },
    );
  }
}
