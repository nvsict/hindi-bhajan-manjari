import crypto from "crypto";
import { NextResponse } from "next/server";
import { getSupabaseAdmin, isValidPassword } from "../../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function getResetSigningSecret(): string {
  return (
    process.env.JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "hbm-reset-fallback"
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const resetToken = String(body.resetToken || "").trim();
    const code = String(body.code || "").replace(/\D/g, "");
    const newPassword = String(body.newPassword || "");

    if (!resetToken || !resetToken.includes(".")) {
      return NextResponse.json(
        { error: "Reset session expired. Request a new code." },
        { status: 400 },
      );
    }

    if (code.length !== 6) {
      return NextResponse.json(
        { error: "Enter the 6-digit code sent to your email." },
        { status: 400 },
      );
    }

    if (!isValidPassword(newPassword)) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 },
      );
    }

    const [payloadB64, sigB64] = resetToken.split(".");
    const secret = getResetSigningSecret();

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(payloadB64)
      .digest("base64url");

    const sigBuf = Buffer.from(sigB64 || "", "utf8");
    const expectedBuf = Buffer.from(expectedSig, "utf8");
    if (
      sigBuf.length !== expectedBuf.length ||
      !crypto.timingSafeEqual(sigBuf, expectedBuf)
    ) {
      return NextResponse.json(
        { error: "Invalid reset session. Request a new code." },
        { status: 400 },
      );
    }

    const parsed = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8"),
    ) as { uid?: string; exp?: number; ch?: string };

    if (!parsed.uid || !parsed.exp || !parsed.ch || Date.now() > parsed.exp) {
      return NextResponse.json(
        { error: "Reset code has expired. Request a new code." },
        { status: 400 },
      );
    }

    const providedCodeHash = crypto
      .createHmac("sha256", secret)
      .update(`${parsed.uid}:${code}`)
      .digest("hex");

    const actualCodeBuf = Buffer.from(providedCodeHash, "utf8");
    const expectedCodeBuf = Buffer.from(parsed.ch, "utf8");
    if (
      actualCodeBuf.length !== expectedCodeBuf.length ||
      !crypto.timingSafeEqual(actualCodeBuf, expectedCodeBuf)
    ) {
      return NextResponse.json(
        { error: "Incorrect 6-digit code. Check your email and try again." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error: updateErr } = await supabaseAdmin.auth.admin.updateUserById(
      parsed.uid,
      { password: newPassword },
    );

    if (updateErr) {
      return NextResponse.json(
        { error: "Could not update password. Please try again." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("[app-sub/auth/reset-password] Error:", err);
    return NextResponse.json(
      { error: "Unable to reset password right now." },
      { status: 500 },
    );
  }
}
