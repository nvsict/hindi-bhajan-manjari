"use client";

import { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FaOm, FaStar, FaCrown } from 'react-icons/fa6';

const PAGE_SIZE = 12;

type Supporter = {
  id: string;
  name: string | null;
  amount: number;
  message: string | null;
  photo_url: string | null;
  is_anonymous: boolean;
  created_at: string;
};

export default function AllSupportersPage() {
  const [supporters, setSupporters] = useState<Supporter[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const loadPage = useCallback(async (offset: number) => {
    const res = await fetch(`/api/supporters/public?limit=${PAGE_SIZE}&offset=${offset}`);
    return res.json();
  }, []);

  useEffect(() => {
    loadPage(0).then((data) => {
      setSupporters(data.supporters ?? []);
      setTotal(data.total ?? 0);
      setHasMore(data.hasMore ?? false);
      setLoading(false);
    });
  }, [loadPage]);

  const handleLoadMore = async () => {
    setLoadingMore(true);
    const data = await loadPage(supporters.length);
    setSupporters(prev => [...prev, ...(data.supporters ?? [])]);
    setHasMore(data.hasMore ?? false);
    setLoadingMore(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-orange-50 dark:bg-[#0c0804] px-4">
        <div className="w-10 h-10 border-4 border-orange-200 border-t-orange-500 rounded-full animate-spin mb-3"></div>
        <p className="text-orange-600 dark:text-orange-400 font-hindi font-medium">सूची लोड हो रही है...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen !pt-24 !pb-20 bg-orange-50/40 dark:bg-[#0c0804] font-hindi">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-orange-100 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 mb-4 shadow-inner">
            <FaCrown size={24} />
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">
            भक्त <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">आभार पटल</span>
          </h1>
          <p className="text-orange-700 dark:text-orange-400 font-bold">
            {total.toLocaleString('hi-IN')} भक्तों ने अपना नाम इस सूची में दर्ज कराया है
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {supporters.map((s) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-white/[0.03] border border-orange-200/60 dark:border-[#2a1d12] p-4 rounded-2xl flex flex-col items-center text-center shadow-sm"
            >
              <div className="relative mb-3">
                <div className="w-16 h-16 rounded-full border-2 border-white dark:border-[#1a120b] shadow-md overflow-hidden bg-orange-50 dark:bg-gray-800 flex items-center justify-center">
                  {s.is_anonymous ? (
                    <div className="w-full h-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center text-orange-500 dark:text-orange-400">
                      <FaOm size={24} />
                    </div>
                  ) : s.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s.photo_url} alt={s.name ?? 'Supporter'} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-white font-black text-2xl">
                      {(s.name ?? '?').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="absolute bottom-0 right-0 bg-green-500 border-2 border-white dark:border-[#1a120b] w-5 h-5 rounded-full flex items-center justify-center">
                  <FaStar className="text-white text-[8px]" />
                </div>
              </div>
              <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm mb-1.5 truncate w-full">
                {s.is_anonymous ? "एक गुप्त भक्त" : s.name}
              </h3>
              <div className="bg-orange-100/80 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full font-black text-[10px] mb-2 border border-orange-200/60 dark:border-orange-800/50">
                सहयोग: ₹{s.amount}
              </div>
              {s.message && (
                <p className="text-[11px] text-gray-600 dark:text-gray-400 italic line-clamp-2 mt-1">"{s.message}"</p>
              )}
            </motion.div>
          ))}
        </div>

        {hasMore && (
          <div className="text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-8 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-bold rounded-xl shadow-md transition-all"
            >
              {loadingMore ? 'लोड हो रहा है...' : 'और भक्त देखें'}
            </button>
          </div>
        )}

        {!loading && supporters.length === 0 && (
          <p className="text-center text-gray-500 dark:text-gray-400 italic">अभी तक कोई सार्वजनिक भक्त सूची में नहीं है।</p>
        )}
      </div>
    </div>
  );
}