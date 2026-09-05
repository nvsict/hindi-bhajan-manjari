import { 
  FaShieldAlt, 
  FaUserSecret, 
  FaCookieBite, 
  FaExternalLinkAlt, 
  FaAd, 
  FaGavel, 
  FaUserShield, 
  FaFileContract, 
  FaDatabase
} from 'react-icons/fa';
import { Metadata } from 'next';
import Link from 'next/link';

// ==========================================
// 🌟 1. SEO METADATA (Crucial for AdSense & Google Search)
// ==========================================
export const metadata: Metadata = {
  title: 'Privacy Policy & Cookie Usage | Hindi Bhajan Manjari',
  description: 'Comprehensive privacy policy, cookie tracking details, GDPR, CCPA, and Google AdSense compliance for Hindi Bhajan Manjari.',
  alternates: {
    canonical: 'https://www.hindibhajanmanjari.com/privacy',
  }
};

export default function PrivacyPolicy() {
  const lastUpdated = "June 2, 2026";

  return (
    <div className="min-h-screen bg-gray-50/50 py-16 px-4 selection:bg-orange-100 selection:text-orange-900 font-sans">
      <article className="max-w-5xl mx-auto bg-white shadow-xl shadow-gray-900/5 border border-orange-100 rounded-[2.5rem] overflow-hidden">
        
        {/* --- HEADER SECTION --- */}
        <div className="bg-gradient-to-br from-orange-600 to-orange-500 p-10 md:p-16 text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <FaShieldAlt className="text-5xl mx-auto mb-6 opacity-90 drop-shadow-md" />
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4 tracking-tight drop-shadow-sm">Privacy Policy</h1>
            <p className="text-orange-50 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
              Your privacy is paramount. This comprehensive document outlines our highly defensive data protection practices, global legal compliance, and cookie tracking policies.
            </p>
            <div className="mt-8 inline-block bg-white/10 backdrop-blur-md px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-white/20 shadow-sm">
              Last Updated: {lastUpdated}
            </div>
          </div>
          
          {/* 🌟 Decorative CSS Pattern (Replaced dead image link) */}
          <div 
            className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(#ffffff 2px, transparent 2px)', 
              backgroundSize: '30px 30px' 
            }}
          ></div>
        </div>

        <div className="p-8 md:p-16">
          <div className="prose prose-orange max-w-none text-gray-600 leading-relaxed text-[17px]">
            
            <p className="text-gray-800 font-bold text-xl mb-8 border-l-4 border-orange-500 pl-4 bg-orange-50 p-4 rounded-r-xl">
              At Hindi Bhajan Manjari, accessible from hindibhajanmanjari.com, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by us and how we use it. By using our website, you hereby consent to our Privacy Policy and agree to its terms.
            </p>

            <hr className="my-10 border-gray-100" />

            {/* --- SECTION 1: INFORMATION COLLECTION --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaDatabase size={22} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">1. Information We Collect</h2>
              </div>
              <p className="mb-4">
                The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.
              </p>
              <ul className="list-disc pl-6 space-y-3 marker:text-orange-500">
                <li><strong>Direct Information:</strong> If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</li>
                <li><strong>Log Files:</strong> Hindi Bhajan Manjari follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable.</li>
              </ul>
            </section>

            {/* --- SECTION 2: HOW WE USE YOUR INFO --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaUserSecret size={22} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">2. How We Use Your Information</h2>
              </div>
              <p className="mb-4">We use the information we collect in various ways, including to:</p>
              <ul className="list-disc pl-6 space-y-2 marker:text-orange-500">
                <li>Provide, operate, and maintain our website.</li>
                <li>Improve, personalize, and expand our website.</li>
                <li>Understand and analyze how you use our website.</li>
                <li>Develop new products, services, features, and functionality.</li>
                <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes.</li>
                <li>Find and prevent fraud.</li>
              </ul>
            </section>

            {/* --- SECTION 3: GOOGLE ADSENSE & DART COOKIE (Highly Defensive) --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center shrink-0 border border-orange-200">
                  <FaAd size={22} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">3. Google AdSense & DoubleClick DART Cookie</h2>
              </div>
              
              <div className="bg-orange-50/60 border border-orange-200 p-8 rounded-[2rem] shadow-inner">
                <p className="mb-4 font-medium text-gray-800">
                  Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.hindibhajanmanjari.com and other sites on the internet.
                </p>
                <div className="space-y-4 text-gray-700 bg-white p-6 rounded-2xl border border-orange-100">
                  <p><strong>Compliance Statement:</strong> We strictly adhere to Google's Advertising Policies. Third-party vendors, including Google, use cookies to serve ads based on a user's prior visits to our website.</p>
                  <p>Google's use of advertising cookies enables it and its partners to serve ads to our users based on their visit to our sites and/or other sites on the Internet.</p>
                  <p className="font-bold text-gray-900 border-t border-gray-100 pt-4 mt-2">Opting Out:</p>
                  <p>
                    Visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL – <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold hover:underline">https://policies.google.com/technologies/ads</a>. Users may also opt-out of some third-party vendors’ uses of cookies for personalized advertising by visiting <a href="http://www.aboutads.info" target="_blank" rel="noopener noreferrer" className="text-orange-600 font-bold hover:underline">www.aboutads.info</a>.
                  </p>
                </div>
              </div>
            </section>

            {/* --- SECTION 4: COOKIES & WEB BEACONS --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaCookieBite size={22} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">4. Cookies and Web Beacons</h2>
              </div>
              <p className="mb-4">
                Like any other website, Hindi Bhajan Manjari uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.
              </p>
            </section>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* --- SECTION 5: CCPA --- */}
              <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaGavel className="text-2xl text-gray-700" />
                  <h2 className="text-xl font-black text-gray-900 m-0">5. CCPA Privacy Rights</h2>
                </div>
                <p className="text-[15px] mb-4 text-gray-600">
                  Under the CCPA, among other rights, California consumers have the right to:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-[14px] text-gray-600 marker:text-gray-400">
                  <li>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</li>
                  <li>Request that a business delete any personal data about the consumer that a business has collected.</li>
                  <li>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</li>
                </ul>
                <p className="text-[14px] mt-4 font-bold text-gray-700">If you make a request, we have one month to respond to you.</p>
              </section>

              {/* --- SECTION 6: GDPR --- */}
              <section className="bg-gray-50 p-8 rounded-[2rem] border border-gray-200">
                <div className="flex items-center gap-3 mb-4">
                  <FaUserShield className="text-2xl text-gray-700" />
                  <h2 className="text-xl font-black text-gray-900 m-0">6. GDPR Data Protection</h2>
                </div>
                <p className="text-[15px] mb-4 text-gray-600">
                  We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-[14px] text-gray-600 marker:text-gray-400">
                  <li><strong>The right to access:</strong> You have the right to request copies of your personal data.</li>
                  <li><strong>The right to rectification:</strong> You have the right to request that we correct any information you believe is inaccurate.</li>
                  <li><strong>The right to erasure:</strong> You have the right to request that we erase your personal data, under certain conditions.</li>
                  <li><strong>The right to restrict processing:</strong> You have the right to request that we restrict the processing of your personal data.</li>
                </ul>
              </section>
            </div>

            {/* --- SECTION 7: THIRD PARTY POLICIES --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaExternalLinkAlt size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">7. Third-Party Privacy Policies</h2>
              </div>
              <p className="mb-4">
                Hindi Bhajan Manjari's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.
              </p>
              <p>
                You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.
              </p>
            </section>

            {/* --- SECTION 8: CHILDREN'S INFO --- */}
            <section className="mb-12">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-gray-50 text-gray-700 rounded-2xl flex items-center justify-center shrink-0 border border-gray-200">
                  <FaFileContract size={20} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 m-0">8. Children's Information (COPPA)</h2>
              </div>
              <p className="mb-4">
                Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.
              </p>
              <p className="font-bold text-gray-800 bg-red-50 p-4 rounded-xl border-l-4 border-red-500">
                Hindi Bhajan Manjari does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately and we will do our best efforts to promptly remove such information from our records.
              </p>
            </section>

            {/* --- FOOTER CTA --- */}
            <section className="mt-16 pt-10 border-t border-gray-100 text-center">
              <h3 className="text-2xl font-black text-gray-900 mb-4">Questions or Concerns?</h3>
              <p className="text-gray-600 font-medium mb-6">
                If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.
              </p>
              <Link 
                href="/contact" 
                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gray-900 hover:bg-black text-white font-black rounded-xl transition-colors shadow-lg active:scale-95"
              >
                Contact Our Legal Team
              </Link>
            </section>

          </div>
        </div>
      </article>
    </div>
  );
}