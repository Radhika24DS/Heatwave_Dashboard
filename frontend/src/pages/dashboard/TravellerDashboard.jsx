// src/pages/dashboard/TravellerDashboard.jsx
import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';

const TravellerDashboard = () => {
  return (
    <div className="glass p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Traveller Heatwave Safety Panel</h1>
          <p className="text-sm text-brand-muted mt-1">Real-time heatwave exposure risk assessment for tourists and transit routes</p>
        </div>
        <Badge level="MODERATE" className="mt-4 md:mt-0" />
      </div>

      {/* Safety Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Safe Transit Hours">
          <p className="text-sm text-brand-muted mb-4">
            Avoid driving long distances or outdoor walking between 11:30 AM and 3:30 PM in districts with high risk level.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20">
            Window: Early Morning / Evening
          </span>
        </Card>

        <Card title="Hydration & Protection">
          <p className="text-sm text-brand-muted mb-4">
            Always carry an insulated water flask with ORS. Wear wide‑brimmed hats and sunglasses with UV‑protection.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-risk-low/10 text-risk-low rounded border border-risk-low/20">
            Pre‑Hydrate Mandatory
          </span>
        </Card>

        <Card title="Vehicle Readiness">
          <p className="text-sm text-brand-muted mb-4">
            Check coolant levels and tyre pressure. High asphalt temperatures can trigger tyre blowouts and engine overheating.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20">
            Asphalt Alert Active
          </span>
        </Card>
      </div>

      {/* Route Evaluator */}
      <Card title="Route Heat Level Evaluator">
        <p className="text-sm text-brand-muted">
          Select origin and destination to check heatwave vulnerability index across your travel route.
        </p>
      </Card>
    </div>
  );
};

export default TravellerDashboard;
