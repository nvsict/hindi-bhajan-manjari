// ==========================================
// 🌟 SERVER-SIDE BROWSER POOL (Singleton)
// ==========================================
import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;

/**
 * मौजूदा ब्राउज़र इंस्टेंस लौटाता है या नया लॉन्च करता है।
 * VPS (Linux) और लोकल विकास दोनों के लिए सुरक्षित Flags।
 */
export async function getBrowserInstance(): Promise<Browser> {
  // 🌟 FIX: Puppeteer के नए वर्जन में isConnected() फंक्शन नहीं, बल्कि 'connected' प्रॉपर्टी होती है
  if (browserInstance && browserInstance.connected) {
    return browserInstance;
  }

  browserInstance = await puppeteer.launch({
    headless: true,
    // 🌟 FIX: VPS पर सिस्टम का Chromium यूज़ करेगा, और लोकल कंप्यूटर पर डिफ़ॉल्ट Chrome
    executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/chromium-browser' : undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
      '--font-render-hinting=medium',
    ],
  });

  return browserInstance;
}