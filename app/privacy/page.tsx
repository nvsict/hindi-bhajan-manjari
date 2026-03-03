import { FaShieldAlt, FaUserSecret, FaCookieBite, FaExternalLinkAlt } from 'react-icons/fa';

export default function PrivacyPolicy() {
  const lastUpdated = "February 24, 2026";

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4">
      <article className="max-w-4xl mx-auto bg-white shadow-sm border border-orange-100 rounded-[2.5rem] overflow-hidden">
        
        {/* Header Header */}
        <div className="bg-orange-600 p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <FaShieldAlt className="text-5xl mx-auto mb-6 opacity-80" />
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">Privacy Policy</h1>
            <p className="text-orange-100 font-medium">
              Your privacy and trust are sacred to us.
            </p>
            <div className="mt-6 inline-block bg-orange-700/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-orange-400/30">
              Last Updated: {lastUpdated}
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/mandala.png')]"></div>
        </div>

        <div className="p-8 md:p-16">
          <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed">
            
            <p className="text-lg text-gray-700">
              Welcome to <strong>Hindi Bhajan Manjari</strong>. This Privacy Policy describes how your personal information is collected, used, and shared when you visit our website. We are committed to protecting your personal data and your right to privacy.
            </p>

            <hr className="my-12 border-gray-100" />

            {/* Section 1 */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                  <FaUserSecret size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">1. Information We Collect</h2>
              </div>
              <p>
                We do not require any registration or account creation to access our collection of Bhajan lyrics. However, when you visit the site, we automatically collect certain information about your device, including:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Log Data:</strong> IP addresses, browser type, and time-stamps for security monitoring.</li>
                <li><strong>Submission Data:</strong> If you use our "Submit a Bhajan" or "Contact Us" forms, we collect the name and email address you provide.</li>
                <li><strong>Usage Data:</strong> Pages viewed and time spent to improve our content.</li>
              </ul>
            </section>

            {/* Section 2 */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                  <FaCookieBite size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">2. Cookies & Tracking</h2>
              </div>
              <p>
                We use cookies to enhance your experience. These are small data files stored on your device:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Preferences:</strong> To remember your font size and language (Hindi/Hinglish) settings.</li>
                <li><strong>Analytics:</strong> We use Google Analytics to understand traffic patterns. You can opt-out by using browser add-ons.</li>
                <li><strong>Advertising:</strong> We may use third-party vendors (like Google AdSense) who use cookies to serve ads based on your prior visits.</li>
              </ul>
            </section>

            {/* Section 3 */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-10 h-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                  <FaExternalLinkAlt size={18} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">3. Third-Party Services</h2>
              </div>
              <p>
                Our website integrates services from third parties:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>YouTube:</strong> We embed videos to provide audio references for bhajans. YouTube has its own privacy policy.</li>
                <li><strong>Supabase:</strong> Our database provider which handles form submissions securely.</li>
              </ul>
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mt-4 text-sm text-blue-800">
                Note: We do not sell, rent, or trade your personal information to third parties.
              </div>
            </section>

            {/* Section 4 */}
            <section className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-4">4. Your Rights (CCPA/GDPR)</h2>
              <p>
                Depending on your location, you may have the right to access, correct, or delete the personal information we hold. Since we do not use accounts, this usually only applies to data sent via contact forms. To exercise these rights, please contact us at <strong>nvsict06@gmail.com</strong>.
              </p>
            </section>

            {/* Section 5 */}
            <section className="mb-12">
              <h2 className="text-2xl font-black text-gray-900 mb-4">5. Children's Privacy</h2>
              <p>
                Our content is spiritual and educational in nature and is safe for all ages. We do not knowingly collect personal identifiable information from children under 13.
              </p>
            </section>

            <section className="mt-16 pt-8 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-400">
                If you have questions about this policy, please visit our 
                <a href="/contact" className="text-orange-600 font-bold ml-1">Contact Page</a>.
              </p>
            </section>

          </div>
        </div>
      </article>
    </div>
  );
}