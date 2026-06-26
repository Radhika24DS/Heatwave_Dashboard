// src/components/ui/Badge.jsx
import React from 'react';

const CONFIG = {
  LOW:      { text: 'Low Risk',      bg: 'bg-risk-lowBg',      border: 'border-risk-low/30',      color: 'text-risk-low',      dot: 'bg-risk-low',      glow: 'risk-badge-low'      },
  MODERATE: { text: 'Moderate Risk', bg: 'bg-risk-moderateBg', border: 'border-risk-moderate/30', color: 'text-risk-moderate', dot: 'bg-risk-moderate', glow: 'risk-badge-moderate' },
  HIGH:     { text: 'High Risk',     bg: 'bg-risk-highBg',     border: 'border-risk-high/30',     color: 'text-risk-high',     dot: 'bg-risk-high',     glow: 'risk-badge-high'     },
  EXTREME:  { text: 'Extreme Risk',  bg: 'bg-risk-extremeBg',  border: 'border-risk-extreme/30',  color: 'text-risk-extreme',  dot: 'bg-risk-extreme',  glow: 'risk-badge-extreme'  },
  CRITICAL: { text: 'Critical',      bg: 'bg-risk-extremeBg',  border: 'border-risk-extreme/30',  color: 'text-risk-extreme',  dot: 'bg-risk-extreme',  glow: 'risk-badge-extreme'  },
};

/**
 * Risk level badge with glow effect.
 * Props:
 *  - level   : 'LOW' | 'MODERATE' | 'HIGH' | 'EXTREME'
 *  - label   : override label text
 *  - size    : 'sm' | 'md' (default 'md')
 *  - pulse   : show animated pulse dot (auto-enabled for EXTREME)
 *  - className
 */
const Badge = ({ level = 'LOW', label, size = 'md', pulse, className = '' }) => {
  const key = (level || '').toUpperCase();
  const cfg = CONFIG[key] || CONFIG.LOW;
  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-3 py-1';

  // Auto-pulse for EXTREME / CRITICAL
  const showPulse = pulse !== undefined ? pulse : ['EXTREME', 'CRITICAL'].includes(key);
  const isExtreme = ['EXTREME', 'CRITICAL'].includes(key);

  return (
    <span
      className={[
        'inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider transition-all duration-300',
        cfg.bg, cfg.border, cfg.color, cfg.glow, sizeClass,
        isExtreme ? 'animate-pulse shadow-[0_0_12px_rgba(239,68,68,0.4)] border-risk-extreme/60' : '',
        className,
      ].join(' ')}
    >
      {showPulse && (
        <span className="relative flex h-1.5 w-1.5">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75`} />
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${cfg.dot}`} />
        </span>
      )}
      {label || cfg.text}
    </span>
  );
};

export default Badge;
