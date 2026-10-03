import React from 'react';

interface DevCenterPointLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
}

export const DevCenterPointLogo: React.FC<DevCenterPointLogoProps> = ({
  className = '',
  size = 'md',
  showText = true,
  showTagline = true,
}) => {
  const iconDimensions = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  }[size];

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* DevCenterPoint Vector Emblem */}
      <div className={`relative shrink-0 ${iconDimensions}`}>
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          <defs>
            <linearGradient id="dcpBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="100%" stopColor="#1d4ed8" />
            </linearGradient>
            <radialGradient id="dcpPupilGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#60a5fa" />
              <stop offset="45%" stopColor="#2563eb" />
              <stop offset="100%" stopColor="#1e40af" />
            </radialGradient>
            <filter id="dcpGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* D Outer Shape (Dark Tech Base) */}
          <path
            d="M15 10 H50 C72 10 88 26 88 50 C88 74 72 90 50 90 H15 V10 Z"
            fill="#111827"
          />

          {/* Blue Sector with Code Icon on upper right */}
          <path
            d="M50 15 C69 15 83 29 83 50 C83 62 76 72 68 78 L50 50 Z"
            fill="url(#dcpBlueGrad)"
          />

          {/* White Code Icon </ > inside blue sector */}
          <g transform="translate(62, 28) scale(0.65)" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none">
            <polyline points="7,2 2,7 7,12" />
            <polyline points="13,2 18,7 13,12" />
          </g>

          {/* White Bezel Ring / Eyeball Bezel */}
          <circle cx="50" cy="50" r="23" fill="#ffffff" />

          {/* Inner Blue Lens / Aperture Pupil */}
          <circle cx="50" cy="50" r="14.5" fill="url(#dcpPupilGrad)" />

          {/* Cyan/Light Highlight Reflection */}
          <circle cx="46" cy="46" r="3.5" fill="#93c5fd" opacity="0.9" />
        </svg>
      </div>

      {/* DevCenterPoint Typography */}
      {showText && (
        <div className="flex flex-col">
          <div className="font-brand font-black text-base sm:text-lg tracking-tight leading-none flex items-center">
            <span className="text-[#3b82f6]">Dev</span>
            <span className="text-stone-900 dark:text-white">Center</span>
            <span className="text-[#3b82f6]">Point</span>
          </div>
          {showTagline && (
            <span className="text-[9px] font-mono tracking-[0.22em] text-stone-500 dark:text-slate-400 uppercase mt-1 leading-none font-semibold">
              Code. Build. Deploy. Scale.
            </span>
          )}
        </div>
      )}
    </div>
  );
};
