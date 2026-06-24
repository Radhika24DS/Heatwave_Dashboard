// src/components/common/RiskSummaryCard.jsx
import React from 'react';
import { getRiskColorClass } from '../../utils/riskColor';

// Props: predictions (array of prediction objects)
const RiskSummaryCard = ({ predictions }) => {
  const counts = predictions.reduce((acc, cur) => {
    const level = cur.risk_level || 'LOW';
    acc[level] = (acc[level] || 0) + 1;
    return acc;
  }, {});

  const levels = ['LOW', 'MODERATE', 'HIGH', 'EXTREME'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {levels.map((lvl) => (
        <div
          key={lvl}
          className={`p-4 rounded-xl shadow ${getRiskColorClass(lvl)} text-white`}
        >
          <h3 className="text-lg font-semibold mb-2">{lvl}</h3>
          <p className="text-2xl font-bold">{counts[lvl] || 0}</p>
        </div>
      ))}
    </div>
  );
};

export default RiskSummaryCard;
