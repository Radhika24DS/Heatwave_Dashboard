// src/pages/dashboard/FarmerDashboard.jsx
import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';

const FarmerDashboard = () => {
  return (
    <div className="glass p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Farmer Advisory Insights</h1>
          <p className="text-sm text-brand-muted mt-1">Agricultural heatwave mitigations and real-time soil/irrigation advisories</p>
        </div>
        <Badge level="LOW" className="mt-4 md:mt-0" />
      </div>
      <Card title="Key Metrics" className="mt-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={null} label="Model Accuracy" value="89%" trend="up" trendText="+2%" />
          <StatCard icon={null} label="ROC AUC" value="0.94" trend="up" trendText="+0.03" />
          <StatCard icon={null} label="Features" value="42" />
          <StatCard icon={null} label="Sync Frequency" value="15m" />
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Crop Protection Card */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-brand-text mb-3">Crop Protection</h2>
          <p className="text-sm text-brand-muted mb-4">
            Heatwave warnings recommend applying straw mulching to conserve soil moisture. Adjust irrigation timings to early morning.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20">
            Mulch Recommended
          </span>
        </div>

        {/* Soil Moisture Monitoring */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-brand-text mb-3">Soil Moisture</h2>
          <p className="text-sm text-brand-muted mb-4">
            Average moisture level across northern Karnataka districts is declining. Irrigation frequencies should be increased by 20%.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-risk-low/10 text-risk-low rounded border border-risk-low/20">
            Optimal (Slightly Dry)
          </span>
        </div>

        {/* Livestock Advisory */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-brand-text mb-3">Livestock Shelter</h2>
          <p className="text-sm text-brand-muted mb-4">
            Ensure proper ventilation in cattle sheds. Put wet gunny bags on windows and supply mineral-fortified water.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20">
            Extreme Stress Warning
          </span>
        </div>
      </div>

      <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-brand-text mb-4">Weekly Irrigation Schedule</h2>
        <p className="text-sm text-brand-muted">Detailed schedule based on predictive IMD evapotranspiration rates will load here.</p>
      </div>
    </div>
  );
};

export default FarmerDashboard;
