import { 
  FaBalanceScale, 
  FaBan, 
  FaCheckDouble, 
  FaUserShield, 
  FaEdit, 
  FaLink, 
  FaGavel, 
  FaFileContract, 
  FaExclamationTriangle,
  FaGlobe
} from 'react-icons/fa';
import { HiScale } from 'react-icons/hi';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// 🌟 1. SEO METADATA (Crucial for AdSense & Google Search)
// ==========================================
export const metadata: Metadata = {
  title: 'Terms of Service | Hindi Bhajan Manjari',
  description: 'Comprehensive Terms of Service for Hindi Bhajan Manjari. Understand our guidelines, acceptable use policy, copyright rules, and user submission agreements.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/terms',
  }
};

export default function TermsPage() {
  const lastUpdated = "June 2, 2026";

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 selection:bg-orange-100 selection:text-orange-900 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-10 md:p-16 mb-8 shadow-2xl relative overflow-hidden text-center text-white">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md text-orange-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
              <HiScale size={40} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">Terms of Service</h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              These terms constitute a legally binding agreement between you and Hindi Bhajan Manjari. Please read them carefully before using our digital platform.
            </p>
            <div className="mt-8 text-xs font-bold text-gray-900 uppercase tracking-widest bg-white px-6 py-2.5 rounded-full inline-block shadow-sm">
              Agreement Effective as of {lastUpdated}
            </div>
          </div>
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
        </div>

        {/* --- CONTENT CARDS --- */}
        <div className="grid gap-6">
          
          {/* 1. Acceptance of Terms */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0 border border-blue-100">
                <FaCheckDouble size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  By accessing, browsing, or using <strong>Hindi Bhajan Manjari (hindibhajanmanjari.com)</strong>, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service, our Privacy Policy, and all applicable laws and regulations. If you do not agree with any part of these terms, you are strictly prohibited from using or accessing this site.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Intellectual Property Rights */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0 border border-purple-100">
                <FaFileContract size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">2. Intellectual Property Rights</h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  The original devotional lyrics and ancient texts provided on this site are part of the public domain or belong to their respective copyright holders (music labels, artists, writers). However, the <strong>curation, formatting, English translations, and specific Bhavarth (meanings/commentary)</strong> created by our editorial team are the exclusive intellectual property of Hindi Bhajan Manjari.
                </p>
              </div>
            </div>
          </div>

          {/* 3. Permitted Use License */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 border border-green-100">
                <FaUserShield size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">3. Permitted Use License</h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  We grant you a personal, non-exclusive, non-transferable, and revocable license to use our platform strictly for personal, non-commercial, devotional, and educational purposes. You are encouraged to:
                </p>
                <ul className="grid md:grid-cols-2 gap-4 text-[15px] text-gray-700 font-medium">
                  <li className="flex items-center gap-3"><span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span> Read & sing along to lyrics</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span> Save bhajans using our bookmark features</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span> Share page links directly on social media</li>
                  <li className="flex items-center gap-3"><span className="w-2 h-2 bg-green-500 rounded-full shrink-0"></span> Study our spiritual meanings (Bhavarth)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Prohibited Conduct (Anti-Scraping) */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-red-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-red-500"></div>
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-200">
                <FaBan size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">4. Prohibited Conduct (Strictly Enforced)</h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  To protect the integrity of our digital library and server resources, you explicitly agree <strong>not</strong> to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-[15px] text-gray-700 marker:text-red-500 font-medium">
                  <li>Use automated bots, crawlers, spiders, or scrapers to extract, harvest, or mirror our lyrics database and articles.</li>
                  <li>Copy, reproduce, or re-publish our unique, manually written explanations (Bhavarth) on competing websites, apps, or print media without explicit written permission.</li>
                  <li>Attempt to bypass any security measures, probe for vulnerabilities, or execute malicious scripts on our backend systems.</li>
                  <li>Use the platform or its content for any commercial monetization without prior consent.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 5. User Submissions */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-100">
                <FaEdit size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">5. User Submissions & Content</h2>
                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  By submitting content (such as bhajan lyrics or corrections) through our forms, you grant Hindi Bhajan Manjari a perpetual, non-exclusive, royalty-free license to use, edit, format, and publish that content. You affirm that any submitted material does not infringe on the modern copyrights of any third party. We reserve absolute right to review, modify, or reject any submission at our sole discretion.
                </p>
              </div>
            </div>
          </div>

          {/* 6. Third-Party Links & Advertising */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center shrink-0 border border-teal-100">
                <FaLink size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">6. Third-Party Links & Advertisements</h2>
                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  Our website may contain links to third-party websites or services (including embedded YouTube videos and advertising networks like Google AdSense). Hindi Bhajan Manjari has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third-party sites. Your interaction with any third-party advertisements or websites is strictly at your own risk.
                </p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 7. Disclaimer of Warranties */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaBalanceScale className="text-2xl text-gray-700" />
                <h2 className="text-xl font-black text-gray-900 m-0">7. Disclaimer of Warranties</h2>
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                The materials on Hindi Bhajan Manjari are provided on an <strong>"as is" and "as available"</strong> basis. While we strive for absolute linguistic and spiritual accuracy through manual curation, we make no warranties, expressed or implied, that the lyrics, meanings, or technical functionality will be entirely free of errors, interruptions, or inaccuracies.
              </p>
            </div>

            {/* 8. Limitation of Liability & Indemnification */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaExclamationTriangle className="text-2xl text-gray-700" />
                <h2 className="text-xl font-black text-gray-900 m-0">8. Limitation of Liability</h2>
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                In no event shall Hindi Bhajan Manjari or its administrators be liable for any consequential, incidental, or direct damages arising out of the use or inability to use the materials on our website. You agree to indemnify and hold harmless Hindi Bhajan Manjari from any claims resulting from your violation of these Terms.
              </p>
            </div>
          </div>

          {/* 9. Governing Law */}
          <div className="bg-gray-900 text-white p-8 md:p-10 rounded-[2rem] shadow-lg">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-gray-800 text-gray-300 rounded-2xl flex items-center justify-center shrink-0 border border-gray-700">
                <FaGlobe size={20} />
              </div>
              <div>
                <h2 className="text-2xl font-black mb-3">9. Governing Law & Jurisdiction</h2>
                <p className="text-gray-300 leading-relaxed m-0 text-[16px]">
                  These Terms shall be governed and construed in accordance with the laws of <strong>India</strong>, without regard to its conflict of law provisions. Any legal disputes arising out of the use of this website shall be subject to the exclusive jurisdiction of the courts located in India. We reserve the right to modify these terms at any time without prior notice.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* --- FOOTER CTA --- */}
        <div className="mt-12 text-center bg-white p-8 rounded-3xl border border-gray-200 shadow-sm">
          <h3 className="text-xl font-black text-gray-900 mb-3">Questions about these Terms?</h3>
          <p className="text-gray-600 font-medium mb-6">
            If you require clarification on any of our terms or acceptable use policies, please reach out to our administration team.
          </p>
          <Link 
            href="/contact" 
            className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl transition-colors shadow-md active:scale-95"
          >
            Contact Support
          </Link>
        </div>
        
      </div>
    </div>
  );
}