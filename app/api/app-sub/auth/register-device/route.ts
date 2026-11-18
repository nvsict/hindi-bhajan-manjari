import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "../../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const MAX_DEVICES_PER_ACCOUNT = 2;

function isMissingTableError(err: { code?: string; message?: string } | null): boolean {
  if (!err) return false;
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    (err.message || "").toLowerCase().includes("does not exist")
  );
}

async function authenticateBearer(req: Request) {
  const authHeader = req.headers.get("authorization") || "";
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : "";

  if (!token) {
    return { error: "Authentication required.", status: 401 as const };
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { data: userData, error: userErr } =
    await supabaseAdmin.auth.getUser(token);

  if (userErr || !userData?.user?.id) {
    return {
      error: "Invalid session. Please sign in again.",
      status: 401 as const,
    };
  }

  return { supabaseAdmin, userId: userData.user.id };
}

/**
 * GET /api/app-sub/auth/register-device
 * Returns the authenticated user's currently linked devices.
 */
export async function GET(req: Request) {
  try {
    const auth = await authenticateBearer(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const { supabaseAdmin, userId } = auth;
    const { data: devices, error } = await supabaseAdmin
      .from("app_device_sessions")
      .select("id, device_id, device_name, platform, last_seen_at, created_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false });

    if (error) {
      if (isMissingTableError(error)) {
        return NextResponse.json({
          ok: true,
          skipped: true,
          allowedCount: MAX_DEVICES_PER_ACCOUNT,
          devices: [],
        });
      }
      console.error("[app-sub/auth/register-device] GET error:", error);
      return NextResponse.json(
        { error: "Could not load linked devices." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      allowedCount: MAX_DEVICES_PER_ACCOUNT,
      deviceCount: devices?.length || 0,
      devices: devices || [],
    });
  } catch (err) {
    console.error("[app-sub/auth/register-device] GET exception:", err);
    return NextResponse.json(
      { error: "Unable to load linked devices right now." },
      { status: 500 },
    );
  }
}

/**
 * POST /api/app-sub/auth/register-device
 * Registers or refreshes the current device session and enforces the 2-device limit.
 */
export async function POST(req: Request) {
  try {
    const auth = await authenticateBearer(req);
    if ("error" in auth) {
      return NextResponse.json({ error: auth.error }, { status: auth.status });
    }

    const body = await req.json().catch(() => ({}));
    const deviceId = String(body?.deviceId || "").trim().slice(0, 128);
    const deviceName = String(body?.deviceName || "Android Device")
      .trim()
      .slice(0, 100);
    const platform = String(body?.platform || "android")
      .trim()
      .toLowerCase()
      .slice(0, 32);

    if (!deviceId || deviceId.length < 4) {
      return NextResponse.json(
        { error: "Invalid device identifier." },
        { status: 400 },
      );
    }

    const { supabaseAdmin, userId } = auth;
    const nowIso = new Date().toISOString();

    const { data: existingDevices, error: listErr } = await supabaseAdmin
      .from("app_device_sessions")
      .select("id, device_id, device_name, platform, last_seen_at, created_at")
      .eq("user_id", userId)
      .order("last_seen_at", { ascending: false });

    if (listErr) {
      if (isMissingTableError(listErr)) {
        return NextResponse.json({
          ok: true,
          skipped: true,
          allowedCount: MAX_DEVICES_PER_ACCOUNT,
          deviceCount: 1,
          devices: [],
        });
      }
      console.error("[app-sub/auth/register-device] List error:", listErr);
      return NextResponse.json(
        { error: "Could not verify device sessions." },
        { status: 500 },
      );
    }

    const currentList = existingDevices || [];
    const alreadyRegistered = currentList.find((d) => d.device_id === deviceId);

    if (alreadyRegistered) {
      await supabaseAdmin
        .from("app_device_sessions")
        .update({
          device_name: deviceName,
          platform,
          last_seen_at: nowIso,
        })
        .eq("user_id", userId)
        .eq("device_id", deviceId);

      const updatedDevices = currentList.map((d) =>
        d.device_id === deviceId
          ? { ...d, device_name: deviceName, platform, last_seen_at: nowIso }
          : d,
      );

      return NextResponse.json({
        ok: true,
        allowedCount: MAX_DEVICES_PER_ACCOUNT,
        deviceCount: updatedDevices.length,
        devices: updatedDevices,
      });
    }

    // Enforce max devices limit strictly WITHOUT inserting the 3rd device
    if (currentList.length >= MAX_DEVICES_PER_ACCOUNT) {
      return NextResponse.json(
        {
          ok: false,
          code: "DEVICE_LIMIT_EXCEEDED",
          allowedCount: MAX_DEVICES_PER_ACCOUNT,
          deviceCount: currentList.length,
          devices: currentList,
          error:
            "यह खाता पहले से 2 डिवाइसों पर सक्रिय है। जारी रखने के लिए किसी पुराने डिवाइस को हटाएँ।",
        },
        { status: 403 },
      );
    }

    const { data: inserted, error: insertErr } = await supabaseAdmin
      .from("app_device_sessions")
      .upsert(
        [
          {
            user_id: userId,
            device_id: deviceId,
            device_name: deviceName,
            platform,
            last_seen_at: nowIso,
          },
        ],
        { onConflict: "user_id,device_id" },
      )
      .select("id, device_id, device_name, platform, last_seen_at, created_at")
      .single();

    if (insertErr) {
      console.error("[app-sub/auth/register-device] Insert error:", insertErr);
      return NextResponse.json(
        { error: "Could not register device session." },
        { status: 500 },
      );
    }

    const nextDevices = inserted ? [inserted, ...currentList] : currentList;

    return NextResponse.json({
      ok: true,
      allowedCount: MAX_DEVICES_PER_ACCOUNT,
      deviceCount: nextDevices.length,
      devices: nextDevices,
    });
  } catch (err) {
    console.error("[app-sub/auth/register-device] POST exception:", err);
    return NextResponse.json(
      { error: "Unable to register device right now." },
      { status: 500 },
    );
  }
}
