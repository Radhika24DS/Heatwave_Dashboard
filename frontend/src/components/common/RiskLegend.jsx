// src/components/common/RiskLegend.jsx
import React from 'react';

const LEVELS = [
  { level: 'LOW',      label: 'Low',      color: '#10b981' },
  { level: 'MODERATE', label: 'Moderate', color: '#f59e0b' },
  { level: 'HIGH',     label: 'High',     color: '#ef4444' },
  { level: 'EXTREME',  label: 'Extreme',  color: '#dc2626' },
];

/**
 * Risk level legend — dark-theme native, positioned for use
 * inside map containers or as a standalone panel block.
 * Pass `inline` prop for non-absolute standalone layout.
 */
const RiskLegend = ({ inline = false }) => (
  <div
    className={
      inline
        ? 'flex flex-wrap gap-x-5 gap-y-2'
        : 'absolute bottom-4 left-4 z-[400] flex flex-col gap-2 bg-brand-card/95 backdrop-blur-md border border-brand-border rounded-2xl px-3.5 py-3 shadow-card shadow-black/80'
    }
  >
    {!inline && (
      <p className="text-[9px] text-brand-faint uppercase font-extrabold tracking-widest mb-0.5">
        Risk Level
      </p>
    )}
    {LEVELS.map(({ level, label, color }) => (
      <div key={level} className="flex items-center gap-2.5">
        <span
          className="flex-shrink-0 h-3 w-3 rounded-full border border-black/40"
          style={{ backgroundColor: color, boxShadow: `0 0 8px ${color}` }}
        />
        <span className="text-[11px] font-bold text-brand-muted hover:text-brand-text transition-colors duration-150">{label}</span>
      </div>
    ))}
  </div>
);

export default RiskLegend;
