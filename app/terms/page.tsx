import { FaBalanceScale, FaBan, FaCheckDouble, FaUserShield, FaEdit, FaLink } from 'react-icons/fa';
import { HiScale } from 'react-icons/hi';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// 🌟 1. SEO METADATA (Crucial for AdSense & Google Search)
// ==========================================
export const metadata: Metadata = {
  title: 'Terms of Service | Hindi Bhajan Manjari',
  description: 'Read the Terms of Service for Hindi Bhajan Manjari. Understand our guidelines, content usage policies, and user submission rules.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/terms',
  }
};

export default function TermsPage() {
  const lastUpdated = "March 25, 2026";

  return (
    <div className="min-h-screen bg-gray-50/30 py-16 px-4 selection:bg-orange-100 selection:text-orange-900">
      <div className="max-w-4xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-white border border-orange-100 rounded-[2.5rem] p-10 md:p-16 mb-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <HiScale size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-gray-500 max-w-xl mx-auto text-lg leading-relaxed">
              Please read these terms carefully before using the Hindi Bhajan Manjari platform. These terms govern your use of our website and its content.
            </p>
            <div className="mt-6 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-5 py-2 rounded-full border border-orange-100">
              Agreement Effective as of {lastUpdated}
            </div>
          </div>
        </div>

        {/* --- CONTENT CARDS --- */}
        <div className="grid gap-6">
          
          {/* 1. Acceptance of Terms */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <FaCheckDouble />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed m-0">
                  By accessing, browsing, or using <strong>Hindi Bhajan Manjari</strong>, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any part of these terms, you are prohibited from using or accessing this site.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Permitted Use */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                <FaUserShield />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">2. Permitted Use License</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  This platform is provided solely for personal, non-commercial, devotional, and educational use. Under this license, you may:
                </p>
                <ul className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 font-medium">
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Read & sing along to lyrics
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Save bhajans for offline puja
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Share links to bhajans on social media
                  </li>
                  <li className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span> Study and reference our meanings (Bhavarth)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Restrictions (The "No-Scraping" Rule) */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <FaBan />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">3. Prohibited Conduct</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  To protect the integrity of our digital library, you agree <strong>not</strong> to:
                </p>
                <ul className="list-disc pl-5 space-y-3 text-sm text-gray-600 marker:text-red-400">
                  <li>Use automated bots, crawlers, or scrapers to extract or mirror our lyrics database.</li>
                  <li>Copy or re-publish our unique, manually written explanations (Bhavarth) on competing websites or apps without explicit written permission.</li>
                  <li>Attempt to bypass any security measures, probe for vulnerabilities, or access our backend systems directly.</li>
                  <li>Use the platform or its content for any commercial purpose, advertising, or monetization without prior consent.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 🌟 4. User Submissions (AdSense likes to see rules for user-generated content) */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
                <FaEdit />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">4. User Submissions</h2>
                <p className="text-gray-600 leading-relaxed m-0">
                  By submitting content (such as bhajan lyrics) through our "Submit a Bhajan" feature, you grant Hindi Bhajan Manjari a non-exclusive, royalty-free license to use, edit, format, and publish that content. You affirm that any submitted material does not infringe on the modern copyrights of any third party. We reserve the right to review, edit, or reject any submission to maintain the quality and accuracy of our library.
                </p>
              </div>
            </div>
          </div>

          {/* 🌟 5. Third-Party Links (Standard Legal Requirement) */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center shrink-0">
                <FaLink />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">5. Third-Party Links & Ads</h2>
                <p className="text-gray-600 leading-relaxed m-0">
                  Our website may contain links to third-party websites or services (including embedded YouTube videos and potential future advertisements). Hindi Bhajan Manjari has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party sites or services. We encourage you to read the terms and conditions and privacy policies of any third-party websites you visit.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Disclaimer of Warranties */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <FaBalanceScale />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">6. Disclaimer of Warranties</h2>
                <p className="text-gray-600 leading-relaxed m-0">
                  The materials on Hindi Bhajan Manjari are provided on an "as is" basis. While we strive for absolute linguistic and spiritual accuracy through manual curation, we make no warranties, expressed or implied, that the lyrics, meanings, or technical functionality will be entirely free of errors or interruptions. Your use of the platform is at your own sole risk.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* --- FOOTER CTA --- */}
        <div className="mt-12 text-center bg-gray-100 p-6 rounded-3xl border border-gray-200">
          <p className="text-gray-600 font-medium m-0">
            Questions or concerns about these terms? 
            <Link href="/contact" className="text-orange-600 font-black hover:underline ml-2">
              Contact Support
            </Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}