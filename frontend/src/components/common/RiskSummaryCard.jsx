// src/components/common/RiskSummaryCard.jsx
import React from 'react';
import { getRiskColorHex, getRiskBadgeBg } from '../../utils/riskColor';

const LEVELS = [
  { key: 'LOW',      label: 'Low Risk',      emoji: '🟢' },
  { key: 'MODERATE', label: 'Moderate Risk', emoji: '🟡' },
  { key: 'HIGH',     label: 'High Risk',     emoji: '🟠' },
  { key: 'EXTREME',  label: 'Extreme Risk',  emoji: '🔴' },
];

const RiskSummaryCard = ({ predictions = [] }) => {
  const counts = predictions.reduce((acc, cur) => {
    const level = (cur.risk_level || 'LOW').toUpperCase();
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const total = predictions.length || 1;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {LEVELS.map(({ key, label, emoji }) => {
        const count = counts[key] || 0;
        const pct = Math.round((count / total) * 100);
        const hex = getRiskColorHex(key);
        const bg  = getRiskBadgeBg(key);

        return (
          <div
            key={key}
            className="relative overflow-hidden rounded-2xl border bg-brand-card/60 p-4 shadow-card hover:shadow-glow transition-all duration-300 group fade-in-up"
            style={{ 
              borderColor: `${hex}25`,
              background: `linear-gradient(135deg, ${bg} 0%, rgba(20, 20, 20, 0.4) 100%)`
            }}
          >
            {/* Background radial glow on card hover */}
            <div 
              className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${hex} 0%, transparent 80%)` }}
            />

            {/* Glowing progress line at the bottom */}
            <div
              className="absolute bottom-0 left-0 h-1 transition-all duration-700 rounded-full"
              style={{ 
                width: `${pct}%`, 
                backgroundColor: hex,
                boxShadow: `0 0 10px ${hex}`
              }}
            />

            <div className="flex items-center justify-between">
              <span className="text-xl">{emoji}</span>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-faint bg-brand-bg/40 px-2 py-0.5 rounded border border-brand-border/40">
                {pct}%
              </span>
            </div>

            <div className="mt-3">
              <p className="text-3xl font-black font-heading tracking-tight" style={{ color: hex }}>
                {count}
              </p>
              <p className="text-xs text-brand-muted font-bold mt-1 uppercase tracking-wider">{label}</p>
              <p className="text-[10px] text-brand-faint mt-0.5 font-medium">{count} of {predictions.length} districts</p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RiskSummaryCard;
