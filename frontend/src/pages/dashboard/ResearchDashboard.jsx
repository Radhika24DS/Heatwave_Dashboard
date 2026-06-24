// src/pages/dashboard/ResearchDashboard.jsx
import React from 'react';
import StatCard from '../../components/ui/StatCard';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const ResearchDashboard = () => {
  return (
    <div className="glass p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Research & Analytics</h1>
          <p className="text-sm text-brand-muted mt-1">Deep analysis of aerosol optical depth and IMD weather predictions.</p>
        </div>
        <Badge className="mt-4 md:mt-0" variant="info">Active Model: v1.4.2‑RandomForest</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Model Accuracy" value="89.2%" />
        <StatCard title="ROC AUC" value="0.941" />
        <StatCard title="Feature Dimensions" value="12" />
        <StatCard title="Data Sync" value="Hourly (IMD)" />
      </div>

      {/* Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Model Visualizations">
          <p className="text-sm text-brand-muted">
            Confusion matrix, ROC curve, and feature importance will render here.
          </p>
        </Card>
        <Card title="Historical Correlations">
          <p className="text-sm text-brand-muted">
            Scatter plot of daily max temperature vs aerosol concentration.
          </p>
        </Card>
      </div>
    </div>
  );
};

export default ResearchDashboard;
