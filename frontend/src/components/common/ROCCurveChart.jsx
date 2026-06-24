// src/components/common/ROCCurveChart.jsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine
} from 'recharts';

// Data simulating model ROC curve coordinates (FPR, TPR)
const data = [
  { fpr: 0, tpr: 0 },
  { fpr: 0.02, tpr: 0.35 },
  { fpr: 0.05, tpr: 0.68 },
  { fpr: 0.10, tpr: 0.85 },
  { fpr: 0.15, tpr: 0.92 },
  { fpr: 0.25, tpr: 0.96 },
  { fpr: 0.40, tpr: 0.98 },
  { fpr: 0.60, tpr: 0.99 },
  { fpr: 0.80, tpr: 1.0 },
  { fpr: 1.0, tpr: 1.0 }
];

const ROCCurveChart = () => {
  return (
    <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
      <div className="mb-4 flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-brand-text">ROC Curve (Model AUC)</h3>
          <p className="text-xs text-brand-muted mt-0.5">True Positive Rate (Sensitivity) vs False Positive Rate</p>
        </div>
        <div className="px-2.5 py-1 bg-brand-slate text-risk-moderate border border-brand-border text-xs font-bold rounded-lg">
          AUC: 0.941
        </div>
      </div>

      <div className="w-full h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} stroke="#f9fafb" />
            <XAxis 
              dataKey="fpr" 
              type="number" 
              domain={[0, 1]} 
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              label={{ value: 'False Positive Rate (FPR)', position: 'insideBottom', offset: -5, fill: '#9ca3af', fontSize: 10 }}
            />
            <YAxis 
              type="number" 
              domain={[0, 1.05]} 
              tick={{ fill: '#9ca3af', fontSize: 11 }}
              axisLine={{ stroke: '#374151' }}
              tickLine={{ stroke: '#374151' }}
              label={{ value: 'True Positive Rate (TPR)', angle: -90, position: 'insideLeft', offset: 10, fill: '#9ca3af', fontSize: 10 }}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: '8px' }}
              labelStyle={{ color: '#f9fafb' }}
              itemStyle={{ color: '#f9fafb' }}
              formatter={(value, name) => [value, name === 'tpr' ? 'Sensitivity (TPR)' : name]}
            />
            {/* Baseline Random Guess Line */}
            <ReferenceLine 
              segment={[{ x: 0, y: 0 }, { x: 1, y: 1 }]} 
              stroke="#6b7280" 
              strokeDasharray="4 4" 
            />
            {/* Model ROC Curve Line */}
            <Line
              type="monotone"
              dataKey="tpr"
              stroke="#f97316" // Orange
              strokeWidth={3}
              dot={{ r: 3, fill: '#f97316' }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ROCCurveChart;
