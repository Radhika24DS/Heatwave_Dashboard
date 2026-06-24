// src/pages/dashboard/ResearchDashboard.jsx
import React from 'react';

const ResearchDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Research & Analytics Insights</h1>
          <p className="text-sm text-brand-muted mt-1">Deep analysis of Aerosol Optical Depth (AOD) and IMD weather prediction indices</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-brand-slate rounded-lg border border-brand-border text-xs text-brand-muted">
          Active Model: <span className="font-bold text-risk-low">v1.4.2-RandomForest</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl text-center">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Model Accuracy</p>
          <p className="text-3xl font-black text-brand-text mt-2">89.2%</p>
        </div>

        {/* Metric 2 */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl text-center">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">ROC Area Under Curve</p>
          <p className="text-3xl font-black text-brand-text mt-2">0.941</p>
        </div>

        {/* Metric 3 */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl text-center">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Feature Dimensions</p>
          <p className="text-3xl font-black text-brand-text mt-2">12 Features</p>
        </div>

        {/* Metric 4 */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl text-center">
          <p className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Data Sync Freq</p>
          <p className="text-3xl font-black text-brand-text mt-2">Hourly (IMD)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-brand-text mb-3">Model Visualizations Placeholder</h2>
          <p className="text-sm text-brand-muted">Confusion matrix heatmap, ROC curve chart, and features significance weightings will render here.</p>
        </div>

        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-brand-text mb-3">Recent Historical Correlations</h2>
          <p className="text-sm text-brand-muted">Aggregated scatter plot mapping maximum daily temperatures against aerosol concentration levels.</p>
        </div>
      </div>
    </div>
  );
};

export default ResearchDashboard;
