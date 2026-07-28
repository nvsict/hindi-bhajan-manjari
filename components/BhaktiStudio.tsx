"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash, FaHeadphones, FaChevronDown } from "react-icons/fa";
import { supabase } from "@/utils/supabase";
import { logEvent } from "@/utils/analytics";
import * as Tone from "tone";

interface BhaktiStudioProps {
  bhajanId: string;
  bhajanSlug: string;
  onUploadSuccess?: () => void;
}

type AudioChain = {
  mic: Tone.UserMedia;
  hpf: Tone.Filter;
  gate: Tone.Gate;
  compressor: Tone.Compressor;
  eq: Tone.EQ3;
  reverb: Tone.Reverb;
  limiter: Tone.Limiter;
  recorder: Tone.Recorder;
  analyser: Tone.Analyser;
};

let contextConfigured = false;
function ensurePlaybackContext() {
  if (contextConfigured) return;
  contextConfigured = true;
  const ctx = new Tone.Context({ latencyHint: "playback" });
  Tone.setContext(ctx);
}

export default function BhaktiStudio({ bhajanId, bhajanSlug, onUploadSuccess }: BhaktiStudioProps) {
  // 🌟 UX FIX: Added expanded state to collapse the studio by default
  const [isExpanded, setIsExpanded] = useState(false);
  
  const [recordingState, setRecordingState] = useState<"IDLE" | "RECORDING" | "PREVIEW" | "UPLOADING">("IDLE");

  const [isReverb, setIsReverb] = useState(true);
  const [isNoiseReduction, setIsNoiseReduction] = useState(true);

  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [userName, setUserName] = useState("");
  const [recordingDuration, setRecordingDuration] = useState(0);

  const audioChainRef = useRef<AudioChain | null>(null);
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

  const initAudioChain = async () => {
    ensurePlaybackContext();
    await Tone.start();
    if (audioChainRef.current) return audioChainRef.current;

    const mic = new Tone.UserMedia();
    const hpf = new Tone.Filter({ type: "highpass", frequency: 85, rolloff: -24 });
    const gate = new Tone.Gate({ threshold: isNoiseReduction ? -40 : -100, smoothing: 0.15 });
    const compressor = new Tone.Compressor({ threshold: -20, ratio: 2, attack: 0.01, release: 0.25 });
    const eqNode = new Tone.EQ3({ low: -2, mid: 1, high: 2 });
    const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.04, wet: isReverb ? 0.3 : 0 });
    const limiter = new Tone.Limiter({ threshold: -3 });
    const recorder = new Tone.Recorder();
    const analyser = new Tone.Analyser("fft", 256);

    mic.connect(hpf);
    hpf.chain(gate, compressor, eqNode, reverb, limiter, recorder);
    limiter.connect(analyser);

    await reverb.generate();

    audioChainRef.current = { mic, hpf, gate, compressor, eq: eqNode, reverb, limiter, recorder, analyser };
    return audioChainRef.current;
  };

  useEffect(() => {
    if (isExpanded) {
      initAudioChain();
    }
    
    return () => {
      if (audioChainRef.current) {
        try {
          const chain = audioChainRef.current;
          chain.mic.dispose();
          chain.hpf.dispose();
          chain.gate.dispose();
          chain.compressor.dispose();
          chain.eq.dispose();
          chain.reverb.dispose();
          chain.limiter.dispose();
          chain.recorder.dispose();
          chain.analyser.dispose();
        } catch (e) {
          // ignore cleanup errors
        }
        audioChainRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isExpanded]);

  useEffect(() => {
    if (audioChainRef.current) audioChainRef.current.reverb.wet.value = isReverb ? 0.3 : 0;
  }, [isReverb]);

  useEffect(() => {
    if (audioChainRef.current) audioChainRef.current.gate.threshold = isNoiseReduction ? -40 : -100;
  }, [isNoiseReduction]);

  useEffect(() => {
    if (recordingState === "RECORDING") {
      timerRef.current = setInterval(() => setRecordingDuration((prev) => prev + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [recordingState]);

  const broadcastRecordingState = (active: boolean) => {
    window.dispatchEvent(new CustomEvent("bhajan-recording-state", { detail: { active } }));
  };

  const startRecording = async () => {
    try {
      const chain = await initAudioChain();

      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      };

      await chain.mic.open(constraints as any);

      setRecordingDuration(0);
      logEvent("studio_record_start", { bhajan_slug: bhajanSlug });

      broadcastRecordingState(true);

      const canvas = canvasRef.current;
      if (canvas) {
        const canvasCtx = canvas.getContext("2d");
        const bufferLength = chain.analyser.size;
        let frameCount = 0;

        const draw = () => {
          if (!canvasCtx || !canvas) return;
          animationFrameRef.current = requestAnimationFrame(draw);
          frameCount++;
          if (frameCount % 2 !== 0) return;

          const dataArray = chain.analyser.getValue() as Float32Array;

          canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
          const barWidth = (canvas.width / bufferLength) * 2;
          let x = 0;

          for (let i = 0; i < bufferLength; i++) {
            let db = dataArray[i];
            if (!isFinite(db)) db = -100;

            let byteVal = (db + 100) * 2.55;
            if (byteVal < 0) byteVal = 0;
            if (byteVal > 255) byteVal = 255;

            const barHeight = byteVal / 2;
            canvasCtx.fillStyle = `rgba(234, 88, 12, ${barHeight / 50})`;
            canvasCtx.fillRect(x, canvas.height / 2 - barHeight / 2, barWidth, barHeight);
            x += barWidth + 1;
          }
        };
        draw();
      }

      chain.recorder.start();
      setRecordingState("RECORDING");
    } catch (err: any) {
      console.error("Studio initialization failed:", err);

      if (err.name === "NotAllowedError" || err.message?.includes("Permission")) {
        alert("कृपया ब्राउज़र सेटिंग्स में माइक (Microphone) की अनुमति दें।");
      } else if (err.name === "NotFoundError" || err.message?.includes("Requested device not found")) {
        alert("आपके डिवाइस में कोई माइक्रोफ़ोन नहीं मिला! कृपया माइक कनेक्ट करें।");
      } else if (err.name === "NotReadableError") {
        alert("माइक किसी अन्य ऐप (जैसे कॉलिंग ऐप) द्वारा उपयोग किया जा रहा है।");
      } else {
        alert(`तकनीकी समस्या: ${err.message}`);
      }
    }
  };

  const stopRecording = async () => {
    if (audioChainRef.current && recordingState === "RECORDING") {
      const recordingBlob = await audioChainRef.current.recorder.stop();
      finalAudioBlobRef.current = recordingBlob;

      const url = URL.createObjectURL(recordingBlob);
      setAudioUrl(url);
      setRecordingState("PREVIEW");

      broadcastRecordingState(false);

      audioChainRef.current.mic.close();

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
      alert("कृपया अपना शुभ नाम दर्ज करें!");
      return;
    }
    if (!finalAudioBlobRef.current) return;

    setRecordingState("UPLOADING");

    try {
      const audioBlob = finalAudioBlobRef.current;
      const extension = audioBlob.type.includes("mp4") ? "mp4" : "webm";
      const fileName = `${bhajanSlug}-${Date.now()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from("bhajan-covers")
        .upload(fileName, audioBlob, { contentType: audioBlob.type, cacheControl: "3600" });

      if (uploadError) throw uploadError;

      const { data: publicUrlData } = supabase.storage.from("bhajan-covers").getPublicUrl(fileName);

      const { error: dbError } = await supabase.from("bhajan_covers").insert([
        {
          bhajan_id: bhajanId,
          bhajan_slug: bhajanSlug,
          user_name: userName.trim(),
          audio_url: publicUrlData.publicUrl,
        },
      ]);

      if (dbError) throw dbError;

      alert("जय श्री राम! आपका भजन पब्लिश हो गया है।");
      window.dispatchEvent(new CustomEvent("onCoverPublished"));
      resetStudio();
      setIsExpanded(false); // 🌟 Close studio after successful upload
      if (onUploadSuccess) onUploadSuccess();
    } catch (error) {
      console.error("Upload failed:", error);
      alert("अपलोड विफल रहा। पुनः प्रयास करें।");
      setRecordingState("PREVIEW");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-2xl shadow-sm mb-6 overflow-hidden transition-all">
      
      {/* 🌟 UX FIX: Collapsible Header Button */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-orange-50/50 dark:hover:bg-white/5 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center shrink-0">
            <FaMicrophone size={14} />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-gray-800 dark:text-gray-200 text-sm">Sing this Bhajan</h4>
            <p className="text-[11px] text-gray-500 font-medium">Record your own voice and share</p>
          </div>
        </div>
        <FaChevronDown className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
      </button>

      {/* 🌟 Expandable Content Area */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-gray-100 dark:border-white/5"
          >
            <div className="p-4 bg-gradient-to-r from-orange-50/30 to-amber-50/10 dark:bg-transparent">
              <AnimatePresence mode="wait">
                {recordingState === "IDLE" && (
                  <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-4">
                    <div className="flex items-center gap-3 shrink-0">
                      <button 
                        onClick={startRecording}
                        className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center shadow-md hover:scale-105 active:scale-95 transition-transform cursor-pointer"
                        title="Start Recording"
                        aria-label="Start Recording"
                      >
                        <FaMicrophone />
                      </button>
                      <div>
                        <h4 className="font-bold font-hindi text-gray-800 dark:text-gray-100 text-sm">अपनी आवाज़ में गाएं</h4>
                        <p className="text-[11px] text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                          <FaHeadphones /> इयरफ़ोन का प्रयोग करें
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full lg:w-auto justify-start lg:justify-end">
                      <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-black/30 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 shrink-0 hover:bg-orange-50 transition-colors">
                        <input type="checkbox" checked={isReverb} onChange={(e) => setIsReverb(e.target.checked)} className="accent-orange-500 w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300">Temple Reverb</span>
                      </label>

                      <label className="flex items-center gap-1.5 cursor-pointer bg-white dark:bg-black/30 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 shrink-0 hover:bg-orange-50 transition-colors">
                        <input type="checkbox" checked={isNoiseReduction} onChange={(e) => setIsNoiseReduction(e.target.checked)} className="accent-emerald-500 w-3 h-3" />
                        <span className="text-[10px] font-bold uppercase text-gray-600 dark:text-gray-300">Voice Clarity</span>
                      </label>

                      <button onClick={startRecording} className="bg-gray-900 dark:bg-orange-500 text-white px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-black active:scale-95 transition-colors shadow-sm shrink-0 ml-auto lg:ml-0">
                        Record
                      </button>
                    </div>
                  </motion.div>
                )}

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

                {recordingState === "PREVIEW" && (
                  <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col md:flex-row items-center justify-between w-full gap-4">
                    <audio ref={audioPlayerRef} src={audioUrl || ""} onEnded={() => setIsPlaying(false)} className="hidden" />

                    <div className="flex items-center justify-between gap-2 bg-white dark:bg-black/30 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/10 w-full md:w-auto">
                      <button onClick={togglePlayback} className="w-8 h-8 shrink-0 flex items-center justify-center bg-orange-500 text-white rounded-full active:scale-90 transition-transform">
                        {isPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs translate-x-0.5" />}
                      </button>
                      <span className="font-mono text-sm font-bold text-gray-700 dark:text-gray-300 w-12 text-center shrink-0">{formatTime(recordingDuration)}</span>
                      <button onClick={resetStudio} className="w-8 h-8 shrink-0 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors">
                        <FaTrash className="text-sm" />
                      </button>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
                      <input
                        type="text"
                        placeholder="आपका शुभ नाम..."
                        value={userName}
                        onChange={(e) => setUserName(e.target.value)}
                        className="w-full sm:w-40 bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 px-4 py-2 rounded-full text-xs font-hindi outline-none focus:border-orange-500 transition-colors"
                      />
                      <button onClick={handlePublish} className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider shadow-md active:scale-95 transition-transform whitespace-nowrap">
                        Publish Cover
                      </button>
                    </div>
                  </motion.div>
                )}

                {recordingState === "UPLOADING" && (
                  <motion.div key="uploading" className="flex items-center justify-center w-full gap-3 py-2">
                    <div className="w-5 h-5 border-2 border-orange-200 border-t-orange-600 rounded-full animate-spin" />
                    <span className="text-sm font-bold font-hindi text-gray-600 dark:text-gray-300">अपलोड हो रहा है...</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}