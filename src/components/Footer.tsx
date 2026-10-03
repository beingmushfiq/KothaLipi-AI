import React from 'react';
import { BrandLogo } from './BrandLogo';
import { DevCenterPointLogo } from './DevCenterPointLogo';
import { useLanguage } from '../context/LanguageContext';
import { ActiveTab } from '../types';
import {
  ExternalLink,
  ShieldCheck,
  Sparkles,
  ScanText,
  PenTool,
  Mic,
  History,
  CheckCircle2,
} from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: ActiveTab) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab }) => {
  const { t, language } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-stone-200/80 dark:border-white/[0.08] bg-[#f2efe9] dark:bg-[#07090e] text-stone-600 dark:text-neutral-400 font-sans mt-auto transition-colors duration-300 pb-16 md:pb-0">
      {/* Upper Main Footer Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: KothaLipi Brand Identity (4 cols) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center gap-3">
                <BrandLogo size="md" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-brand font-black text-xl tracking-tight text-stone-900 dark:text-white leading-none">
                      {t.brandName}
                    </span>
                    <span className="font-bangla-brand text-sm font-bold text-teal-700 dark:text-teal-400 leading-none">
                      {language === 'en' ? 'কথালিপি' : 'KothaLipi'}
                    </span>
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-teal-500/10 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300 border border-teal-500/25">
                      AI
                    </span>
                  </div>
                  <span
                    className={`text-xs text-stone-500 dark:text-neutral-400 tracking-wide mt-1 leading-none ${
                      language === 'bn' ? 'font-bangla' : 'font-sans'
                    }`}
                  >
                    {t.brandSubtitle}
                  </span>
                </div>
              </div>

              <p className="mt-4 text-xs leading-relaxed text-stone-600 dark:text-neutral-400 max-w-sm">
                {language === 'en'
                  ? 'A specialized multimodal language intelligence engine engineered for Bengali script, Rabindric manuscripts, Bangla Academy orthography, and regional acoustic speech transcription.'
                  : 'বাংলা লিপি, রবীন্দ্রনাথীয় হস্তলিপি, বাংলা একাডেমি প্রমিত বানানরীতি এবং আঞ্চলিক উপভাষা প্রতিলেখনে নিয়োজিত বিশেষায়িত মাল্টিমোডাল এআই ইঞ্জিন।'}
              </p>
            </div>

            {/* Live Engine Status Badge */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-stone-200/60 dark:bg-white/[0.04] border border-stone-300/60 dark:border-white/[0.06] w-fit text-[11px]">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-medium text-stone-700 dark:text-neutral-300">
                {language === 'en'
                  ? 'Engine Status: Operational'
                  : 'সার্ভিস স্ট্যাটাস: সচল ও সক্রিয়'}
              </span>
            </div>
          </div>

          {/* Column 2: Workspaces & Navigation (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-brand font-bold text-xs uppercase tracking-wider text-stone-900 dark:text-white mb-4 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>{t.footerWorkspacesTitle}</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button
                  onClick={() => onNavigateTab('ocr')}
                  className="group flex items-center gap-2 text-stone-600 hover:text-teal-700 dark:text-neutral-400 dark:hover:text-teal-300 transition-colors text-left"
                >
                  <ScanText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span>{t.navOcr}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('writer')}
                  className="group flex items-center gap-2 text-stone-600 hover:text-emerald-700 dark:text-neutral-400 dark:hover:text-emerald-300 transition-colors text-left"
                >
                  <PenTool className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span>{t.navWriter}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('voice')}
                  className="group flex items-center gap-2 text-stone-600 hover:text-sky-700 dark:text-neutral-400 dark:hover:text-sky-300 transition-colors text-left"
                >
                  <Mic className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span>{t.navVoice}</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigateTab('history')}
                  className="group flex items-center gap-2 text-stone-600 hover:text-indigo-700 dark:text-neutral-400 dark:hover:text-indigo-300 transition-colors text-left"
                >
                  <History className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 opacity-70 group-hover:opacity-100 transition-opacity" />
                  <span>{t.navArchive}</span>
                </button>
              </li>
            </ul>

            <div className="mt-4 pt-3 border-t border-stone-200/70 dark:border-white/[0.05]">
              <span className="text-[11px] text-stone-500 dark:text-neutral-400 block mb-1">
                {t.footerStandard}
              </span>
              <span className="text-[11px] text-stone-500 dark:text-neutral-400 block">
                {t.footerTech}
              </span>
            </div>
          </div>

          {/* Column 3: DevCenterPoint Spotlight Card (5 cols) */}
          <div className="lg:col-span-5">
            <div className="rounded-2xl p-5 bg-gradient-to-br from-stone-100 via-stone-50 to-white dark:from-[#0d1320] dark:via-[#090e17] dark:to-[#040810] border border-blue-500/20 dark:border-blue-500/25 shadow-sm hover:border-blue-500/40 transition-all duration-300">
              <div className="flex items-start justify-between gap-3">
                <a
                  href="https://devcenterpoint.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 transition-transform hover:scale-[1.01]"
                  title="DevCenterPoint - Code. Build. Deploy. Scale."
                >
                  <DevCenterPointLogo size="md" showText={true} showTagline={true} />
                </a>

                <a
                  href="https://devcenterpoint.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 p-1.5 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/25 transition-all"
                  aria-label="Visit DevCenterPoint website"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-stone-600 dark:text-slate-300">
                {language === 'en'
                  ? 'DevCenterPoint drives digital transformation through cutting-edge enterprise cloud engineering, AI/ML platforms, scalable full-stack applications, and secure systems architecture.'
                  : 'ডেভসেন্টারপয়েন্ট (DevCenterPoint) এন্টারপ্রাইজ ক্লাউড আর্কিটেকচার, কৃত্রিম বুদ্ধিমত্তা (AI/ML), আধুনিক সফটওয়্যার সল্যুশন এবং নির্ভরযোগ্য স্কেলেবল ক্লাউড ইঞ্জিনিয়ারিং সেবাদাতা।'}
              </p>

              <div className="mt-4 pt-3 border-t border-stone-200/80 dark:border-white/[0.06] flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-[11px] font-mono text-stone-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    Cloud AI
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    Full-Stack
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-blue-500" />
                    Scale
                  </span>
                </div>

                <a
                  href="https://devcenterpoint.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#2563eb] hover:bg-[#1d4ed8] text-white shadow-xs hover:shadow-sm transition-all"
                >
                  <span>{t.footerVisitDcp}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-Footer Bar */}
      <div className="border-t border-stone-200/80 dark:border-white/[0.06] bg-stone-200/40 dark:bg-black/40 py-4 text-xs transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-500 dark:text-neutral-400">
          {/* Copyright & Primary Attribution */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-center sm:text-left">
            <span>© {currentYear}</span>
            <span className="font-brand font-bold text-stone-800 dark:text-neutral-200">
              {t.brandName}
            </span>
            <span>·</span>
            <span>{t.footerAllRightsReserved}</span>
            <span className="hidden sm:inline">·</span>
            <span>
              {language === 'en' ? 'Powered & Supported by' : 'কারিগরি সহায়তায়'}
            </span>
            <a
              href="https://devcenterpoint.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-0.5"
            >
              DevCenterPoint
            </a>
          </div>

          {/* Linguistic & Security Compliance */}
          <div className="flex items-center gap-3 text-[11px] text-stone-500 dark:text-neutral-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span>Bangla Academy Standard</span>
            </span>
            <span>·</span>
            <a
              href="https://devcenterpoint.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              devcenterpoint.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
