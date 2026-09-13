"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { FaSpinner, FaWhatsapp, FaExclamationTriangle, FaLock } from 'react-icons/fa';
import { load } from '@cashfreepayments/cashfree-js';

interface DonationCheckoutProps {
  mode?: 'donation' | 'book_builder';
  returnPath?: string;
}

export default function DonationCheckout({ mode = 'donation', returnPath = '/donate' }: DonationCheckoutProps) {
  const searchParams = useSearchParams();
  const urlAmount = searchParams.get('amount');

  const [selectedAmount, setSelectedAmount] = useState<number>(101);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isErrorState, setIsErrorState] = useState(false);

  useEffect(() => {
    if (mode === 'book_builder' && urlAmount) {
      setSelectedAmount(parseInt(urlAmount));
    }
  }, [mode, urlAmount]);

  const handleAmountClick = (amt: number) => {
    setSelectedAmount(amt);
    setCustomAmount('');
    setIsErrorState(false);
  };

  const handleCustomInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomAmount(val);
    const parsed = parseInt(val);
    if (parsed && parsed > 0) {
      setSelectedAmount(parsed > 100000 ? 100000 : parsed);
    } else {
      setSelectedAmount(0);
    }
    setIsErrorState(false);
  };

  const handleSupportClick = () => {
    const text = encodeURIComponent(`हरि ॐ! मैंने सहयोग/ई-बुक के लिए पेमेंट किया था लेकिन प्रक्रिया पूरी नहीं हुई। कृपया सहायता करें।`);
    window.open(`https://wa.me/918384844353?text=${text}`, '_blank');
  };

 const handlePayment = async () => {
    if (selectedAmount < 1) {
      setErrorMessage("कृपया सही सहयोग राशि चुनें।");
      setIsErrorState(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setIsErrorState(false);

    try {
      // 1. Create Order
      const res = await fetch('/api/cashfree/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: selectedAmount,
          count: mode === 'book_builder' ? urlAmount : null,
          returnPath: returnPath 
        })
      });

      const orderData = await res.json();
      if (!res.ok) throw new Error(orderData.error || "Order creation failed");

      // ========================================================
      // 🌟 FIX: BTOA HACK (To prevent Hindi Font Crash in Cashfree)
      // ========================================================
      const originalBtoa = window.btoa;
      window.btoa = function (str) {
        try {
          return originalBtoa(str);
        } catch (e) {
          return originalBtoa(unescape(encodeURIComponent(str)));
        }
      };

      const cashfree = await load({ mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox' });
      
      // 3. Open Checkout with Promise Handling
      cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal'
      }).then((result: any) => {
        
        // पॉपअप बंद होने के बाद btoa को वापस नॉर्मल कर दें
        window.btoa = originalBtoa;

        if (result.error) {
          // 🚨 अगर यूज़र ने पॉपअप काट दिया या कार्ड फेल हो गया
          setIsLoading(false);
          setErrorMessage(result.error.message || "पेमेंट रद्द कर दिया गया या विफल रहा।");
          setIsErrorState(true);
        } else if (result.paymentDetails) {
          // ✅ पेमेंट की प्रक्रिया पूरी हो गई! अब हम खुद यूज़र को Verify API पर भेजेंगे
          setIsLoading(true); // रीडायरेक्ट होने तक लोडिंग चालू रखें
          window.location.href = `/api/cashfree/redirect?order_id=${orderData.orderId}&return_path=${returnPath}`;
        }
      });

    } catch (err: any) {
      console.error(err);
      setErrorMessage("पेमेंट सर्वर से संपर्क नहीं हो पाया। पुनः प्रयास करें।");
      setIsErrorState(true);
      setIsLoading(false);
    }
  };
  
  return (
    <div 
      className="w-full max-w-[500px] mx-auto bg-white rounded-3xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1)] border border-orange-50 overflow-hidden relative font-hind tracking-wide"
      style={{ fontFamily: 'var(--font-hind), sans-serif' }}
    >
      <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400"></div>

      <div className="p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-6 text-orange-600 font-black text-4xl flex items-center justify-center bg-orange-50 rounded-full border border-orange-100 pb-1">
          ॐ
        </div>

        <p className="text-xs font-bold uppercase tracking-widest text-orange-700 mb-2">हिंदी भजन मंजरी</p>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 leading-tight">
          {mode === 'book_builder' ? "ई-पुस्तिका संकलन शगुन" : "धर्म कार्य में अमूल्य सहयोग दें"}
        </h1>
        <p className="text-gray-500 font-medium mb-8 text-sm sm:text-base">
          {mode === 'book_builder' ? "मंच को विज्ञापन-मुक्त रखने में आपका यह सहयोग अमूल्य है।" : "इस मंच को विज्ञापन-मुक्त और सुचारु रखने के लिए आपकी दक्षिणा महत्वपूर्ण है।"}
        </p>

        {/* 🌟 DONATION AMOUNT SELECTOR (Only if NOT book_builder) */}
        {mode === 'donation' && (
          <div className="mb-6">
            <span className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">सहयोग राशि चुनें</span>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {[21, 51, 101, 251, 501, 1100].map(amt => (
                <button
                  key={amt}
                  onClick={() => handleAmountClick(amt)}
                  className={`py-3 rounded-xl border font-black text-lg transition-all ${selectedAmount === amt && !customAmount ? 'border-orange-600 bg-orange-600 text-white shadow-md scale-[1.02]' : 'border-gray-200 bg-white text-gray-800 hover:border-orange-400 hover:bg-orange-50'}`}
                >
                  ₹{amt}
                </button>
              ))}
            </div>

            <div className="relative max-w-[250px] mx-auto">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₹</span>
              <input
                type="number"
                placeholder="अन्य राशि दर्ज करें"
                value={customAmount}
                onChange={handleCustomInput}
                className="w-full py-3.5 pl-10 pr-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-lg text-gray-900 outline-none focus:border-orange-500 focus:bg-white transition-all text-center placeholder:font-medium placeholder:text-sm"
              />
            </div>
          </div>
        )}

        {/* 🌟 BOOK BUILDER FIXED AMOUNT */}
        {mode === 'book_builder' && (
          <div className="bg-orange-50 border border-dashed border-orange-300 rounded-2xl p-6 inline-block w-full max-w-[280px] mb-8">
            <div className="text-sm text-orange-800 font-bold uppercase tracking-wider mb-2">शगुन राशि</div>
            <div className="text-4xl font-black text-orange-600 leading-none">₹{selectedAmount}</div>
          </div>
        )}

        {/* ERROR BOX & SUPPORT */}
        {isErrorState && (
          <div className="mb-6 space-y-3 animate-in fade-in zoom-in duration-300">
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-start gap-2 leading-snug text-left">
              <FaExclamationTriangle className="shrink-0 mt-0.5" /> 
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={handleSupportClick}
              className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold text-[15px] py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95"
            >
              <FaWhatsapp className="text-xl" /> पैसे कट गए? सहायता लें
            </button>
          </div>
        )}

        {/* PAY BUTTON */}
        <button
          onClick={handlePayment}
          disabled={isLoading || selectedAmount <= 0}
          className="w-full py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-black text-xl rounded-2xl shadow-[0_10px_20px_-5px_rgba(234,88,12,0.4)] transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <><FaSpinner className="animate-spin" /> प्रोसेस हो रहा है...</>
          ) : (
            <>{mode === 'book_builder' ? 'सुरक्षित भुगतान करें' : 'ॐ श्रद्धा भेंट करें'} <span className="opacity-90 ml-1 font-bold">(₹{selectedAmount})</span></>
          )}
        </button>

        {/* 🌟 TRUST BADGES SECTION */}
        <div className="mt-8 pt-6 border-t border-gray-100">
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-gray-500 uppercase tracking-widest">
              <FaLock className="text-green-600" /> 100% Secure Cashfree Payments
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 opacity-70 grayscale">
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider">UPI</span>
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider">GPay</span>
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider">PhonePe</span>
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider">Paytm</span>
              <span className="bg-gray-100 border border-gray-200 text-gray-700 px-3 py-1.5 rounded-md text-[10px] font-black tracking-wider">CARDS</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}