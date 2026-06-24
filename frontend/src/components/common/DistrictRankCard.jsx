// src/components/common/DistrictRankCard.jsx
import React from 'react';
import { getRiskColorHex } from '../../utils/riskColor';

const DistrictRankCard = ({ predictions = [], onSelectDistrict }) => {
  // Sort predictions by risk score descending
  const sorted = [...predictions].sort((a, b) => b.risk_score - a.risk_score);

  return (
    <div className="bg-brand-navy/80 backdrop-blur-md border border-brand-border rounded-2xl p-6 shadow-2xl">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-text">District Vulnerability Ranking</h3>
        <p className="text-xs text-brand-muted mt-0.5">Top heatwave risk zones ordered by severity</p>
      </div>

      {sorted.length === 0 ? (
        <p className="text-sm text-brand-muted text-center py-6">No ranking data available.</p>
      ) : (
        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
          {sorted.map((item, index) => {
            const color = getRiskColorHex(item.risk_level);
            return (
              <div 
                key={item.id}
                onClick={() => onSelectDistrict && onSelectDistrict(item)}
                className={`flex items-center justify-between p-3 rounded-xl border border-brand-border/40 bg-brand-slate/30 hover:bg-brand-slate/60 transition-all duration-200 cursor-pointer ${
                  onSelectDistrict ? 'hover:scale-[1.01]' : ''
                }`}
              >
                <div className="flex items-center space-x-3 min-w-0">
                  {/* Rank Badge */}
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-border/60 text-brand-muted text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </span>
                  
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-brand-text truncate">
                      {item.district_name || `District ID: ${item.district_id}`}
                    </p>
                    <span 
                      className="text-[10px] uppercase font-black tracking-wide"
                      style={{ color: color }}
                    >
                      {item.risk_level}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <div className="text-right">
                    <p className="text-xs font-semibold text-brand-muted">Score</p>
                    <p className="text-sm font-black text-brand-text">{item.risk_score}</p>
                  </div>
                  {/* Indicator Dot */}
                  <span 
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DistrictRankCard;
