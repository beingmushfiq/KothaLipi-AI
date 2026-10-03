export type ActiveTab = 'ocr' | 'writer' | 'voice' | 'history';

export type Theme = 'light' | 'dark';

export type Language = 'en' | 'bn';

export type OcrMode = 'full' | 'fields' | 'handwritten' | 'bilingual';

export interface OcrField {
  label: string;
  value: string;
  category?: string;
}

export interface OcrResult {
  fullExtractedText: string;
  documentType?: string;
  confidenceScore?: number;
  detectedScript?: string;
  detectedLanguage?: string;
  summary?: string;
  fields?: OcrField[];
  englishTranslation?: string;
  clarifications?: Array<{
    ambiguousWord: string;
    alternative: string;
    context: string;
  }>;
  writingStyle?: string;
}

export type ProofreadMode =
  | 'grammar_check'
  | 'sadhu_to_cholit'
  | 'cholit_to_sadhu'
  | 'tone_formal'
  | 'tone_creative'
  | 'tone_conversational'
  | 'tone_academic'
  | 'tone_persuasive'
  | 'tone_custom'
  | 'tone_literary'
  | 'tone_casual'
  | 'concise'
  | 'enhance_vocab'
  | 'translate_en_bn'
  | 'translate_bn_en';

export interface ProofreadChange {
  original: string;
  replacement: string;
  type: 'spelling' | 'grammar' | 'style' | 'punctuation' | 'vocabulary';
  explanation: string;
}

export interface LinguisticAnalysis {
  readabilityScore: number;
  tone: string;
  style: string;
  wordCount: number;
  characterCount: number;
  keyNotes: string;
}

export interface ProofreadResult {
  originalText: string;
  improvedText: string;
  changes: ProofreadChange[];
  analysis: LinguisticAnalysis;
  suggestedSynonyms?: Array<{
    word: string;
    synonyms: string[];
  }>;
}

export interface SpeakerTurn {
  speaker: string;
  timeEstimate: string;
  text: string;
}

export interface TranscriptionResult {
  fullTranscript: string;
  normalizedTranscript?: string;
  detectedDialect?: string;
  speakers?: SpeakerTurn[];
  summary?: string;
  keyActionItems?: string[];
  durationNotes?: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: 'ocr' | 'writer' | 'voice';
  title: string;
  preview: string;
  data: OcrResult | ProofreadResult | TranscriptionResult;
}
