import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/payments";

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(Number(searchParams.get('limit')) || 8, 50);
  const offset = Math.max(Number(searchParams.get('offset')) || 0, 0);

  const { data, error, count } = await supabaseAdmin
    .from('supporters')
    .select('id, name, message, photo_url, amount, is_anonymous, created_at', { count: 'exact' })
    .eq('status', 'completed') // 🌟 no more is_anonymous filter — everyone who paid appears
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Public supporters fetch error:", error);
    return NextResponse.json({ supporters: [], total: 0, hasMore: false }, { status: 500 });
  }

  // 🌟 Server-side redaction — belt-and-suspenders even though our own
  // write path (s) already nulls these out for
  // anonymous donors. If a row is ever anonymous for any reason, identity
  // fields never leave this route, regardless of what's actually in the DB.
  const supporters = (data ?? []).map((s) => ({
    id: s.id,
    amount: s.amount,
    created_at: s.created_at,
    is_anonymous: s.is_anonymous,
    name: s.is_anonymous ? null : s.name,
    photo_url: s.is_anonymous ? null : s.photo_url,
    message: s.is_anonymous ? null : s.message,
  }));

  const total = count ?? 0;
  return NextResponse.json({
    supporters,
    total,
    hasMore: offset + limit < total,
  });
}