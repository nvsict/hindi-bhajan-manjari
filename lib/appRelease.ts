import { createClient } from "@supabase/supabase-js";

// Single source of truth for Hindi Bhajan Manjari Android APK distribution.
// Editable LIVE from /admin/app-manager (stored in `app_release_config` table)
// with automatic static fallback below if table is not created yet.

export interface AppChangelogEntry {
  version: string;
  versionCode: number;
  date: string;
  dateHi: string;
  titleEn: string;
  titleHi: string;
  highlightsEn: string[];
  highlightsHi: string[];
}

export interface AppReleaseManifest {
  appName: string;
  appNameHi: string;
  packageId: string;
  latestVersion: string;
  versionCode: number;
  releaseChannel: "stable" | "beta";
  releaseDate: string;
  releaseDateHi: string;
  apkSizeLabel: string;
  minAndroid: string;
  minSdk: number;
  architecture: string;
  /**
   * Direct HTTPS link to the signed release APK.
   * Examples:
   *  - "/downloads/hindi-bhajan-manjari-v1.0.0.apk" (hosted directly on your VPS/public folder)
   *  - "https://github.com/<owner>/<repo>/releases/download/v1.0.0/hindi-bhajan-manjari-v1.0.0.apk"
   *  - "https://cdn.hindibhajanmanjari.com/app/hindi-bhajan-manjari-v1.0.0.apk"
   *
   * Leave as empty string "" while the first signed release APK is being finalized;
   * the page will show a clear release-status drawer instead of a broken 404 download.
   */
  apkDownloadUrl: string;
  /**
   * SHA-256 checksum of the signed release APK (generate with: `certutil -hashfile app.apk SHA256`).
   */
  sha256: string;
  downloadPageUrl: string;
  isMandatoryUpdate: boolean;
  changelog: AppChangelogEntry[];
}

export const APP_RELEASE: AppReleaseManifest = {
  appName: "Hindi Bhajan Manjari",
  appNameHi: "हिंदी भजन मंजरी",
  packageId: "com.nvsict06.bhajanmanjariapp",
  latestVersion: "1.0.0",
  versionCode: 1,
  releaseChannel: "stable",
  releaseDate: "November 2026",
  releaseDateHi: "नवंबर 2026",
  apkSizeLabel: "28 MB",
  minAndroid: "Android 8.0 (Oreo) or higher",
  minSdk: 26,
  architecture: "Universal (arm64-v8a, armeabi-v7a)",
  // Drop your signed release APK at public/downloads/hindi-bhajan-manjari-latest.apk
  // (or paste a GitHub Releases / Cloudflare R2 direct link) and update sha256 below.
  apkDownloadUrl:
    process.env.NEXT_PUBLIC_ANDROID_APK_URL || "",
  sha256:
    process.env.NEXT_PUBLIC_ANDROID_APK_SHA256 ||
    "Will be published alongside the signed v1.0.0 release APK",
  downloadPageUrl: "https://www.hindibhajanmanjari.com/app",
  isMandatoryUpdate: false,
  changelog: [
    {
      version: "1.0.0",
      versionCode: 1,
      date: "November 2026",
      dateHi: "नवंबर 2026",
      titleEn: "Initial Official Android Release",
      titleHi: "पहला आधिकारिक एंड्रॉइड संस्करण",
      highlightsEn: [
        "11 Indian scripts (Devanagari, Hinglish, Gurmukhi, Gujarati, Bengali, Assamese, Odia, Tamil, Telugu, Kannada, Malayalam) with zero-clipping Indic typography",
        "100% offline Sangrah with automatic 2-device cloud sync",
        "Dedicated Artists directory with singer & lyricist discographies",
        "Festival Special Mode powered by built-in 2026–2030 IST Panchang",
        "Smart Morning & Sandhya Aarti local devotional reminders",
        "Pooja Sandhya Dark Mode, Tap-to-Meaning Shabdkosh, and Suvichar Status Card studio",
      ],
      highlightsHi: [
        "11 भारतीय लिपियों में भजन पाठ (देवनागरी, Hinglish, पंजाबी, गुजराती, बांग्ला, उड़िया, तमिल, तेलुगु, कन्नड़, मलयालम)",
        "100% ऑफ़लाइन संग्रह और 2 डिवाइस तक स्वतः क्लाउड सिंक",
        "नया समर्पित 'कलाकार (Artists)' टैब — गायक व गीतकार के अनुसार भजन सूची",
        "त्योहार विशेष मोड (2026–2030 पंचांग व एकादशी के साथ स्वतः बदलती होम थीम)",
        "सुबह व संध्या आरती के शांत दैनिक भक्ति रिमाइंडर",
        "पूजा संध्या डार्क मोड, शब्दार्थ शब्दकोश और सुविचार कार्ड स्टूडियो",
      ],
    },
  ],
};

/**
 * Loads the live Android APK release manifest from Supabase `app_release_config`
 * (managed directly from `/admin/app-manager`), falling back cleanly to `APP_RELEASE`
 * if the table is not yet created or unreachable.
 */
export async function getLiveAppRelease(): Promise<AppReleaseManifest> {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return APP_RELEASE;

    const sb = createClient(url, key, { auth: { persistSession: false } });
    const { data, error } = await sb
      .from("app_release_config")
      .select("*")
      .eq("id", "android_main")
      .maybeSingle();

    if (error || !data) return APP_RELEASE;

    const parsedChangelog =
      Array.isArray(data.changelog) && data.changelog.length > 0
        ? (data.changelog as AppChangelogEntry[])
        : APP_RELEASE.changelog;

    return {
      ...APP_RELEASE,
      latestVersion: data.latest_version || APP_RELEASE.latestVersion,
      versionCode: Number(data.version_code) || APP_RELEASE.versionCode,
      releaseChannel:
        data.release_channel === "beta" ? "beta" : "stable",
      releaseDate: data.release_date || APP_RELEASE.releaseDate,
      releaseDateHi: data.release_date_hi || APP_RELEASE.releaseDateHi,
      apkSizeLabel: data.apk_size_label || APP_RELEASE.apkSizeLabel,
      minAndroid: data.min_android || APP_RELEASE.minAndroid,
      minSdk: Number(data.min_sdk) || APP_RELEASE.minSdk,
      architecture: data.architecture || APP_RELEASE.architecture,
      apkDownloadUrl:
        typeof data.apk_download_url === "string" && data.apk_download_url.trim()
          ? data.apk_download_url.trim()
          : APP_RELEASE.apkDownloadUrl,
      sha256:
        typeof data.sha256 === "string" && data.sha256.trim()
          ? data.sha256.trim()
          : APP_RELEASE.sha256,
      isMandatoryUpdate: Boolean(data.is_mandatory_update),
      changelog: parsedChangelog,
    };
  } catch {
    return APP_RELEASE;
  }
}
