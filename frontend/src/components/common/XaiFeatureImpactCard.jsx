import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, CartesianGrid } from 'recharts';
import { Info } from 'lucide-react';

export default function XaiFeatureImpactCard({ factors = [] }) {
  if (!factors || factors.length === 0) return null;

  // Render factors using Recharts horizontal bar chart
  const data = factors.map(f => ({
    name: f.feature,
    impact: f.impact,
    absImpact: Math.abs(f.impact),
    color: f.impact >= 0 ? '#ea580c' : '#3b82f6' // Orange-red for positive risk, blue for cooling/reducing risk
  }));

  return (
    <div className="bg-surface rounded-card p-6 shadow-card border border-surface-variant flex flex-col h-[280px]">
      <div className="flex items-center gap-2 mb-3">
        <h3 className="font-bold text-lg text-on-surface">Explainable AI (XAI)</h3>
        <span className="group relative cursor-pointer text-outline hover:text-primary">
          <Info size={14} />
          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-inverse-surface text-inverse-on-surface text-xs rounded shadow-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            This chart shows how different weather and atmospheric factors increased (orange) or decreased (blue) the overall heatwave risk.
          </span>
        </span>
      </div>
      <p className="text-xs text-outline mb-4">Contribution of physical parameters to predicted risk score</p>
      
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              type="number"
              domain={['dataMin - 0.1', 'dataMax + 0.1']}
              tick={{ fill: '#8a776e', fontSize: 10 }}
              axisLine={{ stroke: 'rgba(138, 119, 110, 0.2)' }}
              tickLine={{ stroke: 'rgba(138, 119, 110, 0.2)' }}
            />
            <YAxis
              dataKey="name"
              type="category"
              tick={{ fill: '#4a3e3d', fontSize: 10, fontWeight: 500 }}
              axisLine={{ stroke: 'rgba(138, 119, 110, 0.2)' }}
              tickLine={false}
              width={120}
            />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', border: '1px solid rgba(138, 119, 110, 0.3)', borderRadius: 8, fontSize: 11 }}
              formatter={(value) => [`${value > 0 ? '+' : ''}${value.toFixed(3)}`, 'Risk Impact']}
            />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={12}>
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
