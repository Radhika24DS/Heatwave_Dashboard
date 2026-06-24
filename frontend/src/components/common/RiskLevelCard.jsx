// src/components/common/RiskLevelCard.jsx
import React from 'react';
import { getRiskColorHex, getRiskBadgeBg, getRiskLabel } from '../../utils/riskColor';
import { Thermometer, Wind, Droplets, Cloud } from 'lucide-react';

const StatRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-center justify-between py-1.5 border-b border-brand-border/40 last:border-0">
    <div className="flex items-center gap-1.5 text-brand-muted text-xs">
      {Icon && <Icon className="h-3 w-3" />}
      <span>{label}</span>
    </div>
    <span className="text-xs font-semibold text-brand-text">{value || 'N/A'}</span>
  </div>
);

const RiskLevelCard = ({ districtName, riskLevel, riskScore, weather = {}, aerosol = {} }) => {
  const color = getRiskColorHex(riskLevel);
  const bg    = getRiskBadgeBg(riskLevel);

  return (
    <div
      className="relative overflow-hidden rounded-2xl border border-brand-border bg-brand-card shadow-card fade-in-up"
      style={{ borderTopColor: color, borderTopWidth: '2px' }}
    >
      {/* Glow behind header */}
      <div className="absolute top-0 left-0 w-full h-32 opacity-40 pointer-events-none" style={{ background: `radial-gradient(ellipse at top, ${color}30 0%, transparent 70%)` }} />

      <div className="relative p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-brand-text">{districtName}</h3>
            <p className="text-xs text-brand-muted">District Risk Profile</p>
          </div>
          <span
            className="text-xs font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border"
            style={{ color, background: bg, borderColor: `${color}30` }}
          >
            {getRiskLabel(riskLevel)}
          </span>
        </div>

        {/* Score bar */}
        <div className="mb-5">
          <div className="flex justify-between text-xs text-brand-muted mb-1.5">
            <span>Heatwave Risk Score</span>
            <span className="font-bold" style={{ color }}>{riskScore ?? '--'}/100</span>
          </div>
          <div className="w-full h-2 rounded-full bg-brand-border overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700 ease-out"
              style={{ width: `${riskScore ?? 0}%`, backgroundColor: color }}
            />
          </div>
        </div>

        {/* Metrics grid */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-brand-faint uppercase font-bold tracking-widest mb-2">🌡 Weather</p>
            <StatRow label="Max Temp" value={weather.max_temp ? `${weather.max_temp}°C` : null} icon={Thermometer} />
            <StatRow label="Humidity"  value={weather.humidity  ? `${weather.humidity}%`  : null} icon={Droplets} />
            <StatRow label="Wind"      value={weather.wind_speed ? `${weather.wind_speed} km/h` : null} icon={Wind} />
          </div>
          <div>
            <p className="text-[10px] text-brand-faint uppercase font-bold tracking-widest mb-2">🛰 Aerosol</p>
            <StatRow label="AOD 550nm" value={aerosol.aod_value ? aerosol.aod_value.toFixed(3) : null} icon={Cloud} />
            <StatRow label="PM2.5"     value={aerosol.pm25  ? `${aerosol.pm25} µg/m³`  : null} />
            <StatRow label="PM10"      value={aerosol.pm10  ? `${aerosol.pm10} µg/m³`  : null} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskLevelCard;
