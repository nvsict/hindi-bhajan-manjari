"use client";

import React, { useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaAndroid,
  FaBookmark,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCloudUploadAlt,
  FaCopy,
  FaCrown,
  FaDownload,
  FaEdit,
  FaExclamationTriangle,
  FaExternalLinkAlt,
  FaFileArchive,
  FaFolderOpen,
  FaGift,
  FaMobileAlt,
  FaPlus,
  FaReceipt,
  FaRedo,
  FaRupeeSign,
  FaSave,
  FaSearch,
  FaShieldAlt,
  FaSpinner,
  FaSyncAlt,
  FaTag,
  FaTimes,
  FaTrash,
  FaUsers,
} from "react-icons/fa";
import type { AppChangelogEntry, AppReleaseManifest } from "@/lib/appRelease";
import { supabase } from "@/utils/supabase";
import {
  createApkSignedUploadUrlAction,
  createFestivalOverrideAction,
  deleteBucketApkAction,
  deleteFestivalOverrideAction,
  grantOrExtendSubscriptionAction,
  listBucketApksAction,
  resetDeviceTrialAction,
  revokeSubscriptionAction,
  saveAppReleaseConfigAction,
  toggleFestivalOverrideAction,
  unlinkUserDeviceAction,
  updateAppPlanAction,
  updateAppUserProfileAction,
  type BucketApkFile,
} from "./actions";

interface AppProfileRow {
  user_id: string;
  phone: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

interface AppSubscriptionRow {
  id: string;
  user_id: string;
  plan_id: string;
  status: string;
  auto_renew: boolean;
  amount_inr: number;
  current_period_start: string | null;
  current_period_end: string | null;
  rzp_subscription_id: string | null;
  rzp_payment_id: string | null;
  created_at: string;
  updated_at: string;
}

interface AppPlanRow {
  id: string;
  name_hi: string;
  name_en: string;
  description_hi: string | null;
  price_inr: number;
  duration_days: number;
  rzp_plan_id: string | null;
  is_active: boolean;
  updated_at: string;
}

interface AppPaymentLogRow {
  id: string;
  user_id: string | null;
  subscription_id: string | null;
  rzp_subscription_id: string | null;
  rzp_payment_id: string | null;
  event_type: string;
  amount_inr: number;
  status: string;
  raw_payload: any;
  created_at: string;
}

interface AppDeviceSessionRow {
  id: string;
  user_id: string;
  device_id: string;
  device_name: string | null;
  platform: string | null;
  last_seen_at: string;
  created_at: string;
}

interface AppTrialRow {
  device_id: string;
  first_seen_at: string;
  trial_expires_at: string;
}

interface AppFestivalRow {
  id: string;
  festival_id: string;
  start_date: string;
  end_date: string;
  custom_title_hi: string | null;
  custom_tagline_hi: string | null;
  is_active: boolean;
  created_at: string;
}

interface AppManagerClientProps {
  initialRelease: AppReleaseManifest;
  releaseTableMissing: boolean;
  festivalsTableMissing: boolean;
  initialProfiles: AppProfileRow[];
  initialSubscriptions: AppSubscriptionRow[];
  initialPlans: AppPlanRow[];
  initialLogs: AppPaymentLogRow[];
  initialDevices: AppDeviceSessionRow[];
  initialTrials: AppTrialRow[];
  initialFestivals: AppFestivalRow[];
  savedCountByUser: Record<string, number>;
  totalSavedBhajans: number;
  topSavedSlugs: Array<{ slug: string; count: number }>;
}

type ManagerTab =
  | "overview"
  | "release"
  | "users"
  | "plans"
  | "payments"
  | "festivals"
  | "trials";

const FESTIVAL_OPTIONS = [
  { id: "janmashtami", label: "श्री कृष्ण जन्माष्टमी (Janmashtami)" },
  { id: "navratri", label: "शारदीय / चैत्र नवरात्रि (Navratri)" },
  { id: "diwali", label: "दीपावली (Diwali)" },
  { id: "shivratri", label: "महाशिवरात्रि (Maha Shivratri)" },
  { id: "ram_navami", label: "श्री राम नवमी (Ram Navami)" },
  { id: "hanuman_jayanti", label: "हनुमान जन्मोत्सव (Hanuman Jayanti)" },
  { id: "holi", label: "रंगोत्सव होली (Holi)" },
  { id: "ganesh_chaturthi", label: "गणेश चतुर्थी (Ganesh Chaturthi)" },
  { id: "vasant_panchami", label: "वसंत पंचमी (Vasant Panchami)" },
  { id: "ekadashi", label: "पावन एकादशी (Ekadashi)" },
];

function formatDateTimeIST(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

async function computeFileSha256(file: File): Promise<string | null> {
  if (typeof window === "undefined" || !window.crypto?.subtle) return null;
  try {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await window.crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    return null;
  }
}

function formatFileSizeMB(bytes: number): string {
  if (!bytes || bytes <= 0) return "0 MB";
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateShort(iso?: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export default function AppManagerClient({
  initialRelease,
  releaseTableMissing,
  festivalsTableMissing,
  initialProfiles,
  initialSubscriptions,
  initialPlans,
  initialLogs,
  initialDevices,
  initialTrials,
  initialFestivals,
  savedCountByUser,
  totalSavedBhajans,
  topSavedSlugs,
}: AppManagerClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState<ManagerTab>("overview");
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast((curr) => (curr?.text === text ? null : curr));
    }, 4500);
  };

  // =========================================================================
  // DERIVED INDEXES & KPI ANALYTICS
  // =========================================================================
  const nowMs = Date.now();

  const profileById = useMemo(() => {
    const m = new Map<string, AppProfileRow>();
    for (const p of initialProfiles) m.set(p.user_id, p);
    return m;
  }, [initialProfiles]);

  const activeSubByUser = useMemo(() => {
    const m = new Map<string, AppSubscriptionRow>();
    for (const s of initialSubscriptions) {
      const isLive =
        s.status === "active" &&
        (!s.current_period_end ||
          new Date(s.current_period_end).getTime() > nowMs);
      if (isLive && !m.has(s.user_id)) {
        m.set(s.user_id, s);
      }
    }
    return m;
  }, [initialSubscriptions, nowMs]);

  const latestSubByUser = useMemo(() => {
    const m = new Map<string, AppSubscriptionRow>();
    for (const s of initialSubscriptions) {
      if (!m.has(s.user_id)) m.set(s.user_id, s);
    }
    return m;
  }, [initialSubscriptions]);

  const devicesByUser = useMemo(() => {
    const m = new Map<string, AppDeviceSessionRow[]>();
    for (const d of initialDevices) {
      const arr = m.get(d.user_id) || [];
      arr.push(d);
      m.set(d.user_id, arr);
    }
    return m;
  }, [initialDevices]);

  const totalRevenueInr = useMemo(() => {
    return initialLogs.reduce((sum, row) => {
      const st = (row.status || "").toLowerCase();
      const ev = (row.event_type || "").toLowerCase();
      const isPaid =
        (st === "captured" ||
          st === "paid" ||
          st === "active" ||
          st === "authenticated" ||
          ev.includes("charged") ||
          ev.includes("verified")) &&
        Number(row.amount_inr) > 0;
      return isPaid ? sum + Number(row.amount_inr) : sum;
    }, 0);
  }, [initialLogs]);

  const activeTrialsCount = useMemo(
    () =>
      initialTrials.filter(
        (t) => new Date(t.trial_expires_at).getTime() > nowMs,
      ).length,
    [initialTrials, nowMs],
  );

  // =========================================================================
  // TAB 2: RELEASE MANAGER STATE
  // =========================================================================
  const firstEntry: AppChangelogEntry = initialRelease.changelog[0] || {
    version: initialRelease.latestVersion,
    versionCode: initialRelease.versionCode,
    date: initialRelease.releaseDate,
    dateHi: initialRelease.releaseDateHi,
    titleEn: "Official Android Release",
    titleHi: "आधिकारिक एंड्रॉइड संस्करण",
    highlightsEn: [],
    highlightsHi: [],
  };

  const [relForm, setRelForm] = useState({
    latest_version: initialRelease.latestVersion,
    version_code: String(initialRelease.versionCode),
    release_channel: initialRelease.releaseChannel as "stable" | "beta",
    release_date: initialRelease.releaseDate,
    release_date_hi: initialRelease.releaseDateHi,
    apk_size_label: initialRelease.apkSizeLabel,
    min_android: initialRelease.minAndroid,
    min_sdk: String(initialRelease.minSdk),
    architecture: initialRelease.architecture,
    apk_download_url: initialRelease.apkDownloadUrl || "",
    sha256: initialRelease.sha256.toLowerCase().includes("will be published")
      ? ""
      : initialRelease.sha256,
    is_mandatory_update: initialRelease.isMandatoryUpdate,
    titleEn: firstEntry.titleEn,
    titleHi: firstEntry.titleHi,
    highlightsHiText: firstEntry.highlightsHi.join("\n"),
    highlightsEnText: firstEntry.highlightsEn.join("\n"),
  });

  const persistReleaseConfig = async (overrides?: Partial<typeof relForm>) => {
    const merged = { ...relForm, ...(overrides || {}) };
    const updatedTop: AppChangelogEntry = {
      version: merged.latest_version.trim(),
      versionCode: Number(merged.version_code) || 1,
      date: merged.release_date.trim(),
      dateHi: merged.release_date_hi.trim(),
      titleEn: merged.titleEn.trim() || `Release v${merged.latest_version}`,
      titleHi: merged.titleHi.trim() || `संस्करण v${merged.latest_version}`,
      highlightsHi: merged.highlightsHiText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
      highlightsEn: merged.highlightsEnText
        .split("\n")
        .map((s) => s.trim())
        .filter(Boolean),
    };

    const olderEntries = initialRelease.changelog.filter(
      (c) => c.version !== updatedTop.version,
    );

    const res = await saveAppReleaseConfigAction({
      latest_version: merged.latest_version,
      version_code: Number(merged.version_code) || 1,
      release_channel: merged.release_channel,
      release_date: merged.release_date,
      release_date_hi: merged.release_date_hi,
      apk_size_label: merged.apk_size_label,
      min_android: merged.min_android,
      min_sdk: Number(merged.min_sdk) || 26,
      architecture: merged.architecture,
      apk_download_url: merged.apk_download_url,
      sha256: merged.sha256,
      is_mandatory_update: merged.is_mandatory_update,
      changelog: [updatedTop, ...olderEntries],
    });

    if (res.success) {
      showToast(
        "success",
        "Live APK Release config saved! /app & /api/app-release updated immediately.",
      );
      router.refresh();
    } else {
      showToast("error", res.error || "Failed to save release config.");
    }
    return res;
  };

  const handleSaveRelease = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      await persistReleaseConfig();
    });
  };

  // =========================================================================
  // TAB 2B: 1-CLICK APK BUCKET UPLOADER + AUTO SHA-256 + BUCKET EXPLORER
  // =========================================================================
  const apkInputRef = useRef<HTMLInputElement | null>(null);
  const [isDraggingApk, setIsDraggingApk] = useState(false);
  const [selectedApkFile, setSelectedApkFile] = useState<File | null>(null);
  const [computedSha256, setComputedSha256] = useState<string>("");
  const [computedSizeLabel, setComputedSizeLabel] = useState<string>("");
  const [destFilename, setDestFilename] = useState<string>(
    `hindi-bhajan-manjari-v${(initialRelease.latestVersion || "1.0.0").trim()}.apk`,
  );
  const [uploadPhase, setUploadPhase] = useState<
    "idle" | "hashing" | "authorizing" | "uploading" | "publishing" | "success" | "error"
  >("idle");
  const [uploadError, setUploadError] = useState<string>("");
  const [lastUploadedUrl, setLastUploadedUrl] = useState<string>("");
  const [copiedUrl, setCopiedUrl] = useState(false);

  const [showBucketFiles, setShowBucketFiles] = useState(false);
  const [bucketFiles, setBucketFiles] = useState<BucketApkFile[]>([]);
  const [loadingBucketFiles, setLoadingBucketFiles] = useState(false);
  const [deletingBucketFile, setDeletingBucketFile] = useState<string | null>(null);

  const handleApkFileSelected = async (file: File | null) => {
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".apk")) {
      showToast("error", "Please select a valid .apk file.");
      return;
    }

    setSelectedApkFile(file);
    setUploadPhase("hashing");
    setUploadError("");
    setLastUploadedUrl("");

    const sizeLabel = formatFileSizeMB(file.size);
    setComputedSizeLabel(sizeLabel);

    const ver = (relForm.latest_version || "1.0.0")
      .trim()
      .replace(/[^a-zA-Z0-9._-]/g, "");
    setDestFilename(`hindi-bhajan-manjari-v${ver || "1.0.0"}.apk`);

    // Auto-fill size immediately
    setRelForm((prev) => ({ ...prev, apk_size_label: sizeLabel }));

    const sha = await computeFileSha256(file);
    if (sha) {
      setComputedSha256(sha);
      setRelForm((prev) => ({ ...prev, sha256: sha }));
    } else {
      setComputedSha256("");
    }
    setUploadPhase("idle");
  };

  const handleRefreshBucketFiles = async () => {
    setLoadingBucketFiles(true);
    const res = await listBucketApksAction();
    setLoadingBucketFiles(false);
    if (res.success) {
      setBucketFiles(res.files);
    } else if (res.error) {
      showToast("error", res.error);
    }
  };

  const handleToggleBucketExplorer = async () => {
    const next = !showBucketFiles;
    setShowBucketFiles(next);
    if (next) {
      await handleRefreshBucketFiles();
    }
  };

  const handleUploadApkToBucket = async (autoPublish: boolean) => {
    if (!selectedApkFile) {
      showToast("error", "Please choose an .apk file first.");
      return;
    }

    const targetName = destFilename.trim();
    if (!targetName.toLowerCase().endsWith(".apk")) {
      showToast("error", "Destination filename must end with .apk");
      return;
    }

    setUploadError("");
    setUploadPhase("authorizing");

    try {
      // Step 1: Request authenticated signed upload URL from server
      const signedRes = await createApkSignedUploadUrlAction({
        filename: targetName,
      });
      if (!signedRes.success) {
        throw new Error(signedRes.error || "Could not authorize signed upload URL.");
      }

      // Step 2: Upload APK directly from browser to Supabase 'apks' bucket
      setUploadPhase("uploading");
      const { error: uploadErr } = await supabase.storage
        .from("apks")
        .uploadToSignedUrl(signedRes.path, signedRes.token, selectedApkFile, {
          contentType: "application/vnd.android.package-archive",
          upsert: true,
        });

      if (uploadErr) {
        throw new Error(
          uploadErr.message ||
            "Upload to apks bucket failed. Check Nginx client_max_body_size if APK > 50MB.",
        );
      }

      const nextOverrides = {
        apk_download_url: signedRes.publicUrl,
        apk_size_label: computedSizeLabel || relForm.apk_size_label,
        sha256: computedSha256 || relForm.sha256,
      };

      setLastUploadedUrl(signedRes.publicUrl);
      setRelForm((prev) => ({ ...prev, ...nextOverrides }));

      // Step 3: Optionally auto-publish live release config in the same click
      if (autoPublish) {
        setUploadPhase("publishing");
        const saveRes = await persistReleaseConfig(nextOverrides);
        if (!saveRes.success) {
          setUploadPhase("error");
          setUploadError(
            `APK uploaded to apks/${signedRes.path}, but saving release config failed: ${saveRes.error}`,
          );
          return;
        }
      } else {
        showToast(
          "success",
          `APK uploaded to apks/${signedRes.path}! Download URL, Size & SHA-256 auto-filled.`,
        );
      }

      setUploadPhase("success");
      if (showBucketFiles) {
        await handleRefreshBucketFiles();
      }
    } catch (err: any) {
      setUploadPhase("error");
      let msg = err?.message || "APK upload failed.";
      if (
        (selectedApkFile && selectedApkFile.size > 50 * 1024 * 1024) ||
        msg.includes("Failed to fetch")
      ) {
        msg = `File is ${computedSizeLabel}. Self-hosted Supabase Storage has a default 50 MB limit (returned 413 / CORS). Please host on GitHub Releases (free, up to 2GB) or increase FILE_SIZE_LIMIT on your VPS.`;
      }
      setUploadError(msg);
      showToast("error", msg);
    }
  };

  const handleDeleteBucketFile = async (filename: string) => {
    if (!window.confirm(`Delete "${filename}" permanently from the apks bucket?`)) {
      return;
    }
    setDeletingBucketFile(filename);
    const res = await deleteBucketApkAction(filename);
    setDeletingBucketFile(null);
    if (res.success) {
      setBucketFiles((prev) => prev.filter((f) => f.name !== filename));
      showToast("success", `Deleted ${filename} from apks bucket.`);
    } else {
      showToast("error", res.error || "Failed to delete file.");
    }
  };

  // =========================================================================
  // TAB 3: USERS, SUBSCRIPTIONS & DEVICES STATE
  // =========================================================================
  const [userSearch, setUserSearch] = useState("");
  const [userFilter, setUserFilter] = useState<
    "all" | "active" | "free" | "max_devices"
  >("all");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [grantPlanId, setGrantPlanId] = useState<string>(
    initialPlans[0]?.id || "monthly",
  );
  const [grantDays, setGrantDays] = useState<string>("30");
  const [grantNote, setGrantNote] = useState<string>("");
  const [editUserForm, setEditUserForm] = useState<{
    fullName: string;
    email: string;
  } | null>(null);

  const filteredProfiles = useMemo(() => {
    const q = userSearch.trim().toLowerCase();
    return initialProfiles.filter((u) => {
      const hasActive = activeSubByUser.has(u.user_id);
      const devCount = (devicesByUser.get(u.user_id) || []).length;

      if (userFilter === "active" && !hasActive) return false;
      if (userFilter === "free" && hasActive) return false;
      if (userFilter === "max_devices" && devCount < 2) return false;

      if (!q) return true;
      return (
        (u.full_name || "").toLowerCase().includes(q) ||
        (u.phone || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        u.user_id.toLowerCase().includes(q)
      );
    });
  }, [initialProfiles, userSearch, userFilter, activeSubByUser, devicesByUser]);

  const selectedUser = selectedUserId
    ? profileById.get(selectedUserId) || null
    : null;

  const openUserDrawer = (u: AppProfileRow) => {
    setSelectedUserId(u.user_id);
    setEditUserForm({
      fullName: u.full_name || "",
      email: u.email || "",
    });
    setGrantDays("30");
    setGrantNote("");
  };

  // =========================================================================
  // TAB 4: PLANS STATE
  // =========================================================================
  const [planDrafts, setPlanDrafts] = useState<Record<string, AppPlanRow>>(() => {
    const map: Record<string, AppPlanRow> = {};
    for (const p of initialPlans) map[p.id] = { ...p };
    return map;
  });

  // =========================================================================
  // TAB 5: PAYMENTS FILTER + CSV EXPORT
  // =========================================================================
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<
    "all" | "paid" | "manual" | "failed"
  >("all");

  const filteredLogs = useMemo(() => {
    const q = paymentSearch.trim().toLowerCase();
    return initialLogs.filter((l) => {
      const st = (l.status || "").toLowerCase();
      const ev = (l.event_type || "").toLowerCase();
      if (
        paymentStatusFilter === "paid" &&
        !(st === "captured" || st === "paid" || st === "active")
      ) {
        return false;
      }
      if (paymentStatusFilter === "manual" && !ev.includes("admin_manual")) {
        return false;
      }
      if (
        paymentStatusFilter === "failed" &&
        !(st === "failed" || st === "halted" || st === "cancelled")
      ) {
        return false;
      }
      if (!q) return true;
      const prof = l.user_id ? profileById.get(l.user_id) : null;
      return (
        (l.rzp_payment_id || "").toLowerCase().includes(q) ||
        (l.rzp_subscription_id || "").toLowerCase().includes(q) ||
        (l.event_type || "").toLowerCase().includes(q) ||
        (prof?.phone || "").toLowerCase().includes(q) ||
        (prof?.full_name || "").toLowerCase().includes(q)
      );
    });
  }, [initialLogs, paymentSearch, paymentStatusFilter, profileById]);

  const exportPaymentsCsv = () => {
    const headers = [
      "Date (IST)",
      "User Name",
      "Phone",
      "Event Type",
      "Amount (INR)",
      "Status",
      "Razorpay Payment ID",
      "Razorpay Sub ID",
    ];
    const rows = filteredLogs.map((l) => {
      const prof = l.user_id ? profileById.get(l.user_id) : null;
      return [
        formatDateTimeIST(l.created_at),
        prof?.full_name || "",
        prof?.phone || "",
        l.event_type,
        String(l.amount_inr || 0),
        l.status,
        l.rzp_payment_id || "",
        l.rzp_subscription_id || "",
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(",");
    });
    const csv = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hbm-app-payments-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // =========================================================================
  // TAB 6: FESTIVALS STATE
  // =========================================================================
  const [festForm, setFestForm] = useState({
    festival_id: "janmashtami",
    start_date: "",
    end_date: "",
    custom_title_hi: "",
    custom_tagline_hi: "",
  });

  const handleAddFestival = (e: React.FormEvent) => {
    e.preventDefault();
    if (!festForm.start_date || !festForm.end_date) {
      showToast("error", "Please select both start date and end date.");
      return;
    }
    startTransition(async () => {
      const res = await createFestivalOverrideAction(festForm);
      if (res.success) {
        showToast("success", "Festival override added!");
        setFestForm({
          festival_id: "janmashtami",
          start_date: "",
          end_date: "",
          custom_title_hi: "",
          custom_tagline_hi: "",
        });
        router.refresh();
      } else {
        showToast("error", res.error || "Could not add festival override.");
      }
    });
  };

  const TABS: Array<{
    id: ManagerTab;
    label: string;
    icon: React.ComponentType<{ size?: number }>;
    badge?: number | string;
  }> = [
    { id: "overview", label: "Overview", icon: FaAndroid },
    {
      id: "release",
      label: "APK Release",
      icon: FaDownload,
      badge: `v${initialRelease.latestVersion}`,
    },
    {
      id: "users",
      label: "Users & Devices",
      icon: FaUsers,
      badge: initialProfiles.length,
    },
    {
      id: "plans",
      label: "Plans & Pricing",
      icon: FaTag,
      badge: initialPlans.length,
    },
    {
      id: "payments",
      label: "Payments",
      icon: FaReceipt,
      badge: initialLogs.length,
    },
    {
      id: "festivals",
      label: "Festivals",
      icon: FaCalendarAlt,
      badge: initialFestivals.length,
    },
    {
      id: "trials",
      label: "Trials",
      icon: FaClock,
      badge: initialTrials.length,
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 selection:bg-orange-100 selection:text-orange-900 w-full">
      {/* TOAST NOTIFICATION */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-md px-5 py-3.5 rounded-2xl shadow-2xl border font-bold text-sm flex items-center gap-3 ${
            toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-500"
              : "bg-red-600 text-white border-red-500"
          }`}
        >
          {toast.type === "success" ? (
            <FaCheckCircle size={16} />
          ) : (
            <FaExclamationTriangle size={16} />
          )}
          <span className="flex-1">{toast.text}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="opacity-80 hover:opacity-100 cursor-pointer"
          >
            <FaTimes size={13} />
          </button>
        </div>
      )}

      {/* =================================================================
          1. HERO COMMAND HEADER (Matches /admin Dashboard exact aesthetic)
         ================================================================= */}
      <div className="relative overflow-hidden bg-white p-6 md:p-9 rounded-[2rem] border border-orange-100 shadow-[0_10px_40px_-15px_rgba(234,88,12,0.1)]">
        <div className="absolute top-[-50%] right-[-10%] w-[360px] h-[360px] bg-gradient-to-br from-orange-400/20 to-red-400/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 md:gap-5">
            <div className="w-14 h-14 md:w-16 md:h-16 bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl flex items-center justify-center shrink-0 border border-orange-200 shadow-inner">
              <FaAndroid className="text-3xl text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tighter">
                Android App Manager
              </h1>
              <p className="text-gray-500 font-medium text-sm md:text-base mt-1 flex flex-wrap items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>
                  Hindi Bhajan Manjari ·{" "}
                  <strong className="text-gray-800">
                    v{initialRelease.latestVersion} (Build{" "}
                    {initialRelease.versionCode})
                  </strong>
                </span>
                <span
                  className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    initialRelease.apkDownloadUrl
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}
                >
                  {initialRelease.apkDownloadUrl
                    ? "APK Live on /app"
                    : "APK URL Pending"}
                </span>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/app"
              target="_blank"
              className="text-gray-700 hover:text-orange-600 font-bold text-xs md:text-sm flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-orange-50 rounded-xl border border-gray-200 hover:border-orange-200 transition-all"
            >
              View /app Store <FaExternalLinkAlt size={11} />
            </Link>
            <Link
              href="/api/app-release"
              target="_blank"
              className="text-gray-700 hover:text-orange-600 font-bold text-xs md:text-sm flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-orange-50 rounded-xl border border-gray-200 hover:border-orange-200 transition-all"
            >
              Release API JSON <FaExternalLinkAlt size={11} />
            </Link>
            <button
              type="button"
              onClick={() => startTransition(() => router.refresh())}
              disabled={isPending}
              className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-5 py-3 rounded-xl font-black text-xs md:text-sm flex items-center gap-2 shadow-md shadow-orange-600/25 hover:shadow-lg transition-all cursor-pointer disabled:opacity-60"
            >
              <FaSyncAlt className={isPending ? "animate-spin" : ""} size={12} />
              <span>Refresh Live Data</span>
            </button>
          </div>
        </div>
      </div>

      {/* OPTIONAL ONE-TIME SQL SETUP NOTICE */}
      {(releaseTableMissing || festivalsTableMissing) && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 md:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <FaExclamationTriangle className="text-amber-600 mt-0.5 shrink-0" />
            <div className="text-xs md:text-sm text-amber-900">
              <strong className="font-extrabold block">
                One-Time SQL Setup Required for Dynamic APK Release &amp; Festival Overrides
              </strong>
              Run{" "}
              <code className="font-mono bg-amber-100 px-1.5 py-0.5 rounded">
                supabase_app_admin_config.sql
              </code>{" "}
              in Supabase SQL Editor once so saving APK links, SHA-256, and Festival dates persists live.
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          2. NAVIGATION TABS
         ================================================================= */}
      <div className="bg-white p-2 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none]">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 px-4 py-2.5 rounded-xl text-xs md:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
                active
                  ? "bg-orange-600 text-white shadow-md shadow-orange-600/20"
                  : "text-gray-600 hover:bg-orange-50 hover:text-orange-700"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  className={`text-[11px] font-mono px-1.5 py-0.5 rounded-md ${
                    active
                      ? "bg-white/20 text-white"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* =================================================================
          TAB 1: OVERVIEW & ANALYTICS
         ================================================================= */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {[
              {
                label: "Total App Users",
                value: initialProfiles.length,
                sub: "Registered accounts in app_profiles",
                icon: FaUsers,
                tint: "bg-orange-50 text-orange-600",
                onClick: () => setActiveTab("users"),
              },
              {
                label: "Active Bhakti Passes",
                value: activeSubByUser.size,
                sub: `Out of ${initialSubscriptions.length} total subscriptions`,
                icon: FaCrown,
                tint: "bg-amber-50 text-amber-600",
                onClick: () => {
                  setUserFilter("active");
                  setActiveTab("users");
                },
              },
              {
                label: "Total App Revenue",
                value: `₹${totalRevenueInr.toLocaleString("en-IN")}`,
                sub: `${initialLogs.length} payment & audit events`,
                icon: FaRupeeSign,
                tint: "bg-emerald-50 text-emerald-600",
                onClick: () => setActiveTab("payments"),
              },
              {
                label: "Linked Devices",
                value: initialDevices.length,
                sub: "Active 2-device limit sessions",
                icon: FaMobileAlt,
                tint: "bg-blue-50 text-blue-600",
                onClick: () => setActiveTab("users"),
              },
              {
                label: "Cloud-Saved Bhajans",
                value: totalSavedBhajans,
                sub: "Synced across user Sangrah libraries",
                icon: FaBookmark,
                tint: "bg-rose-50 text-rose-600",
                onClick: undefined,
              },
              {
                label: "Device Free Trials",
                value: `${activeTrialsCount} live / ${initialTrials.length}`,
                sub: "Server-anchored 1-hour preview tracker",
                icon: FaClock,
                tint: "bg-indigo-50 text-indigo-600",
                onClick: () => setActiveTab("trials"),
              },
            ].map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  onClick={stat.onClick}
                  className={`bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-900/5 transition-all ${
                    stat.onClick
                      ? "cursor-pointer hover:-translate-y-1 hover:border-orange-200"
                      : ""
                  }`}
                >
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${stat.tint}`}
                  >
                    <Icon size={20} />
                  </div>
                  <p className="text-gray-500 font-bold text-[11px] uppercase tracking-widest">
                    {stat.label}
                  </p>
                  <div className="text-3xl font-black text-gray-900 tracking-tight mt-1 tabular-nums">
                    {stat.value}
                  </div>
                  <p className="text-xs text-gray-500 mt-1.5 font-medium">
                    {stat.sub}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Most Cloud-Saved Bhajans */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-900/5 p-6">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <FaBookmark className="text-orange-600" size={16} />
                Top Cloud-Saved Bhajans
              </h2>
              {topSavedSlugs.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No cloud-synced saved bhajans yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {topSavedSlugs.map((item, idx) => (
                    <div
                      key={item.slug}
                      className="py-2.5 flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-full bg-orange-50 text-orange-700 font-mono text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <Link
                          href={`/bhajan/${item.slug}`}
                          target="_blank"
                          className="text-sm font-bold text-gray-800 hover:text-orange-600 truncate"
                        >
                          {item.slug}
                        </Link>
                      </div>
                      <span className="text-xs font-extrabold bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full shrink-0">
                        {item.count} saves
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Latest App Activity */}
            <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-900/5 p-6">
              <h2 className="text-lg font-black text-gray-900 mb-4 flex items-center gap-2">
                <FaReceipt className="text-emerald-600" size={16} />
                Recent Payment &amp; Grant Events
              </h2>
              {initialLogs.length === 0 ? (
                <p className="text-sm text-gray-500">
                  No payment events recorded yet.
                </p>
              ) : (
                <div className="divide-y divide-gray-100">
                  {initialLogs.slice(0, 8).map((log) => {
                    const prof = log.user_id
                      ? profileById.get(log.user_id)
                      : null;
                    return (
                      <div
                        key={log.id}
                        className="py-2.5 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {prof?.full_name || prof?.phone || "Unknown user"}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.event_type} · {formatDateTimeIST(log.created_at)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-black text-gray-900">
                            ₹{log.amount_inr || 0}
                          </div>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                            {log.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =================================================================
          TAB 2: APK RELEASE & DISTRIBUTION MANAGER
         ================================================================= */}
      {activeTab === "release" && (
        <form
          onSubmit={handleSaveRelease}
          className="bg-white rounded-[2rem] border border-gray-100 shadow-lg shadow-gray-900/5 p-6 md:p-8 space-y-6"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-xl font-black text-gray-900">
                Live APK Release &amp; Distribution Control
              </h2>
              <p className="text-xs md:text-sm text-gray-500 mt-0.5">
                Changes saved here update{" "}
                <code className="font-mono text-orange-600">/app</code> and{" "}
                <code className="font-mono text-orange-600">/api/app-release</code>{" "}
                live without redeploying!
              </p>
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-orange-600 to-orange-500 text-white px-6 py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-60"
            >
              <FaSave size={14} />
              <span>{isPending ? "Saving..." : "Publish Live Release Config"}</span>
            </button>
          </div>

          {/* ===============================================================
              DIRECT 1-CLICK APK UPLOADER -> SUPABASE `apks` BUCKET
             =============================================================== */}
          <div className="rounded-2xl border border-orange-200/80 bg-gradient-to-br from-orange-50/70 via-amber-50/40 to-white p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <FaCloudUploadAlt size={18} />
                </div>
                <div>
                  <h3 className="text-sm md:text-base font-black text-gray-900">
                    1-Click Direct APK Upload (<code className="font-mono text-orange-700">apks</code> Bucket)
                  </h3>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Drop your signed <code className="font-mono">.apk</code> here — SHA-256 &amp; file size auto-calculate locally, then upload directly to{" "}
                    <span className="font-mono text-gray-800">api.hindibhajanmanjari.com</span>.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleToggleBucketExplorer}
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-orange-50 text-gray-700 hover:text-orange-700 border border-gray-200 hover:border-orange-200 text-xs font-bold transition-colors shrink-0 cursor-pointer"
              >
                <FaFolderOpen size={13} />
                <span>{showBucketFiles ? "Hide Bucket Files" : "Browse apks Bucket"}</span>
              </button>
            </div>

            {/* Drag & Drop Picker */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingApk(true);
              }}
              onDragLeave={() => setIsDraggingApk(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingApk(false);
                const dropped = e.dataTransfer.files?.[0] || null;
                void handleApkFileSelected(dropped);
              }}
              onClick={() => apkInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-5 text-center transition-all cursor-pointer ${
                isDraggingApk
                  ? "border-orange-500 bg-orange-100/60"
                  : "border-orange-200 bg-white/80 hover:border-orange-400 hover:bg-white"
              }`}
            >
              <input
                ref={apkInputRef}
                type="file"
                accept=".apk,application/vnd.android.package-archive"
                className="hidden"
                onChange={(e) => {
                  const chosen = e.target.files?.[0] || null;
                  void handleApkFileSelected(chosen);
                  e.target.value = "";
                }}
              />
              <div className="flex flex-col items-center gap-1.5">
                <FaFileArchive className="text-2xl text-orange-500" />
                <p className="text-sm font-extrabold text-gray-800">
                  {selectedApkFile
                    ? `Selected: ${selectedApkFile.name} (${computedSizeLabel})`
                    : "Click to choose signed .apk or drag & drop here"}
                </p>
                <p className="text-[11px] text-gray-500 font-medium">
                  Uploaded directly to Supabase Storage with MIME{" "}
                  <code className="font-mono">application/vnd.android.package-archive</code>
                </p>
              </div>
            </div>

            {/* Selected APK Inspector + Upload Actions */}
            {selectedApkFile && (
              <div className="bg-white rounded-xl border border-orange-100 p-4 space-y-3 shadow-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                      Target Filename in <code className="font-mono">apks/</code> Bucket
                    </label>
                    <input
                      type="text"
                      value={destFilename}
                      onChange={(e) => setDestFilename(e.target.value)}
                      placeholder="hindi-bhajan-manjari-v1.0.0.apk"
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono font-bold text-gray-800"
                    />
                  </div>
                  <div className="flex flex-col justify-center gap-1 text-xs">
                    <div className="flex items-center gap-2 text-gray-700 font-bold">
                      <span>Detected Size:</span>
                      <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 font-mono">
                        {computedSizeLabel}
                      </span>
                      <span className="text-[11px] text-gray-400 font-mono">
                        ({selectedApkFile.size.toLocaleString("en-IN")} bytes)
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-gray-600 font-mono text-[11px] truncate">
                      <FaShieldAlt className="text-green-600 shrink-0" />
                      {uploadPhase === "hashing" ? (
                        <span className="text-orange-600 font-sans font-bold flex items-center gap-1">
                          <FaSpinner className="animate-spin" /> Computing SHA-256...
                        </span>
                      ) : computedSha256 ? (
                        <span className="truncate" title={computedSha256}>
                          SHA-256: {computedSha256}
                        </span>
                      ) : (
                        <span className="text-amber-600 font-sans">
                          SHA-256 auto-hash unavailable in insecure context
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {selectedApkFile.size > 50 * 1024 * 1024 && (
                  <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900 space-y-1">
                    <p className="font-bold flex items-center gap-1.5">
                      <FaExclamationTriangle className="text-amber-600 shrink-0" />
                      Notice: Universal APK size is {computedSizeLabel} (&gt; 50 MB)
                    </p>
                    <p className="text-[11px] leading-relaxed text-amber-800">
                      Self-hosted Supabase Storage defaults to a 50 MB limit. If bucket upload returns CORS / 413, host on{" "}
                      <a
                        href="https://github.com/nvsict/hindi-bhajan-manjari/releases/new"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-bold underline text-amber-950 hover:text-orange-700"
                      >
                        GitHub Releases (Recommended, 2GB limit)
                      </a>{" "}
                      and paste the release URL below, or increase <code>FILE_SIZE_LIMIT</code> in your VPS Docker config.
                    </p>
                  </div>
                )}

                {/* Live Upload Progress / Status Strip */}
                {(uploadPhase === "authorizing" ||
                  uploadPhase === "uploading" ||
                  uploadPhase === "publishing") && (
                  <div className="rounded-xl bg-orange-50 border border-orange-200 px-3.5 py-2.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-orange-800">
                      <FaSpinner className="animate-spin text-orange-600" />
                      <span>
                        {uploadPhase === "authorizing" &&
                          "Step 1/3: Generating secure signed upload URL..."}
                        {uploadPhase === "uploading" &&
                          `Step 2/3: Uploading ${computedSizeLabel} to api.hindibhajanmanjari.com/apks/${destFilename}...`}
                        {uploadPhase === "publishing" &&
                          "Step 3/3: Publishing live release config to /app & /api/app-release..."}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-orange-200/70 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r from-orange-500 to-red-500 rounded-full transition-all duration-500 animate-pulse ${
                          uploadPhase === "authorizing"
                            ? "w-1/4"
                            : uploadPhase === "uploading"
                              ? "w-3/4"
                              : "w-11/12"
                        }`}
                      />
                    </div>
                  </div>
                )}

                {uploadPhase === "error" && uploadError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-3.5 py-2.5 text-xs font-bold text-red-700 flex items-start gap-2">
                    <FaExclamationTriangle className="mt-0.5 shrink-0" />
                    <span>{uploadError}</span>
                  </div>
                )}

                {uploadPhase === "success" && lastUploadedUrl && (
                  <div className="rounded-xl bg-green-50 border border-green-200 px-3.5 py-2.5 text-xs text-green-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className="font-bold flex items-center gap-1.5 truncate">
                      <FaCheckCircle className="text-green-600 shrink-0" />
                      Uploaded &amp; applied: <span className="font-mono truncate">{lastUploadedUrl}</span>
                    </span>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={async () => {
                          await navigator.clipboard.writeText(lastUploadedUrl);
                          setCopiedUrl(true);
                          setTimeout(() => setCopiedUrl(false), 1800);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-green-200 font-bold text-green-700 hover:bg-green-100 cursor-pointer"
                      >
                        <FaCopy size={11} />
                        {copiedUrl ? "Copied!" : "Copy URL"}
                      </button>
                      <a
                        href={lastUploadedUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-green-600 text-white font-bold hover:bg-green-700"
                      >
                        Test <FaExternalLinkAlt size={10} />
                      </a>
                    </div>
                  </div>
                )}

                {/* Upload Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-1">
                  <button
                    type="button"
                    disabled={
                      uploadPhase === "hashing" ||
                      uploadPhase === "authorizing" ||
                      uploadPhase === "uploading" ||
                      uploadPhase === "publishing"
                    }
                    onClick={() => void handleUploadApkToBucket(true)}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-4 py-2.5 rounded-xl font-black text-xs md:text-sm flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60"
                  >
                    <FaCloudUploadAlt size={15} />
                    <span>Upload APK &amp; Publish Live (1-Click)</span>
                  </button>

                  <button
                    type="button"
                    disabled={
                      uploadPhase === "hashing" ||
                      uploadPhase === "authorizing" ||
                      uploadPhase === "uploading" ||
                      uploadPhase === "publishing"
                    }
                    onClick={() => void handleUploadApkToBucket(false)}
                    className="px-4 py-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200 font-bold text-xs md:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                  >
                    <span>Upload Only (Fill Form)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedApkFile(null);
                      setUploadPhase("idle");
                      setUploadError("");
                    }}
                    className="px-3 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold text-xs cursor-pointer"
                    title="Clear selected file"
                  >
                    <FaTimes />
                  </button>
                </div>
              </div>
            )}

            {/* Bucket Files Explorer */}
            {showBucketFiles && (
              <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-600">
                    Stored APKs in <code className="font-mono text-orange-600">apks</code> Bucket ({bucketFiles.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => void handleRefreshBucketFiles()}
                    disabled={loadingBucketFiles}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 hover:text-orange-700 cursor-pointer disabled:opacity-50"
                  >
                    <FaSyncAlt className={loadingBucketFiles ? "animate-spin" : ""} size={11} />
                    Refresh
                  </button>
                </div>

                {loadingBucketFiles ? (
                  <p className="text-xs text-gray-500 flex items-center gap-2 py-2">
                    <FaSpinner className="animate-spin text-orange-500" /> Loading bucket files...
                  </p>
                ) : bucketFiles.length === 0 ? (
                  <p className="text-xs text-gray-500 py-2">
                    No <code>.apk</code> files uploaded to the <code>apks</code> bucket yet.
                  </p>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {bucketFiles.map((file) => {
                      const isLiveSelected = relForm.apk_download_url.trim() === file.publicUrl;
                      return (
                        <div
                          key={file.name}
                          className="py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-gray-900 truncate">
                                {file.name}
                              </span>
                              {isLiveSelected && (
                                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-green-100 text-green-700 shrink-0">
                                  Active in Form
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                              {formatFileSizeMB(file.size)} · Uploaded {formatDateTimeIST(file.createdAt)}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => {
                                setRelForm((prev) => ({
                                  ...prev,
                                  apk_download_url: file.publicUrl,
                                  apk_size_label:
                                    file.size > 0
                                      ? formatFileSizeMB(file.size)
                                      : prev.apk_size_label,
                                }));
                                showToast(
                                  "success",
                                  `Applied ${file.name} to Release form. Click "Publish Live Release Config" to push live.`,
                                );
                              }}
                              className="px-2.5 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-xs cursor-pointer"
                            >
                              Use APK
                            </button>
                            <a
                              href={file.publicUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2.5 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs inline-flex items-center gap-1"
                            >
                              <FaDownload size={10} />
                            </a>
                            <button
                              type="button"
                              disabled={deletingBucketFile === file.name}
                              onClick={() => void handleDeleteBucketFile(file.name)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-600 text-red-600 hover:text-white font-bold text-xs cursor-pointer disabled:opacity-50"
                              title="Delete APK from bucket"
                            >
                              {deletingBucketFile === file.name ? (
                                <FaSpinner className="animate-spin" size={11} />
                              ) : (
                                <FaTrash size={11} />
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Latest Version (Semver)
              </label>
              <input
                type="text"
                required
                value={relForm.latest_version}
                onChange={(e) =>
                  setRelForm({ ...relForm, latest_version: e.target.value })
                }
                placeholder="1.0.0"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Android Version Code (Build #)
              </label>
              <input
                type="number"
                required
                value={relForm.version_code}
                onChange={(e) =>
                  setRelForm({ ...relForm, version_code: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono font-bold"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                APK File Size Label
              </label>
              <input
                type="text"
                required
                value={relForm.apk_size_label}
                onChange={(e) =>
                  setRelForm({ ...relForm, apk_size_label: e.target.value })
                }
                placeholder="28 MB"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-bold"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Direct Signed APK Download URL (GitHub Release / Cloudflare R2 /
                /downloads/hindi-bhajan-manjari-v1.0.0.apk)
              </label>
              <input
                type="text"
                value={relForm.apk_download_url}
                onChange={(e) =>
                  setRelForm({ ...relForm, apk_download_url: e.target.value })
                }
                placeholder="https://github.com/nvsict/hindi-bhajan-manjari/releases/download/v1.0.0/hindi-bhajan-manjari-v1.0.0.apk"
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                SHA-256 Checksum (run: certutil -hashfile app.apk SHA256)
              </label>
              <input
                type="text"
                value={relForm.sha256}
                onChange={(e) =>
                  setRelForm({ ...relForm, sha256: e.target.value })
                }
                placeholder="Paste 64-character SHA-256 hash here..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Release Date (English)
              </label>
              <input
                type="text"
                value={relForm.release_date}
                onChange={(e) =>
                  setRelForm({ ...relForm, release_date: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Release Date (Hindi)
              </label>
              <input
                type="text"
                value={relForm.release_date_hi}
                onChange={(e) =>
                  setRelForm({ ...relForm, release_date_hi: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Channel &amp; Update Policy
              </label>
              <div className="flex items-center gap-3 pt-1">
                <select
                  value={relForm.release_channel}
                  onChange={(e) =>
                    setRelForm({
                      ...relForm,
                      release_channel: e.target.value as "stable" | "beta",
                    })
                  }
                  className="px-3 py-2 rounded-xl border border-gray-200 text-sm font-bold"
                >
                  <option value="stable">Stable</option>
                  <option value="beta">Beta</option>
                </select>
                <label className="inline-flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={relForm.is_mandatory_update}
                    onChange={(e) =>
                      setRelForm({
                        ...relForm,
                        is_mandatory_update: e.target.checked,
                      })
                    }
                    className="w-4 h-4 accent-orange-600"
                  />
                  Mandatory Update
                </label>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-gray-100">
            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Release Title (Hindi)
              </label>
              <input
                type="text"
                value={relForm.titleHi}
                onChange={(e) =>
                  setRelForm({ ...relForm, titleHi: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm mb-3"
              />
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                What&apos;s New Highlights — Hindi (one bullet per line)
              </label>
              <textarea
                rows={6}
                value={relForm.highlightsHiText}
                onChange={(e) =>
                  setRelForm({ ...relForm, highlightsHiText: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm leading-relaxed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                Release Title (English)
              </label>
              <input
                type="text"
                value={relForm.titleEn}
                onChange={(e) =>
                  setRelForm({ ...relForm, titleEn: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm mb-3"
              />
              <label className="block text-xs font-bold text-gray-600 mb-1.5">
                What&apos;s New Highlights — English (one bullet per line)
              </label>
              <textarea
                rows={6}
                value={relForm.highlightsEnText}
                onChange={(e) =>
                  setRelForm({ ...relForm, highlightsEnText: e.target.value })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm leading-relaxed"
              />
            </div>
          </div>
        </form>
      )}

      {/* =================================================================
          TAB 3: USERS, SUBSCRIPTIONS & 2-DEVICE LIMIT MANAGER
         ================================================================= */}
      {activeTab === "users" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <FaSearch
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="Search by name, 10-digit phone, email, or user ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(
                [
                  { id: "all", label: `All (${initialProfiles.length})` },
                  { id: "active", label: `Active Pass (${activeSubByUser.size})` },
                  { id: "free", label: "Free / Expired" },
                  { id: "max_devices", label: "2/2 Devices" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setUserFilter(f.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer transition-colors ${
                    userFilter === f.id
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-900/5 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-5 font-bold">User</th>
                  <th className="py-3.5 px-4 font-bold">Subscription</th>
                  <th className="py-3.5 px-4 font-bold">Devices</th>
                  <th className="py-3.5 px-4 font-bold">Saved</th>
                  <th className="py-3.5 px-4 font-bold">Joined</th>
                  <th className="py-3.5 px-5 font-bold text-right">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {filteredProfiles.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-gray-500 font-medium"
                    >
                      No app users match your search.
                    </td>
                  </tr>
                ) : (
                  filteredProfiles.map((u) => {
                    const activeSub = activeSubByUser.get(u.user_id);
                    const latestSub = latestSubByUser.get(u.user_id);
                    const devs = devicesByUser.get(u.user_id) || [];
                    const savedCount = savedCountByUser[u.user_id] || 0;

                    return (
                      <tr
                        key={u.user_id}
                        className="hover:bg-orange-50/30 transition-colors"
                      >
                        <td className="py-3.5 px-5">
                          <div className="font-bold text-gray-900">
                            {u.full_name || "Unnamed User"}
                          </div>
                          <div className="text-xs text-gray-500 font-mono">
                            {u.phone}
                            {u.email ? ` · ${u.email}` : ""}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          {activeSub ? (
                            <div>
                              <span className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <FaCrown size={10} /> {activeSub.plan_id}
                              </span>
                              <div className="text-[11px] text-gray-500 mt-0.5">
                                Expires {formatDateShort(activeSub.current_period_end)}
                              </div>
                            </div>
                          ) : latestSub ? (
                            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                              {latestSub.status}
                            </span>
                          ) : (
                            <span className="text-xs text-gray-400 font-medium">
                              No Pass
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                              devs.length >= 2
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {devs.length} / 2
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs font-bold text-gray-700">
                          {savedCount}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">
                          {formatDateShort(u.created_at)}
                        </td>
                        <td className="py-3.5 px-5 text-right">
                          <button
                            type="button"
                            onClick={() => openUserDrawer(u)}
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                          >
                            <FaEdit size={11} /> Manage
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================
          TAB 4: PLANS & DYNAMIC PRICING (`app_plans`)
         ================================================================= */}
      {activeTab === "plans" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Object.values(planDrafts).map((plan) => (
            <div
              key={plan.id}
              className="bg-white rounded-[1.75rem] border border-gray-100 shadow-lg shadow-gray-900/5 p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="font-mono text-xs font-bold uppercase text-orange-600 bg-orange-50 px-2.5 py-0.5 rounded-full">
                    Plan ID: {plan.id}
                  </span>
                  <h3 className="text-lg font-black text-gray-900 mt-1">
                    {plan.name_en} ({plan.name_hi})
                  </h3>
                </div>
                <label className="inline-flex items-center gap-2 text-xs font-bold cursor-pointer">
                  <input
                    type="checkbox"
                    checked={plan.is_active}
                    onChange={(e) =>
                      setPlanDrafts((prev) => ({
                        ...prev,
                        [plan.id]: { ...prev[plan.id], is_active: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 accent-orange-600"
                  />
                  Active
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Price (₹ INR)
                  </label>
                  <input
                    type="number"
                    value={plan.price_inr}
                    onChange={(e) =>
                      setPlanDrafts((prev) => ({
                        ...prev,
                        [plan.id]: {
                          ...prev[plan.id],
                          price_inr: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono font-black text-base"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Duration (Days)
                  </label>
                  <input
                    type="number"
                    value={plan.duration_days}
                    onChange={(e) =>
                      setPlanDrafts((prev) => ({
                        ...prev,
                        [plan.id]: {
                          ...prev[plan.id],
                          duration_days: Number(e.target.value),
                        },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 font-mono font-bold text-base"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Name (Hindi)
                  </label>
                  <input
                    type="text"
                    value={plan.name_hi}
                    onChange={(e) =>
                      setPlanDrafts((prev) => ({
                        ...prev,
                        [plan.id]: { ...prev[plan.id], name_hi: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1">
                    Name (English)
                  </label>
                  <input
                    type="text"
                    value={plan.name_en}
                    onChange={(e) =>
                      setPlanDrafts((prev) => ({
                        ...prev,
                        [plan.id]: { ...prev[plan.id], name_en: e.target.value },
                      }))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Description (Hindi)
                </label>
                <textarea
                  rows={2}
                  value={plan.description_hi || ""}
                  onChange={(e) =>
                    setPlanDrafts((prev) => ({
                      ...prev,
                      [plan.id]: {
                        ...prev[plan.id],
                        description_hi: e.target.value,
                      },
                    }))
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[11px] font-mono text-gray-400">
                  Razorpay Plan: {plan.rzp_plan_id || "Auto-sync on next checkout"}
                </span>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await updateAppPlanAction({
                        id: plan.id,
                        name_hi: plan.name_hi,
                        name_en: plan.name_en,
                        description_hi: plan.description_hi || "",
                        price_inr: plan.price_inr,
                        duration_days: plan.duration_days,
                        is_active: plan.is_active,
                      });
                      if (res.success) {
                        showToast(
                          "success",
                          res.priceChanged
                            ? `Plan "${plan.id}" updated! Razorpay will auto-sync the new ₹${plan.price_inr} price on next checkout.`
                            : `Plan "${plan.id}" updated live!`,
                        );
                        router.refresh();
                      } else {
                        showToast("error", res.error || "Update failed.");
                      }
                    })
                  }
                  className="bg-orange-600 hover:bg-orange-500 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  <FaSave size={12} /> Save Plan
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* =================================================================
          TAB 5: PAYMENTS & REVENUE LEDGER
         ================================================================= */}
      {activeTab === "payments" && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            <div className="relative flex-1">
              <FaSearch
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                placeholder="Search by Razorpay ID, event, user phone or name..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {(
                [
                  { id: "all", label: "All" },
                  { id: "paid", label: "Paid / Captured" },
                  { id: "manual", label: "Admin Grants" },
                  { id: "failed", label: "Failed / Cancelled" },
                ] as const
              ).map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPaymentStatusFilter(f.id)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold cursor-pointer ${
                    paymentStatusFilter === f.id
                      ? "bg-orange-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-orange-50"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              <button
                type="button"
                onClick={exportPaymentsCsv}
                className="px-3.5 py-2 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 cursor-pointer"
              >
                <FaDownload size={11} /> Export CSV
              </button>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-900/5 overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-500">
                  <th className="py-3.5 px-5 font-bold">Date (IST)</th>
                  <th className="py-3.5 px-4 font-bold">User</th>
                  <th className="py-3.5 px-4 font-bold">Event</th>
                  <th className="py-3.5 px-4 font-bold">Amount</th>
                  <th className="py-3.5 px-4 font-bold">Status</th>
                  <th className="py-3.5 px-5 font-bold">Reference ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-10 text-center text-gray-500 font-medium"
                    >
                      No payment records found.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l) => {
                    const prof = l.user_id
                      ? profileById.get(l.user_id)
                      : null;
                    return (
                      <tr key={l.id} className="hover:bg-orange-50/20">
                        <td className="py-3 px-5 text-xs text-gray-500 whitespace-nowrap">
                          {formatDateTimeIST(l.created_at)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-gray-900">
                            {prof?.full_name || "—"}
                          </div>
                          <div className="text-[11px] text-gray-500 font-mono">
                            {prof?.phone || l.user_id?.slice(0, 8) || "—"}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-xs text-gray-700">
                          {l.event_type}
                        </td>
                        <td className="py-3 px-4 font-black text-gray-900 tabular-nums">
                          ₹{l.amount_inr || 0}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[11px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                              l.status === "captured" ||
                              l.status === "paid" ||
                              l.status === "active" ||
                              l.status === "granted"
                                ? "bg-emerald-50 text-emerald-700"
                                : l.status === "failed" ||
                                    l.status === "cancelled" ||
                                    l.status === "halted"
                                  ? "bg-red-50 text-red-700"
                                  : "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {l.status}
                          </span>
                        </td>
                        <td className="py-3 px-5 font-mono text-[11px] text-gray-500">
                          {l.rzp_payment_id || l.rzp_subscription_id || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =================================================================
          TAB 6: FESTIVAL SPECIAL MODE OVERRIDES (`app_festivals`)
         ================================================================= */}
      {activeTab === "festivals" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <form
            onSubmit={handleAddFestival}
            className="bg-white rounded-[1.75rem] border border-gray-100 shadow-lg shadow-gray-900/5 p-6 space-y-4 h-fit"
          >
            <h2 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <FaPlus className="text-orange-600" size={14} />
              Add Festival Date Override
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              The app already includes built-in 2026–2030 IST Panchang dates. Use
              overrides to adjust any regional Tithi or run a special Utsav theme.
            </p>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Festival Theme
              </label>
              <select
                value={festForm.festival_id}
                onChange={(e) =>
                  setFestForm({ ...festForm, festival_id: e.target.value })
                }
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold"
              >
                {FESTIVAL_OPTIONS.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  required
                  value={festForm.start_date}
                  onChange={(e) =>
                    setFestForm({ ...festForm, start_date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-600 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  required
                  value={festForm.end_date}
                  onChange={(e) =>
                    setFestForm({ ...festForm, end_date: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Custom Hindi Title (Optional)
              </label>
              <input
                type="text"
                value={festForm.custom_title_hi}
                onChange={(e) =>
                  setFestForm({ ...festForm, custom_title_hi: e.target.value })
                }
                placeholder="e.g. पावन एकादशी विशेष"
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1">
                Custom Hindi Tagline (Optional)
              </label>
              <input
                type="text"
                value={festForm.custom_tagline_hi}
                onChange={(e) =>
                  setFestForm({
                    ...festForm,
                    custom_tagline_hi: e.target.value,
                  })
                }
                placeholder="Optional festival greeting..."
                className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm"
              />
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white py-3 rounded-xl font-black text-sm cursor-pointer disabled:opacity-60"
            >
              Add Override
            </button>
          </form>

          <div className="lg:col-span-2 bg-white rounded-[1.75rem] border border-gray-100 shadow-lg shadow-gray-900/5 p-6">
            <h2 className="text-lg font-black text-gray-900 mb-4">
              Active &amp; Scheduled Remote Overrides ({initialFestivals.length})
            </h2>
            {initialFestivals.length === 0 ? (
              <p className="text-sm text-gray-500">
                No remote overrides configured yet — the built-in 2026–2030 IST
                Panchang handles all major Hindu festivals automatically.
              </p>
            ) : (
              <div className="divide-y divide-gray-100">
                {initialFestivals.map((f) => (
                  <div
                    key={f.id}
                    className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-extrabold uppercase bg-orange-50 text-orange-700 px-2.5 py-0.5 rounded-full">
                          {f.festival_id}
                        </span>
                        <span className="text-xs font-mono text-gray-600">
                          {f.start_date} → {f.end_date}
                        </span>
                      </div>
                      {f.custom_title_hi && (
                        <div className="text-sm font-bold text-gray-900 mt-1">
                          {f.custom_title_hi}
                        </div>
                      )}
                      {f.custom_tagline_hi && (
                        <div className="text-xs text-gray-500">
                          {f.custom_tagline_hi}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            const res = await toggleFestivalOverrideAction(
                              f.id,
                              !f.is_active,
                            );
                            if (res.success) {
                              showToast(
                                "success",
                                f.is_active
                                  ? "Festival override paused."
                                  : "Festival override activated.",
                              );
                              router.refresh();
                            } else {
                              showToast("error", res.error || "Update failed.");
                            }
                          })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
                          f.is_active
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {f.is_active ? "Active" : "Paused"}
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            const res = await deleteFestivalOverrideAction(f.id);
                            if (res.success) {
                              showToast("success", "Override deleted.");
                              router.refresh();
                            } else {
                              showToast("error", res.error || "Delete failed.");
                            }
                          })
                        }
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                        aria-label="Delete festival override"
                      >
                        <FaTrash size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* =================================================================
          TAB 7: TRIAL DEVICES RESET TOOL (`app_device_trials`)
         ================================================================= */}
      {activeTab === "trials" && (
        <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-lg shadow-gray-900/5 overflow-x-auto">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-gray-900">
                1-Hour Device Trials ({initialTrials.length})
              </h2>
              <p className="text-xs text-gray-500">
                Reset any device ID to grant a fresh 1-hour trial for QA testing
                or user support.
              </p>
            </div>
          </div>
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-500">
                <th className="py-3 px-5 font-bold">Device ID</th>
                <th className="py-3 px-4 font-bold">First Seen (IST)</th>
                <th className="py-3 px-4 font-bold">Expires At (IST)</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-5 font-bold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs md:text-sm">
              {initialTrials.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-10 text-center text-gray-500">
                    No trial devices recorded yet.
                  </td>
                </tr>
              ) : (
                initialTrials.map((tr) => {
                  const expired =
                    new Date(tr.trial_expires_at).getTime() <= nowMs;
                  return (
                    <tr key={tr.device_id} className="hover:bg-orange-50/20">
                      <td className="py-3 px-5 font-mono text-xs text-gray-800">
                        {tr.device_id}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {formatDateTimeIST(tr.first_seen_at)}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-500">
                        {formatDateTimeIST(tr.trial_expires_at)}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[11px] font-extrabold px-2.5 py-0.5 rounded-full ${
                            expired
                              ? "bg-gray-100 text-gray-600"
                              : "bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {expired ? "Ended" : "Active"}
                        </span>
                      </td>
                      <td className="py-3 px-5 text-right">
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              const res = await resetDeviceTrialAction(
                                tr.device_id,
                              );
                              if (res.success) {
                                showToast(
                                  "success",
                                  "Device trial reset — next app launch gets a fresh 1-hour preview.",
                                );
                                router.refresh();
                              } else {
                                showToast(
                                  "error",
                                  res.error || "Could not reset trial.",
                                );
                              }
                            })
                          }
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-orange-600 bg-orange-50 hover:bg-orange-600 hover:text-white px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                        >
                          <FaRedo size={10} /> Reset Trial
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* =================================================================
          USER DETAIL & SUPPORT MODAL (Grant Pass / Revoke / Unlink Device / Edit Profile)
         ================================================================= */}
      {selectedUser && editUserForm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-[2px] flex items-center justify-center p-4"
          onClick={() => setSelectedUserId(null)}
        >
          <div
            className="w-full max-w-2xl bg-white rounded-3xl border border-orange-100 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 bg-gradient-to-r from-orange-600 to-orange-500 text-white flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black">
                  {selectedUser.full_name || "App Member"}
                </h3>
                <p className="text-xs text-orange-100 font-mono">
                  {selectedUser.phone} · {selectedUser.user_id}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedUserId(null)}
                className="w-9 h-9 rounded-full bg-black/20 hover:bg-black/35 flex items-center justify-center cursor-pointer"
              >
                <FaTimes size={14} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              {/* 1. Profile Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500">
                  Member Profile
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={editUserForm.fullName}
                    onChange={(e) =>
                      setEditUserForm({
                        ...editUserForm,
                        fullName: e.target.value,
                      })
                    }
                    placeholder="Full name"
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                  <input
                    type="email"
                    value={editUserForm.email}
                    onChange={(e) =>
                      setEditUserForm({ ...editUserForm, email: e.target.value })
                    }
                    placeholder="Recovery email"
                    className="px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await updateAppUserProfileAction({
                        userId: selectedUser.user_id,
                        fullName: editUserForm.fullName,
                        email: editUserForm.email,
                      });
                      if (res.success) {
                        showToast("success", "Member profile updated.");
                        router.refresh();
                      } else {
                        showToast("error", res.error || "Update failed.");
                      }
                    })
                  }
                  className="px-4 py-2 rounded-xl bg-gray-900 text-white text-xs font-bold hover:bg-gray-800 cursor-pointer"
                >
                  Save Profile Changes
                </button>
              </div>

              {/* 2. Manual Subscription Grant / Extend / Revoke */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <FaGift className="text-orange-600" /> Subscription Control
                </h4>

                {(() => {
                  const activeSub = activeSubByUser.get(selectedUser.user_id);
                  return activeSub ? (
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-black text-emerald-900">
                          Active Pass: {activeSub.plan_id.toUpperCase()}
                        </div>
                        <div className="text-xs text-emerald-700">
                          Valid until {formatDateTimeIST(activeSub.current_period_end)}
                        </div>
                      </div>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() =>
                          startTransition(async () => {
                            const res = await revokeSubscriptionAction(
                              activeSub.id,
                              selectedUser.user_id,
                            );
                            if (res.success) {
                              showToast("success", "Subscription revoked.");
                              router.refresh();
                            } else {
                              showToast("error", res.error || "Revoke failed.");
                            }
                          })
                        }
                        className="px-3.5 py-2 rounded-xl bg-red-600 text-white text-xs font-bold hover:bg-red-500 cursor-pointer"
                      >
                        Revoke Pass
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-600 font-medium">
                      No active pass currently linked to this user.
                    </div>
                  );
                })()}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <select
                    value={grantPlanId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setGrantPlanId(id);
                      setGrantDays(id === "annual" ? "365" : "30");
                    }}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-bold"
                  >
                    {(initialPlans.length > 0
                      ? initialPlans
                      : [
                          { id: "monthly", name_en: "Monthly Plan" },
                          { id: "annual", name_en: "Annual Plan" },
                        ]
                    ).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name_en} ({p.id})
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    min={1}
                    max={3650}
                    value={grantDays}
                    onChange={(e) => setGrantDays(e.target.value)}
                    placeholder="Days (e.g. 30)"
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm font-mono font-bold"
                  />
                  <input
                    type="text"
                    value={grantNote}
                    onChange={(e) => setGrantNote(e.target.value)}
                    placeholder="Optional note..."
                    className="px-3 py-2.5 rounded-xl border border-gray-200 text-sm"
                  />
                </div>
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await grantOrExtendSubscriptionAction({
                        userId: selectedUser.user_id,
                        planId: grantPlanId,
                        days: Number(grantDays) || 30,
                        note: grantNote,
                      });
                      if (res.success) {
                        showToast(
                          "success",
                          `Pass granted/extended by ${grantDays} days!`,
                        );
                        setGrantNote("");
                        router.refresh();
                      } else {
                        showToast("error", res.error || "Grant failed.");
                      }
                    })
                  }
                  className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-extrabold cursor-pointer"
                >
                  Grant / Extend Pass (+{grantDays || 0} Days)
                </button>
              </div>

              {/* 3. Linked Devices (2-Device Limit Support) */}
              <div className="space-y-3 pt-4 border-t border-gray-100">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                  <FaShieldAlt className="text-blue-600" /> Linked Devices (
                  {(devicesByUser.get(selectedUser.user_id) || []).length} / 2)
                </h4>

                {(devicesByUser.get(selectedUser.user_id) || []).length === 0 ? (
                  <p className="text-xs text-gray-500">No devices linked yet.</p>
                ) : (
                  <div className="space-y-2">
                    {(devicesByUser.get(selectedUser.user_id) || []).map((d) => (
                      <div
                        key={d.id}
                        className="p-3.5 rounded-xl border border-gray-200 bg-gray-50/70 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-bold text-gray-900 truncate">
                            {d.device_name || "Android Device"} (
                            {d.platform || "android"})
                          </div>
                          <div className="text-[11px] font-mono text-gray-500 truncate">
                            ID: {d.device_id} · Last seen{" "}
                            {formatDateTimeIST(d.last_seen_at)}
                          </div>
                        </div>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            startTransition(async () => {
                              const res = await unlinkUserDeviceAction(d.id);
                              if (res.success) {
                                showToast(
                                  "success",
                                  "Device unlinked — user can now sign in on a new phone.",
                                );
                                router.refresh();
                              } else {
                                showToast(
                                  "error",
                                  res.error || "Unlink failed.",
                                );
                              }
                            })
                          }
                          className="shrink-0 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 hover:bg-red-600 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Unlink
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
