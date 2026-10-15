import { NextResponse } from "next/server";
import { getPackage } from "../../../letter-from-braj/config";
import { cfFetch } from "../_cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hindibhajanmanjari.com";

export async function POST(req: Request) {
  try {
    // 🌟 Changed to YOUR env variable names
    if (!process.env.CASHFREE_CLIENT_ID || !process.env.CASHFREE_CLIENT_SECRET) {
      console.error("[letter] Cashfree env vars missing");
      return NextResponse.json({ error: "भुगतान सेवा अभी उपलब्ध नहीं है।" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    if (body.website) return NextResponse.json({ error: "अमान्य अनुरोध।" }, { status: 400 }); 
    
    const name = String(body.name || "").trim().slice(0, 80);
    const phone = String(body.phone || "").replace(/\D/g, "");
    const email = String(body.email || "").trim().slice(0, 120);
    const pkg = getPackage(String(body.packageId || ""));

    if (name.length < 2) return NextResponse.json({ error: "नाम सही नहीं है।" }, { status: 400 });
    if (!/^[6-9]\d{9}$/.test(phone)) return NextResponse.json({ error: "मोबाइल नंबर सही नहीं है।" }, { status: 400 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: "ईमेल सही नहीं है।" }, { status: 400 });
    if (!pkg) return NextResponse.json({ error: "पैकेज सही नहीं है।" }, { status: 400 });

    const orderId = `LFB_${Date.now().toString(36).toUpperCase()}${Math.random().toString(36).slice(2, 7).toUpperCase()}`;

    const payload: Record<string, unknown> = {
      order_id: orderId,
      order_amount: pkg.price,
      order_currency: "INR",
      order_note: `ब्रज से पत्र — ${pkg.name}`,
      customer_details: {
        customer_id: `lfb_${phone}`,
        customer_name: name,
        customer_phone: phone,
        ...(email ? { customer_email: email } : {}),
      },
    };

    if (siteUrl.startsWith("https://")) {
      payload.order_meta = { return_url: `${siteUrl}/letter-from-braj?order_id={order_id}` };
    }

    const res = await cfFetch("/orders", { method: "POST", body: JSON.stringify(payload) });
    const data = await res.json().catch(() => ({}));

    if (!res.ok || !data.payment_session_id) {
      console.error("[letter] create order failed:", res.status, data?.message);
      return NextResponse.json({ error: "ऑर्डर नहीं बन सका, कृपया दोबारा प्रयास करें।" }, { status: 502 });
    }

    return NextResponse.json({ orderId, paymentSessionId: data.payment_session_id, amount: pkg.price });

  } catch (err: any) {
    console.error("[letter] create-order error:", err?.message);
    return NextResponse.json({ error: "कुछ गड़बड़ हुई, कृपया दोबारा प्रयास करें।" }, { status: 500 });
  }
}