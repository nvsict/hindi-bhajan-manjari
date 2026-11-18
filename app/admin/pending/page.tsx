import { createClient } from "@supabase/supabase-js";
import PendingSubmissionsClient from "./PendingSubmissionsClient";
import type { PendingSubmission } from "./actions";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

export default async function PendingSubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const resolved = await searchParams;
  const searchQuery = (resolved.q || "").trim();
  const sort: "newest" | "oldest" = resolved.sort === "oldest" ? "oldest" : "newest";
  const parsedPage = Number.parseInt(resolved.page || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );

  // Sanitize characters that break PostgREST `.or()` filter grammar
  const safeQuery = searchQuery.replace(/[%_,()]/g, " ").replace(/\s+/g, " ").trim();

  const buildListQuery = (includeExtendedCols: boolean) => {
    const columns = includeExtendedCols
      ? "id, title, lyrics, contributor_name, tarz, contact_info, created_at"
      : "id, title, lyrics, contributor_name, created_at";

    let q = supabaseAdmin
      .from("pending_bhajans")
      .select(columns, { count: "exact" })
      .order("created_at", { ascending: sort === "oldest" })
      .range(from, to);

    if (safeQuery) {
      const orFilters = [
        `title.ilike.%${safeQuery}%`,
        `contributor_name.ilike.%${safeQuery}%`,
      ];
      if (includeExtendedCols) {
        orFilters.push(`tarz.ilike.%${safeQuery}%`, `contact_info.ilike.%${safeQuery}%`);
      }
      q = q.or(orFilters.join(","));
    }

    return q;
  };

  // Run total count & paginated query in parallel for fast TTFB
  const [totalRes, listResInitial] = await Promise.all([
    supabaseAdmin
      .from("pending_bhajans")
      .select("id", { count: "exact", head: true }),
    buildListQuery(true),
  ]);

  let listRes = listResInitial;

  // Graceful fallback if optional columns (tarz/contact_info) aren't migrated yet
  if (listRes.error && listRes.error.code === "42703") {
    listRes = await buildListQuery(false);
  }

  const fetchError = listRes.error?.message || totalRes.error?.message || null;
  if (fetchError) {
    console.error("Error fetching pending bhajans:", fetchError);
  }

  const items: PendingSubmission[] = ((listRes.data as any[]) ?? []).map((row) => ({
    id: String(row.id),
    title: row.title ?? "",
    lyrics: row.lyrics ?? "",
    contributor_name: row.contributor_name ?? null,
    tarz: row.tarz ?? null,
    contact_info: row.contact_info ?? null,
    created_at: row.created_at,
  }));

  const totalCount = totalRes.count ?? items.length;
  const filteredCount = listRes.count ?? items.length;

  return (
    <PendingSubmissionsClient
      initialItems={items}
      totalCount={totalCount}
      filteredCount={filteredCount}
      page={page}
      pageSize={PAGE_SIZE}
      initialQuery={searchQuery}
      initialSort={sort}
      fetchError={fetchError}
    />
  );
}
