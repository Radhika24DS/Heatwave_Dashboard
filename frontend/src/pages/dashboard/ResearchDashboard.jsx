// src/pages/dashboard/ResearchDashboard.jsx
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import FeatureImportanceChart from '../../components/common/FeatureImportanceChart';
import ConfusionMatrixHeatmap from '../../components/common/ConfusionMatrixHeatmap';
import ROCCurveChart from '../../components/common/ROCCurveChart';
import ForecastTrendChart from '../../components/common/ForecastTrendChart';
import { predictionApi } from '../../api/predictionApi';
import { BrainCircuit, BarChart2, Activity, Database } from 'lucide-react';

const ResearchDashboard = () => {
  const [forecast, setForecast] = useState([]);

  useEffect(() => {
    (async () => {
      const resp = await predictionApi.getForecast(1);
      if (resp?.status === 'success') setForecast(resp.data);
    })();
  }, []);

  return (
    <div className="space-y-6 fade-in-up">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-1 rounded-full bg-cyan-400" />
            <span className="text-xs text-cyan-400 font-bold uppercase tracking-widest">Research & Analytics</span>
          </div>
          <h1 className="section-header text-2xl sm:text-3xl font-black text-brand-text">
            Model Performance & Analytics
          </h1>
          <p className="text-sm text-brand-muted mt-1 font-medium">
            Deep analysis of AOD aerosol optical depth and IMD weather predictions
          </p>
        </div>
        <Badge label="v2.0 XGBoost" level="LOW" className="self-start sm:self-auto" />
      </div>

      {/* ── Model Metrics ───────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={BrainCircuit} label="Model Accuracy"     value="89.2%"  trend="up" trendText="+1.8%" color="text-risk-low" />
        <StatCard icon={Activity}     label="ROC AUC"            value="0.941"  trend="up" trendText="+0.03"  color="text-brand-primary" />
        <StatCard icon={BarChart2}    label="Feature Dimensions" value="12"     color="text-cyan-400" />
        <StatCard icon={Database}     label="Data Sync"          value="Hourly" sub="IMD + MODIS AOD" color="text-purple-400" />
      </div>

      {/* ── Charts Row 1 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="Feature Importance" padding="lg" className="card-glow" accent>
          <FeatureImportanceChart />
        </Card>
        <Card title="Confusion Matrix" padding="lg" className="card-glow" accent>
          <ConfusionMatrixHeatmap />
        </Card>
      </div>

      {/* ── Charts Row 2 ────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card title="ROC Curve" padding="lg" className="card-glow" accent>
          <ROCCurveChart />
        </Card>
        <Card title="3-Day Forecast Trend" padding="lg" className="card-glow" accent>
          <ForecastTrendChart forecastData={forecast} />
        </Card>
      </div>

      {/* ── Model Details ───────────────────────────────────── */}
      <Card title="📋 Model & Dataset Details" padding="lg" className="card-glow" accent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
          {[
            ['Algorithm',      'XGBoost Classifier (xgboost)'],
            ['Training Set',   '2019–2023 IMD + MODIS AOD'],
            ['Test Split',     '80/20 stratified'],
            ['Cross-Val',      '5-fold StratifiedKFold'],
            ['Hyperparams',    'n_estimators=300, max_depth=6, lr=0.05'],
            ['Input Features', '12 (Temp, Humidity, Wind, AOD, PM2.5/10…)'],
          ].map(([label, val]) => (
            <div key={label} className="p-3.5 rounded-xl bg-brand-surface border border-brand-border/60 hover:border-brand-primary/20 hover:bg-brand-surface transition-all duration-200">
              <p className="text-[10px] text-brand-faint uppercase font-extrabold tracking-widest mb-1.5">{label}</p>
              <p className="text-brand-text font-bold leading-tight">{val}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ResearchDashboard;
