import {
  FaBalanceScale,
  FaBan,
  FaCheckDouble,
  FaUserShield,
  FaEdit,
  FaLink,
  FaFileContract,
  FaExclamationTriangle,
  FaGlobe,
  FaShieldAlt,
} from 'react-icons/fa';
import { HiScale } from 'react-icons/hi';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: 'Terms of Service | Hindi Bhajan Manjari',
  description:
    'Read the Terms of Service for Hindi Bhajan Manjari, including information about website use, devotional content, editorial material, copyright, user submissions, third-party services, and advertising.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/terms',
  },
};

export default function TermsPage() {
  const lastUpdated = 'September 13, 2026';

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 selection:bg-orange-100 selection:text-orange-900 font-sans">
      <div className="max-w-5xl mx-auto">

        {/* ==========================================
            HEADER
        ========================================== */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-10 md:p-16 mb-8 shadow-2xl relative overflow-hidden text-center text-white">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md text-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
              <HiScale size={40} />
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">
              Terms of Service
            </h1>

            <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              These terms explain how Hindi Bhajan Manjari may be used and
              provide important information about our content, editorial
              material, copyright, user contributions, and third-party services.
            </p>

            <div className="mt-8 text-xs font-bold text-gray-900 uppercase tracking-widest bg-white px-6 py-2.5 rounded-full inline-block shadow-sm">
              Last updated: {lastUpdated}
            </div>
          </div>

          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
        </div>

        {/* ==========================================
            CONTENT
        ========================================== */}
        <div className="grid gap-6">

          {/* 1. Acceptance of Terms */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                <FaCheckDouble size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  1. Acceptance of Terms
                </h2>

                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  By accessing or using{' '}
                  <strong>Hindi Bhajan Manjari (hindibhajanmanjari.com)</strong>,
                  you agree to these Terms of Service and to use the website in
                  accordance with applicable laws. These terms apply to visitors,
                  readers, contributors, and other users of the website.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 mb-0 text-[16px]">
                  If you do not agree with these terms, please discontinue use of
                  the website. Our{' '}
                  <Link
                    href="/privacy"
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>{' '}
                  explains how information may be collected and used when you
                  interact with our website.
                </p>
              </div>
            </div>
          </div>

          {/* 2. About Our Content */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                <FaFileContract size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  2. About Our Content
                </h2>

                <p className="text-gray-600 leading-relaxed text-[16px]">
                  Hindi Bhajan Manjari is a devotional and educational website
                  that brings together bhajans, aartis, chalisa, stotras,
                  traditional devotional literature, spiritual articles, and
                  explanatory material.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 text-[16px]">
                  Our editorial work may include selecting and organizing
                  devotional material, formatting lyrics, preparing
                  transliterations or translations, researching background
                  information, and writing explanations such as{' '}
                  <strong>Bhavarth (meaning)</strong>. We aim to make devotional
                  material easier to read, understand, and use for personal
                  study and worship.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 mb-0 text-[16px]">
                  Traditional, public-domain, and third-party material may appear
                  on the website. Where a work is associated with a known author,
                  singer, composer, publisher, or rights holder, we may identify
                  that information where available.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Intellectual Property */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100">
                <FaFileContract size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  3. Intellectual Property & Copyright
                </h2>

                <p className="text-gray-600 leading-relaxed text-[16px]">
                  Copyright in individual devotional works belongs to the
                  applicable author, composer, publisher, label, performer, or
                  other rights holder where copyright protection applies.
                  Traditional and public-domain works may be freely available
                  under applicable law.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 text-[16px]">
                  The website's original editorial contributions, including
                  original explanations, Bhavarth, translations, formatting,
                  organization, research, and other original written material,
                  are protected by applicable intellectual-property laws.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 mb-0 text-[16px]">
                  Nothing in these Terms transfers ownership of a third party's
                  copyrighted work to Hindi Bhajan Manjari or to a website user.
                </p>
              </div>
            </div>
          </div>

          {/* 4. Permitted Use */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 border border-green-100">
                <FaUserShield size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  4. Permitted Use
                </h2>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  You may use the website for personal, devotional, educational,
                  and informational purposes, provided that your use respects
                  these terms and applicable law.
                </p>

                <ul className="grid md:grid-cols-2 gap-4 text-[15px] text-gray-700 font-medium">
                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-2"></span>
                    <span>Read and sing along with devotional lyrics.</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-2"></span>
                    <span>Use available bookmark and personal-library features.</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-2"></span>
                    <span>Share links to pages with family and friends.</span>
                  </li>

                  <li className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full shrink-0 mt-2"></span>
                    <span>Read our spiritual explanations and Bhavarth.</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. Responsible Use */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-red-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>

            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-200">
                <FaBan size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  5. Responsible Use of the Website
                </h2>

                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  To keep the website useful, secure, and available to readers,
                  users should not:
                </p>

                <ul className="list-disc pl-5 space-y-2 text-[15px] text-gray-700 marker:text-red-500">
                  <li>
                    Use automated systems to excessively crawl, scrape, mirror,
                    or reproduce the website's database or original editorial
                    material.
                  </li>

                  <li>
                    Re-publish substantial portions of our original Bhavarth,
                    explanations, articles, or other original editorial content
                    without permission.
                  </li>

                  <li>
                    Attempt to interfere with website security, infrastructure,
                    or normal operation.
                  </li>

                  <li>
                    Use the website in a manner that violates applicable laws or
                    the rights of other people.
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 6. User Submissions */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                <FaEdit size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  6. User Submissions & Suggestions
                </h2>

                <p className="text-gray-600 leading-relaxed text-[16px]">
                  Readers may submit bhajan information, corrections,
                  suggestions, or other material through forms provided on the
                  website.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 text-[16px]">
  By submitting material, you confirm that you have the right or permission
  to submit it or are otherwise permitted to do so. You grant Hindi Bhajan
  Manjari permission to review, edit, format, reproduce, publish, and
  display the submitted material as reasonably necessary for editorial
  review and operation of the website. This permission does not by itself
  transfer ownership of copyright in the underlying work to Hindi Bhajan
  Manjari.
</p>

                <p className="text-gray-600 leading-relaxed mt-4 mb-0 text-[16px]">
                  We may review submissions for accuracy, relevance, copyright,
                  safety, and quality before publishing them. A submission may be
                  edited, declined, or removed when appropriate.
                </p>
              </div>
            </div>
          </div>

          {/* 7. Third Party Links & Advertising */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 border border-teal-100">
                <FaLink size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  7. Third-Party Services, Links & Advertising
                </h2>

                <p className="text-gray-600 leading-relaxed text-[16px]">
                  The website may contain links, embedded media, or services
                  provided by third parties. These may include video platforms,
                  payment providers, analytics services, advertising partners,
                  or other external services.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 text-[16px]">
                  Third-party services operate under their own terms and privacy
                  policies. Hindi Bhajan Manjari does not control the content or
                  privacy practices of external websites.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 mb-0 text-[16px]">
                  Where advertising is displayed, advertisements may be provided
                  by third-party advertising partners. The availability,
                  relevance, and content of advertisements may change over time.
                  Our advertising practices and relevant data disclosures are
                  described in our{' '}
                  <Link
                    href="/privacy"
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* 8. Privacy & Data */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100">
                <FaShieldAlt size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  8. Privacy & Cookies
                </h2>

                <p className="text-gray-600 leading-relaxed text-[16px]">
                  Your privacy is important to us. Depending on how you use the
                  website, certain technical information or information you
                  voluntarily provide may be processed to operate, secure,
                  improve, and maintain our services.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 text-[16px]">
                  Third-party services used on the website may use technologies
                  such as cookies, similar identifiers, or other technologies
                  according to their own policies and applicable requirements.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 mb-0 text-[16px]">
                  For details about information collection, cookies, analytics,
                  advertising, and your choices, please read our{' '}
                  <Link
                    href="/privacy"
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Privacy Policy
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>

          {/* 9. Copyright Concerns */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center shrink-0 border border-rose-100">
                <FaFileContract size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  9. Copyright Concerns
                </h2>

                <p className="text-gray-600 leading-relaxed text-[16px]">
                  If you believe that material published on Hindi Bhajan Manjari
                  infringes your copyright or the rights of someone you represent,
                  please contact us with sufficient information to identify the
                  material and explain the basis of the claim.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 text-[16px]">
                  We take legitimate copyright concerns seriously and may review,
                  correct, update, restrict access to, or remove material where
                  appropriate after receiving a valid complaint.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 mb-0 text-[16px]">
                  Please use our{' '}
                  <Link
                    href="/dmca"
                    className="text-orange-600 font-semibold hover:underline"
                  >
                    Copyright / DMCA page
                  </Link>{' '}
                  for more information about submitting a copyright concern.
                </p>
              </div>
            </div>
          </div>

          {/* 10. Accuracy & Availability */}
          <div className="grid md:grid-cols-2 gap-6">

            {/* Accuracy */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaBalanceScale className="text-2xl text-gray-700" />

                <h2 className="text-xl font-black text-gray-900 m-0">
                  10. Accuracy of Information
                </h2>
              </div>

              <p className="text-[15px] text-gray-600 leading-relaxed">
                We make reasonable efforts to review and maintain the accuracy of
                our lyrics, translations, meanings, references, and other
                information. However, devotional literature may have regional,
                traditional, linguistic, or textual variations. We therefore
                cannot guarantee that every page will always be completely free
                from typographical, interpretive, or other errors.
              </p>

              <p className="text-[15px] text-gray-600 leading-relaxed mt-4">
                Readers are encouraged to consider the relevant traditional or
                authoritative source where exact textual or historical accuracy
                is important.
              </p>
            </div>

            {/* Availability */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle className="text-2xl text-gray-700" />

                <h2 className="text-xl font-black text-gray-900 m-0">
                  11. Website Availability
                </h2>
              </div>

              <p className="text-[15px] text-gray-600 leading-relaxed">
                We work to keep Hindi Bhajan Manjari available and functioning
                properly, but temporary interruptions may occur because of
                maintenance, technical issues, hosting problems, updates, or
                circumstances outside our control.
              </p>

              <p className="text-[15px] text-gray-600 leading-relaxed mt-4">
                Website features, content, links, and services may also be
                updated or changed as the platform develops.
              </p>
            </div>
          </div>

          {/* 12. Limitation of Liability */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-gray-100 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                <FaExclamationTriangle size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">
                  12. Limitation of Liability
                </h2>

                <p className="text-gray-600 leading-relaxed text-[16px]">
                  Hindi Bhajan Manjari is provided on an{' '}
                  <strong>"as is" and "as available"</strong> basis to the extent
                  permitted by applicable law. We are not responsible for losses
                  arising from temporary unavailability, reliance on information
                  published on the website, third-party services, or events beyond
                  our reasonable control.
                </p>

                <p className="text-gray-600 leading-relaxed mt-4 mb-0 text-[16px]">
                  Nothing in these Terms is intended to exclude or limit any
                  liability that cannot legally be excluded or limited under
                  applicable law.
                </p>
              </div>
            </div>
          </div>

          {/* 13. Changes to Terms */}
          <div className="bg-gray-900 text-white p-8 md:p-10 rounded-[2rem] shadow-lg">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-gray-800 text-gray-300 rounded-2xl flex items-center justify-center shrink-0 border border-gray-700">
                <FaGlobe size={20} />
              </div>

              <div>
                <h2 className="text-2xl font-black mb-3">
                  13. Governing Law & Updates
                </h2>

                <p className="text-gray-300 leading-relaxed text-[16px]">
                  These Terms are governed by the applicable laws of India.
                  Subject to applicable law, disputes relating to the use of the
                  website will be handled by the appropriate courts and
                  authorities in India.
                </p>

                <p className="text-gray-300 leading-relaxed mt-4 mb-0 text-[16px]">
                  We may update these Terms from time to time as the website,
                  services, or applicable requirements change. When we make a
                  significant update, we may revise the "Last updated" date shown
                  at the top of this page.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ==========================================
            FOOTER CTA
        ========================================== */}
        <div className="mt-12 text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-3">
            Questions about these Terms?
          </h3>

          <p className="text-gray-600 font-medium mb-6 max-w-2xl mx-auto">
            If you have a question about website use, our content, copyright,
            submissions, or these Terms, please contact the Hindi Bhajan Manjari
            team.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl transition-colors shadow-md active:scale-95"
            >
              Contact Us
            </Link>

            <Link
              href="/privacy"
              className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-xl transition-colors"
            >
              Read Privacy Policy
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}