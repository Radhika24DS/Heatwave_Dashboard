import React, { useState, useCallback } from 'react';
import { predictionService } from '../services/prediction.service';
import { advisoryService } from '../services/advisory.service';
import { useAuthStore } from '../store/useAuthStore';
import DistrictSelector from '../components/common/DistrictSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Cpu, Zap, Thermometer, Wind, Droplets, Eye, AlertTriangle,
  CheckCircle2, TrendingUp, RefreshCw, MapPin, Calendar, Activity,
  Brain, BarChart2, Info
} from 'lucide-react';
import { KARNATAKA_DISTRICTS } from '../utils/constants';

const SEVERITY_CONFIG = {
  LOW:      { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0', label: 'Low Risk', icon: '✅' },
  MODERATE: { color: '#ca8a04', bg: '#fefce8', border: '#fde68a', label: 'Moderate Risk', icon: '⚠️' },
  HIGH:     { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa', label: 'High Risk', icon: '🔥' },
  EXTREME:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca', label: 'Extreme Risk', icon: '🚨' },
};

function RiskMeter({ score, tier }) {
  const pct = Math.round((score || 0) * 100);
  const cfg = SEVERITY_CONFIG[(tier || 'LOW').toUpperCase()] || SEVERITY_CONFIG.LOW;

  const getGradient = () => {
    if (pct <= 25) return 'linear-gradient(90deg, #16a34a, #4ade80)';
    if (pct <= 50) return 'linear-gradient(90deg, #16a34a, #ca8a04)';
    if (pct <= 75) return 'linear-gradient(90deg, #ca8a04, #ea580c)';
    return 'linear-gradient(90deg, #ea580c, #dc2626)';
  };

  return (
    <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
      <div className="flex items-center justify-between mb-5">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-1">Risk Score</p>
          <p className="text-5xl font-black" style={{ color: cfg.color }}>{pct}<span className="text-2xl">%</span></p>
        </div>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl" style={{ background: cfg.bg, border: `2px solid ${cfg.border}` }}>
          {cfg.icon}
        </div>
      </div>

      {/* Bar */}
      <div className="h-3 bg-surface-variant rounded-full overflow-hidden mb-3">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: getGradient() }}
        />
      </div>

      <div className="flex items-center justify-between text-xs text-outline">
        <span>0%</span>
        <span className="font-bold text-sm px-3 py-1 rounded-full" style={{ color: cfg.color, background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          {cfg.label}
        </span>
        <span>100%</span>
      </div>
    </div>
  );
}

function WeatherGrid({ weather }) {
  if (!weather) return null;
  const items = [
    { icon: <Thermometer size={16} />, label: 'Max Temp',   value: `${weather.tempmax?.toFixed(1) ?? '—'}°C`, color: '#ea580c' },
    { icon: <Thermometer size={16} />, label: 'Min Temp',   value: `${weather.tempmin?.toFixed(1) ?? '—'}°C`, color: '#3b82f6' },
    { icon: <Activity size={16} />,    label: 'Heat Index', value: `${weather.apparent_heat_index?.toFixed(1) ?? '—'}°C`, color: '#dc2626' },
    { icon: <Droplets size={16} />,    label: 'Humidity',   value: `${weather.humidity ?? '—'}%`,               color: '#0ea5e9' },
    { icon: <Wind size={16} />,        label: 'Wind Speed', value: `${weather.windspeed ?? '—'} km/h`,          color: '#64748b' },
    { icon: <Eye size={16} />,         label: 'Precip',     value: `${weather.precip ?? '—'} mm`,               color: '#6366f1' },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
      <h3 className="font-bold text-lg text-on-surface mb-4">Weather Conditions</h3>
      <div className="grid grid-cols-2 gap-3">
        {items.map(it => (
          <div key={it.label} className="flex items-center gap-3 p-3 bg-surface-container-low rounded-xl">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ color: it.color, background: `${it.color}15` }}>
              {it.icon}
            </div>
            <div>
              <p className="text-xs text-outline">{it.label}</p>
              <p className="font-bold text-sm text-on-surface">{it.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PredictionDetails({ prediction }) {
  if (!prediction) return null;
  const tier = (prediction.severity_tier || 'LOW').toUpperCase();
  const cfg = SEVERITY_CONFIG[tier] || SEVERITY_CONFIG.LOW;

  const probItems = [
    { label: 'Low',      val: prediction.prob_low      ?? 0, color: '#16a34a' },
    { label: 'Moderate', val: prediction.prob_moderate ?? 0, color: '#ca8a04' },
    { label: 'High',     val: prediction.prob_high     ?? 0, color: '#ea580c' },
    { label: 'Extreme',  val: prediction.prob_extreme  ?? 0, color: '#dc2626' },
  ];

  return (
    <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
      <h3 className="font-bold text-lg text-on-surface mb-5">Prediction Details</h3>

      {/* Severity + Confidence */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="p-4 rounded-xl" style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}>
          <p className="text-xs font-medium mb-1" style={{ color: cfg.color }}>Severity Tier</p>
          <p className="text-xl font-black" style={{ color: cfg.color }}>{tier}</p>
        </div>
        <div className="p-4 rounded-xl bg-secondary-container">
          <p className="text-xs font-medium text-on-secondary-container mb-1">Confidence</p>
          <p className="text-xl font-black text-on-secondary-container">
            {prediction.confidence != null ? `${(prediction.confidence * 100).toFixed(1)}%` : '—'}
          </p>
        </div>
      </div>

      {/* Model info */}
      <div className="p-3 bg-surface-container-low rounded-xl mb-5 flex items-center gap-2 text-xs text-outline">
        <Cpu size={14} />
        <span>Model: <strong className="text-on-surface">XGBoost v{prediction.model_version || '1.0'}</strong></span>
      </div>

      {/* Probability distribution */}
      {probItems.some(p => p.val > 0) && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Class Probabilities</p>
          <div className="space-y-2.5">
            {probItems.map(p => (
              <div key={p.label}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-on-surface">{p.label}</span>
                  <span className="font-bold" style={{ color: p.color }}>{(p.val * 100).toFixed(1)}%</span>
                </div>
                <div className="h-2 bg-surface-variant rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${p.val * 100}%`, background: p.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdvisoryPanel({ advisory, loading }) {
  if (loading) {
    return (
      <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card flex flex-col items-center justify-center h-40">
        <LoadingSpinner />
        <p className="text-sm mt-3 text-outline">Generating AI Advisory…</p>
      </div>
    );
  }
  if (!advisory) return null;

  return (
    <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-secondary-container rounded-xl">
          <Brain size={18} className="text-on-secondary-container" />
        </div>
        <div>
          <h3 className="font-bold text-on-surface">AI Advisory</h3>
          <p className="text-xs text-outline">RAG-powered recommendations</p>
        </div>
      </div>

      {advisory.advisory && (
        <p className="text-sm text-on-surface leading-relaxed mb-4 p-4 bg-surface-container-low rounded-xl border-l-4 border-primary">
          {advisory.advisory}
        </p>
      )}

      {advisory.actions?.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Recommended Actions</p>
          <ul className="space-y-2">
            {advisory.actions.map((action, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-on-surface">
                <CheckCircle2 size={15} className="text-primary flex-shrink-0 mt-0.5" />
                {action}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default function PredictionPage() {
  const { user } = useAuthStore();
  const [districtId, setDistrictId] = useState(1);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [advisory, setAdvisory] = useState(null);
  const [advisoryLoading, setAdvisoryLoading] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  const districtName = KARNATAKA_DISTRICTS.find(d => d.id === districtId)?.name || 'Unknown';

  const runPrediction = useCallback(async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    setAdvisory(null);
    setHasRun(true);
    try {
      const res = await predictionService.getPrediction(districtId, date);
      setResult(res.data);

      // Fetch advisory if risk is significant
      const riskScore = res.data?.prediction?.risk_score || 0;
      if (riskScore > 0.2) {
        setAdvisoryLoading(true);
        try {
          const adv = await advisoryService.getAdvisory(
            `Heatwave advisory for ${districtName} on ${date}`,
            user?.role,
            districtName
          );
          setAdvisory(adv.data);
        } catch {
          // Advisory failure is non-critical
        } finally {
          setAdvisoryLoading(false);
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [districtId, date, districtName, user?.role]);

  const pred = result?.prediction;
  const weather = result?.weather;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-primary-container rounded-xl">
            <Cpu size={24} className="text-on-primary-container" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-on-surface">Run Prediction</h1>
            <p className="text-sm text-outline">On-demand ML heatwave forecast for any district & date</p>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-surface rounded-2xl border border-surface-variant p-6 shadow-card">
        <div className="flex flex-col md:flex-row items-end gap-4">
          {/* District */}
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
              <MapPin size={12} className="inline mr-1.5" />District
            </label>
            <DistrictSelector selectedDistrict={districtId} onChange={setDistrictId} />
          </div>

          {/* Date */}
          <div className="flex-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-2">
              <Calendar size={12} className="inline mr-1.5" />Forecast Date
            </label>
            <input
              id="prediction-date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2.5 bg-surface-container-low border border-surface-variant rounded-xl text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          {/* Run Button */}
          <button
            id="run-prediction-btn"
            onClick={runPrediction}
            disabled={loading}
            className="flex items-center gap-2.5 px-7 py-3 rounded-xl font-bold text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex-shrink-0"
            style={{
              background: loading ? undefined : 'linear-gradient(135deg, #ff6b35, #9d4300)',
              color: 'white',
              boxShadow: loading ? undefined : '0 4px 20px rgba(157,67,0,0.3)',
            }}
          >
            {loading ? (
              <><Loader2 size={18} className="animate-spin" /> Running…</>
            ) : (
              <><Zap size={18} /> Run Prediction</>
            )}
          </button>
        </div>

        {/* Info note */}
        <div className="flex items-start gap-2.5 mt-4 p-3 bg-surface-container-low rounded-xl text-xs text-outline">
          <Info size={14} className="flex-shrink-0 mt-0.5" />
          <span>
            Predictions are run by the XGBoost ML pipeline using live weather data from the Visual Crossing API. 
            Results include SHAP feature weights, severity tiers, and an AI-generated advisory.
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-2xl">
          <AlertTriangle size={20} />
          <div>
            <p className="font-semibold">{error}</p>
            <button onClick={runPrediction} className="text-sm underline mt-1">Retry</button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="bg-surface rounded-2xl border border-surface-variant p-16 flex flex-col items-center justify-center gap-4 shadow-card">
          <div className="relative">
            <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ffdbc9, #fef1ea)' }}>
              <Cpu size={32} className="text-primary" />
            </div>
            <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-bold text-on-surface">Running ML Pipeline</p>
            <p className="text-sm text-outline mt-1">Fetching weather data and generating heatwave forecast…</p>
          </div>
        </div>
      )}

      {/* Results */}
      {!loading && result && (
        <>
          {/* District & Date Banner */}
          <div className="bg-surface rounded-2xl border border-surface-variant p-5 flex items-center gap-4 shadow-card flex-wrap">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-outline uppercase tracking-wider">Prediction Result</p>
              <h2 className="text-2xl font-black text-on-surface mt-0.5">{result.district_name || districtName}</h2>
              <p className="text-xs text-outline mt-0.5 flex items-center gap-1.5">
                <Calendar size={11} />
                {new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              <span className="text-sm font-semibold text-on-surface">XGBoost v{pred?.model_version || '1.0'}</span>
            </div>
            <button
              onClick={runPrediction}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-variant text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors"
            >
              <RefreshCw size={12} /> Refresh
            </button>
          </div>

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Meter */}
            <div className="flex flex-col gap-6">
              <RiskMeter score={pred?.risk_score} tier={pred?.severity_tier} />
              <PredictionDetails prediction={pred} />
            </div>

            {/* Weather + Advisory */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              <WeatherGrid weather={weather} />
              <AdvisoryPanel advisory={advisory} loading={advisoryLoading} />
            </div>
          </div>

          {/* Alert info */}
          {result.alert && (
            <div className="bg-surface rounded-2xl border border-surface-variant p-5 shadow-card">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-error-container rounded-xl flex-shrink-0">
                  <AlertTriangle size={18} className="text-on-error-container" />
                </div>
                <div>
                  <p className="font-bold text-on-surface">Active Alert</p>
                  <p className="text-sm text-outline mt-1">{result.alert.message}</p>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span className="text-xs px-2 py-0.5 rounded-full bg-error-container text-on-error-container font-bold">
                      {result.alert.risk_level}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-surface-variant text-outline">
                      {result.alert.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Initial empty state */}
      {!loading && !result && !error && !hasRun && (
        <div className="bg-surface rounded-2xl border border-surface-variant p-16 flex flex-col items-center justify-center gap-5 shadow-card text-center">
          <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ffdbc9, #fef1ea)' }}>
            <BarChart2 size={40} className="text-primary opacity-70" />
          </div>
          <div>
            <p className="text-xl font-bold text-on-surface">Ready to Forecast</p>
            <p className="text-outline text-sm mt-2 max-w-sm">
              Select a district and date above, then click <strong>Run Prediction</strong> to generate an AI heatwave forecast.
            </p>
          </div>
          <button
            onClick={runPrediction}
            className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200"
            style={{ background: 'linear-gradient(135deg, #ff6b35, #9d4300)', boxShadow: '0 4px 20px rgba(157,67,0,0.3)' }}
          >
            <Zap size={18} /> Run Now
          </button>
        </div>
      )}
    </div>
  );
}

function Loader2({ size, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  );
}
