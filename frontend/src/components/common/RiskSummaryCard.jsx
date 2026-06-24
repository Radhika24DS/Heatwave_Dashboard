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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {LEVELS.map(({ key, label, emoji }) => {
        const count = counts[key] || 0;
        const pct = Math.round((count / total) * 100);
        const hex = getRiskColorHex(key);
        const bg  = getRiskBadgeBg(key);

        return (
          <div
            key={key}
            className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-card p-4 shadow-card hover:border-brand-primary/20 transition-all fade-in-up"
            style={{ background: bg }}
          >
            {/* Background bar */}
            <div
              className="absolute bottom-0 left-0 h-0.5 transition-all duration-700"
              style={{ width: `${pct}%`, background: hex }}
            />

            <div className="text-xl mb-2">{emoji}</div>
            <p className="text-2xl font-black font-heading" style={{ color: hex }}>
              {count}
            </p>
            <p className="text-xs text-brand-muted font-medium mt-0.5">{label}</p>
            <p className="text-[10px] text-brand-faint mt-1">{pct}% of districts</p>
          </div>
        );
      })}
    </div>
  );
};

export default RiskSummaryCard;
