  "use client";

  import { useState, useEffect } from 'react';
  import { FaBell, FaInfoCircle, FaUsers } from 'react-icons/fa';
  import PushBroadcaster from '@/components/admin/PushBroadcaster';

  export default function BroadcastPage() {
    const [subCount, setSubCount] = useState<number | null>(null);

    useEffect(() => {
      const fetchCount = async () => {
        try {
          // 🌟 FIXED URL HERE (Removed the extra /api)
          const res = await fetch('/api/push/broadcast'); 
          const data = await res.json();
          setSubCount(data.count);
        } catch (err) {
          console.error("Failed to fetch count", err);
        }
      };
      fetchCount();
    }, []);

    return (
      <div className="min-h-screen bg-gray-50/50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
        <div className="max-w-4xl mx-auto">
          
          {/* Header Section */}
          <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center gap-4">
                <FaBell className="text-orange-500 animate-ring" /> 
                Push Center
              </h1>
              <p className="text-gray-500 font-bold mt-2 tracking-wide uppercase text-xs flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                Native Broadcasting System Active
              </p>
            </div>

            {/* 🌟 UPDATED SUBSCRIBER COUNT CARD */}
            <div className="bg-white px-6 py-4 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 min-w-[180px]">
              <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600">
                  <FaUsers size={24} />
              </div>
              <div>
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Live Audience</p>
                  <p className="text-2xl font-black text-gray-900 leading-none mt-1">
                    {subCount !== null ? subCount.toLocaleString() : '...'}
                  </p>
              </div>
            </div>
          </div>

          {/* Info Alert */}
          <div className="mb-8 bg-blue-50 border border-blue-100 p-5 rounded-[2rem] flex items-start gap-4">
            <FaInfoCircle className="text-blue-500 mt-1 shrink-0" size={20} />
            <div className="text-sm text-blue-800 leading-relaxed">
              <p className="font-bold mb-1 underline decoration-blue-200 underline-offset-4">Pro-Tip for SEO & Growth:</p>
              Avoid sending more than 1-2 notifications per day. The best time to broadcast is <b>6:00 AM to 8:00 AM</b> for morning prayers.
            </div>
          </div>

          <div className="space-y-8">
            <PushBroadcaster />
            
            <p className="text-center text-[11px] font-bold text-gray-500 uppercase tracking-widest px-10 leading-loose">
              Note: This system uses VAPID encryption. Messages are delivered directly via browser push engines. Use responsibly.
            </p>
          </div>
        </div>

        <style jsx global>{`
          @keyframes ring {
            0% { transform: rotate(0); }
            10% { transform: rotate(15deg); }
            20% { transform: rotate(-15deg); }
            30% { transform: rotate(10deg); }
            40% { transform: rotate(-10deg); }
            50% { transform: rotate(0); }
            100% { transform: rotate(0); }
          }
          .animate-ring {
            animation: ring 2s infinite ease-in-out;
          }
        `}</style>
      </div>
    );
  }