"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { toJpeg } from 'html-to-image';
import {
  FaServer, FaHeart, FaCheckCircle, FaBookOpen, FaBan, FaOm, 
  FaDownload, FaWhatsapp, FaEnvelope
} from 'react-icons/fa';
import { FaLock } from 'react-icons/fa6';

type Particle = { id: number; x: number; size: number; duration: number; delay: number; opacity: number };
type PaymentStep = 'DONATION' | 'CERTIFICATE';
type VerifyResult = { paid: boolean; paymentId?: string; amount?: number };

const PRESET_AMOUNTS = [21, 51, 101, 251, 501, 1100];
const MONTHLY_GOAL = 5000;

// 🌟 UI Components
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
        id: i, x: Math.random() * 100, size: 4 + Math.random() * 8,
        duration: 12 + Math.random() * 16, delay: Math.random() * 10,
        opacity: 0.15 + Math.random() * 0.35,
      }))
    );
  }, []);
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
      {particles.map((p) => (
        <div key={p.id} className="absolute animate-float-up" style={{
          left: `${p.x}%`, bottom: '-20px', width: `${p.size}px`, height: `${p.size}px`,
          opacity: p.opacity, animationDuration: `${p.duration}s`, animationDelay: `${p.delay}s`,
        }}>
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

// 🌟 Timeout Wrapper (ताकि UI कभी अनिश्चित काल के लिए न लटके)
function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return new Promise((resolve) => {
    let settled = false;
    const timer = setTimeout(() => {
      if (!settled) { settled = true; resolve(fallback); }
    }, ms);
    promise.then((val) => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(val); }
    }).catch(() => {
      if (!settled) { settled = true; clearTimeout(timer); resolve(fallback); }
    });
  });
}

// ─── MAIN PAGE COMPONENT ───
export default function DonatePage() {
  const [paymentStep, setPaymentStep] = useState<PaymentStep>('DONATION');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifyingReturn, setIsVerifyingReturn] = useState(false);
  const [cancelToast, setCancelToast] = useState(false);

  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>('');
  
  const [currentRaised, setCurrentRaised] = useState(0);
  const [supporterCount, setSupporterCount] = useState(0);

  const certificateRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveAmount = amount > 0 ? amount : 0;

  // ─── Verification Logic ───
  const verifyOrder = useCallback(async (orderId: string): Promise<VerifyResult> => {
    try {
      const res = await fetch(`/api/razorpay/verify?order_id=${orderId}`);
      return await res.json();
    } catch { 
      return { paid: false }; 
    }
  }, []);

  const applyPaidResult = useCallback((result: VerifyResult) => {
    if (result.amount) setAmount(result.amount);
    setPaymentDate(new Date().toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }));
    setPaymentStep('CERTIFICATE'); // सीधा सर्टिफिकेट पेज! (कोई फॉर्म नहीं)
  }, []);

  // Fetch initial stats
  useEffect(() => {
    fetch('/api/supporters/stats')
      .then(res => res.json())
      .then(({ totalRaised, supporterCount }) => {
        setCurrentRaised(totalRaised ?? 0);
        setSupporterCount(supporterCount ?? 0);
      }).catch(err => console.error(err));
  }, []);

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

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true);
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ─── Razorpay Payment Flow ───
  const handlePayClick = async () => {
    setIsSubmitting(true);
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      alert("पेमेंट गेटवे लोड नहीं हो पा रहा है। कृपया अपना इंटरनेट कनेक्शन चेक करें।");
      setIsSubmitting(false);
      return;
    }

    try {
      const orderResponse = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: effectiveAmount }),
      });
      const orderData = await orderResponse.json();
      if (!orderData.id) throw new Error("Order creation failed");

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Hindi Bhajan Manjari",
        description: "सनातन धर्म के लिए सहयोग राशि",
        image: "https://www.hindibhajanmanjari.com/logo.png",
        order_id: orderData.id,
        theme: { color: "#ea580c" },
        // 🌟 Razorpay's direct handler is the ONLY verification source now
        handler: async function (response: any) {
          setIsSubmitting(false);
          setIsVerifyingReturn(true); // Show spinner while confirming

          try {
            // Give Razorpay backend 1.5s to sync UPI status
            await new Promise(r => setTimeout(r, 1500));
            const result = await withTimeout(verifyOrder(response.razorpay_order_id), 15000, { paid: false });

            setIsVerifyingReturn(false);
            if (result.paid) {
              applyPaidResult(result);
            } else {
              alert("पेमेंट की पुष्टि नहीं हो पाई। यदि आपका पैसा कट गया है, तो वह 100% सुरक्षित है।");
            }
          } catch (err) {
            setIsVerifyingReturn(false);
            alert("वेरिफिकेशन में समस्या आई। कृपया बाद में जांचें।");
          }
        },
        modal: {
          ondismiss: function () {
            setIsSubmitting(false);
            setCancelToast(true);
            setTimeout(() => setCancelToast(false), 4000);
          }
        }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', function () {
        setIsSubmitting(false);
      });
      rzp.open();
      setIsSubmitting(false); // Hand over control to Razorpay Modal
    } catch (error: any) {
      alert("पेमेंट सर्वर से संपर्क नहीं हो पाया। कृपया थोड़ी देर बाद प्रयास करें।");
      setIsSubmitting(false);
    }
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
      alert("प्रमाण-पत्र डाउनलोड करने में समस्या आई।");
    }
  };

  // ─── SCREEN 1: VERIFYING SPINNER ───
  if (isVerifyingReturn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 dark:bg-[#0c0804] px-4 text-center font-hindi">
        <div className="w-12 h-12 border-4 border-orange-300 border-t-orange-600 rounded-full animate-spin mb-6" />
        <p className="text-lg font-bold text-orange-800 dark:text-orange-300">आपके पेमेंट की पुष्टि की जा रही है...</p>
        <p className="text-sm text-gray-500 mt-2">कृपया पेज बंद न करें</p>
      </div>
    );
  }

  // ─── SCREEN 2: SUCCESS & CERTIFICATE (No more forms!) ───
  if (paymentStep === 'CERTIFICATE') {
    return (
      <div className="min-h-screen !pt-24 !pb-16 flex flex-col items-center justify-start bg-orange-50 dark:bg-[#0c0804] px-4 text-center font-hindi overflow-x-hidden">
        <style>{` .cert-bg { background-image: radial-gradient(circle at 50% 50%, rgba(234,88,12,0.06) 0%, transparent 60%); } `}</style>
        
        <FaCheckCircle className="text-green-500 text-6xl mb-4 animate-bounce" />
        <h1 className="text-3xl md:text-5xl font-black text-orange-900 dark:text-orange-100 mb-3 font-noto-serif">सहयोग प्राप्त हुआ!</h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed mb-8">आपका दान गुप्त रूप से स्वीकार कर लिया गया है।</p>
        
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
                  एक गुप्त भक्त
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
        
        <button onClick={downloadCertificate} className="w-full max-w-md px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95 flex items-center justify-center gap-2 mb-8">
          <FaDownload /> प्रमाण-पत्र डाउनलोड करें
        </button>

        {/* 🌟 Volunteer Section */}
        <div className="w-full max-w-md bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-orange-100 text-left">
          <h3 className="text-xl font-black text-gray-900 dark:text-white mb-2">धर्म कार्य में स्वयंसेवक (Volunteer) बनें</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 font-medium">
            यदि आप अपनी पहचान बताना चाहते हैं या हमारी टीम के साथ जुड़कर भजनों के संकलन में मदद करना चाहते हैं, तो हमसे सीधे संपर्क करें:
          </p>
          <div className="flex flex-col gap-3">
            <a href="https://wa.me/918384844353" target="_blank" rel="noreferrer" className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-xl hover:bg-green-100 transition-colors font-bold">
              <FaWhatsapp className="text-xl" /> +91 8384844353
            </a>
            <a href="mailto:nvsict06@gmail.com" className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors font-bold">
              <FaEnvelope className="text-xl" /> nvsict06@gmail.com
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ─── SCREEN 3: DONATION FORM (Default) ───
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
      `}</style>
      
      {cancelToast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-slide-in-bottom">
          <div className="bg-white dark:bg-gray-900 border border-orange-200 shadow-2xl px-6 py-4 rounded-2xl flex items-center gap-3 w-max">
            <div className="flex items-center justify-center w-10 h-10 bg-orange-50 rounded-full text-orange-500 text-xl shrink-0">🙏</div>
            <p className="text-sm font-bold text-gray-800 dark:text-gray-200">कोई बात नहीं, आप भविष्य में कभी भी सहयोग कर सकते हैं।</p>
          </div>
        </div>
      )}
      
      <div className="min-h-screen !pt-24 !pb-20 md:!pb-24 bg-orange-50/40 dark:bg-[#0c0804] relative overflow-hidden transition-colors duration-300 font-hindi">
        <FloatingParticles />
        <div className="pointer-events-none absolute inset-0 mandala-bg z-0" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-orange-500/10 blur-[120px] z-0" />
        
        <div className="max-w-3xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-10">
            <div className="inline-block relative mb-6">
              <div className="w-20 h-20 mx-auto text-orange-600 drop-shadow-sm"><OmSymbol /></div>
            </div>
            <p className="text-orange-700 text-sm font-bold tracking-[0.25em] uppercase mb-3">हिंदी भजन मंजरी</p>
            <h1 className="font-noto-serif text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 leading-tight">धर्म कार्य में अमूल्य सहयोग दें</h1>
            <DiamondDivider />
            <p className="text-gray-700 dark:text-gray-300 text-base max-w-xl mx-auto mt-4 font-medium">
              इस आध्यात्मिक मंच को <strong className="text-orange-600">विज्ञापन-मुक्त</strong> और सुचारु रखने के लिए आपकी दक्षिणा महत्वपूर्ण है।
            </p>
          </div>
          
          <MonthlyGoal currentRaised={currentRaised} supporterCount={supporterCount} />
          
          <div className="bg-white dark:bg-[#111] rounded-[2rem] shadow-xl border border-orange-100 overflow-hidden mb-16 relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />
            <div className="p-6 md:p-10 border-b border-gray-100 bg-gradient-to-b from-orange-50/50 to-white">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center">1</div>
                <h2 className="font-bold text-gray-900 text-lg md:text-xl">सहयोग राशि चुनें</h2>
              </div>
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {PRESET_AMOUNTS.map(p => (
                  <button key={p} onClick={() => handlePreset(p)}
                    className={`relative px-5 py-3 rounded-xl font-bold text-lg transition-all ${amount === p && !customAmount
                      ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 scale-105'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-400 hover:text-orange-600 shadow-sm'
                      }`}>
                    ₹{p}
                    {p === 101 && <span className="absolute -top-2.5 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow-sm">लोकप्रिय</span>}
                  </button>
                ))}
              </div>
              <div className="max-w-md mx-auto relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-black text-lg pointer-events-none">₹</span>
                <input ref={inputRef} type="number" min="1" placeholder="अन्य राशि दर्ज करें (Custom Amount)" value={customAmount} onChange={handleCustom}
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 focus:border-orange-500 rounded-xl font-bold text-base outline-none" />
              </div>
            </div>
            
            <div className="p-6 md:p-10 flex flex-col items-center justify-center text-center">
              <div className="flex items-center justify-center gap-3 mb-8">
                <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 font-black flex items-center justify-center">2</div>
                <h2 className="font-bold text-gray-900 text-lg md:text-xl">सुरक्षित पेमेंट करें</h2>
              </div>
              <button onClick={handlePayClick} disabled={effectiveAmount <= 0 || isSubmitting}
                className="w-full max-w-md py-4 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:text-gray-500 text-white font-black text-lg rounded-2xl shadow-md transition-all flex items-center justify-center gap-3">
                {isSubmitting ? (
                  <span className="flex items-center gap-2">प्रोसेस हो रहा है... <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div></span>
                ) : (
                  <><FaOm className="text-xl" /> श्रद्धा भेंट करें {effectiveAmount > 0 ? `(₹${effectiveAmount})` : ''}</>
                )}
              </button>
              <div className="flex items-center gap-3 text-xs font-bold text-gray-500 uppercase tracking-widest mt-6">
                <span className="flex items-center gap-1"><FaLock className="text-green-500" /> 100% Secure</span>
                <span className="w-1 h-1 rounded-full bg-gray-300" />
                <span>Powered By Razorpay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}