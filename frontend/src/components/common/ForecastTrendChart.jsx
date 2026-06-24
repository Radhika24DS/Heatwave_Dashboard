// src/components/common/ForecastTrendChart.jsx
import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts';

const ForecastTrendChart = ({ forecastData = [] }) => {
  // Map raw forecast predictions to chart structure
  const chartData = forecastData.map((day) => ({
    date: day.forecast_date ? day.forecast_date.split('-').slice(1).join('-') : 'N/A', // format MM-DD
    temp: day.weather?.max_temp || 0,
    score: day.risk_score || 0
  }));

  if (chartData.length === 0) {
    return <p className="text-center text-sm text-brand-muted py-6">No forecast data available.</p>;
  }

  return (
    <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-text">Multi-Day Outlook Trend</h3>
        <p className="text-xs text-brand-muted mt-0.5">Forecast temperature profile and heatwave risk score progression</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -10, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#eab308" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#eab308" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#f9fafb" />
            <XAxis 
              dataKey="date" 
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            {/* Left Y-Axis for Temperature */}
            <YAxis 
              yAxisId="left"
              domain={['auto', 'auto']}
              tick={{ fill: '#ef4444', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              label={{ value: 'Max Temp (°C)', angle: -90, position: 'insideLeft', offset: 15, fill: '#ef4444', fontSize: 10 }}
            />
            {/* Right Y-Axis for Risk Score */}
            <YAxis 
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: '#eab308', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              label={{ value: 'Risk Score (0-100)', angle: 90, position: 'insideRight', offset: 15, fill: '#eab308', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#f9fafb', fontWeight: 'bold' }}
              itemStyle={{ color: '#f9fafb' }}
            />
            <Legend verticalAlign="top" height={36} iconType="circle" />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey="temp"
              name="Max Temperature (°C)"
              stroke="#ef4444"
              fillOpacity={1}
              fill="url(#colorTemp)"
              strokeWidth={2.5}
            />
            <Area
              yAxisId="right"
              type="monotone"
              dataKey="score"
              name="Risk Score"
              stroke="#eab308"
              fillOpacity={1}
              fill="url(#colorScore)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ForecastTrendChart;
