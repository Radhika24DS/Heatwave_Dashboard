// src/components/common/FeatureImportanceChart.jsx
import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';

const data = [
  { name: 'Max Temp (°C)', importance: 0.38, color: '#ef4444' }, // Red
  { name: 'AOD (550nm)', importance: 0.24, color: '#f97316' },  // Orange
  { name: 'Relative Humidity', importance: 0.16, color: '#eab308' }, // Yellow
  { name: 'PM2.5 Conc', importance: 0.11, color: '#06b6d4' },   // Cyan
  { name: 'Wind Speed', importance: 0.07, color: '#3b82f6' },   // Blue
  { name: 'Albedo / Soil Temp', importance: 0.04, color: '#10b981' } // Green
];

const FeatureImportanceChart = () => {
  return (
    <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-brand-text">ML Model Feature Significance</h3>
        <p className="text-xs text-brand-muted mt-0.5">Random Forest model relative variable importance weights</p>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 20, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[0, 0.5]} 
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
            />
            <YAxis 
              dataKey="name" 
              type="category" 
              tick={{ fill: '#f9fafb', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              width={120}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#f9fafb', fontWeight: 'bold' }}
              itemStyle={{ color: '#f9fafb' }}
              formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Importance Weight']}
            />
            <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default FeatureImportanceChart;
