"use server";

import { createServerClient } from "@supabase/ssr";
import { createClient } from "@supabase/supabase-js";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export interface PendingSubmission {
  id: string;
  title: string;
  lyrics: string;
  contributor_name: string | null;
  tarz: string | null;
  contact_info: string | null;
  created_at: string;
}

export interface DuplicateMatch {
  id: string;
  title_hindi: string | null;
  title_hinglish: string | null;
  slug: string;
}

function getAdminSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } },
  );
}

async function requireAdminAuth(): Promise<{ ok: true; email: string } | { ok: false; error: string }> {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll() {
            // Read-only auth check inside Server Action
          },
        },
      },
    );
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return { ok: false, error: "Unauthorized: Admin login required." };
    }
    return { ok: true, email: user.email || user.id };
  } catch (err: any) {
    return { ok: false, error: err?.message || "Auth verification failed." };
  }
}

export async function deletePendingSubmissionAction(
  id: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const auth = await requireAdminAuth();
  if (!auth.ok) return auth;

  const cleanId = String(id ?? "").trim();
  if (!cleanId) {
    return { ok: false, error: "Invalid submission ID." };
  }

  const supabaseAdmin = getAdminSupabase();
  const { error } = await supabaseAdmin
    .from("pending_bhajans")
    .delete()
    .eq("id", cleanId);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/pending");
  revalidatePath("/admin");
  return { ok: true };
}

export async function bulkDeletePendingSubmissionsAction(
  ids: string[],
): Promise<{ ok: true; deletedCount: number } | { ok: false; error: string }> {
  const auth = await requireAdminAuth();
  if (!auth.ok) return auth;

  const cleanIds = Array.from(
    new Set(ids.map((id) => String(id ?? "").trim()).filter(Boolean)),
  );
  if (cleanIds.length === 0) {
    return { ok: false, error: "No submissions selected." };
  }
  if (cleanIds.length > 100) {
    return { ok: false, error: "Select at most 100 submissions at once." };
  }

  const supabaseAdmin = getAdminSupabase();
  const { error } = await supabaseAdmin
    .from("pending_bhajans")
    .delete()
    .in("id", cleanIds);

  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/pending");
  revalidatePath("/admin");
  return { ok: true, deletedCount: cleanIds.length };
}

export async function getPendingSubmissionByIdAction(
  id: string,
): Promise<{ ok: true; data: PendingSubmission } | { ok: false; error: string }> {
  const auth = await requireAdminAuth();
  if (!auth.ok) return auth;

  const cleanId = String(id ?? "").trim();
  if (!cleanId) {
    return { ok: false, error: "Invalid submission ID." };
  }

  const supabaseAdmin = getAdminSupabase();

  // Try full column set first; gracefully fall back if tarz/contact_info haven't been migrated yet
  let res = await supabaseAdmin
    .from("pending_bhajans")
    .select("id, title, lyrics, contributor_name, tarz, contact_info, created_at")
    .eq("id", cleanId)
    .maybeSingle();

  if (res.error && res.error.code === "42703") {
    const fallback = await supabaseAdmin
      .from("pending_bhajans")
      .select("id, title, lyrics, contributor_name, created_at")
      .eq("id", cleanId)
      .maybeSingle();
    if (fallback.error) {
      return { ok: false, error: fallback.error.message };
    }
    if (!fallback.data) {
      return { ok: false, error: "Pending submission not found (it may have already been published or deleted)." };
    }
    return {
      ok: true,
      data: {
        id: String(fallback.data.id),
        title: fallback.data.title ?? "",
        lyrics: fallback.data.lyrics ?? "",
        contributor_name: fallback.data.contributor_name ?? null,
        tarz: null,
        contact_info: null,
        created_at: fallback.data.created_at,
      },
    };
  }

  if (res.error) {
    return { ok: false, error: res.error.message };
  }
  if (!res.data) {
    return { ok: false, error: "Pending submission not found (it may have already been published or deleted)." };
  }

  return {
    ok: true,
    data: {
      id: String(res.data.id),
      title: res.data.title ?? "",
      lyrics: res.data.lyrics ?? "",
      contributor_name: res.data.contributor_name ?? null,
      tarz: res.data.tarz ?? null,
      contact_info: res.data.contact_info ?? null,
      created_at: res.data.created_at,
    },
  };
}

export async function checkDuplicateBhajanAction(
  title: string,
): Promise<{ ok: true; matches: DuplicateMatch[] } | { ok: false; error: string }> {
  const auth = await requireAdminAuth();
  if (!auth.ok) return auth;

  const cleaned = title.trim().replace(/[%_,()]/g, " ").replace(/\s+/g, " ");
  if (cleaned.length < 2) {
    return { ok: true, matches: [] };
  }

  // Use the first 3 meaningful words for fuzzy matching without over-narrowing
  const snippet = cleaned.split(" ").slice(0, 3).join(" ");
  const slugHint = snippet
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

  const filters = [
    `title_hindi.ilike.%${snippet}%`,
    `title_hinglish.ilike.%${snippet}%`,
  ];
  if (slugHint.length >= 2) {
    filters.push(`slug.ilike.%${slugHint}%`);
  }

  const supabaseAdmin = getAdminSupabase();
  const { data, error } = await supabaseAdmin
    .from("bhajans")
    .select("id, title_hindi, title_hinglish, slug")
    .or(filters.join(","))
    .limit(5);

  if (error) {
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    matches: (data ?? []).map((row: any) => ({
      id: String(row.id),
      title_hindi: row.title_hindi ?? null,
      title_hinglish: row.title_hinglish ?? null,
      slug: row.slug,
    })),
  };
}
