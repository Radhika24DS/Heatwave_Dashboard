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
        <linearGradient id="logo-grad-samvit" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#d97706" /> {/* Primary Dark (Rust/Orange) */}
          <stop offset="60%" stopColor="#f97316" /> {/* Primary (Flame Orange) */}
          <stop offset="100%" stopColor="#dc2626" /> {/* Accent/Alert Red */}
        </linearGradient>
      </defs>
      
      {/* Outer Stylized Sun Rays */}
      <circle 
        cx="16" 
        cy="12" 
        r="7.5" 
        stroke="url(#logo-grad-samvit)" 
        strokeWidth="2" 
        strokeDasharray="3 2"
        className="animate-spin-slow"
        transformOrigin="16 12"
      />
      
      {/* Sun Inner Solid Core */}
      <circle 
        cx="16" 
        cy="12" 
        r="4.5" 
        fill="url(#logo-grad-samvit)" 
        className="animate-pulse-slow"
      />
      
      {/* Warning Chevron Underneath the Sun */}
      <path 
        d="M9 23l7 4.5 7-4.5" 
        stroke="url(#logo-grad-samvit)" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      
      {/* Secondary mini chevron for emphasis */}
      <path 
        d="M12 26l4 2.5 4-2.5" 
        stroke="#dc2626" 
        strokeWidth="1.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        opacity="0.8"
      />
    </svg>
  );
};

export default Logo;

