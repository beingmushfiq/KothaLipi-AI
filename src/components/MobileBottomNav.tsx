import React from 'react';
import { ActiveTab } from '../types';
import { ScanText, PenTool, Mic, History } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion } from 'motion/react';

interface MobileBottomNavProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  historyCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  setActiveTab,
  historyCount,
}) => {
  const { t, language } = useLanguage();

  const navItems: Array<{
    id: ActiveTab;
    label: string;
    icon: React.ElementType;
    activeColor: string;
    badge?: number;
  }> = [
    {
      id: 'ocr',
      label: t.navOcr,
      icon: ScanText,
      activeColor: 'text-teal-700 dark:text-teal-300',
    },
    {
      id: 'writer',
      label: t.navWriter,
      icon: PenTool,
      activeColor: 'text-emerald-700 dark:text-emerald-300',
    },
    {
      id: 'voice',
      label: t.navVoice,
      icon: Mic,
      activeColor: 'text-sky-700 dark:text-sky-300',
    },
    {
      id: 'history',
      label: t.navArchive,
      icon: History,
      activeColor: 'text-indigo-700 dark:text-indigo-300',
      badge: historyCount,
    },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#f7f6f2]/95 dark:bg-[#07090e]/95 backdrop-blur-xl border-t border-stone-200/90 dark:border-white/[0.08] px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-4px_20px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.4)]"
    >
      <div className="grid grid-cols-4 gap-1 items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setActiveTab(item.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-2xl transition-all duration-200 active:scale-95 select-none ${
                isActive
                  ? item.activeColor
                  : 'text-stone-500 dark:text-neutral-400 hover:text-stone-900 dark:hover:text-stone-200'
              }`}
            >
              {/* Active Indicator Backdrop Pill */}
              {isActive && (
                <motion.div
                  layoutId="mobileNavPill"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  className="absolute inset-0 bg-stone-200/80 dark:bg-white/[0.08] rounded-2xl -z-10"
                />
              )}

              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'scale-110' : ''}`} />
                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span className="absolute -top-1 -right-2 px-1.5 py-0.2 min-w-4 text-[9px] font-mono font-bold rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] sm:text-[11px] font-medium tracking-tight mt-1 truncate max-w-full leading-none ${
                  language === 'bn' ? 'font-bangla' : 'font-sans'
                } ${isActive ? 'font-bold' : ''}`}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
