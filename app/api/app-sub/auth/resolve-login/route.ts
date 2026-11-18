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

/**
 * Resolves a mobile number OR email address into the user's Supabase Auth email
 * so the Android app can sign in with `supabase.auth.signInWithPassword()`.
 * Performs strict existence checks so users get accurate feedback.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawIdentifier = String(body.identifier || "").trim();

    if (!rawIdentifier) {
      return NextResponse.json(
        {
          code: "INVALID_INPUT",
          error: "Enter your 10-digit mobile number or email address.",
        },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const isEmailInput = rawIdentifier.includes("@");

    if (isEmailInput) {
      const email = normalizeEmail(rawIdentifier);
      if (!email || !isValidEmail(email)) {
        return NextResponse.json(
          {
            code: "INVALID_EMAIL",
            error: "Enter a valid email address.",
          },
          { status: 400 },
        );
      }

      const { data: profileByEmail } = await supabaseAdmin
        .from("app_profiles")
        .select("auth_email")
        .ilike("email", email)
        .maybeSingle();

      if (profileByEmail?.auth_email) {
        return NextResponse.json({ authEmail: profileByEmail.auth_email });
      }

      const { data: profileByAuthEmail } = await supabaseAdmin
        .from("app_profiles")
        .select("auth_email")
        .ilike("auth_email", email)
        .maybeSingle();

      if (profileByAuthEmail?.auth_email) {
        return NextResponse.json({ authEmail: profileByAuthEmail.auth_email });
      }

      return NextResponse.json(
        {
          code: "ACCOUNT_NOT_FOUND",
          error: "No account found with this email address. Please register first.",
        },
        { status: 404 },
      );
    } else {
      const phone = normalizeIndianPhone(rawIdentifier);
      if (!isValidIndianPhone(phone)) {
        return NextResponse.json(
          {
            code: "INVALID_PHONE",
            error: "Enter a valid 10-digit Indian mobile number or email.",
          },
          { status: 400 },
        );
      }

      const { data: profile } = await supabaseAdmin
        .from("app_profiles")
        .select("auth_email")
        .eq("phone", phone)
        .maybeSingle();

      if (!profile?.auth_email) {
        return NextResponse.json(
          {
            code: "ACCOUNT_NOT_FOUND",
            error: "No account found with this mobile number. Please register or get a pass.",
          },
          { status: 404 },
        );
      }

      return NextResponse.json({ authEmail: profile.auth_email });
    }
  } catch (err: any) {
    console.error("[app-sub/auth/resolve-login] Error:", err);
    return NextResponse.json(
      { error: "Could not verify account right now. Please try again." },
      { status: 500 },
    );
  }
}
