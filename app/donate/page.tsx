"use client";

import { useState } from 'react';
import { 
  FaHandHoldingHeart, FaQrcode, FaCopy, FaCheckCircle, 
  FaShieldAlt, FaServer, FaAdversal, FaBookOpen, FaHeart 
} from 'react-icons/fa';

export default function DonatePage() {
  const [copied, setCopied] = useState(false);
  
  // 🌟 State for dynamic amount handling
  const [amount, setAmount] = useState<number>(101); // Default Shagun amount
  const [customAmount, setCustomAmount] = useState<string>('');

  const upiId = "bhajanmanjari@ptyes"; 
  const payeeName = "Hindi Bhajan Manjari";

  // Pre-defined auspicious amounts
  const presetAmounts = [51, 101, 251, 501, 1100];

  const handleCopy = () => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCustomAmount = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    if (val && !isNaN(Number(val)) && Number(val) > 0) {
      setAmount(Number(val));
    } else {
      setAmount(0);
    }
  };

  const handlePresetClick = (val: number) => {
    if (typeof window !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
    setAmount(val);
    setCustomAmount('');
  };

  // 🌟 DYNAMIC LINKS: These automatically update with the entered amount!
  // If amount is 0, we don't pass the 'am' parameter so user can enter it in their app manually
  const amountParam = amount > 0 ? `&am=${amount}` : '';
  const upiDeepLink = `upi://pay?pa=${upiId}&pn=${encodeURIComponent(payeeName)}&cu=INR${amountParam}`;
  
  // Using a reliable free API to generate the QR code on the fly based on the UPI string
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(upiDeepLink)}&margin=10`;

  return (
    <div className="min-h-screen bg-orange-50/30 dark:bg-[#0c0804] py-12 px-4 sm:px-6 relative overflow-hidden transition-colors duration-300">
      
      {/* Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-orange-400/20 dark:bg-orange-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 mb-6 shadow-inner border border-orange-200 dark:border-orange-500/20">
            <FaHandHoldingHeart className="text-4xl" />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-4 tracking-tight">
            Support Our <span className="text-orange-600 dark:text-orange-500">Dharma Karya</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Your voluntary contribution (Dakshina) empowers us to keep Sanatan Dharma accessible to millions, completely free and pure.
          </p>
        </div>

        {/* --- INTERACTIVE PAYMENT MODULE --- */}
        <div className="bg-white dark:bg-[#111] rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(234,88,12,0.15)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] border border-orange-100 dark:border-white/10 overflow-hidden mb-16">
          
          {/* Step 1: Amount Selector */}
          <div className="p-6 md:p-10 border-b border-gray-100 dark:border-white/5 bg-orange-50/30 dark:bg-orange-900/10">
            <h3 className="text-center text-gray-800 dark:text-gray-200 font-bold text-lg mb-6">
              1. Choose your Dakshina Amount
            </h3>
            
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {presetAmounts.map((preset) => (
                <button
                  key={preset}
                  onClick={() => handlePresetClick(preset)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-lg transition-all outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    amount === preset && customAmount === ''
                      ? 'bg-orange-600 text-white shadow-md scale-105'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-orange-400 hover:text-orange-600 dark:hover:text-orange-400'
                  }`}
                >
                  ₹{preset}
                </button>
              ))}
            </div>

            <div className="max-w-xs mx-auto relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span className="text-gray-500 font-bold text-lg">₹</span>
              </div>
              <input
                type="number"
                min="1"
                placeholder="Custom Amount"
                value={customAmount}
                onChange={handleCustomAmount}
                className="w-full pl-8 pr-4 py-3 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 focus:border-orange-500 rounded-xl outline-none font-bold text-lg text-gray-900 dark:text-white transition-colors text-center shadow-sm"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row">
            {/* Step 2A: QR Code (Desktop Focus) */}
            <div className="w-full md:w-1/2 p-8 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-gray-100 dark:border-white/5 relative">
              <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-6">
                Scan with any UPI App
              </h3>
              
              <div className="bg-white p-3 rounded-2xl shadow-sm border border-gray-200 relative group transition-transform hover:scale-105 duration-300">
                <div className="w-48 h-48 flex items-center justify-center rounded-xl overflow-hidden relative bg-white">
                  {/* Standard img tag is used here so Next.js doesn't throw external domain image errors */}
                  <img 
                    src={qrCodeUrl} 
                    alt="Dynamic UPI QR Code"
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              
              <p className="font-bold text-orange-600 dark:text-orange-400 mt-6 text-xl">
                {amount > 0 ? `Paying ₹${amount}` : 'Enter amount in app'}
              </p>
            </div>

            {/* Step 2B: Direct UPI Link (Mobile Focus) */}
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white dark:bg-[#111]">
              
              <div className="mb-8">
                <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-2">
                  Our UPI ID
                </h3>
                <div className="flex items-center gap-3">
                  <code className="flex-1 bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-4 py-3 rounded-xl font-mono text-[15px] border border-gray-200 dark:border-gray-700 truncate">
                    {upiId}
                  </code>
                  <button 
                    onClick={handleCopy}
                    className="w-12 h-12 flex items-center justify-center bg-orange-100 dark:bg-orange-900/30 hover:bg-orange-200 text-orange-600 dark:text-orange-400 rounded-xl transition-colors shrink-0"
                    aria-label="Copy UPI ID"
                  >
                    {copied ? <FaCheckCircle size={20} className="text-green-500" /> : <FaCopy size={20} />}
                  </button>
                </div>
              </div>

              <div className="relative flex items-center py-4">
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
                <span className="flex-shrink-0 mx-4 text-gray-400 text-sm font-bold uppercase">Or on Mobile</span>
                <div className="flex-grow border-t border-gray-200 dark:border-gray-700"></div>
              </div>

              {/* Dynamic Mobile Deep Link Button */}
              <a 
                href={upiDeepLink}
                className="mt-4 w-full py-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-black text-lg rounded-xl shadow-[0_10px_20px_rgba(234,88,12,0.3)] active:scale-[0.98] transition-all flex justify-center items-center gap-3 outline-none"
              >
                Pay {amount > 0 ? `₹${amount}` : ''} via UPI App <FaShieldAlt className="text-orange-200" />
              </a>
              
              <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1.5">
                <FaHeart className="text-red-500/70" /> 100% Secure & Direct. Zero Platform Fees.
              </p>
            </div>

          </div>
        </div>

        {/* --- THE "WHY DONATE?" PERSUASION SECTION --- */}
        <div className="max-w-3xl mx-auto mt-16 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">
              Why your support matters?
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Running a platform of this scale requires resources. Your contribution is not just a donation; it is an active participation in preserving our culture.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Reason 1 */}
            <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl flex items-center justify-center mb-4">
                <FaServer size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Server & Hosting Costs</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                As our community grows, so does our server traffic. Your donations help us pay for reliable servers so the website loads instantly, even during heavy traffic on festivals like Navratri or Diwali.
              </p>
            </div>

            {/* Reason 2 */}
            <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl flex items-center justify-center mb-4">
                <FaAdversal size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">A Pure, Ad-Light Experience</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                Devotion requires focus. Community support allows us to minimize intrusive advertisements, ensuring that your reading and chanting experience remains peaceful and uninterrupted.
              </p>
            </div>

            {/* Reason 3 */}
            <div className="bg-white dark:bg-[#111] p-6 rounded-2xl border border-gray-100 dark:border-white/5 shadow-sm hover:shadow-md transition-shadow md:col-span-2">
              <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/20 text-orange-500 rounded-xl flex items-center justify-center mb-4">
                <FaBookOpen size={20} />
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg mb-2">Digitizing Ancient Knowledge</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                We are constantly researching, typing, and verifying rare Bhajans, Stotrams, and Chalisas to make them available in multiple languages. Your Dakshina supports the time and effort required to digitize and preserve these sacred texts for future generations.
              </p>
            </div>

          </div>

          <div className="mt-12 text-center bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-900/30 p-8 rounded-2xl">
            <p className="font-hindi text-xl md:text-2xl font-bold text-orange-800 dark:text-orange-400 mb-2">
              "दानं सति..."
            </p>
            <p className="text-gray-600 dark:text-gray-400 font-medium">
              We deeply appreciate every single contribution, no matter how small. <br className="hidden md:block"/> May the divine bless you and your family.
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}