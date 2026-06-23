"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaMusic, FaHeart, FaRegHeart } from "react-icons/fa";

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
  const [likedCovers, setLikedCovers] = useState<Set<string>>(new Set());

  // 🌟 Load liked items from LocalStorage on mount
  useEffect(() => {
    const savedLikes = JSON.parse(localStorage.getItem("liked_bhajan_covers") || "[]");
    setLikedCovers(new Set(savedLikes));
  }, []);

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
    fetchCovers();

    // The Bulletproof Fallback
    const handleNewCover = () => {
      fetchCovers();
    };
    
    window.addEventListener('onCoverPublished', handleNewCover);

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

  // 🌟 THE LIKE HANDLER (Optimistic UI Update)
  const handleLike = async (id: string, currentLikes: number) => {
    // अगर यूज़र पहले ही लाइक कर चुका है, तो कुछ न करें
    if (likedCovers.has(id)) return;

    // 1. Optimistic Update (तुरंत UI में +1 दिखाएं ताकि ऐप फास्ट लगे)
    setCovers((prev) => 
      prev.map((cover) => 
        cover.id === id ? { ...cover, likes_count: (cover.likes_count || 0) + 1 } : cover
      )
    );

    // 2. Update Local Storage
    const newLikedSet = new Set(likedCovers).add(id);
    setLikedCovers(newLikedSet);
    localStorage.setItem("liked_bhajan_covers", JSON.stringify(Array.from(newLikedSet)));

    // 3. Update Supabase Database
    try {
      const { error } = await supabase
        .from('bhajan_covers')
        .update({ likes_count: (currentLikes || 0) + 1 })
        .eq('id', id);

      if (error) throw error;
    } catch (err) {
      console.error("Error updating like:", err);
      // (Optional) अगर एरर आए तो लाइक वापस कम कर सकते हैं
    }
  };

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
    return null; 
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
          {covers.map((cover) => {
            const isLiked = likedCovers.has(cover.id);

            return (
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
                    <div>
                      <span className="font-bold font-hindi text-sm block leading-none">{cover.user_name}</span>
                      <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                        {formatDate(cover.created_at)}
                      </span>
                    </div>
                  </div>
                  
                  {/* 🌟 THE LIKE BUTTON */}
                  <button 
                    onClick={() => handleLike(cover.id, cover.likes_count)}
                    disabled={isLiked}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-300 ${
                      isLiked 
                        ? 'bg-red-50 dark:bg-red-900/20 text-red-500 cursor-default' 
                        : 'bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-400 active:scale-95 cursor-pointer'
                    }`}
                  >
                    {isLiked ? (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
                        <FaHeart className="text-sm drop-shadow-sm" />
                      </motion.div>
                    ) : (
                      <FaRegHeart className="text-sm" />
                    )}
                    <span className="text-xs font-bold font-mono mt-0.5">{cover.likes_count || 0}</span>
                  </button>
                </div>

                {/* Native Audio Player */}
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
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}