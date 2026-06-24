// src/components/common/RiskChart.jsx
import React from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';

/**
 * RiskChart visualises risk_score trends over time.
 * It expects an array of prediction objects with at least:
 *   - prediction_date (ISO string "YYYY-MM-DD")
 *   - risk_score (number)
 * The component aggregates scores by date (average) and renders a smooth line.
 */
const RiskChart = ({ predictions = [] }) => {
  // Aggregate by date
  const grouped = predictions.reduce((acc, cur) => {
    const date = cur.prediction_date?.split('T')[0] || cur.prediction_date;
    if (!date) return acc;
    if (!acc[date]) {
      acc[date] = { sum: 0, count: 0 };
    }
    acc[date].sum += Number(cur.risk_score) || 0;
    acc[date].count += 1;
    return acc;
  }, {});

  const chartData = Object.entries(grouped)
    .map(([date, { sum, count }]) => ({ date, score: Number((sum / count).toFixed(1)) }))
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  if (chartData.length === 0) {
    return <p className="text-center text-gray-500">No risk data available.</p>;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
        <Tooltip
          contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
          labelStyle={{ color: '#f9fafb' }}
          itemStyle={{ color: '#f9fafb' }}
        />
        <Line
          type="monotone"
          dataKey="score"
          stroke="#ef4444" // red-500 for high risk emphasis
          strokeWidth={3}
          dot={{ r: 3, fill: '#ef4444' }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default RiskChart;
