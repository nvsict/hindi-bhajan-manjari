'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { Hind } from 'next/font/google';

const hind = Hind({
  weight: ['400', '500', '600', '700'],
  subsets: ['devanagari', 'latin'],
  display: 'swap',
});

export default function DonateForHumanityPage() {
  const formRef = useRef<HTMLFormElement>(null);
  const hasScriptLoaded = useRef(false); // 🌟 Strict Mode Double-Render Fix

  // 🌟 Razorpay Payment Button Script Integration (Safe Load)
  useEffect(() => {
    // अगर स्क्रिप्ट पहले ही लोड हो चुकी है, तो दोबारा रन न करें
    if (hasScriptLoaded.current) return;

    if (formRef.current) {
      hasScriptLoaded.current = true; // Lock set कर दिया गया
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_TGNoG15x6BTHdF');
      script.async = true;
      
      formRef.current.appendChild(script);
    }
  }, []);

  return (
    <div className={`min-h-screen bg-[#fffaf5] text-gray-900 pb-20 ${hind.className}`}>
      
      {/* 🌟 Header Bar */}
      <header className="border-b border-orange-100 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3 shadow-sm">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-orange-600 font-bold text-lg">
            <span className="text-2xl">ॐ</span> हिंदी भजन मंजरी
          </Link>
          <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-3 py-1 rounded-full font-bold">
            मानवता एवं राहत अभियान
          </span>
        </div>
      </header>

      {/* 🌟 Main Content */}
      <main className="max-w-3xl mx-auto px-4 pt-8">
        
        {/* 🌟 HERO CARD: Short Intro & Instant Razorpay Contribution */}
        <div className="bg-white rounded-3xl border border-orange-200 p-6 md:p-10 shadow-xl text-center mb-10 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-orange-500 via-red-500 to-amber-500"></div>

          <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 font-bold text-xs uppercase tracking-wider px-4 py-1.5 rounded-full border border-red-100 mb-4">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
            आपात्कालीन मानवीय सहायता
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 mb-4 leading-tight">
            सिर्फ न्यायपूर्ण शिक्षा की मांग की, <br />
            <span className="text-red-600">जवाब मिला लाठियों से!</span>
          </h1>

          <p className="text-gray-600 text-base md:text-lg max-w-xl mx-auto font-medium leading-relaxed mb-6">
            शांतिपूर्ण प्रदर्शन के दौरान प्रभावित हुए बच्चों, महिलाओं, युवाओं व स्वयंसेवकों तक भोजन, पानी, प्राथमिक चिकित्सा एवं आवश्यक राहत सामग्री पहुँचाने में सहयोग करें।
          </p>

          {/* Instant Contribution Button Box */}
          <div className="bg-orange-50/60 border border-orange-200/80 rounded-2xl p-6 text-center max-w-md mx-auto shadow-inner">
            <p className="text-sm font-bold text-gray-800 mb-4">
              निःस्वार्थ भाव से अपना योगदान दें:
            </p>
            
            {/* Embedded Razorpay Payment Button Frame */}
            <div className="flex justify-center items-center min-h-[50px]">
              <form ref={formRef} className="w-full flex justify-center"></form>
            </div>

            <p className="text-[11px] text-gray-500 mt-4 font-medium flex items-center justify-center gap-1">
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg>
              100% सुरक्षित भुगतान (Razorpay Verified)
            </p>
          </div>
        </div>

        {/* 🌟 MOVEMENT & NEED BREAKDOWN SECTION */}
        <div className="space-y-8">
          
          {/* Section Heading */}
          <div className="text-center max-w-lg mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              आपकी सहायता कहाँ और कैसे पहुँचती है?
            </h2>
            <p className="text-sm text-gray-600 font-medium">
              हमारा लक्ष्य प्रभावित नागरिकों और स्वयंसेवकों तक बुनियादी ज़रूरतें बिना किसी रुकावट के पहुँचाना है। आपका सहयोग निम्नलिखित राहत कार्यों में उपयोग किया जाएगा:
            </p>
          </div>

          {/* Grid of Essentials */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-4 transition-shadow hover:shadow-md">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
                🍱
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">भोजन व्यवस्था</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  कठिन परिस्थितियों में फंसे छात्रों, युवाओं और परिवारों तक स्वच्छ व ताजा भोजन पहुँचाना।
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-4 transition-shadow hover:shadow-md">
              <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
                💧
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">स्वच्छ पेयजल</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  पीने के पानी की बोतलें और आवश्यक हाइड्रेशन सामग्री (जैसे ORS) उपलब्ध कराना।
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-4 transition-shadow hover:shadow-md">
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
                🩹
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">प्राथमिक चिकित्सा</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  घायलों के लिए फर्स्ट-एड किट, पट्टियाँ और आवश्यक जीवनरक्षक दवाइयाँ सुनिश्चित करना।
                </p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex items-start gap-4 transition-shadow hover:shadow-md">
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-2xl shrink-0">
                🩸
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base mb-1">सैनिटरी व राहत सामग्री</h3>
                <p className="text-xs text-gray-600 leading-relaxed font-medium">
                  प्रभावित महिलाओं और बच्चों की गरिमा व स्वास्थ्य सुरक्षा के लिए हाइजीन व सैनिटरी किट प्रदान करना।
                </p>
              </div>
            </div>

          </div>

          {/* Transparency & Mission Card */}
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-3xl border border-orange-200 p-8 shadow-sm mt-8">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🤝</span>
              <div>
                <h3 className="text-lg font-bold text-gray-900">100% मानवीय व पारदर्शी सहयोग</h3>
                <p className="text-xs text-gray-600 font-medium">हमारी प्रतिबद्धता केवल ज़रूरतमंदों की निस्वार्थ सेवा है।</p>
              </div>
            </div>
            
            <p className="text-sm text-gray-700 leading-relaxed font-medium mb-6">
              यह राहत अभियान किसी भी राजनीतिक विचारधारा से परे है। इसका एकमात्र उद्देश्य निष्पक्ष रूप से उन मासूम बच्चों, महिलाओं और युवाओं तक मदद पहुँचाना है जो व्यवस्था सुधार की मांग के दौरान अप्रत्याशित रूप से प्रभावित हुए हैं।
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-orange-200/60 text-xs font-bold text-gray-700">
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                भोजन व दवाइयाँ
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                त्वरित जमीनी सहायता
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                पारदर्शी वितरण
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="mt-12 mb-8 text-center">
          <p className="text-xs text-gray-500 leading-relaxed max-w-lg mx-auto font-medium">
            राशि नहीं, आपकी भावना सबसे महत्वपूर्ण है। आपका हर योगदान किसी पीड़ित के चेहरे पर मुस्कान और उम्मीद ला सकता है। ❤️
          </p>
        </div>

      </main>
    </div>
  );
}