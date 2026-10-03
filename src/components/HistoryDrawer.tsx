import React, { useState } from 'react';
import { HistoryItem, OcrResult, ProofreadResult, TranscriptionResult } from '../types';
import {
  FileScan,
  PenTool,
  Mic,
  Trash2,
  Copy,
  Check,
  Search,
  ArrowUpRight,
  History,
  Eye,
  X,
  Download,
  Volume2,
  Sparkles,
  ShieldCheck,
  Cloud,
  Layers,
  Table,
  CheckCircle2,
  User,
  LogIn,
  LogOut,
  Calendar,
  Clock,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface HistoryDrawerProps {
  items: HistoryItem[];
  onClear: () => void;
  onSelect: (item: HistoryItem) => void;
  onDeleteItem?: (id: string) => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  items,
  onClear,
  onSelect,
  onDeleteItem,
}) => {
  const { t, language } = useLanguage();
  const { user, signInWithGoogle, signOutUser } = useAuth();

  const [filterType, setFilterType] = useState<'all' | 'ocr' | 'writer' | 'voice'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedOutcomeItem, setSelectedOutcomeItem] = useState<HistoryItem | null>(null);
  const [voiceTab, setVoiceTab] = useState<'standard' | 'verbatim'>('standard');
  const [writingTab, setWritingTab] = useState<'improved' | 'original' | 'changes'>('improved');
  const [isSigningIn, setIsSigningIn] = useState<boolean>(false);

  const filteredItems = items.filter((item) => {
    const matchesType = filterType === 'all' || item.type === filterType;
    const matchesQuery =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.preview.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesQuery;
  });

  const handleCopy = (id: string, text: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDownloadOutcomeTxt = (item: HistoryItem) => {
    let fullText = item.preview;
    if (item.type === 'ocr') {
      fullText = (item.data as OcrResult).fullExtractedText || item.preview;
    } else if (item.type === 'writer') {
      fullText = (item.data as ProofreadResult).improvedText || item.preview;
    } else if (item.type === 'voice') {
      const v = item.data as TranscriptionResult;
      fullText = v.normalizedTranscript || v.fullTranscript || item.preview;
    }

    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${item.type}_outcome_${item.id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleGoogleSignIn = async () => {
    setIsSigningIn(true);
    try {
      await signInWithGoogle();
    } catch {
      // Handled in context
    } finally {
      setIsSigningIn(false);
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return `${d.toLocaleDateString()} · ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="space-y-6">
      {/* Google Account Sync Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/[0.08] relative overflow-hidden bg-gradient-to-r from-teal-500/[0.03] to-emerald-500/[0.03]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {user ? (
              user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google Account'}
                  className="w-10 h-10 rounded-full border-2 border-teal-500/40 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
                  {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
              )
            ) : (
              <div className="w-10 h-10 rounded-xl bg-stone-200/80 dark:bg-white/[0.06] border border-stone-300 dark:border-white/[0.1] flex items-center justify-center text-stone-600 dark:text-neutral-400 shrink-0">
                <Cloud className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white">
                  {user ? t.googleAccountConnected : t.googleSignIn}
                </span>
                {user && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/50">
                    <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                    <span>{t.googleSyncActive}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5 max-w-xl">
                {user
                  ? `${user.email} · ${t.googleSyncDesc}`
                  : t.googleSignInPrompt}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-2.5">
            {user ? (
              <button
                type="button"
                onClick={signOutUser}
                className="px-3.5 py-2 text-xs font-semibold text-stone-700 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white bg-white hover:bg-stone-50 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-stone-300 dark:border-white/[0.08] rounded-xl transition-all shadow-2xs flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{t.googleSignOut}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isSigningIn}
                className="px-4 py-2.5 bg-white hover:bg-stone-50 dark:bg-[#1a202c] dark:hover:bg-[#232b3b] text-stone-800 dark:text-white font-semibold text-xs sm:text-sm border border-stone-300 dark:border-white/[0.15] rounded-xl shadow-xs transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2.5"
              >
                {/* Google G SVG */}
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.99 0 12s.45 3.83 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
                <span>{isSigningIn ? 'Connecting...' : t.googleSignIn}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Studio Header Card */}
      <div className="glass-panel rounded-2xl p-5 sm:p-6 border border-stone-200/90 dark:border-white/[0.08] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-600/5 dark:bg-teal-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-teal-700 dark:text-teal-400 mb-1 tracking-wide font-semibold">
              <History className="w-3.5 h-3.5" />
              <span>{t.archiveModuleBadge}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 dark:text-white tracking-tight flex items-center gap-2.5">
              <span>{t.archiveTitle}</span>
            </h1>
            <p className="text-stone-600 dark:text-neutral-400 text-xs sm:text-sm mt-1.5 max-w-2xl leading-relaxed">
              {t.archiveDescription}
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={onClear}
              className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 dark:text-rose-400 dark:bg-rose-950/20 dark:border-rose-900/40 rounded-xl transition-all self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.archiveClearBtn}</span>
            </button>
          )}
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-5 pt-4 border-t border-stone-200/80 dark:border-white/[0.06] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 p-1 bg-stone-200/60 dark:bg-white/[0.02] border border-stone-300/70 dark:border-white/[0.06] rounded-xl flex-wrap">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterType === 'all'
                  ? 'bg-white text-stone-900 border border-stone-300/80 shadow-xs dark:bg-white/[0.08] dark:text-white dark:border-white/[0.12]'
                  : 'text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {t.archiveFilterAll} ({items.length})
            </button>

            <button
              onClick={() => setFilterType('ocr')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterType === 'ocr'
                  ? 'bg-white text-stone-900 border border-stone-300/80 shadow-xs dark:bg-white/[0.08] dark:text-white dark:border-white/[0.12]'
                  : 'text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {t.archiveFilterOcr} ({items.filter((i) => i.type === 'ocr').length})
            </button>

            <button
              onClick={() => setFilterType('writer')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterType === 'writer'
                  ? 'bg-white text-stone-900 border border-stone-300/80 shadow-xs dark:bg-white/[0.08] dark:text-white dark:border-white/[0.12]'
                  : 'text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {t.archiveFilterWriter} ({items.filter((i) => i.type === 'writer').length})
            </button>

            <button
              onClick={() => setFilterType('voice')}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                filterType === 'voice'
                  ? 'bg-white text-stone-900 border border-stone-300/80 shadow-xs dark:bg-white/[0.08] dark:text-white dark:border-white/[0.12]'
                  : 'text-stone-600 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-neutral-200'
              }`}
            >
              {t.archiveFilterVoice} ({items.filter((i) => i.type === 'voice').length})
            </button>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 dark:text-neutral-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.archiveSearchPlaceholder}
              className="pl-9 pr-3.5 py-2 bg-white dark:bg-white/[0.03] border border-stone-300 dark:border-white/[0.07] rounded-xl text-xs text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:border-teal-600 dark:focus:border-teal-500/50 w-full sm:w-64 transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* History Items Feed with Rich Full Outcome Cards */}
      <div className="space-y-3.5">
        {filteredItems.length === 0 ? (
          <div className="glass-panel rounded-2xl p-12 text-center text-stone-500 dark:text-neutral-500 border border-stone-200/90 dark:border-white/[0.07]">
            <History className="w-12 h-12 mx-auto mb-3 text-stone-300 dark:text-neutral-700" />
            <p className="text-sm font-bold text-stone-800 dark:text-neutral-300">{t.archiveEmptyTitle}</p>
            <p className="text-xs text-stone-500 dark:text-neutral-500 mt-1 max-w-sm mx-auto">
              {t.archiveEmptyDesc}
            </p>
          </div>
        ) : (
          filteredItems.map((item) => {
            const isOcr = item.type === 'ocr';
            const isWriter = item.type === 'writer';
            const isVoice = item.type === 'voice';

            const ocrData = isOcr ? (item.data as OcrResult) : null;
            const writerData = isWriter ? (item.data as ProofreadResult) : null;
            const voiceData = isVoice ? (item.data as TranscriptionResult) : null;

            return (
              <div
                key={item.id}
                className="group glass-panel hover:bg-stone-50/80 dark:hover:bg-white/[0.04] rounded-2xl p-4 sm:p-5 transition-all flex flex-col gap-3.5 border border-stone-200/90 dark:border-white/[0.06] hover:border-stone-300 dark:hover:border-white/[0.14] shadow-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 mt-0.5 ${
                        isOcr
                          ? 'bg-teal-500/10 text-teal-700 border-teal-500/25 dark:bg-teal-500/15 dark:text-teal-400'
                          : isWriter
                          ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/25 dark:bg-emerald-500/15 dark:text-emerald-400'
                          : 'bg-sky-500/10 text-sky-700 border-sky-500/25 dark:bg-sky-500/15 dark:text-sky-400'
                      }`}
                    >
                      {isOcr && <FileScan className="w-5 h-5" />}
                      {isWriter && <PenTool className="w-5 h-5" />}
                      {isVoice && <Mic className="w-5 h-5" />}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-[10px] font-bold uppercase font-mono px-2 py-0.5 rounded-md ${
                            isOcr
                              ? 'bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:text-teal-300'
                              : isWriter
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
                              : 'bg-sky-100 text-sky-800 dark:bg-sky-950/40 dark:text-sky-300'
                          }`}
                        >
                          {isOcr ? t.archiveOcrDoc : isWriter ? t.archiveWriterDraft : t.archiveVoiceTranscript}
                        </span>

                        <span className="text-[11px] text-stone-500 dark:text-neutral-500 font-mono">
                          {formatTimestamp(item.timestamp)}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-stone-900 dark:text-white mt-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                        {item.title}
                      </h3>

                      {/* Full Outcome Metric Badges */}
                      <div className="flex items-center gap-2 mt-2 flex-wrap text-xs">
                        {isOcr && ocrData && (
                          <>
                            {ocrData.confidenceScore && (
                              <span className="px-2 py-0.5 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-md font-mono text-[11px] text-stone-700 dark:text-neutral-300">
                                Accuracy: <strong className="text-teal-700 dark:text-teal-400">{ocrData.confidenceScore}%</strong>
                              </span>
                            )}
                            {ocrData.fields && ocrData.fields.length > 0 && (
                              <span className="px-2 py-0.5 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-md font-mono text-[11px] text-stone-700 dark:text-neutral-300">
                                {ocrData.fields.length} Fields
                              </span>
                            )}
                            {ocrData.detectedScript && (
                              <span className="px-2 py-0.5 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-md font-mono text-[11px] text-stone-700 dark:text-neutral-300">
                                {ocrData.detectedScript}
                              </span>
                            )}
                          </>
                        )}

                        {isWriter && writerData && (
                          <>
                            {writerData.analysis?.readabilityScore && (
                              <span className="px-2 py-0.5 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-md font-mono text-[11px] text-stone-700 dark:text-neutral-300">
                                Readability: <strong className="text-emerald-700 dark:text-emerald-400">{writerData.analysis.readabilityScore}/100</strong>
                              </span>
                            )}
                            {writerData.changes && (
                              <span className="px-2 py-0.5 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-md font-mono text-[11px] text-stone-700 dark:text-neutral-300">
                                {writerData.changes.length} Corrections
                              </span>
                            )}
                            {writerData.analysis?.wordCount && (
                              <span className="px-2 py-0.5 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-md font-mono text-[11px] text-stone-700 dark:text-neutral-300">
                                {writerData.analysis.wordCount} words
                              </span>
                            )}
                          </>
                        )}

                        {isVoice && voiceData && (
                          <>
                            {voiceData.detectedDialect && (
                              <span className="px-2 py-0.5 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-md font-mono text-[11px] text-stone-700 dark:text-neutral-300">
                                Dialect: <strong className="text-sky-700 dark:text-sky-400">{voiceData.detectedDialect}</strong>
                              </span>
                            )}
                            {voiceData.speakers && voiceData.speakers.length > 0 && (
                              <span className="px-2 py-0.5 bg-white dark:bg-white/[0.04] border border-stone-200 dark:border-white/[0.08] rounded-md font-mono text-[11px] text-stone-700 dark:text-neutral-300">
                                {voiceData.speakers.length} Speaker Turns
                              </span>
                            )}
                          </>
                        )}
                      </div>

                      {/* Preview Outcome Text */}
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-neutral-300 mt-2 font-bangla line-clamp-2 leading-relaxed bg-white/40 dark:bg-white/[0.02] p-2.5 rounded-xl border border-stone-200/60 dark:border-white/[0.04]">
                        {item.preview}
                      </p>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-200/80 dark:border-white/[0.06]">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleCopy(item.id, item.preview)}
                        className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.08] rounded-xl transition-colors text-xs border border-stone-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]"
                        title={t.ocrCopy}
                      >
                        {copiedId === item.id ? (
                          <Check className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDownloadOutcomeTxt(item)}
                        className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-200/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.08] rounded-xl transition-colors text-xs border border-stone-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]"
                        title={t.ocrDownload}
                      >
                        <Download className="w-3.5 h-3.5" />
                      </button>

                      {onDeleteItem && (
                        <button
                          type="button"
                          onClick={() => onDeleteItem(item.id)}
                          className="p-2 text-stone-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/20 rounded-xl transition-colors text-xs border border-stone-200/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.02]"
                          title={t.historyDeleteItem}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedOutcomeItem(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 border border-teal-200 dark:border-teal-800/50 rounded-xl transition-all flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{t.historyViewFullOutcome}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelect(item)}
                        className="px-3 py-1.5 text-xs font-semibold text-stone-700 dark:text-neutral-300 hover:text-stone-900 dark:hover:text-white bg-white hover:bg-stone-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-stone-300 dark:border-white/[0.08] rounded-xl transition-all flex items-center gap-1"
                        title={t.archiveOpenInWorkspace}
                      >
                        <span>{t.archiveOpenInWorkspace}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Full Outcome Modal Dialog */}
      <AnimatePresence>
        {selectedOutcomeItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedOutcomeItem(null)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: 'spring', duration: 0.3 }}
              className="relative w-full max-w-4xl max-h-[94vh] bg-[#fbfaf5] dark:bg-[#0c1017] rounded-2xl sm:rounded-3xl border border-stone-200 dark:border-white/[0.1] shadow-2xl z-50 flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="p-5 sm:p-6 border-b border-stone-200/90 dark:border-white/[0.08] flex items-center justify-between gap-4 bg-stone-100/70 dark:bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${
                      selectedOutcomeItem.type === 'ocr'
                        ? 'bg-teal-500/15 text-teal-700 border-teal-500/30 dark:text-teal-400'
                        : selectedOutcomeItem.type === 'writer'
                        ? 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30 dark:text-emerald-400'
                        : 'bg-sky-500/15 text-sky-700 border-sky-500/30 dark:text-sky-400'
                    }`}
                  >
                    {selectedOutcomeItem.type === 'ocr' && <FileScan className="w-5 h-5" />}
                    {selectedOutcomeItem.type === 'writer' && <PenTool className="w-5 h-5" />}
                    {selectedOutcomeItem.type === 'voice' && <Mic className="w-5 h-5" />}
                  </div>

                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white flex items-center gap-2">
                      <span>{selectedOutcomeItem.title}</span>
                    </h2>
                    <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
                      <span>{formatTimestamp(selectedOutcomeItem.timestamp)}</span>
                      <span>·</span>
                      <span className="uppercase font-mono text-[10px] font-semibold text-teal-700 dark:text-teal-400">
                        {selectedOutcomeItem.type}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onSelect(selectedOutcomeItem);
                      setSelectedOutcomeItem(null);
                    }}
                    className="px-3 py-1.5 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-all"
                  >
                    <span>{t.archiveOpenInWorkspace}</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedOutcomeItem(null)}
                    className="p-2 text-stone-500 hover:text-stone-900 dark:text-neutral-400 dark:hover:text-white rounded-xl hover:bg-stone-200/60 dark:hover:bg-white/[0.08] transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Modal Body: Scrollable Full Outcomes */}
              <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
                {/* 1. OCR Outcome Full Details */}
                {selectedOutcomeItem.type === 'ocr' && (() => {
                  const data = selectedOutcomeItem.data as OcrResult;
                  return (
                    <div className="space-y-5">
                      {/* Metric highlights */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Accuracy</div>
                          <div className="text-base font-bold text-teal-700 dark:text-teal-400 mt-0.5">{data.confidenceScore || 98}%</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Document Type</div>
                          <div className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 truncate">{data.documentType || 'Official Circular'}</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Script Style</div>
                          <div className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 truncate">{data.detectedScript || 'Bangla Standard'}</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Total Characters</div>
                          <div className="text-base font-bold text-stone-900 dark:text-white mt-0.5">{(data.fullExtractedText || '').length}</div>
                        </div>
                      </div>

                      {/* Executive Summary */}
                      {data.summary && (
                        <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 dark:bg-teal-950/30 dark:border-teal-800/40 space-y-1.5">
                          <div className="text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wide flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Executive Summary</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bangla text-stone-800 dark:text-neutral-200 leading-relaxed">
                            {data.summary}
                          </p>
                        </div>
                      )}

                      {/* Full Verbatim Text */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-stone-800 dark:text-neutral-200">
                            Full Verbatim Extracted Text (সম্পূর্ণ বাংলা টেক্সট):
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy('ocr-full', data.fullExtractedText || '')}
                            className="text-xs text-teal-700 dark:text-teal-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedId === 'ocr-full' ? 'Copied!' : 'Copy Full Text'}</span>
                          </button>
                        </div>
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#10141f] border border-stone-200 dark:border-white/[0.08] font-bangla text-base leading-relaxed text-stone-900 dark:text-white max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
                          {data.fullExtractedText}
                        </div>
                      </div>

                      {/* Structured Fields Table */}
                      {data.fields && data.fields.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-xs font-bold text-stone-800 dark:text-neutral-200 flex items-center gap-1.5">
                            <Table className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Structured Extracted Fields ({data.fields.length}):</span>
                          </span>
                          <div className="overflow-x-auto rounded-xl border border-stone-200 dark:border-white/[0.08]">
                            <table className="w-full text-xs text-left">
                              <thead className="bg-stone-100 dark:bg-white/[0.04] text-stone-700 dark:text-neutral-300 font-semibold border-b border-stone-200 dark:border-white/[0.08]">
                                <tr>
                                  <th className="p-3">Field Label</th>
                                  <th className="p-3">Extracted Value</th>
                                  <th className="p-3">Category</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-stone-200 dark:divide-white/[0.06] bg-white dark:bg-transparent font-bangla">
                                {data.fields.map((field, i) => (
                                  <tr key={i} className="hover:bg-stone-50 dark:hover:bg-white/[0.02]">
                                    <td className="p-3 font-semibold text-stone-800 dark:text-neutral-200">{field.label}</td>
                                    <td className="p-3 text-stone-900 dark:text-white">{field.value}</td>
                                    <td className="p-3 text-stone-500 dark:text-neutral-400">{field.category || 'General'}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}

                      {/* English Translation */}
                      {data.englishTranslation && (
                        <div className="p-4 rounded-xl bg-stone-100/80 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08] space-y-1.5">
                          <div className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-neutral-400">
                            English Translation
                          </div>
                          <p className="text-xs sm:text-sm text-stone-800 dark:text-neutral-300 leading-relaxed">
                            {data.englishTranslation}
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 2. Writing Assistant Full Outcome Details */}
                {selectedOutcomeItem.type === 'writer' && (() => {
                  const data = selectedOutcomeItem.data as ProofreadResult;
                  return (
                    <div className="space-y-5">
                      {/* Metric highlights */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Readability Score</div>
                          <div className="text-base font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">{data.analysis?.readabilityScore || 94}/100</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Tone</div>
                          <div className="text-xs font-bold text-stone-900 dark:text-white mt-0.5 truncate">{data.analysis?.tone || 'Standard'}</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Total Corrections</div>
                          <div className="text-base font-bold text-stone-900 dark:text-white mt-0.5">{data.changes?.length || 0}</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Word Count</div>
                          <div className="text-base font-bold text-stone-900 dark:text-white mt-0.5">{data.analysis?.wordCount || 0}</div>
                        </div>
                      </div>

                      {/* Tab toggles */}
                      <div className="flex items-center gap-2 border-b border-stone-200 dark:border-white/[0.08] pb-2 text-xs">
                        <button
                          type="button"
                          onClick={() => setWritingTab('improved')}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            writingTab === 'improved'
                              ? 'bg-emerald-600 text-white'
                              : 'text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white'
                          }`}
                        >
                          Improved Outcome (পরিমার্জিত রূপ)
                        </button>
                        <button
                          type="button"
                          onClick={() => setWritingTab('original')}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            writingTab === 'original'
                              ? 'bg-emerald-600 text-white'
                              : 'text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white'
                          }`}
                        >
                          Original Draft (মূল খসড়া)
                        </button>
                        <button
                          type="button"
                          onClick={() => setWritingTab('changes')}
                          className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                            writingTab === 'changes'
                              ? 'bg-emerald-600 text-white'
                              : 'text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-white'
                          }`}
                        >
                          Change Log ({data.changes?.length || 0})
                        </button>
                      </div>

                      {/* Tab Content */}
                      {writingTab === 'improved' && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#10141f] border border-stone-200 dark:border-white/[0.08] font-bangla text-base leading-relaxed text-stone-900 dark:text-white max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
                          {data.improvedText}
                        </div>
                      )}

                      {writingTab === 'original' && (
                        <div className="p-4 rounded-2xl bg-white dark:bg-[#10141f] border border-stone-200 dark:border-white/[0.08] font-bangla text-base leading-relaxed text-stone-700 dark:text-neutral-300 max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
                          {data.originalText}
                        </div>
                      )}

                      {writingTab === 'changes' && (
                        <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
                          {data.changes && data.changes.length > 0 ? (
                            data.changes.map((c, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08] text-xs space-y-1.5"
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2 font-bangla text-sm">
                                    <span className="line-through text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded">
                                      {c.original}
                                    </span>
                                    <span>➔</span>
                                    <span className="font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-1.5 py-0.5 rounded">
                                      {c.replacement}
                                    </span>
                                  </div>
                                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-stone-100 dark:bg-white/[0.06] text-stone-600 dark:text-neutral-400">
                                    {c.type}
                                  </span>
                                </div>
                                <p className="text-stone-600 dark:text-neutral-400 font-bangla text-[11px] leading-relaxed">
                                  {c.explanation}
                                </p>
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-stone-500">No specific change items recorded.</p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* 3. Voice Transcription Full Outcome Details */}
                {selectedOutcomeItem.type === 'voice' && (() => {
                  const data = selectedOutcomeItem.data as TranscriptionResult;
                  return (
                    <div className="space-y-5">
                      {/* Metric highlights */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Dialect Normalization</div>
                          <div className="text-xs font-bold text-sky-700 dark:text-sky-400 mt-0.5 truncate">{data.detectedDialect || 'Standard Bangla'}</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Speakers</div>
                          <div className="text-base font-bold text-stone-900 dark:text-white mt-0.5">{data.speakers?.length || 1} turns</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Action Items</div>
                          <div className="text-base font-bold text-stone-900 dark:text-white mt-0.5">{data.keyActionItems?.length || 0}</div>
                        </div>
                        <div className="p-3.5 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08]">
                          <div className="text-[10px] uppercase font-mono text-stone-500 dark:text-neutral-400">Transcript Length</div>
                          <div className="text-base font-bold text-stone-900 dark:text-white mt-0.5">{(data.fullTranscript || '').split(/\s+/).length} words</div>
                        </div>
                      </div>

                      {/* Audio Executive Summary */}
                      {data.summary && (
                        <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200/80 dark:bg-sky-950/30 dark:border-sky-800/40 space-y-1.5">
                          <div className="text-xs font-bold text-sky-900 dark:text-sky-300 uppercase tracking-wide flex items-center gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                            <span>Audio Executive Summary</span>
                          </div>
                          <p className="text-xs sm:text-sm font-bangla text-stone-800 dark:text-neutral-200 leading-relaxed">
                            {data.summary}
                          </p>
                        </div>
                      )}

                      {/* Transcripts: Standard vs Verbatim */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setVoiceTab('standard')}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                voiceTab === 'standard'
                                  ? 'bg-sky-600 text-white'
                                  : 'text-stone-600 dark:text-neutral-400'
                              }`}
                            >
                              Standard Formatted (প্রমিত)
                            </button>
                            <button
                              type="button"
                              onClick={() => setVoiceTab('verbatim')}
                              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                                voiceTab === 'verbatim'
                                  ? 'bg-sky-600 text-white'
                                  : 'text-stone-600 dark:text-neutral-400'
                              }`}
                            >
                              Verbatim Dialect (আঞ্চলিক)
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleCopy('voice-full', voiceTab === 'standard' ? data.normalizedTranscript || data.fullTranscript : data.fullTranscript)}
                            className="text-xs text-sky-700 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            <span>{copiedId === 'voice-full' ? 'Copied!' : 'Copy'}</span>
                          </button>
                        </div>

                        <div className="p-4 rounded-2xl bg-white dark:bg-[#10141f] border border-stone-200 dark:border-white/[0.08] font-bangla text-base leading-relaxed text-stone-900 dark:text-white max-h-72 overflow-y-auto whitespace-pre-wrap select-text">
                          {voiceTab === 'standard'
                            ? data.normalizedTranscript || data.fullTranscript
                            : data.fullTranscript}
                        </div>
                      </div>

                      {/* Speaker turns */}
                      {data.speakers && data.speakers.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-bold text-stone-800 dark:text-neutral-200">
                            Speaker Diarization Turns:
                          </span>
                          <div className="space-y-2">
                            {data.speakers.map((spk, i) => (
                              <div
                                key={i}
                                className="p-3 rounded-xl bg-white dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08] space-y-1 text-xs"
                              >
                                <div className="flex items-center justify-between text-stone-500 font-mono text-[11px]">
                                  <span className="font-bold text-sky-700 dark:text-sky-400">{spk.speaker}</span>
                                  <span>{spk.timeEstimate}</span>
                                </div>
                                <p className="font-bangla text-stone-900 dark:text-white text-sm">{spk.text}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
