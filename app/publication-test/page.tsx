"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import {
  createSingleBhajanDocument,
  createMultiBhajanDocument,
  PublicationRequestOptions
} from '@/lib/publication/content/selector';
import { ScriptLanguage, PublicationDocument } from '@/lib/publication/types';
import {
  FaFilePdf, FaSearch, FaSpinner, FaRedo, 
  FaExclamationTriangle, FaLayerGroup, FaArrowRight, 
  FaRupeeSign, FaShieldAlt, FaOm, FaWhatsapp, FaListUl,
  FaCheckCircle, FaLanguage, FaBook
} from 'react-icons/fa';

type WizardStep = 1 | 2;
type FlowStatus = 'idle' | 'payment_pending' | 'building' | 'rendering' | 'ready' | 'error' | 'verifying';
type TabType = 'all' | 'selected';

export default function PublicationTestStudio() {
  const [isClient, setIsClient] = useState(false);

  // --- WIZARD & SESSION STATE ---
  const [step, setStep] = useState<WizardStep>(1);
  const [activeTab, setActiveTab] = useState<TabType>('all'); 
  const [savedOrderId, setSavedOrderId] = useState<string | null>(null);
  const [isPaid, setIsPaid] = useState<boolean>(false);

  // --- CONTENT STATE ---
  const [bhajans, setBhajans] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  // --- FILTERS ---
  const [selectedDeity, setSelectedDeity] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL"); // 🌟 NEW: Category State

  // --- ELDER-FRIENDLY CONFIGURATION ---
  const [bookTitle, setBookTitle] = useState("मेरी भजन डायरी");
  const [script, setScript] = useState<ScriptLanguage>('devanagari');

  // --- FLOW STATE ---
  const [generatedModel, setGeneratedModel] = useState<PublicationDocument | null>(null);
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const lastDownloadUrl = useRef<string | null>(null);

  // 1. 🌟 LOCAL STORAGE RECOVERY & URL REDIRECT HANDLER
  useEffect(() => {
    setIsClient(true);
    let recoveredState: any = null;

    const saved = localStorage.getItem('bhajanPustikaStateSimple');
    if (saved) {
      try {
        recoveredState = JSON.parse(saved);
        if (recoveredState.selectedSlugs) setSelectedSlugs(recoveredState.selectedSlugs);
        if (recoveredState.bookTitle) setBookTitle(recoveredState.bookTitle);
        if (recoveredState.script) setScript(recoveredState.script);
        if (recoveredState.orderId) setSavedOrderId(recoveredState.orderId);
        if (recoveredState.isPaid) setIsPaid(recoveredState.isPaid);
        if (recoveredState.step) setStep(recoveredState.step);
      } catch (e) {}
    }

    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success');

    if (isSuccess === 'true' && recoveredState?.orderId) {
      window.history.replaceState({}, document.title, window.location.pathname);
      setStep(2);
      verifyAndGeneratePDF(recoveredState.orderId, recoveredState);
      try { localStorage.removeItem('bhajanPaymentAttempt'); } catch (e) {}
    }
    else if (recoveredState?.orderId && !recoveredState.isPaid) {
      let hadAttempt = false;
      try {
        const lastAttempt = localStorage.getItem('bhajanPaymentAttempt');
        if (lastAttempt) {
          const parsed = JSON.parse(lastAttempt);
          if (parsed.orderId === recoveredState.orderId) hadAttempt = true;
        }
      } catch (e) {}

      if (hadAttempt) {
        setStep(2);
        verifyAndGeneratePDF(recoveredState.orderId, recoveredState);
        try { localStorage.removeItem('bhajanPaymentAttempt'); } catch (e) {}
      }
    }
  }, []);

  // 2. 🌟 AUTO-SAVE TO LOCAL STORAGE
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('bhajanPustikaStateSimple', JSON.stringify({
        step, selectedSlugs, bookTitle, script, orderId: savedOrderId, isPaid
      }));
    }
  }, [step, selectedSlugs, bookTitle, script, savedOrderId, isPaid, isClient]);

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
  }, []);

  // Dynamic Pricing
  const currentPrice = useMemo(() => {
    const count = selectedSlugs.length;
    if (count === 0) return 0;
    if (count <= 2) return 11;
    return 11 + ((count - 2) * 2);
  }, [selectedSlugs.length]);

  // Filters Extraction
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

  const explicitlySelectedBhajans = useMemo(() => {
    return selectedSlugs.map(slug => bhajans.find(b => b.slug === slug)).filter(Boolean);
  }, [selectedSlugs, bhajans]);

  const toggleSelection = (slug: string) => {
    setSelectedSlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
    if (isPaid) { setIsPaid(false); setSavedOrderId(null); }
  };

  const nextStep = () => {
    if (step === 1 && selectedSlugs.length === 0) return alert("कृपया कम से कम 1 भजन चुनें।");
    setStep(2);
    window.scrollTo(0,0);
  };
  const prevStep = () => setStep(1);

  // 🌟 RESET EVERYTHING
  const handleStartNew = () => {
    setSelectedSlugs([]);
    setBookTitle("मेरी भजन डायरी");
    setSavedOrderId(null);
    setIsPaid(false);
    setFlowStatus('idle');
    setStep(1);
    localStorage.removeItem('bhajanPustikaStateSimple');
    window.history.replaceState({}, document.title, window.location.pathname);
    window.scrollTo(0,0);
  };

  // ==========================================
  // 🌟 SECURE REDIRECT PAYMENT FLOW
  // ==========================================
  const handlePaymentAndGenerate = async () => {
    if (selectedSlugs.length === 0) return;
    setErrorMessage("");

    // 🛠️ DEVELOPER CHEAT CODE
    if (bookTitle.trim().toUpperCase() === "TEST") {
      setSavedOrderId("dev_test_order_123");
      setIsPaid(true);
      return executePDFGeneration(selectedSlugs, bookTitle, script);
    }

    if (isPaid && savedOrderId) {
      return executePDFGeneration(selectedSlugs, bookTitle, script);
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

      window.location.href = `/pay.html?mode=book_builder&amount=${currentPrice}&order_id=${orderData.id}&return_path=/publication-test`;
    } catch (error: any) {
      setFlowStatus('error');
      setErrorMessage(error.message || "पेमेंट शुरू करने में समस्या आई।");
    }
  };

  const verifyAndGeneratePDF = async (orderId: string, stateOptions: any) => {
    setFlowStatus('verifying');
    try {
      const verifyRes = await fetch(`/api/razorpay/verify?order_id=${orderId}`);
      const verifyData = await verifyRes.json();

      if (verifyData.paid && verifyData.orderType === 'book_builder') {
        setIsPaid(true);
        await executePDFGeneration(stateOptions.selectedSlugs, stateOptions.bookTitle, stateOptions.script);
      } else {
        setFlowStatus('idle');
      }
    } catch (error: any) {
      console.error(error);
      setFlowStatus('idle');
    }
  };

  const executePDFGeneration = async (slugs: string[], title: string, userScript: ScriptLanguage) => {
    setFlowStatus('building');
    try {
      const opts: PublicationRequestOptions = {
        script: userScript,
        theme: 'temple', 
        pageSize: 'A4', 
        includeMeaning: true, 
        fontSizeScale: 1.0, 
        customTitle: title
      };

      let model = slugs.length === 1 
        ? await createSingleBhajanDocument(slugs[0], opts)
        : await createMultiBhajanDocument(title, slugs, opts);

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

  // Shared classes for UI Consistency across Step 1 and Step 2
  const inputStyles = "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 outline-none focus:border-orange-500 transition-colors shadow-sm";

  return (
    <div className="min-h-screen bg-[#fffaf5] text-gray-900 pb-48 md:pb-56 font-sans selection:bg-orange-200">
      
      {/* HEADER / STEPPER */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg flex items-center justify-center text-white shadow-sm">
              <FaOm className="text-sm" />
            </div>
            <h1 className="text-lg font-black text-gray-900 font-hindi tracking-tight hidden sm:block">
              भजन डायरी
            </h1>
          </div>
          <div className="flex items-center gap-3 text-xs sm:text-sm font-bold text-gray-400">
            <span className={step === 1 ? "text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100" : ""}>1. भजन चुनें</span>
            <span className="w-4 h-px bg-gray-200"></span>
            <span className={step === 2 ? "text-orange-600 bg-orange-50 px-3 py-1 rounded-full border border-orange-100" : ""}>2. डायरी बनाएँ</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        
        {/* ==========================================
            STEP 1: SELECT BHAJANS
            ========================================== */}
        {step === 1 && (
          <div className="animate-in fade-in duration-500">
            
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col h-[65vh] sm:h-[70vh] overflow-hidden">
              
              {/* PILL SHAPED TABS */}
              <div className="flex p-2 bg-gray-50/50 border-b border-gray-100 gap-2">
                <button onClick={() => setActiveTab('all')} className={`flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${activeTab === 'all' ? 'bg-white text-orange-600 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <FaSearch /> खोंजे और चुनें
                </button>
                <button onClick={() => setActiveTab('selected')} className={`flex-1 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 rounded-xl transition-all ${activeTab === 'selected' ? 'bg-white text-orange-600 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-gray-200' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <FaListUl /> चुने गए भजन <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'selected' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-600'}`}>{selectedSlugs.length}</span>
                </button>
              </div>

              {activeTab === 'all' && (
                <div className="p-3 sm:p-5 flex-1 flex flex-col min-h-0 bg-white">
                  
                  {/* 🌟 FIX 1 & 2: RESPONSIVE ALIGNED SEARCH & FILTERS */}
                  <div className="flex flex-col md:flex-row gap-2.5 mb-4">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                      <input type="text" placeholder="भजन खोजें..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                        className={`pl-9 pr-3 ${inputStyles}`} 
                      />
                    </div>
                    <div className="flex gap-2.5">
                      <select value={selectedDeity} onChange={(e) => setSelectedDeity(e.target.value)} className={`flex-1 md:flex-none w-full md:w-[150px] truncate ${inputStyles}`}>
                        <option value="ALL">सभी देवी-देवता</option>
                        {uniqueDeities.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className={`flex-1 md:flex-none w-full md:w-[150px] truncate ${inputStyles}`}>
                        <option value="ALL">सभी श्रेणियाँ</option>
                        {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* 🌟 FIX 5: ADDED pb-28 SO LAST BHAJAN IS NOT HIDDEN */}
                  <div className="overflow-y-auto flex-1 pb-28 pr-1 custom-scrollbar">
                    {loadingList ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400"><FaSpinner className="animate-spin text-2xl mb-2 text-orange-500" /></div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {filteredBhajans.map((bhajan) => {
                          const isSelected = selectedSlugs.includes(bhajan.slug);
                          const orderIndex = selectedSlugs.indexOf(bhajan.slug);
                          return (
                            // 🌟 FIX 4: PROPER VISUAL FEEDBACK (+)
                            <div key={bhajan.slug} onClick={() => toggleSelection(bhajan.slug)} className={`relative flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all ${isSelected ? 'bg-orange-50 border-orange-400 shadow-sm' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                                {isSelected ? <span className="text-[10px] font-black">{orderIndex + 1}</span> : <span className="text-sm font-black mb-0.5">+</span>}
                              </div>
                              <p className={`font-bold text-[13px] sm:text-sm truncate font-hindi flex-1 ${isSelected ? 'text-orange-900' : 'text-gray-700'}`}>
                                {bhajan.title_hindi.replace(/\s*\(.*?\)\s*/g, '').replace(/\s*लिरिक्स.*$/g, '')}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'selected' && (
                <div className="p-4 sm:p-5 flex-1 flex flex-col min-h-0 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700 text-sm">कुल चयनित: {selectedSlugs.length}</h3>
                    {selectedSlugs.length > 0 && <button onClick={() => setSelectedSlugs([])} className="text-red-500 text-sm font-bold hover:underline bg-white px-3 py-1 rounded-full border border-red-100 shadow-sm">सभी हटाएँ</button>}
                  </div>
                  <div className="overflow-y-auto flex-1 pr-1 pb-28">
                    {/* 🌟 FIX 3: ACTIONABLE EMPTY STATE */}
                    {explicitlySelectedBhajans.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-500 font-hindi text-sm">
                        <FaLayerGroup className="text-5xl mb-4 text-gray-200" />
                        <p className="mb-4">आपने अभी तक कोई भजन नहीं चुना है।</p>
                        <button onClick={() => setActiveTab('all')} className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-5 py-2.5 rounded-xl font-bold transition-colors">
                           भजन खोजना शुरू करें
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {explicitlySelectedBhajans.map((bhajan: any, index) => (
                          <div key={bhajan.slug} onClick={() => toggleSelection(bhajan.slug)} className="relative flex items-center gap-3 p-3 rounded-2xl border cursor-pointer bg-white shadow-sm border-orange-200 hover:border-red-300 group">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-orange-500 text-white group-hover:bg-red-500 transition-colors">
                              <span className="text-[10px] font-black group-hover:hidden">{index + 1}</span>
                              <span className="text-[10px] font-black hidden group-hover:block">✕</span>
                            </div>
                            <p className="font-bold text-[13px] sm:text-sm truncate font-hindi flex-1 text-gray-900">
                              {bhajan.title_hindi.replace(/\s*\(.*?\)\s*/g, '').replace(/\s*लिरिक्स.*$/g, '')}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FLOATING ACTION BAR */}
            <div className="fixed bottom-[95px] md:bottom-[110px] left-1/2 -translate-x-1/2 w-[95%] max-w-2xl z-[90]">
              <div className="bg-gray-900/80 backdrop-blur-sm text-white text-[10px] sm:text-xs font-medium py-1.5 px-4 text-center rounded-t-2xl mx-4 mb-[-10px] pb-3">
                2 भजनों तक शगुन ₹11, उसके बाद ₹2 प्रति भजन।
              </div>
              <div className="bg-white/95 backdrop-blur-md border border-gray-200 shadow-[0_10px_40px_rgba(0,0,0,0.1)] rounded-2xl p-3 sm:p-4 transition-all relative z-10">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-4 sm:gap-6 px-2">
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">कुल भजन</p>
                      <p className="text-xl sm:text-2xl font-black text-gray-900 leading-none">{selectedSlugs.length}</p>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div>
                      <p className="text-[10px] font-bold text-gray-500 uppercase">शगुन राशि</p>
                      <p className="text-xl sm:text-2xl font-black text-orange-600 leading-none">₹{currentPrice}</p>
                    </div>
                  </div>
                  <button
                    onClick={nextStep} disabled={selectedSlugs.length === 0}
                    className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-300 disabled:to-gray-300 text-white px-6 sm:px-8 py-3 rounded-xl font-bold flex items-center gap-2 text-sm sm:text-base active:scale-95 shadow-md transition-all"
                  >
                    डायरी बनाएँ <FaArrowRight className="hidden sm:inline" />
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ==========================================
            STEP 2: SIMPLE CHECKOUT & GENERATE
            ========================================== */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-500 max-w-xl mx-auto">
            <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden mb-[100px]">
              <div className="h-2 w-full bg-gradient-to-r from-orange-400 to-amber-500"></div>
              
              <div className="p-6 sm:p-10 text-center">
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-2 font-hindi">पुस्तिका का विवरण</h2>
                <p className="text-gray-500 text-sm font-medium mb-6 font-hindi">
                  अपनी डायरी का नाम और भाषा चुनें।
                </p>

                <div className="space-y-5 text-left mb-8">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 font-hindi">
                      <FaBook className="text-orange-500" /> डायरी का नाम
                    </label>
                    {/* 🌟 FIX 2: UNIFIED INPUT STYLES */}
                    <input type="text" value={bookTitle} onChange={(e) => setBookTitle(e.target.value)}
                      className={inputStyles}
                      placeholder="उदा. शर्मा परिवार का भजन संग्रह"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-sm font-bold text-gray-600 mb-2 font-hindi">
                      <FaLanguage className="text-orange-500" /> भाषा (Lipi)
                    </label>
                    <select value={script} onChange={(e) => setScript(e.target.value as ScriptLanguage)} className={inputStyles}>
                      <option value="devanagari">हिंदी (Devanagari)</option>
                      <option value="gujarati">ગુજરાતી (Gujarati)</option>
                      <option value="bengali">বাংলা (Bengali)</option>
                      <option value="telugu">తెలుగు (Telugu)</option>
                      <option value="gurmukhi">ਪੰਜਾਬੀ (Gurmukhi)</option>
                      <option value="hinglish">English (Hinglish)</option>
                    </select>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-2xl p-5 mb-6 text-left border border-orange-100">
                  <h3 className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-3 border-b border-orange-200/50 pb-2">
                    शगुन विवरण ({selectedSlugs.length} भजन)
                  </h3>
                  <div className="flex justify-between items-center pt-1">
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
                      className="w-full bg-green-600 hover:bg-green-700 text-white font-black text-base sm:text-lg py-4 rounded-2xl shadow-[0_8px_20px_rgba(22,163,74,0.25)] transition-all active:scale-95 flex items-center justify-center gap-2 sm:gap-3"
                    >
                      {flowStatus === 'payment_pending' ? (
                        <><FaSpinner className="animate-spin" /> सुरक्षित भुगतान की तैयारी...</>
                      ) : isPaid ? (
                        <><FaFilePdf /> पुस्तिका बनाएँ (पेमेंट सफल)</>
                      ) : (
                        <><FaShieldAlt /> ₹{currentPrice} का सहयोग करें</>
                      )}
                    </button>
                    {errorMessage && <p className="text-red-500 text-sm font-bold font-hindi">{errorMessage}</p>}
                    <button onClick={prevStep} className="text-sm font-bold text-gray-500 hover:text-gray-800 pt-2">
                      ← वापस जाएँ
                    </button>
                  </div>
                ) : (
                  <div className="py-4 flex flex-col items-center">
                    {(flowStatus === 'verifying' || flowStatus === 'building' || flowStatus === 'rendering') && (
                      <>
                        <FaSpinner className="text-4xl sm:text-5xl text-orange-500 animate-spin mb-4" />
                        <h3 className="text-lg sm:text-xl font-bold font-hindi mb-2">
                          {flowStatus === 'verifying' ? 'पेमेंट वेरिफाई हो रहा है...' : 
                           flowStatus === 'building' ? 'भजन संकलित हो रहे हैं...' : 'पुस्तिका तैयार हो रही है...'}
                        </h3>
                        <p className="text-gray-500 text-sm font-hindi">कृपया पेज बंद न करें।</p>
                      </>
                    )}
                    {flowStatus === 'ready' && (
                      <>
                        <FaCheckCircle className="text-5xl sm:text-6xl text-green-500 mb-4" />
                        <h3 className="text-xl sm:text-2xl font-black text-gray-900 mb-2 font-hindi">पुस्तिका तैयार है!</h3>
                        <p className="text-gray-500 mb-6 text-sm font-hindi">आपका डाउनलोड स्वतः शुरू हो गया होगा।</p>
                        
                        <div className="flex flex-col sm:flex-row justify-center gap-3 w-full max-w-sm mx-auto">
                          <button onClick={() => { if(lastDownloadUrl.current) triggerDownload(lastDownloadUrl.current, bookTitle); }} className="flex-1 bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-xl font-bold text-sm shadow-md transition-colors">
                            पुनः डाउनलोड करें
                          </button>
                          <button onClick={handleStartNew} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-xl font-bold text-sm shadow-sm border border-gray-200 transition-colors">
                            + नई डायरी बनाएँ
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