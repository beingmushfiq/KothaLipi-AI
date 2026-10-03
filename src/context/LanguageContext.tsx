import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language } from '../types';

interface Translations {
  // Navigation
  brandName: string;
  brandSubtitle: string;
  navOcr: string;
  navWriter: string;
  navVoice: string;
  navArchive: string;

  // OCR Workspace
  ocrModuleBadge: string;
  ocrTitle: string;
  ocrDescription: string;
  ocrUploadBtn: string;
  ocrStartBtn: string;
  ocrProcessing: string;
  ocrSampleLabel: string;
  ocrModeFields: string;
  ocrModeFull: string;
  ocrModeHandwritten: string;
  ocrModeBilingual: string;
  ocrOriginalDoc: string;
  ocrExtractedData: string;
  ocrAccuracy: string;
  ocrListen: string;
  ocrCopy: string;
  ocrCopied: string;
  copyToClipboard: string;
  copiedToClipboard: string;
  ocrDownload: string;
  ocrSendToWriter: string;
  ocrSummaryHeader: string;
  ocrStructuredFields: string;
  ocrFieldsCount: string;
  ocrHandwritingNotes: string;
  ocrEnglishTranslation: string;
  ocrFullText: string;
  ocrCharacters: string;
  ocrEmptyTitle: string;
  ocrEmptyDesc: string;
  ocrErrorPrefix: string;
  ocrClose: string;

  // Writer Workspace
  writerModuleBadge: string;
  writerTitle: string;
  writerDescription: string;
  writerProcessBtn: string;
  writerProcessing: string;
  writerSampleLabel: string;
  writerModeGrammar: string;
  writerModeSadhuToCholit: string;
  writerModeCholitToSadhu: string;
  writerModeFormal: string;
  writerModeLiterary: string;
  writerModeConcise: string;
  writerModeVocab: string;
  writerModeTranslateEnBn: string;
  writerOriginalDraft: string;
  writerPlaceholder: string;
  writerPolishedOutput: string;
  writerScore: string;
  writerStyleEval: string;
  writerChangesApplied: string;
  writerAcceptAll: string;
  writerAccept: string;
  writerAccepted: string;
  writerSynonyms: string;
  writerEmptyTitle: string;
  writerEmptyDesc: string;
  writerAvroPhonetic: string;
  writerAvroOn: string;
  writerAvroOff: string;
  writerAvroHint: string;
  writerVirtualKeys: string;
  writerDiacritics: string;
  writerLigatures: string;
  writerNumbers: string;
  writerPunctuation: string;
  writerExportBtn: string;
  writerExportPdf: string;
  writerExportPdfDesc: string;
  writerExportTxt: string;
  writerExportTxtDesc: string;
  writerExportDocx: string;
  writerExportDocxDesc: string;
  writerExportMd: string;
  writerExportMdDesc: string;
  writerToneTitle: string;
  writerToneSubtitle: string;
  writerToneProfessional: string;
  writerToneProfessionalDesc: string;
  writerToneCreative: string;
  writerToneCreativeDesc: string;
  writerToneConversational: string;
  writerToneConversationalDesc: string;
  writerToneAcademic: string;
  writerToneAcademicDesc: string;
  writerTonePersuasive: string;
  writerTonePersuasiveDesc: string;
  writerToneCustom: string;
  writerToneCustomPlaceholder: string;
  writerToneApplyBtn: string;

  // Voice Workspace
  voiceModuleBadge: string;
  voiceTitle: string;
  voiceDescription: string;
  voiceProcessBtn: string;
  voiceProcessing: string;
  voiceSampleLabel: string;
  voiceDialectNorm: string;
  voiceSpeakerDiarization: string;
  voiceConsoleTitle: string;
  voiceUploadAudio: string;
  voiceRecordingActive: string;
  voiceAudioReady: string;
  voiceRecordPrompt: string;
  voiceStartRecord: string;
  voiceStopRecord: string;
  voiceTranscriptTitle: string;
  voiceSummaryHeader: string;
  voiceViewStandard: string;
  voiceViewVerbatim: string;
  voiceSpeakerTurns: string;
  voiceActionItems: string;
  voiceEmptyTitle: string;
  voiceEmptyDesc: string;

  // History & Storage
  archiveModuleBadge: string;
  archiveTitle: string;
  archiveDescription: string;
  archiveClearBtn: string;
  archiveFilterAll: string;
  archiveFilterOcr: string;
  archiveFilterWriter: string;
  archiveFilterVoice: string;
  archiveSearchPlaceholder: string;
  archiveEmptyTitle: string;
  archiveEmptyDesc: string;
  archiveOpenInWorkspace: string;
  archiveOcrDoc: string;
  archiveWriterDraft: string;
  archiveVoiceTranscript: string;
  historyViewFullOutcome: string;
  historyFullOutcomeModalTitle: string;
  historyDeleteItem: string;
  historyItemDeleted: string;
  googleSignIn: string;
  googleSignOut: string;
  googleAccountConnected: string;
  googleSyncDesc: string;
  googleSignInPrompt: string;
  googleSyncActive: string;

  // Footer & Toasts
  footerTitle: string;
  footerDesc: string;
  footerStandard: string;
  footerTech: string;
  footerWorkspacesTitle: string;
  footerEngineeringTitle: string;
  footerEngineeringDesc: string;
  footerVisitDcp: string;
  footerAllRightsReserved: string;
  toastSentToWriter: string;
  toastHistoryCleared: string;
}

const translations: Record<Language, Translations> = {
  en: {
    brandName: 'Shobdo',
    brandSubtitle: 'Bengali Word, Vision & Voice Engine',
    navOcr: 'Vision OCR',
    navWriter: 'Writing Studio',
    navVoice: 'Voice to Text',
    navArchive: 'History',

    ocrModuleBadge: 'MODULE 01 · VISION RECOGNITION',
    ocrTitle: 'Bangla Scanned Document OCR',
    ocrDescription:
      'High-precision optical character recognition for administrative gazettes, archival newspapers, Rabindric cursive manuscripts, and land registry deeds with full ligature preservation.',
    ocrUploadBtn: 'Upload Document',
    ocrStartBtn: 'Start OCR',
    ocrProcessing: 'Extracting Text...',
    ocrSampleLabel: 'Historical & Real Samples:',
    ocrModeFields: 'Form & Key-Value Fields',
    ocrModeFull: 'Full Text & Layout',
    ocrModeHandwritten: 'Handwritten Deciphering',
    ocrModeBilingual: 'Bilingual Translation',
    ocrOriginalDoc: 'Scanned Source Document',
    ocrExtractedData: 'Extracted Bengali Text',
    ocrAccuracy: 'ACCURACY',
    ocrListen: 'Listen',
    ocrCopy: 'Copy',
    ocrCopied: 'Copied',
    copyToClipboard: 'Copy to Clipboard',
    copiedToClipboard: 'Copied!',
    ocrDownload: 'Download',
    ocrSendToWriter: 'Send to Writer',
    ocrSummaryHeader: 'EXECUTIVE SUMMARY',
    ocrStructuredFields: 'Extracted Fields (Structured Data)',
    ocrFieldsCount: 'FIELDS',
    ocrHandwritingNotes: 'Cursive & Ligature Disambiguation:',
    ocrEnglishTranslation: 'ENGLISH TRANSLATION',
    ocrFullText: 'Full Verbatim Extracted Text:',
    ocrCharacters: 'characters',
    ocrEmptyTitle: 'No Document Processed Yet',
    ocrEmptyDesc: 'Select a sample document from above or upload your own, then click "Start OCR".',
    ocrErrorPrefix: 'OCR processing error:',
    ocrClose: 'Close',

    writerModuleBadge: 'MODULE 02 · LINGUISTIC & ORTHOGRAPHY STUDIO',
    writerTitle: 'Bangla Writing & Proofreading Assistant',
    writerDescription:
      'Bangla Academy standardized orthography, Sadhu ⇄ Cholit conversion, Natwa & Satwa Bidhan compliance, and formal institutional tone rewriting.',
    writerProcessBtn: 'Proofread & Polish',
    writerProcessing: 'Analyzing Grammar...',
    writerSampleLabel: 'Sample Drafts:',
    writerModeGrammar: 'Spelling & Grammar',
    writerModeSadhuToCholit: 'Sadhu ➔ Cholit',
    writerModeCholitToSadhu: 'Cholit ➔ Sadhu',
    writerModeFormal: 'Formal / Professional',
    writerModeLiterary: 'Literary & Aesthetic',
    writerModeConcise: 'Concise & Clear',
    writerModeVocab: 'Enrich Vocabulary',
    writerModeTranslateEnBn: 'English ➔ Bangla',
    writerOriginalDraft: 'Original Bengali Draft',
    writerPlaceholder: 'Type or paste your Bengali text here...',
    writerPolishedOutput: 'Polished & Standardized Text',
    writerScore: 'SCORE',
    writerStyleEval: 'Stylistic & Linguistic Assessment:',
    writerChangesApplied: 'Orthography & Grammar Rules Applied',
    writerAcceptAll: 'Accept All Changes',
    writerAccept: 'Accept',
    writerAccepted: 'Accepted',
    writerSynonyms: 'Contextual Phrasing & Synonyms:',
    writerEmptyTitle: 'No Results Yet',
    writerEmptyDesc: 'Provide text on the left and click "Proofread & Polish".',
    writerAvroPhonetic: 'Avro Phonetic Keyboard:',
    writerAvroOn: 'Active (ON)',
    writerAvroOff: 'Disabled (OFF)',
    writerAvroHint: 'Type phonetically in English to produce Bengali (e.g. "ami" ➔ "আমি")',
    writerVirtualKeys: 'Ligatures & Character Board',
    writerDiacritics: 'Diacritics, Matras & Modifiers:',
    writerLigatures: 'Essential Compound Ligatures (যুক্তবর্ণ):',
    writerNumbers: 'Numbers:',
    writerPunctuation: 'Punctuation:',
    writerExportBtn: 'Export / Download',
    writerExportPdf: 'Export as PDF (.pdf)',
    writerExportPdfDesc: 'Print-ready formatted document with Bengali typography',
    writerExportTxt: 'Download as Text (.txt)',
    writerExportTxtDesc: 'Clean UTF-8 encoded plain text file',
    writerExportDocx: 'Word Document (.docx)',
    writerExportDocxDesc: 'Editable Microsoft Word & Google Docs format with styles',
    writerExportMd: 'Markdown Document (.md)',
    writerExportMdDesc: 'Formatted document with metadata, tables and change log',
    writerToneTitle: 'AI Tone Adjustment',
    writerToneSubtitle: 'Rewrite text with artificial intelligence in distinct communication registers',
    writerToneProfessional: 'Professional',
    writerToneProfessionalDesc: 'Authoritative, polite, corporate tone for business & official notices',
    writerToneCreative: 'Creative',
    writerToneCreativeDesc: 'Poetic, vivid imagery with aesthetic literary cadence',
    writerToneConversational: 'Conversational',
    writerToneConversationalDesc: 'Friendly, natural, everyday spoken contemporary phrasing',
    writerToneAcademic: 'Academic',
    writerToneAcademicDesc: 'Scholarly, analytical rigor with intellectual research terminology',
    writerTonePersuasive: 'Persuasive',
    writerTonePersuasiveDesc: 'Inspiring rhetoric with compelling calls-to-action',
    writerToneCustom: 'Custom Tone',
    writerToneCustomPlaceholder: 'E.g. Warm celebration, gentle reminder, firm warning...',
    writerToneApplyBtn: 'Rewrite in Selected Tone',

    voiceModuleBadge: 'MODULE 03 · ACOUSTIC SPEECH STUDIO',
    voiceTitle: 'Bangla Voice-to-Text Transcription',
    voiceDescription:
      'Transcribe Bengali voice recordings or live microphone input into punctuated text with regional dialect normalization and speaker diarization.',
    voiceProcessBtn: 'Start Transcription',
    voiceProcessing: 'Transcribing Audio...',
    voiceSampleLabel: 'Sample Audio Recordings:',
    voiceDialectNorm: 'Regional Dialect Normalization (আঞ্চলিক থেকে প্রমিত)',
    voiceSpeakerDiarization: 'Speaker Diarization (Multi-speaker separation)',
    voiceConsoleTitle: 'Voice Recorder & Audio Console',
    voiceUploadAudio: 'Upload Audio File',
    voiceRecordingActive: 'Recording live... Speak clearly',
    voiceAudioReady: 'Audio file ready',
    voiceRecordPrompt: 'Click microphone button below to record',
    voiceStartRecord: 'Start Recording',
    voiceStopRecord: 'Stop Recording',
    voiceTranscriptTitle: 'Transcript Result',
    voiceSummaryHeader: 'AUDIO EXECUTIVE SUMMARY',
    voiceViewStandard: 'Standard Bengali (প্রমিত রূপ)',
    voiceViewVerbatim: 'Verbatim Dialect (আঞ্চলিক কথন)',
    voiceSpeakerTurns: 'Speaker Turns & Dialogue',
    voiceActionItems: 'Key Action Items & Takeaways:',
    voiceEmptyTitle: 'No Transcript Yet',
    voiceEmptyDesc: 'Record voice on the left or select an audio sample, then click "Start Transcription".',

    archiveModuleBadge: 'HISTORY VAULT · CLOUD & LOCAL',
    archiveTitle: 'Workspace Activity History',
    archiveDescription:
      'All your full OCR outputs, improved writings, and voice transcripts are preserved with complete outcomes.',
    archiveClearBtn: 'Clear History',
    archiveFilterAll: 'All',
    archiveFilterOcr: 'OCR',
    archiveFilterWriter: 'Writing',
    archiveFilterVoice: 'Voice',
    archiveSearchPlaceholder: 'Search title or outcome text...',
    archiveEmptyTitle: 'No History Items Found',
    archiveEmptyDesc: 'Processed OCR files, grammar reviews, and voice transcripts with full outcomes will appear here.',
    archiveOpenInWorkspace: 'Open in Workspace',
    archiveOcrDoc: 'OCR Document',
    archiveWriterDraft: 'Writing Draft',
    archiveVoiceTranscript: 'Voice Transcript',
    historyViewFullOutcome: 'View Full Outcome',
    historyFullOutcomeModalTitle: 'Full Outcome & Output Details',
    historyDeleteItem: 'Delete Record',
    historyItemDeleted: 'History record removed',
    googleSignIn: 'Sign in with Google',
    googleSignOut: 'Sign Out',
    googleAccountConnected: 'Google Account Connected',
    googleSyncDesc: 'Full outcomes and processing archives automatically sync to your individual Google account.',
    googleSignInPrompt: 'Sign in with Google to save your history and full outcomes to your individual account.',
    googleSyncActive: 'Cloud Sync Active',

    footerTitle: 'Shobdo · শব্দ',
    footerDesc: 'The Bengali Word, Vision & Voice Engine',
    footerStandard: 'Bangla Academy Standard Orthography Protocols',
    footerTech: 'Multimodal Audio & Vision Engineering',
    footerWorkspacesTitle: 'Workspaces',
    footerEngineeringTitle: 'Engineering & Cloud',
    footerEngineeringDesc: 'Architected & supported by DevCenterPoint',
    footerVisitDcp: 'Visit DevCenterPoint',
    footerAllRightsReserved: 'All rights reserved.',
    toastSentToWriter: 'Text sent to Writing & Grammar Assistant.',
    toastHistoryCleared: 'Activity history cleared.',
  },

  bn: {
    brandName: 'শব্দ',
    brandSubtitle: 'বাংলা শব্দ, লিপি ও কণ্ঠস্বর এআই',
    navOcr: 'নথি পাঠ (OCR)',
    navWriter: 'শুদ্ধ লেখনী',
    navVoice: 'কণ্ঠস্বর (Voice)',
    navArchive: 'হিস্ট্রি',

    ocrModuleBadge: 'MODULE 01 · VISION RECOGNITION',
    ocrTitle: 'বাংলা স্ক্যানড ডকুমেন্ট ওসিআর',
    ocrDescription:
      'সরকারি প্রজ্ঞাপন, প্রাচীন সংবাদপত্র, রবীন্দ্রনাথীয় হস্তলিপি ও জমিজমার সাফ-কবলা দলিল থেকে নির্ভুল যুক্তবর্ণ, অনুচ্ছেদ ও কাঠামোগত তথ্য নিষ্কাশন।',
    ocrUploadBtn: 'নথি আপলোড',
    ocrStartBtn: 'ওসিআর শুরু করুন',
    ocrProcessing: 'নিষ্কাশন চলছে...',
    ocrSampleLabel: 'ঐতিহাসিক ও বাস্তব স্যাম্পল:',
    ocrModeFields: 'ফরম ও ফিল্ড তথ্য (Key-Value)',
    ocrModeFull: 'সম্পূর্ণ পাঠ্য ও লেআউট (Full Text)',
    ocrModeHandwritten: 'হাতের লেখা পাঠোদ্ধার (Handwritten)',
    ocrModeBilingual: 'দ্বিভাষিক অনুবাদ (Bangla + English)',
    ocrOriginalDoc: 'স্ক্যান করা মূল নথিপত্র',
    ocrExtractedData: 'নিষ্কাশিত বাংলা উপাত্ত',
    ocrAccuracy: 'ACCURACY',
    ocrListen: 'শুনুন',
    ocrCopy: 'কপি',
    ocrCopied: 'কপি হয়েছে',
    copyToClipboard: 'ক্লিপবোর্ডে কপি করুন',
    copiedToClipboard: 'ক্লিপবোর্ডে কপি হয়েছে!',
    ocrDownload: 'ডাউনলোড',
    ocrSendToWriter: 'লেখক সহায়কে পাঠান',
    ocrSummaryHeader: 'সারসংক্ষেপ (EXECUTIVE SUMMARY)',
    ocrStructuredFields: 'নিষ্কাশিত তথ্যাবলী (Structured Data)',
    ocrFieldsCount: 'FIELDS',
    ocrHandwritingNotes: 'হাতের লেখার অস্পষ্ট শব্দের বিশ্লেষণ:',
    ocrEnglishTranslation: 'ENGLISH TRANSLATION',
    ocrFullText: 'পূর্ণাঙ্গ নিষ্কাশিত পাঠ্য:',
    ocrCharacters: 'অক্ষর',
    ocrEmptyTitle: 'কোনো ফলাফল নেই',
    ocrEmptyDesc: 'বামপাশের নথিটি দেখে "ওসিআর শুরু করুন" বোতামে ক্লিক করুন।',
    ocrErrorPrefix: 'ওসিআর প্রক্রিয়াকরণে সমস্যা হয়েছে:',
    ocrClose: 'বন্ধ করুন',

    writerModuleBadge: 'MODULE 02 · LINGUISTIC & ORTHOGRAPHY STUDIO',
    writerTitle: 'বাংলা লেখা ও ব্যাকরণ সংশোধন সহায়ক',
    writerDescription:
      'বাংলা একাডেমি প্রমিত বানানের নিয়মাবলী, ণ-ত্ব ও ষ-ত্ব বিধান, গুরুচণ্ডালী দোষ বর্জন, সাধু-চলিত ভাষা রূপান্তর এবং প্রাতিষ্ঠানিক শৈলী পরিমার্জন।',
    writerProcessBtn: 'সংশোধন ও পরিমার্জন করুন',
    writerProcessing: 'নিরীক্ষা চলছে...',
    writerSampleLabel: 'নমুনা ড্রাফট:',
    writerModeGrammar: 'শুদ্ধ বানান ও ব্যাকরণ',
    writerModeSadhuToCholit: 'সাধু ➔ চলিত',
    writerModeCholitToSadhu: 'চলিত ➔ সাধু',
    writerModeFormal: 'দাপ্তরিক / পেশাদার রূপ',
    writerModeLiterary: 'সাহিত্যিক ও নান্দনিক',
    writerModeConcise: 'সংক্ষেপণ ও সহজ রূপ',
    writerModeVocab: 'সমৃদ্ধ শব্দভাণ্ডার',
    writerModeTranslateEnBn: 'ইংরেজি ➔ বাংলা',
    writerOriginalDraft: 'মূল বাংলা ড্রাফট',
    writerPlaceholder: 'এখানে আপনার বাংলা লেখা টাইপ করুন অথবা পেস্ট করুন...',
    writerPolishedOutput: 'পরিমার্জিত ও শুদ্ধ রূপ',
    writerScore: 'SCORE',
    writerStyleEval: 'ভাষারীতি ও শৈলী মূল্যায়ন:',
    writerChangesApplied: 'সংশোধিত বানান ও ব্যাকরণ বিধি',
    writerAcceptAll: 'সকল সংশোধন গ্রহণ করুন',
    writerAccept: 'গ্রহণ',
    writerAccepted: 'গৃহীত',
    writerSynonyms: 'সমৃদ্ধ প্রতিশব্দ ও ভাবানুগ প্রয়োগ:',
    writerEmptyTitle: 'কোনো ফলাফল নেই',
    writerEmptyDesc: 'বামপাশে আপনার লেখা প্রদান করে "সংশোধন ও পরিমার্জন করুন" বোতামে ক্লিক করুন।',
    writerAvroPhonetic: 'অভ্রো ফোনেটিক (Avro) :',
    writerAvroOn: 'সক্রিয় (ON)',
    writerAvroOff: 'নিষ্ক্রিয় (OFF)',
    writerAvroHint: 'ইংরেজি অক্ষরে লিখলে স্বয়ংক্রিয় বাংলা লিপিতে রূপান্তরিত হবে (যেমন: "ami" ➔ "আমি")',
    writerVirtualKeys: 'যুক্তবর্ণ ও বিশেষ বর্ণফলক',
    writerDiacritics: 'কার, ফলা ও ধ্বনিচিহ্ন:',
    writerLigatures: 'প্রয়োজনীয় যুক্তবর্ণ:',
    writerNumbers: 'সংখ্যা:',
    writerPunctuation: 'বিরামচিহ্ন:',
    writerExportBtn: 'ডাউনলোড ও এক্সপোর্ট',
    writerExportPdf: 'পিডিএফ হিসেবে সংরক্ষণ (.pdf)',
    writerExportPdfDesc: 'মুদ্রণযোগ্য সুন্দর বাংলা ফন্ট ও লেআউট ফরম্যাট',
    writerExportTxt: 'টেক্সট ফাইল ডাউনলোড (.txt)',
    writerExportTxtDesc: 'ইউটিএফ-৮ এনকোডেড প্লেইন টেক্সট ফাইল',
    writerExportDocx: 'ওয়ার্ড ডকুমেন্ট (.docx)',
    writerExportDocxDesc: 'মাইক্রোসফট ওয়ার্ড ও গুগল ডকসে ব্যবহারের উপযোগী ফরম্যাট',
    writerExportMd: 'মার্কডাউন ডাউনলোড (.md)',
    writerExportMdDesc: 'মেটাডাটা ও টেবিলসহ সম্পূর্ণ ফরম্যাটেড মার্কডাউন',
    writerToneTitle: 'এআই টোন ও ভাষারীতি পরিবর্তন',
    writerToneSubtitle: 'কৃত্রিম বুদ্ধিমত্তার মাধ্যমে বিভিন্ন স্বরে ও শৈলীতে আপনার লেখা নতুন করে রূপান্তর করুন',
    writerToneProfessional: 'পেশাদার ও দাপ্তরিক',
    writerToneProfessionalDesc: 'দাপ্তরিক যোগাযোগ, চিঠি ও ব্যবসায়িক প্রস্তাবের উপযোগী মার্জিত রূপ',
    writerToneCreative: 'সৃজনশীল ও সাহিত্যিক',
    writerToneCreativeDesc: 'নান্দনিক উপমা, কাব্যিক ছন্দ ও শিল্পগুণসম্পন্ন ভাবপ্রকাশ',
    writerToneConversational: 'কথ্য ও ঘরোয়া',
    writerToneConversationalDesc: 'বন্ধুসুলভ, সহজ ও স্বাভাবিক আড্ডার সমসাময়িক কথনভঙ্গি',
    writerToneAcademic: 'অ্যাকাডেমিক ও গবেষণা',
    writerToneAcademicDesc: 'গবেষণা প্রবন্ধ, থিসিস ও গভীর বৌদ্ধিক বিশ্লেষণের উপযোগী শব্দচয়ন',
    writerTonePersuasive: 'জোরালো ও প্রভাবশালী',
    writerTonePersuasiveDesc: 'অনুপ্রেরণাদায়ী ও জোরালো বক্তব্যসহ পাঠককে প্রভাবিত করার কৌশল',
    writerToneCustom: 'পছন্দসই নিজস্ব টোন',
    writerToneCustomPlaceholder: 'যেমন: উষ্ণ শুভেচ্ছা, নম্র অনুরোধ, দৃঢ় সতর্কবার্তা...',
    writerToneApplyBtn: 'এই টোনে রূপান্তর করুন',

    voiceModuleBadge: 'MODULE 03 · ACOUSTIC SPEECH STUDIO',
    voiceTitle: 'বাংলা ভয়েস-টু-টেক্সট রূপান্তর',
    voiceDescription:
      'বাংলা অডিও বা সরাসরি মাইক্রোফোন থেকে নিখুঁত বিরামচিহ্নযুক্ত টেক্সট, আঞ্চলিক উপভাষা শনাক্তকরণ, বক্তা বিভাজন ও প্রমিত বাংলায় রূপান্তর।',
    voiceProcessBtn: 'ট্রান্সক্রিপশন শুরু করুন',
    voiceProcessing: 'ট্রান্সক্রাইব হচ্ছে...',
    voiceSampleLabel: 'নমুনা বাংলা অডিও:',
    voiceDialectNorm: 'আঞ্চলিক উপভাষা থেকে প্রমিত বাংলায় রূপান্তর (Dialect Normalization)',
    voiceSpeakerDiarization: 'বক্তা বিভাজন (Speaker Diarization)',
    voiceConsoleTitle: 'ভয়েস রেকর্ডার ও অডিও কনসোল',
    voiceUploadAudio: 'অডিও ফাইল আপলোড',
    voiceRecordingActive: 'রেকর্ডিং চলছে... স্পষ্ট স্বরে কথা বলুন',
    voiceAudioReady: 'অডিও প্রস্তুত রয়েছে',
    voiceRecordPrompt: 'রেকর্ড করতে নিচের বাটনে চাপ দিন',
    voiceStartRecord: 'রেকর্ড শুরু করুন',
    voiceStopRecord: 'রেকর্ডিং বন্ধ করুন',
    voiceTranscriptTitle: 'লিখিত রূপ (Transcript)',
    voiceSummaryHeader: 'কথার সারসংক্ষেপ (AUDIO SUMMARY)',
    voiceViewStandard: 'প্রমিত বাংলা রূপ (Standard Bengali)',
    voiceViewVerbatim: 'আঞ্চলিক মূল কথন (Verbatim Dialect)',
    voiceSpeakerTurns: 'বক্তাভিত্তিক সংলাপ (Speaker Turns)',
    voiceActionItems: 'মূল সিদ্ধান্ত ও আলোচ্য বিষয়:',
    voiceEmptyTitle: 'কোনো ট্রান্সক্রিপ্ট নেই',
    voiceEmptyDesc: 'বামপাশে কণ্ঠ রেকর্ড করে অথবা অডিও ফাইল নির্বাচন করে "ট্রান্সক্রিপশন শুরু করুন" বোতামে চাপ দিন।',

    archiveModuleBadge: 'হিস্ট্রি ও ফলাফল · ক্লাউড ও লোকাল',
    archiveTitle: 'কার্যক্রম ও ফলাফল হিস্ট্রি',
    archiveDescription:
      'আপনার প্রক্রিয়াজাত সকল ওসিআর নথি, পরিমার্জিত বাংলা লেখা এবং অডিও ট্রান্সক্রিপশন ফলাফলসহ সুরক্ষিত রয়েছে।',
    archiveClearBtn: 'হিস্ট্রি মুছুন',
    archiveFilterAll: 'সকল',
    archiveFilterOcr: 'ওসিআর',
    archiveFilterWriter: 'লেখা',
    archiveFilterVoice: 'ভয়েস',
    archiveSearchPlaceholder: 'শিরোনাম বা আউটপুট টেক্সট খুঁজুন...',
    archiveEmptyTitle: 'কোনো হিস্ট্রি পাওয়া যায়নি',
    archiveEmptyDesc: 'স্ক্যান করা নথি, ব্যাকরণ নিরীক্ষা বা ভয়েস ট্রান্সক্রিপশন সম্পন্ন হলে পূর্ণ ফলাফলসহ এখানে সংরক্ষিত হবে।',
    archiveOpenInWorkspace: 'ওয়ার্কস্পেসে খুলুন',
    archiveOcrDoc: 'ওসিআর নথি',
    archiveWriterDraft: 'লেখা নিরীক্ষা',
    archiveVoiceTranscript: 'ভয়েস ট্রান্সক্রিপ্ট',
    historyViewFullOutcome: 'সম্পূর্ণ ফলাফল দেখুন',
    historyFullOutcomeModalTitle: 'সম্পূর্ণ ফলাফল ও আউটপুট বিবরণ',
    historyDeleteItem: 'রেকর্ড মুছুন',
    historyItemDeleted: 'হিস্ট্রি রেকর্ড মুছে ফেলা হয়েছে',
    googleSignIn: 'গুগল দিয়ে সাইন ইন করুন',
    googleSignOut: 'সাইন আউট',
    googleAccountConnected: 'গুগল অ্যাকাউন্ট সংযুক্ত',
    googleSyncDesc: 'আপনার সম্পূর্ণ ফলাফল ও কাজের হিস্ট্রি স্বয়ংক্রিয়ভাবে ব্যক্তিগত গুগল অ্যাকাউন্টে সেভ হচ্ছে।',
    googleSignInPrompt: 'আপনার ব্যক্তিগত অ্যাকাউন্টে ফলাফল ও হিস্ট্রি সুরক্ষিত রাখতে গুগল দিয়ে সাইন ইন করুন।',
    googleSyncActive: 'ক্লাউড সিঙ্ক চালু আছে',

    footerTitle: 'শব্দ · Shobdo',
    footerDesc: 'বাংলা ভাষার দৃষ্টি, লেখনী ও কণ্ঠস্বরের এআই ইঞ্জিন',
    footerStandard: 'বাংলা একাডেমি প্রমিত বানান প্রটোকল',
    footerTech: 'মাল্টিমোডাল অডিও ও ভিশন ইঞ্জিনিয়ারিং',
    footerWorkspacesTitle: 'ওয়ার্কস্পেস ও মডিউল',
    footerEngineeringTitle: 'ইঞ্জিনিয়ারিং ও ক্লাউড',
    footerEngineeringDesc: 'ডেভসেন্টারপয়েন্ট (DevCenterPoint) কর্তৃক পরিচালিত ও প্রস্তুতকৃত',
    footerVisitDcp: 'DevCenterPoint ভিজিট করুন',
    footerAllRightsReserved: 'সর্বস্বত্ব সংরক্ষিত।',
    toastSentToWriter: 'পাঠ্যটি লেখক ও ব্যাকরণ সহায়কে পাঠানো হয়েছে।',
    toastHistoryCleared: 'ইতিহাস মুছে ফেলা হয়েছে।',
  },
};

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const LANGUAGE_STORAGE_KEY = 'bangla_ai_toolkit_lang_pref';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default language is English ('en')
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {
      // ignore
    }
    return 'en'; // English is default
  });

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    } catch {
      // ignore
    }
  }, [language]);

  const toggleLanguage = () => {
    setLanguageState((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  return (
    <LanguageContext.Provider
      value={{
        language,
        toggleLanguage,
        setLanguage,
        t: translations[language],
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
