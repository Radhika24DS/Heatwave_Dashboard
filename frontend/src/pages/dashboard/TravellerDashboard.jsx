// src/pages/dashboard/TravellerDashboard.jsx
import React from 'react';

const TravellerDashboard = () => {
  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-brand-border/40 pb-4">
        <div>
          <h1 className="text-3xl font-extrabold text-brand-text tracking-tight">Traveller Heatwave Safety Panel</h1>
          <p className="text-sm text-brand-muted mt-1">Real-time heatwave exposure risk assessment for tourists and transit routes</p>
        </div>
        <div className="mt-4 md:mt-0 px-4 py-2 bg-brand-slate rounded-lg border border-brand-border text-xs text-brand-muted">
          Travel Status: <span className="font-bold text-risk-moderate">Caution Advisory</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Safe Transit Hours */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-brand-text mb-3">Safe Transit Hours</h2>
          <p className="text-sm text-brand-muted mb-4">
            Avoid driving long distances or outdoor walking between 11:30 AM and 3:30 PM in districts with high risk level.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-yellow-500/10 text-yellow-500 rounded border border-yellow-500/20">
            Window: Early Morning / Evening
          </span>
        </div>

        {/* Dehydration Prevention */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-brand-text mb-3">Hydration & Protection</h2>
          <p className="text-sm text-brand-muted mb-4">
            Always carry an insulated water flask with ORS. Wear wide-brimmed hats and sunglasses with UV-protection.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-risk-low/10 text-risk-low rounded border border-risk-low/20">
            Pre-Hydrate Mandatory
          </span>
        </div>

        {/* Vehicle Alert */}
        <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
          <h2 className="text-lg font-bold text-brand-text mb-3">Vehicle Readiness</h2>
          <p className="text-sm text-brand-muted mb-4">
            Check coolant levels and tyre pressure. High asphalt temperatures can trigger tire blowouts and engine overheating.
          </p>
          <span className="inline-block text-xs font-semibold px-2.5 py-1 bg-red-500/10 text-red-500 rounded border border-red-500/20">
            Asphalt Alert Active
          </span>
        </div>
      </div>

      <div className="bg-brand-navy border border-brand-border rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-bold text-brand-text mb-4">Route Heat Level Evaluator</h2>
        <p className="text-sm text-brand-muted">Select origin and destination to check heatwave vulnerability index across your travel route.</p>
      </div>
    </div>
  );
};

export default TravellerDashboard;
