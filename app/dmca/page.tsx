import { 
  FaGavel, 
  FaPaperPlane, 
  FaExclamationTriangle, 
  FaShieldAlt, 
  FaBalanceScale,
  FaYoutube,
  FaTimesCircle,
  FaCheckDouble,
  FaBookReader
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
  const lastUpdated = "September 6, 2026"; // Automatically reflecting the current relevant date

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
              We respect the intellectual property of creators, authors, and musicians. This document outlines our approach to copyright concerns and content management.
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
          
          {/* 1. COPYRIGHT AND CONTENT */}
          <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 p-8 md:p-10 rounded-[2rem] border border-orange-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-200">
                <FaShieldAlt size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">1. Copyright and Content on Hindi Bhajan Manjari</h2>
                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  Hindi Bhajan Manjari is a devotional and informational platform created to help readers discover, read, understand, and preserve devotional literature, bhajans, aartis, chalisas, stotrams, and related spiritual content.
                </p>
                <p className="text-gray-700 leading-relaxed mb-4 text-[16px]">
                  We respect the intellectual property rights of authors, composers, publishers, performers, and other rights holders. Content published on this website may include traditional devotional works, material submitted by users, and information relating to modern devotional compositions. We do not claim ownership of works unless ownership is expressly stated. Where reasonably available, we aim to provide relevant attribution and source information.
                </p>
                <p className="text-gray-700 leading-relaxed m-0 text-[16px]">
                  The copyright status of devotional literature can vary. The age, traditional nature, or widespread availability of a work does not by itself mean that every version, translation, adaptation, arrangement, recording, or presentation of that work is free from copyright protection. If you believe that any material on Hindi Bhajan Manjari infringes your intellectual property rights, please contact us using the procedure below. We review valid complaints in good faith and will take appropriate action where necessary.
                </p>
              </div>
            </div>
          </div>

          {/* 2. EMBEDDED MEDIA */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0 border border-red-100">
                <FaYoutube size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">2. Embedded Media and Third-Party Content</h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  Hindi Bhajan Manjari may display or embed content made available through third-party platforms, including publicly available video players and other embedded media. Embedded media is displayed using the functionality made available by the relevant third-party platform. We do not claim ownership of third-party videos, recordings, or other media solely because they are embedded or linked on this website.
                </p>
                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  The copyright owner may have rights concerning content that appears on or is linked from our website. If you believe that an embedded video, thumbnail, text, image, or other material on Hindi Bhajan Manjari infringes your rights, you may notify us with the relevant URL and details of your claim. Where appropriate, we may review the material and remove, disable, or update the relevant embedding. Please note that a complaint relating to content hosted by a third-party platform may also need to be addressed to that platform directly.
                </p>
              </div>
            </div>
          </div>

          {/* 3. REPORTING INFRINGEMENT */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center shrink-0 border border-yellow-100">
                <FaExclamationTriangle size={22} />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-black text-gray-900 mb-3">3. Reporting Copyright Concerns</h2>
                <p className="text-gray-600 leading-relaxed mb-6 text-[16px]">
                  If you are a copyright owner or an authorised representative and believe that material available on Hindi Bhajan Manjari infringes your copyright, please send us a written copyright complaint containing sufficient information for us to investigate the matter. Please include:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {[
                    { title: "Your full name and contact information", desc: "Provide your email address and any other information reasonably necessary to contact you." },
                    { title: "Identification of the copyrighted work", desc: "Clearly identify the original work that you believe is being infringed." },
                    { title: "The exact URL or location", desc: "Provide the complete link to each page containing the material you want us to review." },
                    { title: "Your relationship to the rights holder", desc: "State whether you are the owner or an authorised representative." },
                    { title: "A description of your concern", desc: "Explain why you believe the material infringes your rights." },
                    { title: "A statement of good-faith belief", desc: "Confirm belief that the use is not authorised by the copyright owner, its agent, or law." },
                    { title: "A statement of accuracy", desc: "Confirm that the information is accurate and you are authorised to act." },
                    { title: "Your signature", desc: "Include your physical or electronic signature or legally sufficient authentication." }
                  ].map((item, index) => (
                    <div key={index} className="flex flex-col gap-1 bg-gray-50 p-5 rounded-2xl border border-gray-100 hover:border-yellow-200 transition-colors">
                      <span className="font-black text-gray-900 text-[15px]">{item.title}</span>
                      <span className="font-medium text-gray-600 text-[13px] leading-snug">{item.desc}</span>
                    </div>
                  ))}
                </div>
                <p className="text-gray-500 text-sm italic mt-4">Incomplete complaints may require additional information before we can investigate them.</p>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* 4. COUNTER-NOTICE */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaBalanceScale className="text-2xl text-blue-600" />
                <h2 className="text-xl font-black text-gray-900 m-0">4. Counter-Notice</h2>
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                If material has been removed or access to it has been restricted following a copyright complaint and you believe that the action resulted from a mistake or misidentification, you may contact us with a counter-notice or other relevant information supporting your position. Your response should clearly identify the affected material and explain why you believe the removal was made in error. We may review the information provided and take appropriate action. Submission of a counter-notice does not guarantee that material will be restored.
              </p>
            </div>

            {/* 5. REPEAT CONCERNS */}
            <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <FaTimesCircle className="text-2xl text-red-600" />
                <h2 className="text-xl font-black text-gray-900 m-0">5. Repeat Copyright Concerns</h2>
              </div>
              <p className="text-[15px] text-gray-600 leading-relaxed">
                Hindi Bhajan Manjari takes repeated and credible copyright complaints seriously. Where we receive repeated valid complaints concerning the same contributor, source, or material, we may take appropriate measures, including reviewing, removing, restricting, or declining to publish the relevant content in the future. We may also restrict access to content-submission features where a user repeatedly submits material that creates credible intellectual property concerns. Nothing in this policy requires us to retain content we reasonably believe creates unresolved issues.
              </p>
            </div>
          </div>

          {/* 6. CONTENT SOURCES & EDITORIAL APPROACH */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex flex-col md:flex-row md:items-start gap-5">
              <div className="w-12 h-12 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center shrink-0 border border-green-100">
                <FaBookReader size={22} />
              </div>
              <div>
                <h2 className="text-2xl font-black text-gray-900 mb-3">6. Content Sources and Editorial Approach</h2>
                <p className="text-gray-600 leading-relaxed mb-4 text-[16px]">
                  Hindi Bhajan Manjari publishes devotional and spiritual content from a variety of sources, including traditional works, publicly available references, user contributions, and editorial research. Before publishing or updating content, we may format text for readability, correct obvious typographical errors, organise verses, provide transliteration or alternative language versions, add contextual information, and create original explanatory material where appropriate.
                </p>
                <p className="text-gray-600 leading-relaxed m-0 text-[16px]">
                  We do not claim that every work published on the website is owned by Hindi Bhajan Manjari. Copyright and ownership may belong to the respective authors, composers, publishers, performers, translators, or other rights holders. Where we receive reliable information indicating that content should be corrected, attributed differently, removed, or otherwise updated, we encourage rights holders to contact us. Our goal is to provide a useful and respectful devotional resource while responding appropriately to legitimate intellectual property concerns.
                </p>
              </div>
            </div>
          </div>

          {/* 7. DESIGNATED CONTACT */}
          <div className="bg-gray-900 rounded-[2.5rem] p-8 md:p-12 mt-4 relative overflow-hidden group shadow-2xl border border-gray-800">
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
              <div>
                <h2 className="text-3xl font-black text-white mb-4 flex items-center gap-3">
                  <FaPaperPlane className="text-blue-400" /> 
                  7. Copyright Contact
                </h2>
                <p className="text-gray-400 text-[16px] leading-relaxed max-w-lg mb-6">
                  For copyright concerns relating to material published on Hindi Bhajan Manjari, please contact us. We aim to review copyright-related requests as promptly as reasonably possible.
                </p>
                <div className="inline-block bg-white/10 backdrop-blur-sm border border-white/20 px-5 py-3 rounded-xl">
                  <p className="text-gray-300 text-sm font-mono m-0">
                    Subject Line: <span className="text-white font-bold">Copyright Concern – [Title of Work]</span>
                  </p>
                </div>
              </div>

              <div className="shrink-0 text-center w-full md:w-auto border-t md:border-t-0 md:border-l border-gray-700 pt-8 md:pt-0 md:pl-8">
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-3">Send Notice To:</p>
                <a 
                  href={`mailto:${adminEmail}`} 
                  className="inline-block text-xl md:text-2xl font-mono text-white hover:text-red-400 transition-colors break-all bg-black/30 px-6 py-4 rounded-2xl border border-white/5"
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
        <div className="text-center mt-12 bg-orange-50 p-6 rounded-3xl border border-orange-100 flex flex-col md:flex-row items-center justify-center gap-4">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 text-orange-500 rounded-full shrink-0">
             <FaCheckDouble />
          </div>
          <div className="text-left">
            <h4 className="text-orange-900 font-black text-lg m-0 leading-none">Contribute to Hindi Bhajan Manjari</h4>
            <p className="text-orange-800/80 font-medium text-sm mt-1 mb-0">
               Have an original devotional composition, a correction, a verified source, or information that can help improve an existing page? You can submit content or share relevant details for editorial review.
            </p>
          </div>
          <Link href="/submit" className="md:ml-auto whitespace-nowrap bg-orange-600 hover:bg-orange-700 text-white font-black px-6 py-3 rounded-xl transition-colors shadow-sm active:scale-95">
            Submit a Bhajan
          </Link>
        </div>
        
      </div>
    </div>
  );
}