"use client";

import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { FaHeart, FaOm, FaCrown, FaStar, FaArrowRight } from 'react-icons/fa6';

const HOMEPAGE_SHOWCASE_LIMIT = 8; // 🌟 fixed forever — homepage never grows past this

const DiamondDivider = () => (
  <div className="flex items-center gap-3 my-4 md:my-5 max-w-[200px] mx-auto">
    <div className="flex-1 h-px bg-gradient-to-r from-transparent to-orange-400/60 dark:to-orange-500/40" />
    <svg width="10" height="10" viewBox="0 0 14 14" className="text-orange-500 dark:text-orange-400 shrink-0">
      <rect x="3" y="3" width="8" height="8" transform="rotate(45 7 7)" fill="currentColor" />
    </svg>
    <div className="flex-1 h-px bg-gradient-to-l from-transparent to-orange-400/60 dark:to-orange-500/40" />
  </div>
);

export type Supporter = {
  id: string;
  name: string | null;
  amount: number;
  message: string | null;
  photo_url: string | null;
  is_anonymous: boolean;
  created_at: string;
};

// 🌟 NEW: Component now accepts data instantly as PROPS from the Server Component
interface SupportersWallProps {
  supporters: Supporter[];
  total: number;
}

export default function SupportersWall({ supporters = [], total = 0 }: SupportersWallProps) {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.08 } }
  };

  const cardVariants: Variants = {
    hidden: { opacity: 0, y: 15, scale: 0.96 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 70, damping: 15 } }
  };

  return (
    <section className="relative py-8 md:py-10 overflow-hidden rounded-3xl md:rounded-[2.5rem] bg-gradient-to-b from-orange-50/50 to-transparent dark:from-[#110c08]/80 dark:to-transparent border border-orange-100/50 dark:border-[#2a1d12]/50 my-4 md:my-6">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-orange-400/10 dark:bg-orange-600/5 blur-[80px] rounded-full pointer-events-none z-0" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-6 md:mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 mb-3 shadow-inner"
          >
            <FaCrown size={20} className="md:w-6 md:h-6" />
          </motion.div>

          <h2 className="text-2xl md:text-4xl font-black text-gray-900 dark:text-white font-hindi tracking-tight mb-2">
            भक्त <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">आभार पटल</span>
          </h2>

          {total > 0 && (
            <p className="text-orange-700 dark:text-orange-400 text-sm md:text-base font-bold font-hindi mb-2">
              अब तक {total.toLocaleString('hi-IN')} भक्तों ने सहयोग दिया 🙏
            </p>
          )}

          <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm font-medium max-w-2xl mx-auto font-hindi leading-relaxed">
            इन धर्म रक्षकों का हृदय से धन्यवाद, जिनके बहुमूल्य सहयोग से यह सनातन मंच सुचारु रूप से चल रहा है।
          </p>
          <DiamondDivider />
        </div>

        {supporters.length > 0 ? (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8"
          >
            {supporters.map((s) => (
              <motion.div
                key={s.id}
                variants={cardVariants}
                whileHover={{ y: -3, scale: 1.02 }}
                className="group relative bg-white/70 dark:bg-white/[0.03] backdrop-blur-md border border-orange-200/60 dark:border-[#2a1d12] p-3 md:p-4 rounded-[1.25rem] flex flex-col items-center text-center shadow-sm hover:shadow-[0_8px_20px_rgba(234,88,12,0.12)] dark:hover:shadow-[0_8px_20px_rgba(234,88,12,0.06)] hover:border-orange-400 dark:hover:border-orange-500/50 transition-all duration-300"
              >
                <div className="absolute inset-0 rounded-[1.25rem] bg-gradient-to-b from-orange-400/0 to-orange-400/0 group-hover:from-orange-400/5 dark:group-hover:from-orange-400/10 transition-colors duration-300 pointer-events-none" />
                <div className="relative mb-3 z-10">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border-[2px] border-white dark:border-[#1a120b] shadow-md overflow-hidden bg-orange-50 dark:bg-gray-800 flex items-center justify-center">
                    {s.is_anonymous ? (
                      <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-orange-500 dark:text-orange-400">
                        <FaOm size={24} className="md:w-6 md:h-6" />
                      </div>
                    ) : s.photo_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={s.photo_url} alt={s.name ?? 'Supporter'} style={{ imageRendering: '-webkit-optimize-contrast' }} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-xl md:text-2xl font-serif">
                        {(s.name ?? '?').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 z-20 bg-green-500 border-[2px] border-white dark:border-[#1a120b] w-4 h-4 md:w-5 md:h-5 rounded-full flex items-center justify-center shadow-sm translate-x-0.5 translate-y-0.5">
                    <FaStar className="text-white text-[7px] md:text-[8px]" />
                  </div>
                </div>
                <h3 className="font-bold font-hindi text-gray-900 dark:text-gray-100 text-xs md:text-sm mb-1.5 w-full px-1 truncate relative z-10">
                  {s.is_anonymous ? "एक गुप्त भक्त" : s.name}
                </h3>
                <div className="bg-orange-100/80 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-2.5 py-0.5 md:py-1 rounded-full font-black text-[9px] md:text-[10px] mb-2 border border-orange-200/60 dark:border-orange-800/50 relative z-10 font-hindi truncate max-w-full">
                  सहयोग: ₹{s.amount}
                </div>
                {s.message && (
                  <div className="mt-auto relative z-10 w-full pt-1">
                    <div className="w-6 h-px bg-orange-200/60 dark:bg-orange-900/40 mx-auto mb-1.5" />
                    <p className="text-[10px] md:text-[11px] font-hindi text-gray-600 dark:text-gray-400 italic line-clamp-2 leading-snug px-1">
                      "{s.message}"
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-6 mb-6">
            <p className="text-gray-500 dark:text-gray-400 italic font-hindi text-sm">अभी तक कोई सहयोग प्राप्त नहीं हुआ है।</p>
          </div>
        )}

        {total > HOMEPAGE_SHOWCASE_LIMIT && (
          <div className="text-center mb-10 md:mb-12">
            <Link
              href="/supporters"
              className="inline-flex items-center gap-2 text-orange-700 dark:text-orange-400 font-bold font-hindi text-sm hover:text-orange-800 dark:hover:text-orange-300 transition-colors"
            >
              सभी {total.toLocaleString('hi-IN')} भक्तों को देखें
              <FaArrowRight className="text-xs" />
            </Link>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto"
        >
          <div className="bg-gradient-to-br from-orange-500 via-red-500 to-orange-600 rounded-3xl p-[2px] shadow-lg relative overflow-hidden group">
            <div className="absolute top-0 left-[-100%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 animate-[shimmer_3s_infinite]" />
            <style>{`@keyframes shimmer { 100% { left: 200%; } }`}</style>
            <div className="bg-white dark:bg-[#0c0804] rounded-[22px] p-5 md:p-8 flex flex-col lg:flex-row items-center gap-6 lg:gap-10 relative z-10 h-full">
              <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2.5 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-wider mb-3 border border-orange-200 dark:border-orange-800/50">
                  <FaStar className="text-yellow-500" /> Early Bird Benefits
                </div>
                <h3 className="text-xl md:text-2xl font-black font-hindi text-gray-900 dark:text-white mb-2 leading-tight">
                  आप भी इस <span className="text-orange-600 dark:text-orange-500">सनातन यज्ञ</span> में आहुति दें!
                </h3>
                <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 font-medium font-hindi leading-relaxed">
                  आज इस मंच को सपोर्ट करने वाले भक्तों को वेबसाइट के <strong className="text-gray-900 dark:text-gray-200">प्रीमियम फीचर्स, PDF बुक्स,</strong> और <strong className="text-gray-900 dark:text-gray-200">विज्ञापन-मुक्त (Ad-Free)</strong> अनुभव उपहार स्वरूप दिया जाएगा।
                </p>
              </div>
              <div className="shrink-0 w-full lg:w-auto flex flex-col items-center">
                <Link
                  href="/donate"
                  className="w-full lg:w-auto bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-black font-hindi text-sm md:text-base px-6 py-3.5 rounded-xl shadow-md shadow-orange-500/20 transition-all active:scale-95 flex items-center justify-center gap-2 outline-none focus-visible:ring-4 focus-visible:ring-orange-500"
                >
                  <FaHeart className="text-yellow-300" />
                  सहयोग करें (Join Wall)
                  <FaArrowRight className="text-xs opacity-80 ml-1" />
                </Link>
                <p className="text-[10px] text-gray-500 dark:text-gray-500 font-bold font-hindi mt-2">
                  100% सुरक्षित • सीधा बैंक ट्रांसफर
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}