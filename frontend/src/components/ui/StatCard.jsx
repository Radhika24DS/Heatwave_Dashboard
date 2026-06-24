// src/components/ui/StatCard.jsx
import React from 'react';

/**
 * Premium metric/stat display card.
 * Props:
 *  - icon      : React element (lucide icon)
 *  - label     : string
 *  - value     : string | number
 *  - sub       : optional subtext below value
 *  - color     : Tailwind color class for icon bg, e.g. 'text-brand-primary'
 *  - trend     : 'up' | 'down' | null
 *  - trendText : e.g. '+2.4%'
 *  - className
 */
const StatCard = ({ icon: Icon, label, value, sub, color = 'text-brand-primary', trend, trendText, className = '' }) => {
  const iconBg = color
    .replace('text-', 'bg-')
    .replace(/\/\d+$/, '');

  return (
    <div className={`card-premium p-5 fade-in-up ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg}/10 border border-current/20`}>
          {Icon && <Icon className={`h-5 w-5 ${color}`} />}
        </div>
        {trend && trendText && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
            trend === 'up'
              ? 'text-risk-low bg-risk-lowBg border-risk-low/30'
              : 'text-risk-extreme bg-risk-extremeBg border-risk-extreme/30'
          }`}>
            {trend === 'up' ? '↑' : '↓'} {trendText}
          </span>
        )}
      </div>
      <p className="text-[11px] font-semibold text-brand-muted uppercase tracking-wider mb-1">{label}</p>
      <p className="font-heading text-2xl font-black text-brand-text leading-none">{value}</p>
      {sub && <p className="text-[11px] text-brand-faint mt-1.5">{sub}</p>}
    </div>
  );
};

export default StatCard;
