import type { Metadata } from "next";
import Script from "next/script";
import { FaFeatherAlt, FaRegCheckCircle, FaLock } from "react-icons/fa";
import ScrollReveal from "../../components/ScrollReveal";
import LetterOrder, { StickyOrderBar } from "./LetterOrder";
import { PACKAGES, FAQS } from "./config";

import FaqSection from "./components/FaqSection";
import LetterTypes from "./components/LetterTypes";
import PricingPackages from "./components/PricingPackages";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.hindibhajanmanjari.com";

export const metadata: Metadata = {
  title: "ब्रज से पत्र | A Letter from Braj",
  description: "डिजिटल दुनिया में एक व्यक्तिगत स्पर्श। ब्रज की मिठास और आपकी भावनाओं से रचे, हाथों से लिखे गए विशेष पत्र।",
  alternates: { canonical: `${siteUrl}/letter-from-braj` },
};

export default function LetterFromBrajPage() {
  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "ब्रज से पत्र (A Letter from Braj)",
    "description": "Custom handwritten emotional and devotional letters written in Hindi and Braj Bhasha.",
    "provider": { "@type": "Organization", "name": "Hindi Bhajan Manjari", "url": siteUrl },
    "areaServed": "IN",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Letter Writing Services",
      "itemListElement": PACKAGES.map((pkg, idx) => ({
        "@type": "Offer",
        "itemOffered": { "@type": "Service", "name": pkg.name },
        "price": pkg.price,
        "priceCurrency": "INR",
        "position": idx + 1
      }))
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": FAQS.map((faq) => ({
      "@type": "Question",
      "name": faq.q,
      "acceptedAnswer": { "@type": "Answer", "text": faq.a }
    }))
  };

  return (
    <div className="min-h-screen bg-[#fffcf5] transition-colors duration-300">
      <Script id="service-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }} />
      <Script id="faq-schema" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* 🌟 HERO SECTION (Fixed: Compact padding and balanced typography) */}
      <div className="relative pt-16 pb-12 md:pt-24 md:pb-16 overflow-hidden border-b border-orange-100 bg-orange-50/50">
        <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <ScrollReveal yOffset={20}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-100 text-orange-700 font-bold text-xs md:text-sm mb-4 shadow-sm">
              <FaFeatherAlt /> नई सेवा
            </div>
            
            <h1 lang="hi" className="font-hindi text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 mb-4 leading-tight tracking-tight">
              ब्रज से <span className="text-orange-600">पत्र</span>
            </h1>
            
            <p className="font-hindi text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
              जहाँ शब्दों में ब्रज का भाव हो।<br className="hidden sm:block"/> 
              हाथ से लिखा। मन से रचा। आपके अपनों के लिए।
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 font-hindi text-sm md:text-base font-bold text-gray-700">
              <span className="flex items-center gap-1.5"><FaRegCheckCircle className="text-green-600" /> 100% इंसान द्वारा रचित</span>
              <span className="flex items-center gap-1.5"><FaRegCheckCircle className="text-green-600" /> हाथ से लिखा हुआ</span>
              <span className="flex items-center gap-1.5"><FaRegCheckCircle className="text-green-600" /> पूर्णत: सुरक्षित</span>
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div className="max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        
        {/* 🌟 INTRO SECTION (Fixed: Reduced margins) */}
        <ScrollReveal>
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-hindi text-2xl md:text-3xl font-extrabold text-gray-900 mb-4">कुछ बातें कही नहीं जातीं... लिखी जाती हैं।</h2>
            <p className="font-hindi text-gray-600 text-base md:text-lg font-medium leading-relaxed">
              आज जब अधिकतर संदेश मोबाइल पर टाइप किए जाते हैं, तब किसी के लिए विशेष रूप से हाथ से लिखा गया पत्र एक यादगार अनुभव बन जाता है। हमारी इस सेवा में आपकी भावनाएँ होंगी, हमारे शब्द होंगे, और ब्रज की वह मिठास होगी जो सीधे मन तक पहुँचती है।
            </p>
          </div>
        </ScrollReveal>

        {/* 🌟 MODULAR COMPONENTS */}
        <LetterTypes />
        <PricingPackages />

        {/* 🌟 PROMISE BOX (Fixed: Made compact and elegant) */}
        <ScrollReveal yOffset={30}>
          <div className="bg-white p-6 md:p-8 rounded-3xl border border-orange-100 shadow-sm max-w-4xl mx-auto mb-16">
            <h4 className="font-hindi text-lg md:text-xl font-black text-gray-900 mb-2 flex items-center gap-2">
              <FaLock className="text-green-600"/> हमारी प्रतिज्ञा और आपकी प्राइवेसी
            </h4>
            <p className="font-hindi text-sm md:text-base font-medium text-gray-600 leading-relaxed">
              हर एक पत्र मोहित द्वारा व्यक्तिगत रूप से लिखा जाता है। हम आपकी बताई गई जानकारी या कहानी को अपने सर्वर पर स्टोर नहीं करते, यह केवल आपके WhatsApp मैसेज के माध्यम से हम तक पहुँचती है। आपकी अनुमति के बिना आपका पत्र कभी भी सोशल मीडिया या वेबसाइट पर साझा नहीं किया जाएगा। 
            </p>
          </div>
        </ScrollReveal>

        {/* 🌟 FORM COMPONENT */}
        <ScrollReveal yOffset={30}>
          <div id="order-form" className="max-w-4xl mx-auto mb-16 scroll-mt-24">
            <LetterOrder />
          </div>
        </ScrollReveal>

        <FaqSection />

      </div>
      
      <StickyOrderBar />
    </div>
  );
}