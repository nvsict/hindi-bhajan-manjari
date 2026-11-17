import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Lightweight Cashfree v3 Hosted Checkout Bridge for React Native WebView.
 * Auto-launches Cashfree checkout and notifies the React Native WebView when finished.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const done = searchParams.get("done");
  const orderId = (searchParams.get("order_id") || "").replace(/[^A-Za-z0-9_-]/g, "");
  const sessionId = (searchParams.get("session_id") || "").replace(/[^A-Za-z0-9_-]/g, "");
  const mode = searchParams.get("mode") === "production" ? "production" : "sandbox";

  if (done === "1") {
    const doneHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>भुगतान सत्यापन</title>
  <style>
    body { margin:0; font-family:system-ui,-apple-system,sans-serif; background:#fffdfa; color:#111827; display:flex; align-items:center; justify-content:center; min-height:100vh; text-align:center; padding:24px; }
    .box { max-width:340px; }
    .dot { width:44px; height:44px; border:4px solid #fed7aa; border-top-color:#ea580c; border-radius:50%; margin:0 auto 16px; animation:spin 0.9s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    h2 { margin:0 0 8px; font-size:20px; }
    p { margin:0; color:#4b5563; font-size:14px; line-height:1.5; }
  </style>
</head>
<body>
  <div class="box">
    <div class="dot"></div>
    <h2>भुगतान की पुष्टि हो रही है...</h2>
    <p>कृपया प्रतीक्षा करें, आपकी सदस्यता सक्रिय की जा रही है।</p>
  </div>
  <script>
    (function() {
      try {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: "PAYMENT_RETURN", orderId: "${orderId}" }));
        }
      } catch (e) {}
    })();
  </script>
</body>
</html>`;
    return new Response(doneHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  const checkoutHtml = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>Hindi Bhajan Manjari — सुरक्षित भुगतान</title>
  <script src="https://sdk.cashfree.com/js/v3/cashfree.js"></script>
  <style>
    body { margin:0; font-family:system-ui,-apple-system,sans-serif; background:#fffdfa; color:#111827; display:flex; align-items:center; justify-content:center; min-height:100vh; text-align:center; padding:24px; }
    .dot { width:40px; height:40px; border:4px solid #fed7aa; border-top-color:#ea580c; border-radius:50%; margin:0 auto 14px; animation:spin 0.9s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    p { color:#4b5563; font-size:14px; }
  </style>
</head>
<body>
  <div>
    <div class="dot"></div>
    <p>सुरक्षित भुगतान पृष्ठ खुल रहा है...</p>
  </div>
  <script>
    window.addEventListener("load", function() {
      try {
        var cashfree = Cashfree({ mode: "${mode}" });
        cashfree.checkout({
          paymentSessionId: "${sessionId}",
          redirectTarget: "_self"
        });
      } catch (err) {
        document.body.innerHTML = "<p style='color:#dc2626'>भुगतान पृष्ठ लोड नहीं हो सका। कृपया पुनः प्रयास करें।</p>";
      }
    });
  </script>
</body>
</html>`;

  return new Response(checkoutHtml, {
    headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
  });
}
