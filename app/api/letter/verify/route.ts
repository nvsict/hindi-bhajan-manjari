import { NextResponse } from "next/server";
import { cfFetch } from "../_cashfree";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// GET /api/letter/verify?order_id=LFB_XXXX  → asks Cashfree directly (not the browser) for the truth.
export async function GET(req: Request) {
  const orderId = new URL(req.url).searchParams.get("order_id") || "";
  if (!/^LFB_[A-Za-z0-9]{6,40}$/.test(orderId)) {
    return NextResponse.json({ paid: false, status: "INVALID" }, { status: 400 });
  }
  try {
    const res = await cfFetch(`/orders/${orderId}`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) return NextResponse.json({ paid: false, status: "NOT_FOUND" }, { status: 404 });
    return NextResponse.json({
      paid: data.order_status === "PAID",
      status: data.order_status,
      amount: data.order_amount,
    });
  } catch (err: any) {
    console.error("[letter] verify error:", err?.message);
    return NextResponse.json({ paid: false, status: "ERROR" }, { status: 502 });
  }
}