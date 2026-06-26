// src/components/ui/StatCard.jsx
import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Premium metric/stat display card.
 * Props:
 *  - icon      : React element (lucide icon component)
 *  - label     : string
 *  - value     : string | number
 *  - sub       : optional subtext below value
 *  - color     : Tailwind text color class, e.g. 'text-brand-primary'
 *  - trend     : 'up' | 'down' | null
 *  - trendText : e.g. '+2.4%'
 *  - className
 */
const StatCard = ({
  icon: Icon,
  label,
  value,
  sub,
  color = 'text-brand-primary',
  trend,
  trendText,
  className = '',
}) => {
  const bgColor = color.replace('text-', 'bg-').replace(/\/\d+$/, '');

  return (
    <div className={`card-premium p-5 fade-in-up group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-brand-primary/20 hover:shadow-glow ${className}`}>
      {/* Soft background radial gradient blur */}
      <div className="absolute -top-10 -left-10 w-24 h-24 bg-brand-primary/5 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700 pointer-events-none" />
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at bottom right, rgba(255,107,53,0.03) 0%, transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Top row: icon + trend */}
        <div className="flex items-start justify-between mb-3.5">
          {Icon ? (
            <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${bgColor}/10 border border-brand-border group-hover:border-current/25 transition-all duration-300 group-hover:scale-105 shadow-inner`}>
              <Icon className={`h-5.5 w-5.5 ${color} transition-transform duration-300 group-hover:rotate-6`} />
            </div>
          ) : (
            <div className="h-11 w-11" />
          )}

          {trend && trendText && (
            <span className={`inline-flex items-center gap-1.5 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
              trend === 'up'
                ? 'text-risk-low bg-risk-lowBg border-risk-low/20'
                : 'text-risk-extreme bg-risk-extremeBg border-risk-extreme/20'
            } uppercase tracking-wider`}>
              {trend === 'up'
                ? <TrendingUp className="h-3 w-3 animate-bounce" />
                : <TrendingDown className="h-3 w-3 animate-bounce" />
              }
              {trendText}
            </span>
          )}
        </div>

        {/* Label */}
        <p className="text-[10px] font-extrabold text-brand-faint uppercase tracking-widest mb-1.5">
          {label}
        </p>

        {/* Value */}
        <p className={`font-heading text-3xl font-black leading-none tracking-tight ${color}`}>
          {value}
        </p>

        {/* Sub text */}
        {sub && (
          <p className="text-[11px] text-brand-muted mt-2 leading-relaxed font-medium">{sub}</p>
        )}

        {/* Bottom indicator bar */}
        <div className={`mt-4 h-0.5 w-6 group-hover:w-full transition-all duration-500 rounded-full bg-gradient-to-r from-brand-primary via-brand-mid to-transparent`} />
      </div>
    </div>
  );
};

export default StatCard;
