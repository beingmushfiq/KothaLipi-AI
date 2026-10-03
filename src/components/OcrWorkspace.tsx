import React, { useState, useRef, useEffect } from 'react';
import {
  Upload,
  FileText,
  Copy,
  Check,
  Download,
  Volume2,
  Send,
  Loader2,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Sparkles,
  Layers,
  PenTool,
  Globe,
  Table,
  Eye,
  CheckCircle2,
  ScanText,
} from 'lucide-react';
import { OcrMode, OcrResult } from '../types';
import { SAMPLE_DOCUMENTS, getSampleDocImage } from '../data/samples';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import { useEngine } from '../context/EngineContext';
import { CopyButton } from './CopyButton';
import { requestAi, AiUnavailableError } from '../utils/aiClient';
import { deviceOcr, deviceSpeak } from '../utils/deviceAi';

interface OcrWorkspaceProps {
  onSendToWriter: (text: string) => void;
  onSaveHistory: (title: string, preview: string, data: OcrResult) => void;
}

export const OcrWorkspace: React.FC<OcrWorkspaceProps> = ({
  onSendToWriter,
  onSaveHistory,
}) => {
  const { t, language } = useLanguage();
  const { cloudUnavailable, reportCloudFailure, reportCloudSuccess } = useEngine();

  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedDocId, setSelectedDocId] = useState<string>('sample-circular');
  const [ocrMode, setOcrMode] = useState<OcrMode>('fields');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [ocrResult, setOcrResult] = useState<OcrResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [usingDeviceEngine, setUsingDeviceEngine] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resultContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initialImg = getSampleDocImage('sample-circular');
    setSelectedImage(initialImg);
  }, []);

  useEffect(() => {
    if (ocrResult && resultContainerRef.current) {
      gsap.fromTo(
        resultContainerRef.current.children,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [ocrResult]);

  const handleSelectSample = (docId: string) => {
    setSelectedDocId(docId);
    const sample = SAMPLE_DOCUMENTS.find((d) => d.id === docId);
    if (sample) {
      setOcrMode(sample.defaultMode);
      const img = getSampleDocImage(docId);
      setSelectedImage(img);
      setOcrResult(null);
      setError(null);
      setZoomLevel(1);
      setRotation(0);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedDocId('');
    setError(null);

    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      setOcrResult(null);
      setZoomLevel(1);
      setRotation(0);
    };
    reader.onerror = () => {
      setError(language === 'en' ? 'Failed to load image. Please select another image file.' : 'ছবি লোড করতে সমস্যা হয়েছে। অনুগ্রহ করে অন্য ছবি নির্বাচন করুন।');
    };
    reader.readAsDataURL(file);
  };

  const runOcr = async () => {
    if (!selectedImage) {
      setError(language === 'en' ? 'Please upload a scanned document or select a sample.' : 'অনুগ্রহ করে একটি স্ক্যান করা ছবি আপলোড করুন অথবা স্যাম্পল বেছে নিন।');
      return;
    }

    setIsLoading(true);
    setError(null);
    setAudioUrl(null);

    const mimeType = selectedImage.startsWith('data:image/png')
      ? 'image/png'
      : 'image/jpeg';

    const finish = (data: OcrResult, titleFallback: string) => {
      setOcrResult(data);
      const title = data.documentType || titleFallback;
      onSaveHistory(title, (data.fullExtractedText || '').slice(0, 120), data);
    };

    const titleFallback = selectedDocId
      ? SAMPLE_DOCUMENTS.find((d) => d.id === selectedDocId)?.title || 'Bangla Document OCR'
      : 'Uploaded Document';

    // Tier 1: Cloud AI (skipped entirely when we already know it is unavailable)
    if (!cloudUnavailable) {
      try {
        const data = await requestAi<OcrResult>('/api/ocr', {
          imageBase64: selectedImage,
          mimeType,
          mode: ocrMode,
        });
        reportCloudSuccess();
        setUsingDeviceEngine(false);
        finish(data, titleFallback);
        return;
      } catch (err) {
        reportCloudFailure(err);
        // Only fall through to the on-device engine for availability failures.
        if (!(err instanceof AiUnavailableError) || !err.canDegrade) {
          const message = err instanceof Error ? err.message : 'An unexpected error occurred';
          setError(`${t.ocrErrorPrefix} ${message}`);
          setIsLoading(false);
          return;
        }
      }
    }

    // Tier 2: On-device OCR (Tesseract.js) — free, no API key, lower accuracy
    try {
      setUsingDeviceEngine(true);
      const data = await deviceOcr(selectedImage, ocrMode);
      finish(data, titleFallback);
    } catch (err) {
      console.error('On-device OCR Error:', err);
      const message = err instanceof Error ? err.message : 'On-device OCR failed';
      setError(`${t.ocrErrorPrefix} ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = () => {
    if (!ocrResult?.fullExtractedText) return;
    navigator.clipboard.writeText(ocrResult.fullExtractedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    if (!ocrResult?.fullExtractedText) return;
    const blob = new Blob([ocrResult.fullExtractedText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bangla_ocr_${Date.now()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handlePlayTTS = async () => {
    if (!ocrResult?.fullExtractedText) return;

    if (audioUrl) {
      if (audioRef.current) {
        if (isPlayingAudio) {
          audioRef.current.pause();
          setIsPlayingAudio(false);
        } else {
          audioRef.current.play();
          setIsPlayingAudio(true);
        }
      }
      return;
    }

    try {
      setIsPlayingAudio(true);
      const ttsData = await requestAi<{ audioBase64?: string; mimeType?: string }>('/api/tts', {
        text: ocrResult.fullExtractedText.slice(0, 400),
      });

      if (ttsData.audioBase64) {
        const audioSrc = `data:${ttsData.mimeType || 'audio/wav'};base64,${ttsData.audioBase64}`;
        setAudioUrl(audioSrc);
        const audio = new Audio(audioSrc);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.play();
      } else {
        throw new AiUnavailableError('UPSTREAM_ERROR', 'No audio returned');
      }
    } catch (err) {
      reportCloudFailure(err);
      // On-device speech synthesis fallback (no key, no network)
      try {
        await deviceSpeak(ocrResult.fullExtractedText.slice(0, 600));
      } finally {
        setIsPlayingAudio(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-600/5 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-700 dark:text-teal-400 mb-1 tracking-wide font-semibold">
              <span>{t.ocrModuleBadge}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-3 ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/15 border border-teal-500/25 dark:border-teal-500/35 flex items-center justify-center text-teal-700 dark:text-teal-400 shrink-0 shadow-2xs">
                <ScanText className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span>{t.ocrTitle}</span>
            </h1>
            <p className={`text-stone-600 dark:text-neutral-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
              {t.ocrDescription}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 sm:flex-initial justify-center flex items-center gap-2 px-3.5 py-2.5 bg-white hover:bg-stone-100 text-stone-800 border-stone-300 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-200 text-xs sm:text-sm font-medium rounded-xl border dark:border-white/[0.08] transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xs"
            >
              <Upload className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.ocrUploadBtn}</span>
            </button>
            <button
              onClick={runOcr}
              disabled={isLoading || !selectedImage}
              className="flex-1 sm:flex-initial justify-center flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white dark:bg-gradient-to-r dark:from-teal-500 dark:to-emerald-600 dark:hover:from-teal-400 dark:hover:to-emerald-500 disabled:opacity-40 dark:text-neutral-950 font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white dark:text-neutral-950" />
                  <span>{t.ocrProcessing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white dark:text-neutral-950" />
                  <span>{t.ocrStartBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Sample Document Showcase bar */}
        <div className="mt-5 pt-4 border-t border-stone-200/80 dark:border-white/[0.06] flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-stone-600 dark:text-neutral-400 font-semibold mr-1">
            {t.ocrSampleLabel}
          </span>
          {SAMPLE_DOCUMENTS.map((doc) => {
            const isSelected = selectedDocId === doc.id;
            return (
              <button
                key={doc.id}
                onClick={() => handleSelectSample(doc.id)}
                className={`group px-3 py-1.5 rounded-lg text-xs font-bangla transition-all border flex items-center gap-2 ${
                  isSelected
                    ? 'bg-teal-700/10 border-teal-700/30 text-teal-800 font-semibold dark:bg-teal-500/15 dark:border-teal-500/40 dark:text-teal-300 shadow-2xs'
                    : 'bg-white hover:bg-stone-50 text-stone-600 border-stone-200 dark:bg-white/[0.02] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-white/[0.05]'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 transition-colors" />
                <span>{doc.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Switcher Segmented Control */}
      <div className="flex items-center justify-start sm:justify-center gap-2 p-1.5 bg-stone-200/60 dark:bg-white/[0.03] border border-stone-300/80 dark:border-white/[0.08] rounded-2xl overflow-x-auto relative w-full sm:w-fit sm:mx-auto shadow-xs">
        <button
          type="button"
          onClick={() => setOcrMode('fields')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            ocrMode === 'fields'
              ? 'bg-emerald-500/15 text-emerald-950 border-emerald-500/50 shadow-xs dark:bg-emerald-500/20 dark:text-emerald-200 dark:border-emerald-400/50 ring-1 ring-emerald-500/20 scale-[1.02]'
              : 'border-transparent text-stone-600 hover:text-emerald-800 hover:bg-emerald-500/10 dark:text-neutral-400 dark:hover:text-emerald-300 dark:hover:bg-emerald-500/10'
          }`}
        >
          <Table className={`w-3.5 h-3.5 ${ocrMode === 'fields' ? 'text-emerald-600 dark:text-emerald-400' : 'text-stone-500 dark:text-neutral-400'}`} />
          <span>{t.ocrModeFields}</span>
          {ocrMode === 'fields' && (
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setOcrMode('full')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            ocrMode === 'full'
              ? 'bg-sky-500/15 text-sky-950 border-sky-500/50 shadow-xs dark:bg-sky-500/20 dark:text-sky-200 dark:border-sky-400/50 ring-1 ring-sky-500/20 scale-[1.02]'
              : 'border-transparent text-stone-600 hover:text-sky-800 hover:bg-sky-500/10 dark:text-neutral-400 dark:hover:text-sky-300 dark:hover:bg-sky-500/10'
          }`}
        >
          <Layers className={`w-3.5 h-3.5 ${ocrMode === 'full' ? 'text-sky-600 dark:text-sky-400' : 'text-stone-500 dark:text-neutral-400'}`} />
          <span>{t.ocrModeFull}</span>
          {ocrMode === 'full' && (
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setOcrMode('handwritten')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            ocrMode === 'handwritten'
              ? 'bg-amber-500/15 text-amber-950 border-amber-500/50 shadow-xs dark:bg-amber-500/20 dark:text-amber-200 dark:border-amber-400/50 ring-1 ring-amber-500/20 scale-[1.02]'
              : 'border-transparent text-stone-600 hover:text-amber-800 hover:bg-amber-500/10 dark:text-neutral-400 dark:hover:text-amber-300 dark:hover:bg-amber-500/10'
          }`}
        >
          <PenTool className={`w-3.5 h-3.5 ${ocrMode === 'handwritten' ? 'text-amber-600 dark:text-amber-400' : 'text-stone-500 dark:text-neutral-400'}`} />
          <span>{t.ocrModeHandwritten}</span>
          {ocrMode === 'handwritten' && (
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse ml-0.5" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setOcrMode('bilingual')}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            ocrMode === 'bilingual'
              ? 'bg-purple-500/15 text-purple-950 border-purple-500/50 shadow-xs dark:bg-purple-500/20 dark:text-purple-200 dark:border-purple-400/50 ring-1 ring-purple-500/20 scale-[1.02]'
              : 'border-transparent text-stone-600 hover:text-purple-800 hover:bg-purple-500/10 dark:text-neutral-400 dark:hover:text-purple-300 dark:hover:bg-purple-500/10'
          }`}
        >
          <Globe className={`w-3.5 h-3.5 ${ocrMode === 'bilingual' ? 'text-purple-600 dark:text-purple-400' : 'text-stone-500 dark:text-neutral-400'}`} />
          <span>{t.ocrModeBilingual}</span>
          {ocrMode === 'bilingual' && (
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse ml-0.5" />
          )}
        </button>
      </div>

      {/* Error Banner */}
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
        {/* Left Side: Document Viewer */}
        <div className="glass-panel rounded-2xl overflow-hidden flex flex-col h-[340px] sm:h-[460px] lg:h-[650px] border border-stone-200/90 dark:border-white/[0.07]">
          {/* Viewer Toolbar */}
          <div className="p-3.5 border-b border-stone-200/80 dark:border-white/[0.06] bg-stone-100/80 dark:bg-black/20 flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-800 dark:text-neutral-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-teal-700 dark:text-teal-400" />
              <span>{t.ocrOriginalDoc}</span>
            </span>

            <div className="flex items-center gap-1 bg-white dark:bg-white/[0.03] border border-stone-300/80 dark:border-white/[0.06] rounded-lg p-0.5 shadow-2xs">
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                className="p-1.5 text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-neutral-200 rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] tabular-nums font-mono text-stone-700 dark:text-neutral-300 w-10 text-center font-medium">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoomLevel((z) => Math.min(2.4, z + 0.2))}
                className="p-1.5 text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-neutral-200 rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setRotation((r) => (r + 90) % 360)}
                className="p-1.5 text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-neutral-200 rounded transition-colors"
                title="Rotate 90°"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Document Canvas Body */}
          <div className="flex-1 overflow-auto p-4 sm:p-6 flex items-center justify-center bg-stone-100/60 dark:bg-[#05070a]/90 relative">
            {selectedImage ? (
              <div
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
                className="paper-card rounded-md max-w-full select-none"
              >
                <img
                  src={selectedImage}
                  alt="Scanned Bengali Document"
                  referrerPolicy="no-referrer"
                  className="max-h-[520px] w-auto object-contain block rounded-sm shadow-xl"
                />
              </div>
            ) : (
              <div className="text-center p-8 text-stone-500 dark:text-neutral-500 text-xs">
                {t.ocrEmptyTitle}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Linguistic Extraction */}
        <div className="glass-panel rounded-2xl flex flex-col min-h-[380px] lg:h-[650px] overflow-hidden border border-stone-200/90 dark:border-white/[0.07]">
          {/* Output Toolbar */}
          <div className="p-3.5 border-b border-stone-200/80 dark:border-white/[0.06] bg-stone-100/80 dark:bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>{t.ocrExtractedData}</span>
              </span>
              {ocrResult?.confidenceScore && (
                <span className="text-[11px] tabular-nums font-mono text-teal-800 bg-teal-50 border border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800/40 px-2 py-0.5 rounded-md font-semibold">
                  {ocrResult.confidenceScore}% {t.ocrAccuracy}
                </span>
              )}
              {usingDeviceEngine && ocrResult && (
                <span className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 dark:text-amber-300 dark:bg-amber-950/40 dark:border-amber-800/40 px-2 py-0.5 rounded-md font-semibold">
                  {language === 'en' ? 'On-device' : 'অন-ডিভাইস'}
                </span>
              )}
            </div>

            {/* Quick Export Actions */}
            {ocrResult && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handlePlayTTS}
                  className={`p-1.5 rounded-lg transition-colors text-xs flex items-center gap-1 ${
                    isPlayingAudio
                      ? 'bg-teal-700 text-white font-medium dark:bg-teal-500 dark:text-neutral-950'
                      : 'text-stone-600 hover:text-stone-950 hover:bg-stone-200/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.06]'
                  }`}
                  title={t.ocrListen}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">{t.ocrListen}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyText}
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
                  onClick={() => onSendToWriter(ocrResult.fullExtractedText)}
                  className="px-3 py-1.5 bg-teal-700/10 hover:bg-teal-700/20 text-teal-800 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 dark:text-teal-300 border border-teal-700/20 dark:border-teal-500/30 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all hover:scale-[1.02]"
                  title={t.ocrSendToWriter}
                >
                  <Send className="w-3 h-3" />
                  <span>{t.ocrSendToWriter}</span>
                </button>
              </div>
            )}
          </div>

          {/* Extracted Content Body */}
          <div
            ref={resultContainerRef}
            className="flex-1 overflow-auto p-5 space-y-4 font-bangla text-stone-800 dark:text-neutral-200 text-sm leading-relaxed"
          >
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3.5 text-stone-500 dark:text-neutral-400">
                <Loader2 className="w-9 h-9 animate-spin text-teal-700 dark:text-teal-400" />
                <p className="text-xs">{t.ocrProcessing}</p>
              </div>
            ) : ocrResult ? (
              <>
                {/* Summary Context */}
                {ocrResult.summary && (
                  <div className="glass-panel-subtle rounded-xl p-3.5 border border-stone-200/90 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider">
                        {t.ocrSummaryHeader}
                      </div>
                      <CopyButton
                        text={ocrResult.summary}
                        size="xs"
                        variant="subtle"
                        showLabel
                        label={language === 'en' ? 'Copy Summary' : 'সারসংক্ষেপ কপি'}
                      />
                    </div>
                    <p className="text-xs text-stone-700 dark:text-neutral-300 leading-relaxed">
                      {ocrResult.summary}
                    </p>
                  </div>
                )}

                {/* Structured Key-Value Fields */}
                {ocrResult.fields && ocrResult.fields.length > 0 && (
                  <div className="glass-panel-subtle rounded-xl overflow-hidden border border-stone-200/90 dark:border-white/[0.06]">
                    <div className="bg-stone-100/90 dark:bg-white/[0.03] px-3.5 py-2 text-xs font-bold text-stone-900 dark:text-neutral-200 border-b border-stone-200/90 dark:border-white/[0.06] flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{t.ocrStructuredFields}</span>
                        <span className="text-[10px] font-mono text-stone-500 dark:text-neutral-400">
                          {ocrResult.fields.length} {t.ocrFieldsCount}
                        </span>
                      </div>
                      <CopyButton
                        text={() => ocrResult.fields!.map((f) => `${f.label}: ${f.value}`).join('\n')}
                        size="xs"
                        variant="subtle"
                        showLabel
                        label={language === 'en' ? 'Copy Fields' : 'ফিল্ডসমূহ কপি'}
                      />
                    </div>
                    <div className="divide-y divide-stone-200/80 dark:divide-white/[0.04]">
                      {ocrResult.fields.map((field, idx) => (
                        <div
                          key={idx}
                          className="px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-start justify-between gap-1 text-xs hover:bg-stone-50 dark:hover:bg-white/[0.02] transition-colors group"
                        >
                          <span className="text-stone-600 dark:text-neutral-400 font-semibold sm:w-1/3">
                            {field.label}:
                          </span>
                          <div className="sm:w-2/3 flex items-center justify-between gap-2">
                            <span className="text-stone-900 dark:text-white select-text">
                              {field.value}
                            </span>
                            <CopyButton
                              text={field.value}
                              size="xs"
                              variant="compact"
                              className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Handwriting Ambiguity Notes */}
                {ocrResult.clarifications && ocrResult.clarifications.length > 0 && (
                  <div className="rounded-xl p-3.5 bg-amber-50/90 dark:bg-amber-950/20 border border-amber-300 dark:border-amber-500/30 text-xs">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                        <PenTool className="w-3.5 h-3.5" />
                        <span>{t.ocrHandwritingNotes}</span>
                      </div>
                      <CopyButton
                        text={() =>
                          ocrResult.clarifications!
                            .map((c) => `"${c.ambiguousWord}" ➔ ${c.alternative} (${c.context})`)
                            .join('\n')
                        }
                        size="xs"
                        variant="subtle"
                        showLabel
                        label={language === 'en' ? 'Copy Notes' : 'নোট কপি'}
                      />
                    </div>
                    <ul className="space-y-1 text-stone-700 dark:text-neutral-300">
                      {ocrResult.clarifications.map((c, i) => (
                        <li key={i} className="flex items-start gap-1">
                          <span className="text-amber-800 dark:text-amber-200 font-semibold">"{c.ambiguousWord}"</span>
                          <span>➔</span>
                          <strong className="text-teal-800 dark:text-teal-300 font-bold">{c.alternative}</strong>
                          <span className="text-stone-500 dark:text-neutral-400 text-[11px]">({c.context})</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Bilingual English Translation */}
                {ocrResult.englishTranslation && (
                  <div className="glass-panel-subtle rounded-xl p-3.5 border border-stone-200/90 dark:border-white/[0.06]">
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-[11px] font-mono text-teal-700 dark:text-teal-400 font-bold uppercase tracking-wider">
                        {t.ocrEnglishTranslation}
                      </div>
                      <CopyButton
                        text={ocrResult.englishTranslation}
                        size="xs"
                        variant="subtle"
                        showLabel
                        label={language === 'en' ? 'Copy Translation' : 'অনুবাদ কপি'}
                      />
                    </div>
                    <p className="text-xs font-sans text-stone-800 dark:text-neutral-200 leading-relaxed select-text">
                      {ocrResult.englishTranslation}
                    </p>
                  </div>
                )}

                {/* Full Extracted Verbatim Text */}
                <div>
                  <div className="text-xs text-stone-700 dark:text-neutral-400 font-semibold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>{t.ocrFullText}</span>
                      <span className="text-[11px] text-stone-500 dark:text-neutral-500 font-mono tabular-nums">
                        {ocrResult.fullExtractedText.length} {t.ocrCharacters}
                      </span>
                    </span>
                    <CopyButton
                      text={ocrResult.fullExtractedText}
                      size="xs"
                      variant="outline"
                      showLabel
                      label={t.copyToClipboard}
                      copiedLabel={t.copiedToClipboard}
                    />
                  </div>
                  <div className="p-4 bg-white dark:bg-black/40 rounded-xl border border-stone-200/90 dark:border-white/[0.06] text-stone-900 dark:text-neutral-100 whitespace-pre-wrap select-text text-sm leading-relaxed shadow-xs">
                    {ocrResult.fullExtractedText}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-stone-400 dark:text-neutral-500">
                <FileText className="w-10 h-10 text-stone-300 dark:text-neutral-700" />
                <div>
                  <p className="text-sm font-bold text-stone-800 dark:text-neutral-300">{t.ocrEmptyTitle}</p>
                  <p className="text-xs text-stone-500 dark:text-neutral-500 mt-1 max-w-xs">
                    {t.ocrEmptyDesc}
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
