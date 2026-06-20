"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaMusic, FaHeart } from "react-icons/fa";

interface Cover {
  id: string;
  user_name: string;
  audio_url: string;
  likes_count: number;
  created_at: string;
}

interface Props {
  bhajanId: string;
}

export default function CommunityWall({ bhajanId }: Props) {
  const [covers, setCovers] = useState<Cover[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Fetch
  const fetchCovers = async () => {
    try {
      const { data, error } = await supabase
        .from('bhajan_covers')
        .select('*')
        .eq('bhajan_id', bhajanId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCovers(data || []);
    } catch (err) {
      console.error("Error fetching covers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // पहली बार लोड होने पर कवर्स लाएं
    fetchCovers();

    // 🌟 THE BULLETPROOF FALLBACK: Custom Event Listener
    // अगर WebSocket फेल भी हो जाए, तो BhaktiStudio से सिग्नल मिलते ही यह लिस्ट रिफ्रेश कर लेगा
    const handleNewCover = () => {
      console.log("New cover detected! Refreshing wall...");
      fetchCovers();
    };
    
    window.addEventListener('onCoverPublished', handleNewCover);

    // Supabase Realtime (अगर यह चल जाए तो अच्छी बात है, वरना हमारा Event तो है ही)
    const subscription = supabase
      .channel(`covers_${bhajanId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'bhajan_covers', filter: `bhajan_id=eq.${bhajanId}` },
        (payload) => {
          setCovers((current) => [payload.new as Cover, ...current]);
        }
      )
      .subscribe();

    return () => {
      window.removeEventListener('onCoverPublished', handleNewCover);
      supabase.removeChannel(subscription);
    };
  }, [bhajanId]);

  // Format Date (e.g., "12 Oct 2023")
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-8">
        <div className="w-8 h-8 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (covers.length === 0) {
    return null; // Don't show the wall if no one has recorded yet
  }

  return (
    <div className="w-full mt-10">
      <div className="flex items-center gap-2 mb-6">
        <FaMusic className="text-orange-500 text-lg" />
        <h3 className="text-xl font-black font-hindi text-gray-900 dark:text-orange-50">
          कम्युनिटी कवर्स ({covers.length})
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <AnimatePresence>
          {covers.map((cover) => (
            <motion.div
              key={cover.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4 }}
              className="bg-white dark:bg-[#1a120b] border border-orange-100 dark:border-white/5 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow flex flex-col gap-3"
            >
              
              {/* User Info & Date */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <FaUserCircle className="text-2xl text-gray-300 dark:text-gray-600" />
                  <span className="font-bold font-hindi text-sm">{cover.user_name}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                  {formatDate(cover.created_at)}
                </span>
              </div>

              {/* Native Audio Player (Custom Styled via Wrapper) */}
              <div className="w-full bg-orange-50/50 dark:bg-white/5 rounded-full px-2 py-1 mt-1 border border-orange-100 dark:border-white/5">
                <audio 
                  controls 
                  controlsList="nodownload noplaybackrate" 
                  className="w-full h-10 outline-none" 
                  src={cover.audio_url} 
                >
                  Your browser does not support the audio element.
                </audio>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}