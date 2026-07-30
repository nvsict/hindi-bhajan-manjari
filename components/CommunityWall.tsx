"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaUserCircle, FaMusic, FaShareAlt, 
  FaDownload, FaHeart, FaRegHeart 
} from "react-icons/fa";

interface Cover {
  id: string;
  user_name: string;
  audio_url: string;
  likes_count?: number; // 🌟 ADDED: Like count support
  created_at: string;
}

interface Props {
  bhajanId: string;
}

export default function CommunityWall({ bhajanId }: Props) {
  const [covers, setCovers] = useState<Cover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);
  
  // 🌟 ADDED: State to track which cover IDs are liked in this browser
  const [likedCoverIds, setLikedCoverIds] = useState<string[]>([]);
  const [processingLikeId, setProcessingLikeId] = useState<string | null>(null);

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

    // 🌟 Load liked covers from localStorage on mount
    try {
      const savedLikes = JSON.parse(localStorage.getItem('liked_bhajan_covers') || '[]');
      setLikedCoverIds(savedLikes);
    } catch (err) {
      console.error("Error reading localStorage:", err);
    }

    // The Bulletproof Fallback for newly published covers (Local Event)
    const handleNewCover = () => {
      fetchCovers();
    };
    
    window.addEventListener('onCoverPublished', handleNewCover);

    return () => {
      window.removeEventListener('onCoverPublished', handleNewCover);
    };
  }, [bhajanId]);

  // 🌟 Auto-scroll to specific cover if shared link contains the hash
  useEffect(() => {
    if (covers.length > 0 && window.location.hash) {
      const hashId = window.location.hash.substring(1); // remove '#'
      const element = document.getElementById(hashId);
      if (element) {
        setTimeout(() => {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Temporarily highlight the shared cover
          element.classList.add('ring-2', 'ring-orange-500', 'shadow-lg');
          setTimeout(() => element.classList.remove('ring-2', 'ring-orange-500', 'shadow-lg'), 3000);
        }, 500);
      }
    }
  }, [covers]);

  // 🌟 THE LIKE TOGGLE HANDLER (Optimistic UI + Safe Supabase RPC)
  const handleLikeToggle = async (cover: Cover) => {
    if (processingLikeId === cover.id) return; // Prevent double-click spam
    setProcessingLikeId(cover.id);

    const isAlreadyLiked = likedCoverIds.includes(cover.id);
    const nextLikedState = !isAlreadyLiked;

    // 🌟 A: Immediate Optimistic UI Update
    const updatedLikedIds = nextLikedState
      ? [...likedCoverIds, cover.id]
      : likedCoverIds.filter((id) => id !== cover.id);

    setLikedCoverIds(updatedLikedIds);

    setCovers((prevCovers) =>
      prevCovers.map((item) => {
        if (item.id === cover.id) {
          const currentLikes = item.likes_count || 0;
          return {
            ...item,
            likes_count: nextLikedState
              ? currentLikes + 1
              : Math.max(0, currentLikes - 1),
          };
        }
        return item;
      })
    );

    // 🌟 B: Save to browser LocalStorage
    try {
      localStorage.setItem('liked_bhajan_covers', JSON.stringify(updatedLikedIds));
      if (typeof window !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    } catch (err) {
      console.error("LocalStorage save error:", err);
    }

    // 🌟 C: Background call to safe Supabase RPC function
    try {
      const { error } = await supabase.rpc("toggle_cover_like", {
        cover_id: cover.id,
        increment: nextLikedState,
      });

      if (error) throw error;
    } catch (err) {
      console.error("Supabase like toggle error:", err);
      // Revert UI if database call fails
      setLikedCoverIds(likedCoverIds);
      setCovers((prevCovers) =>
        prevCovers.map((item) => {
          if (item.id === cover.id) {
            const currentLikes = item.likes_count || 0;
            return {
              ...item,
              likes_count: !nextLikedState
                ? currentLikes + 1
                : Math.max(0, currentLikes - 1),
            };
          }
          return item;
        })
      );
    } finally {
      setProcessingLikeId(null);
    }
  };

  // 🌟 THE SHARE HANDLER
  const handleShare = async (cover: Cover) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}#cover-${cover.id}`;
    const shareData = {
      title: `${cover.user_name} - Bhajan Cover`,
      text: `Listen to this beautiful bhajan cover by ${cover.user_name}!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  // 🌟 THE DOWNLOAD HANDLER
  const handleDownload = async (cover: Cover) => {
    setIsDownloading(cover.id);
    try {
      const response = await fetch(cover.audio_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${cover.user_name.replace(/\s+/g, '_')}_bhajan_cover.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading file:", err);
      window.open(cover.audio_url, '_blank');
    } finally {
      setIsDownloading(null);
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
            const isLiked = likedCoverIds.includes(cover.id);
            const likesCount = cover.likes_count || 0;

            return (
              <motion.div
                key={cover.id}
                id={`cover-${cover.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.4 }}
                className="bg-white dark:bg-[#1a120b] border border-orange-100 dark:border-white/5 rounded-2xl p-4 shadow-sm transition-all duration-500 flex flex-col gap-3"
              >
                
                {/* User Info & Actions */}
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
                  
                  {/* 🌟 ACTION BUTTONS (Like, Download & Share) */}
                  <div className="flex items-center gap-1.5">
                    
                    {/* 🌟 LIKE BUTTON */}
                    <button
                      onClick={() => handleLikeToggle(cover)}
                      disabled={processingLikeId === cover.id}
                      title={isLiked ? "Unlike Cover" : "Like Cover"}
                      aria-label="Like this audio cover"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-50/80 dark:bg-white/5 hover:bg-orange-100 dark:hover:bg-white/10 text-gray-600 dark:text-gray-300 transition-all active:scale-95 select-none"
                    >
                      {isLiked ? (
                        <FaHeart className="text-red-500 text-sm animate-bounce" />
                      ) : (
                        <FaRegHeart className="text-sm text-gray-400 hover:text-red-500 transition-colors" />
                      )}
                      {likesCount > 0 && (
                        <span className="text-xs font-bold font-mono tracking-tight text-gray-700 dark:text-gray-300">
                          {likesCount}
                        </span>
                      )}
                    </button>

                    {/* 🌟 DOWNLOAD BUTTON */}
                    <button 
                      onClick={() => handleDownload(cover)}
                      disabled={isDownloading === cover.id}
                      title="Download Audio"
                      className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:text-orange-500 rounded-full transition-all active:scale-95 disabled:opacity-50"
                    >
                      {isDownloading === cover.id ? (
                        <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-orange-500 rounded-full animate-spin"></div>
                      ) : (
                        <FaDownload className="text-sm" />
                      )}
                    </button>

                    {/* 🌟 SHARE BUTTON */}
                    <button 
                      onClick={() => handleShare(cover)}
                      title="Share Audio"
                      className="p-2 bg-gray-50 dark:bg-white/5 text-gray-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 rounded-full transition-all active:scale-95"
                    >
                      <FaShareAlt className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Native Audio Player */}
                <div className="w-full bg-orange-50/50 dark:bg-white/5 rounded-full px-2 py-1 mt-1 border border-orange-100 dark:border-white/5">
                  <audio 
                    controls 
                    controlsList="noplaybackrate"
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