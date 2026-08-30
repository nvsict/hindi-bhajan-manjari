'use client';

import { useState, useEffect } from 'react';
import { FaShieldAlt, FaPhoneAlt, FaUser, FaCheckCircle } from 'react-icons/fa';

// Razorpay Script को सुरक्षित तरीके से लोड करने का फंक्शन (ताकि React क्रैश न हो)
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

interface DonationCheckoutProps {
  mode?: 'donation' | 'book_builder';
  prefilledAmount?: number;
  prefilledOrderId?: string;
  returnPath?: string;
}

export default function DonationCheckout({
  mode = 'donation',
  prefilledAmount,
  prefilledOrderId,
  returnPath = '/donate'
}: DonationCheckoutProps) {
  
  const [amount, setAmount] = useState<number>(prefilledAmount || 101);
  const [customAmount, setCustomAmount] = useState<string>('');
  
  // 🌟 Drop-off Killer: Prefill Data
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // शगुन राशियाँ
  const shagunAmounts = [21, 51, 101, 251, 501, 1100];

  const handleAmountClick = (val: number) => {
    setAmount(val);
    setCustomAmount('');
    setError(null);
  };

  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const numVal = parseInt(val, 10);
    if (numVal && numVal > 0) {
      setAmount(numVal > 100000 ? 100000 : numVal);
    } else {
      setAmount(0);
    }
    setError(null);
  };

  const handlePayment = async () => {
    // 1. Validation
    if (amount < 1) {
      setError('कृपया सही सहयोग राशि चुनें।');
      return;
    }
    if (!name.trim()) {
      setError('कृपया अपना शुभ नाम दर्ज करें।');
      return;
    }
    if (phone.length !== 10 || isNaN(Number(phone))) {
      setError('कृपया 10 अंकों का सही WhatsApp / फ़ोन नंबर दर्ज करें।');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      // 2. Load Razorpay securely
      const res = await loadRazorpayScript();
      if (!res) {
        throw new Error('इंटरनेट कनेक्शन जांचें। पेमेंट गेटवे लोड नहीं हो पाया।');
      }

      let orderData: any = {};

      // 3. Create or Use Order ID
      if (mode === 'book_builder' && prefilledOrderId) {
        orderData = { id: prefilledOrderId, amount: amount * 100, currency: 'INR' };
      } else {
        const orderRes = await fetch('/api/razorpay/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ amount: amount })
        });
        orderData = await orderRes.json();
        if (!orderData.id) throw new Error("ऑर्डर जनरेट नहीं हो सका।");
      }

      // 🌟 4. Razorpay Config (WITH PREFILL TO SKIP THEIR SCREEN)
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_TEOLlRM13UTm1R",
        amount: orderData.amount,
        currency: orderData.currency,
        name: "Hindi Bhajan Manjari",
        description: mode === 'book_builder' ? "ई-पुस्तिका संकलन शगुन" : "सनातन धर्म के लिए सहयोग राशि",
        order_id: orderData.id,
        prefill: {
          name: name.trim(),
          contact: phone.trim(), // 10 digit number skips the Razorpay collection screen directly to UPI!
        },
        theme: { color: "#ea580c" },
        modal: {
          ondismiss: function() { 
            setIsLoading(false); 
          }
        },
        handler: function(response: any) {
          // 5. Success Hand-off to Server Component (SuccessFlow handles DB save)
          window.location.href = `${returnPath}?success=true&payment_id=${response.razorpay_payment_id}&order_id=${response.razorpay_order_id}&amount=${amount}`;
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'पेमेंट सर्वर से संपर्क नहीं हो पाया। पुनः प्रयास करें।');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[480px] mx-auto bg-white rounded-[2rem] shadow-[0_20px_40px_rgba(234,88,12,0.08)] border border-orange-100 overflow-hidden relative">
      
      {/* Top Gradient Bar */}
      <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400"></div>

      <div className="p-6 md:p-8">
        
        {/* Header Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-orange-100">
            <span className="text-3xl font-black">ॐ</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">
            {mode === 'book_builder' ? 'ई-पुस्तिका संकलन शगुन' : 'श्रद्धा भेंट करें'}
          </h2>
          <p className="text-sm font-medium text-gray-500">
            इस सनातन मंच को विज्ञापन-मुक्त रखने के लिए आपका सहयोग अमूल्य है।
          </p>
        </div>

        {/* 🌟 Error Message Box */}
        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            {error}
          </div>
        )}

        {/* 🌟 Amount Selection (Hidden in Book Builder Mode if fixed) */}
        {mode === 'donation' && (
          <div className="mb-8">
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 text-center">
              सहयोग राशि चुनें
            </label>
            <div className="grid grid-cols-3 gap-3 mb-4">
              {shagunAmounts.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAmountClick(amt)}
                  className={`py-3 rounded-xl font-black text-lg transition-all ${
                    amount === amt && !customAmount
                      ? 'bg-orange-600 text-white shadow-md border border-orange-600'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>
            
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-black">₹</span>
              <input
                type="number"
                placeholder="अन्य राशि दर्ज करें"
                value={customAmount}
                onChange={handleCustomAmountChange}
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-center"
              />
            </div>
          </div>
        )}

        {mode === 'book_builder' && (
          <div className="mb-8 bg-orange-50 border border-dashed border-orange-300 rounded-2xl p-6 text-center">
            <span className="text-xs font-bold text-orange-800 uppercase tracking-widest block mb-2">शगुन राशि</span>
            <span className="text-4xl font-black text-orange-600">₹{amount}</span>
          </div>
        )}

        {/* 🌟 Prefill Form (Drop-off Killer) */}
        <div className="space-y-4 mb-8">
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaUser className="text-gray-400 text-sm" />
              </div>
              <input
                type="text"
                placeholder="आपका शुभ नाम"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
          </div>
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <FaPhoneAlt className="text-gray-400 text-sm" />
              </div>
              <input
                type="tel"
                maxLength={10}
                placeholder="WhatsApp / फ़ोन नंबर"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Only numbers allowed
                className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold text-gray-900 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
              />
            </div>
            <p className="text-[10px] text-gray-400 mt-1.5 ml-2 font-medium">
              यह नंबर सीधे UPI ऐप (GPay/PhonePe) खोलने के लिए उपयोग होगा।
            </p>
          </div>
        </div>

        {/* 🌟 Payment Button */}
        <button
          onClick={handlePayment}
          disabled={isLoading || amount < 1}
          className="w-full py-4 bg-orange-600 hover:bg-orange-700 active:scale-[0.98] text-white font-black text-lg rounded-xl shadow-[0_8px_20px_rgba(234,88,12,0.3)] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <>
              <FaShieldAlt className="mb-0.5 opacity-80" /> 
              {amount > 0 ? `₹${amount} सुरक्षित भुगतान करें` : 'सुरक्षित भुगतान करें'}
            </>
          )}
        </button>

        {/* 🌟 Trust Signals */}
        <div className="mt-6 flex flex-col items-center justify-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-green-600 bg-green-50 px-3 py-1.5 rounded-full uppercase tracking-widest border border-green-100">
            <FaCheckCircle size={10} /> 100% सुरक्षित • सीधा बैंक ट्रांसफर
          </div>
          <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
            {/* Tiny text indicating supported methods instead of images to keep it lightweight */}
            <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-1 rounded">UPI</span>
            <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-1 rounded">GPay</span>
            <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-1 rounded">PhonePe</span>
            <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-1 rounded">Paytm</span>
            <span className="text-[10px] font-black text-gray-600 bg-gray-100 px-2 py-1 rounded">Cards</span>
          </div>
        </div>

      </div>
    </div>
  );
}