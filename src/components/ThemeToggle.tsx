import React, { useState, useRef } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { language } = useLanguage();
  const isDark = theme === 'dark';
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [rippleKey, setRippleKey] = useState<number>(0);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const origin = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    setRippleKey((prev) => prev + 1);
    toggleTheme(origin);
  };

  return (
    <div className="relative">
      {/* Radiating Click Pulse Ring */}
      <AnimatePresence>
        {rippleKey > 0 && (
          <motion.span
            key={rippleKey}
            initial={{ scale: 0.8, opacity: 0.8 }}
            animate={{ scale: 2.2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className={`absolute inset-0 rounded-xl pointer-events-none -z-10 ${
              isDark
                ? 'bg-gradient-to-r from-amber-400/30 to-teal-400/30 ring-2 ring-amber-400/40'
                : 'bg-gradient-to-r from-amber-500/20 to-orange-400/20 ring-2 ring-amber-500/30'
            }`}
          />
        )}
      </AnimatePresence>

      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        aria-label={
          isDark
            ? language === 'bn' ? 'লাইট মোড চালু করুন' : 'Switch to Light Mode'
            : language === 'bn' ? 'ডার্ক মোড চালু করুন' : 'Switch to Dark Mode'
        }
        title={
          isDark
            ? language === 'bn' ? 'লাইট মোড চালু করুন (Switch to Light Mode)' : 'Switch to Light Mode'
            : language === 'bn' ? 'ডার্ক মোড চালু করুন (Switch to Dark Mode)' : 'Switch to Dark Mode'
        }
        className={`relative w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 overflow-hidden ${
          isDark
            ? 'bg-white/[0.06] hover:bg-white/[0.12] text-amber-200 border border-white/[0.12] shadow-sm hover:shadow-amber-400/10'
            : 'bg-stone-200/70 hover:bg-stone-200 text-amber-700 border border-stone-300 shadow-sm hover:shadow-amber-500/10'
        } hover:scale-105 active:scale-90`}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isDark ? (
            <motion.div
              key="moon"
              initial={{ opacity: 0, rotate: -120, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 120, scale: 0.4 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 22,
                mass: 0.8,
              }}
              className="relative flex items-center justify-center"
            >
              <Moon className="w-4 h-4 text-amber-300 fill-amber-300/25 transition-transform" />
              {/* Subtle twinkling stars */}
              <motion.span
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 0.4], scale: [0, 1, 0.8] }}
                transition={{ duration: 0.8, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute -top-1 -right-1 text-teal-300"
              >
                <Sparkles className="w-2 h-2" />
              </motion.span>
            </motion.div>
          ) : (
            <motion.div
              key="sun"
              initial={{ opacity: 0, rotate: 120, scale: 0.4 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: -120, scale: 0.4 }}
              transition={{
                type: 'spring',
                stiffness: 380,
                damping: 22,
                mass: 0.8,
              }}
              className="relative flex items-center justify-center"
            >
              <Sun className="w-4 h-4 text-amber-600 fill-amber-500/30 transition-transform" />
              {/* Radiating sun aura ring */}
              <motion.span
                initial={{ scale: 0.8, opacity: 0.4 }}
                animate={{ scale: [0.8, 1.2, 0.8], opacity: [0.4, 0.8, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 -m-1 rounded-full bg-amber-500/10 pointer-events-none"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
};
