import crypto from "crypto";
import { NextResponse } from "next/server";
import {
  getSupabaseAdmin,
  isValidEmail,
  isValidIndianPhone,
  normalizeEmail,
  normalizeIndianPhone,
} from "../../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
const SENDER_INFO = {
  name: "Hindi Bhajan Manjari",
  email: "contact@hindibhajanmanjari.com",
};

function getResetSigningSecret(): string {
  return (
    process.env.JWT_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    "hbm-reset-fallback"
  );
}

function maskEmailAddress(email: string): string {
  const [local, domain] = email.split("@");
  if (!local || !domain) return email;
  const visible = local.slice(0, Math.min(2, local.length));
  return `${visible}${"*".repeat(Math.max(2, local.length - visible.length))}@${domain}`;
}

function createSignedResetToken(userId: string, code: string): string {
  const secret = getResetSigningSecret();
  const codeHash = crypto
    .createHmac("sha256", secret)
    .update(`${userId}:${code}`)
    .digest("hex");

  const payload = Buffer.from(
    JSON.stringify({
      uid: userId,
      exp: Date.now() + 15 * 60 * 1000, // 15 minutes
      ch: codeHash,
    }),
    "utf8",
  ).toString("base64url");

  const sig = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("base64url");

  return `${payload}.${sig}`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawIdentifier = String(body.identifier || "").trim();

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: "Enter your registered mobile number or email address." },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    let profile: {
      user_id: string;
      email: string | null;
      auth_email: string | null;
      full_name: string | null;
    } | null = null;

    if (rawIdentifier.includes("@")) {
      const email = normalizeEmail(rawIdentifier);
      if (!email || !isValidEmail(email)) {
        return NextResponse.json(
          { error: "Enter a valid email address." },
          { status: 400 },
        );
      }
      const { data } = await supabaseAdmin
        .from("app_profiles")
        .select("user_id, email, auth_email, full_name")
        .ilike("email", email)
        .maybeSingle();
      profile = data;
    } else {
      const phone = normalizeIndianPhone(rawIdentifier);
      if (!isValidIndianPhone(phone)) {
        return NextResponse.json(
          { error: "Enter a valid 10-digit mobile number or email address." },
          { status: 400 },
        );
      }
      const { data } = await supabaseAdmin
        .from("app_profiles")
        .select("user_id, email, auth_email, full_name")
        .eq("phone", phone)
        .maybeSingle();
      profile = data;
    }

    if (!profile) {
      return NextResponse.json(
        { error: "No account found with that mobile number or email." },
        { status: 404 },
      );
    }

    const targetEmail =
      profile.email ||
      (profile.auth_email &&
      !profile.auth_email.endsWith("@phone.hindibhajanmanjari.com")
        ? profile.auth_email
        : null);

    if (!targetEmail) {
      return NextResponse.json(
        {
          code: "NO_EMAIL_ON_FILE",
          error:
            "No email address is linked to this mobile account. Email contact@hindibhajanmanjari.com with your registered mobile number for free recovery.",
        },
        { status: 422 },
      );
    }

    const brevoKey = process.env.BREVO_API_KEY;
    if (!brevoKey) {
      return NextResponse.json(
        { error: "Password reset email service is not configured right now." },
        { status: 503 },
      );
    }

    const code = String(crypto.randomInt(100000, 1000000));
    const resetToken = createSignedResetToken(profile.user_id, code);
    const displayName = profile.full_name || "Member";

    const mailRes = await fetch(BREVO_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": brevoKey,
      },
      body: JSON.stringify({
        sender: SENDER_INFO,
        to: [{ email: targetEmail, name: displayName }],
        subject: `${code} is your Hindi Bhajan Manjari password reset code`,
        htmlContent: `
          <div style="font-family:system-ui,-apple-system,sans-serif;max-width:460px;margin:0 auto;padding:24px;background:#faf8f4;color:#1c1917;border:1px solid #e7e5e4;border-radius:12px;">
            <p style="margin:0 0 8px;font-size:13px;color:#78716c;">Hindi Bhajan Manjari · हिंदी भजन मंजरी</p>
            <h2 style="margin:0 0 12px;font-size:20px;font-weight:600;">Password reset code</h2>
            <p style="margin:0 0 18px;font-size:14px;line-height:1.6;color:#57534e;">
              Use the 6-digit code below in the app to set a new password. This code expires in 15 minutes.<br/>
              ऐप में नया पासवर्ड सेट करने के लिए नीचे दिया गया 6 अंकों का कोड दर्ज करें। यह कोड 15 मिनट तक वैध है।
            </p>
            <div style="font-size:28px;font-weight:700;letter-spacing:6px;padding:14px 18px;background:#ffffff;border:1px solid #d6d3d1;border-radius:8px;text-align:center;color:#c2410c;">
              ${code}
            </div>
            <p style="margin:18px 0 0;font-size:12px;color:#78716c;">
              If you did not request a password reset, you can safely ignore this email.
            </p>
          </div>
        `,
      }),
    });

    if (!mailRes.ok) {
      const brevoErr = await mailRes.text().catch(() => "");
      console.error("[app-sub/auth/forgot-password] Brevo error:", mailRes.status, brevoErr);
      return NextResponse.json(
        { error: "Could not send reset email right now. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      maskedEmail: maskEmailAddress(targetEmail),
      resetToken,
    });
  } catch (err: any) {
    console.error("[app-sub/auth/forgot-password] Error:", err);
    return NextResponse.json(
      { error: "Unable to process password reset right now." },
      { status: 500 },
    );
  }
}
