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
  
  // 🌟 State keys updated to match your Supabase table schema exactly
  const [formData, setFormData] = useState({ name: '', message: '', photo_url: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle the transition based on donor choice
  const handleTypeSelection = (type: 'secret' | 'public') => {
    setDonorType(type);
    if (type === 'secret') {
      // Secret donors skip the details form and go straight to the certificate
      submitToDatabase({ ...formData, name: 'गुप्त दानकर्ता', is_anonymous: true });
    } else {
      setStep(2);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitToDatabase({ ...formData, is_anonymous: false });
  };

  // 🌟 Function to update your database with donor details (API call activated)
  const submitToDatabase = async (data: any) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/supporters/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId, ...data }),
      });
      
      if (!response.ok) throw new Error("Failed to update database");
      
      setStep(3);
    } catch (error) {
      console.error("Failed to update donor info:", error);
      // Fallback: If DB update fails, still show them the certificate because they paid
      alert("विवरण सेव करने में समस्या आई, लेकिन आपका पेमेंट सफल रहा।");
      setStep(3);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4">
      <div className="max-w-xl w-full bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
        
        {/* Top Decorative Bar */}
        <div className="h-2 w-full bg-gradient-to-r from-orange-400 via-red-500 to-orange-400"></div>

        <div className="p-8">
          
          {/* ==========================================
              STEP 1: CHOOSE DONOR TYPE 
              ========================================== */}
          {step === 1 && (
            <div className="text-center animate-in fade-in zoom-in duration-500">
              <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">सहयोग सफल रहा!</h1>
              <p className="text-gray-600 mb-6 font-medium">
                ₹{amount || 0} का आपका दान सफलतापूर्वक प्राप्त हुआ। क्या आप अपना नाम हमारे 'सहयोगी पृष्ठ' पर दिखाना चाहेंगे?
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8">
                <button 
                  onClick={() => handleTypeSelection('public')}
                  className="p-6 border-2 border-orange-200 rounded-2xl hover:border-orange-500 hover:bg-orange-50 transition-all group text-left"
                >
                  <div className="text-orange-600 mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">सार्वजनिक सहयोगी</h3>
                  <p className="text-xs text-gray-500 mt-1">अपना नाम, चित्र और संदेश वेबसाइट पर प्रदर्शित करें।</p>
                </button>

                <button 
                  onClick={() => handleTypeSelection('secret')}
                  className="p-6 border-2 border-gray-200 rounded-2xl hover:border-gray-400 hover:bg-gray-50 transition-all group text-left relative overflow-hidden"
                >
                  {isSubmitting && donorType === 'secret' && (
                     <div className="absolute inset-0 bg-white/80 flex items-center justify-center"><div className="w-6 h-6 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div></div>
                  )}
                  <div className="text-gray-500 mb-2">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"></path></svg>
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg">गुप्त दान</h3>
                  <p className="text-xs text-gray-500 mt-1">पहचान गुप्त रखें। केवल प्रमाण पत्र प्राप्त करें।</p>
                </button>
              </div>
            </div>
          )}

          {/* ==========================================
              STEP 2: PUBLIC DONOR DETAILS
              ========================================== */}
          {step === 2 && (
            <div className="animate-in slide-in-from-right-8 duration-500">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">सहयोगी विवरण</h2>
              <p className="text-sm text-gray-500 mb-6">यह जानकारी हमारे 'सहयोगी पृष्ठ' पर प्रदर्शित की जाएगी।</p>
              
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">पूरा नाम</label>
                  <input 
                    required
                    type="text" 
                    placeholder="उदा. मोहित शर्मा"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">संदेश (वैकल्पिक)</label>
                  <textarea 
                    placeholder="सनातन धर्म के लिए कोई संदेश..."
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-orange-500 focus:ring-2 focus:ring-orange-200 outline-none transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-2">प्रोफाइल चित्र चुनें (वैकल्पिक)</label>
                  <div className="flex gap-3">
                     {[1, 2, 3, 4].map((num) => (
                       <button 
                         key={num}
                         type="button"
                         onClick={() => setFormData({...formData, photo_url: `/avatars/av-${num}.png`})}
                         className={`w-12 h-12 rounded-full border-2 overflow-hidden transition-all ${formData.photo_url === `/avatars/av-${num}.png` ? 'border-orange-500 scale-110 shadow-md' : 'border-transparent opacity-60 hover:opacity-100'}`}
                       >
                         <img src={`https://api.dicebear.com/7.x/notionists/svg?seed=${num}&backgroundColor=ffedd5`} alt="Avatar" className="w-full h-full object-cover bg-orange-50" />
                       </button>
                     ))}
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50"
                  >
                    पीछे
                  </button>
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl py-3 flex justify-center items-center"
                  >
                    {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'विवरण सुरक्षित करें'}
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
              <h2 className="text-xl font-bold text-gray-500 uppercase tracking-widest mb-6">आपका सम्मान पत्र</h2>
              
              {/* Certificate Box */}
              <div className="relative p-1 bg-gradient-to-br from-orange-300 via-orange-100 to-orange-300 rounded-lg shadow-xl mb-8">
                <div className="bg-white border-2 border-dashed border-orange-200 p-8 rounded-md relative overflow-hidden">
                  
                  {/* Decorative Background Om */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-5 text-9xl pointer-events-none">ॐ</div>

                  <p className="text-orange-600 font-bold tracking-widest text-xs uppercase mb-4">प्रमाण पत्र</p>
                  <h3 className="text-3xl font-bold text-gray-900 mb-6">
                    {donorType === 'secret' ? 'गुप्त दानकर्ता' : formData.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-6 font-medium">
                    सनातन धर्म और हिंदी भजन मंजरी के उद्देश्यों की पूर्ति हेतु 
                    <span className="font-bold text-orange-600 mx-1">₹{amount || 0}</span> 
                    का अमूल्य योगदान देने के लिए हम आपके अत्यंत आभारी हैं। ईश्वर आप पर कृपा बनाए रखें।
                  </p>

                  <div className="flex justify-between items-end border-t border-gray-100 pt-4 mt-4">
                    <div className="text-left">
                      <p className="text-xs text-gray-400 font-bold uppercase">Transaction ID</p>
                      <p className="text-xs text-gray-800 font-mono">{paymentId.slice(0, 12)}...</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400 font-bold uppercase">Date</p>
                      <p className="text-xs text-gray-800 font-mono">{new Date().toLocaleDateString('en-IN')}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                {/* 🌟 Added window.print() for instant PDF generation/printing */}
                <button 
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
                  डाउनलोड
                </button>
                <Link href="/" className="flex-1 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all flex items-center justify-center">
                  मुख्य पृष्ठ
                </Link>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}