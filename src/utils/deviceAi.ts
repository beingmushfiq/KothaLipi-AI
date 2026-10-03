// On-device (zero-cost, no API key) AI engines used as automatic fallbacks
// when the cloud Gemini quota is exhausted or no key is configured.
import type { OcrResult, TranscriptionResult } from '../types';

const TESSERACT_VERSION = '7.0.0';
const CDN = `https://cdn.jsdelivr.net/npm/tesseract.js@${TESSERACT_VERSION}`;

/* ------------------------------------------------------------------ *
 * OCR — Tesseract.js (loaded lazily + from CDN so it stays off the
 * main bundle and only downloads when actually needed).
 * ------------------------------------------------------------------ */

let ocrWorkerPromise: Promise<any> | null = null;

async function getOcrWorker(lang: 'ben' | 'eng' | 'ben+eng') {
  if (!ocrWorkerPromise) {
    ocrWorkerPromise = (async () => {
      const { createWorker } = await import('tesseract.js');
      return createWorker(lang, 1, {
        workerPath: `${CDN}/dist/worker.min.js`,
        corePath: `${CDN}/dist/`,
        langPath: 'https://tessdata.projectnaptha.com/4.0.0_best',
        logger: () => {},
      });
    })();
  }
  return ocrWorkerPromise;
}

/** Runs on-device OCR and maps the output onto the app's OcrResult shape. */
export async function deviceOcr(
  imageDataUrl: string,
  mode: 'fields' | 'full' | 'handwritten' | 'bilingual'
): Promise<OcrResult> {
  const lang = mode === 'bilingual' ? 'ben+eng' : 'ben';
  const worker = await getOcrWorker(lang);
  const { data } = await worker.recognize(imageDataUrl);
  const text: string = (data.text || '').trim();

  return {
    fullExtractedText: text,
    documentType:
      mode === 'handwritten'
        ? 'Handwritten Document (on-device)'
        : 'Bengali Document (on-device)',
    confidenceScore: data.confidence ? Math.round(data.confidence) : undefined,
    detectedScript: mode === 'handwritten' ? 'Handwritten' : 'Printed',
    detectedLanguage: 'Bengali (বাংলা)',
  };
}

/* ------------------------------------------------------------------ *
 * Text-to-speech — browser SpeechSynthesis (no network, no cost).
 * ------------------------------------------------------------------ */

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/** Speaks Bengali text on-device. Resolves when playback finishes. */
export function deviceSpeak(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported() || !text.trim()) {
      resolve();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text.slice(0, 600));
    utterance.lang = 'bn-BD';
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  });
}

/* ------------------------------------------------------------------ *
 * Speech-to-text — Web Speech API (Chrome/Edge; live microphone only).
 * ------------------------------------------------------------------ */

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start: () => void;
  stop: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

function getRecognitionCtor(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: new () => SpeechRecognitionLike;
    webkitSpeechRecognition?: new () => SpeechRecognitionLike;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function isWebSpeechSupported(): boolean {
  return getRecognitionCtor() !== null;
}

/**
 * Live on-device dictation using the Web Speech API.
 * Note: this works from a live microphone, not from an uploaded audio file
 * (browsers do not allow feeding recorded files into this API).
 */
export function createDeviceTranscriber(handlers: {
  onPartial?: (text: string) => void;
  onFinal: (text: string) => void;
  onError?: (message: string) => void;
  onEnd?: () => void;
}): SpeechRecognitionLike | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;

  const recognition = new Ctor();
  recognition.lang = 'bn-BD';
  recognition.continuous = true;
  recognition.interimResults = true;

  let finalText = '';

  recognition.onresult = (event: any) => {
    let interim = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalText += chunk + ' ';
      } else {
        interim += chunk;
      }
    }
    handlers.onPartial?.((finalText + interim).trim());
  };

  recognition.onerror = (event: any) => {
    handlers.onError?.(event?.error || 'speech-recognition-error');
  };

  recognition.onend = () => {
    handlers.onFinal(finalText.trim());
    handlers.onEnd?.();
  };

  return recognition;
}

/** Wraps on-device dictation output into the app's TranscriptionResult shape. */
export function deviceTranscriptionResult(transcript: string): TranscriptionResult {
  return {
    fullTranscript: transcript,
    normalizedTranscript: transcript,
    detectedDialect: 'Standard Bengali (প্রমিত বাংলা) · on-device',
    summary: undefined,
    keyActionItems: [],
    durationNotes: 'On-device browser recognition',
  };
}
