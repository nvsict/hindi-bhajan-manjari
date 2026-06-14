import AffiliateAdminForm from '@/components/admin/AffiliateAdminForm';
import AffiliateManagerList from '@/components/admin/AffiliateManagerList';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Affiliate Command Center | Admin',
};

export default function AffiliateManagementPage() {
  return (
    <div className="min-h-screen bg-orange-50/30 dark:bg-[#0c0804] py-12 px-4 sm:px-6 lg:px-8">
      
      {/* 🌟 Header Section */}
      <div className="max-w-[90rem] mx-auto mb-10 text-center xl:text-left animate-fade-in-up">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 dark:text-orange-50 tracking-tight">
          Affiliate <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-500">Command Center</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-3 text-sm sm:text-base font-medium">
          एक ही जगह से नए प्रोडक्ट्स जोड़ें और पुराने मैनेज करें।
        </p>
      </div>

      {/* 🌟 Smart Responsive Grid Layout */}
      <div className="max-w-[90rem] mx-auto grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form (Sticky on Desktop) */}
        <div className="xl:col-span-5 xl:sticky xl:top-28 will-change-transform animate-fade-in-up relative z-10">
          <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1a120b]/80 border border-gray-200/80 dark:border-white/5 p-1 sm:p-2 rounded-[2rem] shadow-2xl shadow-orange-900/5">
             <AffiliateAdminForm />
          </div>
        </div>

        {/* Right Column: Manager List */}
        <div className="xl:col-span-7 will-change-transform animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="backdrop-blur-xl bg-white/80 dark:bg-[#1a120b]/80 border border-gray-200/80 dark:border-white/5 p-1 sm:p-2 rounded-[2rem] shadow-2xl shadow-orange-900/5">
             <AffiliateManagerList />
          </div>
        </div>

      </div>
    </div>
  );
}