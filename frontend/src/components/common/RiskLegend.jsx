// src/components/common/RiskLegend.jsx
import React from 'react';
import { getRiskColorClass } from '../../utils/riskColor';

const levels = [
  { level: 'LOW', label: 'Low' },
  { level: 'MODERATE', label: 'Moderate' },
  { level: 'HIGH', label: 'High' },
  { level: 'EXTREME', label: 'Extreme' },
];

const RiskLegend = () => (
  <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-sm rounded shadow p-2 flex flex-col space-y-1">
    {levels.map(({ level, label }) => (
      <div key={level} className="flex items-center space-x-2">
        <span className={`block w-4 h-4 ${getRiskColorClass(level)} rounded`} />
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
    ))}
  </div>
);

export default RiskLegend;
