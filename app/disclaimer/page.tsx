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
  title: 'Disclaimer & Fair Use Policy | Hindi Bhajan Manjari',
  description: 'Read the official disclaimer, fair use policy, and copyright information for Hindi Bhajan Manjari. We provide devotional content for educational purposes.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/disclaimer',
  },
};

export default function DisclaimerPage() {
  const lastUpdated = "June 2, 2026";

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
            Welcome to <strong className="text-gray-900">Hindi Bhajan Manjari</strong> (hindibhajanmanjari.com). By using this website, you agree to the following terms and conditions of our disclaimer.
          </p>

          <div className="space-y-12">
            
            {/* SECTION 1: Vision */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                  <FaBookOpen size={18} />
                </span>
                1. Our Vision & Purpose (हमारा उद्देश्य)
              </h2>
              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  The primary goal of Hindi Bhajan Manjari is to provide an easy-to-use digital platform featuring highly accurate devotional lyrics (Bhajans, Aartis, Stotrams) along with their deep spiritual meanings (Bhavarth).
                </p>
                <p>
                  Our aim is to provide genuine value to devotees, researchers, and spiritual seekers by exploring the true essence of these texts, rather than simply copying and pasting content from the internet. This platform is strictly for educational, cultural, and spiritual enrichment.
                </p>
              </div>
            </section>

            {/* SECTION 2: Copyright & Embedded Media */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                  <FaCopyright size={18} />
                </span>
                2. Copyright, Ownership & Embedded Media
              </h2>
              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  Hindi Bhajan Manjari does not claim ownership of the original musical compositions, audio recordings, or the original lyrics of the bhajans featured on this site. All rights to the original content belong to their respective creators, lyricists, singers, and official music labels.
                </p>
                
                {/* Embedded Media Callout - Crucial for AdSense */}
                <div className="bg-orange-50/50 border border-orange-100 rounded-2xl p-6 mt-6">
                  <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <FaYoutube className="text-red-600 text-xl" /> Explicit Note on Images & Videos:
                  </h3>
                  <p className="text-[15px] mb-3">
                    We want to clearly state that the visual media displayed on our website (including video players and article header images) are primarily <strong>YouTube embeds and YouTube thumbnail embeds</strong>.
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-[15px] text-gray-700">
                    <li>We are <strong>not</strong> the owners of these video thumbnails or images.</li>
                    <li>We do <strong>not</strong> claim any copyright over them.</li>
                    <li>They are used purely as standard embedded links (via YouTube's official API/Embed features) to provide audio-visual reference and credit to the original creators.</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* SECTION 3: Fair Use */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                  <FaBalanceScale size={18} />
                </span>
                3. Fair Use Policy (उचित उपयोग)
              </h2>
              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  The publication of lyrics, their translations, and original commentary on this website is done under the "Fair Use" doctrine for educational and informational purposes. We deeply respect the intellectual property of artists. If you are a copyright owner or a music label and believe that any specific content on our site violates your rights, please reach out to us, and we will promptly take it down.
                </p>
              </div>
            </section>

            {/* SECTION 4: Accuracy */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                  <FaCheckCircle size={18} />
                </span>
                4. Accuracy of Information (जानकारी की सटीकता)
              </h2>
              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  While our editorial team takes great care to cross-check religious texts and ensure that the lyrics and their meanings are accurate, Hindi Bhajan Manjari makes no absolute guarantees regarding the completeness or reliability of the information. We are not legally liable for any typographical errors, omissions, or any direct/indirect outcomes related to the use of this spiritual information.
                </p>
              </div>
            </section>

            {/* SECTION 5: External Links */}
            <section>
              <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 mb-4">
                <span className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <FaExternalLinkAlt size={18} />
                </span>
                5. External Links (बाहरी लिंक)
              </h2>
              <div className="pl-13 text-gray-600 leading-relaxed font-medium text-[17px] space-y-4 ml-1 md:ml-13">
                <p>
                  Our website may contain links to external sites (like YouTube, social media, or affiliate partners). We have no control over the nature, content, and privacy policies of those external websites once you leave our platform.
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
              For any copyright concerns, DMCA takedown requests, or general inquiries, please contact our team directly.
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
          </div>

        </div>
      </div>
    </div>
  );
}