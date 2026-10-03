import React, { useRef, useEffect } from 'react';
import { useTypewriter } from '../hooks/useTypewriter';
import { FastForward, CheckCircle2, Sparkles, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TypingOutputDisplayProps {
  text: string;
  language: 'en' | 'bn';
  className?: string;
  autoScroll?: boolean;
}

export const TypingOutputDisplay: React.FC<TypingOutputDisplayProps> = ({
  text,
  language,
  className = '',
  autoScroll = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [replayKey, setReplayKey] = React.useState(0);

  const { displayedText, isTyping, skip } = useTypewriter({
    text,
    enabled: true,
  });

  // Smooth scroll to bottom while typing if user hasn't scrolled away
  useEffect(() => {
    if (isTyping && autoScroll && containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [displayedText, isTyping, autoScroll]);

  const handleReplay = () => {
    setReplayKey((k) => k + 1);
  };

  return (
    <div className="relative group/output">
      {/* Top Floating Typing Status / Skip Toolbar */}
      <AnimatePresence>
        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute top-2.5 right-2.5 z-10 flex items-center gap-2 bg-stone-900/90 dark:bg-stone-800/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] text-white shadow-md border border-teal-500/30"
          >
            <span className="flex items-center gap-1.5 text-teal-300 font-medium">
              <Sparkles className="w-3 h-3 animate-spin text-teal-400" />
              <span>
                {language === 'en' ? 'Generating...' : 'লেখা হচ্ছে...'}
              </span>
            </span>

            <button
              type="button"
              onClick={skip}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-teal-500/20 hover:bg-teal-500/35 text-teal-200 transition-colors font-semibold text-[10px]"
              title={language === 'en' ? 'Show Full Text' : 'সম্পূর্ণ লেখা দেখুন'}
            >
              <FastForward className="w-3 h-3" />
              <span>{language === 'en' ? 'Skip' : 'স্কিপ'}</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Output Text Box */}
      <div
        ref={containerRef}
        key={replayKey}
        onClick={() => {
          if (isTyping) skip();
        }}
        className={`p-4 sm:p-5 bg-white dark:bg-black/40 rounded-xl border border-stone-200/90 dark:border-white/[0.08] text-stone-900 dark:text-white select-text font-bangla text-base sm:text-lg leading-relaxed shadow-xs transition-colors duration-200 whitespace-pre-wrap relative min-h-[120px] ${
          isTyping ? 'cursor-pointer' : ''
        } ${className}`}
        title={isTyping ? (language === 'en' ? 'Click to show all' : 'সম্পূর্ণ দেখতে ক্লিক করুন') : undefined}
      >
        {/* Streamed Bengali Output */}
        <span>{displayedText}</span>

        {/* Animated Typing Caret */}
        {isTyping && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: [1, 0, 1] }}
            transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
            className="inline-block w-1.5 h-5 sm:h-6 ml-0.5 bg-teal-600 dark:bg-teal-400 rounded-xs align-middle shadow-[0_0_8px_rgba(20,184,166,0.8)]"
            aria-hidden="true"
          />
        )}
      </div>

      {/* Subtle completed micro-bar */}
      {!isTyping && displayedText && (
        <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 dark:text-neutral-500 px-1">
          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-3 h-3" />
            <span>{language === 'en' ? 'Output Complete' : 'ফলাফল সম্পূর্ণ'}</span>
          </span>

          <button
            type="button"
            onClick={handleReplay}
            className="opacity-0 group-hover/output:opacity-100 hover:text-stone-900 dark:hover:text-stone-300 transition-opacity flex items-center gap-1 text-[10px]"
            title={language === 'en' ? 'Replay typing animation' : 'টাইপিং অ্যানিমেশন পুনরায় দেখুন'}
          >
            <RotateCcw className="w-2.5 h-2.5" />
            <span>{language === 'en' ? 'Replay' : 'পুনরায় দেখুন'}</span>
          </button>
        </div>
      )}
    </div>
  );
};
