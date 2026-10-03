import express from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const PORT = process.env.PORT || 3e3;
app.use(cors());
app.use(express.json({ limit: "60mb" }));
app.use(express.urlencoded({ limit: "60mb", extended: true }));
const GEMINI_API_KEY = process.env.GEMINI_API_KEY?.trim();
const aiConfigured = Boolean(GEMINI_API_KEY);
const ai = aiConfigured ? new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
}) : null;
function classifyAiError(error) {
  const raw = error instanceof Error ? error.message : typeof error === "string" ? error : JSON.stringify(error || "");
  const msg = String(raw).toLowerCase();
  if (msg.includes("api key") || msg.includes("api_key") || msg.includes("unauthenticated") || msg.includes("permission denied") || msg.includes("401") || msg.includes("403")) {
    return { code: "NO_API_KEY", status: 503 };
  }
  if (msg.includes("429") || msg.includes("resource_exhausted") || msg.includes("quota") || msg.includes("rate limit") || msg.includes("rate-limit") || msg.includes("too many requests")) {
    return { code: "QUOTA_EXHAUSTED", status: 429 };
  }
  return { code: "UPSTREAM_ERROR", status: 502 };
}
async function generateContentWithRetry(params) {
  if (!ai) {
    throw new Error("NO_API_KEY: GEMINI_API_KEY is not configured on the server.");
  }
  const modelsToTry = [
    params.preferredModel || "gemini-3.8-flash",
    "gemini-3.1-flash-lite"
  ];
  let lastError;
  for (const modelName of modelsToTry) {
    try {
      const resp = await ai.models.generateContent({
        model: modelName,
        contents: params.contents,
        config: params.config
      });
      return resp;
    } catch (err) {
      lastError = err;
      console.warn(`Model ${modelName} error, attempting next fallback:`, err);
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
  }
  throw lastError;
}
app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    cloudAi: aiConfigured,
    capabilities: {
      ocr: aiConfigured,
      proofread: aiConfigured,
      summarize: aiConfigured,
      transcribe: aiConfigured,
      tts: aiConfigured
    }
  });
});
app.post("/api/ocr", async (req, res) => {
  try {
    const { imageBase64, mimeType = "image/jpeg", mode = "full" } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data is required." });
    }
    const cleanBase64 = imageBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
    let promptInstruction = "";
    if (mode === "fields") {
      promptInstruction = `You are a high-precision Bengali document OCR and information extraction specialist.
Analyze this scanned Bengali document image.
Extract the structured key-value pairs (e.g., Document Title, Organization/Author, Date, Reference Number, Subject/\u09AC\u09BF\u09B7\u09AF\u09BC, Signatories/\u09B8\u09CD\u09AC\u09BE\u0995\u09CD\u09B7\u09B0\u0995\u09BE\u09B0\u09C0, Monetary Amounts, Table contents, Important clauses).
Return valid JSON with this exact structure:
{
  "documentType": "e.g. Official Government Order / Deed (\u09A6\u09B2\u09BF\u09B2) / Notice / Newspaper / Letter / Application",
  "fullExtractedText": "Complete Bengali text extracted verbatim preserving line breaks and Bengali punctuation",
  "summary": "Concise 2-3 sentence Bengali summary of the document",
  "fields": [
    { "label": "\u0995\u09CD\u09B7\u09C7\u09A4\u09CD\u09B0 \u09AC\u09BE \u09AB\u09BF\u09B2\u09CD\u09A1 \u09A8\u09BE\u09AE", "value": "\u09A4\u09A5\u09CD\u09AF \u09AC\u09BE \u09AE\u09BE\u09A8", "category": "header|date|sender|body|financial|footer" }
  ],
  "confidenceScore": 95,
  "detectedScript": "Printed / Handwritten / Mixed"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;
    } else if (mode === "handwritten") {
      promptInstruction = `You are an expert paleographer and Bengali handwriting (\u09B9\u09BE\u09A4\u09C7\u09B0 \u09B2\u09C7\u0996\u09BE) deciphering specialist.
Examine this image of handwritten Bengali text carefully.
Handwritten Bengali often contains complex ligatures (\u09AF\u09C1\u0995\u09CD\u09A4\u09AC\u09B0\u09CD\u09A3 \u09AF\u09C7\u09AE\u09A8 \u0995\u09CD\u09B7, \u099C\u09CD\u099E, \u09B7\u09CD\u09A3, \u0999\u09CD\u0995, \u0999\u09CD\u0997, \u09A4\u09CD\u09B0, \u09AD\u09CD\u09B0, \u09B7\u09CD\u099F, \u09B7\u09CD\u09A0), cursive matras, and varied writing styles.
Decipher all handwritten words with high fidelity.
Output format:
Return valid JSON:
{
  "fullExtractedText": "The complete accurately transcribed handwritten Bengali text with correct paragraphs and punctuation (\u09A6\u09BE\u0981\u09DC\u09BF \u0964, \u0995\u09AE\u09BE ,)",
  "confidenceScore": 92,
  "clarifications": [
    { "ambiguousWord": "original deciphered word", "alternative": "possible alternative", "context": "explanation of ligature or handwriting quirk" }
  ],
  "summary": "Brief 1-2 sentence Bengali summary of the note/letter",
  "writingStyle": "Cursive fountain pen / Ballpoint note / Manuscript / Diary entry"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;
    } else if (mode === "bilingual") {
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
      promptInstruction = `You are the ultimate Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) Optical Character Recognition (OCR) engine.
Your task is to accurately extract all text from this scanned Bengali document.
Key rules:
1. Retain perfect Bengali ligatures (\u09AF\u09C1\u0995\u09CD\u09A4\u09AC\u09B0\u09CD\u09A3), vowel signs (\u0995\u09BE\u09B0: \u09BE, \u09BF, \u09C0, \u09C1, \u09C2, \u09C3, \u09C7, \u09C8, \u09CB, \u09CC), consonant signs (\u09AB\u09B2\u09BE: \u09CD\u09AF, \u09CD\u09B0, \u09CD\u09AC, \u09CD\u09AE), and diacritics (\u0981, \u0982, \u0983, \u09CE, \u09BD).
2. Distinguish accurately between easily confused Bengali characters: \u09AC vs \u09B0 vs \u09F1, \u09A1 vs \u09DC, \u09A2 vs \u09DD, \u09AF vs \u09DF, \u09A3 vs \u09A8, \u09B6 vs \u09B7 vs \u09B8, \u09A4 vs \u09CE.
3. Preserve structural formatting: headings, numbered lists (\u09E7., \u09E8., \u09E9. or \u0995., \u0996., \u0997.), tables in Markdown format, and correct Bengali full stop (\u0964).
4. If there is English or numerical text mixed in, retain it faithfully.

Return valid JSON:
{
  "fullExtractedText": "Full extracted Bengali text with pristine formatting and markdown",
  "confidenceScore": 97,
  "detectedLanguage": "Bengali (\u09AC\u09BE\u0982\u09B2\u09BE) with possible English terms",
  "paragraphCount": 4,
  "wordCount": 120,
  "documentType": "Scanned Newspaper / Book Page / Circular / Memo / Form"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;
    }
    const response = await generateContentWithRetry({
      preferredModel: "gemini-3.8-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          },
          { text: promptInstruction }
        ]
      }
    });
    const rawText = response.text || "";
    let parsedData;
    try {
      const cleaned = rawText.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "").trim();
      parsedData = JSON.parse(cleaned);
    } catch {
      parsedData = {
        fullExtractedText: rawText,
        confidenceScore: 90,
        documentType: "Bengali Document"
      };
    }
    res.json(parsedData);
  } catch (error) {
    console.error("OCR Error:", error);
    const { code, status } = classifyAiError(error);
    const message = error instanceof Error ? error.message : "Unknown OCR error";
    res.status(status).json({ error: `OCR processing failed: ${message}`, code });
  }
});
app.post("/api/proofread", async (req, res) => {
  try {
    const { text, mode = "grammar_check", customTone = "" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text input is required." });
    }
    let instruction = "";
    if (mode === "sadhu_to_cholit") {
      instruction = `You are an expert in Bengali linguistic styles (\u09AC\u09BE\u0982\u09B2\u09BE \u09B8\u09BE\u09A7\u09C1 \u0993 \u099A\u09B2\u09BF\u09A4 \u09B0\u09C0\u09A4\u09BF).
Task: Convert the provided Bengali text from classical Sadhu bhasha (\u09B8\u09BE\u09A7\u09C1 \u09AD\u09BE\u09B7\u09BE) to contemporary standard Cholit bhasha (\u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u099A\u09B2\u09BF\u09A4 \u09AD\u09BE\u09B7\u09BE).
Pay special attention to verb forms (\u0995\u09CD\u09B0\u09BF\u09DF\u09BE\u09AA\u09A6: \u09AF\u09C7\u09AE\u09A8 - \u0995\u09B0\u09BF\u09DF\u09BE\u099B\u09BF\u09B2 -> \u0995\u09B0\u09C7\u099B\u09BF\u09B2, \u0986\u09B8\u09BF\u09DF\u09BE -> \u098F\u09B8\u09C7, \u09AC\u09B2\u09BF\u09B2\u09C7\u09A8 -> \u09AC\u09B2\u09B2\u09C7\u09A8), pronouns (\u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE: \u09AF\u09C7\u09AE\u09A8 - \u09A4\u09BE\u0981\u09B9\u09BE\u09B0 -> \u09A4\u09BE\u0981\u09B0, \u0995\u09BE\u09B9\u09BE\u0995\u09C7\u0993 -> \u0995\u09BE\u0989\u0995\u09C7, \u0989\u09B9\u09BE -> \u0993\u099F\u09BE), and prepositions/particles.
Preserve the original meaning, emotion, and tone perfectly.`;
    } else if (mode === "cholit_to_sadhu") {
      instruction = `You are an expert in classical Bengali literature and linguistics.
Task: Convert the provided Bengali text from modern Cholit bhasha (\u099A\u09B2\u09BF\u09A4 \u09AD\u09BE\u09B7\u09BE) to formal classical Sadhu bhasha (\u09B8\u09BE\u09A7\u09C1 \u09AD\u09BE\u09B7\u09BE).
Use appropriate classical verb forms (\u09AF\u09C7\u09AE\u09A8 - \u0995\u09B0\u09C7 -> \u0995\u09B0\u09BF\u09DF\u09BE, \u09AF\u09BE\u099A\u09CD\u099B\u09C7 -> \u09AF\u09BE\u0987\u09A4\u09C7\u099B\u09C7, \u09AC\u09B2\u09B2\u09C7\u09A8 -> \u09AC\u09B2\u09BF\u09B2\u09C7\u09A8) and classical pronouns (\u09AF\u09C7\u09AE\u09A8 - \u09A4\u09BE\u09A6\u09C7\u09B0 -> \u09A4\u09BE\u09B9\u09BE\u09A6\u09BF\u0997\u09C7\u09B0/\u09A4\u09BE\u09B9\u09BE\u09A6\u09C7\u09B0, \u09A4\u09BE\u09B0 -> \u09A4\u09BE\u09B9\u09BE\u09B0). Ensure pristine grammar.`;
    } else if (mode === "tone_formal") {
      instruction = `You are a senior Bengali corporate communications director and administrative editor.
Task: Rewrite the provided Bengali text into a polished, authoritative, and Professional tone (\u09AA\u09C7\u09B6\u09BE\u09A6\u09BE\u09B0 \u0993 \u09A6\u09BE\u09AA\u09CD\u09A4\u09B0\u09BF\u0995 \u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u09B0\u09C2\u09AA).
Make it suitable for executive correspondence, business proposals, official notices, and professional emails.
Eliminate informal slang, structure arguments logically, enhance grammatical precision, and employ dignified, courteous standard Bengali diction.`;
    } else if (mode === "tone_creative" || mode === "tone_literary") {
      instruction = `You are a master Bengali creative writer, poet, and novelist.
Task: Rewrite the provided Bengali text into an imaginative, evocative, and Creative tone (\u09B8\u09C3\u099C\u09A8\u09B6\u09C0\u09B2 \u0993 \u09B8\u09BE\u09B9\u09BF\u09A4\u09CD\u09AF\u09BF\u0995 \u09B0\u09C2\u09AA).
Infuse the writing with vivid sensory imagery, poetic resonance, aesthetic word choices, rhythmic cadence, and emotional depth while maintaining narrative clarity.`;
    } else if (mode === "tone_conversational" || mode === "tone_casual") {
      instruction = `You are a friendly, modern Bengali conversationalist and storyteller.
Task: Rewrite the provided Bengali text into a warm, natural, and Conversational tone (\u09B8\u09B9\u099C \u0995\u09A5\u09CD\u09AF \u0993 \u0986\u09A8\u09CD\u09A4\u09B0\u09BF\u0995 \u0986\u09A1\u09CD\u09A1\u09BE\u09B0 \u09B8\u09C1\u09B0).
Make it feel like a real person talking to a friend, colleague, or social media follower. Use natural standard colloquial phrasing (\u099A\u09B2\u09BF\u09A4 \u0995\u09A5\u09CD\u09AF \u09B0\u09C2\u09AA), approachable expressions, and smooth sentence flow, avoiding stiff bureaucracy or overly archaic phrasing.`;
    } else if (mode === "tone_academic") {
      instruction = `You are a distinguished Bengali university professor and scholarly journal editor.
Task: Rewrite the provided Bengali text into an Academic and Analytical tone (\u0985\u09CD\u09AF\u09BE\u0995\u09BE\u09A1\u09C7\u09AE\u09BF\u0995 \u0993 \u0997\u09AC\u09C7\u09B7\u09A3\u09BE\u09A7\u09B0\u09CD\u09AE\u09C0 \u09B0\u09C2\u09AA).
Use rigorous intellectual vocabulary, objective third-person analysis, clear logical premises, and scholarly precision suitable for essays, thesis papers, or critical reviews.`;
    } else if (mode === "tone_persuasive") {
      instruction = `You are a master Bengali speechwriter and persuasive copywriter.
Task: Rewrite the provided Bengali text into a Persuasive, Compelling, and Inspiring tone (\u09AA\u09CD\u09B0\u09B0\u09CB\u099A\u09A8\u09BE\u09AE\u09C2\u09B2\u0995 \u0993 \u099C\u09CB\u09B0\u09BE\u09B2\u09CB \u09AC\u0995\u09CD\u09A4\u09AC\u09CD\u09AF).
Use persuasive rhetorical devices, strong emotive verbs, punchy call-to-action cadences, and memorable phrasing that motivates and convinces the reader.`;
    } else if (mode === "tone_custom" && customTone.trim()) {
      instruction = `You are an expert Bengali linguistic stylist and adaptive rewriter.
Task: Rewrite the provided Bengali text strictly following this requested custom tone and style: "${customTone.trim()}".
Adapt the vocabulary, sentence length, emotional register, and phrasing to embody this specific tone while preserving core factual information.`;
    } else if (mode === "concise") {
      instruction = `You are a concise Bengali editor.
Task: Condense and simplify the provided Bengali text (\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA\u09A3 \u0993 \u09B8\u09B9\u099C\u09AC\u09CB\u09A7\u09CD\u09AF\u0995\u09B0\u09A3).
Remove redundant verbiage, clarify convoluted sentences, and make the text punchy, crisp, and easy to read while retaining all essential facts.`;
    } else if (mode === "enhance_vocab") {
      instruction = `You are a Bengali lexicographer and vocabulary coach.
Task: Enhance the vocabulary of the provided Bengali text.
Replace common or repetitive words with richer, sophisticated Bengali synonyms and idioms (\u0989\u09AA\u09AF\u09C1\u0995\u09CD\u09A4 \u09AA\u09CD\u09B0\u09A4\u09BF\u09B6\u09AC\u09CD\u09A6 \u0993 \u09AD\u09BE\u09AC\u09BE\u09A8\u09C1\u0997 \u09AA\u09CD\u09B0\u09DF\u09CB\u0997) that elevate the writing quality.`;
    } else if (mode === "translate_en_bn") {
      instruction = `You are a master English to Bengali translator.
Task: Translate the provided text into natural, idiomatic standard Bengali (\u09AC\u09BE\u0982\u09B2\u09BE).
Avoid robotic word-for-word translation. Reflect nuances, cultural context, and proper Bengali syntax.`;
    } else if (mode === "translate_bn_en") {
      instruction = `You are a master Bengali to English translator.
Task: Translate the provided Bengali text into fluent, articulate, and natural English.
Ensure perfect English grammar, idiom selection, and stylistic alignment.`;
    } else {
      instruction = `You are the leading authority on Bengali orthography and grammar according to the Bangla Academy (\u09AC\u09BE\u0982\u09B2\u09BE \u098F\u0995\u09BE\u09A1\u09C7\u09AE\u09BF \u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u09AC\u09BE\u0982\u09B2\u09BE \u09AC\u09BE\u09A8\u09BE\u09A8\u09C7\u09B0 \u09A8\u09BF\u09DF\u09AE).
Task: Thoroughly proofread the provided Bengali text for:
1. Shuddho Banan (\u09AC\u09BE\u09A8\u09BE\u09A8 \u09B6\u09C1\u09A6\u09CD\u09A7\u09BF\u0995\u09B0\u09A3): e.g. \u09A3-\u09A4\u09CD\u09AC \u0993 \u09B7-\u09A4\u09CD\u09AC \u09AC\u09BF\u09A7\u09BE\u09A8, \u0987-\u0995\u09BE\u09B0 \u09AC\u09A8\u09BE\u09AE \u0988-\u0995\u09BE\u09B0 (\u09AF\u09C7\u09AE\u09A8: \u09B8\u09B0\u0995\u09BE\u09B0\u09BF, \u099C\u09BE\u09A8\u09C1\u09DF\u09BE\u09B0\u09BF, \u09AC\u09BE\u0999\u09BE\u09B2\u09BF, \u09AA\u09BE\u0996\u09BF), \u0989-\u0995\u09BE\u09B0 \u09AC\u09A8\u09BE\u09AE \u098A-\u0995\u09BE\u09B0, \u09B8/\u09B6/\u09B7, \u09B0/\u09DC/\u09DD, \u099A\u09A8\u09CD\u09A6\u09CD\u09B0\u09AC\u09BF\u09A8\u09CD\u09A6\u09C1 (\u0981), \u09B0\u09C7\u09AB \u098F\u09AC\u0982 \u09AF-\u09AB\u09B2\u09BE\u0964
2. Grammar & Sentence Structure (\u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u0993 \u09AC\u09BE\u0995\u09CD\u09AF\u0997\u09A0\u09A8): Subject-verb agreement, dangling participles, Guru-Chondali dosh (\u0997\u09C1\u09B0\u09C1\u099A\u09A3\u09CD\u09A1\u09BE\u09B2\u09C0 \u09A6\u09CB\u09B7 - mixing Sadhu and Cholit), post-position markers.
3. Punctuation (\u09AC\u09BF\u09B0\u09BE\u09AE\u099A\u09BF\u09B9\u09CD\u09A8): Proper use of Dari (\u0964), Comma (,), quotation marks, dashes.`;
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
    { "word": "\u09B6\u09AC\u09CD\u09A6", "synonyms": ["\u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09E7", "\u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09E8", "\u09B8\u09AE\u09BE\u09B0\u09CD\u09A5\u0995 \u09E9"] }
  ]
}
Output strictly valid JSON with no markdown backticks.`;
    let result;
    try {
      const response = await generateContentWithRetry({
        preferredModel: "gemini-3.8-flash",
        contents: systemPrompt
      });
      const raw = response.text || "";
      const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "").trim();
      result = JSON.parse(cleaned);
      if (!result.improvedText) {
        throw new Error("Missing improvedText in response");
      }
      result.originalText = text;
    } catch (modelError) {
      console.warn("Gemini proofreading model error, employing linguistic rule fallback:", modelError);
      let fallbackText = text;
      const fallbackChanges = [];
      if (mode === "sadhu_to_cholit") {
        const rules = [
          [/\bকরিয়াছিল\b/g, "\u0995\u09B0\u09C7\u099B\u09BF\u09B2", '\u09B8\u09BE\u09A7\u09C1 \u0995\u09CD\u09B0\u09BF\u09DF\u09BE\u09AA\u09A6 "\u0995\u09B0\u09BF\u09DF\u09BE\u099B\u09BF\u09B2" \u2794 \u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u099A\u09B2\u09BF\u09A4 "\u0995\u09B0\u09C7\u099B\u09BF\u09B2"'],
          [/\bহইয়াছিল\b/g, "\u09B9\u09DF\u09C7\u099B\u09BF\u09B2", '\u09B8\u09BE\u09A7\u09C1 \u0995\u09CD\u09B0\u09BF\u09DF\u09BE\u09AA\u09A6 "\u09B9\u0987\u09DF\u09BE\u099B\u09BF\u09B2" \u2794 \u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u099A\u09B2\u09BF\u09A4 "\u09B9\u09DF\u09C7\u099B\u09BF\u09B2"'],
          [/\bবলিলেন\b/g, "\u09AC\u09B2\u09B2\u09C7\u09A8", '\u09B8\u09BE\u09A7\u09C1 \u09B0\u09C2\u09AA "\u09AC\u09B2\u09BF\u09B2\u09C7\u09A8" \u2794 \u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u099A\u09B2\u09BF\u09A4 "\u09AC\u09B2\u09B2\u09C7\u09A8"'],
          [/\bআসিয়া\b/g, "\u098F\u09B8\u09C7", '\u09B8\u09BE\u09A7\u09C1 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09DF\u09BE\u09A8\u09CD\u09A4 "\u0986\u09B8\u09BF\u09DF\u09BE" \u2794 \u099A\u09B2\u09BF\u09A4 "\u098F\u09B8\u09C7"'],
          [/\bযাইয়া\b/g, "\u0997\u09BF\u09DF\u09C7", '\u09B8\u09BE\u09A7\u09C1 \u09B0\u09C2\u09AA "\u09AF\u09BE\u0987\u09DF\u09BE" \u2794 \u099A\u09B2\u09BF\u09A4 "\u0997\u09BF\u09DF\u09C7"'],
          [/\bতাহা\b/g, "\u09A4\u09BE", '\u09B8\u09BE\u09A7\u09C1 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE "\u09A4\u09BE\u09B9\u09BE" \u2794 \u099A\u09B2\u09BF\u09A4 "\u09A4\u09BE"'],
          [/\bকাহারও\b/g, "\u0995\u09BE\u09B0\u0993", '\u09B8\u09BE\u09A7\u09C1 \u09B8\u09B0\u09CD\u09AC\u09A8\u09BE\u09AE "\u0995\u09BE\u09B9\u09BE\u09B0\u0993" \u2794 \u099A\u09B2\u09BF\u09A4 "\u0995\u09BE\u09B0\u0993"']
        ];
        rules.forEach(([pattern, repl, expl]) => {
          if (pattern.test(fallbackText)) {
            fallbackChanges.push({ original: pattern.source.replace(/\\b/g, ""), replacement: repl, type: "style", explanation: expl });
            fallbackText = fallbackText.replace(pattern, repl);
          }
        });
      } else if (mode === "cholit_to_sadhu") {
        const rules = [
          [/\bকরেছিল\b/g, "\u0995\u09B0\u09BF\u09DF\u09BE\u099B\u09BF\u09B2", '\u099A\u09B2\u09BF\u09A4 \u0995\u09CD\u09B0\u09BF\u09DF\u09BE\u09AA\u09A6 "\u0995\u09B0\u09C7\u099B\u09BF\u09B2" \u2794 \u09B8\u09BE\u09A7\u09C1 \u09B0\u09C2\u09AA "\u0995\u09B0\u09BF\u09DF\u09BE\u099B\u09BF\u09B2"'],
          [/\bহয়েছিল\b/g, "\u09B9\u0987\u09DF\u09BE\u099B\u09BF\u09B2", '\u099A\u09B2\u09BF\u09A4 \u0995\u09CD\u09B0\u09BF\u09DF\u09BE\u09AA\u09A6 "\u09B9\u09DF\u09C7\u099B\u09BF\u09B2" \u2794 \u09B8\u09BE\u09A7\u09C1 \u09B0\u09C2\u09AA "\u09B9\u0987\u09DF\u09BE\u099B\u09BF\u09B2"'],
          [/\bবললেন\b/g, "\u09AC\u09B2\u09BF\u09B2\u09C7\u09A8", '\u099A\u09B2\u09BF\u09A4 \u09B0\u09C2\u09AA "\u09AC\u09B2\u09B2\u09C7\u09A8" \u2794 \u09B8\u09BE\u09A7\u09C1 \u09B0\u09C2\u09AA "\u09AC\u09B2\u09BF\u09B2\u09C7\u09A8"'],
          [/\bএসে\b/g, "\u0986\u09B8\u09BF\u09DF\u09BE", '\u099A\u09B2\u09BF\u09A4 \u09B0\u09C2\u09AA "\u098F\u09B8\u09C7" \u2794 \u09B8\u09BE\u09A7\u09C1 \u09B0\u09C2\u09AA "\u0986\u09B8\u09BF\u09DF\u09BE"']
        ];
        rules.forEach(([pattern, repl, expl]) => {
          if (pattern.test(fallbackText)) {
            fallbackChanges.push({ original: pattern.source.replace(/\\b/g, ""), replacement: repl, type: "style", explanation: expl });
            fallbackText = fallbackText.replace(pattern, repl);
          }
        });
      } else {
        if (!fallbackText.endsWith("\u0964") && !fallbackText.endsWith("?") && !fallbackText.endsWith("!")) {
          fallbackChanges.push({
            original: fallbackText.slice(-1),
            replacement: fallbackText.slice(-1) + "\u0964",
            type: "punctuation",
            explanation: "\u09AC\u09BE\u0995\u09CD\u09AF\u09C7\u09B0 \u09B8\u09C1\u09B7\u09CD\u09A0\u09C1 \u09B8\u09AE\u09BE\u09AA\u09CD\u09A4\u09BF \u09A8\u09BF\u09B0\u09CD\u09A6\u09C7\u09B6 \u0995\u09B0\u09A4\u09C7 \u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u09AC\u09BE\u0982\u09B2\u09BE \u09A6\u09BE\u0981\u09DC\u09BF (\u0964) \u09B8\u0982\u09AF\u09CB\u0997 \u0995\u09B0\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964"
          });
          fallbackText += "\u0964";
        }
      }
      result = {
        originalText: text,
        improvedText: fallbackText,
        changes: fallbackChanges,
        degraded: true,
        analysis: {
          readabilityScore: 92,
          tone: mode.startsWith("tone_") ? "Refined Tone" : "Standard Bengali",
          style: mode === "cholit_to_sadhu" ? "Sadhu" : "Cholit",
          wordCount: fallbackText.split(/\s+/).filter(Boolean).length,
          characterCount: fallbackText.length,
          keyNotes: "\u09AC\u09BE\u0982\u09B2\u09BE \u098F\u0995\u09BE\u09A1\u09C7\u09AE\u09BF \u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u09AC\u09BE\u09A8\u09BE\u09A8 \u0993 \u09AC\u09CD\u09AF\u09BE\u0995\u09B0\u09A3 \u09A8\u09C0\u09A4\u09BF \u0985\u09A8\u09C1\u09AF\u09BE\u09DF\u09C0 \u09AA\u09BE\u09A0\u09CD\u09AF\u099F\u09BF \u09B8\u09C1\u099A\u09BE\u09B0\u09C1\u09B0\u09C2\u09AA\u09C7 \u09B8\u0982\u09B0\u0995\u09CD\u09B7\u09BF\u09A4 \u09B9\u09DF\u09C7\u099B\u09C7\u0964"
        },
        suggestedSynonyms: []
      };
    }
    res.json(result);
  } catch (error) {
    console.error("Proofreading Global Error:", error);
    const message = error instanceof Error ? error.message : "Unknown proofreading error";
    res.status(500).json({ error: `Proofreading failed: ${message}` });
  }
});
app.post("/api/summarize", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Text input is required for summarization." });
    }
    const wordsCount = text.split(/\s+/).filter(Boolean).length;
    const systemPrompt = `You are a distinguished Bengali editor and master of text summarization (\u09B8\u09BE\u09B0\u09B8\u0982\u0995\u09CD\u09B7\u09C7\u09AA \u0993 \u09B8\u09BE\u09B0\u09AE\u09B0\u09CD\u09AE \u09AC\u09BF\u09B6\u09C7\u09B7\u099C\u09CD\u099E).
Task: Generate a high-clarity, concise, and articulate summary of the provided Bengali text.

Input Bengali text:
"""
${text}
"""

Return a valid JSON response strictly following this JSON schema:
{
  "conciseSummary": "A crisp, coherent, and punchy 2-4 sentence summary capturing the central message in pristine standard Bengali (\u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u099A\u09B2\u09BF\u09A4 \u09AD\u09BE\u09B7\u09BE)",
  "bulletPoints": [
    "Key takeaway point 1 in clear Bengali",
    "Key takeaway point 2 in clear Bengali",
    "Key takeaway point 3 in clear Bengali"
  ],
  "keyThemes": ["\u09AE\u09C2\u09B2 \u09AD\u09BE\u09AC \u09AC\u09BE \u099F\u09AA\u09BF\u0995 \u09E7", "\u099F\u09AA\u09BF\u0995 \u09E8", "\u099F\u09AA\u09BF\u0995 \u09E9"],
  "stats": {
    "originalWordCount": ${wordsCount},
    "summaryWordCount": 40,
    "reductionPercentage": "65%",
    "estimatedReadingTime": "\u09E9\u09E6 \u09B8\u09C7\u0995\u09C7\u09A8\u09CD\u09A1"
  }
}
Output strictly valid JSON with no markdown backticks.`;
    let result;
    try {
      const response = await generateContentWithRetry({
        preferredModel: "gemini-3.8-flash",
        contents: systemPrompt
      });
      const raw = response.text || "";
      const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "").trim();
      result = JSON.parse(cleaned);
      if (!result.conciseSummary) {
        throw new Error("Invalid summary structure");
      }
    } catch (modelErr) {
      console.warn("Gemini summarization failed, falling back to linguistic summarizer:", modelErr);
      const sentences = text.split(/[।?!;\n]+/).map((s) => s.trim()).filter((s) => s.length > 8);
      const topSentences = sentences.slice(0, 3).join("\u0964 ") + (sentences.length > 0 ? "\u0964" : "");
      const origWords = text.split(/\s+/).filter(Boolean).length;
      const sumWords = topSentences.split(/\s+/).filter(Boolean).length;
      const reduction = Math.max(10, Math.round((origWords - sumWords) / Math.max(1, origWords) * 100));
      result = {
        conciseSummary: topSentences || text.slice(0, 150) + "...",
        bulletPoints: (sentences.length > 0 ? sentences.slice(0, 3) : [text.slice(0, 60)]).map((s) => s.endsWith("\u0964") ? s : s + "\u0964"),
        keyThemes: ["\u09AA\u09CD\u09B0\u09A7\u09BE\u09A8 \u09AD\u09BE\u09AC", "\u09B8\u09BE\u09B0\u09AE\u09B0\u09CD\u09AE", "\u09AE\u09C2\u09B2 \u09AC\u0995\u09CD\u09A4\u09AC\u09CD\u09AF"],
        degraded: true,
        stats: {
          originalWordCount: origWords,
          summaryWordCount: sumWords,
          reductionPercentage: `${reduction}%`,
          estimatedReadingTime: `${Math.max(1, Math.ceil(sumWords / 60))} \u09AE\u09BF\u09A8\u09BF\u099F`
        }
      };
    }
    res.json(result);
  } catch (err) {
    console.error("Summarize API Error:", err);
    const message = err instanceof Error ? err.message : "Summarization error";
    res.status(500).json({ error: `Summarization failed: ${message}` });
  }
});
app.post("/api/transcribe", async (req, res) => {
  try {
    const { audioBase64, mimeType = "audio/webm", dialectNormalization = true, speakerDiarization = true } = req.body;
    if (!audioBase64) {
      return res.status(400).json({ error: "Audio data is required." });
    }
    const cleanBase64 = audioBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
    const transcriptionPrompt = `You are a world-class Bengali speech recognition and linguistic analysis engine.
Transcribe this spoken Bengali audio with maximum accuracy.
Guidelines:
1. Output verbatim Bengali transcript with natural punctuation: Dari (\u0964), Comma (,), Question mark (?), and Exclamation (!).
2. Spell numbers, dates, and amounts in clear Bengali script or numerals as appropriate.
3. Detect the dialect or accent (e.g., Standard Colloquial Dhaka / \u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u099A\u09B2\u09BF\u09A4, Chittagong / \u099A\u09BE\u0981\u099F\u0997\u09BE\u0981\u0987\u09AF\u09BC\u09BE, Sylheti / \u09B8\u09BF\u09B2\u09C7\u099F\u09BF, Noakhali / \u09A8\u09CB\u09AF\u09BC\u09BE\u0996\u09BE\u09B2\u09C0, Barisal / \u09AC\u09B0\u09BF\u09B6\u09BE\u0987\u09B2\u09CD\u09B2\u09BE, North Bengal / \u0989\u09A4\u09CD\u09A4\u09B0\u09BE\u099E\u09CD\u099A\u09B2, or Indian Bengali / \u09AA\u09B6\u09CD\u099A\u09BF\u09AE\u09AC\u0999\u09CD\u0997\u09C0\u09AF\u09BC).
4. If dialectNormalization is requested, also provide a normalized Standard Colloquial Bengali (\u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u09AC\u09BE\u0982\u09B2\u09BE) version so the speech is universally accessible.
5. Identify speakers (e.g. \u09AC\u0995\u09CD\u09A4\u09BE \u09E7, \u09AC\u0995\u09CD\u09A4\u09BE \u09E8) if multiple speakers are detected.
6. Generate a succinct summary and actionable bullet points in Bengali.

Return valid JSON with this exact structure:
{
  "fullTranscript": "The authentic verbatim transcribed Bengali text",
  "normalizedTranscript": "Standard colloquial Bengali version (if dialect differed, otherwise same as transcript)",
  "detectedDialect": "Detected regional accent / dialect name in Bengali and English",
  "speakers": [
    { "speaker": "\u09AC\u0995\u09CD\u09A4\u09BE \u09E7", "timeEstimate": "00:00 - 00:15", "text": "\u0995\u09A5\u09BF\u09A4 \u09AC\u0995\u09CD\u09A4\u09AC\u09CD\u09AF..." }
  ],
  "summary": "1-2 sentence Bengali summary of the audio content",
  "keyActionItems": ["\u09AE\u09C2\u09B2 \u09AC\u09BF\u09B7\u09DF \u09AC\u09BE \u09B8\u09BF\u09A6\u09CD\u09A7\u09BE\u09A8\u09CD\u09A4 \u09E7", "\u09AE\u09C2\u09B2 \u09AC\u09BF\u09B7\u09DF \u09AC\u09BE \u09B8\u09BF\u09A6\u09CD\u09A7\u09BE\u09A8\u09CD\u09A4 \u09E8"],
  "durationNotes": "Audio quality and pace assessment"
}
Do not wrap with markdown code fences, return pure valid JSON string only.`;
    const response = await ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType,
              data: cleanBase64
            }
          },
          { text: transcriptionPrompt }
        ]
      }
    });
    const raw = response.text || "";
    let parsed;
    try {
      const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        fullTranscript: raw,
        normalizedTranscript: raw,
        detectedDialect: "Standard Bengali (\u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u09AC\u09BE\u0982\u09B2\u09BE)",
        speakers: [{ speaker: "\u09AC\u0995\u09CD\u09A4\u09BE \u09E7", timeEstimate: "00:00", text: raw }],
        summary: "\u0985\u09A1\u09BF\u0993\u099F\u09BF \u09B8\u09AB\u09B2\u09AD\u09BE\u09AC\u09C7 \u09B2\u09BF\u0996\u09BF\u09A4 \u09B0\u09C2\u09AA \u09A6\u09C7\u0993\u09DF\u09BE \u09B9\u09DF\u09C7\u099B\u09C7\u0964",
        keyActionItems: [],
        durationNotes: "\u09B8\u09CD\u09AC\u09BE\u09AD\u09BE\u09AC\u09BF\u0995 \u0997\u09A4\u09BF"
      };
    }
    res.json(parsed);
  } catch (error) {
    console.error("Transcription Error:", error);
    try {
      if (!ai) throw error;
      console.log("Retrying transcription with gemini-3.8-flash fallback...");
      const cleanBase64 = req.body.audioBase64.replace(/^data:[a-zA-Z0-9/+-]+;base64,/, "");
      const fallbackResp = await ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: req.body.mimeType || "audio/webm",
                data: cleanBase64
              }
            },
            {
              text: 'Transcribe this Bengali speech audio into accurate Bengali text with punctuation. Return JSON: {"fullTranscript": "\u099F\u09C7\u0995\u09CD\u09B8\u099F...", "detectedDialect": "\u09AA\u09CD\u09B0\u09AE\u09BF\u09A4 \u09AC\u09BE\u0982\u09B2\u09BE", "summary": "\u09B8\u09BE\u09B0\u09BE\u0982\u09B6..."}'
            }
          ]
        }
      });
      const raw = fallbackResp.text || "";
      const cleaned = raw.replace(/```(?:json)?\s*/gi, "").replace(/```\s*$/g, "").trim();
      const parsed = JSON.parse(cleaned);
      return res.json(parsed);
    } catch (fallbackError) {
      const { code, status } = classifyAiError(error);
      const message = error instanceof Error ? error.message : "Unknown transcription error";
      res.status(status).json({ error: `Audio transcription failed: ${message}`, code });
    }
  }
});
app.post("/api/tts", async (req, res) => {
  try {
    const { text, voice = "Kore" } = req.body;
    if (!text || typeof text !== "string") {
      return res.status(400).json({ error: "Text is required for TTS." });
    }
    if (!ai) {
      return res.status(503).json({
        error: "TTS unavailable: GEMINI_API_KEY is not configured.",
        code: "NO_API_KEY"
      });
    }
    const trimmed = text.slice(0, 500);
    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: trimmed,
              speechMetadata: {
                style: "Clear, natural, articulate Bengali speaker"
              }
            }
          ]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice }
            // 'Kore' or 'Puck'
          }
        }
      }
    });
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(500).json({ error: "No audio returned from TTS engine." });
    }
    res.json({
      audioBase64: base64Audio,
      mimeType: "audio/wav"
    });
  } catch (error) {
    console.error("TTS Error:", error);
    const { code, status } = classifyAiError(error);
    const message = error instanceof Error ? error.message : "TTS failure";
    res.status(status).json({ error: `TTS processing error: ${message}`, code });
  }
});
async function startServer() {
  const httpServer = http.createServer(app);
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === "true" ? false : void 0
      },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }
  httpServer.listen(PORT, () => {
    console.log(`KothaLipi AI Toolkit server listening on http://localhost:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
