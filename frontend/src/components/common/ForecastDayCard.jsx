import React from 'react';
import { getRiskBadgeClass, getRiskIcon, formatDate } from '../../utils/constants';
import { Thermometer, Droplets } from 'lucide-react';

export default function ForecastDayCard({ forecast, isToday = false, onClick, isSelected = false }) {
  const { forecast_date, risk_level, risk_score, weather, prediction } = forecast || {};
  const level = risk_level || prediction?.severity_tier || 'LOW';

  const tempMax = weather?.tempmax ?? prediction?.tempmax ?? '—';
  const humidity = weather?.humidity ?? '—';

  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col gap-3 p-4 rounded-card border-2 transition-all duration-200 text-left w-full
        ${isSelected
          ? 'border-primary shadow-heat bg-primary-container'
          : 'border-outline-variant bg-surface hover:border-primary hover:shadow-md'
        }
      `}
    >
      {/* Date header */}
      <div className="flex items-center justify-between">
        <span className={`text-xs font-black uppercase tracking-widest ${isSelected ? 'text-on-primary-container' : 'text-outline'}`}>
          {isToday ? 'Today' : formatDate(forecast_date)}
        </span>
        <span className="text-xl">{getRiskIcon(level)}</span>
      </div>

      {/* Risk badge */}
      <span className={`self-start text-xs font-bold px-2 py-0.5 rounded-full ${getRiskBadgeClass(level)}`}>
        {level}
      </span>

      {/* Weather stats */}
      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex items-center gap-1.5">
          <Thermometer size={14} className="text-error flex-shrink-0" />
          <span className="text-sm font-semibold text-on-surface">
            {tempMax !== '—' ? `${Number(tempMax).toFixed(1)}°C` : '—'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Droplets size={14} className="text-secondary flex-shrink-0" />
          <span className="text-sm text-outline">
            {humidity !== '—' ? `${humidity}%` : '—'} humidity
          </span>
        </div>
      </div>

      {/* Risk score bar */}
      {risk_score !== undefined && (
        <div className="mt-1">
          <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(risk_score * 100, 100)}%`,
                backgroundColor: level === 'LOW' ? '#16a34a' : level === 'MODERATE' ? '#ca8a04' : level === 'HIGH' ? '#ea580c' : '#dc2626',
              }}
            />
          </div>
          <span className="text-xs text-outline mt-0.5 block">
            Risk: {(risk_score * 100).toFixed(0)}%
          </span>
        </div>
      )}
    </button>
  );
}
