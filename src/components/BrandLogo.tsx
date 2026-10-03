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
          <linearGradient id="kothaKaLogoGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0d9488" />
            <stop offset="40%" stopColor="#14b8a6" />
            <stop offset="100%" stopColor="#38bdf8" />
          </linearGradient>

          {/* Saffron & Amber Core */}
          <linearGradient id="kothaKaAccent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="50%" stopColor="#f59e0b" />
            <stop offset="100%" stopColor="#ea580c" />
          </linearGradient>

          {/* Soft Blur Filter */}
          <filter id="kothaKaGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Backlight */}
        <circle cx="34" cy="32" r="16" fill="#14b8a6" fillOpacity="0.14" filter="url(#kothaKaGlow)" />

        {/* 1. Top Matra of 'ক' (মাত্রা) */}
        <line
          x1="13"
          y1="16"
          x2="51"
          y2="16"
          stroke="url(#kothaKaLogoGrad)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />

        {/* 2. Left Triangular Body & Apex of 'ক' */}
        <path
          d="M37 16 L18 32 L28 47 L37 31"
          stroke="url(#kothaKaLogoGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 3. Vertical Anchor Stem of 'ক' */}
        <line
          x1="37"
          y1="16"
          x2="37"
          y2="48"
          stroke="url(#kothaKaLogoGrad)"
          strokeWidth="3.4"
          strokeLinecap="round"
        />

        {/* 4. Iconic Right Looping Wing of 'ক' Morphing into Voice Resonance */}
        <path
          d="M37 31 C46 28 50 36 45 42 C40.5 46.5 34 43 31 39"
          stroke="url(#kothaKaLogoGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 5. Glowing Acoustic Voice Pulse at the Heart of 'ক' */}
        <circle
          cx="28"
          cy="32"
          r="3.2"
          fill="url(#kothaKaAccent)"
          filter="url(#kothaKaGlow)"
        />

        {/* 6. Acoustic Sound Waves Radiating from the 'ক' Loop */}
        <path
          d="M48 26 C52 29 52 35 48 38"
          stroke="#38bdf8"
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M53 22 C59 27 59 39 53 44"
          stroke="#38bdf8"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.5"
        />
      </svg>
    </div>
  );
};
