import React from 'react';
import { Cloud, Droplets, Wind, Thermometer, Sun } from 'lucide-react';

export default function WeatherCard({ weather }) {
  if (!weather) return null;

  return (
    <div className="heat-glow-card p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-primary">Current Weather</h3>
          <p className="text-sm text-outline">Source: {weather.provider || 'N/A'}</p>
        </div>
        <Sun className="text-primary-container" size={32} />
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div className="flex items-center gap-2">
          <Thermometer className="text-error" size={20} />
          <div>
            <p className="text-xs text-outline">Max Temp</p>
            <p className="font-semibold">{weather.tempmax}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="text-secondary" size={20} />
          <div>
            <p className="text-xs text-outline">Humidity</p>
            <p className="font-semibold">{weather.humidity}%</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="text-on-surface-variant" size={20} />
          <div>
            <p className="text-xs text-outline">Wind Speed</p>
            <p className="font-semibold">{weather.windspeed} km/h</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Thermometer className="text-error-container text-on-error-container" size={20} />
          <div>
            <p className="text-xs text-outline">Heat Index</p>
            <p className="font-semibold">{weather.apparent_heat_index}°C</p>
          </div>
        </div>
      </div>
    </div>
  );
}
