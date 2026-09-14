"use client";

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import Image from 'next/image';
import { useParams, useRouter } from 'next/navigation';
import { load } from '@cashfreepayments/cashfree-js';
import { createMultiBhajanDocument } from '@/lib/publication/content/selector';
import { ScriptLanguage } from '@/lib/publication/types';
import {
  FaFilePdf, FaSpinner, FaRedo, FaExclamationTriangle,
  FaRupeeSign, FaShieldAlt, FaWhatsapp, FaCheckCircle, 
  FaLanguage, FaBook, FaPalette, FaUser, FaPhoneAlt, 
  FaArrowLeft, FaCheckSquare, FaRegSquare, FaLock
} from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';

type FlowStatus = 'idle' | 'payment_pending' | 'building' | 'rendering' | 'ready' | 'error';

export default function EbookProductCheckout() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

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
        const { data: ebook, error: ebookErr } = await supabase
          .from('ebook_templates')
          .select('*')
          .eq('slug', slug)
          .single();

        if (ebookErr || !ebook) throw new Error("ई-बुक नहीं मिली!");
        setEbookDetails(ebook);

        let query = supabase.from('mv_bhajan_details').select('slug, title_hindi, title_hinglish');
        
        if (ebook.filter_deity_name) {
          query = query.eq('deity->>name_hindi', ebook.filter_deity_name);
        }
        if (ebook.filter_category_name) {
          query = query.contains('categories', JSON.stringify([{ name_hindi: ebook.filter_category_name }]));
        }

        query = query.limit(ebook.target_count);

        const { data: bhajanList, error: bhajanErr } = await query;
        
        if (bhajanErr) throw new Error("भजन सूची लोड नहीं हो सकी।");
        
        setBhajans(bhajanList || []);
        setSelectedSlugs(bhajanList?.map(b => b.slug) || []);

      } catch (err: any) {
        setErrorMessage(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEbookData();
  }, [slug]);

  // 🌟 TOGGLE SPECIFIC BHAJANS
  const toggleBhajan = (bhajanSlug: string) => {
    setSelectedSlugs(prev => 
      prev.includes(bhajanSlug) 
        ? prev.filter(s => s !== bhajanSlug) 
        : [...prev, bhajanSlug]
    );
  };

  // 🌟 WHATSAPP SUPPORT HANDLER
  const handleSupportClick = () => {
    const text = encodeURIComponent(`हरि ॐ! मैंने "${ebookDetails?.title || 'E-Book'}" के लिए पेमेंट किया था लेकिन मुझे PDF नहीं मिली। कृपया सहायता करें।\n\nOrder ID: ${savedOrderId || 'N/A'}\nनाम: ${buyerName || 'N/A'}`);
    window.open(`https://wa.me/918384844353?text=${text}`, '_blank');
  };

  // 🌟 CASHFREE PAYMENT & IN-PLACE PDF GENERATION
  const handleCheckoutAndDownload = async () => {
    if (selectedSlugs.length === 0) return alert("कृपया कम से कम 1 भजन चुनें।");
    
    // 🌟 FORM VALIDATION (सिर्फ टेक्स्ट मैसेज दिखाएगा, बटन नहीं बदलेगा)
    if (!buyerName.trim()) {
      setErrorMessage("कृपया अपना शुभ नाम दर्ज करें।");
      return;
    }
    if (buyerPhone.length !== 10 || isNaN(Number(buyerPhone))) {
      setErrorMessage("कृपया 10 अंकों का सही WhatsApp नंबर दर्ज करें।");
      return;
    }
    
    setErrorMessage("");
    setFlowStatus('payment_pending');

    try {
      // 1. Create Order via Cashfree
      const orderRes = await fetch('/api/cashfree/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: ebookDetails.price,
          count: selectedSlugs.length,
          name: buyerName.trim(),     // Pass for Trackability
          phone: buyerPhone.trim(),
          returnPath: `/ebook/${slug}`
        })
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok) throw new Error(orderData.error || "ऑर्डर नहीं बन सका। कृपया इंटरनेट चेक करें।");
      
      setSavedOrderId(orderData.orderId);

      // ========================================================
      // 🌟 FIX: BTOA HACK (To prevent Hindi Font Crash in Cashfree)
      // ========================================================
      const originalBtoa = window.btoa;
      window.btoa = function (str) {
        try { return originalBtoa(str); } 
        catch (e) { return originalBtoa(unescape(encodeURIComponent(str))); }
      };

      const cashfree = await load({ mode: process.env.NEXT_PUBLIC_CASHFREE_MODE || 'sandbox' });
      
      // 3. Open Checkout in Modal
      cashfree.checkout({
        paymentSessionId: orderData.paymentSessionId,
        redirectTarget: '_modal'
      }).then(async (result: any) => {
        
        // Restore original btoa
        window.btoa = originalBtoa;

        if (result.error) {
          // 🚨 सिर्फ यहाँ पर flowStatus 'error' होगा और Retry बटन आएँगे
          setFlowStatus('error');
          setErrorMessage(result.error.message || "भुगतान रद्द कर दिया गया या विफल रहा।");
        } else if (result.paymentDetails) {
          // 🌟 PAYMENT SUCCESS! Generate PDF directly without changing pages
          setIsPaid(true);
          await generateEbookPDF(selectedSlugs, ebookDetails.title, script, theme);
        }
      });

    } catch (error: any) {
      console.error(error);
      // 🚨 यहाँ भी सर्वर/इंटरनेट फेलियर पर Retry बटन आएँगे
      setFlowStatus('error');
      setErrorMessage(error.message || "भुगतान शुरू करने में समस्या आई।");
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
        customTitle: title
      };

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
      setErrorMessage(err.message || "PDF बनाने में समस्या आई। अगर आपके पैसे कट गए हैं, तो कृपया नीचे दिए गए बटन से सहायता लें।");
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fffaf5] font-hind">
        <FaSpinner className="animate-spin text-5xl text-orange-500 mb-5 drop-shadow-md" />
        <p className="text-gray-600 font-bold text-lg animate-pulse tracking-wide">ई-बुक का डेटा लोड हो रहा है...</p>
      </div>
    );
  }

  if (!ebookDetails) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fffaf5] text-red-500 font-bold text-xl font-hind">
        ई-बुक नहीं मिली या लिंक गलत है।
      </div>
    );
  }

  const inputStyles = "w-full bg-gray-50 border border-gray-200 rounded-xl px-5 py-4 text-base font-bold text-gray-900 outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 focus:bg-white transition-all shadow-sm";

  return (
    <div className="min-h-screen bg-[#fffaf5] font-hind selection:bg-orange-200 pb-24 tracking-wide">
      
      {/* HEADER */}
      <div className="bg-white/90 backdrop-blur-xl border-b border-orange-100/50 sticky top-0 z-40 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center gap-4">
          <button onClick={() => router.back()} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-orange-50 text-orange-600 hover:bg-orange-100 transition-colors shadow-sm active:scale-95">
            <FaArrowLeft className="text-sm sm:text-base" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 truncate tracking-tight">
              {ebookDetails.title}
            </h1>
            <p className="text-[10px] sm:text-xs font-bold text-green-600 uppercase tracking-widest">
              <FaLock className="inline mb-0.5 mr-1" /> सुरक्षित चेकआउट
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ==========================================
              LEFT COLUMN: PRODUCT PREVIEW & CONTENT 
              ========================================== */}
          <div className="lg:col-span-7 space-y-8 sm:space-y-10">
            
            {/* HERO PRODUCT BANNER */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-xl shadow-orange-900/5 border border-orange-50 flex flex-col sm:flex-row gap-8 items-center sm:items-start relative overflow-hidden group">
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-gradient-to-br from-orange-400/20 to-amber-400/20 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-110"></div>
              
              <div className="relative w-[180px] sm:w-[220px] shrink-0 aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl shadow-gray-400/30 border border-gray-100 z-10 transition-transform duration-500 group-hover:-translate-y-2">
                <div className="absolute left-0 top-0 bottom-0 w-5 bg-gradient-to-r from-black/20 to-transparent z-10"></div>
                <Image src={ebookDetails.cover_image_url} alt={ebookDetails.title} fill className="object-cover" />
              </div>

              <div className="flex-1 text-center sm:text-left z-10 pt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 text-red-600 text-[11px] font-black uppercase tracking-widest mb-4 shadow-sm">
                  <HiSparkles size={14} className="animate-pulse" /> {ebookDetails.tag || "Best Seller"}
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-gray-900 mb-3 leading-[1.15] tracking-tight">
                  {ebookDetails.title}
                </h2>
                <p className="text-gray-600 font-medium mb-8 text-base sm:text-lg leading-relaxed">
                  {ebookDetails.subtitle}
                </p>
                
                <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                  <div className="bg-orange-50/80 border border-orange-100 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                    <FaBook className="text-orange-500 text-lg" />
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-bold uppercase leading-none mb-0.5">संग्रह</p>
                      <p className="text-sm font-black text-gray-900 leading-none">{bhajans.length} भजन</p>
                    </div>
                  </div>
                  <div className="bg-orange-50/80 border border-orange-100 rounded-xl px-4 py-2.5 flex items-center gap-2.5 shadow-sm">
                    <FaFilePdf className="text-orange-500 text-lg" />
                    <div className="text-left">
                      <p className="text-[10px] text-gray-500 font-bold uppercase leading-none mb-0.5">फॉर्मेट</p>
                      <p className="text-sm font-black text-gray-900 leading-none">डिजिटल PDF</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* BHAJAN LIST (TABLE OF CONTENTS) */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-10 shadow-lg shadow-gray-200/40 border border-gray-100">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
                    ई-बुक की विषय सूची
                  </h3>
                  <p className="text-gray-500 text-sm font-medium">
                    आप चाहें तो किसी भजन को हटा (Untick) कर अपनी PDF कस्टमाइज़ कर सकते हैं।
                  </p>
                </div>
                <span className="shrink-0 text-sm font-black text-orange-700 bg-orange-100 border border-orange-200 px-4 py-2 rounded-xl shadow-sm self-start sm:self-auto">
                  चयनित: {selectedSlugs.length}/{bhajans.length}
                </span>
              </div>

              <div className="bg-gray-50 rounded-2xl p-3 h-[450px] overflow-y-auto custom-scrollbar border border-gray-200 shadow-inner">
                {bhajans.map((bhajan, idx) => {
                  const isSelected = selectedSlugs.includes(bhajan.slug);
                  return (
                    <div 
                      key={bhajan.slug} 
                      onClick={() => toggleBhajan(bhajan.slug)}
                      className={`flex items-center gap-4 p-4 mb-2 rounded-xl cursor-pointer transition-all duration-300 ${isSelected ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.06)] border border-gray-100 hover:border-orange-300 transform hover:-translate-y-0.5' : 'bg-transparent hover:bg-gray-200/60 opacity-60 grayscale hover:grayscale-0'}`}
                    >
                      <div className={`text-xl shrink-0 transition-colors ${isSelected ? 'text-orange-500' : 'text-gray-400'}`}>
                        {isSelected ? <FaCheckSquare /> : <FaRegSquare />}
                      </div>
                      <div className="text-xs font-black text-gray-400 w-6 text-center shrink-0">{idx + 1}.</div>
                      <div className={`font-bold text-base truncate flex-1 transition-colors ${isSelected ? 'text-gray-800' : 'text-gray-500 line-through'}`}>
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
          <div className="lg:col-span-5 lg:sticky lg:top-28">
            <div className="bg-white rounded-[2rem] shadow-2xl shadow-orange-900/10 border border-gray-100 overflow-hidden">
              <div className="h-2.5 w-full bg-gradient-to-r from-orange-400 via-amber-500 to-orange-400"></div>
              
              <div className="p-6 sm:p-8 lg:p-10">
                
                {/* PRICING HEADER */}
                <div className="flex items-end justify-between mb-8 pb-8 border-b border-gray-100">
                  <div>
                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-2">ऑफर प्राइस</p>
                    <div className="flex items-baseline gap-3">
                      <span className="text-5xl font-black text-gray-900 flex items-center tracking-tighter">
                        <FaRupeeSign className="text-4xl" />{ebookDetails.price}
                      </span>
                      <span className="text-xl font-bold text-gray-400 line-through decoration-2 decoration-gray-300">₹{ebookDetails.original_price}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="inline-flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 text-green-700 px-4 py-2 rounded-xl shadow-sm">
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-80">बचत</span>
                      <span className="text-base font-black">₹{ebookDetails.original_price - ebookDetails.price}</span>
                    </div>
                  </div>
                </div>

                {/* FLOW: IDLE / PAYMENT (Showing the form) */}
                {(flowStatus === 'idle' || flowStatus === 'payment_pending' || flowStatus === 'error') && (
                  <div className="space-y-6 animate-in fade-in duration-500">
                    
                    {/* CUSTOMIZATION PREFS */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
                          <FaLanguage className="text-orange-500 text-sm" /> भाषा
                        </label>
                        <select value={script} onChange={(e) => setScript(e.target.value as ScriptLanguage)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 shadow-sm cursor-pointer">
                          <option value="devanagari">हिंदी (Devanagari)</option>
                          <option value="gujarati">ગુજરાતી (Gujarati)</option>
                          <option value="hinglish">English (Hinglish)</option>
                        </select>
                      </div>
                      <div className="bg-gray-50/50 p-3 rounded-2xl border border-gray-100">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
                          <FaPalette className="text-orange-500 text-sm" /> डिज़ाइन
                        </label>
                        <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 shadow-sm cursor-pointer">
                          <option value="default">क्लासिक (सफेद)</option>
                          <option value="sawan">सावन (हरा)</option>
                          <option value="navratri">नवरात्रि (लाल)</option>
                        </select>
                      </div>
                    </div>

                    <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent my-6"></div>

                    {/* BUYER DETAILS */}
                    {!isPaid && (
                      <div className="space-y-5">
                        <label className="block text-sm font-black text-gray-800">प्राप्तकर्ता का विवरण <span className="text-red-500">*</span></label>
                        <div className="relative group">
                          <FaUser className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                          <input type="text" placeholder="आपका शुभ नाम" value={buyerName} onChange={(e) => setBuyerName(e.target.value)}
                            className={`pl-12 ${inputStyles}`} 
                          />
                        </div>
                        <div className="relative group">
                          <FaPhoneAlt className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-orange-500 transition-colors" />
                          <input type="tel" maxLength={10} placeholder="WhatsApp नंबर (GPay/PhonePe)" value={buyerPhone} onChange={(e) => setBuyerPhone(e.target.value.replace(/\D/g, ''))}
                            className={`pl-12 ${inputStyles}`} 
                          />
                        </div>
                      </div>
                    )}

                    {/* ERROR ALERTS */}
                    {errorMessage && (
                      <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold rounded-2xl flex items-start gap-3 leading-relaxed shadow-sm">
                        <FaExclamationTriangle className="shrink-0 mt-0.5 text-red-500 text-lg" /> 
                        <span>{errorMessage}</span>
                      </div>
                    )}

                    {/* 🌟 FIX: CTA BUTTON LOGIC (Strictly checks for 'error' flowStatus before showing Retry/WhatsApp) */}
                    {flowStatus === 'error' ? (
                      <div className="mt-6 space-y-3">
                        <button
                          onClick={handleCheckoutAndDownload} 
                          disabled={selectedSlugs.length === 0}
                          className="w-full bg-gray-900 hover:bg-black text-white font-black text-lg py-4.5 rounded-2xl shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed h-16"
                        >
                          <FaRedo /> पुनः भुगतान का प्रयास करें
                        </button>
                        <button
                          onClick={handleSupportClick}
                          className="w-full bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 font-bold text-base py-4 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-sm"
                        >
                          <FaWhatsapp className="text-2xl" /> पैसे कट गए? सहायता लें
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={handleCheckoutAndDownload} 
                        disabled={flowStatus === 'payment_pending' || selectedSlugs.length === 0}
                        className="w-full mt-6 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-700 hover:to-amber-600 text-white font-black text-xl py-4.5 rounded-2xl shadow-[0_10px_30px_-5px_rgba(234,88,12,0.4)] transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed h-16"
                      >
                        {flowStatus === 'payment_pending' ? (
                          <><FaSpinner className="animate-spin text-2xl" /> भुगतान विंडो खुल रही है...</>
                        ) : (
                          <><FaShieldAlt className="text-2xl" /> ₹{ebookDetails.price} सुरक्षित भुगतान करें</>
                        )}
                      </button>
                    )}
                    
                    {/* 🌟 TRUST BADGES SECTION */}
                    <div className="mt-8 pt-6 border-t border-gray-100">
                      <div className="flex flex-col items-center gap-4">
                        <div className="flex items-center gap-2 text-xs font-black text-gray-500 uppercase tracking-widest">
                          <FaLock className="text-green-600 text-sm" /> 100% Secure Cashfree Payments
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-2 opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
                          <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider shadow-sm">UPI</span>
                          <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider shadow-sm">GPay</span>
                          <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider shadow-sm">PhonePe</span>
                          <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider shadow-sm">Paytm</span>
                          <span className="bg-white border border-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-wider shadow-sm">CARDS</span>
                        </div>
                        
                        <div className="flex items-center justify-center gap-2 text-[11px] font-black text-emerald-600 uppercase tracking-widest mt-2 bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100">
                          <FaCheckCircle className="text-sm" /> इंस्टेंट डाउनलोड • लाइफटाइम एक्सेस
                        </div>
                      </div>
                    </div>

                  </div>
                )}

                {/* FLOW: BUILDING / RENDERING / READY */}
                {(flowStatus === 'building' || flowStatus === 'rendering' || flowStatus === 'ready') && (
                  <div className="py-10 flex flex-col items-center text-center animate-in zoom-in duration-700">
                    
                    {flowStatus !== 'ready' ? (
                      <>
                        <div className="relative w-24 h-24 mb-8">
                          <div className="absolute inset-0 border-4 border-orange-100 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-orange-500 rounded-full border-t-transparent animate-spin"></div>
                          <FaFilePdf className="absolute inset-0 m-auto text-3xl text-orange-500 animate-pulse" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 text-gray-900 tracking-tight">
                          {flowStatus === 'building' ? 'भजनों को कस्टमाइज़ किया जा रहा है...' : 'PDF ई-बुक तैयार हो रही है...'}
                        </h3>
                        <p className="text-gray-500 text-base font-medium">कृपया पेज को बंद या रिफ्रेश न करें। बस कुछ सेकंड्स...</p>
                      </>
                    ) : (
                      <>
                        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-8 shadow-inner border-4 border-white outline outline-4 outline-green-50">
                          <FaCheckCircle className="text-5xl text-green-500" />
                        </div>
                        <h3 className="text-3xl font-black mb-3 text-gray-900 tracking-tight">सफलतापूर्वक तैयार!</h3>
                        <p className="text-gray-500 text-base font-medium mb-10">आपका डाउनलोड स्वतः शुरू हो गया होगा।</p>
                        
                        <button 
                          onClick={() => { if(lastDownloadUrl.current) triggerDownload(lastDownloadUrl.current, ebookDetails.title); }} 
                          className="w-full bg-gray-900 hover:bg-black text-white px-6 py-4.5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 shadow-2xl active:scale-95 transition-all"
                        >
                          <FaFilePdf className="text-xl" /> PDF पुनः डाउनलोड करें
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