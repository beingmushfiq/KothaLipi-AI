import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  animated = true,
}) => {
  const dimensions = {
    sm: 'w-8 h-8',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  }[size];

  return (
    <div
      className={`relative shrink-0 rounded-xl overflow-hidden shadow-2xs group-hover:scale-105 transition-all duration-300 border border-teal-500/25 dark:border-teal-400/30 bg-gradient-to-br from-[#0c192c] via-[#071322] to-[#030811] ${dimensions} ${className}`}
    >
      <svg
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full ${animated ? 'group-hover:rotate-1 transition-transform duration-300' : ''}`}
      >
        <defs>
          {/* Kinetic Soundwave & Text Gradient */}
          <linearGradient id="shobdoLogoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="40%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Saffron & Amber Core */}
          <linearGradient id="shobdoLogoAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Soft Blur Filter */}
          <filter id="shobdoLogoGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Backlight */}
        <circle cx="28" cy="32" r="16" fill="#14b8a6" fillOpacity="0.12" filter="url(#shobdoLogoGlow)" />

        {/* Top Matra of 'শ' */}
        <line
          x1="33"
          y1="18"
          x2="49"
          y2="18"
          stroke="url(#shobdoLogoGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Vertical Stem of 'শ' */}
        <line
          x1="45"
          y1="18"
          x2="45"
          y2="47"
          stroke="url(#shobdoLogoGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />

        {/* Dynamic Waveform Loops of 'শ' (Sound + Script) */}
        <path
          d="M17 38 C17 26 27 25 27 34 C27 44 38 43 38 30 C38 21 45 20 45 20"
          stroke="url(#shobdoLogoGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Sound Pulse / Core Orb */}
        <circle
          cx="22"
          cy="30"
          r="3.2"
          fill="url(#shobdoLogoAccent)"
          filter="url(#shobdoLogoGlow)"
        />

        {/* Acoustic Resonance Arcs */}
        <path
          d="M50 27 C53 30 53 35 50 38"
          stroke="#38bdf8"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M54 23 C59 28 59 39 54 44"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};
