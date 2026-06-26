// src/pages/dashboard/FarmerDashboard.jsx
import React, { useEffect, useState } from 'react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import StatCard from '../../components/ui/StatCard';
import AdvisoryCard from '../../components/common/AdvisoryCard';
import { advisoryApi } from '../../api/advisoryApi';
import {
  Sprout, Droplets, Wind, Thermometer,
  Sun, AlertTriangle, CheckCircle2, Info, Leaf,
} from 'lucide-react';

/* ── Static farm-context advisories shown while backend data loads ── */
const CROP_TILES = [
  {
    id: 'c1',
    icon: Leaf,
    color: 'text-risk-low',
    iconBg: 'bg-risk-lowBg',
    borderColor: 'border-risk-low/25',
    title: 'Crop Protection',
    badge: { label: 'Mulch Recommended', level: 'LOW' },
    body: 'Apply straw mulching (5–7 cm) to conserve soil moisture. Shift irrigation to early morning (05:00–07:00) to reduce evaporation losses by up to 40%.',
  },
  {
    id: 'c2',
    icon: Droplets,
    color: 'text-risk-moderate',
    iconBg: 'bg-risk-moderateBg',
    borderColor: 'border-risk-moderate/25',
    title: 'Soil Moisture',
    badge: { label: 'Monitor Closely', level: 'MODERATE' },
    body: 'Average moisture declining across northern Karnataka. Increase drip irrigation frequency by 20%. Check tensiometers at 15 cm depth daily.',
  },
  {
    id: 'c3',
    icon: AlertTriangle,
    color: 'text-risk-extreme',
    iconBg: 'bg-risk-extremeBg',
    borderColor: 'border-risk-extreme/25',
    title: 'Livestock Shelter',
    badge: { label: 'Extreme Heat Stress', level: 'EXTREME' },
    body: 'Ensure cattle shed ventilation via cross-ventilation gaps. Wet gunny bags on windows reduce ambient temp by 3–5°C. Supply electrolyte-enriched water.',
  },
];

const SCHEDULE_DAYS = [
  { day: 'Mon', time: '05:30', status: 'optimal', mm: '28' },
  { day: 'Tue', time: '05:00', status: 'optimal', mm: '32' },
  { day: 'Wed', time: '05:30', status: 'warning', mm: '18' },
  { day: 'Thu', time: '06:00', status: 'optimal', mm: '30' },
  { day: 'Fri', time: '05:00', status: 'critical', mm: '12' },
  { day: 'Sat', time: '05:30', status: 'optimal', mm: '28' },
  { day: 'Sun', time: 'REST',  status: 'rest',     mm: '—'  },
];

const statusStyle = {
  optimal:  { dot: 'bg-risk-low',      text: 'text-risk-low',      label: 'Optimal'  },
  warning:  { dot: 'bg-risk-moderate', text: 'text-risk-moderate', label: 'Deficit'  },
  critical: { dot: 'bg-risk-extreme',  text: 'text-risk-extreme',  label: 'Critical' },
  rest:     { dot: 'bg-brand-faint',   text: 'text-brand-faint',   label: 'Rest Day' },
};

const FarmerDashboard = () => {
  const [advisory, setAdvisory] = useState(null);

  useEffect(() => {
    advisoryApi.getAdvisory('FARMER', 'HIGH').then((res) => {
      if (res?.status === 'success') setAdvisory(res.data);
    });
  }, []);

  return (
    <div className="space-y-6 fade-in-up">

      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-5 border-b border-brand-border/40">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-5 w-1 rounded-full bg-heat-gradient" />
            <span className="text-xs text-brand-primary font-bold uppercase tracking-widest">
              Agricultural Intelligence
            </span>
          </div>
          <h1 className="section-header text-2xl sm:text-3xl font-black tracking-tight">
            Farmer Advisory Insights
          </h1>
          <p className="text-sm text-brand-muted mt-1 font-medium">
            Crop and livestock heatwave mitigations — Karnataka IMD data, updated 15 min
          </p>
        </div>
        <div className="flex items-center gap-3 self-start md:self-auto">
          <Badge level="HIGH" pulse />
          <div className="flex items-center gap-1.5 text-xs bg-brand-card border border-brand-border/80 rounded-xl px-3 py-1.5 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-risk-low animate-pulse" />
            <span className="text-brand-muted font-bold">IMD Synced</span>
          </div>
        </div>
      </div>

      {/* ── Stat Row ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={Thermometer} label="Peak Temp Today"   value="41.2°C" color="text-risk-extreme" trend="up"   trendText="+3.1°C" />
        <StatCard icon={Droplets}    label="Soil Moisture"     value="62%"    color="text-risk-moderate" trend="down" trendText="-8%"  />
        <StatCard icon={Wind}        label="Wind Speed"        value="14 km/h" color="text-cyan-400"     />
        <StatCard icon={Sun}         label="UV Index"          value="9 — High" color="text-brand-yellow"  sub="Protect field workers" />
      </div>

      {/* ── Crop / Livestock Advisory Tiles ──────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sprout className="h-5 w-5 text-brand-primary" />
          <h2 className="section-header text-sm tracking-wider uppercase">
            Active Agricultural Advisories
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {CROP_TILES.map(({ id, icon: Icon, color, iconBg, borderColor, title, badge, body }) => (
            <div
              key={id}
              className={`relative overflow-hidden rounded-2xl border ${borderColor} bg-brand-card/50 backdrop-blur-md p-5 shadow-card hover:shadow-glow hover:-translate-y-1 transition-all duration-300 group`}
            >
              {/* Corner radial glow highlight */}
              <div className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-20 transition-opacity pointer-events-none"
                   style={{ background: `radial-gradient(circle, currentColor 0%, transparent 70%)` }} />
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconBg} border border-brand-border/80 mb-4`}>
                <Icon className={`h-5 w-5 ${color} group-hover:scale-110 transition-transform`} />
              </div>
              <h3 className="font-heading text-sm font-extrabold text-brand-text mb-2 tracking-tight">{title}</h3>
              <p className="text-xs text-brand-muted leading-relaxed mb-4 font-medium">{body}</p>
              <Badge level={badge.level} label={badge.label} size="sm" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Main Grid: Schedule + Advisory ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">

        {/* Weekly Irrigation Schedule */}
        <Card
          className="lg:col-span-3 card-glow"
          title="Weekly Irrigation Schedule"
          subtitle="IMD evapotranspiration forecast · next 7 days"
          accent
        >
          <div className="space-y-2">
            {SCHEDULE_DAYS.map(({ day, time, status, mm }) => {
              const s = statusStyle[status];
              return (
                <div
                  key={day}
                  className="flex items-center justify-between rounded-xl bg-brand-surface/30 border border-brand-border/40 px-4 py-2.5 hover:border-brand-border/80 hover:bg-brand-surface/60 transition-all duration-200"
                >
                  <div className="flex items-center gap-3 w-16">
                    <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${s.dot} ${status === 'critical' || status === 'warning' ? 'animate-pulse shadow-glow' : ''}`} />
                    <span className="text-sm font-bold text-brand-text">{day}</span>
                  </div>
                  <span className="text-xs font-mono text-brand-faint flex-1 text-center font-bold">{time}</span>
                  <span className="text-xs font-bold text-brand-text w-14 text-right">{mm !== '—' ? `${mm} mm` : '—'}</span>
                  <span className={`text-[9px] font-black uppercase tracking-wider w-16 text-right ${s.text}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-brand-faint mt-3 flex items-center gap-1.5 font-medium">
            <Info className="h-3.5 w-3.5 text-brand-primary" />
            Amounts are recommendations based on ET₀ and crop coefficient (Kc) values.
          </p>
        </Card>

        {/* DB Advisory or fallback */}
        <div className="lg:col-span-2">
          {advisory ? (
            <AdvisoryCard advisory={advisory} />
          ) : (
            <Card title="Heatwave Advisory" subtitle="Karnataka State Farmers' Bureau" accent className="card-glow">
              <div className="space-y-3">
                {[
                  'Avoid fieldwork between 11:00 AM – 4:00 PM on High/Extreme risk days.',
                  'Apply foliar spray of 1% Kaolin clay to reduce leaf surface temperature.',
                  'Maintain green windbreaks on western field edges to block hot winds.',
                  'Harvest early-maturing varieties before peak heat (40°C+) days arrive.',
                  'Deploy shade nets (35–50% UV cut) over nurseries and seedling beds.',
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-brand-muted hover:text-brand-text transition-colors duration-150">
                    <CheckCircle2 className="h-4 w-4 text-risk-low flex-shrink-0 mt-0.5" />
                    <span className="leading-relaxed font-medium">{tip}</span>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
