import { NextResponse } from "next/server";
import { getLiveAppRelease } from "@/lib/appRelease";

export const revalidate = 60; // 1-minute edge cache (revalidated immediately on /admin/app-manager save)

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * Public release manifest consumed by the Android app's in-app update checker
 * to detect newer signed APK versions distributed via hindibhajanmanjari.com/app.
 */
export async function GET() {
  const release = await getLiveAppRelease();
  return NextResponse.json(
    {
      appName: release.appName,
      packageId: release.packageId,
      latestVersion: release.latestVersion,
      versionCode: release.versionCode,
      releaseChannel: release.releaseChannel,
      releaseDate: release.releaseDate,
      apkSizeLabel: release.apkSizeLabel,
      minSdk: release.minSdk,
      apkDownloadUrl: release.apkDownloadUrl || null,
      downloadPageUrl: release.downloadPageUrl,
      sha256: release.sha256,
      isMandatoryUpdate: release.isMandatoryUpdate,
      latestNotesEn: release.changelog[0]?.highlightsEn || [],
      latestNotesHi: release.changelog[0]?.highlightsHi || [],
    },
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
