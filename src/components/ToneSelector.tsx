import React, { useState } from 'react';
import {
  Briefcase,
  Sparkles,
  MessageSquare,
  GraduationCap,
  Zap,
  Sliders,
  Loader2,
  Wand2,
} from 'lucide-react';
import { ProofreadMode } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

interface ToneSelectorProps {
  currentMode: ProofreadMode;
  onApplyTone: (mode: ProofreadMode, customToneText?: string) => void;
  isLoading: boolean;
  disabled: boolean;
}

export const ToneSelector: React.FC<ToneSelectorProps> = ({
  currentMode,
  onApplyTone,
  isLoading,
  disabled,
}) => {
  const { t, language } = useLanguage();
  const [selectedTone, setSelectedTone] = useState<ProofreadMode>(
    currentMode.startsWith('tone_') ? currentMode : 'tone_formal'
  );
  const [customToneText, setCustomToneText] = useState<string>('');

  const tones = [
    {
      id: 'tone_formal' as ProofreadMode,
      label: t.writerToneProfessional,
      desc: t.writerToneProfessionalDesc,
      icon: Briefcase,
      badge: 'B2B / Govt',
      accentColor: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-800/40',
    },
    {
      id: 'tone_creative' as ProofreadMode,
      label: t.writerToneCreative,
      desc: t.writerToneCreativeDesc,
      icon: Sparkles,
      badge: 'Poetic',
      accentColor: 'text-fuchsia-600 dark:text-fuchsia-400 bg-fuchsia-50 dark:bg-fuchsia-950/40 border-fuchsia-200 dark:border-fuchsia-800/40',
    },
    {
      id: 'tone_conversational' as ProofreadMode,
      label: t.writerToneConversational,
      desc: t.writerToneConversationalDesc,
      icon: MessageSquare,
      badge: 'Social / Chat',
      accentColor: 'text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800/40',
    },
    {
      id: 'tone_academic' as ProofreadMode,
      label: t.writerToneAcademic,
      desc: t.writerToneAcademicDesc,
      icon: GraduationCap,
      badge: 'Scholarly',
      accentColor: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/40',
    },
    {
      id: 'tone_persuasive' as ProofreadMode,
      label: t.writerTonePersuasive,
      desc: t.writerTonePersuasiveDesc,
      icon: Zap,
      badge: 'Pitch / Speech',
      accentColor: 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/40',
    },
    {
      id: 'tone_custom' as ProofreadMode,
      label: t.writerToneCustom,
      desc: language === 'en' ? 'Prompt AI with your own specific tone instructions' : 'আপনার পছন্দসই নিজস্ব নির্দেশনা অনুযায়ী রূপান্তর',
      icon: Sliders,
      badge: 'Custom Prompt',
      accentColor: 'text-teal-700 dark:text-teal-300 bg-stone-100 dark:bg-white/[0.04] border-stone-200 dark:border-white/[0.08]',
    },
  ];

  const handleSelect = (mode: ProofreadMode) => {
    setSelectedTone(mode);
  };

  const handleExecute = (modeToRun: ProofreadMode = selectedTone) => {
    onApplyTone(modeToRun, modeToRun === 'tone_custom' ? customToneText : undefined);
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-stone-200/90 dark:border-white/[0.08] space-y-4">
      {/* Title & AI Tag */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-200/80 dark:border-white/[0.06] pb-3">
        <div>
          <div className="flex items-center gap-2">
            <Wand2 className="w-4 h-4 text-teal-700 dark:text-teal-400" />
            <h2 className="text-sm font-bold text-stone-900 dark:text-white font-sans">
              {t.writerToneTitle}
            </h2>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-teal-50 border border-teal-200 text-teal-800 dark:bg-teal-950/50 dark:border-teal-800/50 dark:text-teal-300 uppercase tracking-wider">
              Gemini AI
            </span>
          </div>
          <p className="text-xs text-stone-500 dark:text-neutral-400 mt-0.5">
            {t.writerToneSubtitle}
          </p>
        </div>

        {/* Action Button */}
        <button
          type="button"
          onClick={() => handleExecute()}
          disabled={disabled || isLoading || (selectedTone === 'tone_custom' && !customToneText.trim())}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-neutral-950 font-semibold text-xs rounded-xl shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 self-start sm:self-auto shrink-0"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{t.writerProcessing}</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t.writerToneApplyBtn}</span>
            </>
          )}
        </button>
      </div>

      {/* Tone Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {tones.map((tone) => {
          const Icon = tone.icon;
          const isSelected = selectedTone === tone.id;

          return (
            <button
              key={tone.id}
              type="button"
              onClick={() => handleSelect(tone.id)}
              className={`p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-teal-700/5 dark:bg-teal-500/10 border-teal-600/50 dark:border-teal-400/50 shadow-xs ring-1 ring-teal-600/30 dark:ring-teal-400/30'
                  : 'bg-white hover:bg-stone-50 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border-stone-200/90 dark:border-white/[0.07]'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${tone.accentColor}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-bold text-xs text-stone-900 dark:text-white">
                    {tone.label}
                  </span>
                </div>

                <span className="text-[10px] font-mono text-stone-400 dark:text-neutral-500 uppercase tracking-tight">
                  {tone.badge}
                </span>
              </div>

              <p className="text-[11px] text-stone-500 dark:text-neutral-400 mt-2 leading-relaxed font-sans line-clamp-2">
                {tone.desc}
              </p>

              {isSelected && (
                <div className="mt-2.5 flex items-center justify-between pt-2 border-t border-teal-600/15 dark:border-teal-400/20 text-[10px] text-teal-700 dark:text-teal-300 font-bold uppercase tracking-wider">
                  <span>Selected</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-600 dark:bg-teal-400 animate-pulse" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Expandable Custom Tone Input */}
      <AnimatePresence>
        {selectedTone === 'tone_custom' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-2">
              <div className="p-3 bg-white dark:bg-black/30 rounded-xl border border-stone-200/90 dark:border-white/[0.07] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <input
                  type="text"
                  value={customToneText}
                  onChange={(e) => setCustomToneText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && customToneText.trim()) {
                      handleExecute('tone_custom');
                    }
                  }}
                  placeholder={t.writerToneCustomPlaceholder}
                  className="flex-1 px-3 py-2 text-xs bg-stone-50 dark:bg-white/[0.03] border border-stone-200 dark:border-white/[0.08] rounded-lg text-stone-900 dark:text-white placeholder-stone-400 dark:placeholder-neutral-500 focus:outline-none focus:border-teal-600 dark:focus:border-teal-400"
                />
                <button
                  type="button"
                  onClick={() => handleExecute('tone_custom')}
                  disabled={!customToneText.trim() || isLoading || disabled}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:text-neutral-950 font-bold text-xs rounded-lg transition-all disabled:opacity-40 shrink-0"
                >
                  {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : t.writerToneApplyBtn}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
