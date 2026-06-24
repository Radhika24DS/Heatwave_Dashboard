// src/components/common/RiskLevelCard.jsx
import React from 'react';
import { getRiskColorHex } from '../../utils/riskColor';

const RiskLevelCard = ({ districtName, riskLevel, riskScore, weather = {}, aerosol = {} }) => {
  const color = getRiskColorHex(riskLevel);

  return (
    <div className="bg-brand-navy/80 backdrop-blur-md border border-brand-border hover:border-brand-muted/40 transition-all duration-300 rounded-2xl p-6 shadow-2xl relative overflow-hidden group">
      {/* Top Highlight Color Stripe */}
      <div 
        className="absolute top-0 left-0 w-full h-1.5 transition-all duration-300 group-hover:h-2" 
        style={{ backgroundColor: color }}
      />
      
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-brand-text tracking-tight group-hover:text-risk-high transition-colors duration-300">
            {districtName}
          </h3>
          <p className="text-xs text-brand-muted mt-0.5">District Risk Profile</p>
        </div>
        <div 
          className="px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider text-brand-dark"
          style={{ backgroundColor: color }}
        >
          {riskLevel}
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-xs text-brand-muted mb-1">
          <span>Heatwave Risk Score</span>
          <span className="font-semibold text-brand-text">{riskScore}/100</span>
        </div>
        <div className="w-full bg-brand-slate/60 rounded-full h-2 overflow-hidden border border-brand-border/40">
          <div 
            className="h-full rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${riskScore}%`, backgroundColor: color }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 border-t border-brand-border/30 pt-4 text-xs">
        {/* Weather Sub-parameters */}
        <div>
          <p className="text-brand-muted uppercase font-bold text-[9px] tracking-wide mb-2">Weather Profile</p>
          <div className="space-y-1 text-brand-text font-medium">
            <div className="flex justify-between">
              <span className="text-brand-muted">Max Temp:</span>
              <span>{weather.max_temp ? `${weather.max_temp}°C` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Humidity:</span>
              <span>{weather.humidity ? `${weather.humidity}%` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">Wind Speed:</span>
              <span>{weather.wind_speed ? `${weather.wind_speed} km/h` : 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Aerosol Sub-parameters */}
        <div>
          <p className="text-brand-muted uppercase font-bold text-[9px] tracking-wide mb-2">Aerosol Profile</p>
          <div className="space-y-1 text-brand-text font-medium">
            <div className="flex justify-between">
              <span className="text-brand-muted">AOD (550nm):</span>
              <span>{aerosol.aod_value ? aerosol.aod_value.toFixed(2) : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">PM2.5:</span>
              <span>{aerosol.pm25 ? `${aerosol.pm25} µg/m³` : 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-brand-muted">PM10:</span>
              <span>{aerosol.pm10 ? `${aerosol.pm10} µg/m³` : 'N/A'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RiskLevelCard;
