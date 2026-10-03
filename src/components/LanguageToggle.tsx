import React from 'react';
import { Globe } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export const LanguageToggle: React.FC = () => {
  const { language, toggleLanguage } = useLanguage();

  return (
    <button
      type="button"
      onClick={toggleLanguage}
      aria-label={language === 'en' ? 'Switch to Bengali' : 'Switch to English'}
      title={language === 'en' ? 'বাংলা ভাষায় পরিবর্তন করুন (Switch to Bengali)' : 'Switch to English (ইংরেজি ভাষায় পরিবর্তন করুন)'}
      className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-200/60 dark:bg-white/[0.04] border border-stone-300/70 dark:border-white/[0.08] hover:border-stone-400 dark:hover:border-white/[0.15] transition-all text-xs shadow-2xs group"
    >
      <div className="flex items-center justify-center pl-1 text-stone-500 dark:text-neutral-400 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
        <Globe className="w-3.5 h-3.5" />
      </div>

      <div className="flex items-center relative p-0.5 rounded-lg">
        {/* EN option */}
        <div
          className={`relative z-10 px-2 py-0.5 text-[11px] font-mono font-bold tracking-tight rounded-md transition-colors ${
            language === 'en'
              ? 'text-stone-900 dark:text-white'
              : 'text-stone-500 dark:text-neutral-400 hover:text-stone-800 dark:hover:text-neutral-200'
          }`}
        >
          EN
          {language === 'en' && (
            <motion.div
              layoutId="languageActivePill"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              className="absolute inset-0 bg-white dark:bg-white/[0.12] border border-stone-300 dark:border-white/[0.14] rounded-md -z-10 shadow-2xs"
            />
          )}
        </div>

        {/* BN option */}
        <div
          className={`relative z-10 px-2 py-0.5 text-[11px] font-bangla font-bold tracking-tight rounded-md transition-colors ${
            language === 'bn'
              ? 'text-stone-900 dark:text-white'
              : 'text-stone-500 dark:text-neutral-400 hover:text-stone-800 dark:hover:text-neutral-200'
          }`}
        >
          বাং
          {language === 'bn' && (
            <motion.div
              layoutId="languageActivePill"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.35 }}
              className="absolute inset-0 bg-white dark:bg-white/[0.12] border border-stone-300 dark:border-white/[0.14] rounded-md -z-10 shadow-2xs"
            />
          )}
        </div>
      </div>
    </button>
  );
};
