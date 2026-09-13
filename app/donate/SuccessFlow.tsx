'use client';

import { useState } from 'react';
import Link from 'next/link';

interface SuccessFlowProps {
  paymentId: string;
  amount: number;
}

export default function SuccessFlow({ paymentId, amount }: SuccessFlowProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [donorType, setDonorType] = useState<'secret' | 'public' | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    message: '',
    photo_url: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false); // 🌟 NEW: Better UX for Image Upload
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // 🌟 Client-Side Image Compression (Shrinks Base64 to ~40KB-80KB to prevent 500 Server Errors)
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Convert to compressed JPEG base64 (75% quality)
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
          resolve(compressedBase64);
        };
        img.onerror = (error) => reject(error);
      };
      reader.onerror = (error) => reject(error);
    });
  };

  // 🌟 Handle Image Selection with Automatic Compression
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('कृपया केवल इमेज फ़ाइल अपलोड करें।');
      return;
    }

    try {
      setIsCompressing(true);
      const compressedBase64 = await compressImage(file);
      setFormData((prev) => ({ ...prev, photo_url: compressedBase64 }));
    } catch (err) {
      console.error('Image compression error:', err);
      alert('फोटो प्रोसेस करने में समस्या आई, कृपया दूसरी फोटो चुनें।');
    } finally {
      setIsCompressing(false);
    }
  };

  const handleTypeSelection = async (type: 'secret' | 'public') => {
    setDonorType(type);
    setErrorMessage(null);

    if (type === 'secret') {
      await submitToDatabase({
        ...formData,
        name: 'गुप्त दानकर्ता',
        is_anonymous: true,
      });
    } else {
      setStep(2);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    await submitToDatabase({ ...formData, is_anonymous: false });
  };

  // 🌟 Multi-Key Resilient API Submission (Upgraded for Cashfree)
  const submitToDatabase = async (data: any) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    // 🌟 FULLY UPGRADED PAYLOAD: Now supports Cashfree seamlessly while maintaining backward compatibility
    const payload = {
      paymentId: paymentId,
      cf_order_id: paymentId,           // 👈 Cashfree Primary ID match
      cf_transaction_id: paymentId,     // 👈 Cashfree Fallback Match
      razorpay_payment_id: paymentId,   // 👈 Old Razorpay compatibility 
      razorpay_order_id: paymentId,     // 👈 Old Razorpay compatibility
      amount: amount || 0,
      name: data.name || (data.is_anonymous ? 'गुप्त दानकर्ता' : 'सहयोगी'),
      message: data.message || '',
      photo_url: data.photo_url || '',
      is_anonymous: data.is_anonymous || false,
    };

    try {
      const response = await fetch('/api/supporters/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
      }

      setStep(3);
    } catch (error: any) {
      console.error('Failed to update donor info:', error);
      setErrorMessage(
        'विवरण सेव करने में समस्या आई, लेकिन आपका पेमेंट सुरक्षित रूप से प्राप्त हो चुका है।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 font-hind tracking-wide">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl shadow-orange-900/5 border border-orange-100 overflow-hidden relative">
        {/* Top Decorative Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400"></div>

        <div className="p-6 sm:p-8">
          {/* 🌟 Inline Graceful Error Banner */}
          {errorMessage && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
              <p className="text-xs sm:text-sm font-bold text-amber-800 leading-snug">
                {errorMessage}
              </p>
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() =>
                    submitToDatabase({
                      ...formData,
                      is_anonymous: donorType === 'secret',
                    })
                  }
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 active:scale-95 text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  {isSubmitting ? 'प्रयास जारी...' : 'पुनः प्रयास करें'}
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 active:scale-95 text-gray-800 text-xs font-bold rounded-xl transition-all"
                >
                  प्रमाण पत्र देखें →
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 1: CHOOSE DONOR TYPE 
              ========================================== */}
          {step === 1 && (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-5 border border-green-100 shadow-sm">
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3">
                सहयोग सफल रहा!
              </h1>
              <p className="text-gray-600 mb-8 font-medium text-base sm:text-lg">
                ₹{amount || 0} का आपका दान सफलतापूर्वक प्राप्त हुआ। क्या आप
                अपना नाम हमारे &apos;सहयोगी पृष्ठ&apos; पर दिखाना चाहेंगे?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <button
                  onClick={() => handleTypeSelection('public')}
                  className="p-6 border-2 border-orange-100 bg-orange-50/30 rounded-2xl hover:border-orange-500 hover:bg-orange-50 hover:shadow-md transition-all group text-left relative overflow-hidden"
                >
                  <div className="text-orange-600 mb-3 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-orange-100 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="font-black text-gray-900 text-xl mb-1">
                    सार्वजनिक सहयोगी
                  </h3>
                  <p className="text-sm font-medium text-gray-500 line-clamp-2">
                    अपना नाम, चित्र और संदेश वेबसाइट पर प्रदर्शित करें।
                  </p>
                </button>

                <button
                  onClick={() => handleTypeSelection('secret')}
                  disabled={isSubmitting}
                  className="p-6 border-2 border-gray-100 bg-gray-50/50 rounded-2xl hover:border-gray-400 hover:bg-gray-50 hover:shadow-md transition-all group text-left relative overflow-hidden disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting && donorType === 'secret' && (
                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center z-10">
                      <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mb-2"></div>
                      <span className="text-xs font-bold text-orange-600 animate-pulse">अपडेट हो रहा है...</span>
                    </div>
                  )}
                  <div className="text-gray-500 mb-3 bg-white w-12 h-12 rounded-xl flex items-center justify-center shadow-sm border border-gray-200 group-hover:scale-110 transition-transform">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  </div>
                  <h3 className="font-black text-gray-900 text-xl mb-1">गुप्त दान</h3>
                  <p className="text-sm font-medium text-gray-500 line-clamp-2">
                    पहचान गुप्त रखें। केवल प्रमाण पत्र प्राप्त करें।
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 2: PUBLIC DONOR DETAILS (WITH UPLOAD)
              ========================================== */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-8 duration-500">
              <h2 className="text-3xl font-black text-gray-900 mb-2">
                सहयोगी विवरण
              </h2>
              <p className="text-base font-medium text-gray-500 mb-8 pb-4 border-b border-gray-100">
                यह जानकारी हमारे <span className="font-bold text-orange-600">&apos;सहयोगी पृष्ठ&apos;</span> पर प्रदर्शित की जाएगी।
              </p>

              <form onSubmit={handleFormSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    पूरा नाम <span className="text-red-500">*</span>
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="उदा. मोहित शर्मा"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl font-bold text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white outline-none transition-all shadow-sm"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">
                    संदेश (वैकल्पिक)
                  </label>
                  <textarea
                    placeholder="सनातन धर्म के लिए कोई संदेश या विचार..."
                    rows={3}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl font-medium text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white outline-none transition-all resize-none shadow-sm"
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>

                {/* 🌟 Compressed Image Upload UI */}
                <div className="bg-orange-50/50 rounded-2xl p-5 border border-orange-100/50">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                    प्रोफाइल चित्र (वैकल्पिक)
                  </label>
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 rounded-full border-2 border-dashed border-orange-300 flex items-center justify-center bg-white overflow-hidden shrink-0 shadow-sm">
                      {isCompressing ? (
                        <div className="w-6 h-6 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
                      ) : formData.photo_url ? (
                        <img
                          src={formData.photo_url}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-orange-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1">
                      <input
                        type="file"
                        id="photo-upload"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                        disabled={isCompressing}
                      />
                      <label
                        htmlFor="photo-upload"
                        className={`cursor-pointer text-sm font-bold px-5 py-2.5 rounded-xl transition-all inline-flex items-center gap-2 ${isCompressing ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white border border-orange-200 text-orange-600 hover:bg-orange-50 shadow-sm'}`}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                        {isCompressing ? 'प्रोसेस हो रहा है...' : 'नई फोटो चुनें'}
                      </label>
                      <p className="text-[11px] font-bold text-gray-400 mt-2">
                        स्वतः छोटा एवं ऑप्टिमाइज़ किया जाएगा
                      </p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex gap-4">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-4 border-2 border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-50 hover:text-gray-900 transition-all"
                  >
                    पीछे जाएँ
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isCompressing}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-black text-lg rounded-xl py-4 flex justify-center items-center transition-all shadow-[0_8px_20px_rgba(234,88,12,0.3)] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        सुरक्षित हो रहा है...
                      </div>
                    ) : (
                      'विवरण सुरक्षित करें'
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==========================================
              STEP 3: DIGITAL CERTIFICATE
              ========================================== */}
          {step === 3 && (
            <div className="text-center animate-in zoom-in duration-700">
              <h2 className="text-sm font-black text-orange-600 uppercase tracking-widest mb-6">
                आपका सम्मान पत्र
              </h2>

              {/* Certificate Canvas */}
              <div className="relative p-2 bg-gradient-to-br from-[#fbbf24] via-[#fef3c7] to-[#fb923c] rounded-2xl shadow-2xl mb-8">
                <div className="bg-[#fffdfa] border-[3px] border-double border-orange-300 p-8 sm:p-10 rounded-xl relative overflow-hidden">
                  
                  {/* Subtle Background OM */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] text-[200px] pointer-events-none select-none text-orange-900">
                    ॐ
                  </div>

                  <div className="relative z-10">
                    <p className="text-orange-800 font-black tracking-[0.3em] text-sm uppercase mb-6 opacity-80">
                      प्रमाण पत्र
                    </p>
                    
                    <h3 className="text-3xl sm:text-4xl font-black text-gray-900 mb-8 drop-shadow-sm">
                      {donorType === 'secret'
                        ? 'गुप्त दानकर्ता'
                        : formData.name || 'सनातन सहयोगी'}
                    </h3>

                    <p className="text-gray-700 text-base sm:text-lg leading-relaxed mb-8 font-medium">
                      सनातन धर्म और <strong>हिंदी भजन मंजरी</strong> के उद्देश्यों की पूर्ति हेतु
                      <span className="inline-block bg-orange-100 text-orange-800 font-black px-3 py-1 rounded-lg mx-2 border border-orange-200">
                        ₹{amount || 0}
                      </span>
                      का अमूल्य योगदान देने के लिए हम आपके अत्यंत आभारी हैं। ईश्वर
                      आप पर कृपा बनाए रखें।
                    </p>

                    <div className="flex justify-between items-end border-t-2 border-dashed border-orange-200 pt-6 mt-6">
                      <div className="text-left">
                        <p className="text-[10px] text-orange-600/80 font-black uppercase tracking-wider mb-1">
                          Transaction ID
                        </p>
                        <p className="text-sm text-gray-900 font-mono font-bold bg-orange-50 px-2 py-1 rounded inline-block">
                          {paymentId.slice(0, 14)}...
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-orange-600/80 font-black uppercase tracking-wider mb-1">
                          Date
                        </p>
                        <p className="text-sm text-gray-900 font-mono font-bold bg-orange-50 px-2 py-1 rounded inline-block">
                          {new Date().toLocaleDateString('en-IN')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-4 bg-white hover:bg-gray-50 border-2 border-gray-200 text-gray-800 font-bold text-lg rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  डाउनलोड
                </button>
                <Link
                  href="/"
                  className="flex-1 py-4 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white font-black text-lg rounded-2xl transition-all flex items-center justify-center shadow-[0_8px_20px_rgba(234,88,12,0.3)] active:scale-95"
                >
                  मुख्य पृष्ठ पर जाएँ
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}