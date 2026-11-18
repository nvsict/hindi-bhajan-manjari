import type { Metadata } from "next";
import { APP_RELEASE, getLiveAppRelease } from "@/lib/appRelease";
import AppStoreClient from "./AppStoreClient";

export const revalidate = 60; // Auto-refresh within 60s when updated from /admin/app-manager

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.hindibhajanmanjari.com";
const PAGE_URL = `${SITE_URL}/app`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `Download Hindi Bhajan Manjari Android App (v${APP_RELEASE.latestVersion} APK)`,
  description:
    "Download the official Hindi Bhajan Manjari Android APK directly from hindibhajanmanjari.com. Read authentic Hindi Bhajans, Aartis, Chalisas & Mantras offline in 11 Indian scripts with Dark Mode, Artists directory, and Festival Mode.",
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    type: "website",
    locale: "hi_IN",
    url: PAGE_URL,
    siteName: "Hindi Bhajan Manjari",
    title: `Hindi Bhajan Manjari — Official Android App (v${APP_RELEASE.latestVersion})`,
    description:
      "Official signed Android APK for daily Bhajans, Aartis, Chalisas & Mantras in 11 Indian scripts. Works 100% offline with 2-device cloud sync.",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Hindi Bhajan Manjari Official Android App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Hindi Bhajan Manjari Android App (v${APP_RELEASE.latestVersion} APK)`,
    description:
      "Download the official signed Android APK directly from hindibhajanmanjari.com — offline reading, 11 Indian scripts, Pooja Sandhya Dark Mode.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
};

export default async function AppDistributionPage() {
  const release = await getLiveAppRelease();

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: release.appName,
    alternateName: release.appNameHi,
    operatingSystem: "Android 8.0+",
    applicationCategory: "LifestyleApplication",
    softwareVersion: release.latestVersion,
    fileSize: release.apkSizeLabel,
    url: PAGE_URL,
    downloadUrl: release.apkDownloadUrl || PAGE_URL,
    image: `${SITE_URL}/images/app/app-icon.png`,
    publisher: {
      "@type": "Organization",
      name: "Hindi Bhajan Manjari",
      url: SITE_URL,
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
      description: "Free download with complimentary trial and affordable devotional passes",
    },
    featureList: release.changelog[0]?.highlightsEn.join("; "),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareSchema).replace(/</g, "\\u003c"),
        }}
      />
      <AppStoreClient release={release} />
    </>
  );
}
