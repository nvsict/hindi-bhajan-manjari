"use client";

import { useState, useEffect, useRef } from 'react';
import { 
  FaCopy, FaShieldAlt, FaServer, FaHeart, 
  FaCheckCircle, FaBookOpen, FaAdversal, FaOm
} from 'react-icons/fa';
import { FaLock, FaBolt } from 'react-icons/fa6';

// ─── TYPES & CONSTANTS ────────────────────────────────────────────────────────
type Particle = { id: number; x: number; size: number; duration: number; delay: number; opacity: number };

const UPI_ID = "bhajanmanjari@ptyes";
const PAYEE_NAME = "Hindi Bhajan Manjari";
const PRESET_AMOUNTS = [21, 51, 101, 251, 501, 1100];
const MONTHLY_GOAL = 5000;
// Note: CURRENT_RAISED and SUPPORTER_COUNT are now dynamic states below.

// ─── DECORATIVE SVG COMPONENTS ────────────────────────────────────────────────
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

// ─── FLOATING PARTICLES (DIYAS) ────────────────────────────────────────────────
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
            left: `${p.x}%`,
            bottom: '-20px',
            width: `${p.size}px`,
            height: `${p.size}px`,
            opacity: p.opacity,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
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

// ─── MONTHLY GOAL PROGRESS BAR (Now accepts props for dynamic updates) ────────
function MonthlyGoal({ currentRaised, supporterCount }: { currentRaised: number, supporterCount: number }) {
  const pct = Math.min(100, Math.round((currentRaised / MONTHLY_GOAL) * 100));
  
  return (
    <div className="relative bg-white/60 dark:bg-white/[0.02] border border-orange-200/60 dark:border-white/10 rounded-2xl p-6 mb-10 overflow-hidden shadow-sm backdrop-blur-sm">
      <BorderCorner className="top-2 left-2" />
      <BorderCorner className="top-2 right-2 scale-x-[-1]" />
      <BorderCorner className="bottom-2 left-2 scale-y-[-1]" />
      <BorderCorner className="bottom-2 right-2 scale-[-1]" />

      <div className="flex justify-between items-baseline mb-3 relative z-10">
        <p className="text-orange-800 dark:text-orange-600 text-sm font-bold tracking-wide uppercase">
          इस माह का सर्वर लक्ष्य
        </p>
        <p className="text-orange-900 dark:text-orange-600 text-sm font-black transition-all duration-500">
          ₹{currentRaised.toLocaleString('hi-IN')} / ₹{MONTHLY_GOAL.toLocaleString('hi-IN')}
        </p>
      </div>

      <div className="h-3.5 bg-orange-100/50 dark:bg-gray-800/80 rounded-full overflow-hidden border border-orange-200/50 dark:border-gray-700 relative z-10 shadow-inner">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-1000 ease-out relative"
          style={{ width: `${pct}%` }}
        >
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

// ─── MAIN PAGE COMPONENT ───────────────────────────────────────────────────────
export default function DonatePage() {
  const [amount, setAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [thankYou, setThankYou] = useState(false);
  const [dedication, setDedication] = useState('');
  
  // 🌟 Dynamic State Variables
  const [currentRaised, setCurrentRaised] = useState(3240);
  const [supporterCount, setSupporterCount] = useState(127);
  const [recentDonation, setRecentDonation] = useState<{name: string, amount: number} | null>(null);
  
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveAmount = amount > 0 ? amount : 0;
  const amountParam = effectiveAmount > 0 ? `&am=${effectiveAmount}` : '';
  const upiDeepLink = `upi://pay?pa=${UPI_ID}&pn=${encodeURIComponent(PAYEE_NAME)}&cu=INR${amountParam}`;
  
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(upiDeepLink)}&margin=10`;

  // 🌟 DYNAMIC SIMULATION ENGINE
  useEffect(() => {
    // Arrays to generate realistic looking recent donations
    const names = ["एक गुप्त भक्त", "राहुल", "सुनीता", "एक राम भक्त", "अमित", "नेहा", "एक सनातन प्रेमी", "विकास"];
    const amounts = [21, 51, 101, 101, 251, 501];

    const simulateDonation = () => {
      const randomAmount = amounts[Math.floor(Math.random() * amounts.length)];
      const randomName = names[Math.floor(Math.random() * names.length)];
      
      setCurrentRaised(prev => prev + randomAmount);
      setSupporterCount(prev => prev + 1);
      setRecentDonation({ name: randomName, amount: randomAmount });
      
      // Hide the toast after 4.5 seconds
      setTimeout(() => {
        setRecentDonation(null);
      }, 4500);
    };

    const scheduleNextSimulation = () => {
      // Random interval between 15 and 45 seconds to mimic human behavior unpredictability
      const nextInterval = Math.floor(Math.random() * (45000 - 15000 + 1) + 15000);
      
      setTimeout(() => {
        simulateDonation();
        scheduleNextSimulation(); // Recursive call for continuous loop
      }, nextInterval);
    };

    // Fire the first simulated donation after 6 seconds of page load
    const initialTimer = setTimeout(() => {
      simulateDonation();
      scheduleNextSimulation();
    }, 6000);

    return () => clearTimeout(initialTimer);
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(UPI_ID);
    if (navigator.vibrate) navigator.vibrate(30);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

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

  const handlePayClick = () => {
    window.location.href = upiDeepLink;
    setTimeout(() => setThankYou(true), 1500);
  };

  // ─── THANK YOU SCREEN ───
  if (thankYou) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 dark:bg-[#0c0804] px-4 text-center font-hindi">
        <style>{`@keyframes bounce-slow { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-12px); } } .animate-bounce-slow { animation: bounce-slow 2.5s ease-in-out infinite; }`}</style>
        <div className="w-24 h-24 text-orange-600 dark:text-orange-500 mb-8 animate-bounce-slow drop-shadow-lg">
          <OmSymbol />
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-orange-900 dark:text-orange-100 mb-4 font-noto-serif">
          🙏 हृदय से धन्यवाद!
        </h1>
        <p className="text-gray-700 dark:text-gray-300 text-lg max-w-md mx-auto leading-relaxed mb-8">
          {dedication ? `"${dedication}" के नाम से आपकी दक्षिणा स्वीकार हुई। ` : 'आपकी दक्षिणा के लिए आभार। '}
          प्रभु श्री राम आप पर और आपके परिवार पर सदा कृपा बनाए रखें।
        </p>
        <button
          onClick={() => { setThankYou(false); }}
          className="px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl shadow-md transition-all active:scale-95 outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          वापस जाएं
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
        .shimmer-text {
          background: linear-gradient(90deg, #ea580c, #f59e0b, #dc2626, #ea580c);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }
        .dark .shimmer-text {
          background: linear-gradient(90deg, #fca5a5, #fde047, #f97316, #fca5a5);
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
        }
        @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        
        /* Toast Animation */
        @keyframes slide-in-bottom {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-in-bottom {
          animation: slide-in-bottom 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
        }
      `}</style>

      {/* 🌟 LIVE NOTIFICATION TOAST */}
      {recentDonation && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-6 z-50 animate-slide-in-bottom">
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border border-green-200 dark:border-green-900/50 shadow-[0_8px_30px_rgb(0,0,0,0.12)] px-4 py-3 rounded-2xl flex items-center gap-3 w-max">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 shrink-0">
              <FaCheckCircle size={16} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-gray-100 font-hindi">
                {recentDonation.name} ने ₹{recentDonation.amount} दिए!
              </p>
              <p className="text-[10px] font-medium text-gray-500 uppercase tracking-widest">
                Just now
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-orange-50/40 dark:bg-[#0c0804] relative overflow-hidden transition-colors duration-300 font-hindi pb-20">
        
        {/* Background Effects */}
        <FloatingParticles />
        <div className="pointer-events-none absolute inset-0 mandala-bg z-0" />
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-orange-500/10 dark:bg-orange-600/10 blur-[120px] z-0" />

        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-12 md:pt-16 relative z-10">

          {/* ── HEADER ── */}
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="inline-block relative mb-6">
              <div className="w-20 h-20 mx-auto text-orange-600 dark:text-orange-500 drop-shadow-sm">
                <OmSymbol />
              </div>
              <div className="absolute inset-0 rounded-full border border-orange-400/30 dark:border-orange-500/20 scale-110" />
              <div className="absolute inset-0 rounded-full border border-orange-400/15 dark:border-orange-500/10 scale-125" />
            </div>

            <p className="text-orange-700 dark:text-orange-500 text-sm font-bold tracking-[0.25em] uppercase mb-3">
              हिंदी भजन मंजरी
            </p>

            <h1 className="font-noto-serif text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2 leading-tight">
              धर्म कार्य में <span className="shimmer-text">अमूल्य सहयोग</span> दें
            </h1>
            <DiamondDivider />
            <p className="text-gray-700 dark:text-gray-300 text-base leading-relaxed max-w-xl mx-auto mt-4 font-medium">
              इस आध्यात्मिक मंच को <strong className="text-orange-600 dark:text-orange-400">विज्ञापन-मुक्त (Ad-free)</strong> और सुचारु रखने के लिए आपकी ऐच्छिक दक्षिणा अत्यंत महत्वपूर्ण है।
            </p>
          </div>

          {/* ── MONTHLY GOAL ── */}
          <MonthlyGoal currentRaised={currentRaised} supporterCount={supporterCount} />

          {/* ── MAIN DONATION CARD ── */}
          <div className="bg-white dark:bg-[#111] rounded-[2rem] shadow-xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-orange-100/50 dark:border-white/10 overflow-hidden mb-16 relative">
            <div className="h-1.5 w-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400" />
            
            {/* STEP 1: Amount Selection */}
            <div className="p-6 md:p-10 border-b border-gray-100 dark:border-white/5 bg-gradient-to-b from-orange-50/50 to-white dark:from-orange-900/10 dark:to-[#111]">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-black flex items-center justify-center shrink-0">1</div>
                <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg md:text-xl">सहयोग राशि चुनें</h2>
                <span className="text-gray-500 dark:text-gray-500 text-sm font-medium hidden sm:inline">(शुभ शगुन)</span>
              </div>

              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {PRESET_AMOUNTS.map(p => (
                  <button
                    key={p}
                    onClick={() => handlePreset(p)}
                    className={`relative px-5 py-3 rounded-xl font-bold text-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-500 select-none ${
                      amount === p && !customAmount
                        ? 'bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-lg shadow-orange-500/30 scale-105 border-transparent'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-400 hover:text-orange-600 shadow-sm'
                    }`}
                  >
                    ₹{p}
                    {p === 101 && (
                      <span className="absolute -top-2.5 -right-2 bg-yellow-400 text-yellow-900 text-[10px] font-black px-2 py-0.5 rounded-full leading-none tracking-wide shadow-sm border border-yellow-200">
                        लोकप्रिय
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Amount & Dedication */}
              <div className="max-w-md mx-auto space-y-4">
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-500 font-black text-lg pointer-events-none">₹</span>
                  <input
                    ref={inputRef}
                    type="number"
                    min="1"
                    placeholder="अन्य राशि दर्ज करें (Custom Amount)"
                    value={customAmount}
                    onChange={handleCustom}
                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 focus:border-orange-500 focus:bg-white dark:focus:bg-[#111] rounded-xl text-gray-900 dark:text-white font-bold text-base transition-colors outline-none shadow-inner placeholder:font-medium"
                  />
                </div>
                
                <input
                  type="text"
                  placeholder="🙏 किसके नाम से दक्षिणा दे रहे हैं? (वैकल्पिक)"
                  value={dedication}
                  onChange={(e) => setDedication(e.target.value)}
                  className="w-full px-4 py-3.5 bg-gray-50/50 dark:bg-gray-900/30 border border-gray-200 dark:border-gray-700/50 focus:border-orange-400 rounded-xl text-gray-900 dark:text-white text-sm transition-colors outline-none placeholder:text-gray-500"
                />
              </div>
            </div>

            {/* STEP 2: Payment */}
            <div className="p-6 md:p-10 flex flex-col md:flex-row gap-8 md:gap-10">
              
              {/* Desktop QR Side */}
              <div className="flex flex-col items-center md:w-1/2">
                <div className="flex items-center gap-3 mb-5 w-full justify-center md:justify-start">
                  <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400 font-black flex items-center justify-center shrink-0">2</div>
                  <h2 className="font-bold text-gray-900 dark:text-gray-100 text-lg">QR स्कैन करें</h2>
                </div>
                
                <div className="bg-white p-3.5 rounded-3xl shadow-md border border-gray-100 relative group transition-transform hover:scale-105 duration-300">
                  <div className="w-44 h-44 flex items-center justify-center rounded-2xl overflow-hidden relative bg-white">
                    <img src={qrUrl} alt="UPI QR Code" className="w-full h-full object-contain" />
                  </div>
                </div>
                
                <p className="mt-5 font-black text-2xl text-orange-600 dark:text-orange-400 text-center">
                  {effectiveAmount > 0 ? `₹${effectiveAmount.toLocaleString('hi-IN')}` : <span className="text-gray-500 text-lg">राशि दर्ज करें</span>}
                </p>
                <p className="text-xs font-bold text-gray-500 mt-1">GPay · PhonePe · Paytm</p>
              </div>

              {/* Mobile Deep Link Side */}
              <div className="flex flex-col justify-center md:w-1/2 gap-5">
                
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">हमारा UPI ID</p>
                  <div className="flex gap-2">
                    <code className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-3.5 rounded-xl font-mono text-sm font-bold border border-gray-200 dark:border-gray-700 truncate shadow-sm">
                      {UPI_ID}
                    </code>
                    <button
                      onClick={handleCopy}
                      className="w-14 h-14 flex items-center justify-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-orange-50 dark:hover:bg-gray-700 text-orange-600 dark:text-orange-400 rounded-xl transition-all shrink-0 active:scale-95 shadow-sm"
                      aria-label="Copy UPI ID"
                    >
                      {copied ? <FaCheckCircle size={22} className="text-green-500" /> : <FaCopy size={22} />}
                    </button>
                  </div>
                  {copied && <p className="text-green-600 dark:text-green-400 text-xs font-bold mt-2 ml-1">✓ UPI ID कॉपी हो गया!</p>}
                </div>

                <div className="relative flex items-center py-2">
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                  <span className="flex-shrink-0 mx-4 text-gray-500 text-xs font-bold uppercase tracking-widest">या मोबाइल पर</span>
                  <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                </div>

                <button
                  onClick={handlePayClick}
                  disabled={effectiveAmount <= 0}
                  className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-400 disabled:dark:from-gray-700 disabled:dark:to-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-white font-black text-lg rounded-2xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-3 outline-none"
                >
                  <FaBolt className={effectiveAmount > 0 ? "text-yellow-300" : "text-gray-200 dark:text-gray-600"} />
                  सीधे UPI ऐप से दें {effectiveAmount > 0 ? `(₹${effectiveAmount})` : ''}
                </button>

                <div className="flex items-center justify-center gap-4 text-xs font-bold text-gray-500 mt-2">
                  <span className="flex items-center gap-1.5"><FaLock className="text-green-500" /> 100% सुरक्षित</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                  <span className="flex items-center gap-1.5"><FaShieldAlt className="text-blue-500" /> सीधा बैंक ट्रांसफर</span>
                </div>
              </div>

            </div>
          </div>

          {/* ── WHY DONATE CARDS ── */}
          <div className="mt-20">
            <h2 className="text-2xl font-black text-gray-900 dark:text-white text-center mb-8 font-noto-serif">
              आपका सहयोग इन धर्म कार्यों में जाता है:
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {[
                { icon: <FaServer size={22}/>, title: 'सर्वर और तकनीक', text: 'लाखों भक्तों तक वेबसाइट को बिना रुके, तेज़ गति से पहुँचाने के लिए उच्च-गुणवत्ता सर्वर का संचालन।' },
                { icon: <FaAdversal size={22}/>, title: 'विज्ञापन-मुक्त अनुभव', text: 'भजन व आरती के भक्तिमय वातावरण में कष्टप्रद विज्ञापनों का कोई स्थान नहीं।' },
                { icon: <FaBookOpen size={22}/>, title: 'नई सामग्री', text: 'नए भजन, चालीसा, स्तोत्र और धार्मिक ग्रंथों को डिजिटल रूप में टाइप कर उपलब्ध कराना।' },
                { icon: <FaOm size={22}/>, title: 'सनातन का संरक्षण', text: 'इस अमूल्य ज्ञान को आने वाली पीढ़ियों के लिए सुरक्षित और सुलभ बनाए रखना।' },
              ].map((item, idx) => (
                <div key={idx} className="bg-white dark:bg-[#111] border border-gray-100 dark:border-white/5 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 text-lg">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-500 text-sm leading-relaxed font-medium">{item.text}</p>
                </div>
              ))}
            </div>

            {/* Shloka Footer */}
            <div className="mt-12 text-center bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/10 dark:to-red-900/10 border border-orange-100 dark:border-orange-900/30 p-8 md:p-12 rounded-[2rem] relative overflow-hidden">
              <FaHeart className="text-red-500 text-3xl mx-auto mb-5 opacity-80 animate-pulse" />
              <p className="font-noto-serif text-2xl md:text-3xl text-orange-800 dark:text-orange-400 mb-4 font-black">
                "धर्मो रक्षति रक्षितः"
              </p>
              <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed max-w-lg mx-auto">
                आपके द्वारा दिया गया प्रत्येक रुपया सनातन धर्म के ज्ञान को डिजिटल जगत में जीवित रखने के हमारे संकल्प को और मजबूत करता है। <br className="hidden md:block"/>
                <span className="font-black text-orange-700 dark:text-orange-400 mt-3 inline-block">प्रभु श्री राम आप पर कृपा बनाए रखें 🙏</span>
              </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}