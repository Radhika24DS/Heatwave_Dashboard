import React from 'react';

export default function StatCard({ title, value, icon, subtitle, colorClass }) {
  return (
    <div className="bg-surface rounded-card p-6 shadow-card border border-surface-variant flex items-center gap-4">
      <div className={`p-4 rounded-full ${colorClass}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-on-surface-variant uppercase tracking-wide">{title}</p>
        <p className="text-2xl font-black text-on-surface my-1">{value}</p>
        {subtitle && <p className="text-xs text-outline">{subtitle}</p>}
      </div>
    </div>
  );
}
