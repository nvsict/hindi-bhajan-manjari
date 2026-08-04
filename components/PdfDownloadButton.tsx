"use client";

import React, { useState } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import { createSingleBhajanDocument } from "@/lib/publication/content/selector";
import { ScriptLanguage } from "@/lib/publication/types";

interface PdfProps {
  slug: string;
  titleHindi: string;
  /**
   * 🌟 यूज़र स्क्रीन पर जिस लिपि (Script) में भजन पढ़ रहा है (जैसे 'gujarati', 'hinglish', 'devanagari')
   * डिफ़ॉल्ट: 'devanagari'
   */
  currentScript?: ScriptLanguage;
}

export default function PdfDownloadButton({ 
  slug, 
  titleHindi, 
  currentScript = "devanagari" 
}: PdfProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!slug) return;
    setIsGenerating(true);

    try {
      // 1. 🌟 यूज़र की लाइव स्क्रिप्ट (currentScript) को डॉक्यूमेंट मॉडल में पास करें
      const docModel = await createSingleBhajanDocument(slug, {
        script: currentScript,     // 🌟 स्क्रीन वाली भाषा ही पीडीएफ में जाएगी
        theme: "temple",           // Royal Parchment थीम
        pageSize: "A4",            // स्टैंडर्ड A4 फुल-ब्लीड
        includeMeaning: true,      // सम्पूर्ण भावार्थ शामिल करें
        fontSizeScale: 1.0,        // A4 के लिए 1.0x सामान्य स्केल
      });

      if (!docModel) {
        throw new Error("Failed to generate publication model.");
      }

      // 2. Server-Side Puppeteer API से PDF मंगाएं (/api/export/pdf)
      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(docModel),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || "Server PDF generation failed.");
      }

      // 3. सुरक्षित और साफ फ़ाइल नाम बनाएं (ट्रांसलिट्रेटेड टाइटल या हिंदी टाइटल से)
      const fileNameSource = docModel.metadata.title || titleHindi || "Bhajan";
      const safeFileName = fileNameSource
        .replace(/[^a-zA-Z0-9\u0900-\u097F\u0A80-\u0AFF\u0980-\u09FF\u0C00-\u0C7F\u0A00-\u0A7F-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "_") || "Bhajan_Sangrah";

      // 4. डाउनलोड ट्रिगर करें
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${safeFileName}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("PDF Download Error:", error);
      alert("PDF डाउनलोड करने में समस्या आई: " + (error.message || "कृपया पुनः प्रयास करें।"));
    } finally {
      setIsGenerating(false);
    }
  };

  // स्क्रिप्ट के अनुसार छोटा सा इंडिकेटर टेक्स्ट (ऑप्शनल UX टच)
  const scriptLabelMap: Record<ScriptLanguage, string> = {
    devanagari: "हिंदी",
    gujarati: "ગુજરાતી",
    bengali: "বাংলা",
    telugu: "తెలుగు",
    gurmukhi: "ਪੰਜਾਬੀ",
    hinglish: "English",
    kannada: "ಕನ್ನಡ",
    tamil: "ತಮಿಳು",
    oriya: "ଓଡ଼ିଆ",
    malayalam: "ಮಲಯಾಳಂ",
    assamese: "ಅಸ್ಸಾಮಿ",
  };

  const buttonLabel = `PDF डाउनलोड (${scriptLabelMap[currentScript] || "PDF"})`;

  return (
    <button
      onClick={handleDownload}
      disabled={isGenerating}
      className="inline-flex items-center gap-2 px-4 py-2.5 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all cursor-pointer active:scale-95"
      title={`इस भजन की शाही सनातन पार्चमेंट PDF (${scriptLabelMap[currentScript] || currentScript} लिपि में) डाउनलोड करें`}
    >
      {isGenerating ? (
        <FaSpinner className="animate-spin text-base" />
      ) : (
        <FaFilePdf className="text-base" />
      )}
      <span>{isGenerating ? "PDF बन रहा है..." : buttonLabel}</span>
    </button>
  );
}