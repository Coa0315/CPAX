/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface CpaxLogoProps {
  className?: string;
  size?: number | string;
  variant?: 'icon-only' | 'full' | 'stacked';
}

export const CpaxLogo: React.FC<CpaxLogoProps> = ({ 
  className = '', 
  size = 40,
  variant = 'icon-only'
}) => {
  // Pure SVG representation of the CPAX logo
  // Focused entirely on the elegant single-concept "C" shape utilizing brand #274a78 and pitch black layers
  const renderSvg = () => (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      <defs>
        {/* Deep luxurious radial glow on ambient canvas */}
        <radialGradient id="c-ambient-glow" cx="210" cy="256" r="220" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#274a78" stopOpacity="0.45" />
          <stop offset="50%" stopColor="#0f1f33" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0" />
        </radialGradient>

        {/* 3D Soft Drop Shadow for the "C" Crest */}
        <filter id="c-premium-shadow" x="-20%" y="-15%" width="140%" height="135%">
          <feDropShadow dx="-4" dy="12" stdDeviation="10" floodColor="#000000" floodOpacity="0.95" />
        </filter>

        {/* Brand Blue Metallic Linear Gradient for the Main "C" Body */}
        <linearGradient id="c-main-grad" x1="120" y1="120" x2="390" y2="390" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f7cb5" />
          <stop offset="35%" stopColor="#274a78" />
          <stop offset="70%" stopColor="#0f213b" />
          <stop offset="100%" stopColor="#030811" />
        </linearGradient>

        {/* Shimmering highlight overlay mapping */}
        <linearGradient id="c-bevel-light" x1="150" y1="130" x2="330" y2="380" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#c8dbf5" stopOpacity="0.7" />
          <stop offset="40%" stopColor="#274a78" stopOpacity="0.8" />
          <stop offset="85%" stopColor="#000000" stopOpacity="0.95" />
        </linearGradient>

        {/* Fine inner outline for depth */}
        <linearGradient id="c-stroke-grad" x1="140" y1="150" x2="360" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
          <stop offset="40%" stopColor="#274a78" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#000000" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Ambient glowing atmosphere behind the C */}
      <circle cx="210" cy="256" r="220" fill="url(#c-ambient-glow)" />

      {/* Backdrop shadow ring for depth */}
      <path
        d="M 362,150 A 150,150 0 1, 0 362,362 A 30,30 0 0, 0 320,320 A 90,90 0 1, 1 320,192 A 30,30 0 0, 0 362,150 Z"
        fill="#000000"
        opacity="0.5"
        transform="translate(-2, 4)"
      />

      {/* Main "C" Body Crest Shape */}
      <path
        d="M 362,150 A 150,150 0 1, 0 362,362 A 30,30 0 0, 0 320,320 A 90,90 0 1, 1 320,192 A 30,30 0 0, 0 362,150 Z"
        fill="url(#c-main-grad)"
        filter="url(#c-premium-shadow)"
      />

      {/* Bevel reflection overlay for ultra premium luxury metallic gloss */}
      <path
        d="M 346,166 A 130,130 0 1, 0 346,346 A 16,16 0 0, 0 324,324 A 90,90 0 1, 1 324,188 A 16,16 0 0, 0 346,166 Z"
        fill="url(#c-bevel-light)"
        opacity="0.85"
      />

      {/* Delicate outer edge stroke highlight for crisp look */}
      <path
        d="M 362,150 A 150,150 0 1, 0 362,362 A 30,30 0 0, 0 320,320 A 90,90 0 1, 1 320,192 A 30,30 0 0, 0 362,150 Z"
        stroke="url(#c-stroke-grad)"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.9"
      />

      {/* Pure aesthetic target center dot representing Focus and Axis path */}
      <circle cx="210" cy="256" r="6" fill="#f8fafc" opacity="0.9" />
    </svg>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`shrink-0 ${className}`} style={{ width: size, height: size }}>
        {renderSvg()}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center justify-center p-4 bg-black rounded-3xl text-center space-y-4 ${className}`}>
        <div style={{ width: size, height: size }}>
          {renderSvg()}
        </div>
        <span className="font-sans font-black text-2xl sm:text-3xl text-white tracking-widest leading-none mt-2">
          CPAX
        </span>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${className}`}>
      <div className="text-left py-1">
        <span className="font-sans font-black text-2xl text-white tracking-widest block leading-none select-none">
          CPAX
        </span>
      </div>
    </div>
  );
};
