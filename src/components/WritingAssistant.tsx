import React, { useState, useRef, useEffect } from 'react';
import {
  PenTool,
  Sparkles,
  Check,
  Copy,
  Download,
  Volume2,
  BookOpen,
  ArrowRightLeft,
  Briefcase,
  Feather,
  Minimize2,
  Layers,
  Globe,
  Loader2,
  CheckCheck,
  AlignLeft,
  FileText,
  FileCode,
  FileType,
  Printer,
  ChevronDown,
  X,
  ArrowDownToLine,
} from 'lucide-react';
import { ProofreadMode, ProofreadResult, ProofreadChange } from '../types';

export interface SummaryResult {
  conciseSummary: string;
  bulletPoints: string[];
  keyThemes: string[];
  stats?: {
    originalWordCount: number;
    summaryWordCount: number;
    reductionPercentage: string;
    estimatedReadingTime: string;
  };
}
import { SAMPLE_WRITINGS } from '../data/samples';
import { BengaliVirtualKeyboard } from './BengaliVirtualKeyboard';
import { transliterateBengali } from '../utils/avroPhonetic';
import {
  downloadAsTxt,
  downloadAsMarkdown,
  downloadAsDocx,
  exportAsPdf,
} from '../utils/exportUtils';
import { ToneSelector } from './ToneSelector';
import { motion, AnimatePresence } from 'motion/react';
import gsap from 'gsap';
import { useLanguage } from '../context/LanguageContext';
import { CopyButton } from './CopyButton';
import { TypingOutputDisplay } from './TypingOutputDisplay';

interface WritingAssistantProps {
  initialText?: string;
  onSaveHistory: (title: string, preview: string, data: ProofreadResult) => void;
}

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
  delay = 500
): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000);
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      return res;
    } catch (err: unknown) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
  throw lastErr || new Error('Network request failed');
}

export const WritingAssistant: React.FC<WritingAssistantProps> = ({
  initialText = '',
  onSaveHistory,
}) => {
  const { t, language } = useLanguage();

  const [inputText, setInputText] = useState<string>(
    initialText || SAMPLE_WRITINGS[0].text
  );
  const [mode, setMode] = useState<ProofreadMode>('grammar_check');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<ProofreadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [avroEnabled, setAvroEnabled] = useState<boolean>(false);
  const [acceptedChanges, setAcceptedChanges] = useState<Record<number, boolean>>({});
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  // Summarize Side-Panel State
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isSummarizing, setIsSummarizing] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<SummaryResult | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [hasCopiedSummary, setHasCopiedSummary] = useState<boolean>(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const resultCardRef = useRef<HTMLDivElement>(null);
  const exportDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (result && resultCardRef.current) {
      gsap.fromTo(
        resultCardRef.current,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }
      );
    }
  }, [result]);

  // Click outside to close export menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        exportDropdownRef.current &&
        !exportDropdownRef.current.contains(e.target as Node)
      ) {
        setIsExportMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectSample = (sampleId: string) => {
    const s = SAMPLE_WRITINGS.find((item) => item.id === sampleId);
    if (s) {
      setInputText(s.text);
      setMode(s.mode);
      setResult(null);
      setError(null);
      setAcceptedChanges({});
      setIsExportMenuOpen(false);
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (avroEnabled) {
      if (val.endsWith(' ') || val.endsWith('।') || val.endsWith(',')) {
        setInputText(transliterateBengali(val));
        return;
      }
    }
    setInputText(val);
  };

  const handleInsertChar = (char: string) => {
    if (!textareaRef.current) return;
    const start = textareaRef.current.selectionStart;
    const end = textareaRef.current.selectionEnd;
    const current = inputText;
    const updated = current.substring(0, start) + char + current.substring(end);
    setInputText(updated);

    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(start + char.length, start + char.length);
      }
    }, 0);
  };

  const runProofread = async (targetMode: ProofreadMode = mode, customToneText?: string) => {
    if (!inputText.trim()) {
      setError(language === 'en' ? 'Please provide some Bengali text to review.' : 'অনুগ্রহ করে কিছু বাংলা লেখা প্রদান করুন।');
      return;
    }

    setIsLoading(true);
    setError(null);
    setMode(targetMode);

    try {
      const response = await fetchWithRetry('/api/proofread', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          mode: targetMode,
          customTone: customToneText,
        }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      const data: ProofreadResult = await response.json();
      setResult(data);
      setAcceptedChanges({});

      const titleModeMap: Record<ProofreadMode, string> = {
        grammar_check: language === 'en' ? 'Spelling & Grammar Review' : 'শুদ্ধ বানান ও ব্যাকরণ নিরীক্ষা',
        sadhu_to_cholit: language === 'en' ? 'Sadhu to Cholit Conversion' : 'সাধু থেকে চলিত রূপান্তর',
        cholit_to_sadhu: language === 'en' ? 'Cholit to Sadhu Conversion' : 'চলিত থেকে সাধু রূপান্তর',
        tone_formal: language === 'en' ? 'Professional / Formal Tone' : 'পেশাদার ও দাপ্তরিক রূপান্তর',
        tone_creative: language === 'en' ? 'Creative / Literary Tone' : 'সৃজনশীল ও সাহিত্যিক রূপান্তর',
        tone_conversational: language === 'en' ? 'Conversational Tone' : 'কথ্য ও ঘরোয়া রূপান্তর',
        tone_academic: language === 'en' ? 'Academic / Scholarly Tone' : 'অ্যাকাডেমিক ও গবেষণাধর্মী রূপান্তর',
        tone_persuasive: language === 'en' ? 'Persuasive & Compelling Tone' : 'জোরালো ও প্ররোচনামূলক বক্তব্য',
        tone_custom: language === 'en' ? `Custom Tone (${customToneText || 'Custom'})` : `পছন্দসই টোন (${customToneText || 'কাস্টম'})`,
        tone_literary: language === 'en' ? 'Literary & Aesthetic Tone' : 'সাহিত্যিক ও নান্দনিক পরিমার্জন',
        tone_casual: language === 'en' ? 'Conversational Tone' : 'সহজ ও অনানুষ্ঠানিক রূপান্তর',
        concise: language === 'en' ? 'Concise Summary & Clarity' : 'সংক্ষেপণ ও সহজবোধ্যকরণ',
        enhance_vocab: language === 'en' ? 'Enriched Vocabulary' : 'সমৃদ্ধ শব্দভাণ্ডার প্রয়োগ',
        translate_en_bn: language === 'en' ? 'English to Bengali Translation' : 'ইংরেজি থেকে বাংলা অনুবাদ',
        translate_bn_en: language === 'en' ? 'Bengali to English Translation' : 'বাংলা থেকে ইংরেজি অনুবাদ',
      };
      onSaveHistory(titleModeMap[targetMode], data.improvedText.slice(0, 100), data);
    } catch (err: unknown) {
      console.error('Proofreading Error:', err);
      const msg = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(`${language === 'en' ? 'Processing failed:' : 'প্রক্রিয়াকরণ ব্যর্থ হয়েছে:'} ${msg}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyText = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSummarize = async () => {
    if (!inputText.trim()) {
      setError(language === 'en' ? 'Please provide some text to summarize.' : 'সারসংক্ষেপ করতে কিছু বাংলা লেখা দিন।');
      return;
    }

    setIsSummarizing(true);
    setSummaryError(null);
    setIsSummaryOpen(true);

    try {
      const response = await fetchWithRetry('/api/summarize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText }),
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.error || `Server error: ${response.status}`);
      }

      const data: SummaryResult = await response.json();
      setSummaryData(data);
    } catch (err: unknown) {
      console.error('Summarize error:', err);
      const msg = err instanceof Error ? err.message : 'Summarization failed';
      setSummaryError(msg);
    } finally {
      setIsSummarizing(false);
    }
  };

  const handleExportTxt = () => {
    const textToExport = result ? result.improvedText : inputText;
    if (!textToExport.trim()) return;

    downloadAsTxt(`bangla_text_${Date.now()}.txt`, textToExport);
    setIsExportMenuOpen(false);
    setExportFeedback('TXT');
    setTimeout(() => setExportFeedback(null), 2500);
  };

  const handleExportPdf = () => {
    const textToExport = result ? result.improvedText : inputText;
    if (!textToExport.trim()) return;

    const docTitle =
      result?.analysis?.tone ||
      (language === 'en'
        ? 'Bangla Orthography & Linguistic Document'
        : 'বাংলা বানান ও ব্যাকরণ পরিমার্জন নথি');

    exportAsPdf(
      docTitle,
      textToExport,
      result ? inputText : undefined,
      result?.analysis,
      result?.changes,
      language
    );
    setIsExportMenuOpen(false);
    setExportFeedback('PDF');
    setTimeout(() => setExportFeedback(null), 2500);
  };

  const handleExportMd = () => {
    const textToExport = result ? result.improvedText : inputText;
    if (!textToExport.trim()) return;

    const docTitle =
      result?.analysis?.tone ||
      (language === 'en'
        ? 'Bangla Orthography & Linguistic Document'
        : 'বাংলা বানান ও ব্যাকরণ পরিমার্জন নথি');

    downloadAsMarkdown(
      `bangla_report_${Date.now()}.md`,
      docTitle,
      textToExport,
      result ? inputText : undefined,
      result?.analysis,
      result?.changes,
      language
    );
    setIsExportMenuOpen(false);
    setExportFeedback('MD');
    setTimeout(() => setExportFeedback(null), 2500);
  };

  const handleExportDocx = async () => {
    const textToExport = result ? result.improvedText : inputText;
    if (!textToExport.trim()) return;

    const docTitle =
      result?.analysis?.tone ||
      (language === 'en'
        ? 'Bangla Orthography & Linguistic Document'
        : 'বাংলা বানান ও ব্যাকরণ পরিমার্জন নথি');

    await downloadAsDocx(
      `bangla_document_${Date.now()}.docx`,
      docTitle,
      textToExport,
      result ? inputText : undefined,
      result?.analysis,
      result?.changes,
      language
    );
    setIsExportMenuOpen(false);
    setExportFeedback('DOCX');
    setTimeout(() => setExportFeedback(null), 2500);
  };

  const handleApplySingleChange = (index: number, change: ProofreadChange) => {
    setAcceptedChanges((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const handleApplyAllChanges = () => {
    if (!result?.changes) return;
    const allAccepted: Record<number, boolean> = {};
    result.changes.forEach((_, idx) => {
      allAccepted[idx] = true;
    });
    setAcceptedChanges(allAccepted);
    setInputText(result.improvedText);
  };

  const handlePlayTTS = async (customText?: string | React.MouseEvent) => {
    const textToSpeak = typeof customText === 'string' ? customText : (result ? result.improvedText : inputText);
    if (!textToSpeak.trim()) return;

    try {
      setIsPlayingAudio(true);
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: textToSpeak.slice(0, 400),
        }),
      });

      if (!res.ok) throw new Error('TTS failed');

      const data = await res.json();
      if (data.audioBase64) {
        const audio = new Audio(`data:audio/wav;base64,${data.audioBase64}`);
        audioRef.current = audio;
        audio.onended = () => setIsPlayingAudio(false);
        audio.play();
      }
    } catch {
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(textToSpeak.slice(0, 300));
        utterance.lang = 'bn-BD';
        utterance.onend = () => setIsPlayingAudio(false);
        window.speechSynthesis.speak(utterance);
      } else {
        setIsPlayingAudio(false);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Header Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-600/5 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-700 dark:text-teal-400 mb-1 tracking-wide font-semibold">
              <span>{t.writerModuleBadge}</span>
            </div>
            <h1 className={`text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-3 ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/25 dark:border-emerald-500/35 flex items-center justify-center text-emerald-700 dark:text-emerald-400 shrink-0 shadow-2xs">
                <Feather className="w-5 h-5 sm:w-5.5 sm:h-5.5" />
              </div>
              <span>{t.writerTitle}</span>
            </h1>
            <p className={`text-stone-600 dark:text-neutral-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
              {t.writerDescription}
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap w-full sm:w-auto">
            <button
              type="button"
              onClick={handleSummarize}
              disabled={isSummarizing || !inputText.trim()}
              className="flex-1 sm:flex-initial justify-center flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-stone-50 text-stone-800 border border-stone-300 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] dark:text-neutral-200 dark:border-white/[0.08] font-semibold text-xs sm:text-sm rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40"
              title={language === 'en' ? 'Generate AI concise summary in side-panel' : 'সাইড-প্যানেলে এআই সারসংক্ষেপ তৈরি করুন'}
            >
              {isSummarizing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                  <span>{language === 'en' ? 'Summarizing...' : 'সারসংক্ষেপ হচ্ছে...'}</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{language === 'en' ? 'Summarize Text' : 'সারসংক্ষেপ তৈরি করুন'}</span>
                </>
              )}
            </button>

            <button
              onClick={() => runProofread(mode)}
              disabled={isLoading || !inputText.trim()}
              className="flex-1 sm:flex-initial justify-center flex items-center gap-2 px-5 py-2.5 bg-teal-700 hover:bg-teal-800 text-white dark:bg-gradient-to-r dark:from-teal-500 dark:to-emerald-600 dark:hover:from-teal-400 dark:hover:to-emerald-500 disabled:opacity-40 dark:text-neutral-950 font-semibold text-xs sm:text-sm rounded-xl shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white dark:text-neutral-950" />
                  <span>{t.writerProcessing}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white dark:text-neutral-950" />
                  <span>{t.writerProcessBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="mt-5 pt-4 border-t border-stone-200/80 dark:border-white/[0.06] flex flex-wrap items-center gap-2.5">
          <span className="text-xs text-stone-600 dark:text-neutral-400 font-semibold mr-1">
            {t.writerSampleLabel}
          </span>
          {SAMPLE_WRITINGS.map((sample) => (
            <button
              key={sample.id}
              onClick={() => handleSelectSample(sample.id)}
              className="px-3 py-1.5 rounded-lg text-xs font-bangla bg-white hover:bg-stone-50 text-stone-700 border border-stone-200/90 dark:bg-white/[0.02] dark:border-white/[0.06] dark:text-neutral-400 dark:hover:text-neutral-200 dark:hover:bg-white/[0.05] transition-all shadow-2xs"
            >
              {sample.title}
            </button>
          ))}
        </div>
      </div>

      {/* Mode Controls Bar */}
      <div className="flex items-center justify-center flex-wrap gap-2 p-2 bg-stone-200/70 dark:bg-stone-900/60 border border-stone-300/80 dark:border-white/[0.08] rounded-2xl w-fit max-w-full mx-auto shadow-xs">
        {/* 1. Grammar & Spelling */}
        <button
          type="button"
          onClick={() => {
            setMode('grammar_check');
            runProofread('grammar_check');
          }}
          className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            mode === 'grammar_check'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/25 ring-2 ring-emerald-500/30 scale-[1.03]'
              : 'bg-white hover:bg-emerald-50/50 text-stone-700 hover:text-emerald-800 border-stone-200/90 hover:border-emerald-300 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:text-emerald-300 dark:border-stone-800 dark:hover:border-emerald-700/60 shadow-2xs'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            mode === 'grammar_check'
              ? 'bg-white/20 text-white'
              : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 group-hover:bg-emerald-500/20'
          }`}>
            <BookOpen className="w-3.5 h-3.5" />
          </div>
          <span>{t.writerModeGrammar}</span>
          {mode === 'grammar_check' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          )}
        </button>

        {/* 2. Sadhu to Cholit */}
        <button
          type="button"
          onClick={() => {
            setMode('sadhu_to_cholit');
            runProofread('sadhu_to_cholit');
          }}
          className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            mode === 'sadhu_to_cholit'
              ? 'bg-sky-600 text-white border-sky-600 shadow-md shadow-sky-600/25 ring-2 ring-sky-500/30 scale-[1.03]'
              : 'bg-white hover:bg-sky-50/50 text-stone-700 hover:text-sky-800 border-stone-200/90 hover:border-sky-300 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:text-sky-300 dark:border-stone-800 dark:hover:border-sky-700/60 shadow-2xs'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            mode === 'sadhu_to_cholit'
              ? 'bg-white/20 text-white'
              : 'bg-sky-500/10 text-sky-600 dark:bg-sky-500/20 dark:text-sky-400 group-hover:bg-sky-500/20'
          }`}>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <span>{t.writerModeSadhuToCholit}</span>
          {mode === 'sadhu_to_cholit' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          )}
        </button>

        {/* 3. Cholit to Sadhu */}
        <button
          type="button"
          onClick={() => {
            setMode('cholit_to_sadhu');
            runProofread('cholit_to_sadhu');
          }}
          className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            mode === 'cholit_to_sadhu'
              ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-600/25 ring-2 ring-indigo-500/30 scale-[1.03]'
              : 'bg-white hover:bg-indigo-50/50 text-stone-700 hover:text-indigo-800 border-stone-200/90 hover:border-indigo-300 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:text-indigo-300 dark:border-stone-800 dark:hover:border-indigo-700/60 shadow-2xs'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            mode === 'cholit_to_sadhu'
              ? 'bg-white/20 text-white'
              : 'bg-indigo-500/10 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400 group-hover:bg-indigo-500/20'
          }`}>
            <ArrowRightLeft className="w-3.5 h-3.5" />
          </div>
          <span>{t.writerModeCholitToSadhu}</span>
          {mode === 'cholit_to_sadhu' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          )}
        </button>

        {/* 4. Formal / Professional */}
        <button
          type="button"
          onClick={() => {
            setMode('tone_formal');
            runProofread('tone_formal');
          }}
          className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            mode === 'tone_formal'
              ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-600/25 ring-2 ring-blue-500/30 scale-[1.03]'
              : 'bg-white hover:bg-blue-50/50 text-stone-700 hover:text-blue-800 border-stone-200/90 hover:border-blue-300 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:text-blue-300 dark:border-stone-800 dark:hover:border-blue-700/60 shadow-2xs'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            mode === 'tone_formal'
              ? 'bg-white/20 text-white'
              : 'bg-blue-500/10 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 group-hover:bg-blue-500/20'
          }`}>
            <Briefcase className="w-3.5 h-3.5" />
          </div>
          <span>{t.writerModeFormal}</span>
          {mode === 'tone_formal' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          )}
        </button>

        {/* 5. Literary & Aesthetic */}
        <button
          type="button"
          onClick={() => {
            setMode('tone_literary');
            runProofread('tone_literary');
          }}
          className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            mode === 'tone_literary'
              ? 'bg-fuchsia-600 text-white border-fuchsia-600 shadow-md shadow-fuchsia-600/25 ring-2 ring-fuchsia-500/30 scale-[1.03]'
              : 'bg-white hover:bg-fuchsia-50/50 text-stone-700 hover:text-fuchsia-800 border-stone-200/90 hover:border-fuchsia-300 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:text-fuchsia-300 dark:border-stone-800 dark:hover:border-fuchsia-700/60 shadow-2xs'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            mode === 'tone_literary'
              ? 'bg-white/20 text-white'
              : 'bg-fuchsia-500/10 text-fuchsia-600 dark:bg-fuchsia-500/20 dark:text-fuchsia-400 group-hover:bg-fuchsia-500/20'
          }`}>
            <Feather className="w-3.5 h-3.5" />
          </div>
          <span>{t.writerModeLiterary}</span>
          {mode === 'tone_literary' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          )}
        </button>

        {/* 6. Concise & Clear */}
        <button
          type="button"
          onClick={() => {
            setMode('concise');
            runProofread('concise');
          }}
          className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            mode === 'concise'
              ? 'bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-600/25 ring-2 ring-amber-500/30 scale-[1.03]'
              : 'bg-white hover:bg-amber-50/50 text-stone-700 hover:text-amber-800 border-stone-200/90 hover:border-amber-300 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:text-amber-300 dark:border-stone-800 dark:hover:border-amber-700/60 shadow-2xs'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            mode === 'concise'
              ? 'bg-white/20 text-white'
              : 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400 group-hover:bg-amber-500/20'
          }`}>
            <Minimize2 className="w-3.5 h-3.5" />
          </div>
          <span>{t.writerModeConcise}</span>
          {mode === 'concise' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          )}
        </button>

        {/* 7. Enrich Vocabulary */}
        <button
          type="button"
          onClick={() => {
            setMode('enhance_vocab');
            runProofread('enhance_vocab');
          }}
          className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            mode === 'enhance_vocab'
              ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/25 ring-2 ring-teal-500/30 scale-[1.03]'
              : 'bg-white hover:bg-teal-50/50 text-stone-700 hover:text-teal-800 border-stone-200/90 hover:border-teal-300 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:text-teal-300 dark:border-stone-800 dark:hover:border-teal-700/60 shadow-2xs'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            mode === 'enhance_vocab'
              ? 'bg-white/20 text-white'
              : 'bg-teal-500/10 text-teal-600 dark:bg-teal-500/20 dark:text-teal-400 group-hover:bg-teal-500/20'
          }`}>
            <Layers className="w-3.5 h-3.5" />
          </div>
          <span>{t.writerModeVocab}</span>
          {mode === 'enhance_vocab' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          )}
        </button>

        {/* 8. English to Bangla Translation */}
        <button
          type="button"
          onClick={() => {
            setMode('translate_en_bn');
            runProofread('translate_en_bn');
          }}
          className={`group flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition-all whitespace-nowrap ${
            mode === 'translate_en_bn'
              ? 'bg-rose-600 text-white border-rose-600 shadow-md shadow-rose-600/25 ring-2 ring-rose-500/30 scale-[1.03]'
              : 'bg-white hover:bg-rose-50/50 text-stone-700 hover:text-rose-800 border-stone-200/90 hover:border-rose-300 dark:bg-stone-900/90 dark:text-stone-300 dark:hover:text-rose-300 dark:border-stone-800 dark:hover:border-rose-700/60 shadow-2xs'
          }`}
        >
          <div className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 transition-colors ${
            mode === 'translate_en_bn'
              ? 'bg-white/20 text-white'
              : 'bg-rose-500/10 text-rose-600 dark:bg-rose-500/20 dark:text-rose-400 group-hover:bg-rose-500/20'
          }`}>
            <Globe className="w-3.5 h-3.5" />
          </div>
          <span>{t.writerModeTranslateEnBn}</span>
          {mode === 'translate_en_bn' && (
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse ml-0.5" />
          )}
        </button>
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
            <div className="flex items-center gap-3 shrink-0 ml-3">
              <button
                type="button"
                onClick={() => runProofread(mode)}
                className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded-md text-xs font-semibold shadow-xs transition-colors"
              >
                {language === 'bn' ? 'পুনরায় চেষ্টা করুন' : 'Try Again'}
              </button>
              <button
                type="button"
                onClick={() => setError(null)}
                className="text-red-700 dark:text-red-400 hover:underline text-xs font-medium"
              >
                {t.ocrClose}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Tone Adjustment Tool */}
      <ToneSelector
        currentMode={mode}
        onApplyTone={(targetMode, customToneText) => {
          runProofread(targetMode, customToneText);
        }}
        isLoading={isLoading}
        disabled={!inputText.trim()}
      />

      {/* Editor & Output Viewports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Side: Input Text Editor */}
        <div className="space-y-3.5">
          <div className="glass-panel rounded-2xl flex flex-col min-h-[300px] sm:min-h-[380px] lg:h-[560px] overflow-hidden border border-stone-200/90 dark:border-white/[0.07]">
            <div className="p-3.5 border-b border-stone-200/80 dark:border-white/[0.06] bg-stone-100/80 dark:bg-black/20 flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 dark:text-neutral-300 flex items-center gap-2">
                <AlignLeft className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>{t.writerOriginalDraft}</span>
              </span>
              <div className="flex items-center gap-2.5 text-[11px] font-mono tabular-nums text-stone-600 dark:text-neutral-400 font-medium">
                <span>{inputText.length} CHARS</span>
                <span>·</span>
                <span>{inputText.trim() ? inputText.trim().split(/\s+/).length : 0} WORDS</span>
              </div>
            </div>

            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={handleTextChange}
              placeholder={t.writerPlaceholder}
              className="flex-1 w-full p-5 bg-white dark:bg-transparent text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 font-bangla text-base sm:text-lg leading-relaxed resize-none focus:outline-none"
            />
          </div>

          <BengaliVirtualKeyboard
            onInsertChar={handleInsertChar}
            avroEnabled={avroEnabled}
            onToggleAvro={() => setAvroEnabled(!avroEnabled)}
          />
        </div>

        {/* Right Side: Polished Output & Rule Changes */}
        <div className="glass-panel rounded-2xl flex flex-col min-h-[360px] sm:min-h-[440px] lg:h-[600px] overflow-hidden border border-stone-200/90 dark:border-white/[0.07]">
          <div className="p-3.5 border-b border-stone-200/80 dark:border-white/[0.06] bg-stone-100/80 dark:bg-black/20 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-1.5">
                <Check className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                <span>{t.writerPolishedOutput}</span>
              </span>
              {result?.analysis && (
                <span className="text-[11px] font-mono tabular-nums text-teal-800 bg-teal-50 border border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-teal-800/40 px-2 py-0.5 rounded-md font-semibold">
                  {result.analysis.readabilityScore}/100 {t.writerScore}
                </span>
              )}
            </div>

            {/* Output Toolbar with Export Dropdown */}
            {result && (
              <div className="flex items-center gap-1.5">
                {/* Audio TTS */}
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

                {/* Copy Text */}
                <button
                  type="button"
                  onClick={() => handleCopyText(result.improvedText)}
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

                {/* Export Dropdown (PDF / TXT / Markdown) */}
                <div className="relative" ref={exportDropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 bg-teal-700/10 hover:bg-teal-700/20 text-teal-800 dark:bg-teal-500/10 dark:hover:bg-teal-500/20 dark:text-teal-300 border border-teal-700/25 dark:border-teal-500/35 rounded-lg text-xs font-semibold transition-all hover:scale-[1.02] shadow-2xs"
                    title={t.writerExportBtn}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{exportFeedback ? `${exportFeedback} ✓` : t.writerExportBtn}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isExportMenuOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isExportMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-1.5 w-64 p-1.5 bg-white dark:bg-[#0d121c] border border-stone-200/95 dark:border-white/[0.12] rounded-xl shadow-xl shadow-stone-900/15 dark:shadow-black/60 z-50 text-xs space-y-1"
                      >
                        {/* PDF Export */}
                        <button
                          type="button"
                          onClick={handleExportPdf}
                          className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-white/[0.06] text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span>{t.writerExportPdf}</span>
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 rounded font-semibold">
                                PDF
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5 leading-snug">
                              {t.writerExportPdfDesc}
                            </div>
                          </div>
                        </button>

                        {/* Word DOCX Export */}
                        <button
                          type="button"
                          onClick={handleExportDocx}
                          className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-white/[0.06] text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5">
                            <FileType className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span>{t.writerExportDocx}</span>
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded font-semibold">
                                DOCX
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5 leading-snug">
                              {t.writerExportDocxDesc}
                            </div>
                          </div>
                        </button>

                        {/* Markdown Download */}
                        <button
                          type="button"
                          onClick={handleExportMd}
                          className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-white/[0.06] text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                            <FileCode className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span>{t.writerExportMd}</span>
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 rounded font-semibold">
                                MD
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5 leading-snug">
                              {t.writerExportMdDesc}
                            </div>
                          </div>
                        </button>

                        {/* TXT Download */}
                        <button
                          type="button"
                          onClick={handleExportTxt}
                          className="w-full flex items-start gap-2.5 p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-white/[0.06] text-left transition-colors group"
                        >
                          <div className="w-7 h-7 rounded-lg bg-stone-200/70 text-stone-800 dark:bg-white/[0.08] dark:text-neutral-200 flex items-center justify-center shrink-0 mt-0.5">
                            <Download className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-stone-900 dark:text-white flex items-center justify-between">
                              <span className="flex items-center gap-1.5">
                                <span>{t.writerExportTxt}</span>
                              </span>
                              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-stone-200 dark:bg-white/[0.1] text-stone-700 dark:text-neutral-300 rounded font-semibold">
                                TXT
                              </span>
                            </div>
                            <div className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5 leading-snug">
                              {t.writerExportTxtDesc}
                            </div>
                          </div>
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>

          <div ref={resultCardRef} className="flex-1 overflow-auto p-5 space-y-4">
            {isLoading ? (
              <div className="h-full flex flex-col items-center justify-center space-y-3.5 text-stone-500 dark:text-neutral-400">
                <Loader2 className="w-9 h-9 animate-spin text-teal-700 dark:text-teal-400" />
                <p className="text-xs">{t.writerProcessing}</p>
              </div>
            ) : result ? (
              <>
                {/* Result Text Area */}
                <div>
                  <div className="text-xs text-stone-700 dark:text-neutral-400 font-semibold mb-1.5 flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <span>{t.writerPolishedOutput}</span>
                      <span className="text-[11px] text-stone-500 dark:text-neutral-500 font-mono tabular-nums">
                        {result.improvedText.length} {t.ocrCharacters}
                      </span>
                    </span>
                    <CopyButton
                      text={result.improvedText}
                      size="xs"
                      variant="outline"
                      showLabel
                      label={t.copyToClipboard}
                      copiedLabel={t.copiedToClipboard}
                    />
                  </div>
                  <TypingOutputDisplay
                    text={result.improvedText}
                    language={language}
                  />
                </div>

                {/* Linguistic Analysis Assessment */}
                {result.analysis && (
                  <div className="glass-panel-subtle rounded-xl p-3.5 border border-stone-200/90 dark:border-white/[0.06] text-xs space-y-1">
                    <div className="flex items-center justify-between text-stone-900 dark:text-neutral-200">
                      <span className="font-semibold">{t.writerStyleEval}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-teal-800 dark:text-teal-400 font-mono text-[11px] uppercase tracking-wide font-bold">
                          {result.analysis.tone} · {result.analysis.style}
                        </span>
                        <CopyButton
                          text={`${result.analysis.tone} (${result.analysis.style}): ${result.analysis.keyNotes}`}
                          size="xs"
                          variant="subtle"
                          showLabel
                          label={language === 'en' ? 'Copy Analysis' : 'বিশ্লেষণ কপি'}
                        />
                      </div>
                    </div>
                    <p className="text-stone-600 dark:text-neutral-400 text-[12px] leading-relaxed font-bangla">
                      {result.analysis.keyNotes}
                    </p>
                  </div>
                )}

                {/* Detected Changes / Rules Applied */}
                {result.changes && result.changes.length > 0 && (
                  <div className="glass-panel-subtle rounded-xl overflow-hidden border border-stone-200/90 dark:border-white/[0.06]">
                    <div className="bg-stone-100/90 dark:bg-white/[0.03] px-3.5 py-2.5 text-xs font-bold text-stone-900 dark:text-neutral-200 border-b border-stone-200/90 dark:border-white/[0.06] flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <CheckCheck className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                        <span>{t.writerChangesApplied} ({result.changes.length})</span>
                      </span>
                      <button
                        onClick={handleApplyAllChanges}
                        className="text-[11px] text-teal-800 dark:text-teal-300 font-bold underline"
                      >
                        {t.writerAcceptAll}
                      </button>
                    </div>

                    <div className="divide-y divide-stone-200/80 dark:divide-white/[0.04]">
                      {result.changes.map((change, idx) => (
                        <div key={idx} className="p-3.5 space-y-1.5 text-xs hover:bg-stone-50/50 dark:hover:bg-white/[0.01] transition-colors">
                          <div className="flex items-center justify-between gap-2 flex-wrap font-bangla">
                            <div className="flex items-center gap-2">
                              <span className="line-through text-rose-800 bg-rose-50 border border-rose-200 dark:text-rose-400/80 dark:bg-rose-950/30 dark:border-transparent px-2 py-0.5 rounded text-[13px] font-medium">
                                {change.original}
                              </span>
                              <span className="text-stone-400 dark:text-neutral-500">➔</span>
                              <span className="text-teal-800 bg-teal-50 border border-teal-200 dark:text-teal-300 dark:bg-teal-950/40 dark:border-transparent font-bold px-2 py-0.5 rounded text-[13px]">
                                {change.replacement}
                              </span>
                            </div>

                            <button
                              onClick={() => handleApplySingleChange(idx, change)}
                              className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${
                                acceptedChanges[idx]
                                  ? 'bg-teal-700 text-white border-teal-800 dark:bg-teal-500 dark:text-neutral-950 dark:border-teal-400'
                                  : 'bg-white hover:bg-stone-100 text-stone-700 border-stone-200 dark:bg-white/[0.04] dark:text-neutral-300 dark:border-white/[0.08] dark:hover:bg-white/[0.08]'
                              }`}
                            >
                              {acceptedChanges[idx] ? t.writerAccepted : t.writerAccept}
                            </button>
                          </div>
                          <p className="text-stone-600 dark:text-neutral-400 text-[11px] leading-relaxed pt-0.5 font-bangla">
                            {change.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Suggested Synonyms */}
                {result.suggestedSynonyms && result.suggestedSynonyms.length > 0 && (
                  <div className="glass-panel-subtle rounded-xl p-3.5 border border-stone-200/90 dark:border-white/[0.06] text-xs">
                    <div className="text-stone-900 dark:text-neutral-200 font-bold mb-2">
                      {t.writerSynonyms}
                    </div>
                    <div className="flex flex-wrap gap-2 font-bangla">
                      {result.suggestedSynonyms.map((item, i) => (
                        <div
                          key={i}
                          className="bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.07] rounded-lg px-2.5 py-1.5 text-stone-800 dark:text-neutral-300 shadow-2xs"
                        >
                          <span className="text-teal-800 dark:text-teal-400 font-semibold">{item.word}:</span>{' '}
                          {item.synonyms.join(', ')}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-3 text-stone-400 dark:text-neutral-500">
                <PenTool className="w-10 h-10 text-stone-300 dark:text-neutral-700" />
                <div>
                  <p className="text-sm font-bold text-stone-800 dark:text-neutral-300">{t.writerEmptyTitle}</p>
                  <p className="text-xs text-stone-500 dark:text-neutral-500 mt-1 max-w-xs">
                    {t.writerEmptyDesc}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Summary Side-Panel */}
      <AnimatePresence>
        {isSummaryOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSummaryOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 transition-opacity"
            />

            {/* Slide-in Side-Panel */}
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 260 }}
              className="fixed top-0 right-0 h-full w-full sm:w-[500px] max-w-full bg-[#fbfaf5] dark:bg-[#0c1017] border-l border-stone-200/90 dark:border-white/[0.08] shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Panel Header */}
              <div className="p-4 sm:p-5 border-b border-stone-200/80 dark:border-white/[0.08] bg-stone-100/80 dark:bg-white/[0.02] flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-700 dark:text-teal-400">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <span>{language === 'en' ? 'Concise AI Summary' : 'এআই সারসংক্ষেপ'}</span>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded-sm bg-teal-50 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 font-semibold">
                        Gemini 3.8
                      </span>
                    </h2>
                    <p className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5">
                      {language === 'en' ? 'Core essence synthesized from your draft' : 'আপনার লেখার সারবস্তু ও মূল বক্তব্য'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsSummaryOpen(false)}
                    className="p-2 rounded-xl text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/[0.08] transition-colors"
                    aria-label="Close summary panel"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Panel Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
                {isSummarizing ? (
                  <div className="py-16 flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-teal-600 dark:text-teal-400 animate-spin" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-stone-900 dark:text-white">
                        {language === 'en' ? 'Distilling central thoughts...' : 'মূল বক্তব্য নিষ্কাশন করা হচ্ছে...'}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-neutral-400 mt-1 max-w-xs">
                        {language === 'en'
                          ? 'Gemini 3.8 Flash is analyzing sentence structure and synthesizing key ideas.'
                          : 'জেমিনাই ৩.৮ ফ্ল্যাশ বাক্য বিশ্লেষণ করে প্রমিত সারসংক্ষেপ তৈরি করছে।'}
                      </p>
                    </div>
                  </div>
                ) : summaryError ? (
                  <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-800/60 dark:text-red-200 text-xs sm:text-sm space-y-3">
                    <p>{summaryError}</p>
                    <button
                      type="button"
                      onClick={handleSummarize}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-semibold"
                    >
                      {language === 'en' ? 'Retry Summary' : 'পুনরায় চেষ্টা করুন'}
                    </button>
                  </div>
                ) : summaryData ? (
                  <>
                    {/* Executive Summary Card */}
                    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/[0.08] space-y-3.5 relative">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-stone-800 dark:text-neutral-200 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                          <span>{language === 'en' ? 'Executive Summary' : 'মূল সারমর্ম'}</span>
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Audio TTS */}
                          <button
                            type="button"
                            onClick={() => handlePlayTTS(summaryData.conciseSummary)}
                            className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-white/[0.06] transition-colors"
                            title={language === 'en' ? 'Listen to Bengali speech' : 'বাংলায় শুনুন'}
                          >
                            <Volume2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
                          </button>

                          {/* Copy */}
                          <CopyButton
                            text={summaryData.conciseSummary}
                            size="sm"
                            variant="outline"
                            showLabel
                            label={t.copyToClipboard}
                            copiedLabel={t.copiedToClipboard}
                          />
                        </div>
                      </div>

                      <TypingOutputDisplay
                        text={summaryData.conciseSummary}
                        language={language}
                      />

                      <div className="flex items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            setInputText(prev => prev ? `${prev}\n\n[সারসংক্ষেপ]:\n${summaryData.conciseSummary}` : summaryData.conciseSummary);
                            setIsSummaryOpen(false);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <ArrowDownToLine className="w-3.5 h-3.5" />
                          <span>{language === 'en' ? 'Append to Editor' : 'লেখায় যুক্ত করুন'}</span>
                        </button>
                      </div>
                    </div>

                    {/* Key Takeaways */}
                    {summaryData.bulletPoints && summaryData.bulletPoints.length > 0 && (
                      <div className="glass-panel-subtle rounded-xl p-4 border border-stone-200/90 dark:border-white/[0.06] space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-bold text-stone-900 dark:text-white flex items-center gap-2">
                            <CheckCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span>{language === 'en' ? 'Key Takeaways' : 'প্রধান দিকসমূহ'}</span>
                          </div>
                          <CopyButton
                            text={() => summaryData.bulletPoints.map((b) => `• ${b}`).join('\n')}
                            size="xs"
                            variant="subtle"
                            showLabel
                            label={language === 'en' ? 'Copy Points' : 'পয়েন্টসমূহ কপি'}
                          />
                        </div>
                        <ul className="space-y-2.5">
                          {summaryData.bulletPoints.map((bullet, i) => (
                            <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm font-bangla text-stone-700 dark:text-neutral-300 leading-relaxed">
                              <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 mt-2 shrink-0" />
                              <span>{bullet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Key Themes / Focus Areas */}
                    {summaryData.keyThemes && summaryData.keyThemes.length > 0 && (
                      <div className="glass-panel-subtle rounded-xl p-4 border border-stone-200/90 dark:border-white/[0.06] space-y-2.5">
                        <div className="text-xs font-bold text-stone-900 dark:text-white">
                          {language === 'en' ? 'Themes & Focus Areas' : 'মূল প্রতিপাদ্য বিষয়'}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {summaryData.keyThemes.map((theme, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-1 rounded-lg bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] text-xs font-bangla text-stone-700 dark:text-stone-300 font-medium"
                            >
                              #{theme}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Stats & Compression Breakdown */}
                    {summaryData.stats && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.06] rounded-xl text-center">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400 font-medium">Original</div>
                          <div className="text-sm font-bold text-stone-900 dark:text-white mt-0.5">{summaryData.stats.originalWordCount} words</div>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.06] rounded-xl text-center">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400 font-medium">Summary</div>
                          <div className="text-sm font-bold text-teal-700 dark:text-teal-400 mt-0.5">{summaryData.stats.summaryWordCount} words</div>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.06] rounded-xl text-center">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400 font-medium">Reduction</div>
                          <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{summaryData.stats.reductionPercentage}</div>
                        </div>

                        <div className="p-3 bg-white dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.06] rounded-xl text-center">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400 font-medium">Reading Time</div>
                          <div className="text-xs font-bold text-stone-900 dark:text-white mt-0.5">{summaryData.stats.estimatedReadingTime}</div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="py-12 text-center text-stone-400 dark:text-neutral-500 space-y-2">
                    <FileText className="w-8 h-8 mx-auto text-stone-300 dark:text-neutral-700" />
                    <p className="text-xs">
                      {language === 'en' ? 'Click "Summarize Text" to view executive summary.' : 'সারসংক্ষেপ তৈরি করতে বাটনে ক্লিক করুন।'}
                    </p>
                  </div>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
