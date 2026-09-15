import { Metadata } from 'next';
import Link from 'next/link';
import { 
  FaShieldAlt, 
  FaBookOpen, 
  FaCopyright, 
  FaBalanceScale, 
  FaCheckCircle, 
  FaExternalLinkAlt, 
  FaEnvelope,
  FaYoutube
} from 'react-icons/fa';

// ==========================================
// 🌟 SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'Disclaimer | Hindi Bhajan Manjari',
  description: 'Read the Disclaimer for Hindi Bhajan Manjari, including information about devotional content, copyright, user submissions, embedded media, external links, advertising, and website accuracy.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  const lastUpdated = "September 15, 2026";

  return (
    <div className="min-h-screen bg-[#faf9f8] pb-24 font-sans selection:bg-orange-200 selection:text-orange-900">
      
      {/* ==========================================
          🌟 PAGE HEADER
          ========================================== */}
      <div className="bg-white border-b border-gray-100/50 pt-16 pb-16 relative overflow-hidden shadow-[0_4px_30px_rgb(0,0,0,0.02)]">
        {/* Decorative Backgrounds */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-orange-100/40 via-red-50/20 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-amber-50/50 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
        
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-orange-100">
            <FaShieldAlt size={28} />
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-gray-900 tracking-tighter mb-4">
            Disclaimer <span className="text-orange-600">(अस्वीकरण)</span>
          </h1>

          <p className="text-gray-500 font-bold tracking-widest uppercase text-sm">
            Last Updated: {lastUpdated}
          </p>
        </div>
      </div>

      {/* ==========================================
          🌟 MAIN CONTENT AREA
          ========================================== */}
      <div className="max-w-4xl mx-auto px-6 -mt-8 relative z-20">
        <div className="bg-white rounded-[2.5rem] p-8 md:p-14 shadow-2xl shadow-orange-900/5 border border-orange-100/50">
          
          <p className="text-lg md:text-xl text-gray-600 leading-relaxed font-medium mb-12 border-b border-gray-100 pb-10">
            Welcome to <strong className="text-gray-900">Hindi Bhajan Manjari</strong> (hindibhajanmanjari.com). This Disclaimer explains the nature of the information and content provided on the website, including devotional lyrics, meanings, editorial material, user submissions, embedded media, external links, and other website features. By using this website, you acknowledge and understand the information described below.
          </p>

          <div className="space-y-12">
            
            {/* SECTION 1: Vision */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <FaBookOpen size={18} />
                </span>
                1. Our Purpose & Editorial Approach (हमारा उद्देश्य)
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  Hindi Bhajan Manjari is a digital platform created to make devotional and cultural content easier to read, understand, and explore. The website may feature Bhajans, Aartis, Stotrams, Chalisas, devotional articles, word meanings, Bhavarth, translations, contextual notes, and related educational or cultural material.
                </p>

                <p>
                  Our editorial work may include formatting, language corrections, word explanations, translations, Bhavarth, contextual information, categorisation, and other presentation or explanatory material prepared for readers. These editorial contributions should not be understood as a claim that Hindi Bhajan Manjari owns the underlying devotional composition or every version of a work presented on the website.
                </p>

                <p>
                  The website is intended for devotional, educational, cultural, and informational purposes. Readers should use their own judgement when relying on information presented on the website, particularly where interpretations, historical details, traditions, or differing versions of devotional works may exist.
                </p>
              </div>
            </section>

            {/* SECTION 2: Copyright & Ownership */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <FaCopyright size={18} />
                </span>
                2. Copyright, Ownership & Content Rights
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  Copyright and other rights in an individual devotional work may belong to its author, composer, publisher, label, performer, translator, or another applicable rights holder, where such rights exist. Hindi Bhajan Manjari does not claim ownership of third-party works merely because they are displayed, discussed, formatted, translated, or explained on this website.
                </p>

                <p>
                  Some traditional or very old devotional works may be in the public domain under applicable law. However, the copyright status of a particular translation, adaptation, arrangement, recording, image, modern version, or written presentation may be different. The fact that a devotional work is traditional, widely circulated, or available elsewhere online does not by itself establish that every version is free from copyright protection.
                </p>

                <p>
                  Original editorial material created by Hindi Bhajan Manjari, such as original explanations, Bhavarth, word meanings, translations where independently created, contextual notes, formatting, and other editorial presentation, may be protected by applicable intellectual property laws.
                </p>

                <p>
                  If you believe that material on this website infringes your copyright or another protected right, please contact us with sufficient information to identify the material and explain the basis of your concern.
                </p>

                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 mt-6">
                  <h3 className="font-bold text-gray-900 mb-2">
                    Copyright concerns
                  </h3>

                  <p className="text-[15px] text-gray-700 leading-relaxed">
                    Please refer to our{" "}
                    <Link
                      href="/dmca"
                      className="text-orange-600 font-bold hover:underline"
                    >
                      Copyright & DMCA Policy
                    </Link>{" "}
                    for information about reporting copyright concerns and the information that may be useful when submitting a request.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 3: Fair Use / Legal Rights */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <FaBalanceScale size={18} />
                </span>
                3. Copyright Exceptions & Fair Use (उचित उपयोग)
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  References to fair use, fair dealing, public-domain material, or other copyright exceptions on this website are provided for general informational purposes and should not be understood as a blanket determination that every item or use on Hindi Bhajan Manjari qualifies for a particular legal exception.
                </p>

                <p>
                  Copyright exceptions differ between jurisdictions and depend on the specific facts and circumstances of a particular use. Where applicable, Hindi Bhajan Manjari seeks to respect the rights of authors, composers, publishers, artists, labels, translators, and other rights holders.
                </p>

                <p>
                  If you are a copyright owner or authorised representative and have a concern about specific content, please contact us so that the relevant material and circumstances can be reviewed.
                </p>
              </div>
            </section>

            {/* SECTION 4: Embedded Media */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <FaYoutube size={18} />
                </span>
                4. Embedded Media & Third-Party Content
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  Some pages on Hindi Bhajan Manjari may include embedded videos or other media hosted by third-party platforms such as YouTube. Embedded content is provided through the relevant platform's available embedding functionality and may allow visitors to interact with the third-party service without leaving the page.
                </p>

                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 mt-6">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaYoutube className="text-red-600 text-xl" />
                    Note on Embedded Videos & Thumbnails
                  </h3>

                  <p className="text-[15px] mb-3">
                    Hindi Bhajan Manjari does not claim ownership of third-party videos, recordings, thumbnails, or other media simply because they are embedded or referenced on the website.
                  </p>

                  <ul className="list-disc pl-5 space-y-2 text-[15px] text-gray-700">
                    <li>
                      Third-party media remains subject to the rights and policies applicable to its respective owner or platform.
                    </li>
                    <li>
                      Hindi Bhajan Manjari does not represent that it owns the copyright in third-party recordings, videos, or thumbnails.
                    </li>
                    <li>
                      Embedded media is intended to provide relevant audio-visual reference and access to the original third-party platform.
                    </li>
                    <li>
                      Availability of an embedded video may change if the original uploader removes, restricts, or modifies it.
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SECTION 5: User Submitted Content */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FaCheckCircle size={18} />
                </span>
                5. User-Submitted Content (उपयोगकर्ता द्वारा भेजी गई सामग्री)
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  Hindi Bhajan Manjari may allow visitors to submit devotional lyrics, suggestions, corrections, contributor information, or other material for editorial consideration.
                </p>

                <p>
                  Submission of material does not automatically transfer ownership of copyright or other intellectual property rights to Hindi Bhajan Manjari. By submitting material, you should have the necessary right or permission to submit it and should not knowingly provide material that infringes another person's rights.
                </p>

                <p>
                  Submitted material may be reviewed, edited, formatted, translated, categorised, or otherwise processed as reasonably necessary for editorial review and website publication. Publication is not guaranteed, and Hindi Bhajan Manjari may decline, modify, or remove submitted material where appropriate.
                </p>

                <p>
                  For more information about submitting devotional content, please review our{" "}
                  <Link
                    href="/submit"
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Submit a Bhajan
                  </Link>{" "}
                  page and our{" "}
                  <Link
                    href="/terms"
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Terms of Service
                  </Link>.
                </p>
              </div>
            </section>

            {/* SECTION 6: Accuracy */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FaCheckCircle size={18} />
                </span>
                6. Accuracy of Information (जानकारी की सटीकता)
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  We make reasonable efforts to review and present devotional content clearly, including spelling, formatting, language, meanings, and contextual information where appropriate. However, different sources, traditions, publications, and regional practices may contain variations in lyrics, spellings, interpretations, names, or historical details.
                </p>

                <p>
                  Therefore, Hindi Bhajan Manjari does not guarantee that every piece of information is complete, current, error-free, or universally accepted. If you identify a possible error or inconsistency, we welcome corrections and supporting information through our{" "}
                  <Link
                    href="/contact"
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Contact page
                  </Link>.
                </p>

                <p>
                  Content on this website is provided for general devotional, educational, cultural, and informational purposes. It should not be treated as professional legal, medical, financial, or other specialised advice.
                </p>
              </div>
            </section>

            {/* SECTION 7: External Links */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FaExternalLinkAlt size={18} />
                </span>
                7. External Links, Advertising & Third-Party Services
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  Our website may contain links, embeds, or references to external websites and services, including video platforms, social media platforms, payment services, affiliate partners, and other third-party websites.
                </p>

                <p>
                  Once you visit a third-party website or interact with a third-party service, that service's own terms, privacy policy, cookies, and data practices may apply. Hindi Bhajan Manjari does not control the content, availability, security, or privacy practices of external websites.
                </p>

                <p>
                  Hindi Bhajan Manjari may use advertising or affiliate services on some pages. Where applicable, third-party providers may use cookies or similar technologies in accordance with their own policies and applicable requirements. Any affiliate relationship does not change our editorial intent or the nature of the devotional information provided on the website.
                </p>
              </div>
            </section>

            {/* SECTION 8: Privacy */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <FaShieldAlt size={18} />
                </span>
                8. Privacy & Cookies (गोपनीयता)
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  Your use of this website may involve the collection or processing of information such as information you voluntarily provide through contact forms, content submissions, newsletter forms, donation or payment interactions, and certain technical or usage information.
                </p>

                <p>
                  Our{" "}
                  <Link
                    href="/privacy"
                    className="text-orange-600 font-bold hover:underline"
                  >
                    Privacy Policy
                  </Link>{" "}
                  explains how information may be collected, used, stored, shared with relevant service providers, and managed when you use Hindi Bhajan Manjari.
                </p>

                <p>
                  By continuing to use the website, you acknowledge that cookies and similar technologies may be used where applicable for website functionality, preferences, analytics, advertising, or other purposes described in our Privacy Policy and any consent mechanism presented to you.
                </p>
              </div>
            </section>

            {/* SECTION 9: No Guarantee / Liability */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center shrink-0">
                  <FaBalanceScale size={18} />
                </span>
                9. No Guarantee & Limitation of Responsibility
              </h2>

              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  The website and its content are provided on an "as available" basis. While we make reasonable efforts to maintain the website and review its content, we do not guarantee uninterrupted availability, complete accuracy, or that every page or external resource will remain available at all times.
                </p>

                <p>
                  To the extent permitted by applicable law, Hindi Bhajan Manjari is not responsible for losses or damages arising solely from reliance on general information provided on the website, errors or omissions in content, temporary website unavailability, or the actions and content of third-party websites and services.
                </p>

                <p>
                  Nothing in this Disclaimer is intended to exclude or limit any responsibility that cannot lawfully be excluded or limited under applicable law.
                </p>
              </div>
            </section>

          </div>

          {/* ==========================================
              🌟 CONTACT CALL TO ACTION
              ========================================== */}
          <div className="mt-16 pt-10 border-t border-gray-100 bg-gray-50/50 -mx-8 md:-mx-14 px-8 md:px-14 pb-8 md:pb-14 rounded-b-[2.5rem]">
            <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
              <span className="w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center shrink-0">
                <FaEnvelope size={18} />
              </span>
              Contact Us (संपर्क करें)
            </h2>

            <p className="text-gray-600 font-medium text-[17px] mb-6">
              For copyright concerns, content corrections, questions about this Disclaimer, or other website-related enquiries, please contact us directly. For copyright-related requests, please provide enough information for us to identify and review the relevant material.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:support@hindibhajanmanjari.com" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl transition-colors shadow-md active:scale-95"
              >
                Email Support
              </a>

              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-800 font-black rounded-xl transition-colors shadow-sm active:scale-95"
              >
                Go to Contact Form
              </Link>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500 leading-relaxed">
                For additional information, please review our{" "}
                <Link
                  href="/privacy"
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Privacy Policy
                </Link>
                ,{" "}
                <Link
                  href="/terms"
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Terms of Service
                </Link>
                , and{" "}
                <Link
                  href="/dmca"
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Copyright & DMCA Policy
                </Link>.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}