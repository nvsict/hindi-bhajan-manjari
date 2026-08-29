import { 
  FaGavel, 
  FaPaperPlane, 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaBalanceScale,
  FaYoutube,
  FaTimesCircle,
  FaCheckDouble
} from 'react-icons/fa';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// 🌟 1. SEO METADATA (AdSense Bots & Legal Crawlers Love This)
// ==========================================
export const metadata: Metadata = {
  title: 'DMCA & Copyright Policy | Hindi Bhajan Manjari',
  description: 'Official DMCA and Copyright policy for Hindi Bhajan Manjari. Learn how we handle intellectual property, embedded media, and report copyright infringements.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/dmca',
  }
};

export default function DMCAPage() {
  const adminEmail = "support@hindibhajanmanjari.com";
  const lastUpdated = "June 2, 2026";

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 selection:bg-red-100 selection:text-red-900 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-gradient-to-br from-red-900 via-gray-900 to-black rounded-[2.5rem] p-10 md:p-16 mb-8 shadow-2xl relative overflow-hidden text-center text-white">
          <div className="relative z-10">
            <div className="w-20 h-20 bg-white/10 backdrop-blur-md text-red-400 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner border border-white/20">
              <FaGavel size={36} />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight">DMCA & Copyright Policy</h1>
            <p className="text-gray-300 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
              Hindi Bhajan Manjari respects the intellectual property of creators, authors, and musicians. We strictly comply with the Digital Millennium Copyright Act (DMCA).
            </p>
            <div className="mt-8 text-xs font-bold text-gray-900 uppercase tracking-widest bg-white px-6 py-2.5 rounded-full inline-block shadow-sm">
              Last Updated: {lastUpdated}
            </div>
          </div>
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/20 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-orange-500/20 rounded-full blur-3xl pointer-events-none translate-y-1/3 -translate-x-1/4"></div>
        </div>

        {/* --- CONTENT CARDS --- */}
        <div className="grid gap-6">
          
          {/* 1. THE SHIELD: PUBLIC DOMAIN & FAIR USE */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 md:p-10 rounded-[2rem] border border-orange-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-200">
                <FaShieldAlt size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">1. Public Domain & Fair Use</h2>
                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  The core mission of <strong>Hindi Bhajan Manjari</strong> is to preserve and share ancient Sanatan Dharma literature. Most lyrics, Aartis, and Chalisa texts found on this platform are traditional compositions that have existed for centuries and reside strictly in the <strong>Public Domain</strong>. We do not claim ownership of these historical texts.
                </p>
                <p className="text-gray-700 leading-relaxed m-0 text-[16px]">
                  Our platform provides modern formatting, manual proofreading, and original interpretations (Bhavarth) to help preserve this heritage under the principles of <strong>Fair Use</strong> for educational and spiritual purposes. However, we deeply respect modern copyrights for specific translations, newly composed bhajans, or modern musical arrangements.
                </p>
              </div>
            </div>
          </div>

          {/* 2. EMBEDDED MEDIA (YOUTUBE EXEMPTION) */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
                <FaYoutube size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">2. Embedded Media & Visuals</h2>
                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  All audio-visual media, including video players and their respective video thumbnails displayed on our website, are embedded directly from third-party platforms like <strong>YouTube</strong> using their official API. We do not host, upload, or own these media files or thumbnails. Copyright claims regarding embedded videos must be directed to the host platform (e.g., YouTube) where the content physically resides.
                </p>
              </div>
            </div>
          </div>

          {/* 3. REPORTING INFRINGEMENT (DMCA NOTICE) */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-100">
                <FaExclamationTriangle size={22} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-gray-900 mb-3">3. Filing a DMCA Takedown Notice</h2>
                <p className="text-gray-600 leading-relaxed mb-6 text-[16px]">
                  If you are a copyright owner (or an authorized agent) and believe that any text, lyrics, or user-submitted content on our website infringes upon your modern copyrights, please submit a formal notification pursuant to the Digital Millennium Copyright Act (DMCA) containing the following details:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "A physical or electronic signature of the authorized copyright owner.",
                    "Identification of the copyrighted work claimed to have been infringed.",
                    "Identification of the exact material/URL that is claimed to be infringing.",
                    "Information reasonably sufficient to contact you (Email & Phone).",
                    "A statement of good faith belief that the use is not authorized by the owner.",
                    "A statement, under penalty of perjury, that the notification is accurate."
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 text-[14px] hover:border-red-200 hover:bg-red-50/50 transition-colors">
                      <span className="font-black text-red-600 text-lg leading-none">{index + 1}.</span>
                      <span className="font-medium text-gray-700 leading-snug">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 4. COUNTER-NOTIFICATION */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaBalanceScale className="text-2xl text-blue-600" />
                <h2 className="text-xl font-black text-gray-900 m-0">4. Counter-Notice</h2>
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                If you believe your user-submitted content was removed by mistake or misidentification, you may file a counter-notice. Include your physical/electronic signature, the specific content removed, a statement under penalty of perjury regarding the mistake, and your full contact details.
              </p>
            </div>

            {/* 5. REPEAT INFRINGER POLICY */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaTimesCircle className="text-2xl text-red-600" />
                <h2 className="text-xl font-black text-gray-900 m-0">5. Repeat Infringer Policy</h2>
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                In accordance with the DMCA and other applicable laws, Hindi Bhajan Manjari has adopted a policy of terminating, in appropriate circumstances and at our sole discretion, the access or accounts of users who are deemed to be repeat infringers of intellectual property.
              </p>
            </div>
          </div>

          {/* 6. DESIGNATED AGENT CONTACT */}
          <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 mt-4 relative overflow-hidden group shadow-2xl border border-gray-800">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
                  <FaPaperPlane className="text-blue-400" /> 
                  Designated Agent
                </h2>
                <p className="text-gray-400 text-[16px] leading-relaxed max-w-lg mb-6">
                  Please send all DMCA infringement notices or counter-notices to our designated copyright agent via email. We take intellectual property matters seriously and process valid requests within <strong>24-48 hours</strong>.
                </p>
                <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 rounded-xl">
                  <p className="text-gray-300 text-sm font-mono m-0">
                    Subject Line: <span className="text-white font-bold">DMCA Notice - [Title of Work]</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-center w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-700 pt-8 md:pt-0 md:pl-8">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Send Official Notice To:</p>
                <a 
                  href={`mailto:${adminEmail}`} 
                  className="inline-block text-2xl md:text-3xl font-mono text-white hover:text-red-400 transition-colors break-all bg-black/30 px-6 py-4 rounded-2xl border border-white/5"
                >
                  {adminEmail}
                </a>
              </div>
            </div>
            {/* Subtle Background Icon */}
            <FaGavel className="absolute -right-8 -bottom-8 text-white/5 text-[15rem] rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
          </div>

        </div>

        {/* --- FOOTER CTA --- */}
        <div className="text-center mt-12 bg-orange-50 p-6 rounded-3xl border border-orange-100 flex items-center justify-center gap-3">
          <FaCheckDouble className="text-orange-500" />
          <p className="text-orange-800 font-medium m-0">
            Want to contribute authentic spiritual literature? <Link href="/submit" className="text-orange-600 font-black hover:underline ml-2 transition-all">Submit a Bhajan</Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}