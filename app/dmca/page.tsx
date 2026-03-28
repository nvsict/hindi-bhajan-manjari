import { FaGavel, FaPaperPlane, FaExclamationTriangle, FaShieldAlt, FaBalanceScale } from 'react-icons/fa';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// 🌟 1. SEO METADATA (AdSense Bots Love This)
// ==========================================
export const metadata: Metadata = {
  title: 'DMCA & Copyright Policy | Hindi Bhajan Manjari',
  description: 'Our DMCA and Copyright policy. Learn how we handle intellectual property, public domain texts, and report copyright infringements.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/dmca',
  }
};

export default function DMCAPage() {
  const adminEmail = "nvsict06@gmail.com";

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 selection:bg-orange-100 selection:text-orange-900">
      <div className="max-w-4xl mx-auto">
        
        {/* --- HEADER SECTION --- */}
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            <FaGavel size={30} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4 tracking-tight">DMCA & Copyright Policy</h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg leading-relaxed font-medium">
            Hindi Bhajan Manjari respects the intellectual property of creators, authors, and musicians, and we expect our users to do the same.
          </p>
        </div>

        <div className="bg-white border border-gray-200 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-900/5">
          <div className="p-8 md:p-16">
            
            <div className="prose prose-red max-w-none text-gray-600 leading-relaxed text-lg">
              
              {/* --- 🌟 THE SHIELD: PUBLIC DOMAIN & FAIR USE --- */}
              <section className="mb-12 bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 rounded-[2rem] border border-orange-200 shadow-inner">
                <h3 className="text-2xl font-black text-orange-900 mb-4 flex items-center gap-3">
                  <FaShieldAlt className="text-orange-600 text-2xl" /> 
                  Public Domain & Fair Use
                </h3>
                <p className="text-orange-800 leading-relaxed mb-4">
                  The core mission of <strong>Hindi Bhajan Manjari</strong> is to preserve and share ancient Sanatan Dharma literature. Most lyrics, Aartis, and Chalisa texts found on this platform are traditional compositions that have existed for centuries and are strictly in the <strong>Public Domain</strong>. We do not claim ownership of these ancient texts.
                </p>
                <p className="text-orange-800 leading-relaxed m-0">
                  Our platform provides modern formatting, manual proofreading, and original interpretations (Bhavarth) to help preserve this heritage under the principles of <strong>Fair Use</strong> for educational and spiritual purposes. However, we deeply respect modern copyrights for specific translations, newly written bhajans, or modern musical arrangements.
                </p>
              </section>

              {/* --- REPORTING INFRINGEMENT --- */}
              <section className="mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-3">
                  <FaExclamationTriangle className="text-red-500 text-xl" /> 
                  Reporting Copyright Infringement (DMCA Notice)
                </h2>
                <p className="mb-6">
                  If you are a copyright owner or an agent thereof and believe that any content on our website infringes upon your modern copyrights, you may submit a notification pursuant to the Digital Millennium Copyright Act ("DMCA") by providing our Copyright Agent with the following information in writing:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    "A physical or electronic signature of the authorized person.",
                    "Identification of the copyrighted work claimed to have been infringed.",
                    "Identification of the material that is claimed to be infringing (Exact URL).",
                    "Information reasonably sufficient to contact you (Email and Phone).",
                    "A statement that you have a good faith belief that the use is not authorized by the owner.",
                    "A statement, under penalty of perjury, that the information in the notification is accurate."
                  ].map((item, index) => (
                    <div key={index} className="flex gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-100 text-sm hover:border-red-200 transition-colors">
                      <span className="font-black text-red-600 text-lg">{index + 1}.</span>
                      <span className="font-medium text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* --- COUNTER NOTICE (Adds Legal Weight) --- */}
              <section className="mb-12">
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <FaBalanceScale className="text-gray-500 text-xl" /> 
                  Counter-Notification
                </h2>
                <p className="m-0">
                  If you believe that your content was removed by mistake or misidentification, you may file a counter-notice containing your physical/electronic signature, identification of the material removed, a statement under penalty of perjury regarding the mistake, and your contact details.
                </p>
              </section>

              {/* --- DESIGNATED AGENT CONTACT --- */}
              <section>
                <h2 className="text-2xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <FaPaperPlane className="text-blue-500 text-xl" /> 
                  Designated Agent Contact
                </h2>
                <p>
                  Please send all infringement notices or counter-notices to our designated agent via email. We take these matters seriously and aim to process valid requests within <strong>24-48 hours</strong>.
                </p>
                
                <div className="bg-gray-900 rounded-[2rem] p-8 md:p-10 mt-8 relative overflow-hidden group shadow-2xl">
                  <div className="relative z-10">
                    <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mb-3">Send Official Notice To:</p>
                    <a 
                      href={`mailto:${adminEmail}`} 
                      className="text-2xl md:text-3xl font-mono text-white hover:text-orange-400 transition-colors break-all relative z-20"
                    >
                      {adminEmail}
                    </a>
                    <div className="mt-6 inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-2 rounded-lg">
                      <p className="text-gray-300 text-sm font-mono m-0">
                        Subject: <span className="text-white font-bold">DMCA Notice - [Bhajan Title]</span>
                      </p>
                    </div>
                  </div>
                  {/* Subtle Background Icon */}
                  <FaGavel className="absolute -right-8 -bottom-8 text-white/5 text-[15rem] rotate-12 group-hover:rotate-6 group-hover:scale-110 transition-transform duration-700 pointer-events-none" />
                </div>
              </section>

            </div>
          </div>
        </div>

        {/* --- FOOTER CTA --- */}
        <div className="text-center mt-12 bg-orange-50 p-6 rounded-3xl border border-orange-100">
          <p className="text-orange-800 font-medium m-0">
            Want to contribute authentic spiritual literature? <Link href="/submit" className="text-orange-600 font-black hover:underline ml-2">Submit a Bhajan</Link>
          </p>
        </div>
        
      </div>
    </div>
  );
}