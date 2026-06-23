"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash, FaHeadphones } from "react-icons/fa";
import { supabase } from "@/utils/supabase";
import * as Tone from "tone";

interface BhaktiStudioProps {
  bhajanId: string;
  bhajanSlug: string;
  onUploadSuccess?: () => void;
}

export default function BhaktiStudio({ bhajanId, bhajanSlug, onUploadSuccess }: BhaktiStudioProps) {
  const [recordingState, setRecordingState] = useState<"IDLE" | "RECORDING" | "PREVIEW" | "UPLOADING">("IDLE");
  
  const [isReverb, setIsReverb] = useState(true); 
  const [isNoiseReduction, setIsNoiseReduction] = useState(true); 

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userName, setUserName] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);

  // 🌟 Audio Graph Refs
  const recorderRef = useRef<Tone.Recorder | null>(null);
  const reverbRef = useRef<Tone.Reverb | null>(null); // Global Reverb Instance
  const gateRef = useRef<Tone.Gate | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const finalAudioBlobRef = useRef<Blob | null>(null);
  
  const animationFrameRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // ==========================================
  // 🌟 CPU OPTIMIZATION: Pre-Generate Reverb
  // ==========================================
  useEffect(() => {
    let isMounted = true;
    
    const initReverb = async () => {
      try {
        const rev = new Tone.Reverb({
          decay: 3.5, // Perfect Temple/Hall length
          preDelay: 0.04,
          wet: 0.30
        });
        
        // Generates the heavy IR buffer quietly in the background
        await rev.generate(); 
        
        if (isMounted) {
          reverbRef.current = rev;
        }
      } catch (err) {
        console.error("Failed to pre-generate reverb:", err);
      }
    };

    initReverb();

    return () => {
      isMounted = false;
      // Do NOT dispose reverb here, keep it alive for multiple recordings
    };
  }, []);

  // Live Toggle handlers
  useEffect(() => {
    if (reverbRef.current) {
      reverbRef.current.wet.value = isReverb ? 0.30 : 0;
    }
  }, [isReverb]);

  useEffect(() => {
    if (gateRef.current) {
      // If Noise Reduction is OFF, lower the threshold so everything passes
      gateRef.current.threshold = isNoiseReduction ? -40 : -100;
    }
  }, [isNoiseReduction]);

  useEffect(() => {
    if (recordingState === "RECORDING") {
      timerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  // ==========================================
  // 🎙️ THE OPTIMIZED PRO VOCAL CHAIN
  // ==========================================
  const startRecording = async () => {
    try {
      await Tone.start();

      const constraints = {
        audio: {
          echoCancellation: false, 
          noiseSuppression: true,
          autoGainControl: true,    // 🌟 Perfect for singers moving around the mic
          channelCount: 1,          // 🌟 Pure Mono to save CPU & prevent cracking
          sampleRate: 48000         // Studio standard
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setRecordingDuration(0);

      const micSource = Tone.context.createMediaStreamSource(stream);

      // 1. High Pass Filter
      const hpf = new Tone.Filter({
        type: "highpass",
        frequency: 85,
        rolloff: -24
      });

      // 2. Noise Gate (Kills background hiss when not singing)
      const gate = new Tone.Gate({
        threshold: isNoiseReduction ? -40 : -100
      });
      gateRef.current = gate;

      // 3. Smooth Compressor
      const compressor = new Tone.Compressor({
        threshold: -24,
        ratio: 2.5,
        attack: 0.01,
        release: 0.3
      });

      // 4. Presence EQ
      const eq = new Tone.EQ3({
        low: -2,
        mid: 1,
        high: 5
      });

      // 5. The Cached Reverb (No generate() calls here!)
      if (!reverbRef.current) {
        // Fallback just in case the user clicked record before useEffect finished
        const rev = new Tone.Reverb({ decay: 3.5, preDelay: 0.04, wet: isReverb ? 0.30 : 0 });
        await rev.generate();
        reverbRef.current = rev;
      }
      const reverb = reverbRef.current;
      reverb.wet.value = isReverb ? 0.30 : 0;

      // 6. Master Limiter
      const limiter = new Tone.Limiter(-1);
      
      const recorder = new Tone.Recorder();
      recorderRef.current = recorder;

      const analyser = Tone.context.createAnalyser();
      analyser.fftSize = 256;

      // Connect the Optimized Chain
      Tone.connect(micSource, hpf);
      hpf.chain(gate, compressor, eq, reverb, limiter, recorder);
      Tone.connect(limiter, analyser); 

      // Canvas Visualizer
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasCtx = canvas.getContext("2d");
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
          if (!canvasCtx || !canvas) return;
          animationFrameRef.current = requestAnimationFrame(draw);
          analyser.getByteFrequencyData(dataArray);

          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            const barHeight = dataArray[i] / 2;
            canvasCtx.fillStyle = `rgba(234, 88, 12, ${barHeight / 50})`;
            canvasCtx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
            x += barWidth + 1;
          }
        };
        draw();
      }

      recorder.start();
      setRecordingState("RECORDING");

    } catch (err) {
      console.error("Studio initialization failed:", err);
      alert("कृपया ब्राउज़र सेटिंग्स में माइक (Microphone) की अनुमति दें।");
    }
  };

  const stopRecording = async () => {
    if (recorderRef.current && recordingState === "RECORDING") {
      const recordingBlob = await recorderRef.current.stop();
      finalAudioBlobRef.current = recordingBlob;
      
      const url = URL.createObjectURL(recordingBlob);
      setAudioUrl(url);
      setRecordingState("PREVIEW");
      
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const togglePlayback = () => {
    if (audioPlayerRef.current) {
      if (isPlaying) {
        audioPlayerRef.current.pause();
        setIsPlaying(false);
      } else {
        audioPlayerRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const resetStudio = () => {
    setAudioUrl(null);
    finalAudioBlobRef.current = null;
    setIsPlaying(false);
    setRecordingDuration(0);
    setRecordingState("IDLE");
  };

  const handlePublish = async () => {
    if (!userName.trim()) {
      alert("कृपया अपना नाम दर्ज करें!");
      return;
    }
    if (!finalAudioBlobRef.current) return;

    setRecordingState("UPLOADING");
    
    try {
      const audioBlob = finalAudioBlobRef.current;
      const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm";
      const fileName = `${bhajanSlug}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from('bhajan-covers')
        .upload(fileName, audioBlob, { contentType: audioBlob.type, cacheControl: '3600' });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from('bhajan-covers').getPublicUrl(fileName);

      const { error: dbError } = await supabase.from('bhajan_covers').insert([{
        bhajan_id: bhajanId,
        bhajan_slug: bhajanSlug,
        user_name: userName.trim(),
        audio_url: publicUrlData.publicUrl,
      }]);

      if (dbError) throw dbError;

      alert("जय श्री राम! आपका भजन पब्लिश हो गया है।");
      window.dispatchEvent(new CustomEvent('onCoverPublished'));
      resetStudio();
      if (onUploadSuccess) onUploadSuccess();

    } catch (error) {
      console.error("Upload failed:", error);
      alert("अपलोड विफल रहा। पुनः प्रयास करें।");
      setRecordingState("PREVIEW"); 
    }
  };

  return (
    <div className="w-full bg-gradient-to-r from-orange-50/80 to-amber-50/50 dark:from-white/5 dark:to-transparent border border-orange-200 dark:border-white/10 rounded-2xl p-4 shadow-sm mb-6 transition-all">
      <AnimatePresence mode="wait">
        
        {/* STATE 1: IDLE */}
        {recordingState === "IDLE" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center shadow-md animate-pulse shrink-0">
                <FaMicrophone />
              </div>
              <div>
                <h4 className="font-bold font-hindi text-gray-800 dark:text-gray-100 text-sm">अपनी आवाज़ में गाएं</h4>
                <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                  <FaHeadphones /> इयरफ़ोन का प्रयोग करें
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto justify-start lg:justify-end">
              <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-black/30 px-3 py-1.5 rounded-full border border-orange-100 dark:border-white/10 shrink-0 hover:bg-orange-50 transition-colors">
                <input type="checkbox" checked={isReverb} onChange={(e) => setIsReverb(e.target.checked)} className="accent-orange-500 w-3 h-3" />
                <span className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300">Temple Reverb</span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-black/30 px-3 py-1.5 rounded-full border border-orange-100 dark:border-white/10 shrink-0 hover:bg-orange-50 transition-colors">
                <input type="checkbox" checked={isNoiseReduction} onChange={(e) => setIsNoiseReduction(e.target.checked)} className="accent-emerald-500 w-3 h-3" />
                <span className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300">Voice Clarity</span>
              </label>

              <button onClick={startRecording} className="bg-gray-900 dark:bg-orange-500 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:scale-105 active:scale-95 transition-transform shadow-md shrink-0 ml-auto lg:ml-0">
                Record
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE 2: RECORDING */}
        {recordingState === "RECORDING" && (
          <motion.div key="recording" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <div className="flex items-center gap-4 w-full">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-ping shrink-0" />
              <span className="font-mono text-2xl font-black text-red-500 shrink-0">{formatTime(recordingDuration)}</span>
              <canvas ref={canvasRef} width={150} height={30} className="h-[30px] w-full max-w-[150px] bg-black/5 dark:bg-black/20 rounded-lg flex-1" />
            </div>
            
            <button onClick={stopRecording} className="w-full md:w-auto bg-red-600 text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-md hover:bg-red-700 active:scale-95 transition-all flex items-center justify-center gap-2 shrink-0">
              <FaStop /> Stop
            </button>
          </motion.div>
        )}

        {/* STATE 3: PREVIEW & PUBLISH */}
        {recordingState === "PREVIEW" && (
          <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
            <audio ref={audioPlayerRef} src={audioUrl || ""} onEnded={() => setIsPlaying(false)} className="hidden" />
            
            <div className="flex items-center justify-between gap-2 bg-white dark:bg-black/30 px-3 py-1.5 rounded-full border border-orange-100 dark:border-white/10 w-full md:w-auto">
              <button onClick={togglePlayback} className="w-8 h-8 shrink-0 flex items-center justify-center bg-orange-500 text-white rounded-full active:scale-90 transition-transform">
                {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs translate-x-0.5" />}
              </button>
              <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300 w-12 text-center shrink-0">{formatTime(recordingDuration)}</span>
              <button onClick={resetStudio} className="w-8 h-8 shrink-0 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                <FaTrash className="text-sm" />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
              <input type="text" placeholder="आपका शुभ नाम..." value={userName} onChange={(e) => setUserName(e.target.value)} className="w-full sm:w-40 bg-white dark:bg-black/30 border border-orange-200 dark:border-white/10 px-4 py-2 rounded-full text-xs font-hindi outline-none focus:border-orange-500 transition-colors" />
              <button onClick={handlePublish} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-transform whitespace-nowrap">
                Publish
              </button>
            </div>
          </motion.div>
        )}

        {/* STATE 4: UPLOADING */}
        {recordingState === "UPLOADING" && (
          <motion.div key="uploading" className="flex items-center justify-center w-full gap-3 py-2">
            <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
            <span className="text-sm font-bold font-hindi text-gray-600 dark:text-gray-300">अपलोड हो रहा है...</span>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}