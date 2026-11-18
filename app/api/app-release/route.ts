import { NextResponse } from "next/server";
import { APP_RELEASE } from "@/lib/appRelease";

export const revalidate = 300; // 5-minute edge cache

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
  return NextResponse.json(
    {
      appName: APP_RELEASE.appName,
      packageId: APP_RELEASE.packageId,
      latestVersion: APP_RELEASE.latestVersion,
      versionCode: APP_RELEASE.versionCode,
      releaseChannel: APP_RELEASE.releaseChannel,
      releaseDate: APP_RELEASE.releaseDate,
      apkSizeLabel: APP_RELEASE.apkSizeLabel,
      minSdk: APP_RELEASE.minSdk,
      apkDownloadUrl: APP_RELEASE.apkDownloadUrl || null,
      downloadPageUrl: APP_RELEASE.downloadPageUrl,
      sha256: APP_RELEASE.sha256,
      isMandatoryUpdate: APP_RELEASE.isMandatoryUpdate,
      latestNotesEn: APP_RELEASE.changelog[0]?.highlightsEn || [],
      latestNotesHi: APP_RELEASE.changelog[0]?.highlightsHi || [],
    },
    {
      status: 200,
      headers: {
        ...CORS_HEADERS,
        "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
      },
    },
  );
}
