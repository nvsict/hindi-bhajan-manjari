"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaMicrophone, FaStop, FaPlay, FaPause, FaTrash, FaHeadphones } from "react-icons/fa";
import { supabase } from "@/utils/supabase";
import { logEvent } from "@/utils/analytics";
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

  // 🌟 Persistent audio graph refs — built ONCE, reused across every recording
  const chainRef = useRef<{
    hpf: Tone.Filter;
    gate: Tone.Gate;
    compressor: Tone.Compressor;
    eq: Tone.EQ3;
    reverb: Tone.Reverb;
    limiter: Tone.Limiter;
    recorder: Tone.Recorder;
    analyser: AnalyserNode;
  } | null>(null);

  const micSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
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

  // ==========================================================
  // 🌟 FIX 1: Build the AudioContext ONCE with a stable, recording-safe
  // latencyHint. "interactive" (Tone's default) uses tiny buffers meant
  // for instruments/games — under any main-thread load it underruns and
  // crackles. "playback" trades a bit of latency for a much bigger,
  // stable buffer, which is exactly what you want for a voice recorder.
  // ==========================================================
  useEffect(() => {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({
      latencyHint: "playback",
    });
    Tone.setContext(ctx);

    // ==========================================================
    // 🌟 FIX 2: Build the entire effects chain ONE TIME on mount, not on
    // every startRecording() call. Nodes are created once and reused —
    // we only connect/disconnect the mic source per session. This kills
    // the "worse every time you record" problem caused by leaked nodes.
    // ==========================================================
    const hpf = new Tone.Filter({ type: "highpass", frequency: 85, rolloff: -24 });

    // 🌟 FIX 3: Gate with explicit smoothing. A hard gate with no smoothing
    // is very likely your actual crackle — every threshold crossing is an
    // audible click. `smoothing` (2nd arg) ramps the gain instead of
    // switching it, which removes the click entirely.
    const gate = new Tone.Gate(isNoiseReduction ? -40 : -100, 0.15);

    const compressor = new Tone.Compressor({ threshold: -24, ratio: 2.5, attack: 0.01, release: 0.3 });
    const eqNode = new Tone.EQ3({ low: -2, mid: 1, high: 5 });
    const reverb = new Tone.Reverb({ decay: 3.5, preDelay: 0.04, wet: isReverb ? 0.3 : 0 });
    const limiter = new Tone.Limiter(-1);
    const recorder = new Tone.Recorder();
    const analyser = Tone.context.createAnalyser();
    analyser.fftSize = 256;

    hpf.chain(gate, compressor, eqNode, reverb, limiter, recorder);
    Tone.connect(limiter, analyser);

    reverb.generate().catch((err) => console.error("Reverb generation failed:", err));

    chainRef.current = { hpf, gate, compressor, eq: eqNode, reverb, limiter, recorder, analyser };

    return () => {
      // Full cleanup on unmount — prevents leaked audio nodes across page navigations
      const chain = chainRef.current;
      if (chain) {
        chain.hpf.dispose();
        chain.gate.dispose();
        chain.compressor.dispose();
        chain.eq.dispose();
        chain.reverb.dispose();
        chain.limiter.dispose();
        chain.recorder.dispose();
      }
      if (micSourceRef.current) micSourceRef.current.disconnect();
      ctx.close().catch(() => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Live toggles now just adjust the persistent chain — no rebuild
  useEffect(() => {
    if (chainRef.current) chainRef.current.reverb.wet.value = isReverb ? 0.3 : 0;
  }, [isReverb]);

  useEffect(() => {
    if (chainRef.current) chainRef.current.gate.threshold = isNoiseReduction ? -40 : -100;
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

  // ==========================================================
  // 🌟 FIX 4: Tell the rest of the page a recording is active, so heavy
  // UI work (Framer Motion in LyricsViewer, scroll-progress listener,
  // word-span re-renders) can pause. This is a one-line dispatch here;
  // add a matching listener in LyricsViewer (see note below).
  // ==========================================================
  const broadcastRecordingState = (active: boolean) => {
    window.dispatchEvent(new CustomEvent("bhajan-recording-state", { detail: { active } }));
  };

  const startRecording = async () => {
    try {
      await Tone.start();

      // 🌟 FIX 5: Drop the hard sampleRate constraint. Forcing 44100 when the
      // context/device is actually running at 48000 forces a real-time
      // resample right at the front of the chain — a classic crackle
      // source. Let the browser give you its native rate; "ideal" (not a
      // hard constraint) avoids getUserMedia rejecting/downgrading too.
      const constraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      setRecordingDuration(0);
      logEvent("studio_record_start", { bhajan_slug: bhajanSlug });

      const chain = chainRef.current;
      if (!chain) throw new Error("Audio chain not initialized");

      const micSource = Tone.context.createMediaStreamSource(stream);
      micSourceRef.current = micSource;
      Tone.connect(micSource, chain.hpf);

      broadcastRecordingState(true);

      // Throttled canvas visualizer — only runs while RECORDING, ~30fps
      const canvas = canvasRef.current;
      if (canvas) {
        const canvasCtx = canvas.getContext("2d");
        const bufferLength = chain.analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        let frameCount = 0;

        const draw = () => {
          if (!canvasCtx || !canvas) return;
          animationFrameRef.current = requestAnimationFrame(draw);
          frameCount++;
          if (frameCount % 2 !== 0) return;

          chain.analyser.getByteFrequencyData(dataArray);
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

      chain.recorder.start();
      setRecordingState("RECORDING");
    } catch (err) {
      console.error("Studio initialization failed:", err);
      alert("कृपया ब्राउज़र सेटिंग्स में माइक (Microphone) की अनुमति दें।");
    }
  };

  const stopRecording = async () => {
    const chain = chainRef.current;
    if (chain && recordingState === "RECORDING") {
      const recordingBlob = await chain.recorder.stop();
      finalAudioBlobRef.current = recordingBlob;

      const url = URL.createObjectURL(recordingBlob);
      setAudioUrl(url);
      setRecordingState("PREVIEW");

      broadcastRecordingState(false);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      // Disconnect (don't dispose) the mic source — it's per-session, chain nodes stay alive
      if (micSourceRef.current) {
        micSourceRef.current.disconnect();
        micSourceRef.current = null;
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
              <input
                type="text"
                placeholder="आपका शुभ नाम..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full sm:w-40 bg-white dark:bg-black/30 border border-orange-200 dark:border-white/10 px-4 py-2 rounded-full text-xs font-hindi outline-none focus:border-orange-500 transition-colors"
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
  );
}