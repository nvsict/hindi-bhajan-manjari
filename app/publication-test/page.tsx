"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import { supabase } from '@/utils/supabase';
import {
  createSingleBhajanDocument,
  createMultiBhajanDocument,
  PublicationRequestOptions
} from '@/lib/publication/content/selector';
import {
  ScriptLanguage,
  ThemeStyle,
  PageSize,
  PublicationDocument
} from '@/lib/publication/types';
import {
  FaFilePdf, FaBook, FaCog, FaCheckCircle, FaCircle,
  FaSearch, FaSpinner, FaMagic, FaCrown, FaDownload,
  FaCheck, FaRedo, FaExclamationTriangle, FaLayerGroup
} from 'react-icons/fa';

// The visible states of the single build→download flow.
type FlowStatus = 'idle' | 'building' | 'rendering' | 'ready' | 'error';

export default function PublicationTestStudio() {
  // --- STATE 1: COMPLETE DATABASE FROM SUPABASE ---
  const [bhajans, setBhajans] = useState<any[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([]);

  // --- STATE 2: CATEGORIZATION FILTERS ---
  const [selectedDeity, setSelectedDeity] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  // --- STATE 3: PUBLICATION CONFIGURATION ---
  const [bookTitle, setBookTitle] = useState("मेरी भजन मंजरी बुक");
  const [script, setScript] = useState<ScriptLanguage>('devanagari');
  const [theme, setTheme] = useState<ThemeStyle>('temple');
  const [pageSize, setPageSize] = useState<PageSize>('A4');
  const [includeMeaning, setIncludeMeaning] = useState(true);
  const [fontSizeScale, setFontSizeScale] = useState<number>(1.0);

  // --- STATE 4: THE SINGLE GENERATE → DOWNLOAD FLOW ---
  // The Document Model (Layer 3 JSON) is kept internally only —
  // it is never shown to the end user, just used to drive the flow.
  const [generatedModel, setGeneratedModel] = useState<PublicationDocument | null>(null);
  const [flowStatus, setFlowStatus] = useState<FlowStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string>("");
  const lastDownloadUrl = useRef<string | null>(null);

  // 1. Supabase से सभी भजनों का पूरा डेटा लोड करें
  useEffect(() => {
    const fetchAllBhajans = async () => {
      setLoadingList(true);
      const { data, error } = await supabase
        .from('mv_bhajan_details')
        .select('slug, title_hindi, title_hinglish, deity, categories')
        .order('title_hindi', { ascending: true });

      if (!error && data) {
        setBhajans(data);
        if (data.length >= 2) {
          setSelectedSlugs([data[0].slug, data[1].slug]);
        }
      }
      setLoadingList(false);
    };

    fetchAllBhajans();
  }, []);

  // 🌟 SMART ADAPTATION: पेज साइज़ बदलने पर स्वचालित रूप से बेस्ट फॉन्ट स्केल सुझाना
  const handlePageSizeChange = (newSize: PageSize) => {
    setPageSize(newSize);
    setFontSizeScale(newSize === 'A5' ? 1.2 : 1.0);
  };

  // किसी भी सेटिंग/सलेक्शन में बदलाव होने पर, पुराना "तैयार है" स्टेटस रीसेट करें —
  // ताकि यूज़र को साफ दिखे कि अब दोबारा जनरेट करना होगा
  useEffect(() => {
    if (flowStatus === 'ready' || flowStatus === 'error') {
      setFlowStatus('idle');
      setGeneratedModel(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSlugs, bookTitle, script, theme, pageSize, includeMeaning, fontSizeScale]);

  // देवी-देवताओं (Deities) की यूनिक लिस्ट
  const uniqueDeities = useMemo(() => {
    const list = new Set<string>();
    bhajans.forEach(b => {
      if (b.deity && b.deity.name_hindi) list.add(b.deity.name_hindi);
      else if (b.deity && b.deity.name_hinglish) list.add(b.deity.name_hinglish);
    });
    return Array.from(list);
  }, [bhajans]);

  // श्रेणियों (Categories) की यूनिक लिस्ट
  const uniqueCategories = useMemo(() => {
    const list = new Set<string>();
    bhajans.forEach(b => {
      if (Array.isArray(b.categories)) {
        b.categories.forEach((cat: any) => {
          if (cat.name_hindi) list.add(cat.name_hindi);
          else if (cat.name_hinglish) list.add(cat.name_hinglish);
        });
      }
    });
    return Array.from(list);
  }, [bhajans]);

  // फिल्टर किए गए भजनों की लिस्ट
  const filteredBhajans = useMemo(() => {
    return bhajans.filter(b => {
      const matchesSearch =
        b.title_hindi?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        b.title_hinglish?.toLowerCase().includes(searchQuery.toLowerCase());

      const bDeityName = b.deity?.name_hindi || b.deity?.name_hinglish || "";
      const matchesDeity = selectedDeity === "ALL" || bDeityName === selectedDeity;

      const bCategories = Array.isArray(b.categories)
        ? b.categories.map((c: any) => c.name_hindi || c.name_hinglish)
        : [];
      const matchesCategory = selectedCategory === "ALL" || bCategories.includes(selectedCategory);

      return matchesSearch && matchesDeity && matchesCategory;
    });
  }, [bhajans, searchQuery, selectedDeity, selectedCategory]);

  // सलेक्शन टॉगल हैंडलर
  const toggleSelection = (slug: string) => {
    setSelectedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    );
  };

  const handleSelectAllFiltered = () => {
    const filteredSlugs = filteredBhajans.map(b => b.slug);
    const allSelected = filteredSlugs.every(s => selectedSlugs.includes(s));

    if (allSelected) {
      setSelectedSlugs(prev => prev.filter(s => !filteredSlugs.includes(s)));
    } else {
      const combined = Array.from(new Set([...selectedSlugs, ...filteredSlugs]));
      setSelectedSlugs(combined);
    }
  };

  // --- THE SINGLE COMBINED FLOW: build the model, then render + fetch the PDF ---
  const handleGeneratePDF = async () => {
    if (selectedSlugs.length === 0) {
      setErrorMessage("कृपया कम से कम 1 भजन चुनें।");
      setFlowStatus('error');
      return;
    }

    setErrorMessage("");
    setFlowStatus('building');

    const options: PublicationRequestOptions = {
      script,
      theme,
      pageSize,
      includeMeaning,
      fontSizeScale,
      customTitle: bookTitle,
    };

    try {
      let model: PublicationDocument | null = null;
      if (selectedSlugs.length === 1) {
        model = await createSingleBhajanDocument(selectedSlugs[0], options);
      } else {
        model = await createMultiBhajanDocument(bookTitle, selectedSlugs, options);
      }

      if (!model) {
        throw new Error("भजन डेटा तैयार नहीं हो सका। कृपया दोबारा कोशिश करें।");
      }

      setGeneratedModel(model);
      setFlowStatus('rendering');

      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(model),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `सर्वर एरर (status: ${response.status})`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      lastDownloadUrl.current = url;
      triggerDownload(url, model.metadata.title);

      setFlowStatus('ready');
    } catch (err: any) {
      console.error("PDF generation error:", err);
      setErrorMessage(err.message || "कुछ गड़बड़ हो गई, कृपया दोबारा कोशिश करें।");
      setFlowStatus('error');
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

  // "फिर से डाउनलोड करें" — पहले से बनी हुई PDF को दोबारा भजन बनाए बिना डाउनलोड करना
  const handleRedownload = () => {
    if (lastDownloadUrl.current && generatedModel) {
      triggerDownload(lastDownloadUrl.current, generatedModel.metadata.title);
    }
  };

  const isBusy = flowStatus === 'building' || flowStatus === 'rendering';

  return (
    <div className="min-h-screen bg-orange-50/40 text-gray-900 p-3 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* --- RESPONSIVE HEADER --- */}
        <header className="bg-white border border-orange-200 rounded-3xl p-5 sm:p-8 shadow-sm mb-6 sm:mb-8">
          <span className="bg-orange-100 text-orange-700 text-xs font-bold uppercase tracking-widest px-3.5 py-1.5 rounded-full border border-orange-200 inline-flex items-center gap-1.5">
            <FaCrown className="text-amber-600" /> Royal Parchment Edition
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight mt-3 flex items-center gap-2 font-hindi">
            हिंदी भजन मंजरी <span className="text-orange-600">बुक बिल्डर</span>
          </h1>
          <p className="text-gray-600 text-xs sm:text-sm mt-1">
            भजन चुनें, सेटिंग्स सेट करें, और एक क्लिक में अपनी शाही पार्चमेंट PDF बुक तैयार करें।
          </p>
        </header>

        {/* --- RESPONSIVE GRID LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">

          {/* COLUMN 1: CONFIGURATION & BHAJAN SELECTOR (5 COLUMNS) */}
          <div className="lg:col-span-5 space-y-6">

            {/* SETTINGS CARD */}
            <div className="bg-white border border-orange-200/80 rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3 font-hindi">
                <FaCog className="text-orange-600" /> पुस्तक सेटिंग्स (Settings)
              </h2>

              <div>
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                  पुस्तक का शीर्षक (Book Title)
                </label>
                <input
                  type="text"
                  value={bookTitle}
                  onChange={(e) => setBookTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-900 focus:outline-none focus:border-orange-500 font-hindi font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    भाषा / लिपि (Script)
                  </label>
                  <select
                    value={script}
                    onChange={(e) => setScript(e.target.value as ScriptLanguage)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="devanagari">हिंदी (Devanagari)</option>
                    <option value="gujarati">ગુજરાતી (Gujarati)</option>
                    <option value="bengali">বাংলা (Bengali)</option>
                    <option value="telugu">తెలుగు (Telugu)</option>
                    <option value="gurmukhi">ਪੰਜਾਬੀ (Gurmukhi)</option>
                    <option value="hinglish">English (Hinglish)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    थीम स्टाइल (Theme)
                  </label>
                  <select
                    value={theme}
                    onChange={(e) => setTheme(e.target.value as ThemeStyle)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="temple">Royal Parchment</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    पेज साइज़ <span className="text-orange-600 font-normal">(Smart Adapt)</span>
                  </label>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(e.target.value as PageSize)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="A4">A4 Standard</option>
                    <option value="A5">A5 Pocket Size</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
                    फॉन्ट साइज़
                  </label>
                  <select
                    value={fontSizeScale}
                    onChange={(e) => setFontSizeScale(parseFloat(e.target.value))}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500 font-medium"
                  >
                    <option value="1.0">1.0x (सामान्य)</option>
                    <option value="1.2">1.2x (कीर्तन / पॉकेट)</option>
                    <option value="1.5">1.5x (बड़ा प्रिंट)</option>
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeMeaning}
                    onChange={(e) => setIncludeMeaning(e.target.checked)}
                    className="w-4 h-4 accent-orange-600 rounded"
                  />
                  <span className="text-sm font-bold text-gray-700">
                    सम्पूर्ण भावार्थ (Explanation / Meaning) शामिल करें
                  </span>
                </label>
              </div>
            </div>

            {/* BHAJAN SELECTOR CARD */}
            <div className="bg-white border border-orange-200/80 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col max-h-[640px]">

              <div className="flex justify-between items-center mb-4 gap-3">
                <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 font-hindi shrink-0">
                  <FaBook className="text-orange-600" /> भजन चुनें
                </h2>
                <div className="flex items-center gap-2 shrink-0">
                  {selectedSlugs.length > 0 && (
                    <span className="bg-orange-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {selectedSlugs.length} चुने गए
                    </span>
                  )}
                  <button
                    onClick={handleSelectAllFiltered}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 bg-orange-50 px-3 py-1.5 rounded-lg border border-orange-200 cursor-pointer whitespace-nowrap"
                  >
                    {filteredBhajans.length > 0 && filteredBhajans.every(b => selectedSlugs.includes(b.slug)) ? "हटाएं" : "सभी चुनें"}
                  </button>
                </div>
              </div>

              {/* FILTER BAR */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <select
                  value={selectedDeity}
                  onChange={(e) => setSelectedDeity(e.target.value)}
                  className="w-full bg-orange-50/50 border border-orange-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-orange-500 font-hindi"
                >
                  <option value="ALL">🙏 सभी देवी-देवता ({uniqueDeities.length})</option>
                  {uniqueDeities.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-orange-50/50 border border-orange-200 rounded-xl px-3 py-2 text-xs font-bold text-gray-800 focus:outline-none focus:border-orange-500 font-hindi"
                >
                  <option value="ALL">📂 सभी श्रेणियाँ ({uniqueCategories.length})</option>
                  {uniqueCategories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Search Box */}
              <div className="relative mb-4">
                <FaSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                <input
                  type="text"
                  placeholder="भजन का नाम खोजें..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-10 pr-4 py-2 text-sm text-gray-900 focus:outline-none focus:border-orange-500 font-hindi"
                />
              </div>

              {/* List — now a responsive card grid instead of a single column */}
              <div className="overflow-y-auto pr-1 flex-1">
                {loadingList ? (
                  <div className="p-12 text-center text-gray-500 text-sm flex flex-col items-center">
                    <FaSpinner className="animate-spin text-2xl mb-2 text-orange-600" />
                    डेटाबेस से भजन लोड हो रहे हैं...
                  </div>
                ) : filteredBhajans.length === 0 ? (
                  <div className="p-8 text-center text-gray-500 text-sm font-hindi">
                    इस श्रेणी या देवता में कोई भजन नहीं मिला।
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {filteredBhajans.map((bhajan) => {
                      const isSelected = selectedSlugs.includes(bhajan.slug);
                      const orderIndex = selectedSlugs.indexOf(bhajan.slug);
                      const bDeity = bhajan.deity?.name_hindi || bhajan.deity?.name_hinglish || "";
                      return (
                        <div
                          key={bhajan.slug}
                          onClick={() => toggleSelection(bhajan.slug)}
                          className={`relative flex items-start gap-2.5 p-3.5 rounded-2xl border cursor-pointer transition-all ${
                            isSelected
                              ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50/40'
                          }`}
                        >
                          <div className="shrink-0 text-lg mt-0.5">
                            {isSelected ? (
                              <FaCheckCircle className="text-white" />
                            ) : (
                              <FaCircle className="text-gray-200" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="font-bold font-hindi text-sm truncate">
                              {bhajan.title_hindi}
                            </p>
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                                isSelected ? 'bg-orange-500 text-white' : 'bg-orange-100 text-orange-800'
                              }`}>
                                {bDeity || "भजन"}
                              </span>
                              <span className={`text-[11px] truncate ${
                                isSelected ? 'text-orange-100' : 'text-gray-400'
                              }`}>
                                {bhajan.title_hinglish}
                              </span>
                            </div>
                          </div>
                          {isSelected && selectedSlugs.length > 1 && (
                            <span className="absolute -top-2 -right-2 w-5 h-5 flex items-center justify-center rounded-full bg-white text-orange-700 text-[10px] font-black border border-orange-200 shadow-sm">
                              {orderIndex + 1}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* COLUMN 2: THE FRIENDLY BUILD → DOWNLOAD PANEL (7 COLUMNS) */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="bg-white border border-orange-200/80 rounded-3xl p-5 sm:p-8 shadow-sm flex-1 flex flex-col">

              {/* Summary strip */}
              <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4 mb-6">
                <span className="inline-flex items-center gap-1.5 bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full border border-orange-200">
                  <FaLayerGroup /> {selectedSlugs.length} भजन चुने गए
                </span>
                <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
                  {pageSize} • {fontSizeScale}x
                </span>
                {includeMeaning && (
                  <span className="inline-flex items-center gap-1.5 bg-gray-50 text-gray-600 text-xs font-bold px-3 py-1.5 rounded-full border border-gray-200">
                    भावार्थ सहित
                  </span>
                )}
              </div>

              {/* The single adaptive status + action area */}
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4 py-10 sm:py-16">

                {flowStatus === 'idle' && (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-5">
                      <FaMagic className="text-3xl text-orange-500" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 font-hindi mb-2">
                      आपकी पुस्तक बनाने के लिए तैयार
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-8 font-hindi">
                      बाईं ओर भजन चुनें और सेटिंग्स सेट करें, फिर नीचे बटन दबाकर अपनी PDF तुरंत बनाएं।
                    </p>
                  </>
                )}

                {flowStatus === 'building' && (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-5">
                      <FaSpinner className="text-3xl text-orange-500 animate-spin" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 font-hindi mb-2">
                      भजन तैयार किए जा रहे हैं...
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-8 font-hindi">
                      शीर्षक, भावार्थ और लिपि रूपांतरण को व्यवस्थित किया जा रहा है।
                    </p>
                  </>
                )}

                {flowStatus === 'rendering' && (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-5">
                      <FaFilePdf className="text-3xl text-orange-500 animate-pulse" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 font-hindi mb-2">
                      आपकी शाही पार्चमेंट PDF बन रही है...
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-8 font-hindi">
                      इसमें कुछ सेकंड लग सकते हैं, कृपया पेज बंद न करें।
                    </p>
                  </>
                )}

                {flowStatus === 'ready' && (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-green-50 border border-green-200 flex items-center justify-center mb-5">
                      <FaCheck className="text-3xl text-green-600" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 font-hindi mb-2">
                      आपकी PDF तैयार है और डाउनलोड हो चुकी है!
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm mb-8 font-hindi">
                      {generatedModel?.metadata.title}.pdf — अगर डाउनलोड शुरू नहीं हुई, तो नीचे बटन दबाएं।
                    </p>
                  </>
                )}

                {flowStatus === 'error' && (
                  <>
                    <div className="w-20 h-20 rounded-3xl bg-red-50 border border-red-200 flex items-center justify-center mb-5">
                      <FaExclamationTriangle className="text-3xl text-red-500" />
                    </div>
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 font-hindi mb-2">
                      PDF नहीं बन सकी
                    </h3>
                    <p className="text-sm text-red-500 max-w-sm mb-8 font-hindi">
                      {errorMessage}
                    </p>
                  </>
                )}

                {/* --- ADAPTIVE ACTION BUTTON(S) --- */}
                <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  {(flowStatus === 'idle' || flowStatus === 'error') && (
                    <button
                      onClick={handleGeneratePDF}
                      disabled={selectedSlugs.length === 0}
                      className="w-full sm:w-auto bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-orange-600/20 transition-all active:scale-95 text-sm cursor-pointer"
                    >
                      {flowStatus === 'error' ? <FaRedo /> : <FaMagic />}
                      {flowStatus === 'error' ? 'दोबारा कोशिश करें' : 'PDF बनाएं (Generate PDF)'}
                    </button>
                  )}

                  {isBusy && (
                    <button
                      disabled
                      className="w-full sm:w-auto bg-orange-300 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 text-sm cursor-not-allowed"
                    >
                      <FaSpinner className="animate-spin" />
                      {flowStatus === 'building' ? 'तैयार हो रहा है...' : 'PDF बन रही है...'}
                    </button>
                  )}

                  {flowStatus === 'ready' && (
                    <>
                      <button
                        onClick={handleRedownload}
                        className="w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2.5 shadow-md shadow-green-600/20 transition-all active:scale-95 text-sm cursor-pointer"
                      >
                        <FaDownload /> PDF डाउनलोड करें
                      </button>
                      <button
                        onClick={handleGeneratePDF}
                        className="w-full sm:w-auto bg-white hover:bg-gray-50 text-gray-700 font-bold px-6 py-4 rounded-2xl flex items-center justify-center gap-2 border border-gray-200 transition-all active:scale-95 text-sm cursor-pointer"
                      >
                        <FaRedo /> दोबारा बनाएं
                      </button>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </div>
  );
}