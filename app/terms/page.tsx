import { FaBalanceScale, FaBan, FaCheckDouble, FaUserShield } from 'react-icons/fa';
import { HiScale } from 'react-icons/hi';

export default function TermsPage() {
  const lastUpdated = "February 2026";

  return (
    <div className="min-h-screen bg-gray-50/30 py-16 px-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="bg-white border border-orange-100 rounded-[2.5rem] p-10 md:p-16 mb-8 shadow-sm">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center mb-6">
              <HiScale size={32} />
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-500 max-w-xl mx-auto">
              Please read these terms carefully before using the Hindi Bhajan Manjari platform.
            </p>
            <div className="mt-6 text-xs font-bold text-orange-600 uppercase tracking-widest bg-orange-50 px-4 py-1 rounded-full">
              Agreement Effective as of {lastUpdated}
            </div>
          </div>
        </div>

        {/* Content Cards */}
        <div className="grid gap-6">
          
          {/* 1. Acceptance of Terms */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <FaCheckDouble />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">1. Acceptance of Terms</h2>
                <p className="text-gray-600 leading-relaxed">
                  By accessing or using <strong>Hindi Bhajan Manjari</strong>, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must not use our website.
                </p>
              </div>
            </div>
          </div>

          {/* 2. Permitted Use */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
                <FaUserShield />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">2. Permitted Use</h2>
                <p className="text-gray-600 leading-relaxed mb-4">
                  This platform is provided for personal, devotional, and educational use. You may:
                </p>
                <ul className="grid md:grid-cols-2 gap-3 text-sm text-gray-500 font-medium">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Read & sing along to lyrics
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Save bhajans for offline puja
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Share links to bhajans
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span> Study meanings (Bhavarth)
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* 3. Restrictions (The "No-Scraping" Rule) */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                <FaBan />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">3. Prohibited Conduct</h2>
                <p className="text-gray-600 leading-relaxed">
                  You agree <strong>not</strong> to:
                </p>
                <ul className="list-disc pl-5 mt-3 space-y-2 text-sm text-gray-500">
                  <li>Use automated bots, crawlers, or scrapers to extract our lyrics database.</li>
                  <li>Re-publish our unique explanations (Bhavarth) on competing websites without attribution.</li>
                  <li>Attempt to bypass any security measures or access our backend (Supabase) directly.</li>
                  <li>Use the platform for any commercial purpose without prior written consent.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 4. Disclaimer of Warranties */}
          <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex items-start gap-5">
              <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-xl flex items-center justify-center shrink-0">
                <FaBalanceScale />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 mb-3">4. Content Accuracy & Warranty</h2>
                <p className="text-gray-600 leading-relaxed">
                  The content is provided "as is." While we strive for 100% linguistic and spiritual accuracy, we do not warrant that the lyrics, meanings, or video references are free of errors. Devotional practices are personal; we are not responsible for any interpretations made by users.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Note */}
        <div className="mt-12 text-center text-gray-400 text-sm">
          <p>Questions about our terms? <a href="/contact" className="text-orange-600 font-bold hover:underline">Contact Support</a></p>
        </div>
      </div>
    </div>
  );
}


//