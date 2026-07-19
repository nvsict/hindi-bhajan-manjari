import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || `${protocol}://${host}`;

  try {
    const formData = await req.formData();
    const orderId = formData.get("razorpay_order_id") as string | null;
    const redirectUrl = orderId ? `/donate?order_id=${orderId}` : `/donate?status=failed`;
    return NextResponse.redirect(new URL(redirectUrl, baseUrl), 303);
  } catch (error) {
    return NextResponse.redirect(new URL(`/donate?status=failed`, baseUrl), 303);
  }
}