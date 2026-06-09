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
  // Centered beautiful "C" shape using #274a78 and deep blacks plus high contrast light accents, reflecting "Axis" core
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
        {/* Soft elegant backing aura for the C */}
        <filter id="c-brand-glow" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="15" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* High contrast sharp shadow for elements elevation */}
        <filter id="c-sharp-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="-2" dy="6" stdDeviation="8" floodColor="#000000" floodOpacity="0.8" />
        </filter>

        {/* #274a78 Deep Luxury Brand Blue Gradient for "C" motif */}
        <linearGradient id="c-brand-blue" x1="120" y1="120" x2="392" y2="392" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b8ecc" />
          <stop offset="35%" stopColor="#274a78" />
          <stop offset="70%" stopColor="#0f223d" />
          <stop offset="100%" stopColor="#040a12" />
        </linearGradient>

        {/* Highlight Gradient for Inner Crescent bevel */}
        <linearGradient id="c-inner-highlight" x1="140" y1="140" x2="320" y2="320" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#9abcfa" />
          <stop offset="50%" stopColor="#274a78" />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>

        {/* Silver Core Axis Rod (The thread of study) */}
        <linearGradient id="axis-silver" x1="256" y1="90" x2="256" y2="422" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
          <stop offset="30%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#94a3b8" />
          <stop offset="70%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#020617" stopOpacity="0.9" />
        </linearGradient>
      </defs>

      {/* Behind Ambient Glow of Blue */}
      <circle cx="210" cy="256" r="110" fill="#274a78" opacity="0.32" filter="url(#c-brand-glow)" />

      {/* Axis Backbone Line (The Injection Core) */}
      <rect
        x="248"
        y="80"
        width="16"
        height="352"
        rx="8"
        fill="url(#axis-silver)"
        filter="url(#c-sharp-shadow)"
      />

      {/* "C" Crescent Shape Body (Design Axis, Thick on Left, Shaded gracefully on ends) */}
      <path
        d="M 364,136 
           C 292,136 142,168 142,256 
           C 142,344 292,376 364,376 
           L 342,336 
           C 292,336 190,312 190,256 
           C 190,200 292,176 342,176 
           Z"
        fill="url(#c-brand-blue)"
        filter="url(#c-sharp-shadow)"
      />

      {/* Secondary Inner Fine Crease for Multi-Material look */}
      <path
        d="M 346,156 
           C 290,156 168,186 168,256 
           C 168,326 290,356 346,356 
           L 336,336 
           C 286,336 200,312 200,256 
           C 200,200 286,176 336,176 
           Z"
        fill="url(#c-inner-highlight)"
        opacity="0.8"
      />

      {/* Center Dynamic Target Sparkle (Intersection of Success) */}
      <circle cx="256" cy="256" r="8" fill="#ffffff" filter="url(#c-brand-glow)" />
      <polygon points="256,242 260,252 270,256 260,260 256,270 252,260 242,256 252,252" fill="#ffffff" />
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
