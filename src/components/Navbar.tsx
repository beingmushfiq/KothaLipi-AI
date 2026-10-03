import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab } from '../types';
import { ScanText, PenTool, Mic, History, LogIn, LogOut, User, Cloud, Settings, Mail, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeToggle } from './ThemeToggle';
import { LanguageToggle } from './LanguageToggle';
import { ProfileSettingsModal } from './ProfileSettingsModal';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { BrandLogo } from './BrandLogo';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, historyCount }) => {
  const { t, language } = useLanguage();
  const { user, signInWithGoogle, signOutUser } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [profileSettingsOpen, setProfileSettingsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutside);
    return () => document.removeEventListener('mousedown', handleOutside);
  }, []);

  const navTabs = [
    {
      id: 'ocr' as ActiveTab,
      label: t.navOcr,
      icon: ScanText,
      color: 'teal',
      activeText: 'text-white font-bold',
      activeBg: 'bg-gradient-to-r from-teal-600 to-teal-700 dark:from-teal-600 dark:to-teal-700 border-teal-500/50 shadow-md shadow-teal-700/25 ring-1 ring-teal-400/30',
      iconActiveBg: 'bg-white/20 text-white shadow-2xs',
      iconInactive: 'bg-teal-500/12 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300 border border-teal-500/25 group-hover:bg-teal-500/20 group-hover:scale-105',
      inactiveText: 'text-teal-950/80 dark:text-teal-200/80 hover:text-teal-950 dark:hover:text-white hover:bg-teal-500/10 dark:hover:bg-teal-500/15',
    },
    {
      id: 'writer' as ActiveTab,
      label: t.navWriter,
      icon: PenTool,
      color: 'emerald',
      activeText: 'text-white font-bold',
      activeBg: 'bg-gradient-to-r from-emerald-600 to-emerald-700 dark:from-emerald-600 dark:to-emerald-700 border-emerald-500/50 shadow-md shadow-emerald-700/25 ring-1 ring-emerald-400/30',
      iconActiveBg: 'bg-white/20 text-white shadow-2xs',
      iconInactive: 'bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300 border border-emerald-500/25 group-hover:bg-emerald-500/20 group-hover:scale-105',
      inactiveText: 'text-emerald-950/80 dark:text-emerald-200/80 hover:text-emerald-950 dark:hover:text-white hover:bg-emerald-500/10 dark:hover:bg-emerald-500/15',
    },
    {
      id: 'voice' as ActiveTab,
      label: t.navVoice,
      icon: Mic,
      color: 'sky',
      activeText: 'text-white font-bold',
      activeBg: 'bg-gradient-to-r from-sky-600 to-sky-700 dark:from-sky-600 dark:to-sky-700 border-sky-500/50 shadow-md shadow-sky-700/25 ring-1 ring-sky-400/30',
      iconActiveBg: 'bg-white/20 text-white shadow-2xs',
      iconInactive: 'bg-sky-500/12 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300 border border-sky-500/25 group-hover:bg-sky-500/20 group-hover:scale-105',
      inactiveText: 'text-sky-950/80 dark:text-sky-200/80 hover:text-sky-950 dark:hover:text-white hover:bg-sky-500/10 dark:hover:bg-sky-500/15',
    },
    {
      id: 'history' as ActiveTab,
      label: t.navArchive,
      icon: History,
      color: 'indigo',
      count: historyCount,
      activeText: 'text-white font-bold',
      activeBg: 'bg-gradient-to-r from-indigo-600 to-violet-700 dark:from-indigo-600 dark:to-violet-700 border-indigo-500/50 shadow-md shadow-indigo-700/25 ring-1 ring-indigo-400/30',
      iconActiveBg: 'bg-white/20 text-white shadow-2xs',
      iconInactive: 'bg-indigo-500/12 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300 border border-indigo-500/25 group-hover:bg-indigo-500/20 group-hover:scale-105',
      inactiveText: 'text-indigo-950/80 dark:text-indigo-200/80 hover:text-indigo-950 dark:hover:text-white hover:bg-indigo-500/10 dark:hover:bg-indigo-500/15',
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#f7f6f2]/90 dark:bg-[#07090e]/85 backdrop-blur-xl border-b border-stone-200/80 dark:border-white/[0.07] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 sm:h-20 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-3">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('ocr');
            }}
            className="group flex items-center gap-3"
          >
            <BrandLogo size="md" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-brand font-black text-lg sm:text-xl tracking-tight text-stone-900 dark:text-white group-hover:text-teal-700 dark:group-hover:text-teal-300 transition-colors leading-none">
                  {t.brandName}
                </span>
                <span className="font-bangla-brand text-xs sm:text-sm font-bold text-teal-700 dark:text-teal-400 leading-none">
                  {language === 'en' ? 'কথালিপি' : 'KothaLipi'}
                </span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300 border border-teal-500/25 tracking-wider">
                  AI
                </span>
              </div>
              <span className={`text-[11px] text-stone-500 dark:text-neutral-400 tracking-wide mt-1 leading-none ${language === 'bn' ? 'font-bangla' : 'font-sans'}`}>
                {t.brandSubtitle}
              </span>
            </div>
          </a>
        </div>

        {/* Zone 2: Segmented Nav Dock with Proper Pill-Shaped Module Buttons */}
        <nav className="hidden md:flex items-center p-1.5 bg-stone-200/60 dark:bg-white/[0.04] border border-stone-300/70 dark:border-white/[0.08] rounded-full relative gap-1 shadow-inner backdrop-blur-md">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group relative px-4.5 py-2.5 sm:px-5 sm:py-2.5 rounded-full text-xs sm:text-sm font-semibold transition-all whitespace-nowrap z-10 flex items-center gap-2.5 ${
                  isActive
                    ? tab.activeText
                    : tab.inactiveText
                }`}
              >
                {isActive && (
                  <motion.div
                    layoutId="navbarActiveIndicator"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.42 }}
                    className={`absolute inset-0 rounded-full border -z-10 ${tab.activeBg}`}
                  />
                )}
                {/* Subtle context-aware visual cue icon badge */}
                <div
                  className={`w-6 h-6 sm:w-6.5 sm:h-6.5 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isActive
                      ? tab.iconActiveBg
                      : tab.iconInactive
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform group-hover:scale-110" />
                </div>
                <span className={language === 'bn' ? 'font-bangla tracking-wide' : 'font-sans'}>
                  {tab.label}
                </span>
                {typeof tab.count === 'number' && tab.count > 0 && (
                  <span
                    className={`text-[10px] sm:text-[11px] tabular-nums font-mono px-2 py-0.5 rounded-full font-bold transition-colors ${
                      isActive
                        ? 'bg-white/25 text-white border border-white/30'
                        : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800/50'
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Language Toggle + Theme Toggle + Google Auth */}
        <div className="flex items-center gap-1 sm:gap-2.5">
          <LanguageToggle />
          <ThemeToggle />

          {/* Google Sign In / Profile */}
          <div className="relative ml-0.5 sm:ml-1" ref={dropdownRef}>
            {user ? (
              <div>
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen((prev) => !prev)}
                  className="flex items-center gap-1.5 p-1 sm:px-2 sm:py-1 rounded-xl bg-white hover:bg-stone-50 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] border border-stone-300 dark:border-white/[0.1] transition-all duration-150 shadow-2xs group shrink-0 hover:scale-[1.02] active:scale-95 cursor-pointer select-none"
                  title={user.email ? `${user.displayName || 'User'} (${user.email}) · ${language === 'en' ? 'Connected' : 'সংযুক্ত'}` : 'User Account · Connected'}
                >
                  <div className="relative shrink-0">
                    {user.photoURL ? (
                      <img
                        src={user.photoURL}
                        alt={user.displayName || 'Google Profile'}
                        className="w-6 h-6 rounded-full border border-teal-500/50 object-cover"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-teal-600 text-white font-bold flex items-center justify-center text-xs">
                        {user.displayName?.charAt(0) || 'U'}
                      </div>
                    )}
                    {/* Visual Account Status Indicator: Green Dot for Connected */}
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#07090e] rounded-full shadow-2xs ring-1 ring-emerald-500/20"
                      title={language === 'en' ? 'Account Connected' : 'অ্যাকাউন্ট সংযুক্ত'}
                      aria-label="Account Connected"
                    >
                      <span className="sr-only">Connected</span>
                    </span>
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-stone-800 dark:text-neutral-200 max-w-[100px] truncate">
                    {user.displayName?.split(' ')[0] || 'Account'}
                  </span>
                </button>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {userDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-64 p-2 rounded-2xl bg-white dark:bg-[#0d111a] border border-stone-200 dark:border-white/[0.1] shadow-2xl z-50 text-xs"
                    >
                      {/* User Header & Email */}
                      <div className="px-3 py-2.5 border-b border-stone-200/80 dark:border-white/[0.06] mb-1.5 bg-stone-50/60 dark:bg-white/[0.02] rounded-xl">
                        <div className="flex items-center justify-between gap-1.5 mb-1.5">
                          <p className="font-bold text-stone-900 dark:text-white truncate text-xs">
                            {user.displayName || 'Google Account'}
                          </p>
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400 border border-emerald-500/25 shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span>{language === 'en' ? 'Connected' : 'সংযুক্ত'}</span>
                          </span>
                        </div>

                        {/* User Email Container */}
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-stone-200/60 dark:bg-white/[0.06] text-stone-600 dark:text-neutral-300">
                          <Mail className="w-3.5 h-3.5 text-stone-400 dark:text-neutral-400 shrink-0" />
                          <span
                            className="text-[11px] font-mono truncate select-all"
                            title={user.email || ''}
                          >
                            {user.email}
                          </span>
                        </div>
                      </div>

                      {/* Dropdown Action Links */}
                      <div className="space-y-0.5">
                        {/* Profile Settings Link */}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileSettingsOpen(true);
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-stone-700 dark:text-neutral-300 hover:bg-stone-100 dark:hover:bg-white/[0.06] rounded-xl font-medium transition-colors group cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <Settings className="w-4 h-4 text-stone-500 dark:text-neutral-400 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors" />
                            <span>{language === 'en' ? 'Profile Settings' : 'প্রোফাইল সেটিংস'}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-stone-400 dark:text-neutral-500 group-hover:translate-x-0.5 transition-transform" />
                        </button>

                        {/* History / Archive Link */}
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab('history');
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 text-stone-700 dark:text-neutral-300 hover:bg-stone-100 dark:hover:bg-white/[0.06] rounded-xl font-medium transition-colors group cursor-pointer text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <History className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span>{t.navArchive}</span>
                          </div>
                          <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-stone-200 dark:bg-white/[0.08] text-stone-700 dark:text-neutral-300">
                            {historyCount}
                          </span>
                        </button>
                      </div>

                      {/* Sign-Out Button */}
                      <div className="pt-1 mt-1 border-t border-stone-200/80 dark:border-white/[0.06]">
                        <button
                          type="button"
                          onClick={() => {
                            signOutUser();
                            setUserDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl font-medium transition-all duration-150 active:scale-95 cursor-pointer text-xs"
                        >
                          <LogOut className="w-4 h-4" />
                          <span>{t.googleSignOut}</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => signInWithGoogle()}
                className="flex items-center justify-center gap-1.5 p-2 sm:px-3 sm:py-1.5 bg-white hover:bg-stone-50 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-stone-800 dark:text-neutral-200 border border-stone-300 dark:border-white/[0.1] rounded-xl text-xs font-semibold transition-all duration-150 shadow-2xs hover:scale-[1.02] active:scale-95 shrink-0 cursor-pointer select-none"
                title="Sign in with Google"
              >
                <svg className="w-4 h-4 sm:w-3.5 sm:h-3.5 shrink-0" viewBox="0 0 24 24">
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
                <span className="hidden sm:inline">{t.googleSignIn}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Settings Modal */}
      <ProfileSettingsModal
        isOpen={profileSettingsOpen}
        onClose={() => setProfileSettingsOpen(false)}
        historyCount={historyCount}
      />
    </header>
  );
};
