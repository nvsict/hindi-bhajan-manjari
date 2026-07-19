import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/payments";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  const { data, error } = await supabaseAdmin
    .from("supporters")
    .select("amount")
    .eq("status", "completed");

  if (error || !data) return NextResponse.json({ totalRaised: 0, supporterCount: 0 });

  const totalRaised = data.reduce((sum, r) => sum + (r.amount || 0), 0);
  return NextResponse.json({ totalRaised, supporterCount: data.length });
}