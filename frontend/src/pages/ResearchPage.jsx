import React, { useState, useEffect } from 'react';
import { researchService } from '../services/research.service';
import DistrictSelector from '../components/common/DistrictSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ConfusionMatrixHeatmap from '../components/common/ConfusionMatrixHeatmap';
import ROCCurveChart from '../components/common/ROCCurveChart';
import FeatureImportanceChart from '../components/common/FeatureImportanceChart';
import { FlaskConical, BarChart3, Target, RefreshCw, TrendingUp } from 'lucide-react';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
  Cell, CartesianGrid
} from 'recharts';

// SHAP-style horizontal bar chart for top_factors
function SHAPChart({ factors = [] }) {
  const sorted = [...factors].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  const getColor = (impact) => impact >= 0 ? '#ea580c' : '#3b82f6';

  const chartData = sorted.map(f => ({
    feature: f.feature.replace(/_/g, ' '),
    impact: parseFloat(f.impact.toFixed(3)),
    absImpact: Math.abs(f.impact),
    color: getColor(f.impact),
  }));

  return (
    <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
      <div className="mb-4">
        <h3 className="text-lg font-bold text-on-surface">SHAP Feature Impact</h3>
        <p className="text-xs text-outline mt-0.5">
          Feature contribution to risk score (🟠 increases risk · 🔵 decreases risk)
        </p>
      </div>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
            <XAxis
              type="number"
              tick={{ fill: '#9c8880', fontSize: 11 }}
              axisLine={{ stroke: '#d8c2b8' }}
              tickLine={{ stroke: '#d8c2b8' }}
              tickFormatter={v => v.toFixed(2)}
            />
            <YAxis
              dataKey="feature"
              type="category"
              tick={{ fill: '#53433d', fontSize: 11, fontWeight: 600 }}
              axisLine={{ stroke: '#d8c2b8' }}
              tickLine={false}
              width={145}
            />
            <Tooltip
              contentStyle={{ backgroundColor: '#fffbff', border: '1px solid #d8c2b8', borderRadius: 8 }}
              formatter={(value) => [`${value > 0 ? '+' : ''}${value.toFixed(3)}`, 'SHAP Impact']}
            />
            <Bar dataKey="impact" radius={[0, 4, 4, 0]} barSize={18}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Probability distribution bar chart
function ProbabilityChart({ probabilities = {} }) {
  const data = [
    { label: 'Low',      value: probabilities.low      || 0, color: '#16a34a' },
    { label: 'Moderate', value: probabilities.moderate  || 0, color: '#ca8a04' },
    { label: 'Severe',   value: probabilities.severe    || 0, color: '#ea580c' },
    { label: 'Extreme',  value: probabilities.extreme   || 0, color: '#dc2626' },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
      <h3 className="text-lg font-bold text-on-surface mb-1">Risk Class Probabilities</h3>
      <p className="text-xs text-outline mb-4">Predicted probability distribution across heatwave severity classes</p>
      <div className="space-y-3">
        {data.map(({ label, value, color }) => (
          <div key={label}>
            <div className="flex justify-between text-sm mb-1.5">
              <span className="font-medium text-on-surface">{label}</span>
              <span className="font-bold" style={{ color }}>{(value * 100).toFixed(1)}%</span>
            </div>
            <div className="h-3 bg-surface-variant rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${value * 100}%`, backgroundColor: color }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Model metrics table
function MetricsTable({ classes = [], metadata = {} }) {
  return (
    <div className="bg-surface rounded-2xl border border-surface-variant shadow-card overflow-hidden">
      <div className="p-5 border-b border-surface-variant flex items-center justify-between flex-wrap gap-3">
        <div>
          <h3 className="text-lg font-bold text-on-surface">Model Performance Metrics</h3>
          <p className="text-xs text-outline mt-0.5">
            {metadata.algorithm} · v{metadata.model_version} · Trained {metadata.training_date}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="text-center bg-primary-container rounded-xl px-4 py-2">
            <p className="text-xs text-outline">Weighted F1</p>
            <p className="text-xl font-black text-on-primary-container">
              {((metadata.weighted_f1 || 0) * 100).toFixed(1)}%
            </p>
          </div>
          <div className="text-center bg-secondary-container rounded-xl px-4 py-2">
            <p className="text-xs text-outline">Accuracy</p>
            <p className="text-xl font-black text-on-secondary-container">
              {((metadata.overall_accuracy || 0) * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-surface-container-low">
            <tr>
              {['Class', 'Precision', 'Recall', 'F1 Score', 'Support'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-bold text-outline uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-variant">
            {classes.map((row) => (
              <tr key={row.label} className="hover:bg-surface-container-low transition-colors">
                <td className="px-4 py-3 font-semibold text-on-surface">{row.label}</td>
                <td className="px-4 py-3 text-on-surface">{(row.precision * 100).toFixed(1)}%</td>
                <td className="px-4 py-3 text-on-surface">{(row.recall * 100).toFixed(1)}%</td>
                <td className="px-4 py-3">
                  <span className="font-bold text-primary">{(row.f1 * 100).toFixed(1)}%</span>
                </td>
                <td className="px-4 py-3 text-outline">{row.support}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const RISK_BADGE = {
  LOW:      'bg-heatwave-normal text-white',
  MODERATE: 'bg-heatwave-watch text-white',
  HIGH:     'bg-heatwave-warning text-white',
  EXTREME:  'bg-error text-on-error',
};

export default function ResearchPage() {
  const [districtId, setDistrictId] = useState(1);
  const [predData, setPredData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async (dId) => {
    setLoading(true);
    setError(null);
    try {
      const [predRes, metricsRes] = await Promise.all([
        researchService.getPredictions(dId),
        researchService.getMetrics(),
      ]);
      setPredData(predRes.data);
      setMetrics(metricsRes.data);
    } catch (e) {
      setError('Failed to load research data. Run a prediction for this district first.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(districtId); }, [districtId]);

  const riskBadge = RISK_BADGE[(predData?.risk_level || '').toUpperCase()] || 'bg-outline text-white';

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-secondary-container rounded-xl">
            <FlaskConical size={24} className="text-on-secondary-container" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-on-surface">Research & Analytics</h1>
            <p className="text-sm text-outline">SHAP analysis, model performance, and district risk breakdown</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <DistrictSelector selectedDistrict={districtId} onChange={setDistrictId} />
          <button
            onClick={() => fetchData(districtId)}
            disabled={loading}
            className="p-2.5 rounded-full bg-surface border border-surface-variant hover:bg-secondary-container transition-colors disabled:opacity-50"
            title="Refresh"
          >
            <RefreshCw size={16} className={`text-primary ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-error-container text-on-error-container rounded-xl p-4 text-sm font-medium flex items-center gap-2">
          <Target size={16} />
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </div>
      ) : predData ? (
        <>
          {/* District summary bar */}
          <div className="bg-surface rounded-2xl border border-surface-variant p-5 flex items-center gap-4 shadow-card flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-outline uppercase tracking-wider">Latest Prediction</p>
              <h2 className="text-xl font-black text-on-surface mt-0.5">{predData.district_name}</h2>
              <p className="text-xs text-outline mt-0.5">
                Predicted at: {new Date(predData.predicted_at).toLocaleString('en-IN')}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center">
                <p className="text-xs text-outline">Risk Score</p>
                <p className="text-3xl font-black text-primary">{(predData.risk_score * 100).toFixed(1)}%</p>
              </div>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold ${riskBadge}`}>
                {predData.risk_level}
              </span>
            </div>
          </div>

          {/* Row 1: SHAP + Probabilities */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SHAPChart factors={predData.top_factors || []} />
            <ProbabilityChart probabilities={predData.probabilities || {}} />
          </div>

          {/* Row 2: Feature Importance + ROC */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <FeatureImportanceChart />
            <ROCCurveChart />
          </div>

          {/* Row 3: Confusion Matrix */}
          <ConfusionMatrixHeatmap />

          {/* Row 4: Metrics Table */}
          {metrics && (
            <MetricsTable
              classes={metrics.classes || []}
              metadata={metrics}
            />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-outline bg-surface-container-lowest rounded-2xl border border-surface-variant">
          <BarChart3 size={48} className="mb-4 opacity-40" />
          <p className="text-lg font-bold">No prediction data for this district</p>
          <p className="text-sm mt-1">Run a forecast from the Dashboard first, then return here.</p>
        </div>
      )}
    </div>
  );
}
