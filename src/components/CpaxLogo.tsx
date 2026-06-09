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
  // Semi-circular "C" in violet/indigo gradient interlocking with a sharp, bold white metallic "X"
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
        {/* Glow and shadow filter for high-contrast touch look */}
        <filter id="c-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* CPAX Brand Blue (#274a78) Metallic Gradient */}
        <linearGradient id="gradient-c-outer" x1="110" y1="120" x2="270" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4e7ebc" />
          <stop offset="40%" stopColor="#274a78" />
          <stop offset="85%" stopColor="#142a4a" />
          <stop offset="100%" stopColor="#081324" />
        </linearGradient>
        
        <linearGradient id="gradient-c-inner" x1="120" y1="130" x2="250" y2="260" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#729ed2" />
          <stop offset="50%" stopColor="#274a78" />
          <stop offset="100%" stopColor="#081324" />
        </linearGradient>

        {/* Premium Silver Chrome Gradient for the "X" */}
        <linearGradient id="gradient-x-chrome" x1="210" y1="120" x2="380" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="30%" stopColor="#f1f5f9" />
          <stop offset="70%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>

        {/* Shadow for overlap */}
        <filter id="drop-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="-2" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.6" />
        </filter>
      </defs>

      {/* The "C" Crescent (Left-aligned interlocking loop) */}
      <path
        d="M 264,160 A 80,80 0 1,0 264,240 L 240,226 A 52,52 0 1,1 240,174 Z"
        fill="url(#gradient-c-outer)"
        filter="url(#c-glow)"
      />
      <path
        d="M 262,165 A 75,75 0 1,0 262,235 L 241,223 A 49,49 0 1,1 241,177 Z"
        fill="url(#gradient-c-inner)"
        opacity="0.9"
      />

      {/* The "X" Chrome Loop - Overlapping Blade 1 (Top-Left to Bottom-Right) */}
      <path
        d="M 215,120 C 235,120 315,220 365,270 C 375,280 375,290 365,290 L 350,290 C 310,290 220,185 200,140 C 195,130 200,120 215,120 Z"
        fill="url(#gradient-x-chrome)"
        filter="url(#drop-shadow)"
      />

      {/* The "X" Chrome Loop - Overlapping Blade 2 (Bottom-Left to Top-Right) */}
      <path
        d="M 215,280 C 235,280 315,180 365,130 C 375,120 375,110 365,110 L 350,110 C 310,110 220,215 200,260 C 195,270 200,280 215,280 Z"
        fill="url(#gradient-x-chrome)"
        filter="url(#drop-shadow)"
      />

      {/* The "Interlock accent" to bind them inside visually */}
      <path
        d="M 252,192 L 273,212 L 253,212 Z"
        fill="#ffffff"
        opacity="0.9"
      />
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
