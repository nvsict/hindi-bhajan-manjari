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
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawIdentifier = String(body.identifier || "").trim();

    if (!rawIdentifier) {
      return NextResponse.json(
        { error: "कृपया मोबाइल नंबर या ईमेल दर्ज करें।" },
        { status: 400 },
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const isEmailInput = rawIdentifier.includes("@");

    if (isEmailInput) {
      const email = normalizeEmail(rawIdentifier);
      if (!email || !isValidEmail(email)) {
        return NextResponse.json(
          { error: "कृपया सही ईमेल पता दर्ज करें।" },
          { status: 400 },
        );
      }

      const { data: profile } = await supabaseAdmin
        .from("app_profiles")
        .select("auth_email")
        .ilike("email", email)
        .maybeSingle();

      // Fallback to direct email in case auth user exists directly
      return NextResponse.json({
        authEmail: profile?.auth_email || email,
      });
    } else {
      const phone = normalizeIndianPhone(rawIdentifier);
      if (!isValidIndianPhone(phone)) {
        return NextResponse.json(
          { error: "कृपया 10 अंकों का सही मोबाइल नंबर या वैध ईमेल दर्ज करें।" },
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
          { error: "इस मोबाइल नंबर से कोई खाता नहीं मिला। कृपया नया खाता बनाएँ या सदस्यता लें।" },
          { status: 404 },
        );
      }

      return NextResponse.json({ authEmail: profile.auth_email });
    }
  } catch (err: any) {
    console.error("[app-sub/auth/resolve-login] Error:", err);
    return NextResponse.json(
      { error: "लॉगिन जाँच में समस्या आई। कृपया पुनः प्रयास करें।" },
      { status: 500 },
    );
  }
}
