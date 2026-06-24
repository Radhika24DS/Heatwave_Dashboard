// src/utils/riskColor.js
// Maps risk level strings to the new heatwave design palette

export const RISK_LEVELS = ['LOW', 'MODERATE', 'HIGH', 'EXTREME'];

/** Returns a Tailwind bg class for the given risk level */
export const getRiskColorClass = (risk) => {
  const r = risk ? risk.toUpperCase() : '';
  switch (r) {
    case 'LOW':      return 'bg-risk-low';
    case 'MODERATE': return 'bg-risk-moderate';
    case 'HIGH':     return 'bg-risk-high';
    case 'EXTREME':
    case 'CRITICAL': return 'bg-risk-extreme';
    default:         return 'bg-brand-border';
  }
};

/** Returns a hex colour for map markers / chart lines */
export const getRiskColorHex = (risk) => {
  const r = risk ? risk.toUpperCase() : '';
  switch (r) {
    case 'LOW':      return '#4ade80';
    case 'MODERATE': return '#facc15';
    case 'HIGH':     return '#fb923c';
    case 'EXTREME':
    case 'CRITICAL': return '#ef4444';
    default:         return '#57534e';
  }
};

/** Returns a soft rgba background for badge chips */
export const getRiskBadgeBg = (risk) => {
  const r = risk ? risk.toUpperCase() : '';
  switch (r) {
    case 'LOW':      return 'rgba(74,222,128,0.12)';
    case 'MODERATE': return 'rgba(250,204,21,0.12)';
    case 'HIGH':     return 'rgba(251,146,60,0.12)';
    case 'EXTREME':
    case 'CRITICAL': return 'rgba(239,68,68,0.12)';
    default:         return 'rgba(87,83,78,0.12)';
  }
};

/** Returns a human-readable risk label */
export const getRiskLabel = (risk) => {
  const r = risk ? risk.toUpperCase() : '';
  switch (r) {
    case 'LOW':      return '🟢 Low';
    case 'MODERATE': return '🟡 Moderate';
    case 'HIGH':     return '🟠 High';
    case 'EXTREME':
    case 'CRITICAL': return '🔴 Extreme';
    default:         return '⚪ Unknown';
  }
};

/** Returns a short icon emoji for the risk level */
export const getRiskIcon = (risk) => {
  const r = risk ? risk.toUpperCase() : '';
  switch (r) {
    case 'LOW':      return '🟢';
    case 'MODERATE': return '🟡';
    case 'HIGH':     return '🟠';
    case 'EXTREME':
    case 'CRITICAL': return '🔴';
    default:         return '⚪';
  }
};
