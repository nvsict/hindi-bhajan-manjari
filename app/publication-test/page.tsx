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
  FaRupeeSign, FaShieldAlt, FaOm, FaWhatsapp, FaInfoCircle, FaListUl
} from 'react-icons/fa';

type WizardStep = 1 | 2 | 3;
type FlowStatus = 'idle' | 'payment_pending' | 'building' | 'rendering' | 'ready' | 'error' | 'verifying';
type TabType = 'all' | 'selected';

// --- FONTS CONFIGURATION FOR LIVE PREVIEW ---
const getScriptFontConfig = (script: ScriptLanguage) => {
  const fontConfigs: Record<ScriptLanguage, { name: string; url: string }> = {
    devanagari: { name: 'Noto Sans Devanagari', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Devanagari:wght@500;600;700;800&family=Rozha+One&display=swap' },
    gujarati: { name: 'Noto Sans Gujarati', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gujarati:wght@500;600;700;800&family=Rozha+One&display=swap' },
    bengali: { name: 'Noto Sans Bengali', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@500;600;700;800&family=Rozha+One&display=swap' },
    telugu: { name: 'Noto Sans Telugu', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Telugu:wght@500;600;700;800&family=Rozha+One&display=swap' },
    gurmukhi: { name: 'Noto Sans Gurmukhi', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Gurmukhi:wght@500;600;700;800&family=Rozha+One&display=swap' },
    hinglish: { name: 'Noto Sans', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans:wght@500;600;700;800&family=Rozha+One&display=swap' },
    kannada: { name: 'Noto Sans Kannada', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Kannada:wght@500;600;700;800&display=swap' },
    tamil: { name: 'Noto Sans Tamil', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@500;600;700;800&display=swap' },
    oriya: { name: 'Noto Sans Oriya', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Oriya:wght@500;600;700;800&display=swap' },
    assamese: { name: 'Noto Sans Bengali', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Bengali:wght@500;600;700;800&display=swap' },
    malayalam: { name: 'Noto Sans Malayalam', url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@500;600;700;800&display=swap' },
  };
  return fontConfigs[script] || fontConfigs.devanagari;
};

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

  // 1. 🌟 LOCAL STORAGE RECOVERY & URL REDIRECT HANDLER
  useEffect(() => {
    setIsClient(true);
    let recoveredState: any = null;

    // A. पुराना डेटा वापस लाएं
    const saved = localStorage.getItem('bhajanPustikaState');
    if (saved) {
      try {
        recoveredState = JSON.parse(saved);
        if (recoveredState.selectedSlugs) setSelectedSlugs(recoveredState.selectedSlugs);
        if (recoveredState.bookTitle) setBookTitle(recoveredState.bookTitle);
        if (recoveredState.script) setScript(recoveredState.script);
        if (recoveredState.theme) setTheme(recoveredState.theme);
        if (recoveredState.pageSize) setPageSize(recoveredState.pageSize);
        if (recoveredState.includeMeaning !== undefined) setIncludeMeaning(recoveredState.includeMeaning);
        if (recoveredState.fontSizeScale) setFontSizeScale(recoveredState.fontSizeScale);
        if (recoveredState.orderId) setSavedOrderId(recoveredState.orderId);
        if (recoveredState.isPaid) setIsPaid(recoveredState.isPaid);
        if (recoveredState.step) setStep(recoveredState.step);
      } catch (e) {}
    }

    // B. क्या यूज़र पेमेंट पेज से वापस आया है? (URL Check)
    const urlParams = new URLSearchParams(window.location.search);
    const isSuccess = urlParams.get('success');
    
    if (isSuccess === 'true' && recoveredState?.orderId) {
      // URL साफ़ करें ताकि रिफ्रेश होने पर दोबारा ट्रिगर न हो
      window.history.replaceState({}, document.title, window.location.pathname);
      setStep(3);
      
      // तुरंत वेरीफाई करके PDF जनरेट करें
      verifyAndGeneratePDF(recoveredState.orderId, recoveredState);
    }
  }, []);

  // 2. 🌟 AUTO-SAVE TO LOCAL STORAGE (सब कुछ सेव करें)
  useEffect(() => {
    if (isClient) {
      localStorage.setItem('bhajanPustikaState', JSON.stringify({
        step, selectedSlugs, bookTitle, script, theme, pageSize, 
        includeMeaning, fontSizeScale, orderId: savedOrderId, isPaid
      }));
    }
  }, [step, selectedSlugs, bookTitle, script, theme, pageSize, includeMeaning, fontSizeScale, savedOrderId, isPaid, isClient]);

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

  const fontConfig = useMemo(() => getScriptFontConfig(script), [script]);

  // Dynamic Pricing
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

  const explicitlySelectedBhajans = useMemo(() => {
    return selectedSlugs.map(slug => bhajans.find(b => b.slug === slug)).filter(Boolean);
  }, [selectedSlugs, bhajans]);

  const toggleSelection = (slug: string) => {
    setSelectedSlugs(prev => prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]);
    if (isPaid) { setIsPaid(false); setSavedOrderId(null); }
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

  // ==========================================
  // 🌟 SECURE REDIRECT PAYMENT FLOW
  // ==========================================
  const handlePaymentAndGenerate = async () => {
    if (selectedSlugs.length === 0) return;
    setErrorMessage("");

    // अगर पहले से पेमेंट हो चुका है (Retry)
    if (isPaid && savedOrderId) {
      return executePDFGeneration(selectedSlugs, bookTitle, { script, theme, pageSize, includeMeaning, fontSizeScale });
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

      // 🌟 REDIRECT TO PAY.HTML
      window.location.href = `/pay.html?mode=book_builder&amount=${currentPrice}&order_id=${orderData.id}&return_path=/publication-test`;

    } catch (error: any) {
      setFlowStatus('error');
      setErrorMessage(error.message || "पेमेंट शुरू करने में समस्या आई।");
    }
  };

  // 🌟 VERIFY AND GENERATE (Call when returning from pay.html)
  const verifyAndGeneratePDF = async (orderId: string, stateOptions: any) => {
    setFlowStatus('verifying');
    try {
      const verifyRes = await fetch(`/api/razorpay/verify?order_id=${orderId}`);
      const verifyData = await verifyRes.json();

      if (verifyData.paid && verifyData.orderType === 'book_builder') {
        setIsPaid(true);
        // Pass explicit options so it doesn't use stale React state
        await executePDFGeneration(stateOptions.selectedSlugs, stateOptions.bookTitle, {
          script: stateOptions.script,
          theme: stateOptions.theme,
          pageSize: stateOptions.pageSize,
          includeMeaning: stateOptions.includeMeaning,
          fontSizeScale: stateOptions.fontSizeScale,
          customTitle: stateOptions.bookTitle
        });
      } else {
        throw new Error("पेमेंट वेरीफाई नहीं हो सका या असफल रहा।");
      }
    } catch (error: any) {
      console.error(error);
      setFlowStatus('error');
      setErrorMessage("पेमेंट प्राप्त हुआ, लेकिन वेरीफाई करने में समस्या आई।");
    }
  };

  // 🌟 ACTUAL PDF GENERATION ENGINE
  const executePDFGeneration = async (slugs: string[], title: string, opts: PublicationRequestOptions) => {
    setFlowStatus('building');
    try {
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

  return (
    <div className="min-h-screen bg-[#fffaf5] text-gray-900 pb-32 sm:pb-12 font-sans selection:bg-orange-200">
      <style suppressHydrationWarning>{`@import url('${fontConfig.url}');`}</style>

      {/* TRANSPARENCY BANNER */}
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

            <div className="bg-white border border-orange-200/80 rounded-3xl shadow-sm flex flex-col h-[60vh] sm:h-[65vh] overflow-hidden">
              <div className="flex bg-gray-50 border-b border-gray-200">
                <button onClick={() => setActiveTab('all')} className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'all' ? 'bg-white text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <FaSearch /> खोंजे और चुनें
                </button>
                <button onClick={() => setActiveTab('selected')} className={`flex-1 py-3.5 text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'selected' ? 'bg-white text-orange-600 border-b-2 border-orange-600' : 'text-gray-500 hover:bg-gray-100'}`}>
                  <FaListUl /> चुने गए भजन <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-[10px]">{selectedSlugs.length}</span>
                </button>
              </div>

              {activeTab === 'all' && (
                <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-0">
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-1">
                      <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input type="text" placeholder="भजन खोजें..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm font-hindi focus:border-orange-500 outline-none" />
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

                  <div className="overflow-y-auto flex-1 pb-2 pr-1">
                    {loadingList ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400"><FaSpinner className="animate-spin text-3xl mb-3 text-orange-500" /></div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {filteredBhajans.map((bhajan) => {
                          const isSelected = selectedSlugs.includes(bhajan.slug);
                          const orderIndex = selectedSlugs.indexOf(bhajan.slug);
                          return (
                            <div key={bhajan.slug} onClick={() => toggleSelection(bhajan.slug)} className={`relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer transition-all ${isSelected ? 'bg-orange-50 border-orange-500' : 'bg-white border-gray-100 hover:border-orange-200'}`}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 border-2 ${isSelected ? 'bg-orange-500 border-orange-500 text-white' : 'border-gray-300'}`}>
                                {isSelected && <span className="text-[10px] font-black">{orderIndex + 1}</span>}
                              </div>
                              <p className={`font-bold text-sm truncate font-hindi flex-1 ${isSelected ? 'text-orange-900' : 'text-gray-800'}`}>{bhajan.title_hindi}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'selected' && (
                <div className="p-4 sm:p-6 flex-1 flex flex-col min-h-0 bg-gray-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-700">कुल चयनित: {selectedSlugs.length}</h3>
                    {selectedSlugs.length > 0 && <button onClick={() => setSelectedSlugs([])} className="text-red-500 text-sm font-bold hover:underline">सभी हटाएँ</button>}
                  </div>
                  <div className="overflow-y-auto flex-1 pr-1 pb-2">
                    {explicitlySelectedBhajans.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 font-hindi text-sm">
                        <FaLayerGroup className="text-4xl mb-3 text-gray-200" />
                        आपने अभी तक कोई भजन नहीं चुना है।
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {explicitlySelectedBhajans.map((bhajan: any, index) => (
                          <div key={bhajan.slug} onClick={() => toggleSelection(bhajan.slug)} className="relative flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border-2 cursor-pointer bg-orange-50 border-orange-500 group">
                            <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 bg-orange-500 border-orange-500 text-white group-hover:bg-red-500 group-hover:border-red-500 transition-colors">
                              <span className="text-[10px] font-black group-hover:hidden">{index + 1}</span>
                              <span className="text-[10px] font-black hidden group-hover:block">✕</span>
                            </div>
                            <p className="font-bold text-sm truncate font-hindi flex-1 text-orange-900">{bhajan.title_hindi}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* FLOATING ACTION BAR */}
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

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase mb-2">फॉन्ट साइज़</label>
                <div className="flex gap-2">
                  {[1.0, 1.2, 1.5].map(scale => (
                    <button key={scale} onClick={() => setFontSizeScale(scale)}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border-2 ${fontSizeScale === scale ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 text-gray-600 bg-white hover:border-gray-300'}`}
                    >
                      {scale}x
                    </button>
                  ))}
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

            {/* LIVE PREVIEW */}
            <div className="bg-[#e5d5c5]/30 border border-[#d2b48c] rounded-3xl p-4 flex flex-col items-center justify-center overflow-hidden">
              <p className="text-xs font-bold text-orange-800 uppercase tracking-widest mb-4 bg-white/50 px-3 py-1 rounded-full">लाइव प्रीव्यू (Live Sample)</p>
              
              <div 
                className="relative bg-[#FFF9EF] w-full max-w-[280px] sm:max-w-[320px] aspect-[1/1.414] shadow-2xl rounded-sm overflow-hidden select-none"
                style={{ fontFamily: `'${fontConfig.name}', sans-serif`, color: '#2C1810' }}
              >
                <div className="absolute inset-[6px] border-[1.5px] border-[#D97706] rounded-sm pointer-events-none"></div>
                <div className="absolute inset-[8px] border-[0.5px] border-[#FDBA74] pointer-events-none"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] font-black text-[#D97706] opacity-[0.035] pointer-events-none">ॐ</div>
                <div className="absolute top-[12px] left-0 right-0 text-center text-[7px] font-bold text-[#B45309]">{bookTitle || 'भजन पुस्तिका'}</div>

                <div className="absolute inset-[16px] flex flex-col items-center pt-8 text-center" style={{ fontSize: `${11 * fontSizeScale}px` }}>
                  <div className="font-extrabold text-[#9A3412] leading-tight px-2" style={{ fontFamily: `'Rozha One', '${fontConfig.name}', serif`, fontSize: '1.6em' }}>
                    {explicitlySelectedBhajans[0]?.title_hindi || 'श्री गणेश स्तुति'}
                  </div>
                  <div className="mt-2 mb-4 px-3 py-0.5 text-[5.5px] font-bold text-[#9A3412] bg-[#D97706]/10 border border-[#D97706]/30 rounded-full">
                    🌐 hindibhajanmanjari.com
                  </div>
                  <div className="font-bold text-[#9A3412] border-l-[1.5px] border-[#D97706] pl-2 pr-1 mb-4 leading-relaxed text-[0.9em]">
                    <div>जय गणेश जय गणेश जय गणेश देवा।</div>
                    <div>माता जाकी पार्वती पिता महादेवा॥</div>
                  </div>
                  {includeMeaning && (
                    <div className="mt-2 w-[85%] bg-[#FFEDD5]/60 border border-[#FDBA74] rounded p-2 text-left">
                      <div className="font-bold text-[#9A3412] text-[0.8em] text-center mb-1">॥ भावार्थ ॥</div>
                      <div className="text-[0.65em] text-[#374151] font-medium leading-normal">
                        भगवान श्री गणेश की स्तुति, जिनकी माता पार्वती और पिता महादेव हैं, जो सभी विघ्नों को हरने वाले हैं।
                      </div>
                    </div>
                  )}
                </div>
                <div className="absolute bottom-[12px] left-0 right-0 text-center text-[6px] font-bold text-[#9A3412]">
                  ॥ पृष्ठ 1 / {Math.max(1, selectedSlugs.length)} ॥
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-4 text-center max-w-[250px]">
                आपके द्वारा चुने गए फॉन्ट साइज़ और भाषा के अनुसार डिज़ाइन बदलता रहेगा।
              </p>
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
                        <><FaSpinner className="animate-spin" /> सुरक्षित भुगतान की तैयारी...</>
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
                  // STATUS UI
                  <div className="py-6 sm:py-8 flex flex-col items-center">
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
                        <button onClick={() => { if(lastDownloadUrl.current) triggerDownload(lastDownloadUrl.current, bookTitle); }} className="bg-orange-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm">
                          पुनः डाउनलोड करें
                        </button>
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