import { NextRequest, NextResponse } from "next/server";
import { confirmPayment } from "@/lib/payments";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get("order_id");
  if (!orderId) return NextResponse.json({ paid: false }, { status: 400 });
  try {
    const result = await confirmPayment(orderId);
    return NextResponse.json(result);
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json({ paid: false }, { status: 500 });
  }
}