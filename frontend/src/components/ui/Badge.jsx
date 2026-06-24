// src/components/ui/Badge.jsx
import React from 'react';

const CONFIG = {
  LOW:      { text: 'Low Risk',      bg: 'bg-risk-lowBg',      border: 'border-risk-low/30',      color: 'text-risk-low',      glow: 'risk-badge-low'      },
  MODERATE: { text: 'Moderate Risk', bg: 'bg-risk-moderateBg', border: 'border-risk-moderate/30', color: 'text-risk-moderate', glow: 'risk-badge-moderate' },
  HIGH:     { text: 'High Risk',     bg: 'bg-risk-highBg',     border: 'border-risk-high/30',     color: 'text-risk-high',     glow: 'risk-badge-high'     },
  EXTREME:  { text: 'Extreme Risk',  bg: 'bg-risk-extremeBg',  border: 'border-risk-extreme/30',  color: 'text-risk-extreme',  glow: 'risk-badge-extreme'  },
  CRITICAL: { text: 'Critical',      bg: 'bg-risk-extremeBg',  border: 'border-risk-extreme/30',  color: 'text-risk-extreme',  glow: 'risk-badge-extreme'  },
};

/**
 * Risk level badge with glow effect.
 * Props:
 *  - level   : 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
 *  - label   : override label text
 *  - size    : 'sm' | 'md' (default 'md')
 *  - pulse   : show animated pulse dot (default false)
 *  - className
 */
const Badge = ({ level = 'LOW', label, size = 'md', pulse = false, className = '' }) => {
  const key = (level || '').toUpperCase();
  const cfg = CONFIG[key] || CONFIG.LOW;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider',
        cfg.bg, cfg.border, cfg.color, cfg.glow, sizeClass, className,
      ].join(' ')}
    >
      {pulse && (
        <span className={`h-1.5 w-1.5 rounded-full ${cfg.color.replace('text-', 'bg-')} animate-pulse`} />
      )}
      {label || cfg.text}
    </span>
  );
};

export default Badge;
