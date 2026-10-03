import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseTypewriterOptions {
  text: string;
  enabled?: boolean;
  onComplete?: () => void;
}

export function useTypewriter({
  text,
  enabled = true,
  onComplete,
}: UseTypewriterOptions) {
  const [displayedText, setDisplayedText] = useState<string>(enabled ? '' : text);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const timerRef = useRef<number | null>(null);

  // Segment text into grapheme clusters to preserve complex Bengali conjuncts (যুক্তবর্ণ)
  const getGraphemes = useCallback((str: string): string[] => {
    if (!str) return [];
    if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
      try {
        const segmenter = new Intl.Segmenter('bn', { granularity: 'grapheme' });
        return Array.from(segmenter.segment(str)).map((s) => s.segment);
      } catch {
        return Array.from(str);
      }
    }
    return Array.from(str);
  }, []);

  const skip = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setDisplayedText(text);
    setIsTyping(false);
    onComplete?.();
  }, [text, onComplete]);

  useEffect(() => {
    if (!enabled || !text) {
      setDisplayedText(text);
      setIsTyping(false);
      return;
    }

    const graphemes = getGraphemes(text);
    const totalGraphemes = graphemes.length;

    if (totalGraphemes === 0) {
      setDisplayedText('');
      setIsTyping(false);
      return;
    }

    // Adaptive chunking and interval so typing feels organic, fluid, and fast:
    // Short texts animate character-by-character; long texts chunk smoothly
    let chunkSize = 1;
    let tickMs = 15;

    if (totalGraphemes > 500) {
      chunkSize = Math.ceil(totalGraphemes / 100);
      tickMs = 10;
    } else if (totalGraphemes > 200) {
      chunkSize = 2;
      tickMs = 12;
    } else if (totalGraphemes > 80) {
      chunkSize = 1;
      tickMs = 14;
    } else {
      chunkSize = 1;
      tickMs = 18;
    }

    let currentIndex = 0;
    setDisplayedText('');
    setIsTyping(true);

    const intervalId = window.setInterval(() => {
      currentIndex = Math.min(currentIndex + chunkSize, totalGraphemes);
      const nextSlice = graphemes.slice(0, currentIndex).join('');
      setDisplayedText(nextSlice);

      if (currentIndex >= totalGraphemes) {
        clearInterval(intervalId);
        timerRef.current = null;
        setIsTyping(false);
        onComplete?.();
      }
    }, tickMs);

    timerRef.current = intervalId;

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [text, enabled, getGraphemes, onComplete]);

  return { displayedText, isTyping, skip };
}
