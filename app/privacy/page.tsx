import { FaShieldAlt, FaUserSecret, FaCookieBite, FaExternalLinkAlt, FaAd } from 'react-icons/fa';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// 🌟 1. SEO METADATA (Crucial for AdSense & Google Search)
// ==========================================
export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Usage | Hindi Bhajan Manjari',
  description: 'Learn how Hindi Bhajan Manjari protects your privacy, handles data, and complies with Google AdSense and international cookie tracking policies.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/privacy-policy',
  }
};

export default function PrivacyPolicy() {
  const lastUpdated = "March 25, 2026";

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 selection:bg-orange-100 selection:text-orange-900">
      <article className="max-w-4xl mx-auto bg-white shadow-xl shadow-gray-900/5 border border-orange-100 rounded-[2.5rem] overflow-hidden">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <FaShieldAlt className="text-5xl mx-auto mb-6 opacity-90 drop-shadow-md" />
            <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight drop-shadow-sm">Privacy Policy</h1>
            <p className="text-orange-50 font-medium text-lg max-w-xl mx-auto leading-relaxed">
              Your privacy and trust are sacred to us. We believe in complete transparency about how we handle your digital footprint.
            </p>
            <div className="mt-8 inline-block bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 shadow-sm">
              Last Updated: {lastUpdated}
            </div>
          </div>
          {/* Decorative Pattern */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/mandala.png')]"></div>
        </div>

        <div className="p-8 md:p-16">
          <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed text-lg">
            
            <p className="text-gray-700 font-medium">
              Welcome to <strong>Hindi Bhajan Manjari</strong>. This Privacy Policy describes how your personal information is collected, used, and shared when you visit our digital temple. We are deeply committed to protecting your personal data and your right to privacy.
            </p>

            <hr className="my-12 border-gray-100" />

            {/* --- SECTION 1: INFORMATION COLLECTION --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                  <FaUserSecret size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">1. Information We Collect</h2>
              </div>
              <p className="mb-4">
                We do not require any registration or account creation to access our collection of Bhajan lyrics. However, to keep the platform secure and optimized, we automatically collect certain information about your device:
              </p>
              <ul className="list-disc pl-6 space-y-3 marker:text-orange-400">
                <li><strong>Log Data:</strong> IP addresses, browser type, and time-stamps for security monitoring.</li>
                <li><strong>Submission Data:</strong> If you use our "Submit a Bhajan" or "Contact Us" forms, we collect the name and email address you voluntarily provide.</li>
                <li><strong>Usage Data:</strong> Pages viewed and time spent to help us understand which bhajans are most loved by our devotees.</li>
              </ul>
            </section>

            {/* --- SECTION 2: COOKIES & ADSENSE (🌟 THE MONEY MAKER SECTION) --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                  <FaCookieBite size={24} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">2. Cookies & Tracking</h2>
              </div>
              <p className="mb-4">
                We use cookies to enhance your spiritual reading experience. These small data files help us remember your preferences (like text size and language choices) and analyze our website traffic.
              </p>

              {/* 🌟 GOOGLE ADSENSE COMPLIANCE BOX (Smartly re-written for pre-approval) */}
              <div className="bg-orange-50/50 border border-orange-200 p-6 md:p-8 rounded-[2rem] mt-8 shadow-inner">
                <h3 className="text-xl font-black text-gray-900 mb-4 flex items-center gap-3">
                  <FaAd className="text-orange-500" /> Advertising & AdSense Compliance
                </h3>
                <p className="text-base text-gray-700 mb-4">
                  To keep this spiritual library free for all devotees, we <strong>may partner</strong> with third-party advertising networks, including Google, to display advertisements in the future. To comply strictly with global advertising standards upon integration, please note our policy:
                </p>
                <ul className="list-disc pl-5 text-base text-gray-700 space-y-3 mb-6 marker:text-orange-500">
                  <li>Third party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website or other websites.</li>
                  <li>Google's use of advertising cookies enables it and its partners to serve ads to users based on their visit to <strong>Hindi Bhajan Manjari</strong> and/or other sites on the Internet.</li>
                </ul>
                <div className="bg-white p-5 rounded-xl border border-orange-100 text-sm">
                  <span className="font-bold text-gray-900 block mb-2">How to Opt-Out:</span>
                  Users may opt-out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold hover:underline">Google Ads Settings</a>. Alternatively, you can opt-out of a third-party vendor's use of cookies for personalized advertising by visiting <a href="http://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold hover:underline">www.aboutads.info</a>.
                </div>
              </div>
            </section>

            {/* --- SECTION 3: THIRD PARTY SERVICES --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-100">
                  <FaExternalLinkAlt size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">3. Third-Party Services</h2>
              </div>
              <p className="mb-4">
                Our website integrates secure services from trusted third parties:
              </p>
              <ul className="list-disc pl-6 space-y-3 marker:text-orange-400">
                <li><strong>YouTube:</strong> We embed videos to provide audio references and 'Tarj' for bhajans. By interacting with these videos, you are subject to YouTube's privacy guidelines.</li>
                <li><strong>Supabase:</strong> Our backend database provider which handles your form submissions with high-level encryption.</li>
              </ul>
              <div className="bg-green-50 border-l-4 border-green-500 p-5 mt-6 rounded-r-xl text-green-800 font-medium">
                Our Promise: We do not, and will never, sell, rent, or trade your personal information to data brokers or third parties.
              </div>
            </section>

            {/* --- SECTION 4 & 5 --- */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-4">4. Your Data Rights</h2>
                <p className="text-base m-0">
                  Depending on your location (GDPR/CCPA), you may have the right to access or delete personal info sent via our contact forms. To exercise this, contact us directly.
                </p>
              </section>

              <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-100">
                <h2 className="text-xl font-black text-gray-900 mb-4">5. Children's Privacy</h2>
                <p className="text-base m-0">
                  Our content is spiritual and safe for all ages. We do not knowingly collect personal identifiable information from children under the age of 13.
                </p>
              </section>
            </div>

            {/* --- FOOTER CTA --- */}
            <section className="mt-16 pt-10 border-t border-gray-100 text-center">
              <p className="text-gray-500 font-medium">
                If you have any questions or concerns regarding this policy, please reach out via our 
                <Link href="/contact" className="text-orange-600 font-black hover:underline ml-2 transition-all">
                  Contact Page
                </Link>.
              </p>
            </section>

          </div>
        </div>
      </article>
    </div>
  );
}