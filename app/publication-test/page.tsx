"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import {
  createSingleBhajanDocument,
  createMultiBhajanDocument,
  PublicationRequestOptions
} from '@/lib/publication/content/selector';
import { ScriptLanguage, ThemeStyle, PageSize, PublicationDocument } from '@/lib/publication/types';
import {
  FaFilePdf, FaBook, FaCog, FaCheckCircle, FaCircle,
  FaSearch, FaSpinner, FaDownload, FaCheck, FaRedo, 
  FaExclamationTriangle, FaLayerGroup, FaArrowRight, 
  FaArrowLeft, FaRupeeSign, FaShieldAlt, FaOm, FaWhatsapp, FaInfoCircle
} from 'react-icons/fa';

type WizardStep = 1 | 2 | 3;
type FlowStatus = 'idle' | 'payment_pending' | 'building' | 'rendering' | 'ready' | 'error';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function PublicationTestStudio() {
  const [isClient, setIsClient] = useState(false);

  // --- WIZARD & SESSION STATE ---
  const [step, setStep] = useState<WizardStep>(1);
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  // --- CONTENT STATE ---
  const [bhajans, setBhajans] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  // --- FILTERS ---
  const [selectedDeity, setSelectedDeity] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // --- CONFIGURATION ---
  const [bookTitle, setBookTitle] = useState("मेरी भजन पुस्तिका");
  const [script, setScript] = useState<ScriptLanguage>('devanagari');
  const [theme, setTheme] = useState<ThemeStyle>('temple');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [includeMeaning, setIncludeMeaning] = useState(true);
  const [fontSizeScale, setFontSizeScale] = useState<number>(1.0);

  // --- FLOW STATE ---
  const [generatedModel, setGeneratedModel] = useState<PublicationDocument | null>(null);
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const lastDownloadUrl = useRef<string | null>(null);

  // 1. 🌟 LOCAL STORAGE RECOVERY
  useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem('bhajanPustikaState');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.selectedSlugs) setSelectedSlugs(parsed.selectedSlugs);
        if (parsed.bookTitle) setBookTitle(parsed.bookTitle);
        if (parsed.orderId) setSavedOrderId(parsed.orderId);
        if (parsed.isPaid) setIsPaid(parsed.isPaid);
        if (parsed.step) setStep(parsed.step);
      } catch (e) {}
    }
  }, []);

  // 2. 🌟 AUTO-SAVE TO LOCAL STORAGE
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('bhajanPustikaState', JSON.stringify({
        step, selectedSlugs, bookTitle, orderId: savedOrderId, isPaid
      }));
    }
  }, [step, selectedSlugs, bookTitle, savedOrderId, isPaid, isClient]);

  // 3. Fetch Bhajans
  useEffect(() => {
    const fetchAllBhajans = async () => {
      setLoadingList(true);
      const { data, error } = await supabase
        .from('mv_bhajan_details')
        .select('slug, title_hindi, title_hinglish, deity, categories')
        .order('title_hindi', { ascending: true });

      if (!error && data) setBhajans(data);
      setLoadingList(false);
    };
    fetchAllBhajans();
    loadRazorpayScript();
  }, []);

  // 🌟 DYNAMIC PRICING (प्रति भजन शगुन मॉडल)
  const currentPrice = useMemo(() => {
    const count = selectedSlugs.length;
    if (count === 0) return 0;
    if (count <= 2) return 11;
    return 11 + ((count - 2) * 2);
  }, [selectedSlugs.length]);

  const handlePageSizeChange = (newSize: PageSize) => {
    setPageSize(newSize);
    setFontSizeScale(newSize === 'A5' ? 1.2 : 1.0);
  };

  // Filters setup
  const uniqueDeities = useMemo(() => Array.from(new Set(bhajans.map(b => b.deity?.name_hindi).filter(Boolean))), [bhajans]);
  const uniqueCategories = useMemo(() => {
    const list = new Set<string>();
    bhajans.forEach(b => b.categories?.forEach((c: any) => c.name_hindi && list.add(c.name_hindi)));
    return Array.from(list);
  }, [bhajans]);

  const filteredBhajans = useMemo(() => {
    return bhajans.filter(b => {
      const matchSearch = b.title_hindi?.includes(searchQuery) || b.title_hinglish?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchDeity = selectedDeity === "ALL" || b.deity?.name_hindi === selectedDeity;
      const cats = b.categories?.map((c: any) => c.name_hindi) || [];
      const matchCategory = selectedCategory === "ALL" || cats.includes(selectedCategory);
      return matchSearch && matchDeity && matchCategory;
    });
  }, [bhajans, searchQuery, selectedDeity, selectedCategory]);

  const toggleSelection = (slug: string) => {
    setSelectedSlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
    if (isPaid) {
      setIsPaid(false);
      setSavedOrderId(null);
    }
  };

  const handleSelectAllFiltered = () => {
    const filteredSlugs = filteredBhajans.map(b => b.slug);
    if (filteredSlugs.every(s => selectedSlugs.includes(s))) {
      setSelectedSlugs(prev => prev.filter(s => !filteredSlugs.includes(s)));
    } else {
      setSelectedSlugs(Array.from(new Set([...selectedSlugs, ...filteredSlugs])));
    }
    setIsPaid(false); setSavedOrderId(null);
  };

  const nextStep = () => {
    if (step === 1 && selectedSlugs.length === 0) return alert("कृपया कम से कम 1 भजन चुनें।");
    setStep(prev => (prev + 1) as WizardStep);
    window.scrollTo(0,0);
  };
  const prevStep = () => setStep(prev => (prev - 1) as WizardStep);

  // --- PAYMENT & GENERATION FLOW ---
  const handlePaymentAndGenerate = async () => {
    if (selectedSlugs.length === 0) return;
    setErrorMessage("");

    if (isPaid && savedOrderId) {
      return generatePDF();
    }

    setFlowStatus('payment_pending');
    try {
      const orderRes = await fetch('/api/razorpay/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: selectedSlugs.length })
      });

      if (!orderRes.ok) throw new Error("ऑर्डर नहीं बन सका। कृपया इंटरनेट चेक करें।");
      const orderData = await orderRes.json();
      setSavedOrderId(orderData.id);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "हिंदी भजन मंजरी",
        description: "ई-पुस्तिका संकलन शगुन",
        order_id: orderData.id,
        theme: { color: "#ea580c" },
        handler: async function (response: any) {
          try {
            setFlowStatus('building');
            const verifyRes = await fetch(`/api/razorpay/verify?order_id=${orderData.id}`);
            const verifyData = await verifyRes.json();

            if (verifyData.paid && verifyData.orderType === 'book_builder') {
              setIsPaid(true);
              await generatePDF();
            } else {
              throw new Error("पेमेंट वेरीफाई नहीं हो सका।");
            }
          } catch (verifyError) {
            setFlowStatus('error');
            setErrorMessage("पेमेंट प्राप्त हुआ, लेकिन वेरीफाई करने में समस्या आई।");
          }
        },
        modal: { ondismiss: () => setFlowStatus('idle') }
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.on('payment.failed', (response: any) => {
        setFlowStatus('error');
        setErrorMessage(response.error.description || "पेमेंट विफल हो गया।");
      });
      rzp.open();
    } catch (error: any) {
      setFlowStatus('error');
      setErrorMessage(error.message || "पेमेंट शुरू करने में समस्या आई।");
    }
  };

  const generatePDF = async () => {
    setFlowStatus('building');
    const options: PublicationRequestOptions = { script, theme, pageSize, includeMeaning, fontSizeScale, customTitle: bookTitle };

    try {
      let model = selectedSlugs.length === 1 
        ? await createSingleBhajanDocument(selectedSlugs[0], options)
        : await createMultiBhajanDocument(bookTitle, selectedSlugs, options);

      if (!model) throw new Error("भजन डेटा तैयार नहीं हो सका।");

      setGeneratedModel(model);
      setFlowStatus('rendering');

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model),
      });

      if (!response.ok) throw new Error(`सर्वर एरर (status: ${response.status})`);

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      lastDownloadUrl.current = url;
      triggerDownload(url, model.metadata.title);
      setFlowStatus('ready');
    } catch (err: any) {
      setFlowStatus('error');
      setErrorMessage(err.message || "पुस्तिका बनाने में समस्या आई।");
    }
  };

  const triggerDownload = (url: string, title: string) => {
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  };

  const handleSupportClick = () => {
    const text = encodeURIComponent(`हरि ॐ! मैंने ई-पुस्तिका के लिए पेमेंट किया था लेकिन PDF नहीं मिली।\nOrder ID: ${savedOrderId || 'N/A'}\nभजन संख्या: ${selectedSlugs.length}`);
    window.open(`https://wa.me/91XXXXXXXXXX?text=${text}`, '_blank');
  };

  if (!isClient) return null;

  return (
    <div className="min-h-screen bg-[#fffaf5] text-gray-900 pb-32 sm:pb-12 font-sans selection:bg-orange-200">
      
      {/* 🌟 1. TRANSPARENCY BANNER */}
      <div className="bg-orange-100 text-orange-800 text-xs sm:text-sm font-medium py-2.5 px-4 text-center border-b border-orange-200 flex items-center justify-center gap-2">
        <FaInfoCircle className="shrink-0" />
        <span>यह एक विशेष सेवा है। 2 भजनों तक की पुस्तिका का शगुन ₹11, उसके बाद ₹2 प्रति भजन।</span>
      </div>

      {/* HEADER / STEPPER */}
      <div className="bg-white border-b border-orange-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white shadow-md">
              <FaOm className="text-sm sm:text-lg" />
            </div>
            <h1 className="text-lg sm:text-2xl font-black text-gray-900 font-hindi tracking-tight hidden sm:block">
              भजन मंजरी <span className="text-orange-600">ई-पुस्तिका</span>
            </h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4 text-xs sm:text-sm font-bold text-gray-400">
            <span className={step >= 1 ? "text-orange-600" : ""}>1. भजन चुनें</span>
            <span className="w-3 sm:w-6 h-px bg-gray-200"></span>
            <span className={step >= 2 ? "text-orange-600" : ""}>2. सजाएं</span>
            <span className="w-3 sm:w-6 h-px bg-gray-200"></span>
            <span className={step >= 3 ? "text-orange-600" : ""}>3. प्राप्ति</span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        
        {/* ==========================================
            STEP 1: SELECT BHAJANS
            ========================================== */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-2xl sm:text-3xl font-black text-gray-900 font-hindi mb-2">अपना भजन संग्रह तैयार करें</h2>
              <p className="text-gray-500 font-medium text-sm sm:text-base">अपनी पसंद के भजन चुनकर एक सुंदर, प्रिंट-रेडी PDF पुस्तिका प्राप्त करें।</p>
            </div>

            <div className="bg-white border border-orange-200/80 rounded-3xl p-4 sm:p-6 shadow-sm flex flex-col h-[60vh] sm:h-[65vh]">
              {/* FILTERS */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text" placeholder="भजन खोजें..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-hindi focus:border-orange-500 outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <select value={selectedDeity} onChange={(e) => setSelectedDeity(e.target.value)} className="bg-orange-50/50 border border-orange-200 rounded-xl px-3 py-2.5 text-sm font-bold text-gray-800 outline-none flex-1 sm:flex-none">
                    <option value="ALL">सभी देवी-देवता</option>
                    {uniqueDeities.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <button onClick={handleSelectAllFiltered} className="bg-orange-100 text-orange-700 font-bold px-4 py-2.5 rounded-xl text-sm whitespace-nowrap">
                    {filteredBhajans.every(b => selectedSlugs.includes(b.slug)) ? "हटाएं" : "सभी चुनें"}
                  </button>
                </div>
              </div>

              {/* LIST */}
              <div className="overflow-y-auto pr-1 flex-1 pb-2">
                {loadingList ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400">
                    <FaSpinner className="animate-spin text-3xl mb-3 text-orange-500" />
                    <p>भजन संग्रह लोड हो रहा है...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {filteredBhajans.map((bhajan) => {
                      const isSelected = selectedSlugs.includes(bhajan.slug);
                      const orderIndex = selectedSlugs.indexOf(bhajan.slug);
                      return (
                        <div key={bhajan.slug} onClick={() => toggleSelection(bhajan.slug)}
                          className={`relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                            isSelected ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-100 hover:border-orange-200'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${
                            isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'
                          }`}>
                            {isSelected && <span className="text-[10px] font-black">{orderIndex + 1}</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-sm truncate font-hindi ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>
                              {bhajan.title_hindi}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* FLOATING ACTION BAR FOR MOBILE */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] p-3 sm:p-5 z-40">
              <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
                <div className="flex items-center gap-4">
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">भजन</p>
                    <p className="text-lg sm:text-xl font-black text-gray-900 leading-none">{selectedSlugs.length}</p>
                  </div>
                  <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>
                  <div>
                    <p className="text-[10px] sm:text-xs font-bold text-gray-500 uppercase">शगुन राशि</p>
                    <p className="text-lg sm:text-xl font-black text-orange-600 leading-none">₹{currentPrice}</p>
                  </div>
                </div>
                <button
                  onClick={nextStep} disabled={selectedSlugs.length === 0}
                  className="bg-gray-900 hover:bg-black disabled:bg-gray-300 text-white px-5 sm:px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-sm sm:text-base active:scale-95"
                >
                  अगला चरण <FaArrowRight className="hidden sm:inline" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 2: PERSONALIZE & PREVIEW
            ========================================== */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-8 shadow-sm space-y-6">
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 font-hindi mb-2 border-b border-gray-100 pb-4">
                पुस्तिका को रूप दें
              </h2>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 font-hindi">पुस्तिका का नाम (कवर पेज के लिए)</label>
                <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full bg-orange-50/50 border border-orange-200 rounded-xl px-4 py-3 text-base sm:text-lg text-gray-900 focus:border-orange-500 font-hindi font-bold outline-none"
                  placeholder="उदा. शर्मा परिवार का भजन संग्रह"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* 🌟 RESTORED ALL LANGUAGES HERE */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">लिपि (Language)</label>
                  <select value={script} onChange={(e) => setScript(e.target.value as ScriptLanguage)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-800 outline-none">
                    <option value="devanagari">हिंदी (Devanagari)</option>
                    <option value="gujarati">ગુજરાતી (Gujarati)</option>
                    <option value="bengali">বাংলা (Bengali)</option>
                    <option value="telugu">తెలుగు (Telugu)</option>
                    <option value="gurmukhi">ਪੰਜਾਬੀ (Gurmukhi)</option>
                    <option value="hinglish">English (Hinglish)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">पेज साइज़</label>
                  <select value={pageSize} onChange={(e) => handlePageSizeChange(e.target.value as PageSize)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-3 text-sm font-bold text-gray-800 outline-none">
                    <option value="A4">A4 (बड़ा)</option>
                    <option value="A5">A5 (पॉकेट)</option>
                  </select>
                </div>
              </div>

              <label className="flex items-center gap-3 p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input type="checkbox" checked={includeMeaning} onChange={(e) => setIncludeMeaning(e.target.checked)} className="w-5 h-5 accent-orange-600" />
                <div>
                  <p className="font-bold text-gray-900 text-sm font-hindi">सम्पूर्ण भावार्थ शामिल करें</p>
                  <p className="text-xs text-gray-500 mt-0.5">भजनों के अर्थ भी प्रिंट होंगे।</p>
                </div>
              </label>

              <div className="pt-2 flex gap-3">
                <button onClick={prevStep} className="px-5 sm:px-6 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-xl">पीछे</button>
                <button onClick={nextStep} className="flex-1 bg-gray-900 text-white font-bold rounded-xl py-3.5 flex justify-center items-center gap-2">
                  अंतिम चरण <FaArrowRight />
                </button>
              </div>
            </div>

            <div className="bg-orange-100/50 border border-orange-200 rounded-3xl p-6 sm:p-10 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-4">कवर पेज प्रीव्यू</p>
              <div className="w-full max-w-[240px] sm:max-w-sm aspect-[1/1.414] bg-[#fffaf0] rounded-r-2xl rounded-l-sm shadow-[15px_15px_30px_rgba(0,0,0,0.1)] border border-amber-900/10 p-6 sm:p-8 flex flex-col items-center justify-center text-center relative">
                <div className="absolute inset-3 sm:inset-4 border-2 border-amber-800/20"></div>
                <FaOm className="text-3xl sm:text-4xl text-amber-600 mb-4 sm:mb-6 opacity-80" />
                <h3 className="text-xl sm:text-2xl font-black text-amber-900 font-hindi leading-snug px-2 sm:px-6">{bookTitle}</h3>
                <div className="w-12 h-px bg-amber-800/30 my-4 sm:my-6"></div>
                <p className="text-amber-800/60 font-bold text-xs sm:text-sm">{selectedSlugs.length} भजनों का संकलन</p>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            STEP 3: CHECKOUT & GENERATE
            ========================================== */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-2xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-orange-100 overflow-hidden">
              <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
              
              <div className="p-5 sm:p-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 font-hindi">पवित्र भेंट</h2>
                <p className="text-gray-500 text-sm sm:text-base font-medium mb-6 sm:mb-8 font-hindi">
                  मंच को विज्ञापन-मुक्त रखने में आपका यह शगुन अमूल्य है।
                </p>

                <div className="bg-orange-50 rounded-2xl p-5 sm:p-6 mb-6 text-left border border-orange-100">
                  <h3 className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-3 border-b border-orange-200/50 pb-2">
                    संकलन विवरण
                  </h3>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-700 text-sm font-medium">बेस शगुन (2 भजन)</span>
                    <span className="font-bold text-gray-900">₹11</span>
                  </div>
                  {selectedSlugs.length > 2 && (
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-gray-700 text-sm font-medium">अतिरिक्त ({selectedSlugs.length - 2} × ₹2)</span>
                      <span className="font-bold text-gray-900">₹{(selectedSlugs.length - 2) * 2}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-orange-200/50">
                    <span className="text-base sm:text-lg font-black text-gray-900 font-hindi">कुल शगुन राशि</span>
                    <span className="text-xl sm:text-2xl font-black text-orange-600 flex items-center">
                      <FaRupeeSign className="text-lg" /> {currentPrice}
                    </span>
                  </div>
                </div>

                {flowStatus === 'idle' || flowStatus === 'payment_pending' ? (
                  <div className="space-y-4">
                    <button
                      onClick={handlePaymentAndGenerate} disabled={flowStatus === 'payment_pending'}
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-base sm:text-lg py-4 sm:py-5 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3"
                    >
                      {flowStatus === 'payment_pending' ? (
                        <><FaSpinner className="animate-spin" /> सुरक्षित भुगतान...</>
                      ) : isPaid ? (
                        <><FaFilePdf /> पुस्तिका बनाएँ (पेमेंट सफल)</>
                      ) : (
                        <><FaShieldAlt /> ₹{currentPrice} का सहयोग करें</>
                      )}
                    </button>
                    {errorMessage && <p className="text-red-500 text-sm font-bold font-hindi">{errorMessage}</p>}
                    <button onClick={prevStep} className="text-sm font-bold text-gray-500 hover:text-gray-800">
                      ← वापस जाएँ
                    </button>
                  </div>
                ) : (
                  // PDF GENERATION STATUS UI
                  <div className="py-6 sm:py-8 flex flex-col items-center">
                    {(flowStatus === 'building' || flowStatus === 'rendering') && (
                      <>
                        <FaSpinner className="text-4xl sm:text-5xl text-orange-500 animate-spin mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold font-hindi mb-2">
                          {flowStatus === 'building' ? 'भजन संकलित हो रहे हैं...' : 'पुस्तिका तैयार हो रही है...'}
                        </h3>
                        <p className="text-gray-500 text-sm font-hindi">कृपया पेज बंद न करें।</p>
                      </>
                    )}
                    {flowStatus === 'ready' && (
                      <>
                        <FaCheckCircle className="text-5xl sm:text-6xl text-green-500 mb-4" />
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 font-hindi">पुस्तिका तैयार है!</h3>
                        <p className="text-gray-500 mb-6 text-sm font-hindi">आपका डाउनलोड स्वतः शुरू हो गया होगा।</p>
                        <div className="flex gap-3">
                          <button onClick={() => { if(lastDownloadUrl.current) triggerDownload(lastDownloadUrl.current, bookTitle); }} className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                            पुनः डाउनलोड करें
                          </button>
                        </div>
                      </>
                    )}
                    {flowStatus === 'error' && (
                      <>
                        <FaExclamationTriangle className="text-4xl sm:text-5xl text-red-500 mb-4" />
                        <p className="text-red-600 font-bold mb-4 font-hindi">{errorMessage}</p>
                        
                        <div className="flex flex-col gap-3 w-full max-w-xs mx-auto">
                          <button onClick={handlePaymentAndGenerate} className="bg-gray-900 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                            <FaRedo /> मुफ़्त में पुनः प्रयास करें
                          </button>
                          <button onClick={handleSupportClick} className="bg-green-50 hover:bg-green-100 border border-green-200 text-green-700 px-6 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors">
                            <FaWhatsapp className="text-lg" /> सहायता प्राप्त करें
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}