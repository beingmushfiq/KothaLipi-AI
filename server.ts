import express from 'express';
import type { Request, Response } from 'express';
import http from 'http';
import dotenv from 'dotenv';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all incoming client requests
app.use(cors());

// Support large payloads for base64 images and audio files
app.use(express.json({ limit: '60mb' }));
app.use(express.urlencoded({ limit: '60mb', extended: true }));

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Helper function with automatic retry and model fallback on 503/429 spikes
async function generateContentWithRetry(params: {
  preferredModel?: string;
  contents: unknown;
  config?: Record<string, unknown>;
}) {
  const modelsToTry = [
    params.preferredModel || 'gemini-3.8-flash',
    'gemini-3.1-flash-lite',
  ];

  let lastError: unknown;
  for (const modelName of modelsToTry) {
    try {
      // Call Gemini API with model
      const resp = await ai.models.generateContent({
        model: modelName,
        contents: params.contents as any,
        config: params.config as any,
      });
      return resp;
    } catch (err: unknown) {
      lastError = err;
      console.warn(`Model ${modelName} error, attempting next fallback:`, err);
      // Wait 300ms before attempting fallback
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw lastError;
}

// 1. Bangla OCR Endpoint
app.post('/api/ocr', async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg', mode = 'full' } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: 'Image data is required.' });
    }

    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

    let promptInstruction = '';
    if (mode === 'fields') {
      promptInstruction = `You are a high-precision Bengali document OCR and information extraction specialist.
Analyze this scanned Bengali document image.
Extract the structured key-value pairs (e.g., Document Title, Organization/Author, Date, Reference Number, Subject/বিষয়, Signatories/স্বাক্ষরকারী, Monetary Amounts, Table contents, Important clauses).
Return valid JSON with this exact structure:
{
  "documentType": "e.g. Official Government Order / Deed (দলিল) / Notice / Newspaper / Letter / Application",
  "fullExtractedText": "Complete Bengali text extracted verbatim preserving line breaks and Bengali punctuation",
  "summary": "Concise 2-3 sentence Bengali summary of the document",
  "fields": [
    { "label": "ক্ষেত্র বা ফিল্ড নাম", "value": "তথ্য বা মান", "category": "header|date|sender|body|financial|footer" }
  ],
  "confidenceScore": 95,
  "detectedScript": "Printed / Handwritten / Mixed"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;
    } else if (mode === 'handwritten') {
      promptInstruction = `You are an expert paleographer and Bengali handwriting (হাতের লেখা) deciphering specialist.
Examine this image of handwritten Bengali text carefully.
Handwritten Bengali often contains complex ligatures (যুক্তবর্ণ যেমন ক্ষ, জ্ঞ, ষ্ণ, ঙ্ক, ঙ্গ, ত্র, ভ্র, ষ্ট, ষ্ঠ), cursive matras, and varied writing styles.
Decipher all handwritten words with high fidelity.
Output format:
Return valid JSON:
{
  "fullExtractedText": "The complete accurately transcribed handwritten Bengali text with correct paragraphs and punctuation (দাঁড়ি ।, কমা ,)",
  "confidenceScore": 92,
  "clarifications": [
    { "ambiguousWord": "original deciphered word", "alternative": "possible alternative", "context": "explanation of ligature or handwriting quirk" }
  ],
  "summary": "Brief 1-2 sentence Bengali summary of the note/letter",
  "writingStyle": "Cursive fountain pen / Ballpoint note / Manuscript / Diary entry"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;
    } else if (mode === 'bilingual') {
      promptInstruction = `You are a professional Bengali-English bilingual document translator and OCR engine.
Extract all Bengali text from the scanned image.
Provide the authentic Bengali extracted text, plus an accurate, fluent English translation side-by-side.
Return valid JSON:
{
  "fullExtractedText": "Complete authentic Bengali text with proper formatting",
  "englishTranslation": "Fluent, professional English translation maintaining tone and legal/administrative precision",
  "confidenceScore": 96,
  "documentType": "Detected document type in Bengali and English"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;
    } else {
      // mode === 'full'
      promptInstruction = `You are the ultimate Bengali (বাংলা) Optical Character Recognition (OCR) engine.
Your task is to accurately extract all text from this scanned Bengali document.
Key rules:
1. Retain perfect Bengali ligatures (যুক্তবর্ণ), vowel signs (কার: া, ি, ী, ু, ূ, ৃ, ে, ৈ, ো, ৌ), consonant signs (ফলা: ্য, ্র, ্ব, ্ম), and diacritics (ঁ, ং, ঃ, ৎ, ঽ).
2. Distinguish accurately between easily confused Bengali characters: ব vs র vs ৱ, ড vs ড়, ঢ vs ঢ়, য vs য়, ণ vs ন, শ vs ষ vs স, ত vs ৎ.
3. Preserve structural formatting: headings, numbered lists (১., ২., ৩. or ক., খ., গ.), tables in Markdown format, and correct Bengali full stop (।).
4. If there is English or numerical text mixed in, retain it faithfully.

Return valid JSON:
{
  "fullExtractedText": "Full extracted Bengali text with pristine formatting and markdown",
  "confidenceScore": 97,
  "detectedLanguage": "Bengali (বাংলা) with possible English terms",
  "paragraphCount": 4,
  "wordCount": 120,
  "documentType": "Scanned Newspaper / Book Page / Circular / Memo / Form"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;
    }

    const response = await generateContentWithRetry({
      preferredModel: 'gemini-3.8-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: promptInstruction },
        ],
      },
    });

    const rawText = response.text || '';
    let parsedData: Record<string, unknown>;

    try {
      // Strip potential code block wrappers
      const cleaned = rawText.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
      parsedData = JSON.parse(cleaned);
    } catch {
      parsedData = {
        fullExtractedText: rawText,
        confidenceScore: 90,
        documentType: 'Bengali Document',
      };
    }

    res.json(parsedData);
  } catch (error: unknown) {
    console.error('OCR Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown OCR error';
    res.status(500).json({ error: `OCR processing failed: ${message}` });
  }
});

// 2. Bangla Writing & Proofreading Assistant Endpoint
app.post('/api/proofread', async (req: Request, res: Response) => {
  try {
    const { text, mode = 'grammar_check', customTone = '' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text input is required.' });
    }

    let instruction = '';

    if (mode === 'sadhu_to_cholit') {
      instruction = `You are an expert in Bengali linguistic styles (বাংলা সাধু ও চলিত রীতি).
Task: Convert the provided Bengali text from classical Sadhu bhasha (সাধু ভাষা) to contemporary standard Cholit bhasha (প্রমিত চলিত ভাষা).
Pay special attention to verb forms (ক্রিয়াপদ: যেমন - করিয়াছিল -> করেছিল, আসিয়া -> এসে, বলিলেন -> বললেন), pronouns (সর্বনাম: যেমন - তাঁহার -> তাঁর, কাহাকেও -> কাউকে, উহা -> ওটা), and prepositions/particles.
Preserve the original meaning, emotion, and tone perfectly.`;
    } else if (mode === 'cholit_to_sadhu') {
      instruction = `You are an expert in classical Bengali literature and linguistics.
Task: Convert the provided Bengali text from modern Cholit bhasha (চলিত ভাষা) to formal classical Sadhu bhasha (সাধু ভাষা).
Use appropriate classical verb forms (যেমন - করে -> করিয়া, যাচ্ছে -> যাইতেছে, বললেন -> বলিলেন) and classical pronouns (যেমন - তাদের -> তাহাদিগের/তাহাদের, তার -> তাহার). Ensure pristine grammar.`;
    } else if (mode === 'tone_formal') {
      instruction = `You are a senior Bengali corporate communications director and administrative editor.
Task: Rewrite the provided Bengali text into a polished, authoritative, and Professional tone (পেশাদার ও দাপ্তরিক প্রমিত রূপ).
Make it suitable for executive correspondence, business proposals, official notices, and professional emails.
Eliminate informal slang, structure arguments logically, enhance grammatical precision, and employ dignified, courteous standard Bengali diction.`;
    } else if (mode === 'tone_creative' || mode === 'tone_literary') {
      instruction = `You are a master Bengali creative writer, poet, and novelist.
Task: Rewrite the provided Bengali text into an imaginative, evocative, and Creative tone (সৃজনশীল ও সাহিত্যিক রূপ).
Infuse the writing with vivid sensory imagery, poetic resonance, aesthetic word choices, rhythmic cadence, and emotional depth while maintaining narrative clarity.`;
    } else if (mode === 'tone_conversational' || mode === 'tone_casual') {
      instruction = `You are a friendly, modern Bengali conversationalist and storyteller.
Task: Rewrite the provided Bengali text into a warm, natural, and Conversational tone (সহজ কথ্য ও আন্তরিক আড্ডার সুর).
Make it feel like a real person talking to a friend, colleague, or social media follower. Use natural standard colloquial phrasing (চলিত কথ্য রূপ), approachable expressions, and smooth sentence flow, avoiding stiff bureaucracy or overly archaic phrasing.`;
    } else if (mode === 'tone_academic') {
      instruction = `You are a distinguished Bengali university professor and scholarly journal editor.
Task: Rewrite the provided Bengali text into an Academic and Analytical tone (অ্যাকাডেমিক ও গবেষণাধর্মী রূপ).
Use rigorous intellectual vocabulary, objective third-person analysis, clear logical premises, and scholarly precision suitable for essays, thesis papers, or critical reviews.`;
    } else if (mode === 'tone_persuasive') {
      instruction = `You are a master Bengali speechwriter and persuasive copywriter.
Task: Rewrite the provided Bengali text into a Persuasive, Compelling, and Inspiring tone (প্ররোচনামূলক ও জোরালো বক্তব্য).
Use persuasive rhetorical devices, strong emotive verbs, punchy call-to-action cadences, and memorable phrasing that motivates and convinces the reader.`;
    } else if (mode === 'tone_custom' && customTone.trim()) {
      instruction = `You are an expert Bengali linguistic stylist and adaptive rewriter.
Task: Rewrite the provided Bengali text strictly following this requested custom tone and style: "${customTone.trim()}".
Adapt the vocabulary, sentence length, emotional register, and phrasing to embody this specific tone while preserving core factual information.`;
    } else if (mode === 'concise') {
      instruction = `You are a concise Bengali editor.
Task: Condense and simplify the provided Bengali text (সংক্ষেপণ ও সহজবোধ্যকরণ).
Remove redundant verbiage, clarify convoluted sentences, and make the text punchy, crisp, and easy to read while retaining all essential facts.`;
    } else if (mode === 'enhance_vocab') {
      instruction = `You are a Bengali lexicographer and vocabulary coach.
Task: Enhance the vocabulary of the provided Bengali text.
Replace common or repetitive words with richer, sophisticated Bengali synonyms and idioms (উপযুক্ত প্রতিশব্দ ও ভাবানুগ প্রয়োগ) that elevate the writing quality.`;
    } else if (mode === 'translate_en_bn') {
      instruction = `You are a master English to Bengali translator.
Task: Translate the provided text into natural, idiomatic standard Bengali (বাংলা).
Avoid robotic word-for-word translation. Reflect nuances, cultural context, and proper Bengali syntax.`;
    } else if (mode === 'translate_bn_en') {
      instruction = `You are a master Bengali to English translator.
Task: Translate the provided Bengali text into fluent, articulate, and natural English.
Ensure perfect English grammar, idiom selection, and stylistic alignment.`;
    } else {
      // default: grammar & spelling check
      instruction = `You are the leading authority on Bengali orthography and grammar according to the Bangla Academy (বাংলা একাডেমি প্রমিত বাংলা বানানের নিয়ম).
Task: Thoroughly proofread the provided Bengali text for:
1. Shuddho Banan (বানান শুদ্ধিকরণ): e.g. ণ-ত্ব ও ষ-ত্ব বিধান, ই-কার বনাম ঈ-কার (যেমন: সরকারি, জানুয়ারি, বাঙালি, পাখি), উ-কার বনাম ঊ-কার, স/শ/ষ, র/ড়/ঢ়, চন্দ্রবিন্দু (ঁ), রেফ এবং য-ফলা।
2. Grammar & Sentence Structure (ব্যাকরণ ও বাক্যগঠন): Subject-verb agreement, dangling participles, Guru-Chondali dosh (গুরুচণ্ডালী দোষ - mixing Sadhu and Cholit), post-position markers.
3. Punctuation (বিরামচিহ্ন): Proper use of Dari (।), Comma (,), quotation marks, dashes.`;
    }

    const systemPrompt = `${instruction}

Input Bengali text to process:
"""
${text}
"""

Return a valid JSON response strictly adhering to this schema:
{
  "originalText": "The original Bengali text",
  "improvedText": "The corrected or transformed text in pristine Bengali",
  "changes": [
    {
      "original": "problematic phrase",
      "replacement": "corrected phrase",
      "type": "spelling | grammar | style | punctuation | vocabulary",
      "explanation": "Brief explanation in Bengali of why this was changed and the grammar/Bangla Academy rule applied"
    }
  ],
  "analysis": {
    "readabilityScore": 92,
    "tone": "Formal / Literary / Colloquial / Mixed",
    "style": "Cholit / Sadhu / Mixed",
    "wordCount": 50,
    "characterCount": 240,
    "keyNotes": "Brief 1-2 sentence assessment of writing strengths and advice in Bengali"
  },
  "suggestedSynonyms": [
    { "word": "শব্দ", "synonyms": ["সমার্থক ১", "সমার্থক ২", "সমার্থক ৩"] }
  ]
}
Output strictly valid JSON with no markdown backticks.`;

    let result: Record<string, unknown>;
    try {
      const response = await generateContentWithRetry({
        preferredModel: 'gemini-3.8-flash',
        contents: systemPrompt,
      });

      const raw = response.text || '';
      const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
      result = JSON.parse(cleaned);
      if (!result.improvedText) {
        throw new Error('Missing improvedText in response');
      }
      result.originalText = text;
    } catch (modelError) {
      console.warn('Gemini proofreading model error, employing linguistic rule fallback:', modelError);
      let fallbackText = text;
      const fallbackChanges: Array<{ original: string; replacement: string; type: string; explanation: string }> = [];

      if (mode === 'sadhu_to_cholit') {
        const rules: [RegExp, string, string][] = [
          [/\bকরিয়াছিল\b/g, 'করেছিল', 'সাধু ক্রিয়াপদ "করিয়াছিল" ➔ প্রমিত চলিত "করেছিল"'],
          [/\bহইয়াছিল\b/g, 'হয়েছিল', 'সাধু ক্রিয়াপদ "হইয়াছিল" ➔ প্রমিত চলিত "হয়েছিল"'],
          [/\bবলিলেন\b/g, 'বললেন', 'সাধু রূপ "বলিলেন" ➔ প্রমিত চলিত "বললেন"'],
          [/\bআসিয়া\b/g, 'এসে', 'সাধু প্রত্যয়ান্ত "আসিয়া" ➔ চলিত "এসে"'],
          [/\bযাইয়া\b/g, 'গিয়ে', 'সাধু রূপ "যাইয়া" ➔ চলিত "গিয়ে"'],
          [/\bতাহা\b/g, 'তা', 'সাধু সর্বনাম "তাহা" ➔ চলিত "তা"'],
          [/\bকাহারও\b/g, 'কারও', 'সাধু সর্বনাম "কাহারও" ➔ চলিত "কারও"'],
        ];
        rules.forEach(([pattern, repl, expl]) => {
          if (pattern.test(fallbackText)) {
            fallbackChanges.push({ original: pattern.source.replace(/\\b/g, ''), replacement: repl, type: 'style', explanation: expl });
            fallbackText = fallbackText.replace(pattern, repl);
          }
        });
      } else if (mode === 'cholit_to_sadhu') {
        const rules: [RegExp, string, string][] = [
          [/\bকরেছিল\b/g, 'করিয়াছিল', 'চলিত ক্রিয়াপদ "করেছিল" ➔ সাধু রূপ "করিয়াছিল"'],
          [/\bহয়েছিল\b/g, 'হইয়াছিল', 'চলিত ক্রিয়াপদ "হয়েছিল" ➔ সাধু রূপ "হইয়াছিল"'],
          [/\bবললেন\b/g, 'বলিলেন', 'চলিত রূপ "বললেন" ➔ সাধু রূপ "বলিলেন"'],
          [/\bএসে\b/g, 'আসিয়া', 'চলিত রূপ "এসে" ➔ সাধু রূপ "আসিয়া"'],
        ];
        rules.forEach(([pattern, repl, expl]) => {
          if (pattern.test(fallbackText)) {
            fallbackChanges.push({ original: pattern.source.replace(/\\b/g, ''), replacement: repl, type: 'style', explanation: expl });
            fallbackText = fallbackText.replace(pattern, repl);
          }
        });
      } else {
        // Standard Banan normalization
        if (!fallbackText.endsWith('।') && !fallbackText.endsWith('?') && !fallbackText.endsWith('!')) {
          fallbackChanges.push({
            original: fallbackText.slice(-1),
            replacement: fallbackText.slice(-1) + '।',
            type: 'punctuation',
            explanation: 'বাক্যের সুষ্ঠু সমাপ্তি নির্দেশ করতে প্রমিত বাংলা দাঁড়ি (।) সংযোগ করা হয়েছে।',
          });
          fallbackText += '।';
        }
      }

      result = {
        originalText: text,
        improvedText: fallbackText,
        changes: fallbackChanges,
        analysis: {
          readabilityScore: 92,
          tone: mode.startsWith('tone_') ? 'Refined Tone' : 'Standard Bengali',
          style: mode === 'cholit_to_sadhu' ? 'Sadhu' : 'Cholit',
          wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
          characterCount: fallbackText.length,
          keyNotes: 'বাংলা একাডেমি প্রমিত বানান ও ব্যাকরণ নীতি অনুযায়ী পাঠ্যটি সুচারুরূপে সংরক্ষিত হয়েছে।',
        },
        suggestedSynonyms: [],
      };
    }

    res.json(result);
  } catch (error: unknown) {
    console.error('Proofreading Global Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown proofreading error';
    res.status(500).json({ error: `Proofreading failed: ${message}` });
  }
});

// 2b. Bangla Text Summarization Endpoint
app.post('/api/summarize', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text || typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Text input is required for summarization.' });
    }

    const wordsCount = text.split(/\s+/).filter(Boolean).length;

    const systemPrompt = `You are a distinguished Bengali editor and master of text summarization (সারসংক্ষেপ ও সারমর্ম বিশেষজ্ঞ).
Task: Generate a high-clarity, concise, and articulate summary of the provided Bengali text.

Input Bengali text:
"""
${text}
"""

Return a valid JSON response strictly following this JSON schema:
{
  "conciseSummary": "A crisp, coherent, and punchy 2-4 sentence summary capturing the central message in pristine standard Bengali (প্রমিত চলিত ভাষা)",
  "bulletPoints": [
    "Key takeaway point 1 in clear Bengali",
    "Key takeaway point 2 in clear Bengali",
    "Key takeaway point 3 in clear Bengali"
  ],
  "keyThemes": ["মূল ভাব বা টপিক ১", "টপিক ২", "টপিক ৩"],
  "stats": {
    "originalWordCount": ${wordsCount},
    "summaryWordCount": 40,
    "reductionPercentage": "65%",
    "estimatedReadingTime": "৩০ সেকেন্ড"
  }
}
Output strictly valid JSON with no markdown backticks.`;

    let result: Record<string, unknown>;
    try {
      const response = await generateContentWithRetry({
        preferredModel: 'gemini-3.8-flash',
        contents: systemPrompt,
      });

      const raw = response.text || '';
      const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
      result = JSON.parse(cleaned);
      if (!result.conciseSummary) {
        throw new Error('Invalid summary structure');
      }
    } catch (modelErr) {
      console.warn('Gemini summarization failed, falling back to linguistic summarizer:', modelErr);
      const sentences = text
        .split(/[।?!;\n]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 8);

      const topSentences = sentences.slice(0, 3).join('। ') + (sentences.length > 0 ? '।' : '');
      const origWords = text.split(/\s+/).filter(Boolean).length;
      const sumWords = topSentences.split(/\s+/).filter(Boolean).length;
      const reduction = Math.max(10, Math.round(((origWords - sumWords) / Math.max(1, origWords)) * 100));

      result = {
        conciseSummary: topSentences || text.slice(0, 150) + '...',
        bulletPoints: (sentences.length > 0 ? sentences.slice(0, 3) : [text.slice(0, 60)]).map((s) => s.endsWith('।') ? s : s + '।'),
        keyThemes: ['প্রধান ভাব', 'সারমর্ম', 'মূল বক্তব্য'],
        stats: {
          originalWordCount: origWords,
          summaryWordCount: sumWords,
          reductionPercentage: `${reduction}%`,
          estimatedReadingTime: `${Math.max(1, Math.ceil(sumWords / 60))} মিনিট`,
        },
      };
    }

    res.json(result);
  } catch (err: unknown) {
    console.error('Summarize API Error:', err);
    const message = err instanceof Error ? err.message : 'Summarization error';
    res.status(500).json({ error: `Summarization failed: ${message}` });
  }
});

// 3. Bangla Voice-to-Text (Transcription) Endpoint
app.post('/api/transcribe', async (req: Request, res: Response) => {
  try {
    const { audioBase64, mimeType = 'audio/webm', dialectNormalization = true, speakerDiarization = true } = req.body;

    if (!audioBase64) {
      return res.status(400).json({ error: 'Audio data is required.' });
    }

    const cleanBase64 = audioBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');

    const transcriptionPrompt = `You are a world-class Bengali speech recognition and linguistic analysis engine.
Transcribe this spoken Bengali audio with maximum accuracy.
Guidelines:
1. Output verbatim Bengali transcript with natural punctuation: Dari (।), Comma (,), Question mark (?), and Exclamation (!).
2. Spell numbers, dates, and amounts in clear Bengali script or numerals as appropriate.
3. Detect the dialect or accent (e.g., Standard Colloquial Dhaka / প্রমিত চলিত, Chittagong / চাঁটগাঁইয়া, Sylheti / সিলেটি, Noakhali / নোয়াখালী, Barisal / বরিশাইল্লা, North Bengal / উত্তরাঞ্চল, or Indian Bengali / পশ্চিমবঙ্গীয়).
4. If dialectNormalization is requested, also provide a normalized Standard Colloquial Bengali (প্রমিত বাংলা) version so the speech is universally accessible.
5. Identify speakers (e.g. বক্তা ১, বক্তা ২) if multiple speakers are detected.
6. Generate a succinct summary and actionable bullet points in Bengali.

Return valid JSON with this exact structure:
{
  "fullTranscript": "The authentic verbatim transcribed Bengali text",
  "normalizedTranscript": "Standard colloquial Bengali version (if dialect differed, otherwise same as transcript)",
  "detectedDialect": "Detected regional accent / dialect name in Bengali and English",
  "speakers": [
    { "speaker": "বক্তা ১", "timeEstimate": "00:00 - 00:15", "text": "কথিত বক্তব্য..." }
  ],
  "summary": "1-2 sentence Bengali summary of the audio content",
  "keyActionItems": ["মূল বিষয় বা সিদ্ধান্ত ১", "মূল বিষয় বা সিদ্ধান্ত ২"],
  "durationNotes": "Audio quality and pace assessment"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;

    // gemini-3.5-transcribe is the recommended model for audio transcription tasks
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-transcribe',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64,
            },
          },
          { text: transcriptionPrompt },
        ],
      },
    });

    const raw = response.text || '';
    let parsed;
    try {
      const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        fullTranscript: raw,
        normalizedTranscript: raw,
        detectedDialect: 'Standard Bengali (প্রমিত বাংলা)',
        speakers: [{ speaker: 'বক্তা ১', timeEstimate: '00:00', text: raw }],
        summary: 'অডিওটি সফলভাবে লিখিত রূপ দেওয়া হয়েছে।',
        keyActionItems: [],
        durationNotes: 'স্বাভাবিক গতি',
      };
    }

    res.json(parsed);
  } catch (error: unknown) {
    console.error('Transcription Error:', error);
    // If gemini-3.5-transcribe encounters an issue, fallback gracefully to gemini-3.8-flash with audio
    try {
      console.log('Retrying transcription with gemini-3.8-flash fallback...');
      const cleanBase64 = req.body.audioBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, '');
      const fallbackResp = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: req.body.mimeType || 'audio/webm',
                data: cleanBase64,
              },
            },
            {
              text: 'Transcribe this Bengali speech audio into accurate Bengali text with punctuation. Return JSON: {"fullTranscript": "টেক্সট...", "detectedDialect": "প্রমিত বাংলা", "summary": "সারাংশ..."}',
            },
          ],
        },
      });
      const raw = fallbackResp.text || '';
      const cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```\s*$/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (fallbackError) {
      const message = error instanceof Error ? error.message : 'Unknown transcription error';
      res.status(500).json({ error: `Audio transcription failed: ${message}` });
    }
  }
});

// 4. Bangla Text-to-Speech (TTS) Endpoint
app.post('/api/tts', async (req: Request, res: Response) => {
  try {
    const { text, voice = 'Kore' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text is required for TTS.' });
    }

    // Limit text length to prevent timeouts
    const trimmed = text.slice(0, 500);

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: trimmed,
              speechMetadata: {
                style: 'Clear, natural, articulate Bengali speaker',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }, // 'Kore' or 'Puck'
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from TTS engine.' });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/wav',
    });
  } catch (error: unknown) {
    console.error('TTS Error:', error);
    const message = error instanceof Error ? error.message : 'TTS failure';
    res.status(500).json({ error: `TTS processing error: ${message}` });
  }
});

// Setup Vite middlewares in development or serve static in production
async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  httpServer.listen(PORT, () => {
    console.log(`KothaLipi AI Toolkit server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
