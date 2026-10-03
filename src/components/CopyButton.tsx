import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export interface CopyButtonProps {
  text: string | (() => string);
  label?: string;
  copiedLabel?: string;
  showLabel?: boolean;
  variant?: 'default' | 'subtle' | 'outline' | 'pill' | 'compact';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
  title?: string;
  onCopy?: () => void;
}

export const CopyButton: React.FC<CopyButtonProps> = ({
  text,
  label,
  copiedLabel,
  showLabel = false,
  variant = 'default',
  size = 'sm',
  className = '',
  title,
  onCopy,
}) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState<boolean>(false);

  const displayLabel = label ?? t.copyToClipboard;
  const displayCopiedLabel = copiedLabel ?? t.copiedToClipboard;
  const displayTitle = title ?? (copied ? displayCopiedLabel : displayLabel);

  const handleCopy = async (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    const content = typeof text === 'function' ? text() : text;
    if (!content) return;

    let success = false;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(content);
        success = true;
      }
    } catch {
      // fallback
    }

    if (!success) {
      try {
        const textArea = document.createElement('textarea');
        textArea.value = content;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        success = document.execCommand('copy');
        document.body.removeChild(textArea);
      } catch {
        success = false;
      }
    }

    if (success) {
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Size configurations
  const sizeClasses = {
    xs: 'px-1.5 py-1 text-[11px] gap-1',
    sm: 'px-2 py-1.5 text-xs gap-1.5',
    md: 'px-3 py-2 text-xs sm:text-sm gap-2',
  }[size];

  const iconSizes = {
    xs: 'w-3 h-3',
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
  }[size];

  // Variant styling
  const variantClasses = {
    default: copied
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
      : 'text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200/80 dark:text-neutral-400 dark:hover:text-white dark:bg-white/[0.04] dark:hover:bg-white/[0.08] border border-stone-200/80 dark:border-white/[0.08]',
    subtle: copied
      ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400'
      : 'text-stone-500 hover:text-stone-900 hover:bg-stone-200/70 dark:text-neutral-400 dark:hover:text-white dark:hover:bg-white/[0.06]',
    outline: copied
      ? 'border border-emerald-500/40 bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300'
      : 'border border-stone-200 hover:border-stone-300 text-stone-700 hover:text-stone-900 bg-white hover:bg-stone-50 dark:border-white/[0.1] dark:hover:border-white/[0.2] dark:bg-black/20 dark:text-neutral-300 dark:hover:text-white',
    pill: copied
      ? 'rounded-full bg-emerald-500 text-white font-medium shadow-xs'
      : 'rounded-full bg-teal-50 hover:bg-teal-100 text-teal-800 dark:bg-teal-950/40 dark:hover:bg-teal-900/50 dark:text-teal-300 border border-teal-200 dark:border-teal-800/40 font-semibold',
    compact: copied
      ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30'
      : 'text-stone-400 hover:text-stone-700 dark:text-neutral-500 dark:hover:text-neutral-300 hover:bg-stone-100 dark:hover:bg-white/[0.06]',
  }[variant];

  return (
    <button
      type="button"
      onClick={handleCopy}
      title={displayTitle}
      aria-label={displayTitle}
      className={`inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 active:scale-95 shrink-0 ${sizeClasses} ${variantClasses} ${className}`}
    >
      {copied ? (
        <Check className={`${iconSizes} text-emerald-600 dark:text-emerald-400 shrink-0`} />
      ) : (
        <Copy className={`${iconSizes} shrink-0`} />
      )}
      {showLabel && (
        <span className="truncate">{copied ? displayCopiedLabel : displayLabel}</span>
      )}
    </button>
  );
};
