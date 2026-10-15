"use client";
import { useId, useState } from "react";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";
import { FAQS } from "../config";
import ScrollReveal from "@/components/ScrollReveal";

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First FAQ open by default
  const baseId = useId();

  if (!FAQS || FAQS.length === 0) return null;

  return (
    <ScrollReveal yOffset={40}>
      <section
        aria-labelledby={`${baseId}-heading`}
        className="max-w-3xl mx-auto mb-16 sm:mb-24 px-4 sm:px-0"
      >
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div
            aria-hidden="true"
            className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 text-orange-500 mb-4 shadow-sm border border-orange-200"
          >
            <FaQuestionCircle className="text-3xl" />
          </div>
          <h2
            id={`${baseId}-heading`}
            className="font-hindi text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-3 leading-snug"
          >
            अक्सर पूछे जाने वाले सवाल
          </h2>
          <p className="font-hindi text-gray-500 font-medium text-base sm:text-lg leading-relaxed">
            आपके मन में कोई दुविधा हो, तो यहाँ से समाधान पाएं।
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3 sm:space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            const buttonId = `${baseId}-btn-${idx}`;
            const panelId = `${baseId}-panel-${idx}`;

            return (
              <div
                key={faq.q}
                className={`border-2 rounded-2xl overflow-hidden transition-[background-color,border-color,box-shadow] duration-300 motion-reduce:transition-none ${
                  isOpen
                    ? "bg-white border-orange-400 shadow-lg shadow-orange-900/10"
                    : "bg-white border-gray-200 hover:border-orange-300 hover:shadow-md"
                }`}
              >
                <h3 className="m-0">
                  <button
                    id={buttonId}
                    type="button"
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full min-h-[60px] px-4 sm:px-6 py-4 flex justify-between items-center gap-4 text-left cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-orange-400 group"
                  >
                    <span
                      className={`font-hindi font-bold text-base sm:text-lg leading-snug transition-colors duration-300 motion-reduce:transition-none ${
                        isOpen
                          ? "text-orange-700"
                          : "text-gray-800 group-hover:text-orange-600"
                      }`}
                    >
                      {faq.q}
                    </span>

                    <span
                      aria-hidden="true"
                      className={`shrink-0 w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-300 motion-reduce:transition-none ${
                        isOpen
                          ? "bg-orange-100 text-orange-600"
                          : "bg-gray-100 text-gray-500 group-hover:bg-orange-100 group-hover:text-orange-500"
                      }`}
                    >
                      <FaChevronDown
                        className={`text-sm transition-transform duration-300 motion-reduce:transition-none ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      />
                    </span>
                  </button>
                </h3>

                {/* Answer panel.
                    Inline styles drive the height animation so it works on any
                    Tailwind version; `visibility: hidden` when closed removes the
                    content from tab order and screen readers. */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  style={{
                    display: "grid",
                    gridTemplateRows: isOpen ? "1fr" : "0fr",
                    opacity: isOpen ? 1 : 0,
                    visibility: isOpen ? "visible" : "hidden",
                    transition: isOpen
                      ? "grid-template-rows 300ms ease, opacity 300ms ease"
                      : "grid-template-rows 300ms ease, opacity 200ms ease, visibility 0s linear 300ms",
                  }}
                  className="motion-reduce:!transition-none"
                >
                  <div style={{ overflow: "hidden", minHeight: 0 }}>
                    <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                      <div className="rounded-xl border-l-4 border-orange-400 bg-orange-50/70 px-4 py-3 sm:px-5 sm:py-4">
                        <p className="font-hindi text-gray-700 text-[15px] sm:text-base leading-7 sm:leading-8 whitespace-pre-line m-0">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </ScrollReveal>
  );
}