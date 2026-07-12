"use client";

import { useState, useRef } from "react";
import { FaFilePdf, FaSpinner } from "react-icons/fa";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

interface PdfProps {
  titleHindi: string;
  titleHinglish: string;
  lyricsHindi: string;
}

export default function PdfDownloadButton({ titleHindi, titleHinglish, lyricsHindi }: PdfProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    setIsGenerating(true);

    // 🌟 रेंडरिंग के लिए 500ms का समय दें ताकि HTML सही से तैयार हो सके
    setTimeout(async () => {
      if (!pdfRef.current) {
        setIsGenerating(false);
        return;
      }

      try {
        await (document as any).fonts.ready;
        const element = pdfRef.current;

        // PDF सेटअप
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
          compress: true,
        });

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const MARGIN_TOP = 20;
        const MARGIN_BOTTOM = 20;
        const usableHeightMm = pdfHeight - MARGIN_TOP - MARGIN_BOTTOM;

        // हाई क्वालिटी रेंडरिंग
        const fullCanvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: "#fffcf5",
          windowWidth: 794,
        });

        const scale = fullCanvas.width / pdfWidth;
        const usableHeightPx = Math.floor(usableHeightMm * scale);
        let position = 0;
        let page = 0;
        const fullHeight = fullCanvas.height;

        while (position < fullHeight) {
          if (page > 0) pdf.addPage();

          // बैकग्राउंड और फूटर
          pdf.setFillColor(255, 252, 245);
          pdf.rect(0, 0, pdfWidth, pdfHeight, "F");

          const pageCanvas = document.createElement("canvas");
          pageCanvas.width = fullCanvas.width;
          pageCanvas.height = Math.floor(pdfHeight * scale);
          const ctx = pageCanvas.getContext("2d")!;
          ctx.fillStyle = "#fffcf5";
          ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

          const sliceHeight = Math.min(usableHeightPx, fullHeight - position);
          ctx.drawImage(fullCanvas, 0, position, fullCanvas.width, sliceHeight, 0, Math.floor(MARGIN_TOP * scale), fullCanvas.width, sliceHeight);

          const imgData = pageCanvas.toDataURL("image/jpeg", 0.9);
          pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

          pdf.setTextColor(234, 88, 12);
          pdf.setFontSize(9);
          pdf.text("www.hindibhajanmanjari.com", pdfWidth / 2, pdfHeight - 10, { align: "center" });

          position += usableHeightPx;
          page++;
        }

        pdf.save(`${titleHinglish.replace(/\s+/g, "-")}-HindiBhajanManjari.pdf`);
      } catch (err) {
        console.error(err);
        alert("PDF generation failed.");
      } finally {
        setIsGenerating(false);
      }
    }, 500);
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isGenerating}
        className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50"
      >
        {isGenerating ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
        {isGenerating ? "Generating..." : "Download PDF"}
      </button>

      {/* 🌟 LAZY RENDER: यह डब्बा तभी रेंडर होगा जब आप क्लिक करेंगे */}
      {isGenerating && (
        <div style={{ position: "fixed", top: "-9999px", left: "0", pointerEvents: "none" }}>
          <div
            ref={pdfRef}
            style={{
              width: "794px",
              backgroundColor: "#fffcf5",
              color: "#171717",
              padding: "40px 60px",
              fontFamily: 'serif',
              display: "block",
            }}
          >
            {/* वाटरमार्क */}
            <div aria-hidden="true" style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexWrap: "wrap", justifyContent: "center", opacity: 0.05, transform: "rotate(-25deg)" }}>
              {Array.from({ length: 10 }).map((_, i) => (
                <span key={i} style={{ fontSize: "60px", fontWeight: 800, color: "#ea580c", margin: "40px" }}>HINDI BHAJAN MANJARI</span>
              ))}
            </div>

            <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginBottom: "40px" }}>
              <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#c2410c", margin: 0 }}>{titleHindi}</h1>
              <h2 style={{ fontSize: "16px", color: "#78716c", marginTop: "10px" }}>{titleHinglish}</h2>
            </div>

            <div
              style={{
                position: "relative",
                zIndex: 2,
                fontSize: "20px",
                lineHeight: "2", // 🌟 लाइन स्पेसिंग बढ़ाई गई ताकि फॉरमेटिंग न बिगड़े
                textAlign: "center",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                color: "#171717",
              }}
            >
              {lyricsHindi}
            </div>
          </div>
        </div>
      )}
    </>
  );
}