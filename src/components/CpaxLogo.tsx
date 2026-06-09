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
      viewBox="0 0 500 500"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="select-none"
    >
      <defs>
        {/* Glow and shadow filter for high-contrast touch look */}
        <filter id="cpax-glow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#4f46e5" floodOpacity="0.25" />
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0f172a" floodOpacity="0.4" />
        </filter>
        <filter id="x-glow" x="-15%" y="-15%" width="130%" height="130%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#ffffff" floodOpacity="0.3" />
        </filter>

        {/* Circular C Gradients */}
        <linearGradient id="gradient-c-outer" x1="50" y1="50" x2="450" y2="450" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#6366f1" /> {/* Indigo */}
          <stop offset="45%" stopColor="#4f46e5" /> {/* Regular indigo */}
          <stop offset="100%" stopColor="#312e81" /> {/* Deep dark blue/purple */}
        </linearGradient>
        
        <linearGradient id="gradient-c-inner" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="60%" stopColor="#4338ca" />
          <stop offset="100%" stopColor="#1e1b4b" />
        </linearGradient>

        {/* White Metallic X Gradients */}
        <linearGradient id="gradient-x-left" x1="200" y1="100" x2="450" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="60%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="gradient-x-right" x1="450" y1="100" x2="200" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="50%" stopColor="#f1f5f9" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      {/* Styled Circle C (Left Side Crescent / Ring overlapping) */}
      <path
        d="M 290,105 C 190,105 105,190 105,290 C 105,390 190,475 290,475 C 350,475 400,445 425,400 L 360,360 C 345,385 320,400 290,400 C 230,400 180,350 180,290 C 180,230 230,180 290,180 C 320,180 345,195 360,220 L 425,180 C 400,135 350,105 290,105 Z"
        fill="url(#gradient-c-outer)"
        filter="url(#cpax-glow)"
      />
      <path
        d="M 290,120 C 200,120 120,200 120,290 C 120,380 200,460 290,460 C 340,460 385,435 410,395 L 375,365 C 355,385 325,400 290,400 C 230,400 180,350 180,290 C 180,230 230,180 290,180 C 325,180 355,195 375,215 L 410,185 C 385,145 340,120 290,120 Z"
        fill="url(#gradient-c-inner)"
        opacity="0.85"
      />

      {/* Stylized Metal white X crossing (composed of 2 blade paths for the premium 3D bevel look in the image) */}
      {/* Blade 1: Top-Left to Bottom-Right */}
      <path
        d="M 215,140 L 295,140 C 310,140 370,250 410,335 L 410,430 L 360,430 C 340,430 280,310 215,140 Z"
        fill="url(#gradient-x-left)"
        filter="url(#x-glow)"
      />
      
      {/* Blade 2: Bottom-Left to Top-Right (Interlocking bevel) */}
      <path
        d="M 215,410 L 275,410 C 295,410 370,185 410,140 L 410,140 L 435,140 C 435,140 330,310 270,410 H 215 Z"
        fill="url(#gradient-x-right)"
        opacity="0.95"
      />

      {/* Little premium overlapping joiner */}
      <path
        d="M 290,240 L 335,320 L 305,320 L 270,260 Z"
        fill="#ffffff"
        opacity="0.8"
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
