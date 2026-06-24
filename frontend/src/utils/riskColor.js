// src/utils/riskColor.js
// Utility to map risk level strings to Tailwind CSS color classes
// Expected risk levels: LOW, MODERATE, HIGH, EXTREME (or CRITICAL)
export const getRiskColorClass = (risk) => {
  const normalized = risk ? risk.toUpperCase() : '';
  switch (normalized) {
    case 'LOW':
      return 'bg-emerald-500';
    case 'MODERATE':
      return 'bg-yellow-500';
    case 'HIGH':
      return 'bg-orange-500';
    case 'EXTREME':
    case 'CRITICAL':
      return 'bg-red-600';
    default:
      return 'bg-gray-400';
  }
};

export const getRiskColorHex = (risk) => {
  const normalized = risk ? risk.toUpperCase() : '';
  switch (normalized) {
    case 'LOW':
      return '#10b981'; // emerald-500
    case 'MODERATE':
      return '#facc15'; // yellow-500
    case 'HIGH':
      return '#f97316'; // orange-500
    case 'EXTREME':
    case 'CRITICAL':
      return '#dc2626'; // red-600
    default:
      return '#9ca3af'; // gray-400
  }
};
