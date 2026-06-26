// src/pages/dashboard/TravellerDashboard.jsx
import React from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import { Compass, Clock, Droplets, Car, MapPin, ThermometerSun } from 'lucide-react';

const TipChip = ({ text, color, bg, border }) => (
  <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-lg border ${bg} ${color} ${border}`}>
    {text}
  </span>
);

const ROUTE_DATA = [
  { from: 'Bengaluru', to: 'Mysuru',    risk: 'MODERATE', temp: '38°C', duration: '3h' },
  { from: 'Hubli',     to: 'Dharwad',   risk: 'HIGH',     temp: '42°C', duration: '1h' },
  { from: 'Mangaluru', to: 'Udupi',     risk: 'LOW',      temp: '34°C', duration: '1.5h' },
  { from: 'Kalaburagi', to: 'Bidar',    risk: 'EXTREME',  temp: '47°C', duration: '1.5h' },
];

const RISK_ROW = {
  LOW:      'text-risk-low bg-risk-lowBg border-risk-low/20',
  MODERATE: 'text-risk-moderate bg-risk-moderateBg border-risk-moderate/20',
  HIGH:     'text-risk-high bg-risk-highBg border-risk-high/20',
  EXTREME:  'text-risk-extreme bg-risk-extremeBg border-risk-extreme/20',
};

const TravellerDashboard = () => (
  <div className="space-y-6 fade-in-up">
    {/* ── Header ─────────────────────────────────────────── */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-brand-border/40">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <div className="h-5 w-1 rounded-full bg-risk-moderate" />
          <span className="text-xs text-brand-mid font-bold uppercase tracking-widest">Traveller Safety</span>
        </div>
        <h1 className="section-header text-2xl sm:text-3xl font-black text-brand-text">
          Traveller Heatwave Safety Panel
        </h1>
        <p className="text-sm text-brand-muted mt-1 font-medium">
          Real-time heatwave exposure risk assessment for tourists and transit routes
        </p>
      </div>
      <Badge level="MODERATE" pulse className="self-start sm:self-auto" />
    </div>

    {/* ── Quick Stats ─────────────────────────────────────── */}
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard icon={ThermometerSun} label="Max Temp Today" value="43°C"  color="text-risk-extreme" />
      <StatCard icon={Clock}          label="Safe Window"    value="6–10 AM" color="text-risk-low" />
      <StatCard icon={Droplets}       label="Humidity"       value="28%"   color="text-cyan-400" />
      <StatCard icon={MapPin}         label="High-Risk Districts" value="7" color="text-risk-high" />
    </div>

    {/* ── Safety Cards ────────────────────────────────────── */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      <Card title="🕐 Safe Transit Hours" glow className="card-glow">
        <p className="text-sm text-brand-muted mb-5 leading-relaxed font-medium">
          Avoid driving long distances or outdoor walking between
          <strong className="text-brand-text font-extrabold"> 11:30 AM – 3:30 PM</strong> in high-risk districts.
        </p>
        <TipChip text="Window: Early Morning / Evening" color="text-risk-moderate" bg="bg-risk-moderateBg" border="border-risk-moderate/20" />
      </Card>

      <Card title="💧 Hydration & Protection" className="card-glow">
        <p className="text-sm text-brand-muted mb-5 leading-relaxed font-medium">
          Always carry an insulated water flask with ORS. Wear wide-brimmed hats and
          <strong className="text-brand-text font-extrabold"> UV-protective sunglasses</strong>.
        </p>
        <TipChip text="Pre-Hydrate Mandatory" color="text-risk-low" bg="bg-risk-lowBg" border="border-risk-low/20" />
      </Card>

      <Card title="🚗 Vehicle Readiness" className="card-glow">
        <p className="text-sm text-brand-muted mb-5 leading-relaxed font-medium">
          Check coolant levels and tyre pressure before departure. High asphalt
          temperatures can trigger <strong className="text-brand-text font-extrabold">tyre blowouts</strong>.
        </p>
        <TipChip text="Asphalt Alert Active" color="text-risk-extreme" bg="bg-risk-extremeBg" border="border-risk-extreme/20" />
      </Card>
    </div>

    {/* ── Route Risk Table ────────────────────────────────── */}
    <Card title="🗺️ Route Heat Level Evaluator" padding="lg" className="card-glow" accent>
      <p className="text-xs text-brand-faint mb-5 font-bold uppercase tracking-wider">
        Indicative heatwave vulnerability index across major Karnataka travel routes.
      </p>
      <div className="overflow-x-auto rounded-xl border border-brand-border/40">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border/60 bg-brand-surface/50">
              <th className="text-left text-[10px] text-brand-muted uppercase font-extrabold tracking-wider py-3 px-4">From</th>
              <th className="text-left text-[10px] text-brand-muted uppercase font-extrabold tracking-wider py-3 px-4">To</th>
              <th className="text-left text-[10px] text-brand-muted uppercase font-extrabold tracking-wider py-3 px-4">Risk</th>
              <th className="text-left text-[10px] text-brand-muted uppercase font-extrabold tracking-wider py-3 px-4">Peak Temp</th>
              <th className="text-left text-[10px] text-brand-muted uppercase font-extrabold tracking-wider py-3 px-4">Duration</th>
            </tr>
          </thead>
          <tbody>
            {ROUTE_DATA.map((r, i) => (
              <tr key={i} className="border-b border-brand-border/30 hover:bg-brand-surface/40 transition-colors duration-150">
                <td className="py-3 px-4 text-brand-text font-extrabold">{r.from}</td>
                <td className="py-3 px-4 text-brand-text font-extrabold">{r.to}</td>
                <td className="py-3 px-4">
                  <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border uppercase ${RISK_ROW[r.risk]}`}>{r.risk}</span>
                </td>
                <td className="py-3 px-4 text-brand-muted font-bold">{r.temp}</td>
                <td className="py-3 px-4 text-brand-muted font-bold">{r.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  </div>
);

export default TravellerDashboard;
