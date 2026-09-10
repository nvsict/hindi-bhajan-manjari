"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import {
  createMultiBhajanDocument,
} from '@/lib/publication/content/selector';
import { ScriptLanguage, PublicationDocument } from '@/lib/publication/types';
import {
  FaFilePdf, FaSpinner, FaRedo, FaExclamationTriangle,
  FaRupeeSign, FaShieldAlt, FaWhatsapp, FaCheckCircle, 
  FaLanguage, FaBook, FaPalette, FaUser, FaPhoneAlt, 
  FaArrowLeft, FaCheckSquare, FaRegSquare
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

// 🌟 RAZORPAY SCRIPT LOADER
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

type FlowStatus = 'idle' | 'payment_pending' | 'building' | 'rendering' | 'ready' | 'error';

export default function EbookProductCheckout() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string; // URL से ई-बुक का स्लग मिलेगा

  // --- DATA STATE ---
  const [loading, setLoading] = useState(true);
  const [ebookDetails, setEbookDetails] = useState<any>(null);
  const [bhajans, setBhajans] = useState<any[]>([]);
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  // --- CHECKOUT STATE ---
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [script, setScript] = useState<ScriptLanguage>('devanagari');
  const [theme, setTheme] = useState<string>('default');
  
  // --- SYSTEM STATE ---
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle');
  const [errorMessage, setErrorMessage] = useState("");
  const [isPaid, setIsPaid] = useState(false);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const lastDownloadUrl = useRef<string | null>(null);

  // 1. 🌟 FETCH EBOOK TEMPLATE & BHAJANS
  useEffect(() => {
    const fetchEbookData = async () => {
      if (!slug) return;
      setLoading(true);

      try {
        // A. Fetch E-Book Rules from Database
        // (Assuming you made a table 'ebook_templates' with the structure we discussed)
        const { data: ebook, error: ebookErr } = await supabase
          .from('ebook_templates')
          .select('*')
          .eq('slug', slug)
          .single();

        if (ebookErr || !ebook) throw new Error("ई-बुक नहीं मिली!");
        setEbookDetails(ebook);

        // B. Fetch Bhajans based on Rules (Dynamic Rule Execution)
        let query = supabase.from('mv_bhajan_details').select('slug, title_hindi, title_hinglish');
        
        if (ebook.filter_deity_name) {
          query = query.eq('deity->>name_hindi', ebook.filter_deity_name);
        }
       if (ebook.filter_category_name) {
          // 🌟 FIX: JSON.stringify का इस्तेमाल करें ताकि [object Object] वाला 400 Error ना आए
          query = query.contains('categories', JSON.stringify([{ name_hindi: ebook.filter_category_name }]));
        }

        // Limit the results to the target count (e.g., Top 51)
        query = query.limit(ebook.target_count);

        const { data: bhajanList, error: bhajanErr } = await query;
        
        if (bhajanErr) throw new Error("भजन सूची लोड नहीं हो सकी।");
        
        setBhajans(bhajanList || []);
        // By default, select all fetched bhajans for the book
        setSelectedSlugs(bhajanList?.map(b => b.slug) || []);

      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEbookData();
  }, [slug]);

  // 🌟 TOGGLE SPECIFIC BHAJANS (Customization)
  const toggleBhajan = (bhajanSlug: string) => {
    setSelectedSlugs(prev => 
      prev.includes(bhajanSlug) 
        ? prev.filter(s => s !== bhajanSlug) 
        : [...prev, bhajanSlug]
    );
  };

  // 🌟 RAZORPAY PAYMENT & PDF GENERATION (All-in-one flow)
  const handleCheckoutAndDownload = async () => {
    if (selectedSlugs.length === 0) return alert("कृपया कम से कम 1 भजन चुनें।");
    if (!buyerName.trim()) return setErrorMessage("कृपया अपना नाम दर्ज करें।");
    if (buyerPhone.length !== 10 || isNaN(Number(buyerPhone))) return setErrorMessage("कृपया 10 अंकों का सही WhatsApp नंबर दर्ज करें।");
    
    setErrorMessage("");
    setFlowStatus('payment_pending');

    try {
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) throw new Error("पेमेंट गेटवे लोड नहीं हो पाया। इंटरनेट चेक करें।");

      // 1. Create Order
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: ebookDetails.price }) // 🌟 Fixed bundle price!
      });

      if (!orderRes.ok) throw new Error("ऑर्डर नहीं बन सका।");
      const orderData = await orderRes.json();
      setSavedOrderId(orderData.id);

      // 2. Open Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: "INR",
        name: "Hindi Bhajan Manjari",
        description: ebookDetails.title,
        order_id: orderData.id,
        prefill: {
          name: buyerName.trim(),
          contact: buyerPhone.trim(),
        },
        theme: { color: "#ea580c" },
        modal: {
          ondismiss: () => setFlowStatus('idle')
        },
        handler: async function(response: any) {
          // PAYMENT SUCCESS -> DIRECTLY GENERATE PDF
          setIsPaid(true);
          await generateEbookPDF(selectedSlugs, ebookDetails.title, script, theme);
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (error: any) {
      setFlowStatus('error');
      setErrorMessage(error.message || "भुगतान में समस्या आई।");
    }
  };

  // 🌟 PUPPETEER PDF GENERATOR LOGIC
  const generateEbookPDF = async (slugs: string[], title: string, userScript: ScriptLanguage, userTheme: string) => {
    setFlowStatus('building');
    try {
      const opts: any = {
        script: userScript,
        theme: userTheme,
        themeName: userTheme, 
        pageSize: 'A4', 
        includeMeaning: true, 
        fontSizeScale: 1.0, 
        customTitle: title // Using the Bundle Title!
      };

      // Create multi-bhajan document
      const model = await createMultiBhajanDocument(title, slugs, opts);
      if (!model) throw new Error("डेटा तैयार नहीं हो सका।");

      setFlowStatus('rendering');
      
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model),
      });

      if (!response.ok) throw new Error("सर्वर एरर (PDF Rendering)");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      lastDownloadUrl.current = url;
      triggerDownload(url, title);
      setFlowStatus('ready');

    } catch (err: any) {
      setFlowStatus('error');
      setErrorMessage(err.message || "PDF बनाने में समस्या आई।");
    }
  };

  const triggerDownload = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}_BhajanManjari.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffaf5]">
        <FaSpinner className="animate-spin text-4xl text-orange-500 mb-4" />
        <p className="text-gray-500 font-bold font-hindi animate-pulse">ई-बुक का डेटा लोड हो रहा है...</p>
      </div>
    );
  }

  if (!ebookDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] text-red-500 font-bold text-xl">
        ई-बुक नहीं मिली या लिंक गलत है।
      </div>
    );
  }

  const inputStyles = "w-full bg-white border border-gray-200 rounded-xl px-4 py-3.5 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-[#fffaf5] font-sans selection:bg-orange-200 pb-20">
      
      {/* HEADER */}
      <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full bg-gray-50 text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors">
            <FaArrowLeft />
          </button>
          <h1 className="text-lg md:text-xl font-black text-gray-900 font-hindi truncate">
            {ebookDetails.title} सुरक्षित चेकआउट
          </h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ==========================================
              LEFT COLUMN: PRODUCT PREVIEW & CONTENT 
              ========================================== */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* HERO PRODUCT BANNER */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-orange-100 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center sm:items-start relative overflow-hidden">
              <div className="absolute -right-10 -top-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl"></div>
              
              <div className="relative w-[160px] sm:w-[200px] shrink-0 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl border border-gray-200 z-10">
                <div className="absolute left-0 top-0 bottom-0 w-4 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
                <Image src={ebookDetails.cover_image_url} alt={ebookDetails.title} fill className="object-cover" />
              </div>

              <div className="flex-1 text-center sm:text-left z-10">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-600 text-[10px] font-black uppercase tracking-widest mb-4">
                  <HiSparkles size={12} /> {ebookDetails.tag || "Best Seller"}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-hindi mb-2 leading-tight">
                  {ebookDetails.title}
                </h2>
                <p className="text-gray-500 font-medium mb-6">{ebookDetails.subtitle}</p>
                
                <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
                 <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2 flex items-center gap-2">
    <FaBook className="text-orange-500" />
    {/* 🌟 FIX: यहाँ असल भजनों की गिनती (bhajans.length) दिखाई जा रही है */}
    <span className="text-sm font-bold text-gray-800">{bhajans.length} भजन</span>
  </div>
                  <div className="bg-orange-50 border border-orange-100 rounded-xl px-4 py-2 flex items-center gap-2">
                    <FaFilePdf className="text-orange-500" />
                    <span className="text-sm font-bold text-gray-800">हाई-क्वालिटी PDF</span>
                  </div>
                </div>
              </div>
            </div>

            {/* BHAJAN LIST (TABLE OF CONTENTS / CUSTOMIZATION) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-gray-900 font-hindi">
                  इस ई-बुक में क्या-क्या है?
                </h3>
                <span className="text-sm font-bold text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                  चयनित: {selectedSlugs.length}/{bhajans.length}
                </span>
              </div>
              <p className="text-gray-500 text-sm mb-6">
                आप चाहें तो नीचे दी गई सूची में से किसी भजन को हटा (Untick) भी सकते हैं। आपकी PDF आपके चयन के अनुसार ही बनेगी।
              </p>

              <div className="bg-gray-50 rounded-2xl p-2 h-[400px] overflow-y-auto custom-scrollbar border border-gray-200">
                {bhajans.map((bhajan, idx) => {
                  const isSelected = selectedSlugs.includes(bhajan.slug);
                  return (
                    <div 
                      key={bhajan.slug} 
                      onClick={() => toggleBhajan(bhajan.slug)}
                      className={`flex items-center gap-4 p-3.5 mb-1.5 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-white shadow-sm border border-gray-100 hover:border-orange-300' : 'bg-transparent hover:bg-gray-200 opacity-60 grayscale'}`}
                    >
                      <div className="text-orange-500 text-lg shrink-0">
                        {isSelected ? <FaCheckSquare /> : <FaRegSquare className="text-gray-400" />}
                      </div>
                      <div className="text-xs font-bold text-gray-400 w-6 text-center">{idx + 1}.</div>
                      <div className={`font-bold text-sm font-hindi truncate flex-1 ${isSelected ? 'text-gray-800' : 'text-gray-500 line-through'}`}>
                        {bhajan.title_hindi}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ==========================================
              RIGHT COLUMN: STICKY CHECKOUT FORM
              ========================================== */}
          <div className="lg:col-span-5 lg:sticky lg:top-24">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
              
              <div className="p-6 sm:p-8">
                
                {/* PRICING HEADER */}
                <div className="flex items-end justify-between mb-8 pb-6 border-b border-gray-100">
                  <div>
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-1">कुल राशि</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-gray-900 flex items-center">
                        <FaRupeeSign className="text-3xl" />{ebookDetails.price}
                      </span>
                      <span className="text-lg font-bold text-gray-400 line-through">₹{ebookDetails.original_price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-block bg-green-100 text-green-700 px-3 py-1 rounded-lg text-xs font-black uppercase">
                      Save ₹{ebookDetails.original_price - ebookDetails.price}
                    </span>
                  </div>
                </div>

                {/* FLOW: IDLE / PAYMENT (Showing the form) */}
                {(flowStatus === 'idle' || flowStatus === 'payment_pending' || flowStatus === 'error') && (
                  <div className="space-y-5 animate-in fade-in">
                    
                    {/* CUSTOMIZATION PREFS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                          <FaLanguage className="text-orange-500" /> भाषा (Lipi)
                        </label>
                        <select value={script} onChange={(e) => setScript(e.target.value as ScriptLanguage)} className={inputStyles}>
                          <option value="devanagari">हिंदी (Devanagari)</option>
                          <option value="gujarati">ગુજરાતી (Gujarati)</option>
                          <option value="hinglish">English (Hinglish)</option>
                        </select>
                      </div>
                      <div>
                        <label className="flex items-center gap-1.5 text-xs font-bold text-gray-500 mb-2">
                          <FaPalette className="text-orange-500" /> डिज़ाइन थीम
                        </label>
                        <select value={theme} onChange={(e) => setTheme(e.target.value)} className={inputStyles}>
                          <option value="default">क्लासिक (सफेद)</option>
                          <option value="sawan">सावन (हरा)</option>
                          <option value="navratri">नवरात्रि (लाल)</option>
                        </select>
                      </div>
                    </div>

                    <hr className="border-gray-100 my-2" />

                    {/* BUYER DETAILS */}
                    {!isPaid && (
                      <div className="space-y-4">
                        <div className="relative">
                          <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="text" placeholder="आपका शुभ नाम" value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                            className={`pl-11 ${inputStyles}`} 
                          />
                        </div>
                        <div className="relative">
                          <FaPhoneAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                          <input type="tel" maxLength={10} placeholder="WhatsApp नंबर (GPay/PhonePe के लिए)" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, ''))}
                            className={`pl-11 ${inputStyles}`} 
                          />
                        </div>
                      </div>
                    )}

                    {/* ERROR ALERTS */}
                    {errorMessage && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm font-bold rounded-xl flex items-center gap-2">
                        <FaExclamationTriangle className="shrink-0" /> {errorMessage}
                      </div>
                    )}

                    {/* CTA BUTTON */}
                    <button
                      onClick={handleCheckoutAndDownload} 
                      disabled={flowStatus === 'payment_pending' || selectedSlugs.length === 0}
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black text-lg py-4 rounded-xl shadow-[0_8px_20px_rgba(234,88,12,0.3)] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {flowStatus === 'payment_pending' ? (
                        <><FaSpinner className="animate-spin" /> भुगतान विंडो खुल रही है...</>
                      ) : (
                        <><FaShieldAlt /> ₹{ebookDetails.price} सुरक्षित भुगतान करें</>
                      )}
                    </button>
                    
                    <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-4">
                      <FaCheckCircle className="text-green-500" /> इंस्टेंट PDF डाउनलोड • लाइफटाइम एक्सेस
                    </div>
                  </div>
                )}

                {/* FLOW: BUILDING / RENDERING / READY */}
                {(flowStatus === 'building' || flowStatus === 'rendering' || flowStatus === 'ready') && (
                  <div className="py-8 flex flex-col items-center text-center animate-in zoom-in duration-500">
                    
                    {flowStatus !== 'ready' ? (
                      <>
                        <div className="relative w-20 h-20 mb-6">
                          <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                          <FaFilePdf className="absolute inset-0 m-auto text-2xl text-orange-500 animate-pulse" />
                        </div>
                        <h3 className="text-xl font-black font-hindi mb-2 text-gray-900">
                          {flowStatus === 'building' ? 'भजनों को कस्टमाइज़ किया जा रहा है...' : 'PDF ई-बुक तैयार हो रही है...'}
                        </h3>
                        <p className="text-gray-500 text-sm">कृपया पेज को बंद या रिफ्रेश न करें। बस कुछ सेकंड्स...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                          <FaCheckCircle className="text-4xl text-green-500" />
                        </div>
                        <h3 className="text-2xl font-black font-hindi mb-2 text-gray-900">ई-बुक डाउनलोड के लिए तैयार है!</h3>
                        <p className="text-gray-500 text-sm mb-8">आपका डाउनलोड स्वतः शुरू हो गया होगा।</p>
                        
                        <button 
                          onClick={() => { if(lastDownloadUrl.current) triggerDownload(lastDownloadUrl.current, ebookDetails.title); }} 
                          className="w-full bg-gray-900 hover:bg-black text-white px-6 py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg"
                        >
                          <FaFilePdf /> PDF पुनः डाउनलोड करें
                        </button>
                      </>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}