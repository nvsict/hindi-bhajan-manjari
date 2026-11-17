import { NextResponse } from "next/server";
import {
  cfFetch,
  createAppUserAccount,
  getSiteBaseUrl,
  getSupabaseAdmin,
  IS_CF_SANDBOX,
  isValidEmail,
  isValidIndianPhone,
  isValidPassword,
  normalizeEmail,
  normalizeIndianPhone,
} from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * 1-STEP CHECKOUT + AUTO USER CREATION:
 * - Reads live price from `app_plans` (never trusts client price)
 * - If user is logged in (via Bearer JWT), binds payment to their existing user_id
 * - If user is NOT logged in, automatically creates their user_id + profile from
 *   the checkout mobile/email/password in ONE single step (zero extra signup friction!)
 * - Creates a Cashfree Payment Session & stores a `pending` row in `app_subscriptions`
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
          existingProfile?.phone || normalizeIndianPhone(body.phone) || "9999999999";
        customerEmail = existingProfile?.email || normalizeEmail(body.email);
        customerName = existingProfile?.full_name || String(body.fullName || "").trim() || "Bhakt";
      }
    }

    if (!userId) {
      // Guest at checkout -> validate details & auto-create account in 1 step!
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

    // 3. Create Cashfree Order bound tightly to `userId` & `planId`
    const orderId = `HBM_APP_${planId.toUpperCase()}_${Date.now().toString(36).toUpperCase()}_${Math.floor(Math.random() * 9000 + 1000)}`;
    const siteUrl = getSiteBaseUrl();

    const returnUrl = `${siteUrl}/api/app-sub/checkout-page?done=1&order_id={order_id}`;

    const cfPayload: Record<string, unknown> = {
      order_id: orderId,
      order_amount: Number(plan.price_inr),
      order_currency: "INR",
      order_note: `Hindi Bhajan Manjari App — ${plan.name_en}`,
      customer_details: {
        customer_id: `hbm_${userId.replace(/-/g, "").slice(0, 24)}`,
        customer_name: customerName,
        customer_phone: customerPhone,
        ...(customerEmail ? { customer_email: customerEmail } : {}),
      },
      order_meta: {
        return_url: returnUrl,
        notify_url: `${siteUrl}/api/app-sub/webhook`,
      },
      order_tags: {
        type: "app_subscription",
        app_user_id: userId,
        plan_id: plan.id,
      },
    };

    const cfRes = await cfFetch("/orders", {
      method: "POST",
      body: JSON.stringify(cfPayload),
    });

    const cfData = await cfRes.json().catch(() => ({}));
    if (!cfRes.ok || !cfData.payment_session_id) {
      console.error("[app-sub/create] Cashfree error:", cfRes.status, cfData);
      return NextResponse.json(
        {
          error:
            cfData?.message || "भुगतान सत्र तैयार करने में समस्या आई। कृपया पुनः प्रयास करें।",
        },
        { status: 502 },
      );
    }

    // 4. Insert pending subscription row bound to userId
    const { error: subErr } = await supabaseAdmin
      .from("app_subscriptions")
      .insert([
        {
          user_id: userId,
          plan_id: plan.id,
          status: "pending",
          auto_renew: true,
          amount_inr: Number(plan.price_inr),
          cf_order_id: orderId,
        },
      ]);

    if (subErr) {
      console.error("[app-sub/create] DB insert warning:", subErr.message);
    }

    const checkoutUrl = `${siteUrl}/api/app-sub/checkout-page?session_id=${encodeURIComponent(
      cfData.payment_session_id,
    )}&order_id=${encodeURIComponent(orderId)}&mode=${
      IS_CF_SANDBOX ? "sandbox" : "production"
    }`;

    return NextResponse.json(
      {
        orderId,
        paymentSessionId: cfData.payment_session_id,
        checkoutUrl,
        amountInr: Number(plan.price_inr),
        planId: plan.id,
        userId,
        authEmail,
        accountAutoCreated,
        cashfreeMode: IS_CF_SANDBOX ? "sandbox" : "production",
      },
      { status: 200 },
    );
  } catch (err: any) {
    console.error("[app-sub/create] Unexpected error:", err);
    return NextResponse.json(
      { error: "भुगतान प्रारंभ करने में त्रुटि आई। कृपया पुनः प्रयास करें।" },
      { status: 500 },
    );
  }
}
