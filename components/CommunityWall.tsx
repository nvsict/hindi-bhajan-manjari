"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabase";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaMusic, FaShareAlt, FaDownload } from "react-icons/fa";

interface Cover {
  id: string;
  user_name: string;
  audio_url: string;
  created_at: string;
}

interface Props {
  bhajanId: string;
}

export default function CommunityWall({ bhajanId }: Props) {
  const [covers, setCovers] = useState<Cover[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

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

  // 🌟 THE SHARE HANDLER
  const handleShare = async (cover: Cover) => {
    // Generate a unique URL for this specific audio cover
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
      // Fallback for browsers that don't support Web Share API
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  };

  // 🌟 THE DOWNLOAD HANDLER
  const handleDownload = async (cover: Cover) => {
    setIsDownloading(cover.id);
    try {
      // Fetch the file as a blob to force download instead of playing in a new tab
      const response = await fetch(cover.audio_url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = blobUrl;
      // Provide a clean file name
      link.download = `${cover.user_name.replace(/\s+/g, '_')}_bhajan_cover.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error("Error downloading file:", err);
      // Fallback: just open the URL
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
                  
                  {/* 🌟 ACTION BUTTONS (Share & Download) */}
                  <div className="flex items-center gap-2">
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