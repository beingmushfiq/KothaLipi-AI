import React from 'react';
import { Cpu, CloudOff, RefreshCw, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useEngine } from '../context/EngineContext';
import { useLanguage } from '../context/LanguageContext';

/**
 * Small dismissible banner that tells the user the app has automatically
 * switched from cloud AI to on-device engines (free, no API key, lower quality).
 */
export const EngineStatusBanner: React.FC = () => {
  const { cloudUnavailable, reason, retryCloud } = useEngine();
  const { language } = useLanguage();
  const [dismissed, setDismissed] = React.useState(false);

  React.useEffect(() => {
    if (!cloudUnavailable) setDismissed(false);
  }, [cloudUnavailable]);

  const message =
    reason === 'no_key'
      ? language === 'en'
        ? 'Cloud AI is not configured — running in on-device mode (free, no API key).'
        : 'ক্লাউড এআই কনফিগার করা নেই — অন-ডিভাইস মোডে চলছে (ফ্রি, এপিআই কী ছাড়াই)।'
      : language === 'en'
        ? 'Free cloud quota reached — automatically switched to on-device mode.'
        : 'ফ্রি ক্লাউড কোটা শেষ — স্বয়ংক্রিয়ভাবে অন-ডিভাইস মোডে চলে গেছে।';

  return (
    <AnimatePresence>
      {cloudUnavailable && !dismissed && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="mb-4"
        >
          <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs sm:text-sm">
            <Cpu className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
            <span className={`flex-1 leading-relaxed ${language === 'bn' ? 'font-bangla' : ''}`}>
              {message}
            </span>
            <button
              type="button"
              onClick={retryCloud}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg font-semibold bg-white/70 dark:bg-white/[0.06] hover:bg-white dark:hover:bg-white/[0.1] border border-amber-300 dark:border-amber-500/30 transition-colors shrink-0"
              title={language === 'en' ? 'Retry cloud AI' : 'ক্লাউড এআই আবার চেষ্টা করুন'}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {language === 'en' ? 'Retry cloud' : 'ক্লাউড চেষ্টা'}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setDismissed(true)}
              className="p-1 rounded-lg hover:bg-white/70 dark:hover:bg-white/[0.1] transition-colors shrink-0"
              title={language === 'en' ? 'Dismiss' : 'বন্ধ করুন'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
