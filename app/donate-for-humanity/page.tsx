'use client';

import { useEffect, useRef } from 'react';
import { Hind } from 'next/font/google';

const hind = Hind({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  display: 'swap',
});

export default function DonateForHumanityPage() {
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // यह सुनिश्चित करेगा कि स्क्रिप्ट केवल एक ही बार लोड हो
    if (formRef.current && formRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_TGNoG15x6BTHdF');
      script.async = true;
      formRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={`min-h-screen bg-[#fffaf5] flex flex-col items-center justify-center p-4 ${hind.className}`}>
      
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl border border-orange-100 max-w-md w-full text-center">
        
        <div className="w-20 h-20 bg-orange-50 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-sm border border-orange-200">
          🙏
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Donate for Humanity
        </h1>
        
        <p className="text-gray-600 mb-8 font-medium leading-relaxed">
          मानवता की भलाई के लिए अपना योगदान दें। आपका एक छोटा सा सहयोग किसी के जीवन में बड़ा बदलाव ला सकता है।
        </p>
        
        {/* Razorpay Payment Button Container */}
        <div className="flex justify-center items-center min-h-[60px] bg-gray-50 rounded-xl p-4 border border-gray-100">
          <form ref={formRef} className="w-full flex justify-center"></form>
        </div>

        <div className="mt-6 flex items-center justify-center gap-2 text-xs text-gray-400 font-bold uppercase tracking-wider">
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
          </svg>
          100% Secure Payment by Razorpay
        </div>

      </div>
    </div>
  );
}