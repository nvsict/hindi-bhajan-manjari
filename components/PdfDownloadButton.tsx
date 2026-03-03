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

export default function PdfDownloadButton({
  titleHindi,
  titleHinglish,
  lyricsHindi,
}: PdfProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const pdfRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!pdfRef.current) return;
    setIsDownloading(true);

    try {
      await (document as any).fonts.ready;

      const element = pdfRef.current;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Top and bottom margins (in millimeters) for the PDF
      const MARGIN_TOP = 18;
      const MARGIN_BOTTOM = 18;
      const usableHeightMm = pdfHeight - MARGIN_TOP - MARGIN_BOTTOM;

      const fullCanvas = await html2canvas(element, {
        scale: 1.5,
        useCORS: true,
        backgroundColor: "#fffcf5",
        windowWidth: 794,
        scrollY: -window.scrollY, // Prevent scroll shifting issues
      });

      const scale = fullCanvas.width / pdfWidth;
      const usableHeightPx = Math.floor(usableHeightMm * scale);

      let position = 0; // Current Y position on the source canvas
      let page = 0;
      const fullHeight = fullCanvas.height;

      const addBackground = (doc: jsPDF) => {
        doc.setFillColor(255, 252, 245);
        doc.rect(0, 0, pdfWidth, pdfHeight, "F");
      };

      const addFooter = (doc: jsPDF) => {
        doc.setTextColor(234, 88, 12);
        doc.setFontSize(9);
        doc.textWithLink(
          "www.hindibhajanmanjari.com",
          pdfWidth / 2,
          pdfHeight - 8,
          {
            url: "https://www.hindibhajanmanjari.com",
            align: "center",
          }
        );
      };

      // 🌟 STRICT SLICING LOOP (No overlaps, no bleeds)
      while (position < fullHeight) {
        if (page > 0) pdf.addPage();

        addBackground(pdf);

        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = fullCanvas.width;
        // Make the page canvas the exact size of an A4 page
        pageCanvas.height = Math.floor(pdfHeight * scale);

        const ctx = pageCanvas.getContext("2d")!;
        ctx.fillStyle = "#fffcf5";
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);

        // Grab exactly what fits in the usable space, no more.
        const sliceHeight = Math.min(usableHeightPx, fullHeight - position);
        const marginTopPx = Math.floor(MARGIN_TOP * scale);

        ctx.drawImage(
          fullCanvas,
          0,
          position, // Start exactly where we left off
          fullCanvas.width,
          sliceHeight,
          0,
          marginTopPx, // Push down by the top margin
          fullCanvas.width,
          sliceHeight
        );

        const imgData = pageCanvas.toDataURL("image/jpeg", 0.85);
        pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);

        addFooter(pdf);

        // Advance position strictly by the amount we consumed, preventing duplicate text!
        position += usableHeightPx;
        page++;
      }

      const filename =
        titleHinglish.replace(/\s+/g, "-") + "-HindiBhajanManjari.pdf";

      pdf.save(filename);
    } catch (err) {
      console.error(err);
      alert("PDF generation failed. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleDownload}
        disabled={isDownloading}
        className="flex items-center gap-2 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white border border-red-200 px-4 py-2 rounded-lg font-bold text-sm transition-all duration-300 shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isDownloading ? <FaSpinner className="animate-spin" /> : <FaFilePdf />}
        {isDownloading ? "Generating..." : "Download PDF"}
      </button>

      {/* HIDDEN TEMPLATE */}
      <div className="fixed pointer-events-none" style={{ top: "-9999px", left: 0 }}>
        <div
          ref={pdfRef}
          style={{
            position: "relative",
            width: "794px",
            backgroundColor: "#fffcf5",
            padding: "0 64px",
            fontFamily: '"Noto Sans Devanagari","Mangal",serif',
            overflow: "hidden",
          }}
        >
          {/* WATERMARK */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexWrap: "wrap",
              alignContent: "center",
              justifyContent: "center",
              opacity: 0.10,
              transform: "rotate(-28deg)",
              pointerEvents: "none",
            }}
          >
            {Array.from({ length: 14 }).map((_, i) => (
              <span
                key={i}
                style={{
                  fontSize: "50px",
                  fontWeight: 800,
                  color: "#ea580c",
                  margin: "20px",
                  letterSpacing: "6px",
                }}
              >
                HINDI BHAJAN MANJARI
              </span>
            ))}
          </div>

          <div style={{ position: "relative", zIndex: 2, paddingTop: "10px", textAlign: "center" }}>
            <h1 style={{ fontSize: "30px", fontWeight: 900, color: "#c2410c", lineHeight: 1.35 }}>
              {titleHindi}
            </h1>

            <h2 style={{ fontSize: "15px", letterSpacing: "2.5px", color: "#78716c" }}>
              {titleHinglish}
            </h2>
          </div>

          <div
            style={{
              position: "relative",
              zIndex: 2,
              fontSize: "22px",
              lineHeight: 1.5,
              whiteSpace: "pre-wrap",
              textAlign: "center",
              marginTop: "20px",
            }}
          >
            {lyricsHindi}
          </div>

          <div style={{ position: "relative", zIndex: 2, textAlign: "center", marginTop: "60px", paddingBottom: "5px" }}>
            <p style={{ fontSize: "12px", color: "#a8a29e" }}>Downloaded from</p>
          </div>
        </div>
      </div>
    </>
  );
}