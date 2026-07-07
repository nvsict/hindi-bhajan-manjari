import { NextResponse } from "next/server";

export async function GET() {
  // 🌟 EZOIC ADS.TXT MANAGER REDIRECT
  // यह कोड आपकी वेबसाइट के /ads.txt ट्रैफिक को सीधे Ezoic के मैनेजर पर भेज देगा
  return NextResponse.redirect(
    "https://srv.adstxtmanager.com/19390/hindibhajanmanjari.com", 
    301 // 301 Permanent Redirect
  );
}