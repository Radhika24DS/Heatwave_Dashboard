import React, { useState, useCallback } from 'react';
import { advisoryService } from '../services/advisory.service';
import { predictionService } from '../services/prediction.service';
import { useAuthStore } from '../store/useAuthStore';
import DistrictSelector from '../components/common/DistrictSelector';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Brain, Search, Send, RefreshCw, Info, Sparkles,
  CheckCircle2, AlertTriangle, BookOpen, Shield,
  ChevronDown, ChevronUp, Flame, Leaf, Plane, FlaskConical,
  Building2, Users
} from 'lucide-react';
import { KARNATAKA_DISTRICTS } from '../utils/constants';
import toast from 'react-hot-toast';

const ROLE_CONFIG = {
  PUBLIC:    { label: 'Public',      icon: <Users size={16} />,      color: '#9c8880', bg: '#f8e5db' },
  FARMER:    { label: 'Farmer',      icon: <Leaf size={16} />,       color: '#16a34a', bg: '#f0fdf4' },
  TRAVELLER: { label: 'Traveller',   icon: <Plane size={16} />,      color: '#0ea5e9', bg: '#f0f9ff' },
  RESEARCH:  { label: 'Researcher',  icon: <FlaskConical size={16} />, color: '#7c3aed', bg: '#f5f3ff' },
  AUTHORITY: { label: 'Authority',   icon: <Building2 size={16} />,  color: '#dc2626', bg: '#fef2f2' },
  ADMIN:     { label: 'Admin',       icon: <Shield size={16} />,     color: '#ea580c', bg: '#fff7ed' },
};

const SEVERITY_CONFIG = {
  LOW:      { color: '#16a34a', bg: '#f0fdf4', border: '#bbf7d0' },
  MODERATE: { color: '#ca8a04', bg: '#fefce8', border: '#fde68a' },
  HIGH:     { color: '#ea580c', bg: '#fff7ed', border: '#fed7aa' },
  EXTREME:  { color: '#dc2626', bg: '#fef2f2', border: '#fecaca' },
};

const PRESET_QUERIES = [
  { icon: '🌡️', label: 'General precautions',     query: 'What are the general precautions during a heatwave?' },
  { icon: '🌾', label: 'Farmer safety',             query: 'Heatwave safety tips for farmers working outdoors' },
  { icon: '✈️', label: 'Travel advisory',           query: 'Travel advice and safety during extreme heat warning' },
  { icon: '👶', label: 'Children & elderly',        query: 'How to protect children and elderly during a heatwave?' },
  { icon: '🐄', label: 'Livestock management',      query: 'Protect livestock and crops during extreme heat conditions' },
  { icon: '🏥', label: 'Heat stroke symptoms',      query: 'Signs of heat stroke and emergency response steps' },
];

function AdvisoryCard({ advisory, role }) {
  const [expanded, setExpanded] = useState(true);
  const roleCfg = ROLE_CONFIG[role?.toUpperCase()] || ROLE_CONFIG.PUBLIC;

  return (
    <div className="bg-surface rounded-2xl border border-surface-variant shadow-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-surface-variant" style={{ background: roleCfg.bg }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'white', color: roleCfg.color, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            {roleCfg.icon}
          </div>
          <div>
            <p className="font-bold text-on-surface">{advisory.title || 'Heatwave Advisory'}</p>
            <p className="text-xs" style={{ color: roleCfg.color }}>Personalized for {roleCfg.label}</p>
          </div>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          className="p-1.5 rounded-lg hover:bg-surface-variant transition-colors"
        >
          {expanded ? <ChevronUp size={16} className="text-outline" /> : <ChevronDown size={16} className="text-outline" />}
        </button>
      </div>

      {expanded && (
        <div className="p-6 space-y-5">
          {/* Main advisory text */}
          {advisory.advisory && (
            <div className="p-4 rounded-xl bg-surface-container-low border-l-4" style={{ borderColor: '#9d4300' }}>
              <div className="flex items-start gap-2 mb-2">
                <Sparkles size={14} className="text-primary flex-shrink-0 mt-0.5" />
                <p className="text-xs font-bold text-outline uppercase tracking-wider">AI Advisory</p>
              </div>
              <p className="text-sm text-on-surface leading-relaxed">{advisory.advisory}</p>
            </div>
          )}

          {/* Actions */}
          {advisory.actions?.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle2 size={14} className="text-primary" />
                <p className="text-xs font-bold text-outline uppercase tracking-wider">Recommended Actions</p>
              </div>
              <ul className="space-y-2.5">
                {advisory.actions.map((action, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-on-surface">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold flex-shrink-0 mt-0.5"
                      style={{ background: '#ffdbc9', color: '#9d4300' }}>
                      {i + 1}
                    </span>
                    {action}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Source */}
          {advisory.source && advisory.source !== 'Fallback' && (
            <div className="flex items-center gap-2 text-xs text-outline pt-3 border-t border-surface-variant">
              <BookOpen size={12} />
              <span>Source: {advisory.source}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function AdvisoryPage() {
  const { user } = useAuthStore();
  const [query, setQuery] = useState('');
  const [districtId, setDistrictId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [advisory, setAdvisory] = useState(null);
  const [error, setError] = useState(null);
  const [history, setHistory] = useState([]);
  const [persona, setPersona] = useState(user?.role || 'PUBLIC');

  const districtName = KARNATAKA_DISTRICTS.find(d => d.id === districtId)?.name || 'Unknown';

  const fetchAdvisory = useCallback(async (queryText) => {
    const q = queryText || query;
    if (!q.trim()) {
      toast.error('Please enter a query or select a preset topic.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await advisoryService.getAdvisory(q, persona, districtName);
      const adv = res.data;
      setAdvisory(adv);
      setHistory(prev => [{ query: q, advisory: adv, timestamp: new Date().toLocaleTimeString('en-IN') }, ...prev.slice(0, 4)]);
    } catch (err) {
      setError('Failed to generate advisory. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [query, persona, districtName]);

  const handlePreset = (presetQuery) => {
    setQuery(presetQuery);
    fetchAdvisory(presetQuery);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchAdvisory(query);
  };

  const roleCfg = ROLE_CONFIG[persona?.toUpperCase()] || ROLE_CONFIG.PUBLIC;

  return (
    <div className="flex flex-col gap-6 p-6 max-w-[1440px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl" style={{ background: 'linear-gradient(135deg, #ffdbc9, #fef1ea)' }}>
            <Brain size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-on-surface">AI Advisory</h1>
            <p className="text-sm text-outline">RAG-powered heatwave guidance from curated knowledge base</p>
          </div>
        </div>

        {/* Dynamic persona selection / role badge */}
        <div className="flex items-center gap-2">
          {user?.role === 'PUBLIC' ? (
            <div className="flex items-center gap-2.5 bg-white border border-stone-250 rounded-full px-3.5 py-1.5 shadow-sm">
              <span className="text-xs font-black uppercase text-stone-500">Demographic:</span>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value)}
                className="bg-transparent text-xs font-black text-[#9d4300] focus:outline-none cursor-pointer"
              >
                <option value="PUBLIC">👥 General Public</option>
                <option value="FARMER">🌾 Farmer</option>
                <option value="TRAVELLER">✈️ Traveller</option>
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ background: roleCfg.bg, color: roleCfg.color, border: `1px solid ${roleCfg.color}30` }}>
              {roleCfg.icon}
              <span className="text-sm font-bold">Personalized for {roleCfg.label}</span>
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="flex items-start gap-3 p-4 bg-secondary-container text-on-secondary-container rounded-2xl text-sm">
        <Info size={16} className="flex-shrink-0 mt-0.5" />
        <p>
          Ask any heatwave-related question. The AI retrieves relevant content from our expert knowledge base 
          and generates a personalized advisory tailored to your preference as <strong>{roleCfg.label}</strong>.
          Select a district for location-specific context.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Query Panel */}
        <div className="flex flex-col gap-5">
          {/* District Selector */}
          <div className="bg-surface rounded-2xl border border-surface-variant p-5 shadow-card">
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-3">
              Location Context
            </label>
            <DistrictSelector selectedDistrict={districtId} onChange={setDistrictId} />
          </div>

          {/* Query Input */}
          <div className="bg-surface rounded-2xl border border-surface-variant p-5 shadow-card">
            <label className="block text-xs font-bold uppercase tracking-wider text-outline mb-3">
              Ask a Question
            </label>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <textarea
                id="advisory-query"
                rows={4}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="e.g. What precautions should farmers take during extreme heat in Bengaluru?"
                className="w-full px-4 py-3 bg-surface-container-low border border-surface-variant rounded-xl text-sm text-on-surface placeholder-outline focus:outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              />
              <button
                id="advisory-submit"
                type="submit"
                disabled={loading || !query.trim()}
                className="flex items-center justify-center gap-2 py-3 rounded-xl font-bold text-sm text-white transition-all duration-200 disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #ff6b35, #9d4300)', boxShadow: '0 4px 16px rgba(157,67,0,0.25)' }}
              >
                {loading ? <LoadingSpinner /> : <Send size={16} />}
                {loading ? 'Generating…' : 'Get Advisory'}
              </button>
            </form>
          </div>

          {/* Preset Topics */}
          <div className="bg-surface rounded-2xl border border-surface-variant p-5 shadow-card">
            <p className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Quick Topics</p>
            <div className="flex flex-col gap-2">
              {PRESET_QUERIES.map(p => (
                <button
                  key={p.label}
                  onClick={() => handlePreset(p.query)}
                  disabled={loading}
                  className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-left text-sm transition-all duration-200 border border-transparent hover:border-outline-variant disabled:opacity-50"
                  style={{ background: 'transparent' }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#fef1ea'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <span className="text-lg flex-shrink-0">{p.icon}</span>
                  <span className="text-on-surface font-medium">{p.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Advisory Output */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Error */}
          {error && (
            <div className="flex items-center gap-3 p-4 bg-error-container text-on-error-container rounded-2xl">
              <AlertTriangle size={20} />
              <div>
                <p className="font-semibold">{error}</p>
                <button onClick={() => fetchAdvisory(query)} className="text-sm underline mt-1">Retry</button>
              </div>
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="bg-surface rounded-2xl border border-surface-variant p-16 flex flex-col items-center justify-center gap-4 shadow-card">
              <div className="relative">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ffdbc9, #fef1ea)' }}>
                  <Brain size={32} className="text-primary" />
                </div>
                <div className="absolute inset-0 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <div className="text-center">
                <p className="font-bold text-on-surface">Generating Advisory</p>
                <p className="text-sm text-outline mt-1">Searching knowledge base and synthesizing guidance…</p>
              </div>
            </div>
          )}

          {/* Current Advisory */}
          {!loading && advisory && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={16} className="text-primary" />
                <p className="text-sm font-bold text-on-surface">Latest Advisory</p>
                <span className="text-xs text-outline">for {districtName}</span>
              </div>
              <AdvisoryCard advisory={advisory} role={user?.role} />
            </div>
          )}

          {/* History */}
          {!loading && history.length > 1 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-outline mb-3">Previous Advisories</p>
              <div className="flex flex-col gap-3">
                {history.slice(1).map((item, i) => (
                  <div key={i} className="bg-surface-container-low rounded-2xl border border-surface-variant p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <p className="text-sm font-semibold text-on-surface flex-1">{item.query}</p>
                      <span className="text-xs text-outline flex-shrink-0">{item.timestamp}</span>
                    </div>
                    {item.advisory?.advisory && (
                      <p className="text-xs text-outline line-clamp-2">{item.advisory.advisory}</p>
                    )}
                    <button
                      onClick={() => { setAdvisory(item.advisory); setQuery(item.query); }}
                      className="mt-2 text-xs text-primary font-semibold hover:underline flex items-center gap-1"
                    >
                      <RefreshCw size={11} /> View full advisory
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty state */}
          {!loading && !advisory && !error && (
            <div className="bg-surface rounded-2xl border border-surface-variant p-16 flex flex-col items-center justify-center gap-5 shadow-card text-center">
              <div className="w-20 h-20 rounded-3xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ffdbc9, #fef1ea)' }}>
                <Brain size={40} className="text-primary opacity-70" />
              </div>
              <div>
                <p className="text-xl font-bold text-on-surface">Ask the AI</p>
                <p className="text-outline text-sm mt-2 max-w-sm">
                  Type a question about heatwave safety or pick a preset topic to get personalized, 
                  knowledge-base-grounded guidance.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {PRESET_QUERIES.slice(0, 3).map(p => (
                  <button
                    key={p.label}
                    onClick={() => handlePreset(p.query)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                    style={{ background: '#ffdbc9', color: '#9d4300' }}
                  >
                    {p.icon} {p.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
