import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, X, Share, PlusSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface PWAInstallButtonProps {
  className?: string;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const { language } = useLanguage();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  // If already installed in standalone mode, do not show install prompt
  if (isInstalled || isDismissed) {
    return null;
  }

  // If neither installable via beforeinstallprompt nor iOS Safari, hide button
  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
    } else {
      await install();
    }
  };

  return (
    <>
      {/* Floating Install Banner (docked bottom-right, mobile bottom) */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className={`fixed bottom-20 sm:bottom-6 right-3 sm:right-6 z-40 max-w-sm w-[calc(100vw-1.5rem)] sm:w-auto p-3.5 rounded-2xl bg-white/95 dark:bg-[#0c121d]/95 backdrop-blur-xl border border-teal-500/30 shadow-xl shadow-stone-950/10 dark:shadow-black/50 ${className}`}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src="/pwa-192x192.png"
                alt="KothaLipi App Icon"
                className="w-10 h-10 rounded-xl shadow-sm border border-teal-500/20"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-brand font-black text-sm text-stone-900 dark:text-white">
                    KothaLipi AI
                  </span>
                  <span className="text-[9px] font-mono font-bold px-1 py-0.2 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                    PWA
                  </span>
                </div>
                <p className="text-[11px] text-stone-500 dark:text-neutral-400 mt-0.5">
                  {language === 'en'
                    ? 'Install on Home Screen for instant offline speed.'
                    : 'দ্রুত ব্যবহার করতে হোম স্ক্রিনে অ্যাপ ইনস্টল করুন।'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleInstallClick}
                className="px-3 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:hover:bg-teal-400 dark:text-neutral-950 font-bold text-xs shadow-sm transition-all hover:scale-105 active:scale-95 shrink-0 flex items-center gap-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{language === 'en' ? 'Install' : 'ইনস্টল'}</span>
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors"
                aria-label="Dismiss banner"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* iOS Safari Guided Install Sheet */}
      <AnimatePresence>
        {showIOSModal && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowIOSModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              className="relative w-full max-w-md bg-white dark:bg-[#0c1017] rounded-3xl p-6 border border-stone-200 dark:border-white/[0.1] shadow-2xl z-50 space-y-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/apple-touch-icon.png"
                    alt="KothaLipi"
                    className="w-10 h-10 rounded-xl border border-teal-500/25"
                  />
                  <div>
                    <h3 className="font-brand font-bold text-base text-stone-900 dark:text-white">
                      {language === 'en'
                        ? 'Install KothaLipi on iPhone / iPad'
                        : 'আইফোন / আইপ্যাডে ইনস্টল করুন'}
                    </h3>
                    <p className="text-xs text-stone-500 dark:text-neutral-400">
                      {language === 'en'
                        ? 'Run like a native iOS application'
                        : 'নেটিভ অ্যাপের মত ব্যবহার করুন'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIOSModal(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-stone-700 dark:text-neutral-300 bg-stone-100/80 dark:bg-white/[0.03] p-4 rounded-2xl border border-stone-200/80 dark:border-white/[0.06]">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium">
                      {language === 'en' ? (
                        <>
                          Tap the <span className="font-bold inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-white dark:bg-white/10 rounded border border-stone-300 dark:border-white/10"><Share className="w-3 h-3 text-blue-500" /> Share</span> button in Safari's bottom toolbar.
                        </>
                      ) : (
                        <>
                          সাফারি ব্রাউজারের নিচের টুলবারে <span className="font-bold inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-white dark:bg-white/10 rounded border border-stone-300 dark:border-white/10"><Share className="w-3 h-3 text-blue-500" /> শেয়ার</span> বাটনে চাপ দিন।
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium">
                      {language === 'en' ? (
                        <>
                          Scroll down and tap <span className="font-bold inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-white dark:bg-white/10 rounded border border-stone-300 dark:border-white/10"><PlusSquare className="w-3 h-3 text-stone-700 dark:text-stone-300" /> Add to Home Screen</span>.
                        </>
                      ) : (
                        <>
                          নিচে স্ক্রোল করে <span className="font-bold inline-flex items-center gap-1 mx-1 px-1.5 py-0.5 bg-white dark:bg-white/10 rounded border border-stone-300 dark:border-white/10"><PlusSquare className="w-3 h-3 text-stone-700 dark:text-stone-300" /> হোম স্ক্রিনে যোগ করুন</span> সিলেক্ট করুন।
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-teal-500/15 text-teal-700 dark:text-teal-300 font-bold flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium">
                      {language === 'en' ? (
                        <>Tap <strong className="text-teal-700 dark:text-teal-300">Add</strong> in the top-right corner to launch directly from your home screen.</>
                      ) : (
                        <>উপরে ডানপাশে <strong className="text-teal-700 dark:text-teal-300">Add</strong> বাটনে চাপ দিলে হোম স্ক্রিনে আইকন দেখতে পাবেন।</>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white dark:bg-teal-500 dark:text-neutral-950 font-bold text-xs shadow-md transition-all"
              >
                {language === 'en' ? 'Got It' : 'বুঝেছি'}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
