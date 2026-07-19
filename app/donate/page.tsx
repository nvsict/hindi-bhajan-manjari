"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { toJpeg } from 'html-to-image';
import {
  FaShieldAlt, FaServer, FaHeart,
  FaCheckCircle, FaBookOpen, FaBan, FaOm, FaDownload, FaCloudUploadAlt, FaWhatsapp
} from 'react-icons/fa';
import { FaLock } from 'react-icons/fa6';
import { supabase } from '@/utils/supabase';

type Particle = { id: number; x: number; size: number; duration: number; delay: number; opacity: number };
type PaymentStep = 'DONATION' | 'DETAILS' | 'CERTIFICATE';

const PRESET_AMOUNTS = [21, 51, 101, 251, 501, 1100];
const MONTHLY_GOAL = 5000;
const BASE_RAISED = 0;
const BASE_COUNT = 0;

const OmSymbol = () => (
  <svg viewBox="0 0 60 60" fill="currentColor" className="w-full h-full">
    <text x="50%" y="58%" dominantBaseline="middle" textAnchor="middle" fontSize="48" className="font-noto-serif font-bold">ॐ</text>
  </svg>
);

const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-4">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-orange-400/60 dark:to-orange-500/40" />
    <svg width="14" height="14" viewBox="0 0 14 14" className="text-orange-500 dark:text-orange-400 shrink-0">
      <rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="currentColor" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-orange-400/60 dark:to-orange-500/40" />
  </div>
);

const BorderCorner = ({ className }: { className: string }) => (
  <svg width="28" height="28" viewBox="0 0 28 28" className={`absolute text-orange-500/50 dark:text-orange-500/30 ${className}`}>
    <path d="M2 26 L2 2 L26 2" fill="none" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="2" cy="2" r="2.5" fill="currentColor" />
  </svg>
);

function FloatingParticles() {
  const [particles, setParticles] = useState<Particle[]>([]);
  useEffect(() => {
    setParticles(
      Array.from({ length: 15 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        size: 4 + Math.random() * 8,
        duration: 12 + Math.random() * 16,
        delay: Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.35,
      }))
    );
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute animate-float-up"
          style={{
            left: `${p.x}%`, bottom: '-20px', width: `${p.size}px`, height: `${p.size}px`,
            opacity: p.opacity, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
          }}
        >
          <svg viewBox="0 0 10 14" className="text-orange-400 dark:text-orange-500 w-full h-full drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]">
            <ellipse cx="5" cy="10" rx="4" ry="3" fill="currentColor" opacity="0.6" />
            <path d="M5 10 Q3 5 5 2 Q7 5 5 10Z" fill="#FCD34D" />
          </svg>
        </div>
      ))}
    </div>
  );
}

function MonthlyGoal({ currentRaised, supporterCount }: { currentRaised: number, supporterCount: number }) {
  const pct = Math.min(100, Math.round((currentRaised / MONTHLY_GOAL) * 100));
  return (
    <div className="relative bg-white/60 dark:bg-white/[0.02] border border-orange-200/60 dark:border-white/10 rounded-2xl p-6 mb-10 overflow-hidden shadow-sm backdrop-blur-sm">
      <BorderCorner className="top-2 left-2" />
      <BorderCorner className="top-2 right-2 scale-x-[-1]" />
      <BorderCorner className="bottom-2 left-2 scale-y-[-1]" />
      <BorderCorner className="bottom-2 right-2 scale-[-1]" />
      <div className="flex justify-between items-baseline mb-3 relative z-10">
        <p className="text-orange-800 dark:text-orange-600 text-sm font-bold tracking-wide uppercase">इस माह का सर्वर लक्ष्य</p>
        <p className="text-orange-900 dark:text-orange-600 text-sm font-black transition-all duration-500">
          ₹{currentRaised.toLocaleString('hi-IN')} / ₹{MONTHLY_GOAL.toLocaleString('hi-IN')}
        </p>
      </div>
      <div className="h-3.5 bg-orange-100/50 dark:bg-gray-800/80 rounded-full overflow-hidden border border-orange-200/50 dark:border-gray-700 relative z-10 shadow-inner">
        <div className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 ease-out relative" style={{ width: `${pct}%` }}>
          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-md shadow-orange-500/50 scale-[1.15]" />
        </div>
      </div>
      <div className="flex justify-between mt-3 text-xs text-orange-800/70 dark:text-orange-400/70 font-medium relative z-10">
        <span className="transition-all duration-500">{pct}% पूर्ण</span>
        <span className="flex items-center gap-1 transition-all duration-500">
          <FaHeart className="text-red-500 animate-pulse" /> {supporterCount} भक्तों का सहयोग प्राप्त
        </span>
      </div>
    </div>
  );
}

// ─── verification result type ───
type VerifyResult = { paid: boolean; paymentId?: string; supporterId?: string | null; amount?: number };

export default function DonatePage() {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('DONATION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmittingDetails, setIsSubmittingDetails] = useState(false);
  const [cancelToast, setCancelToast] = useState(false);
  const [isVerifyingReturn, setIsVerifyingReturn] = useState(false); // 🌟 NEW

  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  const [dbRecordId, setDbRecordId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const [supporterName, setSupporterName] = useState('');
  const [supporterMessage, setSupporterMessage] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [currentRaised, setCurrentRaised] = useState(BASE_RAISED);
  const [supporterCount, setSupporterCount] = useState(BASE_COUNT);

  const certificateRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveAmount = amount > 0 ? amount : 0;

  // 🌟 FIXED: single call to Razorpay via /verify, always trusted as the source
  // of truth for both "did it succeed" AND "how much" — never relies on a
  // redirect's own status flag or on localStorage alone for the amount.
  const verifyOrder = useCallback(async (orderId: string): Promise<VerifyResult> => {
    try {
      const res = await fetch(`/api/razorpay/verify?order_id=${orderId}`);
      return await res.json();
    } catch (err) {
      console.error("Verify call failed", err);
      return { paid: false };
    }
  }, []);

  // Retries a few times with a short delay — a genuinely successful UPI
  // payment can take a few seconds to show as "captured" on Razorpay's side
  // after the app-switch return, so a single failed check should not be
  // treated as a real failure.
  const verifyWithRetry = useCallback(async (orderId: string, attempts = 3): Promise<VerifyResult> => {
    for (let i = 0; i < attempts; i++) {
      const result = await verifyOrder(orderId);
      if (result.paid) return result;
      if (i < attempts - 1) await new Promise(r => setTimeout(r, 2000));
    }
    return { paid: false };
  }, [verifyOrder]);

  const applyPaidResult = useCallback((result: VerifyResult) => {
    setPaymentId(result.paymentId ?? null);
    setDbRecordId(result.supporterId ?? null);
    if (result.amount) setAmount(result.amount); // 🌟 authoritative amount from Razorpay
    setPaymentDate(new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
    setPaymentStep('DETAILS');
  }, []);

  // Checks localStorage for a pending order left by handlePayClick — used
  // for the bfcache/visibility-return path, not the URL-redirect path.
  const recoverFromLocalStorage = useCallback(async () => {
    const raw = localStorage.getItem('hbm_pending_order');
    if (!raw) return;
    const pending = JSON.parse(raw);
    if (Date.now() - pending.ts > 30 * 60 * 1000) {
      localStorage.removeItem('hbm_pending_order');
      return;
    }
    const result = await verifyOrder(pending.orderId);
    if (result.paid) {
      applyPaidResult(result);
    }
    localStorage.removeItem('hbm_pending_order');
  }, [verifyOrder, applyPaidResult]);

  // 1. Fetch real stats + handle redirect return + handle localStorage fallback, on mount
  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const { data, error } = await supabase.from('supporters').select('amount').eq('status', 'completed');
        if (data && !error) {
          const realTotal = data.reduce((sum, row) => sum + (row.amount || 0), 0);
          setCurrentRaised(BASE_RAISED + realTotal);
          setSupporterCount(BASE_COUNT + data.length);
        }
      } catch (err) {
        console.error("Failed to fetch real stats silently", err);
      }
    };
    fetchRealStats();

    const params = new URLSearchParams(window.location.search);
    const orderId = params.get('order_id');
    const status = params.get('status'); // only meaningful when orderId is absent (see callback route)

    if (orderId) {
      // 🌟 Always independently verify — never trust a redirect flag alone
      setIsVerifyingReturn(true);
      verifyWithRetry(orderId).then((result) => {
        window.history.replaceState({}, '', '/donate');
        localStorage.removeItem('hbm_pending_order');
        setIsVerifyingReturn(false);
        if (result.paid) {
          applyPaidResult(result);
        } else {
          alert("पेमेंट की पुष्टि नहीं हो पाई। अगर आपके खाते से पैसा कटा है, तो कृपया कुछ मिनट बाद पेज दोबारा खोलें — हम स्वतः जांच लेंगे। असुविधा के लिए क्षमा करें।");
        }
      });
    } else if (status === 'failed') {
      // No order_id at all means the order was never created — genuinely nothing to verify
      alert("पेमेंट शुरू नहीं हो पाया। कृपया पुनः प्रयास करें।");
      window.history.replaceState({}, '', '/donate');
    } else {
      recoverFromLocalStorage();
    }
  }, [verifyWithRetry, applyPaidResult, recoverFromLocalStorage]);

  // 2. Stuck-button fix (bfcache / visibility return without a URL redirect)
  useEffect(() => {
    const resetAndRecover = () => {
      setIsSubmitting(false);
      recoverFromLocalStorage();
    };
    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) resetAndRecover();
    };
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') resetAndRecover();
      document.body.classList.toggle('paused-animations', document.hidden);
    };
    window.addEventListener('pageshow', handlePageShow);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      window.removeEventListener('pageshow', handlePageShow);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [recoverFromLocalStorage]);

  const handlePreset = (val: number) => {
    if (navigator.vibrate) navigator.vibrate(20);
    setAmount(val);
    setCustomAmount('');
  };

  const handleCustom = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setCustomAmount(v);
    const n = Number(v);
    setAmount(v && !isNaN(n) && n > 0 ? n : 0);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayClick = async () => {
    setIsSubmitting(true); // shows only during script load + order creation — genuinely brief
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("पेमेंट गेटवे लोड नहीं हो पा रहा है। कृपया अपना इंटरनेट कनेक्शन चेक करें।");
      setIsSubmitting(false);
      return;
    }

    try {
      const orderResponse = await fetch('/api/razorpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: effectiveAmount }),
      });
      const orderData = await orderResponse.json();
      if (!orderData.id) throw new Error("Order creation failed");

      localStorage.setItem('hbm_pending_order', JSON.stringify({
        orderId: orderData.id,
        amount: effectiveAmount,
        ts: Date.now(),
      }));

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Hindi Bhajan Manjari",
        description: "सनातन धर्म के लिए सहयोग राशि",
        image: "https://www.hindibhajanmanjari.com/logo.png",
        order_id: orderData.id,
        theme: { color: "#ea580c" },
        redirect: true,
        callback_url: `${window.location.origin}/api/razorpay/callback`,
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            localStorage.removeItem('hbm_pending_order');
            setCancelToast(true);
            setTimeout(() => setCancelToast(false), 4000);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        // 🌟 Don't remove hbm_pending_order here — Razorpay's client-side
        // "failed" event can fire even when the payment later settles as
        // captured (e.g. a UPI confirmation that arrives after a timeout).
        // Let the next verify pass be the judge, not this event alone.
        setIsSubmitting(false);
      });
      rzp.open();
      setIsSubmitting(false); // 🌟 hand off — Razorpay's own UI is now the "something is happening" signal

    } catch (error: any) {
      console.error("Donation processing error:", error);
      alert("पेमेंट सर्वर से संपर्क नहीं हो पाया। कृपया थोड़ी देर बाद प्रयास करें।");
      setIsSubmitting(false);
    }
  };

  const handleSubmitDetails = async (isPublic: boolean) => {
    setIsSubmittingDetails(true);
    try {
      let photoUrl = null;
      if (isPublic && photoFile) {
        const fileExt = photoFile.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('supporter_photos').upload(fileName, photoFile);
        if (!uploadError) {
          const { data } = supabase.storage.from('supporter_photos').getPublicUrl(fileName);
          photoUrl = data.publicUrl;
        }
      }

      let currentRecordId = dbRecordId;
      if (!currentRecordId && paymentId) {
        const { data } = await supabase.from('supporters').select('id').eq('razorpay_payment_id', paymentId).single();
        if (data) currentRecordId = data.id;
      }

      if (currentRecordId) {
        await supabase.from('supporters').update({
          name: isPublic ? supporterName.trim() : null,
          message: isPublic ? supporterMessage.trim() : null,
          photo_url: photoUrl,
          is_anonymous: !isPublic
        }).eq('id', currentRecordId);
      } else if (paymentId) {
        await supabase.from('supporters').insert([{
          amount: effectiveAmount,
          name: isPublic ? supporterName.trim() : null,
          message: isPublic ? supporterMessage.trim() : null,
          photo_url: photoUrl,
          is_anonymous: !isPublic,
          status: 'completed',
          razorpay_payment_id: paymentId
        }]);
      }
    } catch (err) {
      console.error("Failed to update public details", err);
    }
    setPaymentStep('CERTIFICATE');
    setIsSubmittingDetails(false);
  };

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;
    if (navigator.vibrate) navigator.vibrate(30);
    try {
      const dataUrl = await toJpeg(certificateRef.current, { quality: 0.95, pixelRatio: 3, backgroundColor: "#fffcf5" });
      const link = document.createElement('a');
      link.download = `Bhajan_Manjari_Certificate_${Date.now()}.jpg`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Failed to generate certificate:", err);
      alert("प्रमाण-पत्र डाउनलोड करने में समस्या आई।");
    }
  };

  // 🌟 NEW: brief full-page state while verifying a redirect return, so the
  // user isn't looking at the plain donation form for a couple of seconds
  // wondering if anything happened.
  if (isVerifyingReturn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 dark:bg-[#0c0804] px-4 text-center font-hindi">
        <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mb-6" />
        <p className="text-lg font-bold text-orange-800 dark:text-orange-300">आपके पेमेंट की पुष्टि की जा रही है...</p>
        <p className="text-sm text-gray-500 mt-2">कृपया पेज बंद न करें</p>
      </div>
    );
  }

  if (paymentStep === 'DETAILS') {
    return (
      <div className="min-h-screen !pt-24 !pb-16 flex flex-col items-center justify-start bg-orange-50 dark:bg-[#0c0804] px-4 font-hindi overflow-x-hidden">
        <style>{`
          @keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } }
          .animate-bounce-slow { animation: bounce-slow 2.5s ease-in-out infinite; }
        `}</style>
        <div className="w-20 h-20 text-green-500 mb-6 animate-bounce-slow drop-shadow-lg mx-auto">
          <FaCheckCircle className="w-full h-full" />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-orange-900 dark:text-orange-100 mb-3 font-noto-serif text-center">🙏 सहयोग प्राप्त हुआ!</h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed mb-10 text-center font-medium">
          आपका ₹{effectiveAmount} का पेमेंट सफलतापूर्वक प्राप्त हो गया है। प्रभु श्री राम आप पर कृपा बनाए रखें।
        </p>
        <div className="bg-white dark:bg-[#111] p-6 md:p-10 rounded-3xl shadow-xl w-full max-w-xl border border-orange-100 dark:border-white/10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">क्या आप अपना नाम 'भक्त सूची' में शामिल करना चाहते हैं?</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">यह जानकारी हमारी Supporters Wall पर दिखाई जाएगी।</p>
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">पूरा नाम <span className="text-red-500">*</span></label>
              <input type="text" placeholder="e.g. Mohit Tarkar" value={supporterName} onChange={(e) => setSupporterName(e.target.value)}
                className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-orange-500 rounded-xl outline-none font-medium" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">एक छोटा संदेश (वैकल्पिक)</label>
              <textarea placeholder="e.g. जय श्री राम! माता-पिता के आशीर्वाद से..." value={supporterMessage} onChange={(e) => setSupporterMessage(e.target.value)}
                maxLength={100} rows={2} className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:border-orange-500 rounded-xl outline-none font-medium resize-none" />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">अपनी फोटो अपलोड करें (वैकल्पिक)</label>
              <label className="flex flex-col items-center justify-center w-full min-h-[140px] border-2 border-dashed border-gray-300 dark:border-gray-700 hover:border-orange-400 rounded-xl cursor-pointer bg-gray-50/50 dark:bg-gray-800/30 transition-colors p-4">
                {photoPreview ? (
                  <div className="flex flex-col items-center">
                    <img src={photoPreview} alt="Preview" className="w-20 h-20 rounded-full object-cover border-4 border-orange-200 mb-2" />
                    <span className="text-orange-600 font-bold text-xs">फोटो बदलें</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center text-gray-500">
                    <FaCloudUploadAlt className="w-8 h-8 mb-2 text-gray-400" />
                    <span className="font-bold text-sm">Click to upload photo</span>
                  </div>
                )}
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
              </label>
            </div>
            <div className="pt-4 flex flex-col gap-3">
              <button onClick={() => handleSubmitDetails(true)} disabled={isSubmittingDetails || !supporterName.trim()}
                className="w-full py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md transition-all flex justify-center items-center gap-2">
                {isSubmittingDetails ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'नाम दर्ज़ करें और प्रमाण-पत्र देखें'}
              </button>
              <button onClick={() => handleSubmitDetails(false)} disabled={isSubmittingDetails}
                className="w-full py-3 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold rounded-xl transition-all">
                नहीं, इसे गुप्त दान ही रखें (Skip)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (paymentStep === 'CERTIFICATE') {
    return (
      <div className="min-h-screen !pt-24 !pb-16 flex flex-col items-center justify-start bg-orange-50 dark:bg-[#0c0804] px-4 text-center font-hindi overflow-x-hidden">
        <style>{` .cert-bg { background-image: radial-gradient(circle at 50% 50%, rgba(234,88,12,0.06) 0%, transparent 60%); } `}</style>
        <h1 className="text-3xl md:text-5xl font-black text-orange-900 dark:text-orange-100 mb-3 font-noto-serif">आपका प्रमाण-पत्र तैयार है!</h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed mb-8">इसे डाउनलोड करके अपने परिवार और मित्रों के साथ साझा करें।</p>
        <div className="relative w-full max-w-3xl mx-auto shadow-2xl rounded-sm mb-8 overflow-hidden transform scale-95 md:scale-100">
          <div ref={certificateRef} className="cert-bg bg-[#fffcf5] text-gray-900 p-8 md:p-14 border-[12px] border-double border-orange-300 relative">
            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
              <FaOm className="text-[300px]" />
            </div>
            <div className="relative z-10">
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 text-orange-600"><OmSymbol /></div>
              </div>
              <h2 className="text-3xl md:text-4xl font-black font-noto-serif text-orange-800 tracking-wide uppercase mb-2">भक्ति सहयोग प्रमाण-पत्र</h2>
              <p className="text-sm font-bold text-orange-600 tracking-[0.2em] uppercase mb-8">Hindi Bhajan Manjari</p>
              <p className="text-xl md:text-2xl font-medium leading-relaxed mb-8">
                यह प्रमाणित किया जाता है कि<br />
                <strong className="text-3xl md:text-4xl font-black text-orange-700 block my-4 border-b-2 border-orange-200 inline-block px-8 pb-2">
                  {supporterName.trim() ? supporterName : "एक गुप्त भक्त"}
                </strong><br />
                ने डिजिटल माध्यम से सनातन धर्म और भजनों के प्रसार हेतु<br />
                <strong className="text-2xl font-black text-gray-900">₹{effectiveAmount}</strong> का अमूल्य योगदान दिया है।
              </p>
              <div className="flex items-center justify-center gap-2 mb-12">
                <div className="h-px bg-orange-300 w-16"></div>
                <p className="font-noto-serif text-xl text-orange-800 font-bold">धर्मो रक्षति रक्षितः</p>
                <div className="h-px bg-orange-300 w-16"></div>
              </div>
              <div className="flex justify-between items-end text-left border-t border-orange-200 pt-6">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Payment Mode</p>
                  <p className="text-sm font-mono font-bold text-gray-800">Verified Razorpay Transfer</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-gray-500 uppercase">Date</p>
                  <p className="text-sm font-bold text-gray-800">{paymentDate}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button onClick={downloadCertificate} className="w-full max-w-md px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2">
          <FaDownload /> प्रमाण-पत्र डाउनलोड करें
        </button>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes float-up {
          0% { transform: translateY(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.8; }
          100% { transform: translateY(-100vh) rotate(360deg); opacity: 0; }
        }
        .animate-float-up { animation: float-up linear infinite; }
        .mandala-bg {
          background-image: radial-gradient(circle at 50% 50%, rgba(234,88,12,0.04) 0%, transparent 70%),
            repeating-conic-gradient(from 0deg at 50% 50%, transparent 0deg, transparent 22deg, rgba(234,88,12,0.02) 22deg, rgba(234,88,12,0.02) 24deg);
        }
        .paused-animations .animate-float-up, .paused-animations .animate-pulse { animation-play-state: paused; }
      `}</style>
      {cancelToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-in-bottom">
          <div className="bg-white dark:bg-gray-900 border border-orange-200 dark:border-orange-800/50 shadow-2xl px-6 py-4 rounded-2xl flex items-center gap-3 w-max">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-50 dark:bg-orange-900/30 rounded-full text-orange-500 text-xl shrink-0">🙏</div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200 font-hindi">कोई बात नहीं, आप भविष्य में कभी भी सहयोग कर सकते हैं।</p>
          </div>
        </div>
      )}
      <div className="min-h-screen !pt-24 !pb-20 md:!pb-24 bg-orange-50/40 dark:bg-[#0c0804] relative overflow-hidden transition-colors duration-300 font-hindi">
        <FloatingParticles />
        <div className="pointer-events-none absolute inset-0 mandala-bg z-0" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-orange-500/10 dark:bg-orange-600/10 blur-[120px] z-0" />
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-block relative mb-6">
              <div className="w-20 h-20 mx-auto text-orange-600 dark:text-orange-500 drop-shadow-sm"><OmSymbol /></div>
              <div className="absolute inset-0 rounded-full border border-orange-400/30 dark:border-orange-500/20 scale-110" />
              <div className="absolute inset-0 rounded-full border border-orange-400/15 dark:border-orange-500/10 scale-125" />
            </div>
            <p className="text-orange-700 dark:text-orange-500 text-sm font-bold tracking-[0.25em] uppercase mb-3">हिंदी भजन मंजरी</p>
            <h1 className="font-noto-serif text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 leading-tight">धर्म कार्य में अमूल्य सहयोग दें</h1>
            <DiamondDivider />
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed max-w-xl mx-auto mt-4 font-medium">
              इस आध्यात्मिक मंच को <strong className="text-orange-600 dark:text-orange-400">विज्ञापन-मुक्त (Ad-free)</strong> और सुचारु रखने के लिए आपकी ऐच्छिक दक्षिणा अत्यंत महत्वपूर्ण है।
            </p>
          </div>
          <MonthlyGoal currentRaised={currentRaised} supporterCount={supporterCount} />
          <div className="bg-white dark:bg-[#111] rounded-[2rem] shadow-xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-orange-100/50 dark:border-white/10 overflow-hidden mb-16 relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />
            <div className="p-6 md:p-10 border-b border-gray-100 dark:border-white/5 bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-900/10 dark:to-[#111]">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-black flex items-center justify-center shrink-0">1</div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg md:text-xl">सहयोग राशि चुनें</h2>
                <span className="text-gray-500 dark:text-gray-500 text-sm font-medium hidden sm:inline">(शुभ शगुन)</span>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {PRESET_AMOUNTS.map(p => (
                  <button key={p} onClick={() => handlePreset(p)}
                    className={`relative px-5 py-3 rounded-xl font-bold text-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-500 select-none ${amount === p && !customAmount
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 scale-105 border-transparent'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-400 hover:text-orange-600 shadow-sm'
                      }`}>
                    ₹{p}
                    {p === 101 && (
                      <span className="absolute -top-2.5 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full leading-none tracking-wide shadow-sm border border-yellow-200">लोकप्रिय</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500 font-black text-lg pointer-events-none">₹</span>
                  <input ref={inputRef} type="number" min="1" placeholder="अन्य राशि दर्ज करें (Custom Amount)" value={customAmount} onChange={handleCustom}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:bg-white dark:focus:bg-[#111] rounded-xl text-gray-900 dark:text-white font-bold text-base transition-colors outline-none shadow-inner placeholder:font-medium" />
                </div>
              </div>
            </div>
            <div className="p-6 md:p-10 flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-black flex items-center justify-center shrink-0">2</div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg md:text-xl">सुरक्षित पेमेंट करें</h2>
              </div>
              <button onClick={handlePayClick} disabled={effectiveAmount <= 0 || isSubmitting}
                className="w-full max-w-md py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-black text-lg rounded-2xl shadow-md transition-all flex items-center justify-center gap-3 outline-none relative">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">प्रोसेस हो रहा है... <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></span>
                ) : (
                  <>
                    <FaOm className="text-xl" />
                    श्रद्धा भेंट करें {effectiveAmount > 0 ? `(₹${effectiveAmount})` : ''}
                  </>
                )}
              </button>
              <div className="flex flex-col items-center justify-center gap-1.5 mt-5">
                <p className="text-xs font-bold text-orange-700 dark:text-orange-400 mb-2 bg-orange-100 dark:bg-orange-900/30 px-4 py-1.5 rounded-full border border-orange-200 dark:border-orange-800/50">
                  🙏 यह वेबसाइट मोहित तरकर द्वारा व्यक्तिगत रूप से संचालित है।
                </p>
                <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest mt-1">
                  <span className="flex items-center gap-1"><FaLock className="text-green-500" /> 100% Secure</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300" />
                  <span>Powered By Razorpay</span>
                </div>
                <p className="text-[11px] font-medium text-gray-400">UPI, Cards, NetBanking Supported</p>
              </div>
            </div>
          </div>
          <div className="mt-20">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-8 font-noto-serif">आपका सहयोग इन धर्म कार्यों में जाता है:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: <FaServer size={22} />, title: 'सर्वर और तकनीक', text: 'लाखों भक्तों तक वेबसाइट को बिना रुके, तेज़ गति से पहुँचाने के लिए उच्च-गुणवत्ता सर्वर का संचालन।' },
                { icon: <FaBan size={22} />, title: 'विज्ञापन-मुक्त अनुभव', text: 'भजन व आरती के भक्तिमय वातावरण में कष्टप्रद विज्ञापनों का कोई स्थान नहीं।' },
                { icon: <FaBookOpen size={22} />, title: 'नई सामग्री', text: 'नए भजन, चालीसा, स्तोत्र और धार्मिक ग्रंथों को डिजिटल रूप में टाइप कर उपलब्ध कराना।' },
                { icon: <FaOm size={22} />, title: 'सनातन का संरक्षण', text: 'इस अमूल्य ज्ञान को आने वाली पीढ़ियों के लिए सुरक्षित और सुलभ बनाए रखना।' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl flex items-center justify-center mb-4">{item.icon}</div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed font-medium">{item.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-12 text-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border border-orange-100 dark:border-orange-900/30 p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
              <FaHeart className="text-red-500 text-3xl mx-auto mb-5 opacity-80" />
              <p className="font-noto-serif text-2xl md:text-3xl text-orange-800 dark:text-orange-400 mb-4 font-black">"धर्मो रक्षति रक्षितः"</p>
              <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-w-lg mx-auto">
                आपके द्वारा दिया गया प्रत्येक रुपया सनातन धर्म के ज्ञान को डिजिटल जगत में जीवित रखने के हमारे संकल्प को और मजबूत करता है। <br className="hidden md:block" />
                <span className="font-black text-orange-700 dark:text-orange-400 mt-3 inline-block">प्रभु श्री राम आप पर कृपा बनाए रखें 🙏</span>
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}