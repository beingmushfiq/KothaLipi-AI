/**
 * Bengali Phonetic Transliteration (Avro-style mapping helper)
 */

interface PhoneticRule {
  pattern: RegExp;
  replacement: string;
}

// Multi-character sequences first
const PHONETIC_RULES: PhoneticRule[] = [
  // Compound vowels
  { pattern: /oi/g, replacement: 'ৈ' },
  { pattern: /ou/g, replacement: 'ৌ' },
  { pattern: /aa/g, replacement: 'া' },
  { pattern: /ee/g, replacement: 'ী' },
  { pattern: /oo/g, replacement: 'ূ' },

  // Conjuncts / Special
  { pattern: /kkh/g, replacement: 'ক্ষ' },
  { pattern: /jnh/g, replacement: 'জ্ঞ' },
  { pattern: /ng/g, replacement: 'ং' },
  { pattern: /thh/g, replacement: 'ঠ' },
  { pattern: /dhh/g, replacement: 'ঢ' },
  { pattern: /chh/g, replacement: 'ছ' },
  { pattern: /kh/g, replacement: 'খ' },
  { pattern: /gh/g, replacement: 'ঘ' },
  { pattern: /ch/g, replacement: 'চ' },
  { pattern: /jh/g, replacement: 'ঝ' },
  { pattern: /th/g, replacement: 'থ' },
  { pattern: /dh/g, replacement: 'ধ' },
  { pattern: /ph/g, replacement: 'ফ' },
  { pattern: /bh/g, replacement: 'ভ' },
  { pattern: /sh/g, replacement: 'শ' },
  { pattern: /Sh/g, replacement: 'ষ' },
  { pattern: /Rh/g, replacement: 'ঢ়' },
  { pattern: /rr/g, replacement: 'ড়' },

  // Consonants
  { pattern: /k/g, replacement: 'ক' },
  { pattern: /g/g, replacement: 'গ' },
  { pattern: /j/g, replacement: 'জ' },
  { pattern: /T/g, replacement: 'ট' },
  { pattern: /D/g, replacement: 'ড' },
  { pattern: /N/g, replacement: 'ণ' },
  { pattern: /t/g, replacement: 'ত' },
  { pattern: /d/g, replacement: 'দ' },
  { pattern: /n/g, replacement: 'ন' },
  { pattern: /p/g, replacement: 'প' },
  { pattern: /f/g, replacement: 'ফ' },
  { pattern: /b/g, replacement: 'ব' },
  { pattern: /m/g, replacement: 'ম' },
  { pattern: /z/g, replacement: 'য' },
  { pattern: /r/g, replacement: 'র' },
  { pattern: /l/g, replacement: 'ল' },
  { pattern: /s/g, replacement: 'স' },
  { pattern: /h/g, replacement: 'হ' },
  { pattern: /y/g, replacement: 'য়' },
  { pattern: /R/g, replacement: 'ড়' },

  // Punctuation
  { pattern: /\.\./g, replacement: '।' },
];

const INITIAL_VOWELS: Record<string, string> = {
  a: 'অ',
  A: 'আ',
  i: 'ই',
  I: 'ঈ',
  u: 'উ',
  U: 'ঊ',
  e: 'এ',
  E: 'ঐ',
  o: 'ও',
  O: 'ঔ',
  rri: 'ঋ',
};

const VOWEL_SIGNS: Record<string, string> = {
  a: '',
  A: 'া',
  aa: 'া',
  i: 'ি',
  I: 'ী',
  ee: 'ী',
  u: 'ু',
  U: 'ূ',
  oo: 'ূ',
  e: 'ে',
  oi: 'ৈ',
  o: 'ো',
  ou: 'ৌ',
};

/**
 * Transliterates common English romanized Bengali word into Bengali script.
 */
export function transliterateBengali(text: string): string {
  if (!text) return '';

  const words = text.split(/(\s+|[.,!?;:'"()[\]{}])/);
  return words
    .map((word) => {
      if (/^\s+$/.test(word) || /^[.,!?;:'"()[\]{}]+$/.test(word)) {
        if (word === '..') return '।';
        return word;
      }
      return transliterateWord(word);
    })
    .join('');
}

function transliterateWord(w: string): string {
  // Common vocabulary dictionary for instant high-precision mapping
  const commonDict: Record<string, string> = {
    ami: 'আমি',
    tumi: 'তুমি',
    apni: 'আপনি',
    amra: 'আমরা',
    tomra: 'তোমরা',
    tara: 'তারা',
    she: 'সে',
    kemon: 'কেমন',
    achen: 'আছেন',
    acho: 'আছো',
    bangla: 'বাংলা',
    bangladesh: 'বাংলাদেশ',
    dhaka: 'ঢাকা',
    bhalo: 'ভালো',
    khobor: 'খবর',
    ki: 'কী',
    korcho: 'করছো',
    korchen: 'করছেন',
    hobe: 'হবে',
    ache: 'আছে',
    nai: 'নাই',
    shob: 'সব',
    onek: 'অনেক',
    shundor: 'সুন্দর',
    dhonnobad: 'ধন্যবাদ',
    shagotom: 'স্বাগতম',
    desh: 'দেশ',
    bhasha: 'ভাষা',
    shadhinota: 'স্বাধীনতা',
    boi: 'বই',
    shikkha: 'শিক্ষা',
    shongshod: 'সংসদ',
    shorkar: 'সরকার',
    jonogon: 'জনগণ',
    shomoy: 'সময়',
    din: 'দিন',
    raat: 'রাত',
    manush: 'মানুষ',
    bondhu: 'বন্ধু',
    poribar: 'পরিবার',
    gaan: 'গান',
    kobita: 'কবিতা',
    shobdo: 'শব্দ',
    banan: 'বানান',
    shuddho: 'শুদ্ধ',
    lekha: 'লেখা',
    chithi: 'চিঠি',
    kagoj: 'কাগজ',
    dolil: 'দলিল',
    potro: 'পত্র',
  };

  const lower = w.toLowerCase();
  if (commonDict[lower]) {
    return commonDict[lower];
  }

  // Fallback sequential heuristic
  let result = w;
  for (const rule of PHONETIC_RULES) {
    result = result.replace(rule.pattern, rule.replacement);
  }

  return result;
}

export const COMMON_BENGALI_CHARS = [
  { char: 'ঁ', name: 'চন্দ্রবিন্দু' },
  { char: 'ং', name: 'অনুস্বার' },
  { char: 'ঃ', name: 'বিসর্গ' },
  { char: 'ৎ', name: 'খণ্ড-ত' },
  { char: 'ঽ', name: 'অবগ্রহ' },
  { char: 'ঋ', name: 'ঋ-কার' },
  { char: 'ড়', name: 'ড শূন্য ড়' },
  { char: 'ঢ়', name: 'ঢ শূন্য ঢ়' },
  { char: 'য়', name: 'অন্তঃস্থ য়' },
  { char: '্', name: 'হসন্ত (যুক্তবর্ণ)' },
  { char: '্য', name: 'য-ফলা' },
  { char: '্র', name: 'র-ফলা' },
  { char: '্ব', name: 'ব-ফলা' },
  { char: '্ম', name: 'ম-ফলা' },
  { char: 'ক্ষ', name: 'যুক্ত ক্ষ' },
  { char: 'জ্ঞ', name: 'যুক্ত জ্ঞ' },
  { char: 'ষ্ণ', name: 'যুক্ত ষ্ণ' },
  { char: 'ত্র', name: 'যুক্ত ত্র' },
  { char: '।', name: 'বাংলা দাঁড়ি' },
];
