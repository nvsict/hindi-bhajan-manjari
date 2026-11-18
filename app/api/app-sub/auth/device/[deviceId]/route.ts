import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * DELETE /api/app-sub/auth/device/[deviceId]
 * Removes a linked device from `app_device_sessions` for the authenticated user.
 */
export async function DELETE(
  req: Request,
  context: { params: Promise<{ deviceId: string }> },
) {
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

    const { deviceId: rawDeviceId } = await context.params;
    const deviceId = decodeURIComponent(String(rawDeviceId || "")).trim();

    if (!deviceId) {
      return NextResponse.json(
        { error: "Missing deviceId parameter." },
        { status: 400 },
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

    const { error: deleteErr } = await supabaseAdmin
      .from("app_device_sessions")
      .delete()
      .eq("user_id", userId)
      .eq("device_id", deviceId);

    if (deleteErr) {
      // Gracefully succeed if table does not exist yet
      if (deleteErr.code === "42P01" || deleteErr.code === "PGRST205") {
        return NextResponse.json({ ok: true, devices: [] });
      }
      console.error("[app-sub/auth/device] Delete error:", deleteErr);
      return NextResponse.json(
        { error: "Could not remove device. Please try again." },
        { status: 500 },
      );
    }

    const { data: remaining } = await supabaseAdmin
      .from("app_device_sessions")
      .select("id, device_id, device_name, platform, last_seen_at, created_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false });

    return NextResponse.json({
      ok: true,
      devices: remaining || [],
    });
  } catch (err) {
    console.error("[app-sub/auth/device] Exception:", err);
    return NextResponse.json(
      { error: "Unable to remove device right now." },
      { status: 500 },
    );
  }
}
