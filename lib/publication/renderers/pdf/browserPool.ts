// ==========================================
// 🌟 SERVER-SIDE BROWSER POOL (Production Grade Singleton)
// ==========================================
import puppeteer, { Browser } from 'puppeteer';

let browserInstance: Browser | null = null;
let idleTimeout: NodeJS.Timeout | null = null;

// अगर 3 मिनट (180 सेकंड) तक कोई नया PDF रिक्वेस्ट नहीं आता, तो ब्राउज़र को बंद कर देंगे ताकि RAM फ्री हो सके।
const BROWSER_IDLE_TIMEOUT_MS = 180000; 

/**
 * ब्राउज़र को सुरक्षित रूप से बंद करने का फंक्शन (Memory Leak से बचने के लिए)
 */
async function cleanupBrowser() {
  if (browserInstance) {
    try {
      console.log('🧹 [Browser Pool] Idle timeout reached. Closing Chromium to free up RAM...');
      await browserInstance.close();
    } catch (e) {
      console.error('⚠️ [Browser Pool] Error closing browser:', e);
    } finally {
      browserInstance = null;
    }
  }
}

/**
 * Idle Timer को रिसेट करता है (ताकि जब काम चल रहा हो तो ब्राउज़र बंद न हो)
 */
function resetIdleTimer() {
  if (idleTimeout) clearTimeout(idleTimeout);
  idleTimeout = setTimeout(cleanupBrowser, BROWSER_IDLE_TIMEOUT_MS);
}

/**
 * मौजूदा ब्राउज़र इंस्टेंस लौटाता है या नया लॉन्च करता है।
 * VPS (Linux) और लोकल विकास दोनों के लिए सुरक्षित Flags।
 */
export async function getBrowserInstance(): Promise<Browser> {
  
  // 1. अगर ब्राउज़र पहले से है, तो चेक करें कि क्या वो सच में काम कर रहा है
  if (browserInstance && browserInstance.connected) {
    try {
      // एक डमी पेज खोलकर चेक करें कि ब्राउज़र जिंदा है (Zombie प्रोसेस से बचाव)
      const testPage = await browserInstance.newPage();
      await testPage.close();
      
      resetIdleTimer(); // टाइमर रिसेट करें क्योंकि ब्राउज़र अभी इस्तेमाल हो रहा है
      return browserInstance;
    } catch (e) {
      console.log('⚠️ [Browser Pool] Browser connection lost or crashed. Launching a new one...');
      browserInstance = null; // अगर क्रैश हो गया है, तो इसे null करें ताकि नया बन सके
    }
  }

  // 2. नया ब्राउज़र लॉन्च करें (Max Optimized Flags के साथ)
  console.log('🚀 [Browser Pool] Launching new Chromium instance...');
  browserInstance = await puppeteer.launch({
    headless: true, // नया Headless मोड
    executablePath: process.env.NODE_ENV === 'production' ? '/usr/bin/chromium-browser' : undefined,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage', // Docker/VPS के लिए बहुत ज़रूरी (RAM crash रोकता है)
      '--disable-gpu',
      '--font-render-hinting=medium',
      
      // 🌟 NEW: Production Grade Optimization Flags
      '--disable-extensions',
      '--no-zygote',            // ज़ॉम्बी प्रोसेस बनने से रोकता है
      '--single-process',       // कम RAM इस्तेमाल करता है
      '--disable-background-networking',
      '--disable-default-apps',
      '--disable-sync',
      '--hide-scrollbars',
      '--metrics-recording-only',
      '--mute-audio',
      '--no-first-run',
    ],
  });

  resetIdleTimer(); // पहली बार टाइमर स्टार्ट करें
  return browserInstance;
}