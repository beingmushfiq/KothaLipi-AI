import React, { useState } from 'react';
import { COMMON_BENGALI_CHARS } from '../utils/avroPhonetic';
import { ChevronDown, ChevronUp, Keyboard } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface BengaliVirtualKeyboardProps {
  onInsertChar: (char: string) => void;
  avroEnabled: boolean;
  onToggleAvro: () => void;
}

const BENGALI_NUMBERS = ['১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯', '০'];
const BENGALI_PUNCTUATION = ['।', '‘', '’', '“', '”', '—', '?', '!'];
const COMMON_LIGATURES = [
  { char: 'ক্ষ', name: 'ক+ষ' },
  { char: 'জ্ঞ', name: 'জ+ঞ' },
  { char: 'ষ্ণ', name: 'ষ+ণ' },
  { char: 'ত্র', name: 'ত+র' },
  { char: 'শ্র', name: 'শ+র' },
  { char: 'দ্ধ', name: 'দ+ধ' },
  { char: 'ন্দ', name: 'ন+দ' },
  { char: 'ম্প', name: 'ম+প' },
  { char: 'ন্ত', name: 'ন+ত' },
  { char: 'ঙ্ক', name: 'ঙ+ক' },
];

export const BengaliVirtualKeyboard: React.FC<BengaliVirtualKeyboardProps> = ({
  onInsertChar,
  avroEnabled,
  onToggleAvro,
}) => {
  const { t, language } = useLanguage();
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="glass-panel rounded-xl p-3 border border-stone-200/90 dark:border-white/[0.07] transition-all">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleAvro}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              avroEnabled
                ? 'bg-teal-700 text-white border border-teal-800 shadow-sm dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/40'
                : 'bg-stone-100 hover:bg-stone-200/70 text-stone-700 border border-stone-200 dark:bg-white/[0.04] dark:text-neutral-400 dark:border-white/[0.07] dark:hover:text-neutral-200 dark:hover:bg-white/[0.07]'
            }`}
          >
            <Keyboard className="w-3.5 h-3.5" />
            <span className={language === 'bn' ? 'font-bangla' : 'font-sans'}>
              {t.writerAvroPhonetic}{' '}
              <strong className={avroEnabled ? 'text-white dark:text-teal-300' : 'text-stone-500 dark:text-neutral-500'}>
                {avroEnabled ? t.writerAvroOn : t.writerAvroOff}
              </strong>
            </span>
          </button>
          <span className={`text-stone-500 dark:text-neutral-500 hidden lg:inline text-[11px] ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
            {t.writerAvroHint}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1.5 text-stone-600 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-neutral-200 text-xs px-2.5 py-1 rounded-md hover:bg-stone-100 dark:hover:bg-white/[0.05] transition-colors"
        >
          <span className={language === 'bn' ? 'font-bangla' : 'font-sans'}>{t.writerVirtualKeys}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 pt-3 border-t border-stone-200 dark:border-white/[0.06] space-y-3">
              {/* Special Characters & Diacritics */}
              <div>
                <div className={`text-[11px] text-stone-600 dark:text-neutral-400 mb-1.5 font-medium ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
                  {t.writerDiacritics}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_BENGALI_CHARS.map((item) => (
                    <button
                      key={item.char}
                      type="button"
                      onClick={() => onInsertChar(item.char)}
                      title={item.name}
                      className="min-w-8 h-8 px-2 bg-white hover:bg-stone-100 active:scale-95 text-stone-800 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-neutral-200 text-sm rounded-md border border-stone-200 dark:border-white/[0.08] font-bangla flex items-center justify-center transition-all shadow-2xs"
                    >
                      {item.char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Common Compound Ligatures */}
              <div>
                <div className={`text-[11px] text-stone-600 dark:text-neutral-400 mb-1.5 font-medium ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
                  {t.writerLigatures}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {COMMON_LIGATURES.map((lig) => (
                    <button
                      key={lig.char}
                      type="button"
                      onClick={() => onInsertChar(lig.char)}
                      title={lig.name}
                      className="h-8 px-2.5 bg-white hover:bg-stone-100 active:scale-95 text-stone-800 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-neutral-200 text-xs rounded-md border border-stone-200 dark:border-white/[0.08] font-bangla flex items-center justify-center transition-all shadow-2xs"
                    >
                      {lig.char}
                    </button>
                  ))}
                </div>
              </div>

              {/* Numbers & Bengali Punctuation */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-200 dark:border-white/[0.05]">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[11px] text-stone-600 dark:text-neutral-400 mr-1 ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
                    {t.writerNumbers}
                  </span>
                  {BENGALI_NUMBERS.map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => onInsertChar(num)}
                      className="w-7 h-7 bg-white hover:bg-stone-100 active:scale-95 text-stone-800 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-neutral-300 text-xs rounded border border-stone-200 dark:border-white/[0.07] font-bangla flex items-center justify-center transition-all shadow-2xs"
                    >
                      {num}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className={`text-[11px] text-stone-600 dark:text-neutral-400 mr-1 ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
                    {t.writerPunctuation}
                  </span>
                  {BENGALI_PUNCTUATION.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => onInsertChar(p)}
                      className="w-7 h-7 bg-white hover:bg-stone-100 active:scale-95 text-stone-800 dark:bg-white/[0.04] dark:hover:bg-white/[0.1] dark:text-neutral-300 text-xs rounded border border-stone-200 dark:border-white/[0.07] font-bangla flex items-center justify-center transition-all shadow-2xs"
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
