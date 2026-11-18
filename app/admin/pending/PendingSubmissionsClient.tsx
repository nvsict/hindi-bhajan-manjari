"use client";

import { useState, useEffect, useTransition, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaChevronUp,
  FaClock,
  FaCopy,
  FaEnvelope,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaInbox,
  FaMusic,
  FaSearch,
  FaSpinner,
  FaTimes,
  FaTrash,
  FaUser,
  FaWhatsapp,
} from "react-icons/fa";
import {
  bulkDeletePendingSubmissionsAction,
  checkDuplicateBhajanAction,
  deletePendingSubmissionAction,
  type DuplicateMatch,
  type PendingSubmission,
} from "./actions";

interface Props {
  initialItems: PendingSubmission[];
  totalCount: number;
  filteredCount: number;
  page: number;
  pageSize: number;
  initialQuery: string;
  initialSort: "newest" | "oldest";
  fetchError: string | null;
}

const PREVIEW_LINES = 5;
const PREVIEW_CHARS = 320;

function formatISTDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Kolkata",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function getContactLink(raw: string, bhajanTitle: string): {
  type: "email" | "whatsapp" | "text";
  href: string | null;
} {
  const trimmed = raw.trim();
  if (!trimmed) return { type: "text", href: null };

  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    const subject = encodeURIComponent(`Your Bhajan "${bhajanTitle}" is now live on Hindi Bhajan Manjari!`);
    const body = encodeURIComponent(
      `Jai Shri Ram!\n\nThank you for contributing "${bhajanTitle}" to Hindi Bhajan Manjari. We are happy to inform you that your submission has been reviewed and published on https://www.hindibhajanmanjari.com .\n\nWarm regards,\nHindi Bhajan Manjari Team`,
    );
    return { type: "email", href: `mailto:${trimmed}?subject=${subject}&body=${body}` };
  }

  const digits = trimmed.replace(/[^\d]/g, "");
  if (digits.length >= 10 && digits.length <= 13) {
    const waDigits = digits.length === 10 ? `91${digits}` : digits;
    const msg = encodeURIComponent(
      `Jai Shri Ram! Thank you for submitting "${bhajanTitle}" to Hindi Bhajan Manjari. Your bhajan is now published on https://www.hindibhajanmanjari.com`,
    );
    return { type: "whatsapp", href: `https://wa.me/${waDigits}?text=${msg}` };
  }

  return { type: "text", href: null };
}

function getLyricsPreview(lyrics: string): {
  preview: string;
  isTruncated: boolean;
  lineCount: number;
} {
  const normalized = (lyrics || "").trim();
  if (!normalized) {
    return { preview: "", isTruncated: false, lineCount: 0 };
  }
  const lines = normalized.split(/\r?\n/);
  const lineCount = lines.length;
  const byLines = lines.slice(0, PREVIEW_LINES).join("\n");
  const isTruncated = lineCount > PREVIEW_LINES || byLines.length > PREVIEW_CHARS;
  const preview =
    byLines.length > PREVIEW_CHARS
      ? `${byLines.slice(0, PREVIEW_CHARS).trimEnd()}...`
      : lineCount > PREVIEW_LINES
        ? `${byLines.trimEnd()}...`
        : byLines;
  return { preview, isTruncated, lineCount };
}

export default function PendingSubmissionsClient({
  initialItems,
  totalCount,
  filteredCount,
  page,
  pageSize,
  initialQuery,
  initialSort,
  fetchError,
}: Props) {
  const router = useRouter();
  const [isNavigating, startNavTransition] = useTransition();

  // Optimistic local copy of current page items & counts
  const [items, setItems] = useState<PendingSubmission[]>(initialItems);
  const [liveTotal, setLiveTotal] = useState<number>(totalCount);
  const [liveFiltered, setLiveFiltered] = useState<number>(filteredCount);

  useEffect(() => {
    setItems(initialItems);
    setLiveTotal(totalCount);
    setLiveFiltered(filteredCount);
    setSelectedIds(new Set());
  }, [initialItems, totalCount, filteredCount]);

  // Search & sort controls
  const [searchInput, setSearchInput] = useState(initialQuery);
  const isFirstRender = useRef(true);

  useEffect(() => {
    setSearchInput(initialQuery);
  }, [initialQuery]);

  const navigateWithParams = (next: {
    q?: string;
    sort?: "newest" | "oldest";
    page?: number;
  }) => {
    const params = new URLSearchParams();
    const qVal = (next.q !== undefined ? next.q : searchInput).trim();
    const sortVal = next.sort ?? initialSort;
    const pageVal = next.page ?? 1;

    if (qVal) params.set("q", qVal);
    if (sortVal !== "newest") params.set("sort", sortVal);
    if (pageVal > 1) params.set("page", String(pageVal));

    const qs = params.toString();
    startNavTransition(() => {
      router.push(qs ? `/admin/pending?${qs}` : "/admin/pending");
    });
  };

  // Debounced server-side search
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    if (searchInput.trim() === initialQuery.trim()) return;

    const timer = setTimeout(() => {
      navigateWithParams({ q: searchInput, page: 1 });
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  // Selection, expansion, duplicate check, and action feedback states
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<
    { mode: "single"; item: PendingSubmission } | { mode: "bulk"; ids: string[] } | null
  >(null);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  // Per-card duplicate check state
  const [dupStatus, setDupStatus] = useState<
    Record<
      string,
      { loading: boolean; matches?: DuplicateMatch[]; error?: string }
    >
  >({});

  const totalPages = Math.max(1, Math.ceil(liveFiltered / pageSize));
  const allVisibleSelected = useMemo(
    () => items.length > 0 && items.every((item) => selectedIds.has(item.id)),
    [items, selectedIds],
  );

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((prev) => (prev?.text === text ? null : prev));
    }, 4000);
  };

  const handleCopy = async (text: string, key: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(key);
      setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 1800);
    } catch {
      showToast("error", "Clipboard permission blocked by browser.");
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(items.map((item) => item.id)));
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const executeSingleDelete = async (target: PendingSubmission) => {
    setConfirmTarget(null);
    const id = target.id;

    // Optimistic UI removal with snapshot for safe rollback
    const previousItems = items;
    const previousTotal = liveTotal;
    const previousFiltered = liveFiltered;

    setDeletingIds((prev) => new Set(prev).add(id));
    setItems((prev) => prev.filter((item) => item.id !== id));
    setLiveTotal((c) => Math.max(0, c - 1));
    setLiveFiltered((c) => Math.max(0, c - 1));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    const result = await deletePendingSubmissionAction(id);

    setDeletingIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });

    if (!result.ok) {
      // Rollback optimistic removal on failure
      setItems(previousItems);
      setLiveTotal(previousTotal);
      setLiveFiltered(previousFiltered);
      showToast("error", `Delete failed: ${result.error}`);
      return;
    }

    showToast("success", `Deleted "${target.title || "Untitled submission"}".`);

    // If current page became empty and earlier pages exist, jump back one page; otherwise sync server cache quietly
    if (previousItems.length === 1 && page > 1) {
      navigateWithParams({ page: page - 1 });
    } else {
      startNavTransition(() => {
        router.refresh();
      });
    }
  };

  const executeBulkDelete = async (ids: string[]) => {
    setConfirmTarget(null);
    if (ids.length === 0) return;

    const idSet = new Set(ids);
    const previousItems = items;
    const previousTotal = liveTotal;
    const previousFiltered = liveFiltered;

    setIsBulkDeleting(true);
    setItems((prev) => prev.filter((item) => !idSet.has(item.id)));
    setLiveTotal((c) => Math.max(0, c - ids.length));
    setLiveFiltered((c) => Math.max(0, c - ids.length));
    setSelectedIds(new Set());

    const result = await bulkDeletePendingSubmissionsAction(ids);
    setIsBulkDeleting(false);

    if (!result.ok) {
      setItems(previousItems);
      setLiveTotal(previousTotal);
      setLiveFiltered(previousFiltered);
      showToast("error", `Bulk delete failed: ${result.error}`);
      return;
    }

    showToast("success", `Deleted ${result.deletedCount} submission${result.deletedCount > 1 ? "s" : ""}.`);

    if (previousItems.length === ids.length && page > 1) {
      navigateWithParams({ page: page - 1 });
    } else {
      startNavTransition(() => {
        router.refresh();
      });
    }
  };

  const handleCheckDuplicate = async (item: PendingSubmission) => {
    setDupStatus((prev) => ({ ...prev, [item.id]: { loading: true } }));
    const res = await checkDuplicateBhajanAction(item.title || "");
    if (!res.ok) {
      setDupStatus((prev) => ({
        ...prev,
        [item.id]: { loading: false, error: res.error },
      }));
      return;
    }
    setDupStatus((prev) => ({
      ...prev,
      [item.id]: { loading: false, matches: res.matches },
    }));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      {/* ==========================================
          HEADER BANNER
          ========================================== */}
      <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-orange-100 shadow-[0_10px_40px_-15px_rgba(234,88,12,0.08)] flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="flex items-start sm:items-center gap-4">
          <Link
            href="/admin"
            className="w-11 h-11 bg-gray-50 border border-gray-200 rounded-2xl flex items-center justify-center text-gray-500 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 shadow-sm transition-all shrink-0"
            aria-label="Back to Admin Dashboard"
          >
            <FaArrowLeft />
          </Link>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
                Pending Submissions
              </h1>
              <span
                className={`text-xs font-black px-3 py-1 rounded-full ${
                  liveTotal > 0
                    ? "bg-orange-100 text-orange-700 border border-orange-200"
                    : "bg-green-100 text-green-700 border border-green-200"
                }`}
              >
                {liveTotal} in queue
              </span>
            </div>
            <p className="text-sm text-gray-500 mt-1 font-medium">
              Review community bhajans, verify duplicates, and publish directly without losing melody or contact details.
            </p>
          </div>
        </div>

        <Link
          href="/admin/add-bhajan"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gray-900 hover:bg-orange-600 text-white text-sm font-bold transition-colors shadow-sm shrink-0"
        >
          <FaInbox size={14} /> Manual Upload
        </Link>
      </div>

      {/* ==========================================
          TOAST / FETCH ERROR ALERTS
          ========================================== */}
      {fetchError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl flex items-start gap-3">
          <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm">
            <p className="font-bold">Could not load pending submissions from Supabase.</p>
            <p className="text-red-600/90 mt-0.5 font-mono text-xs">{fetchError}</p>
          </div>
        </div>
      )}

      {toast && (
        <div
          className={`px-5 py-3.5 rounded-2xl border text-sm font-bold flex items-center justify-between gap-3 shadow-sm ${
            toast.type === "error"
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-green-50 border-green-200 text-green-700"
          }`}
        >
          <span className="flex items-center gap-2">
            {toast.type === "error" ? <FaExclamationTriangle /> : <FaCheckCircle />}
            {toast.text}
          </span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="opacity-70 hover:opacity-100 p-1"
            aria-label="Dismiss notification"
          >
            <FaTimes size={12} />
          </button>
        </div>
      )}

      {/* ==========================================
          TOOLBAR: SEARCH, SORT & BULK ACTIONS
          ========================================== */}
      <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Debounced Server Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by title, contributor, melody (tarz), or contact..."
              className="w-full pl-10 pr-10 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-500/15 outline-none transition-all"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setSearchInput("");
                  navigateWithParams({ q: "", page: 1 });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                aria-label="Clear search"
              >
                <FaTimes size={13} />
              </button>
            )}
          </div>

          {/* Sort Switcher */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={initialSort}
              onChange={(e) =>
                navigateWithParams({
                  sort: e.target.value === "oldest" ? "oldest" : "newest",
                  page: 1,
                })
              }
              aria-label="Sort submissions"
              className="px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 focus:bg-white focus:border-orange-400 outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First (FIFO)</option>
            </select>

            {isNavigating && (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 px-2">
                <FaSpinner className="animate-spin" />
              </span>
            )}
          </div>
        </div>

        {/* Selection & Bulk Bar */}
        {items.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100 text-xs">
            <label className="inline-flex items-center gap-2.5 font-bold text-gray-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={allVisibleSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer"
              />
              <span>
                Select all on page ({items.length})
              </span>
            </label>

            <div className="flex items-center gap-3">
              {selectedIds.size > 0 ? (
                <button
                  type="button"
                  disabled={isBulkDeleting}
                  onClick={() =>
                    setConfirmTarget({ mode: "bulk", ids: Array.from(selectedIds) })
                  }
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-60"
                >
                  {isBulkDeleting ? (
                    <FaSpinner className="animate-spin" />
                  ) : (
                    <FaTrash size={11} />
                  )}
                  Delete Selected ({selectedIds.size})
                </button>
              ) : (
                <span className="text-gray-400 font-semibold">
                  Showing {(page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, liveFiltered)} of {liveFiltered}
                  {initialQuery ? ` matching "${initialQuery}"` : ""}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          EMPTY STATE OR SUBMISSION CARDS
          ========================================== */}
      {!fetchError && items.length === 0 ? (
        <div className="bg-white p-12 rounded-[2rem] border border-gray-100 shadow-sm text-center">
          <FaCheckCircle className="text-5xl text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-black text-gray-900">
            {page > 1 && liveFiltered > 0
              ? "No items on this page"
              : initialQuery
                ? "No matching submissions"
                : "All caught up!"}
          </h2>
          <p className="text-gray-500 mt-2 font-medium max-w-md mx-auto">
            {page > 1 && liveFiltered > 0
              ? `There are still ${liveFiltered} submission${liveFiltered > 1 ? "s" : ""} on earlier pages.`
              : initialQuery
                ? `No pending submissions matched "${initialQuery}". Try clearing the search filter.`
                : "There are no pending bhajans waiting for review right now."}
          </p>
          {page > 1 && liveFiltered > 0 ? (
            <button
              type="button"
              onClick={() => navigateWithParams({ page: 1 })}
              className="mt-5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors"
            >
              Go to Page 1
            </button>
          ) : initialQuery ? (
            <button
              type="button"
              onClick={() => {
                setSearchInput("");
                navigateWithParams({ q: "", page: 1 });
              }}
              className="mt-5 px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold transition-colors"
            >
              Reset Search
            </button>
          ) : null}
        </div>
      ) : (
        <div
          className={`grid gap-5 transition-opacity duration-200 ${
            isNavigating ? "opacity-60 pointer-events-none" : "opacity-100"
          }`}
        >
          {items.map((bhajan) => {
            const isSelected = selectedIds.has(bhajan.id);
            const isExpanded = expandedIds.has(bhajan.id);
            const isDeleting = deletingIds.has(bhajan.id);
            const { preview, isTruncated, lineCount } = getLyricsPreview(bhajan.lyrics);
            const contactMeta = bhajan.contact_info
              ? getContactLink(bhajan.contact_info, bhajan.title || "Bhajan")
              : null;
            const dup = dupStatus[bhajan.id];

            return (
              <article
                key={bhajan.id}
                className={`bg-white p-5 md:p-7 rounded-[1.75rem] border transition-all shadow-sm flex flex-col gap-4 ${
                  isSelected
                    ? "border-orange-300 ring-2 ring-orange-500/15"
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                {/* Card Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelect(bhajan.id)}
                      aria-label={`Select ${bhajan.title || "submission"}`}
                      className="mt-1.5 w-4 h-4 rounded border-gray-300 text-orange-600 focus:ring-orange-500 cursor-pointer shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h3 className="text-xl md:text-2xl font-black text-gray-900 break-words leading-snug">
                        {bhajan.title || "Untitled Submission"}
                      </h3>

                      {/* Metadata Pills: Contributor, Tarz, Contact */}
                      <div className="flex flex-wrap items-center gap-2 mt-2.5 text-xs font-semibold">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-50 border border-gray-200/80 text-gray-700">
                          <FaUser className="text-orange-500" size={11} />
                          {bhajan.contributor_name?.trim() || "Anonymous User"}
                        </span>

                        {bhajan.tarz?.trim() && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200/80 text-amber-800">
                            <FaMusic className="text-amber-600" size={11} />
                            तर्ज: {bhajan.tarz.trim()}
                          </span>
                        )}

                        {bhajan.contact_info?.trim() && contactMeta && (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-200/80 text-blue-800">
                            {contactMeta.type === "whatsapp" && (
                              <FaWhatsapp className="text-green-600" size={12} />
                            )}
                            {contactMeta.type === "email" && (
                              <FaEnvelope className="text-blue-600" size={11} />
                            )}
                            {contactMeta.href ? (
                              <a
                                href={contactMeta.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                                title="Notify contributor"
                              >
                                {bhajan.contact_info.trim()}
                              </a>
                            ) : (
                              <span>{bhajan.contact_info.trim()}</span>
                            )}
                            <button
                              type="button"
                              onClick={() =>
                                handleCopy(bhajan.contact_info!.trim(), `contact-${bhajan.id}`)
                              }
                              className="ml-0.5 text-blue-500 hover:text-blue-700"
                              title="Copy contact info"
                            >
                              {copiedKey === `contact-${bhajan.id}` ? (
                                <FaCheckCircle size={11} className="text-green-600" />
                              ) : (
                                <FaCopy size={11} />
                              )}
                            </button>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp + Duplicate Check Trigger */}
                  <div className="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 pl-7 sm:pl-0">
                    <span className="text-[11px] text-gray-500 flex items-center gap-1.5 font-bold bg-gray-50 border border-gray-100 px-3 py-1.5 rounded-full">
                      <FaClock className="text-gray-400" size={11} />
                      {formatISTDate(bhajan.created_at)}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleCheckDuplicate(bhajan)}
                      disabled={dup?.loading}
                      className="text-[11px] font-bold text-gray-600 hover:text-orange-600 bg-gray-50 hover:bg-orange-50 border border-gray-200 hover:border-orange-200 px-2.5 py-1 rounded-lg inline-flex items-center gap-1.5 transition-colors disabled:opacity-60"
                    >
                      {dup?.loading ? (
                        <FaSpinner className="animate-spin" size={10} />
                      ) : (
                        <FaSearch size={10} />
                      )}
                      Check Duplicate
                    </button>
                  </div>
                </div>

                {/* Duplicate Check Result Banner */}
                {dup && !dup.loading && (
                  <div
                    className={`rounded-xl px-4 py-2.5 text-xs font-semibold border ${
                      dup.error
                        ? "bg-red-50 border-red-200 text-red-700"
                        : dup.matches && dup.matches.length > 0
                          ? "bg-amber-50 border-amber-200 text-amber-900"
                          : "bg-green-50 border-green-200 text-green-800"
                    }`}
                  >
                    {dup.error ? (
                      <span>Duplicate check error: {dup.error}</span>
                    ) : dup.matches && dup.matches.length > 0 ? (
                      <div className="space-y-1.5">
                        <p className="font-bold flex items-center gap-1.5">
                          <FaExclamationTriangle className="text-amber-600" />
                          Possible existing bhajan{dup.matches.length > 1 ? "s" : ""} found ({dup.matches.length}):
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {dup.matches.map((m) => (
                            <Link
                              key={m.id}
                              href={`/bhajan/${m.slug}`}
                              target="_blank"
                              prefetch={false}
                              className="inline-flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-900 hover:text-orange-600 hover:border-orange-300 transition-colors"
                            >
                              {m.title_hindi || m.title_hinglish || m.slug}
                              <FaExternalLinkAlt size={9} />
                            </Link>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <FaCheckCircle className="text-green-600" />
                        No matching title found in live bhajan catalog.
                      </span>
                    )}
                  </div>
                )}

                {/* Collapsible Lyrics Viewer */}
                <div className="bg-gray-50/90 rounded-2xl border border-gray-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2 border-b border-gray-100 text-[11px] font-bold text-gray-500">
                    <span>
                      Lyrics ({lineCount} {lineCount === 1 ? "line" : "lines"} ·{" "}
                      {(bhajan.lyrics || "").length} chars)
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleCopy(bhajan.lyrics || "", `lyrics-${bhajan.id}`)}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-md hover:bg-white text-gray-600 hover:text-orange-600 transition-colors"
                      >
                        {copiedKey === `lyrics-${bhajan.id}` ? (
                          <>
                            <FaCheckCircle className="text-green-600" size={11} /> Copied
                          </>
                        ) : (
                          <>
                            <FaCopy size={11} /> Copy
                          </>
                        )}
                      </button>

                      {isTruncated && (
                        <button
                          type="button"
                          onClick={() => toggleExpand(bhajan.id)}
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-white border border-gray-200 text-gray-700 hover:text-orange-600 hover:border-orange-200 transition-colors"
                        >
                          {isExpanded ? (
                            <>
                              Collapse <FaChevronUp size={10} />
                            </>
                          ) : (
                            <>
                              Read Full <FaChevronDown size={10} />
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className={`p-4 md:p-5 ${isExpanded ? "max-h-[420px] overflow-y-auto" : ""}`}>
                    <pre className="text-sm text-gray-800 font-sans whitespace-pre-wrap leading-relaxed break-words">
                      {isExpanded ? bhajan.lyrics : preview || "(No lyrics provided)"}
                    </pre>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-1">
                  {/* Tiny safe URL (pending_id only) + prefetch={false} prevents 414 URI Too Long & prefetch floods */}
                  <Link
                    href={`/admin/add-bhajan?pending_id=${encodeURIComponent(bhajan.id)}`}
                    prefetch={false}
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3.5 px-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 shadow-sm transition-colors"
                  >
                    <FaCheckCircle /> Approve &amp; Open in Editor
                  </Link>

                  <button
                    type="button"
                    disabled={isDeleting}
                    onClick={() => setConfirmTarget({ mode: "single", item: bhajan })}
                    className="flex-1 bg-red-50 hover:bg-red-600 text-red-600 hover:text-white py-3.5 px-4 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-colors disabled:opacity-60"
                  >
                    {isDeleting ? (
                      <>
                        <FaSpinner className="animate-spin" /> Deleting...
                      </>
                    ) : (
                      <>
                        <FaTrash /> Reject &amp; Delete
                      </>
                    )}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* ==========================================
          PAGINATION CONTROLS
          ========================================== */}
      {totalPages > 1 && (
        <div className="bg-white px-5 py-3.5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between gap-4">
          <button
            type="button"
            disabled={page <= 1 || isNavigating}
            onClick={() => navigateWithParams({ page: page - 1 })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 border border-gray-200 font-bold text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            <FaChevronLeft size={12} /> Previous
          </button>

          <span className="text-sm font-bold text-gray-600">
            Page <span className="text-gray-900">{page}</span> of{" "}
            <span className="text-gray-900">{totalPages}</span>
          </span>

          <button
            type="button"
            disabled={page >= totalPages || isNavigating}
            onClick={() => navigateWithParams({ page: page + 1 })}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-700 hover:text-orange-600 border border-gray-200 font-bold text-sm transition-colors disabled:opacity-40 disabled:pointer-events-none"
          >
            Next <FaChevronRight size={12} />
          </button>
        </div>
      )}

      {/* ==========================================
          CONFIRMATION MODAL (Prevents Accidental Deletes)
          ========================================== */}
      {confirmTarget && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
            onClick={() => setConfirmTarget(null)}
          />
          <div className="bg-white rounded-[2rem] w-full max-w-md p-7 relative z-10 shadow-2xl border border-gray-100 text-center">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FaTrash size={24} />
            </div>
            <h3 className="text-xl font-black text-gray-900">
              {confirmTarget.mode === "bulk"
                ? `Delete ${confirmTarget.ids.length} Submissions?`
                : "Reject & Delete Submission?"}
            </h3>
            <p className="text-sm text-gray-500 mt-2 leading-relaxed font-medium">
              {confirmTarget.mode === "bulk"
                ? `This will permanently remove ${confirmTarget.ids.length} selected submissions from the pending queue. This action cannot be undone.`
                : `Are you sure you want to permanently delete "${confirmTarget.item.title || "this submission"}"?`}
            </p>

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setConfirmTarget(null)}
                className="flex-1 py-3 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-sm transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  confirmTarget.mode === "bulk"
                    ? executeBulkDelete(confirmTarget.ids)
                    : executeSingleDelete(confirmTarget.item)
                }
                className="flex-1 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-black text-sm shadow-sm transition-colors"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
