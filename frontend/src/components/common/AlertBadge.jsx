import React from 'react';
import { AlertTriangle, Info, ShieldAlert } from 'lucide-react';

export default function AlertBadge({ level, message }) {
  const getStyles = () => {
    switch (level?.toUpperCase()) {
      case 'EXTREME':
        return 'bg-error text-on-error shadow-heat-glow pulse-urgent';
      case 'WARNING':
        return 'bg-heatwave-warning text-white';
      case 'WATCH':
        return 'bg-heatwave-watch text-white';
      case 'NORMAL':
      default:
        return 'bg-heatwave-normal text-white';
    }
  };

  const getIcon = () => {
    switch (level?.toUpperCase()) {
      case 'EXTREME': return <ShieldAlert size={20} />;
      case 'WARNING': return <AlertTriangle size={20} />;
      default: return <Info size={20} />;
    }
  };

  return (
    <div className={`flex items-center gap-3 p-4 rounded-card ${getStyles()}`}>
      {getIcon()}
      <div className="flex-1">
        <h4 className="font-bold text-sm uppercase">{level} ALERT</h4>
        <p className="text-sm opacity-90">{message}</p>
      </div>
    </div>
  );
}
