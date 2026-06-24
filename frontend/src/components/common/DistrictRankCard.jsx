// src/components/common/DistrictRankCard.jsx
import React from 'react';
import { getRiskColorHex, getRiskBadgeBg } from '../../utils/riskColor';
import { BarChart2, ChevronRight } from 'lucide-react';

const DistrictRankCard = ({ predictions = [], onSelectDistrict }) => {
  const sorted = [...predictions].sort((a, b) => b.risk_score - a.risk_score);

  const RANK_STYLES = [
    'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    'text-slate-300 bg-slate-300/10 border-slate-300/20',
    'text-amber-600 bg-amber-600/10 border-amber-600/20',
  ];

  return (
    <div className="rounded-2xl border border-brand-border bg-brand-card shadow-card h-full flex flex-col">
      {/* Header */}
      <div className="p-5 border-b border-brand-border/50 flex items-center gap-2">
        <BarChart2 className="h-4 w-4 text-brand-primary" />
        <div>
          <h3 className="font-heading text-sm font-bold text-brand-text">District Vulnerability Ranking</h3>
          <p className="text-[11px] text-brand-faint mt-0.5">Ordered by heatwave risk severity</p>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1.5">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-brand-faint text-sm">
            <BarChart2 className="h-8 w-8 mb-2 opacity-30" />
            No ranking data available
          </div>
        ) : (
          sorted.map((item, index) => {
            const color = getRiskColorHex(item.risk_level);
            const bg    = getRiskBadgeBg(item.risk_level);
            const rankStyle = RANK_STYLES[index] || 'text-brand-muted bg-brand-border/20 border-brand-border/30';

            return (
              <button
                key={item.id || index}
                onClick={() => onSelectDistrict?.(item)}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-brand-border/40 bg-brand-surface hover:bg-brand-card hover:border-brand-border transition-all text-left group"
              >
                {/* Rank */}
                <span className={`flex-shrink-0 h-6 w-6 rounded-full border text-[10px] font-black flex items-center justify-center ${rankStyle}`}>
                  {index + 1}
                </span>

                {/* Name & risk level */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-brand-text truncate group-hover:text-brand-primary transition-colors">
                    {item.district_name || `District ${item.district_id}`}
                  </p>
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                    style={{ color, background: bg }}
                  >
                    {item.risk_level}
                  </span>
                </div>

                {/* Score + arrow */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-xs font-black" style={{ color }}>{item.risk_score}</p>
                    <p className="text-[10px] text-brand-faint">score</p>
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-brand-faint opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default DistrictRankCard;
