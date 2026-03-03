"use client";

import { useState } from 'react';
import { FaChevronDown, FaQuestionCircle } from 'react-icons/fa';

interface FAQ {
  question: string;
  answer: string;
}

interface FAQAccordionProps {
  faqs: FAQ[];
  title?: string;
}

export default function FAQAccordion({ faqs, title = "अक्सर पूछे जाने वाले प्रश्न (FAQs)" }: FAQAccordionProps) {
  // Keep the first FAQ open by default for better UX
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  // 🌟 THE SEO MAGIC: Automatically generates Google FAQ Schema
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map((faq) => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  };

  if (!faqs || faqs.length === 0) return null;

  return (
    <div className="mt-12 bg-white rounded-3xl p-8 md:p-10 shadow-sm border border-orange-100 relative overflow-hidden">
      {/* Hidden Schema Script for Google Bots */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <div className="flex items-center gap-3 mb-8 border-b border-orange-100 pb-4">
        <FaQuestionCircle className="text-orange-500 text-3xl" />
        <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">
          {title}
        </h2>
      </div>

      <div className="space-y-4">
        {faqs.map((faq, index) => {
          const isOpen = openIndex === index;

          return (
            <div 
              key={index} 
              className={`border rounded-2xl transition-colors duration-300 overflow-hidden ${
                isOpen ? 'border-orange-300 bg-orange-50/50' : 'border-gray-200 hover:border-orange-200 bg-white'
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex items-center justify-between p-5 text-left focus:outline-none"
              >
                <span className={`font-bold text-lg pr-4 font-hindi ${isOpen ? 'text-orange-700' : 'text-gray-800'}`}>
                  {faq.question}
                </span>
                <FaChevronDown 
                  className={`text-orange-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
                />
              </button>
              
              <div 
                className={`transition-all duration-300 ease-in-out ${
                  isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}
              >
                <div className="p-5 pt-0 text-gray-600 font-hindi leading-relaxed text-lg">
                  {faq.answer}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}