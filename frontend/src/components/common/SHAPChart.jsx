import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, ResponsiveContainer, ReferenceLine,
} from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-surface border border-outline-variant rounded-lg p-3 shadow-lg text-sm">
      <p className="font-bold text-on-surface">{d.payload.feature}</p>
      <p style={{ color: d.payload.impact >= 0 ? '#dc2626' : '#6b5d2f' }} className="font-semibold">
        Impact: {d.value > 0 ? '+' : ''}{d.value.toFixed(3)}
      </p>
    </div>
  );
};

export default function SHAPChart({ factors = [] }) {
  if (!factors.length) {
    return (
      <div className="flex items-center justify-center h-48 text-outline text-sm">
        No feature data available.
      </div>
    );
  }

  // Sort by absolute impact descending
  const sorted = [...factors].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart
        data={sorted}
        layout="vertical"
        margin={{ top: 4, right: 24, left: 4, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#d8c2b8" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 11, fill: '#9c8880' }}
          tickFormatter={(v) => v.toFixed(2)}
          domain={['auto', 'auto']}
        />
        <YAxis
          type="category"
          dataKey="feature"
          tick={{ fontSize: 11, fill: '#53433d' }}
          width={150}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine x={0} stroke="#9c8880" strokeWidth={1.5} />
        <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
          {sorted.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.impact >= 0 ? '#ba1a1a' : '#6b5d2f'}
              fillOpacity={0.85}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
