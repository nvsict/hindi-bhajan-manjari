import EbookManagerClient from '@/components/admin/EbookManagerClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'E-Book Command Center | Admin',
};

export default function EbookManagementPage() {
  return (
    <div className="min-h-screen bg-orange-50/30 dark:bg-[#0c0804] py-12 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* 🌟 Header Section */}
      <div className="max-w-[90rem] mx-auto mb-10 text-center xl:text-left animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-orange-50 tracking-tight">
          E-Book <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Command Center</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm sm:text-base font-medium">
          अपनी वेबसाइट के लिए डायनामिक PDF ई-बुक्स बनाएँ और मैनेज करें।
        </p>
      </div>

      {/* 🌟 Smart Client Component (Form + List) */}
      <EbookManagerClient />
      
    </div>
  );
}