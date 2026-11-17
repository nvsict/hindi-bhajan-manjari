import { NextResponse } from "next/server";
import {
  createAppUserAccount,
  ensureRazorpayPlan,
  getSiteBaseUrl,
  getSupabaseAdmin,
  isValidEmail,
  isValidIndianPhone,
  isValidPassword,
  normalizeEmail,
  normalizeIndianPhone,
  rzpFetch,
} from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 1-STEP CHECKOUT + AUTO USER CREATION (Razorpay Recurring Subscriptions):
 * - Reads live price from `app_plans` (never trusts client price)
 * - Auto-syncs a Razorpay recurring Plan (`monthly` / `yearly`) if needed
 * - If user is logged in (via Bearer JWT), binds subscription to their user_id
 * - If user is NOT logged in, automatically creates their user_id + profile from
 *   the checkout mobile/email/password in ONE single step
 * - Creates a Razorpay Subscription (`sub_XXXX`) & stores a `pending` row in `app_subscriptions`
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const planId = String(body.planId || "monthly").trim();
    const supabaseAdmin = getSupabaseAdmin();

    // 1. Validate plan from DB (single source of truth for pricing)
    const { data: plan, error: planErr } = await supabaseAdmin
      .from("app_plans")
      .select("*")
      .eq("id", planId)
      .eq("is_active", true)
      .maybeSingle();

    if (planErr || !plan) {
      return NextResponse.json(
        { error: "चुना गया प्लान उपलब्ध नहीं है।" },
        { status: 400 },
      );
    }

    // 2. Determine User ID — either logged-in Bearer token OR auto-create on checkout!
    let userId: string | null = null;
    let authEmail: string | null = null;
    let customerPhone = "";
    let customerEmail: string | null = null;
    let customerName = "Bhakt";
    let accountAutoCreated = false;

    const authHeader = req.headers.get("authorization") || "";
    const bearerToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : "";

    if (bearerToken) {
      const { data: userData } = await supabaseAdmin.auth.getUser(bearerToken);
      if (userData?.user?.id) {
        userId = userData.user.id;
        authEmail = userData.user.email || null;

        const { data: existingProfile } = await supabaseAdmin
          .from("app_profiles")
          .select("phone, email, full_name")
          .eq("user_id", userId)
          .maybeSingle();

        customerPhone =
          existingProfile?.phone || normalizeIndianPhone(body.phone) || "";
        customerEmail = existingProfile?.email || normalizeEmail(body.email);
        customerName =
          existingProfile?.full_name || String(body.fullName || "").trim() || "Bhakt";
      }
    }

    if (!userId) {
      const phone = normalizeIndianPhone(body.phone);
      const email = normalizeEmail(body.email);
      const password = String(body.password || "");
      const fullName = String(body.fullName || "").trim();

      if (!isValidIndianPhone(phone)) {
        return NextResponse.json(
          { error: "कृपया 10 अंकों का सही मोबाइल नंबर दर्ज करें।" },
          { status: 400 },
        );
      }

      if (email && !isValidEmail(email)) {
        return NextResponse.json(
          { error: "कृपया सही ईमेल पता दर्ज करें।" },
          { status: 400 },
        );
      }

      if (!isValidPassword(password)) {
        return NextResponse.json(
          { error: "पासवर्ड कम से कम 6 अक्षरों का होना चाहिए।" },
          { status: 400 },
        );
      }

      const created = await createAppUserAccount({
        phone,
        email,
        password,
        fullName,
      });

      if ("error" in created) {
        return NextResponse.json(
          { error: created.error, code: created.code },
          { status: created.status },
        );
      }

      userId = created.userId;
      authEmail = created.authEmail;
      customerPhone = created.phone;
      customerEmail = created.email;
      customerName = created.fullName || "Bhakt";
      accountAutoCreated = true;
    }

    // 3. Ensure Razorpay Plan exists at the current DB price
    const rzpPlanId = await ensureRazorpayPlan(plan);
    const totalCount = Number(plan.duration_days) >= 300 ? 10 : 120;

    // 4. Create Razorpay Recurring Subscription bound tightly to `userId` & `plan.id`
    const rzpRes = await rzpFetch("/subscriptions", {
      method: "POST",
      body: JSON.stringify({
        plan_id: rzpPlanId,
        total_count: totalCount,
        quantity: 1,
        customer_notify: 1,
        notes: {
          type: "app_subscription",
          app_user_id: userId,
          plan_id: plan.id,
          phone: customerPhone,
        },
      }),
    });

    const rzpData = await rzpRes.json().catch(() => ({}));
    if (!rzpRes.ok || !rzpData?.id) {
      console.error("[app-sub/create] Razorpay error:", rzpRes.status, rzpData);
      return NextResponse.json(
        {
          error:
            rzpData?.error?.description ||
            "सदस्यता सत्र तैयार करने में समस्या आई। कृपया पुनः प्रयास करें।",
        },
        { status: 502 },
      );
    }

    const rzpSubscriptionId = String(rzpData.id);

    // 5. Insert pending subscription row bound to userId
    const { error: subErr } = await supabaseAdmin
      .from("app_subscriptions")
      .insert([
        {
          user_id: userId,
          plan_id: plan.id,
          status: "pending",
          auto_renew: true,
          amount_inr: Number(plan.price_inr),
          rzp_subscription_id: rzpSubscriptionId,
        },
      ]);

    if (subErr) {
      console.error("[app-sub/create] DB insert warning:", subErr.message);
    }

    const siteUrl = getSiteBaseUrl();
    const qs = new URLSearchParams({
      sub_id: rzpSubscriptionId,
      plan_name: plan.name_hi || plan.name_en,
      name: customerName,
      phone: customerPhone,
      ...(customerEmail ? { email: customerEmail } : {}),
    });

    const checkoutUrl = `${siteUrl}/api/app-sub/checkout-page?${qs.toString()}`;

    return NextResponse.json(
      {
        subscriptionId: rzpSubscriptionId,
        orderId: rzpSubscriptionId, // backwards-compatible alias
        checkoutUrl,
        shortUrl: rzpData.short_url || null,
        amountInr: Number(plan.price_inr),
        planId: plan.id,
        userId,
        authEmail,
        accountAutoCreated,
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[app-sub/create] Unexpected error:", err);
    return NextResponse.json(
      {
        error:
          err?.message ||
          "भुगतान प्रारंभ करने में त्रुटि आई। कृपया पुनः प्रयास करें।",
      },
      { status: 500 },
    );
  }
}
