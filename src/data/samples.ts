export interface SampleDoc {
  id: string;
  title: string;
  category: string;
  description: string;
  imageDataUrl: string;
  previewText: string;
  defaultMode: 'full' | 'fields' | 'handwritten' | 'bilingual';
}

export interface SampleWriting {
  id: string;
  title: string;
  category: string;
  description: string;
  mode: 'grammar_check' | 'sadhu_to_cholit' | 'tone_formal' | 'translate_en_bn' | 'enhance_vocab';
  text: string;
}

export interface SampleAudio {
  id: string;
  title: string;
  dialect: string;
  description: string;
  duration: string;
  audioBlobUrl?: string;
  transcriptPreview: string;
}

// Generates an authentic canvas-rendered scanned document data URL
function createScannedDocDataUrl(type: 'circular' | 'newspaper' | 'handwritten' | 'deed'): string {
  if (typeof document === 'undefined') return '';
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 1100;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  if (type === 'circular') {
    // Aged paper background
    ctx.fillStyle = '#f8f6f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Vignette / paper grain
    ctx.strokeStyle = '#d7d0bc';
    ctx.strokeRect(20, 20, canvas.width - 40, canvas.height - 40);

    // Official Header
    ctx.fillStyle = '#1c1917';
    ctx.font = 'bold 20px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('গণপ্রজাতন্ত্রী বাংলাদেশ সরকার', 400, 80);

    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillText('জনপ্রশাসন মন্ত্রণালয়', 400, 110);
    ctx.fillText('প্রশাসন-১ অধিশাখা, বাংলাদেশ সচিবালয়, ঢাকা', 400, 135);

    // Divider
    ctx.beginPath();
    ctx.moveTo(100, 155);
    ctx.lineTo(700, 155);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#444';
    ctx.stroke();

    // Memo and Date
    ctx.font = '14px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('স্মারক নং: ০৫.০০.০০০০.১৩২.০৮.০১২.২৪-৭৮২', 60, 190);
    ctx.textAlign = 'right';
    ctx.fillText('তারিখ: ১২ আশ্বিন ১৪৩১ / ২৭ সেপ্টেম্বর ২০২৪', 740, 190);

    // Notification title
    ctx.textAlign = 'center';
    ctx.font = 'bold 18px "Hind Siliguri", sans-serif';
    ctx.fillText('** প্র জ্ঞা প ন **', 400, 240);

    // Body
    ctx.textAlign = 'left';
    ctx.font = '15px "Hind Siliguri", sans-serif';
    const lines = [
      'বিসিএস (প্রশাসন) ক্যাডারের নিম্নবর্ণিত কর্মকর্তাগণকে পুনরাদেশ না দেওয়া পর্যন্ত তাদের নামের',
      'পার্শ্বে বর্ণিত পদে ও কর্মস্থলে জনস্বার্থে বদলিপূর্বক পদায়ন করা হলো:',
      '',
      '১. জনাব মোঃ রফিকুল ইসলাম (পরিচিতি নং ১৫৮৯২), উপসচিব, স্থানীয় সরকার বিভাগ —',
      '   পদায়ন: প্রধান নির্বাহী কর্মকর্তা, জেলা পরিষদ, চট্টগ্রাম।',
      '২. বেগম নাসরিন আক্তার (পরিচিতি নং ১৬৪২০), অতিরিক্ত জেলা প্রশাসক, সিলেট —',
      '   পদায়ন: পরিচালক (উপসচিব), জাতীয় স্থানীয় সরকার ইনস্টিটিউট (এনআইএলজি), ঢাকা।',
      '',
      'শর্তাবলী:',
      '(ক) সংশ্লিষ্ট কর্মকর্তাগণ আগামী ০৩ অক্টোবর ২০২৪ তারিখের মধ্যে বর্তমান কর্মস্থল হতে অবমুক্ত হবেন;',
      '(খ) অন্যথায় ০৩ অক্টোবর ২০২৪ অপরাহ্ন হতে তাৎক্ষণিক অবমুক্ত (Stand Released) বলে গণ্য হবেন;',
      '(গ) জনস্বার্থে জারিকৃত এ আদেশ অবিলম্বে কার্যকর হবে।',
      '',
      'রাষ্ট্রপতির আদেশক্রমে,',
    ];

    let y = 290;
    for (const line of lines) {
      ctx.fillText(line, 60, y);
      y += 28;
    }

    // Signature stamp area
    ctx.textAlign = 'right';
    ctx.font = 'italic 15px "Hind Siliguri", sans-serif';
    ctx.fillText('(মুহাম্মদ আশরাফুল আলম)', 720, y + 40);
    ctx.font = '14px "Hind Siliguri", sans-serif';
    ctx.fillText('যুগ্মসচিব', 720, y + 65);
    ctx.fillText('ফোন: +৮৮০২-৯৫৪৫৬৭৮', 720, y + 85);

    // Red Circular Stamp simulation
    ctx.beginPath();
    ctx.arc(630, y + 55, 45, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(185, 28, 28, 0.45)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.font = '10px "Hind Siliguri", sans-serif';
    ctx.fillStyle = 'rgba(185, 28, 28, 0.6)';
    ctx.textAlign = 'center';
    ctx.fillText('জনপ্রশাসন মন্ত্রণালয়', 630, y + 50);
    ctx.fillText('ঢাকা, বাংলাদেশ', 630, y + 65);

  } else if (type === 'newspaper') {
    // Newsprint background
    ctx.fillStyle = '#eae5d8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Masthead
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 36px "Hind Siliguri", serif';
    ctx.textAlign = 'center';
    ctx.fillText('দৈনিক সংবাদ বার্তা', 400, 70);

    ctx.font = '12px "Hind Siliguri", sans-serif';
    ctx.fillText('বর্ষ ৪২ | সংখ্যা ১২৮ | ঢাকা, শুক্রবার, ১৫ কার্তিক | মূল্য: পাঁচ টাকা', 400, 100);

    ctx.beginPath();
    ctx.moveTo(40, 115);
    ctx.lineTo(760, 115);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1e293b';
    ctx.stroke();

    // Headline
    ctx.font = 'bold 24px "Hind Siliguri", sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('সুন্দরবনের জীববৈচিত্র্য রক্ষায় সমন্বিত মহাপরিকল্পনা গৃহীত', 50, 155);

    // Subheadline
    ctx.font = 'italic 16px "Hind Siliguri", sans-serif';
    ctx.fillStyle = '#334155';
    ctx.fillText('ম্যানগ্রোভ বনাঞ্চল ও রয়েল বেঙ্গল টাইগার সংরক্ষণে নতুন টাস্কফোর্স গঠন', 50, 185);

    // Two column layout simulation
    ctx.beginPath();
    ctx.moveTo(395, 210);
    ctx.lineTo(395, 950);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.fillStyle = '#0f172a';
    ctx.font = '14px "Hind Siliguri", sans-serif';

    const col1 = [
      'বিশেষ প্রতিবেদক, ঢাকা:',
      'বিশ্ব ঐতিহ্য সুন্দরবনের অমূল্য প্রাকৃতিক ভারসাম্য ও',
      'জীববৈচিত্র্য রক্ষায় যুগান্তকারী সমন্বিত কর্মপরিকল্পনা',
      'চূড়ান্ত করেছে বন ও পরিবেশ মন্ত্রণালয়। গতকাল',
      'সচিবালয়ে আয়োজিত এক উচ্চপর্যায়ের জাতীয় গোলটেবিল',
      'বৈঠকে এ সিদ্ধান্তের কথা জানানো হয়।',
      '',
      'বৈঠকে পরিবেশ বিশেষজ্ঞরা উল্লেখ করেন যে, সাম্প্রতিক',
      'জলবায়ু পরিবর্তন, সামুদ্রিক লবণাক্ততা বৃদ্ধি এবং অবৈধ',
      'চোরাশিকারীদের তৎপরতার ফলে উপকূলীয় উদ্ভিদের নতুন',
      'চারা গজানোর হার হ্রাস পাচ্ছে।',
      '',
      'প্রধান বন সংরক্ষক বলেন, "সুন্দরবন কেবল আমাদের জাতীয়',
      'সম্পদ নয়, এটি গোটা দক্ষিণ এশিয়ার অন্যতম প্রাকৃতিক সুরক্ষা প্রাচীর।',
      'ঘূর্ণিঝড় ও জলোচ্ছ্বাসের হাত থেকে উপকূলীয় কোটি মানুষকে',
      'নিরাপদ রাখতে এই বনের সুস্থতা নিশ্চিত করা অপরিহার্য।"',
    ];

    const col2 = [
      'নতুন মহাপরিকল্পনার মূল বৈশিষ্ট্যসমূহ:',
      '১. স্যাটেলাইট ড্রোনের মাধ্যমে ২৪ ঘণ্টা নজরদারি ব্যবস্থা।',
      '২. সুন্দরবন সংলগ্ন নদ-নদীতে প্লাস্টিক দূষণ সম্পূর্ণ নিষিদ্ধ।',
      '৩. স্থানীয় বাওয়ালি, মৌয়াল ও জেলেদের জন্য বিকল্প',
      '   টেকসই জীবিকায়ন তহবিল গঠন।',
      '৪. বাঘ গণনা ও স্বাস্থ্য নিরীক্ষায় কৃত্রিম বুদ্ধিমত্তা চালিত',
      '   ক্যামেরা ট্র্যাপিং পদ্ধতি সম্প্রসারণ।',
      '',
      'উল্লেখ্য, বন বিভাগের সাম্প্রতিক জরিপ অনুযায়ী বর্তমানে',
      'সুন্দরবনে বাঘের সংখ্যা ইতিবাচকভাবে বৃদ্ধি পেয়ে ১১৪টিতে',
      'উন্নীত হয়েছে। বিশেষজ্ঞরা আশা করছেন, গৃহীত পদক্ষেপসমূহ',
      'বাস্তবায়িত হলে আগামী পাঁচ বছরে তা আরও ২০ শতাংশ বাড়বে।',
    ];

    let y1 = 230;
    for (const l of col1) {
      ctx.fillText(l, 50, y1);
      y1 += 26;
    }

    let y2 = 230;
    for (const l of col2) {
      ctx.fillText(l, 415, y2);
      y2 += 26;
    }

  } else if (type === 'handwritten') {
    // Cream stationery lined paper
    ctx.fillStyle = '#fbf7ee';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Ruled lines
    ctx.strokeStyle = '#e2d9c2';
    ctx.lineWidth = 1;
    for (let ly = 120; ly < 1000; ly += 38) {
      ctx.beginPath();
      ctx.moveTo(40, ly);
      ctx.lineTo(760, ly);
      ctx.stroke();
    }

    // Margin line (pink/red)
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(90, 40);
    ctx.lineTo(90, 1050);
    ctx.stroke();

    // Handwritten cursive ink (fountain pen blue-black)
    ctx.fillStyle = '#1e3a8a';
    ctx.font = 'italic 20px "Tiro Bangla", "Hind Siliguri", cursive';

    ctx.textAlign = 'right';
    ctx.fillText('শান্তিনিকেতন, বোলপুর', 730, 95);
    ctx.fillText('১২ বৈশাখ, ১৪২৮', 730, 133);

    ctx.textAlign = 'left';
    ctx.fillText('স্নেহের অমল,', 110, 171);

    const letterLines = [
      'তোমার দীর্ঘ প্রতীক্ষিত পত্রখানি আজ অপরাহ্ণে হস্তগত হইল।',
      'পাঠ করিয়া অত্যন্ত আনন্দিত ও আশ্বস্ত হইলাম। নগরের কোলাহল',
      'ছাড়িয়া প্রকৃতির নিবিড় সান্নিধ্যে আসিয়া মন বড় প্রসন্ন আছে।',
      'এখানে শালবনের মধ্য দিয়া যখন ঝিরিঝিরি বাতাস বহিয়া যায়,',
      'তখন পুরাতন সকল ক্লান্তি নিমেষেই দূর হইয়া যায়।',
      '',
      'তোমার পরীক্ষার ফলাফল আশানুরূপ হইয়াছে দেখিয়া আনন্দিত হইলাম।',
      'তবে মনে রাখিও, বিদ্যা কেবল গ্রন্থকীট হইবার জন্য নহে—',
      'চরিত্রগঠন ও সমাজের সেবাই বিদ্যার চরম সার্থকতা।',
      '',
      'জননীকে আমার ভক্তিপূর্ণ প্রণাম জানাইবে। তুমি আমার আন্তরিক',
      'স্নেহাশিস গ্রহণ করিও। সময় পাইলেই একবার আসিয়া দেখিয়া যাইও।',
    ];

    let hy = 209;
    for (const ll of letterLines) {
      ctx.fillText(ll, 110, hy);
      hy += 38;
    }

    ctx.textAlign = 'right';
    ctx.fillText('ইতি,', 700, hy + 38);
    ctx.fillText('তোমারই কল্যাণকামী কাকা', 730, hy + 76);

  } else {
    // Legal deed / দলিল
    ctx.fillStyle = '#fffdf5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 3;
    ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

    ctx.fillStyle = '#451a03';
    ctx.font = 'bold 22px "Hind Siliguri", serif';
    ctx.textAlign = 'center';
    ctx.fillText('বাংলাদেশ অ-বিচারিক স্ট্যাম্প (মূল দলিল)', 400, 85);
    ctx.font = '16px "Hind Siliguri", sans-serif';
    ctx.fillText('মূল্যমান: ১০০০ টাকা (এক হাজার টাকা)', 400, 115);

    ctx.beginPath();
    ctx.moveTo(80, 135);
    ctx.lineTo(720, 135);
    ctx.stroke();

    ctx.textAlign = 'left';
    ctx.font = 'bold 16px "Hind Siliguri", sans-serif';
    ctx.fillText('সাফ-কবলা জমি বিক্রয় দলিলপত্র', 80, 175);

    ctx.font = '14px "Hind Siliguri", sans-serif';
    ctx.fillText('রেজিস্ট্রি অফিস: তেজগাঁও সাব-রেজিস্ট্রার কার্যালয়, ঢাকা।', 80, 205);
    ctx.fillText('দলিল নং: ৪৫৮২/২০২৩ | তারিখ: ১৮/১০/২০২৩ খ্রিঃ', 80, 230);

    const deedLines = [
      'প্রথম পক্ষ (বিক্রেতা): জনাব কামরুল হাসান, পিতা: মরহুম আব্দুল গফুর, সাং- মিরপুর, ঢাকা।',
      'দ্বিতীয় পক্ষ (ক্রেতা): জনাব তানভীর আহমেদ, পিতা: রফিকুল ইসলাম, সাং- ধানমন্ডি, ঢাকা।',
      '',
      'সম্পত্তির তফসিল বিবরণী:',
      'জেলা: ঢাকা, থানা: মিরপুর, মৌজা: সেনপাড়া পর্বতা, সিএস ও এসএ খতিয়ান নং: ২১২,',
      'আরএস খতিয়ান নং: ৮৯, দাগ নং: ১২৫০।',
      'জমির শ্রেণি: নাল/বাস্তু, মোট পরিমাণ: ০৫ (পাঁচ) কাঠা।',
      '',
      'চৌহদ্দি বর্ণনা:',
      'উত্তরে: রহিম সাহেবের বাড়ি, দক্ষিণে: ২০ ফুট প্রশস্ত পাকা সরকারি রাস্তা,',
      'পূর্বে: জলিল মিয়ার জমি, পশ্চিমে: খালি প্লট।',
      '',
      'পণমূল্য: সর্বমোট ৬০,০০,০০০/- (ষাট লক্ষ) টাকা নগদ বুঝিয়া পাইয়া চিরস্থায়ী স্বত্বে হস্তান্তর করিলাম।',
    ];

    let dy = 275;
    for (const dl of deedLines) {
      ctx.fillText(dl, 80, dy);
      dy += 28;
    }
  }

  return canvas.toDataURL('image/jpeg', 0.9);
}

export const SAMPLE_DOCUMENTS: SampleDoc[] = [
  {
    id: 'sample-circular',
    title: 'সরকারি বদলি ও পদায়ন প্রজ্ঞাপন',
    category: 'প্রশাসনিক নথি',
    description: 'জনপ্রশাসন মন্ত্রণালয়ের বদলি সংক্রান্ত অফিশিয়াল নোটিশ ও মেমো।',
    imageDataUrl: '', // generated lazily
    previewText: 'গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, জনপ্রশাসন মন্ত্রণালয়, প্রশাসন-১ অধিশাখা...',
    defaultMode: 'fields',
  },
  {
    id: 'sample-newspaper',
    title: 'ঐতিহাসিক সংবাদপত্র কাটিং',
    category: 'পত্রিকা ও আর্কাইভ',
    description: 'সুন্দরবনের জীববৈচিত্র্য ও রয়েল বেঙ্গল টাইগার সংরক্ষণ মহাপরিকল্পনা।',
    imageDataUrl: '',
    previewText: 'সুন্দরবনের জীববৈচিত্র্য রক্ষায় সমন্বিত মহাপরিকল্পনা গৃহীত...',
    defaultMode: 'full',
  },
  {
    id: 'sample-handwritten',
    title: 'হাতে লেখা পুরোনো বাংলা চিঠি',
    category: 'হস্তলিপি ও পাণ্ডুলিপি',
    description: 'শান্তিনিকেতন হতে লিখিত প্রাচীন বাংলা চিঠি ও যুক্তবর্ণ হস্তলিপি।',
    imageDataUrl: '',
    previewText: 'স্নেহের অমল, তোমার দীর্ঘ প্রতীক্ষিত পত্রখানি আজ অপরাহ্ণে হস্তগত হইল...',
    defaultMode: 'handwritten',
  },
  {
    id: 'sample-deed',
    title: 'জমির সাফ-কবলা দলিল ও খতিয়ান',
    category: 'আইনি ও দলিল',
    description: 'মিরপুর মৌজার দাগ ও খতিয়ান সংবলিত সাব-রেজিস্ট্রি সাফ-কবলা দলিল।',
    imageDataUrl: '',
    previewText: 'সাফ-কবলা জমি বিক্রয় দলিলপত্র, তেজগাঁও সাব-রেজিস্ট্রার কার্যালয়...',
    defaultMode: 'bilingual',
  },
];

export function getSampleDocImage(id: string): string {
  if (id === 'sample-circular') return createScannedDocDataUrl('circular');
  if (id === 'sample-newspaper') return createScannedDocDataUrl('newspaper');
  if (id === 'sample-handwritten') return createScannedDocDataUrl('handwritten');
  if (id === 'sample-deed') return createScannedDocDataUrl('deed');
  return '';
}

export const SAMPLE_WRITINGS: SampleWriting[] = [
  {
    id: 'w-1',
    title: 'বানান ও ণ-ত্ব ষ-ত্ব ভুল সংশোধন',
    category: 'বানান শুদ্ধিকরণ',
    description: 'বাংলা একাডেমি প্রমিত বানানের নিয়ম অনুযায়ী ভুল বানান ও প্রত্যয় সংশোধন।',
    mode: 'grammar_check',
    text: 'আমি একজন সরকারি কর্মচারি। আমরা অনেক কস্ট করে কাজ করসি। কিন্তু পরবর্তিতে কোন পুরষ্কার পাইনাই। আমাদের শিকা ব্যবস্থা আরো উনয়ন করা দরকার। তাহার বাড়ি নোয়াখালি জিলাতে।',
  },
  {
    id: 'w-2',
    title: 'সাধু ভাষা থেকে প্রমিত চলিত রূপান্তর',
    category: 'ভাষা রীতি',
    description: 'বঙ্কিমচন্দ্রীয় ধ্রুপদী সাধু ভাষার জটিল ক্রিয়াপদ ও সর্বনাম চলিত বাংলায় রূপান্তর।',
    mode: 'sadhu_to_cholit',
    text: 'তিনি গৃহে প্রবেশ করিয়া দেখিলেন যে, প্রদীপটি নিবিয়া গিয়াছে। তখন তিনি ব্যাকুল হইয়া চিৎকার করিতে লাগিলেন। তাঁহার আর্তনাদ শুনিয়া প্রতিবেশিগণ ছুটিয়া আসিয়া তাঁহাকে সান্ত্বনা দিতে লাগিল এবং বলিল, "ভয় পাইও না, আমরা তোমার সহিত আছি।"',
  },
  {
    id: 'w-3',
    title: 'অনানুষ্ঠানিক ড্রাফট থেকে দাপ্তরিক চিঠি',
    category: 'টোন ও স্টাইল',
    description: 'সাধারণ এলোমেলো খসড়াকে পেশাদার ও দাপ্তরিক সরকারি/করপোরেট ভাষায় রূপান্তর।',
    mode: 'tone_formal',
    text: 'স্যার, কালকে আমার শরীর খুব খারাপ আছিল, মাথা ঘুরাইতাসিল। তাই অফিসে আসতে পারি নাই। কাজের যা বাকি আছে আমি কাইলকে আইসা সব শেষ কইরা দিমু। আমার একদিনের ক্যাজুয়াল ছুটি মঞ্জুর কইরা দিলে ভালো হইব।',
  },
  {
    id: 'w-4',
    title: 'ইংরেজি থেকে শৈল্পিক বাংলা অনুবাদ',
    category: 'অনুবাদ',
    description: 'প্রযুক্তির উন্নয়ন সংক্রান্ত জটিল ইংরেজি অনুচ্ছেদকে প্রাঞ্জল বাংলা বাক্যে অনুবাদ।',
    mode: 'translate_en_bn',
    text: 'Digital preservation of low-resource linguistic heritages empowers regional communities. Through advanced multimodal artificial intelligence, historical Bengali manuscripts, legal deeds, and colloquial dialects can now be faithfully recognized and archived for future generations.',
  },
  {
    id: 'w-5',
    title: 'শব্দভাণ্ডার ও ভাবগাম্ভীর্য বৃদ্ধি',
    category: 'শব্দচয়ন',
    description: 'সাধারণ শব্দের পরিবর্তে সমৃদ্ধ প্রতিশব্দ ও অলংকারিক শব্দবিন্যাস।',
    mode: 'enhance_vocab',
    text: 'আজকের দিনটা খুব ভালো ছিল। আকাশে অনেক মেঘ ছিল আর বাতাস বইছিল। আমরা নদীর পাড়ে বসে অনেক গল্প করেছি আর গান শুনেছি। নদীর জল দেখতে খুব সুন্দর লাগছিল।',
  },
];

export const SAMPLE_AUDIOS: SampleAudio[] = [
  {
    id: 'audio-dhaka',
    title: 'প্রমিত বাংলা অফিস মিটিং আলোচনা',
    dialect: 'প্রমিত চলিত বাংলা (Standard Colloquial Dhaka)',
    description: 'প্রকল্পের অগ্রগতি, বাজেট বণ্টন ও পরবর্তী লক্ষ্যমাত্রা নিয়ে টিম মিটিং।',
    duration: '0:24',
    transcriptPreview: 'আজকের মিটিংয়ের মূল আলোচ্য বিষয় হলো আমাদের নতুন সফটওয়্যার প্ল্যাটফর্মের নিরাপত্তা নিরীক্ষা ও আগামী মাসের লঞ্চ পরিকল্পনা...',
  },
  {
    id: 'audio-chittagong',
    title: 'চট্টগ্রামের আঞ্চলিক উপভাষা কথন',
    dialect: 'চাঁটগাঁইয়া উপভাষা (Chittagong Dialect)',
    description: 'সামুদ্রিক মাছ শিকার ও কর্ণফুলী নদীর ঐতিহ্য নিয়ে প্রবীণ জেলের গল্প।',
    duration: '0:32',
    transcriptPreview: 'আঁরা বেইল্লা উঠিয়ে দইজ্জাত যাই গই। রাইত ভোর জাল ফেইলাই মাছ ধরিলে মন জুড়াই যায়...',
  },
  {
    id: 'audio-recitation',
    title: 'কাজী নজরুল ইসলামের "বিদ্রোহী" আবৃত্তি',
    dialect: 'কাব্যিক বাংলা (Literary Bengali)',
    description: 'জাতীয় কবি কাজী নজরুল ইসলামের কালজয়ী কবিতার দৃপ্ত কণ্ঠের আবৃত্তি।',
    duration: '0:28',
    transcriptPreview: 'বল বীর— বল উন্নত মম শির! শির নেহারি’ আমারি নতশির ওই শিখর হিমাদ্রির...',
  },
];

// Generates a mock playable Bengali speech audio tone waveform for instant testing if mic is unavailable
export function generateTestAudioDataUrl(textSnippet: string): string {
  if (typeof window === 'undefined') return '';
  try {
    // Generate a simple valid WAV file in memory with sine chords
    const sampleRate = 16000;
    const duration = 2.5; // seconds
    const numSamples = sampleRate * duration;
    const buffer = new ArrayBuffer(44 + numSamples * 2);
    const view = new DataView(buffer);

    // RIFF chunk
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + numSamples * 2, true);
    writeString(view, 8, 'WAVE');

    // fmt sub-chunk
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true); // PCM
    view.setUint16(22, 1, true); // Mono
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);

    // data sub-chunk
    writeString(view, 36, 'data');
    view.setUint32(40, numSamples * 2, true);

    // Generate vocal-like modulated tone
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      // Speech fundamental frequency (~140Hz with modulation)
      const f0 = 140 + 20 * Math.sin(2 * Math.PI * 2 * t);
      const val = 0.4 * Math.sin(2 * Math.PI * f0 * t) +
                  0.25 * Math.sin(2 * Math.PI * f0 * 2 * t) +
                  0.15 * Math.sin(2 * Math.PI * f0 * 3 * t);
      const sample = Math.max(-1, Math.min(1, val)) * 0x7fff;
      view.setInt16(44 + i * 2, sample, true);
    }

    const blob = new Blob([buffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch (e) {
    console.error('Audio generation error:', e);
    return '';
  }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}
