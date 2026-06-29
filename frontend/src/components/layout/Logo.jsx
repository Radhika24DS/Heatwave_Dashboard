import React from 'react';

const Logo = ({ className = "h-8 w-8" }) => {
  return (
    <svg 
      viewBox="0 0 32 32" 
      className={className} 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#EA580C" />
          <stop offset="50%" stopColor="#F97316" />
          <stop offset="100%" stopColor="#F59E0B" />
        </linearGradient>
      </defs>
      
      {/* Sun Core / Outer Ring */}
      <circle 
        cx="16" 
        cy="12" 
        r="7" 
        stroke="url(#logo-grad)" 
        strokeWidth="2" 
        strokeDasharray="2 2"
        className="animate-spin-slow"
        transformOrigin="16 12"
      />
      
      {/* Sun Inner Solid */}
      <circle 
        cx="16" 
        cy="12" 
        r="4" 
        fill="url(#logo-grad)" 
        className="animate-pulse-slow"
      />
      
      {/* Thermometer Overlay */}
      <path 
        d="M16 6v10M14 16a2.5 2.5 0 104 0" 
        stroke="#ffffff" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <circle cx="16" cy="17" r="1.2" fill="#EA580C" />

      {/* Heat-wave ripples at the bottom */}
      <path 
        d="M6 24c2.5-1.5 4.5-1.5 7 0s4.5 1.5 7 0 4.5-1.5 7 0" 
        stroke="url(#logo-grad)" 
        strokeWidth="1.5" 
        strokeLinecap="round"
      />
      <path 
        d="M8 27c2-1 4-1 6 0s4 1 6 0 4-1 6 0" 
        stroke="#F59E0B" 
        strokeWidth="1.2" 
        strokeLinecap="round"
        opacity="0.8"
      />
    </svg>
  );
};

export default Logo;
