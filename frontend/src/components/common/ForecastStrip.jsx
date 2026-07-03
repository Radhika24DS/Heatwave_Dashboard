import React from 'react';
import { format, parseISO } from 'date-fns';

export default function ForecastStrip({ forecasts }) {
  if (!forecasts || forecasts.length === 0) return null;

  return (
    <div className="bg-surface-container-lowest p-6 rounded-card shadow-card">
      <h3 className="text-lg font-bold mb-4">7-Day Outlook</h3>
      <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
        {forecasts.map((day, idx) => {
          const date = parseISO(day.date);
          return (
            <div key={idx} className="min-w-[120px] flex-shrink-0 flex flex-col items-center p-4 bg-surface rounded-xl border border-surface-variant text-center">
              <span className="text-sm font-semibold uppercase text-outline">{format(date, 'EEE')}</span>
              <span className="text-xs text-outline mb-2">{format(date, 'MMM d')}</span>
              
              <div className="my-2">
                <span className="text-lg font-bold text-primary">{day.tempmax}°</span>
              </div>
              
              <span className={`text-[10px] px-2 py-1 rounded-full font-bold mt-2 ${
                day.risk_level === 'EXTREME' ? 'bg-error text-on-error' :
                day.risk_level === 'WARNING' ? 'bg-heatwave-warning text-white' :
                'bg-heatwave-normal text-white'
              }`}>
                {day.risk_level}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
