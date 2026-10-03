import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, ShieldCheck, ExternalLink, LogOut, CheckCircle2, Globe, Moon, Sun, Cloud } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  historyCount?: number;
}

export const ProfileSettingsModal: React.FC<ProfileSettingsModalProps> = ({
  isOpen,
  onClose,
  historyCount = 0,
}) => {
  const { user, signOutUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  if (!isOpen || !user) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs"
        />

        {/* Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          transition={{ type: 'spring', duration: 0.3, bounce: 0.15 }}
          className="relative w-full max-w-md bg-white dark:bg-[#0e121d] rounded-2xl border border-stone-200 dark:border-white/[0.1] shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200/80 dark:border-white/[0.08] bg-stone-50/75 dark:bg-white/[0.02]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-stone-900 dark:text-white leading-tight">
                  {language === 'en' ? 'Profile Settings' : 'প্রোফাইল সেটিংস'}
                </h3>
                <p className="text-[11px] text-stone-500 dark:text-neutral-400">
                  {language === 'en' ? 'Manage your account and preferences' : 'অ্যাকাউন্ট ও প্রেফারেন্স পরিচালনা করুন'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:text-neutral-400 dark:hover:text-white hover:bg-stone-200/60 dark:hover:bg-white/[0.08] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
            {/* User Info Card */}
            <div className="flex items-start gap-3.5 p-3.5 rounded-xl bg-stone-100/70 dark:bg-white/[0.03] border border-stone-200/80 dark:border-white/[0.06]">
              <div className="relative shrink-0">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google Profile'}
                    className="w-12 h-12 rounded-full border-2 border-teal-500/50 object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-lg">
                    {user.displayName?.charAt(0) || 'U'}
                  </div>
                )}
                <span
                  className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0e121d] rounded-full shadow-xs ring-1 ring-emerald-500/20"
                  title="Connected"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-bold text-stone-900 dark:text-white text-sm truncate">
                    {user.displayName || 'Google User'}
                  </h4>
                  <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/25">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>{language === 'en' ? 'Active' : 'সক্রিয়'}</span>
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-stone-600 dark:text-neutral-300 mt-1 truncate">
                  <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-neutral-500 shrink-0" />
                  <span className="truncate font-mono select-all text-[11px]" title={user.email || ''}>
                    {user.email}
                  </span>
                </div>

                <p className="text-[10px] text-stone-400 dark:text-neutral-500 mt-1">
                  Google Account ID: <span className="font-mono">{user.uid.slice(0, 10)}...</span>
                </p>
              </div>
            </div>

            {/* Account Quick Actions */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-neutral-500 px-1">
                {language === 'en' ? 'Account Links' : 'অ্যাকাউন্ট লিংক'}
              </label>

              <a
                href="https://myaccount.google.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08] hover:border-teal-500/40 hover:bg-teal-500/[0.02] transition-colors group text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <div>
                    <p className="font-semibold text-stone-800 dark:text-neutral-200">
                      {language === 'en' ? 'Google Account Settings' : 'গুগল অ্যাকাউন্ট সেটিংস'}
                    </p>
                    <p className="text-[10px] text-stone-500 dark:text-neutral-400">
                      myaccount.google.com
                    </p>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
              </a>

              <div className="p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08] text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <span className="font-semibold text-stone-800 dark:text-neutral-200">
                      {language === 'en' ? 'Cloud Synced Records' : 'ক্লাউড সিঙ্ক রেকর্ড'}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300">
                    {historyCount} {language === 'en' ? 'items' : 'আইটেম'}
                  </span>
                </div>
                <p className="text-[10px] text-stone-500 dark:text-neutral-400 mt-1">
                  {language === 'en'
                    ? 'All your OCR scans, writing revisions, and audio transcripts sync to your account.'
                    : 'আপনার সব ওসিআর স্ক্যান, প্রুফরিডিং এবং অডিও ট্রান্সক্রিপ্ট অ্যাকাউন্টে সংরক্ষিত থাকে।'}
                </p>
              </div>
            </div>

            {/* Preferences */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold uppercase tracking-wider text-stone-400 dark:text-neutral-500 px-1">
                {language === 'en' ? 'Preferences' : 'পছন্দসমূহ'}
              </label>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-stone-500 dark:text-neutral-400" />
                  <span className="font-medium text-stone-800 dark:text-neutral-200">
                    {language === 'en' ? 'Language' : 'ভাষা'}
                  </span>
                </div>
                <div className="flex items-center gap-1 bg-stone-100 dark:bg-white/[0.06] p-0.5 rounded-lg border border-stone-200 dark:border-white/[0.08]">
                  <button
                    type="button"
                    onClick={() => setLanguage('en')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                      language === 'en'
                        ? 'bg-white dark:bg-white/[0.15] text-stone-900 dark:text-white shadow-xs'
                        : 'text-stone-500 dark:text-neutral-400'
                    }`}
                  >
                    English
                  </button>
                  <button
                    type="button"
                    onClick={() => setLanguage('bn')}
                    className={`px-2 py-0.5 rounded-md text-[11px] font-bangla font-semibold transition-all ${
                      language === 'bn'
                        ? 'bg-white dark:bg-white/[0.15] text-stone-900 dark:text-white shadow-xs'
                        : 'text-stone-500 dark:text-neutral-400'
                    }`}
                  >
                    বাংলা
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-white/[0.02] border border-stone-200 dark:border-white/[0.08] text-xs">
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <Moon className="w-4 h-4 text-amber-400" />
                  ) : (
                    <Sun className="w-4 h-4 text-amber-600" />
                  )}
                  <span className="font-medium text-stone-800 dark:text-neutral-200">
                    {language === 'en' ? 'Interface Theme' : 'ইন্টারফেস থিম'}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={(e) => toggleTheme({ x: e.clientX, y: e.clientY })}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-stone-100 hover:bg-stone-200/80 dark:bg-white/[0.06] dark:hover:bg-white/[0.1] text-stone-700 dark:text-neutral-300 border border-stone-200 dark:border-white/[0.08] transition-colors"
                >
                  {theme === 'dark'
                    ? language === 'en' ? 'Dark Mode' : 'ডার্ক মোড'
                    : language === 'en' ? 'Light Mode' : 'লাইট মোড'}
                </button>
              </div>
            </div>
          </div>

          {/* Footer with Sign Out */}
          <div className="p-4 border-t border-stone-200/80 dark:border-white/[0.08] bg-stone-50/75 dark:bg-white/[0.02] flex items-center justify-between">
            <span className="text-[11px] text-stone-500 dark:text-neutral-400">
              KothaLipi AI v1.0
            </span>

            <button
              type="button"
              onClick={() => {
                signOutUser();
                onClose();
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100/80 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/30 text-xs font-semibold transition-all duration-150 active:scale-95 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>{language === 'en' ? 'Sign Out' : 'সাইন আউট'}</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
