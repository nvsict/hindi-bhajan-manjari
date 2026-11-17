import { NextRequest } from "next/server";
import { getRazorpayKeyId, getSiteBaseUrl } from "../_lib";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Razorpay Recurring Subscription Standard Checkout Bridge for React Native WebView.
 * Supports UPI AutoPay, Cards & Netbanking, pre-fills customer details, and posts
 * verified payment payload back to the Android WebView.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subId = (searchParams.get("sub_id") || "").replace(/[^A-Za-z0-9_]/g, "");
  const planName = (searchParams.get("plan_name") || "भक्ति पास सदस्यता").slice(0, 80);
  const name = (searchParams.get("name") || "Bhakt").slice(0, 60);
  const phone = (searchParams.get("phone") || "").replace(/[^0-9+]/g, "").slice(0, 15);
  const email = (searchParams.get("email") || "").slice(0, 80);

  const keyId = getRazorpayKeyId();
  const siteUrl = getSiteBaseUrl();

  const html = `<!DOCTYPE html>
<html lang="hi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1" />
  <title>Hindi Bhajan Manjari — सुरक्षित भुगतान</title>
  <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: #fffdfa;
      color: #111827;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      text-align: center;
      padding: 24px;
      box-sizing: border-box;
    }
    .box { max-width: 340px; width: 100%; }
    .dot {
      width: 42px;
      height: 42px;
      border: 4px solid #fed7aa;
      border-top-color: #ea580c;
      border-radius: 50%;
      margin: 0 auto 14px;
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    h2 { margin: 0 0 6px; font-size: 18px; }
    p { margin: 0 0 18px; color: #4b5563; font-size: 13.5px; line-height: 1.5; }
    .btn {
      display: none;
      width: 100%;
      padding: 13px 16px;
      border: none;
      border-radius: 10px;
      background: #ea580c;
      color: #fff;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
    }
  </style>
</head>
<body>
  <div class="box">
    <div id="spinner" class="dot"></div>
    <h2 id="title">सुरक्षित भुगतान खुल रहा है...</h2>
    <p id="desc">Razorpay UPI AutoPay एवं कार्ड भुगतान तैयार किया जा रहा है।</p>
    <button id="retryBtn" class="btn" onclick="openCheckout()">भुगतान पृष्ठ पुनः खोलें</button>
  </div>

  <script>
    var rzpConfig = {
      key: ${JSON.stringify(keyId)},
      subscription_id: ${JSON.stringify(subId)},
      name: "Hindi Bhajan Manjari",
      description: ${JSON.stringify(escapeHtml(planName))},
      image: ${JSON.stringify(`${siteUrl}/logo.png`)},
      prefill: {
        name: ${JSON.stringify(name)},
        contact: ${JSON.stringify(phone)},
        email: ${JSON.stringify(email)}
      },
      theme: { color: "#ea580c" },
      handler: function (response) {
        document.getElementById("title").innerText = "भुगतान की पुष्टि हो रही है...";
        document.getElementById("desc").innerText = "कृपया प्रतीक्षा करें, आपकी सदस्यता सक्रिय की जा रही है।";
        document.getElementById("spinner").style.display = "block";
        document.getElementById("retryBtn").style.display = "none";
        try {
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "RZP_PAYMENT_SUCCESS",
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_subscription_id: response.razorpay_subscription_id || ${JSON.stringify(subId)},
              razorpay_signature: response.razorpay_signature
            }));
          }
        } catch (e) {}
      },
      modal: {
        ondismiss: function () {
          document.getElementById("spinner").style.display = "none";
          document.getElementById("title").innerText = "भुगतान पूरा नहीं हुआ";
          document.getElementById("desc").innerText = "यदि आपने UPI ऐप में भुगतान कर दिया है, तो ऊपर 'सत्यापित करें' दबाएँ या नीचे पुनः प्रयास करें।";
          document.getElementById("retryBtn").style.display = "block";
          try {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "RZP_DISMISSED",
                subscriptionId: ${JSON.stringify(subId)}
              }));
            }
          } catch (e) {}
        }
      }
    };

    function openCheckout() {
      try {
        if (!rzpConfig.subscription_id) {
          throw new Error("Missing subscription_id");
        }
        document.getElementById("spinner").style.display = "block";
        document.getElementById("retryBtn").style.display = "none";
        var rzp = new Razorpay(rzpConfig);
        rzp.on("payment.failed", function (resp) {
          document.getElementById("spinner").style.display = "none";
          document.getElementById("title").innerText = "भुगतान विफल रहा";
          document.getElementById("desc").innerText =
            (resp && resp.error && resp.error.description) ||
            "कृपया पुनः प्रयास करें या दूसरा भुगतान माध्यम चुनें।";
          document.getElementById("retryBtn").style.display = "block";
        });
        rzp.open();
      } catch (err) {
        document.getElementById("spinner").style.display = "none";
        document.getElementById("title").innerText = "भुगतान पृष्ठ लोड नहीं हो सका";
        document.getElementById("desc").innerText = "कृपया नीचे बटन दबाकर पुनः प्रयास करें।";
        document.getElementById("retryBtn").style.display = "block";
      }
    }

    window.addEventListener("load", function () {
      setTimeout(openCheckout, 250);
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
