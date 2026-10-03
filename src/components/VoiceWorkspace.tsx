import React, { useState, useRef, useEffect } from 'react';
import {
  Mic,
  MicOff,
  Upload,
  Play,
  Pause,
  Copy,
  Check,
  Download,
  Send,
  Loader2,
  Sparkles,
  Radio,
  FileAudio,
  User,
  ListOrdered,
} from 'lucide-react';
import { TranscriptionResult } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { CopyButton } from './CopyButton';

interface VoiceWorkspaceProps {
  onSendToWriter: (text: string) => void;
  onSaveHistory: (title: string, preview: string, data: TranscriptionResult) => void;
}

export const VoiceWorkspace: React.FC<VoiceWorkspaceProps> = ({
  onSendToWriter,
  onSaveHistory,
}) => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const isDark = theme === 'dark';

  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingDuration, setRecordingDuration] = useState<number>(0);
  const [audioBlobUrl, setAudioBlobUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [audioMimeType, setAudioMimeType] = useState<string>('audio/webm');
  const [dialectNormalization, setDialectNormalization] = useState<boolean>(true);
  const [speakerDiarization, setSpeakerDiarization] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [activeTranscriptView, setActiveTranscriptView] = useState<'verbatim' | 'normalized'>('normalized');

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const transcriptContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  useEffect(() => {
    if (result && transcriptContainerRef.current) {
      gsap.fromTo(
        transcriptContainerRef.current.children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [result]);

  const startRecording = async () => {
    setError(null);
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      analyserRef.current = analyser;

      drawVisualizer();

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4',
      });
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: mediaRecorder.mimeType,
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioBlobUrl(url);
        setAudioMimeType(audioBlob.type);

        const reader = new FileReader();
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };
        reader.readAsDataURL(audioBlob);

        stream.getTracks().forEach((track) => track.stop());
        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (err: unknown) {
      console.error('Microphone error:', err);
      setError(language === 'en' ? 'Microphone access denied. Please grant permission or upload an audio file.' : 'মাইক্রোফোন অ্যাক্সেস করতে সমস্যা হয়েছে। অনুগ্রহ করে ব্রাউজারে অনুমতি দিন বা অডিও ফাইল আপলোড করুন।');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const drawVisualizer = () => {
    if (!canvasRef.current || !analyserRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const analyser = analyserRef.current;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const render = () => {
      animationFrameRef.current = requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barWidth = (canvas.width / bufferLength) * 2.2;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const barHeight = (dataArray[i] / 255) * canvas.height;
        ctx.fillStyle = isDark ? '#2dd4bf' : '#0f766e';
        ctx.fillRect(x, canvas.height - barHeight, barWidth - 2, barHeight);
        x += barWidth;
      }
    };
    render();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setResult(null);

    const url = URL.createObjectURL(file);
    setAudioBlobUrl(url);
    setAudioMimeType(file.type || 'audio/mp3');

    const reader = new FileReader();
    reader.onloadend = () => {
      setAudioBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const runTranscription = async () => {
    if (!audioBase64) {
      setError(language === 'en' ? 'Please record speech or upload an audio file first.' : 'অনুগ্রহ করে আগে কণ্ঠ রেকর্ড করুন অথবা অডিও ফাইল যুক্ত করুন।');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          mimeType: audioMimeType,
          dialectNormalization,
          speakerDiarization,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      const data: TranscriptionResult = await response.json();
      setResult(data);

      const title = data.detectedDialect || (language === 'en' ? 'Bangla Voice Transcript' : 'বাংলা ভয়েস ট্রান্সক্রিপ্ট');
      const preview = (data.fullTranscript || '').slice(0, 100);
      onSaveHistory(title, preview, data);
    } catch (err: unknown) {
      console.error('Transcription error:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`${language === 'en' ? 'Transcription failed:' : 'ভয়েস ট্রান্সক্রিপশন ব্যর্থ হয়েছে:'} ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAudioPlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlayingAudio) {
      audioPlayerRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioPlayerRef.current.playbackRate = playbackSpeed;
      audioPlayerRef.current.play();
      setIsPlayingAudio(true);
    }
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = speed;
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const text = result?.normalizedTranscript || result?.fullTranscript;
    if (!text) return;
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bangla_voice_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-600/5 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-700 dark:text-teal-400 mb-1 tracking-wide font-semibold">
              <span>{t.voiceModuleBadge}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-3 ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-sky-500/10 dark:bg-sky-500/15 border border-sky-500/25 dark:border-sky-500/35 flex items-center justify-center text-sky-700 dark:text-sky-400 shrink-0 shadow-2xs">
                <Mic className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span>{t.voiceTitle}</span>
            </h1>
            <p className={`text-stone-600 dark:text-neutral-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
              {t.voiceDescription}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <button
              onClick={runTranscription}
              disabled={isLoading || !audioBase64 || isRecording}
              className="w-full sm:w-auto justify-center flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white dark:bg-gradient-to-r dark:from-teal-500 dark:to-emerald-600 dark:hover:from-teal-400 dark:hover:to-emerald-500 disabled:opacity-40 dark:text-neutral-950 font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white dark:text-neutral-950" />
                  <span>{t.voiceProcessing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white dark:text-neutral-950" />
                  <span>{t.voiceProcessBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Dialect and Speaker Diarization Config */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 glass-panel rounded-xl border border-stone-200/90 dark:border-white/[0.07] text-xs">
        <div className="flex items-center gap-5 flex-wrap">
          <label className="flex items-center gap-2.5 cursor-pointer select-none text-stone-800 dark:text-neutral-300 font-medium">
            <input
              type="checkbox"
              checked={dialectNormalization}
              onChange={(e) => setDialectNormalization(e.target.checked)}
              className="w-4 h-4 rounded bg-stone-100 border-stone-300 dark:bg-white/[0.05] dark:border-white/[0.1] text-teal-700 dark:text-teal-500 focus:ring-teal-400"
            />
            <span>{t.voiceDialectNorm}</span>
          </label>

          <label className="flex items-center gap-2.5 cursor-pointer select-none text-stone-800 dark:text-neutral-300 font-medium">
            <input
              type="checkbox"
              checked={speakerDiarization}
              onChange={(e) => setSpeakerDiarization(e.target.checked)}
              className="w-4 h-4 rounded bg-stone-100 border-stone-300 dark:bg-white/[0.05] dark:border-white/[0.1] text-teal-700 dark:text-teal-500 focus:ring-teal-400"
            />
            <span>{t.voiceSpeakerDiarization}</span>
          </label>
        </div>

        <div className="text-stone-500 dark:text-neutral-400 font-mono text-[11px]">
          AUDIO INGEST: WAV / MP3 / WEBM
        </div>
      </div>

      {/* Error Alert */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-200 text-xs sm:text-sm flex items-center justify-between"
          >
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="text-red-700 dark:text-red-400 hover:underline text-xs ml-2 font-medium"
            >
              {t.ocrClose}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Studio Viewport */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side: Recording Console & Player */}
        <div className="glass-panel rounded-2xl flex flex-col min-h-[360px] sm:min-h-[440px] lg:h-[560px] overflow-hidden border border-stone-200/90 dark:border-white/[0.07]">
          <div className="p-3.5 border-b border-stone-200/80 dark:border-white/[0.06] bg-stone-100/80 dark:bg-black/20 flex items-center justify-between">
            <span className="text-xs font-bold text-stone-800 dark:text-neutral-300 flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.voiceConsoleTitle}</span>
            </span>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="audio/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 text-xs text-stone-700 hover:text-stone-950 hover:bg-stone-200/70 dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-white/[0.05] px-2.5 py-1 rounded-lg transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>{t.voiceUploadAudio}</span>
            </button>
          </div>

          <div className="flex-1 p-6 flex flex-col items-center justify-center space-y-6">
            {/* Live Waveform Canvas */}
            <div className="w-full max-w-md h-24 bg-stone-100/80 dark:bg-black/40 rounded-xl border border-stone-200/90 dark:border-white/[0.06] flex items-center justify-center p-3 overflow-hidden shadow-inner">
              <canvas
                ref={canvasRef}
                width={360}
                height={80}
                className="w-full h-full block"
              />
            </div>

            {/* Recording Timer & Status */}
            <div className="text-center">
              <div className="text-3xl font-mono tabular-nums text-stone-900 dark:text-white font-bold tracking-wider">
                {formatSeconds(recordingDuration)}
              </div>
              <div className="text-xs text-stone-500 dark:text-neutral-500 mt-1">
                {isRecording ? (
                  <span className="text-rose-700 dark:text-rose-400 flex items-center justify-center gap-2 font-semibold">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse"></span>
                    {t.voiceRecordingActive}
                  </span>
                ) : audioBlobUrl ? (
                  <span className="text-teal-700 dark:text-teal-400 font-semibold">{t.voiceAudioReady}</span>
                ) : (
                  t.voiceRecordPrompt
                )}
              </div>
            </div>

            {/* Recording Controls */}
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  className="w-16 h-16 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white flex items-center justify-center shadow-lg shadow-rose-900/20 dark:shadow-red-950/60 transition-all hover:scale-105 active:scale-95"
                  title={t.voiceStartRecord}
                >
                  <Mic className="w-7 h-7" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="w-16 h-16 rounded-2xl bg-stone-800 hover:bg-stone-900 text-rose-400 border border-rose-500/50 flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
                  title={t.voiceStopRecord}
                >
                  <MicOff className="w-7 h-7" />
                </button>
              )}
            </div>

            {/* Audio Playback Player */}
            {audioBlobUrl && (
              <div className="w-full max-w-md p-3.5 glass-panel-subtle border border-stone-200/90 dark:border-white/[0.06] rounded-xl flex items-center gap-3.5 shadow-2xs">
                <button
                  onClick={toggleAudioPlayback}
                  className="w-10 h-10 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-neutral-950 flex items-center justify-center transition-colors shrink-0 shadow-xs"
                >
                  {isPlayingAudio ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4 ml-0.5" />
                  )}
                </button>

                <audio
                  ref={audioPlayerRef}
                  src={audioBlobUrl}
                  onEnded={() => setIsPlayingAudio(false)}
                  className="hidden"
                />

                <div className="flex-1 text-xs min-w-0">
                  <div className="text-stone-900 dark:text-white font-semibold truncate font-bangla">
                    {language === 'en' ? 'Recorded / Uploaded Audio Track' : 'রেকর্ডকৃত বা আপলোডকৃত বাংলা অডিও'}
                  </div>
                  <div className="text-stone-500 dark:text-neutral-400 text-[11px] font-mono mt-0.5">
                    {audioMimeType}
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-stone-200/60 dark:bg-white/[0.04] p-1 rounded-lg border border-stone-300/60 dark:border-white/[0.06]">
                  {[1, 1.25, 1.5].map((spd) => (
                    <button
                      key={spd}
                      onClick={() => handleSpeedChange(spd)}
                      className={`px-1.5 py-0.5 text-[10px] font-mono rounded ${
                        playbackSpeed === spd
                          ? 'bg-teal-700 text-white dark:bg-teal-500 dark:text-neutral-950 font-bold'
                          : 'text-stone-600 dark:text-neutral-400 hover:text-stone-950 dark:hover:text-white'
                      }`}
                    >
                      {spd}x
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Transcript Result */}
        <div className="glass-panel rounded-2xl flex flex-col min-h-[380px] sm:min-h-[440px] lg:h-[560px] overflow-hidden border border-stone-200/90 dark:border-white/[0.07]">
          <div className="p-3.5 border-b border-stone-200/80 dark:border-white/[0.06] bg-stone-100/80 dark:bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <FileAudio className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>{t.voiceTranscriptTitle}</span>
              </span>
              {result?.detectedDialect && (
                <span className="text-[11px] text-teal-800 bg-teal-50 border border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800/40 px-2 py-0.5 rounded-md font-semibold">
                  {result.detectedDialect}
                </span>
              )}
            </div>

            {result && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() =>
                    handleCopyText(result.normalizedTranscript || result.fullTranscript)
                  }
                  className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-200/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.06] rounded-lg transition-colors text-xs flex items-center gap-1"
                  title={t.ocrCopy}
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span className="hidden sm:inline text-[11px]">{copied ? t.ocrCopied : t.ocrCopy}</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadTxt}
                  className="p-1.5 text-stone-600 hover:text-stone-950 hover:bg-stone-200/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.06] rounded-lg transition-colors"
                  title={t.ocrDownload}
                >
                  <Download className="w-3.5 h-3.5" />
                </button>

                <button
                  type="button"
                  onClick={() =>
                    onSendToWriter(result.normalizedTranscript || result.fullTranscript)
                  }
                  className="px-3 py-1.5 bg-teal-700/10 hover:bg-teal-700/20 text-teal-800 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 dark:text-teal-300 border border-teal-700/20 dark:border-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                  title={t.ocrSendToWriter}
                >
                  <Send className="w-3 h-3" />
                  <span>{t.ocrSendToWriter}</span>
                </button>
              </div>
            )}
          </div>

          <div
            ref={transcriptContainerRef}
            className="flex-1 overflow-auto p-5 space-y-4 font-bangla text-stone-800 dark:text-neutral-200 text-sm leading-relaxed"
          >
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3.5 text-stone-500 dark:text-neutral-400">
                <Loader2 className="w-9 h-9 animate-spin text-teal-700 dark:text-teal-400" />
                <p className="text-xs">{t.voiceProcessing}</p>
              </div>
            ) : result ? (
              <>
                {/* Summary Box */}
                {result.summary && (
                  <div className="glass-panel-subtle rounded-xl p-3.5 border border-stone-200/90 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider">
                        {t.voiceSummaryHeader}
                      </div>
                      <CopyButton
                        text={result.summary}
                        size="xs"
                        variant="subtle"
                        showLabel
                        label={language === 'en' ? 'Copy Summary' : 'সারসংক্ষেপ কপি'}
                      />
                    </div>
                    <p className="text-xs text-stone-700 dark:text-neutral-300 leading-relaxed font-bangla">
                      {result.summary}
                    </p>
                  </div>
                )}

                {/* Dialect Normalization Toggle if applicable */}
                {result.normalizedTranscript && result.normalizedTranscript !== result.fullTranscript && (
                  <div className="flex items-center gap-1.5 p-1 bg-stone-100 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.06] rounded-xl text-xs">
                    <button
                      onClick={() => setActiveTranscriptView('normalized')}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs transition-all ${
                        activeTranscriptView === 'normalized'
                          ? 'bg-white text-stone-900 border border-stone-200 shadow-2xs font-semibold dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
                          : 'text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white'
                      }`}
                    >
                      {t.voiceViewStandard}
                    </button>
                    <button
                      onClick={() => setActiveTranscriptView('verbatim')}
                      className={`flex-1 py-1.5 px-2.5 rounded-lg text-xs transition-all ${
                        activeTranscriptView === 'verbatim'
                          ? 'bg-white text-stone-900 border border-stone-200 shadow-2xs font-semibold dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30'
                          : 'text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white'
                      }`}
                    >
                      {t.voiceViewVerbatim}
                    </button>
                  </div>
                )}

                {/* Speaker Diarization List or Main Transcript */}
                {result.speakers && result.speakers.length > 1 ? (
                  <div className="glass-panel-subtle rounded-xl overflow-hidden border border-stone-200/90 dark:border-white/[0.06]">
                    <div className="bg-stone-100/90 dark:bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-stone-900 dark:text-neutral-200 border-b border-stone-200/90 dark:border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        <span>{t.voiceSpeakerTurns}</span>
                      </div>
                      <CopyButton
                        text={() =>
                          result.speakers!
                            .map((spk) => `${spk.speaker} (${spk.timeEstimate}): ${spk.text}`)
                            .join('\n\n')
                        }
                        size="xs"
                        variant="subtle"
                        showLabel
                        label={language === 'en' ? 'Copy All Turns' : 'সকল কথন কপি'}
                      />
                    </div>

                    <div className="divide-y divide-stone-200/80 dark:divide-white/[0.04] p-2 space-y-2">
                      {result.speakers.map((spk, idx) => (
                        <div key={idx} className="p-2 space-y-1 group">
                          <div className="flex items-center justify-between text-xs text-teal-800 dark:text-teal-400 font-bold">
                            <span>{spk.speaker}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-stone-500 dark:text-neutral-500 font-mono text-[11px]">
                                {spk.timeEstimate}
                              </span>
                              <CopyButton
                                text={spk.text}
                                size="xs"
                                variant="compact"
                                className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                              />
                            </div>
                          </div>
                          <p className="text-stone-900 dark:text-neutral-100 select-text font-bangla text-sm leading-relaxed">
                            {spk.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="text-xs text-stone-700 dark:text-neutral-400 font-semibold mb-1.5 flex items-center justify-between">
                      <span>
                        {activeTranscriptView === 'normalized' && result.normalizedTranscript
                          ? t.voiceViewStandard
                          : t.voiceViewVerbatim}
                      </span>
                      <CopyButton
                        text={
                          activeTranscriptView === 'normalized' && result.normalizedTranscript
                            ? result.normalizedTranscript
                            : result.fullTranscript
                        }
                        size="xs"
                        variant="outline"
                        showLabel
                        label={t.copyToClipboard}
                        copiedLabel={t.copiedToClipboard}
                      />
                    </div>
                    <div className="p-4 bg-white dark:bg-black/40 rounded-xl border border-stone-200/90 dark:border-white/[0.06] text-stone-900 dark:text-white select-text font-bangla text-base leading-relaxed shadow-xs">
                      {activeTranscriptView === 'normalized' && result.normalizedTranscript
                        ? result.normalizedTranscript
                        : result.fullTranscript}
                    </div>
                  </div>
                )}

                {/* Key Action Items Checklist */}
                {result.keyActionItems && result.keyActionItems.length > 0 && (
                  <div className="glass-panel-subtle rounded-xl p-3.5 border border-stone-200/90 dark:border-white/[0.06] text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-stone-900 dark:text-neutral-200 font-bold flex items-center gap-2">
                        <ListOrdered className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        <span>{t.voiceActionItems}</span>
                      </div>
                      <CopyButton
                        text={() => result.keyActionItems!.map((item) => `• ${item}`).join('\n')}
                        size="xs"
                        variant="subtle"
                        showLabel
                        label={language === 'en' ? 'Copy Actions' : 'অ্যাকশন তালিকা কপি'}
                      />
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-stone-700 dark:text-neutral-300 font-bangla">
                      {result.keyActionItems.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-stone-400 dark:text-neutral-500">
                <FileAudio className="w-10 h-10 text-stone-300 dark:text-neutral-700" />
                <div>
                  <p className="text-sm font-bold text-stone-800 dark:text-neutral-300">{t.voiceEmptyTitle}</p>
                  <p className="text-xs text-stone-500 dark:text-neutral-500 mt-1 max-w-xs">
                    {t.voiceEmptyDesc}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
