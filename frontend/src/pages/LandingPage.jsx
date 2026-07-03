import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Flame, Shield, BarChart3, Bell, Map, Zap, ArrowRight, Users, Activity } from 'lucide-react';

const FEATURES = [
  {
    icon: <Zap size={22} />,
    title: 'AI-Powered Forecasts',
    desc: 'XGBoost ML model predicts heatwave risk up to 7 days in advance across 31 Karnataka districts.',
    color: '#ff6b35',
  },
  {
    icon: <Bell size={22} />,
    title: 'Real-Time Alerts',
    desc: 'Instant heatwave warnings with severity tiers — from Watch to Extreme — issued automatically.',
    color: '#ff9500',
  },
  {
    icon: <Map size={22} />,
    title: 'Interactive Risk Map',
    desc: 'Color-coded district map with live risk scores and weather data at your fingertips.',
    color: '#ea580c',
  },
  {
    icon: <BarChart3 size={22} />,
    title: 'Research Analytics',
    desc: 'SHAP feature analysis, ROC curves, confusion matrices and model metrics for researchers.',
    color: '#dc2626',
  },
  {
    icon: <Shield size={22} />,
    title: 'Role-Based Advisories',
    desc: 'Personalized AI-generated guidance for farmers, travellers, authorities, and the public.',
    color: '#9d4300',
  },
  {
    icon: <Activity size={22} />,
    title: 'Historical Trends',
    desc: '60-day prediction history with searchable records, risk trend charts, and export support.',
    color: '#7c2d00',
  },
];

const STATS = [
  { value: '31', label: 'Districts Covered' },
  { value: '7-Day', label: 'Forecast Window' },
  { value: '86%', label: 'Model Accuracy' },
  { value: '24/7', label: 'Live Monitoring' },
];

const ROLES = [
  { icon: '🌾', label: 'Farmers', desc: 'Crop & livestock safety' },
  { icon: '✈️', label: 'Travellers', desc: 'Route planning' },
  { icon: '🏛️', label: 'Authorities', desc: 'Disaster response' },
  { icon: '🔬', label: 'Researchers', desc: 'Scientific analysis' },
];

export default function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated()) {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#fffbff', fontFamily: "'Inter', sans-serif" }}>

      {/* ── Navbar ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-8 py-4" style={{ background: 'rgba(255,251,255,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(157,67,0,0.12)' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-xl" style={{ background: 'linear-gradient(135deg, #ff6b35, #9d4300)' }}>
            <Flame size={20} color="white" />
          </div>
          <span className="text-2xl font-black" style={{ color: '#9d4300' }}>HEWS</span>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          {['Features', 'Analytics', 'Who it\'s for'].map(item => (
            <a key={item} href={`#${item.toLowerCase().replace(/[^a-z]/g,'')}`}
              className="text-sm font-medium transition-colors"
              style={{ color: '#77574e' }}
              onMouseEnter={e => e.currentTarget.style.color = '#9d4300'}
              onMouseLeave={e => e.currentTarget.style.color = '#77574e'}
            >{item}</a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <Link to="/login"
            className="px-4 py-2 rounded-full text-sm font-bold transition-all duration-200"
            style={{ color: '#9d4300', background: 'transparent' }}
            onMouseEnter={e => e.currentTarget.style.background = '#ffdbc9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >Sign In</Link>
          <Link to="/register"
            className="px-5 py-2 rounded-full text-sm font-bold transition-all duration-200 flex items-center gap-1.5"
            style={{ background: 'linear-gradient(135deg, #ff6b35, #9d4300)', color: 'white', boxShadow: '0 4px 16px rgba(255,107,53,0.35)' }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'none'}
          >
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </header>

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center text-center px-6 py-28 overflow-hidden" style={{ background: 'linear-gradient(160deg, #1a0a00 0%, #3d1200 35%, #7c2d00 65%, #9d4300 100%)' }}>
        {/* Background orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-25" style={{ background: 'radial-gradient(circle, #ff6b35, transparent)' }} />
          <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ff9500, transparent)' }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        <div className="relative max-w-4xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold mb-8" style={{ background: 'rgba(255,107,53,0.2)', border: '1px solid rgba(255,107,53,0.35)', color: '#ff9500' }}>
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#ff6b35' }} />
            Live AI Monitoring · Karnataka, India
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Predict Heatwaves.
            <br />
            <span style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', background: 'linear-gradient(90deg, #ff9500, #ff6b35, #ffdbc9)' }}>
              Save Lives.
            </span>
          </h1>

          <p className="text-lg md:text-xl mb-12 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(255,219,201,0.75)' }}>
            Karnataka's first AI-powered Heatwave Early Warning System. ML predictions, 
            real-time alerts, RAG-powered advisories — all in one platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register"
              className="px-8 py-4 rounded-full font-bold text-lg flex items-center gap-2.5 transition-all duration-300"
              style={{ background: 'linear-gradient(135deg, #ff6b35, #ff9500)', color: 'white', boxShadow: '0 8px 32px rgba(255,107,53,0.45)' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(255,107,53,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(255,107,53,0.45)'; }}
            >
              Join the Platform <ArrowRight size={20} />
            </Link>
            <Link to="/login"
              className="px-8 py-4 rounded-full font-bold text-lg transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative mt-20 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl w-full">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="text-3xl font-black text-white">{s.value}</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,219,201,0.6)' }}>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-24 px-6" style={{ background: '#fffbff' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: '#9d4300', background: '#ffdbc9' }}>Platform Features</span>
            <h2 className="text-4xl font-black mt-4 mb-4" style={{ color: '#201a17' }}>Everything you need to stay safe</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: '#77574e' }}>
              Built for Karnataka's climate challenges, powered by state-of-the-art machine learning.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <div key={f.title} className="group p-6 rounded-2xl transition-all duration-300 cursor-default"
                style={{ background: '#fff', border: '1px solid #f5ded5', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(157,67,0,0.12)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; }}
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-300"
                  style={{ background: `${f.color}18`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="text-lg font-bold mb-2" style={{ color: '#201a17' }}>{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#77574e' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Analytics highlight ── */}
      <section id="analytics" className="py-24 px-6" style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1200 50%, #7c2d00 100%)' }}>
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="flex-1">
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: '#ff9500', background: 'rgba(255,149,0,0.15)', border: '1px solid rgba(255,149,0,0.3)' }}>
              Research-Grade Analytics
            </span>
            <h2 className="text-4xl font-black text-white mt-5 mb-5 leading-tight">
              Transparent AI.<br />
              <span style={{ color: '#ff9500' }}>Explainable results.</span>
            </h2>
            <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(255,219,201,0.7)' }}>
              Don't just get predictions — understand them. SHAP feature importance charts, ROC curves, 
              confusion matrices, and real-time probability distributions give full ML transparency.
            </p>
            <ul className="space-y-3">
              {['SHAP Feature Impact Analysis', 'ROC Curve & AUC Metrics', 'Confusion Matrix Heatmap', 'Risk Class Probability Distribution', 'Model Version Tracking'].map(item => (
                <li key={item} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,219,201,0.8)' }}>
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,107,53,0.25)', border: '1px solid rgba(255,107,53,0.4)' }}>
                    <div className="w-2 h-2 rounded-full" style={{ background: '#ff6b35' }} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[
              { label: 'Weighted F1 Score', value: '84.7%', color: '#ff6b35' },
              { label: 'Overall Accuracy', value: '86.3%', color: '#ff9500' },
              { label: 'Extreme Precision', value: '88.0%', color: '#dc2626' },
              { label: 'Low Class F1', value: '92.0%', color: '#16a34a' },
            ].map(m => (
              <div key={m.label} className="p-5 rounded-2xl" style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)' }}>
                <p className="text-3xl font-black" style={{ color: m.color }}>{m.value}</p>
                <p className="text-xs mt-1" style={{ color: 'rgba(255,219,201,0.5)' }}>{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Who it's for ── */}
      <section id="whoitsfor" className="py-24 px-6" style={{ background: '#fffbff' }}>
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full" style={{ color: '#9d4300', background: '#ffdbc9' }}>Role-Based Access</span>
          <h2 className="text-4xl font-black mt-4 mb-4" style={{ color: '#201a17' }}>Tailored for every stakeholder</h2>
          <p className="text-lg mb-14" style={{ color: '#77574e' }}>One platform, personalised for your specific needs and responsibilities.</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {ROLES.map(r => (
              <div key={r.label} className="p-6 rounded-2xl text-center transition-all duration-300"
                style={{ background: '#fff', border: '1px solid #f5ded5', boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(157,67,0,0.12)'; e.currentTarget.style.borderColor = '#ffdbc9'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'; e.currentTarget.style.borderColor = '#f5ded5'; }}
              >
                <div className="text-4xl mb-3">{r.icon}</div>
                <p className="font-bold" style={{ color: '#201a17' }}>{r.label}</p>
                <p className="text-xs mt-1" style={{ color: '#9c8880' }}>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 text-center" style={{ background: 'linear-gradient(135deg, #ff9500 0%, #ff6b35 50%, #9d4300 100%)' }}>
        <div className="max-w-2xl mx-auto">
          <Users size={48} color="white" className="mx-auto mb-6 opacity-80" />
          <h2 className="text-4xl font-black text-white mb-5">Ready to protect your community?</h2>
          <p className="text-lg mb-10 opacity-80 text-white">
            Join thousands of Karnataka citizens, farmers, and officials using HEWS to stay ahead of extreme heat.
          </p>
          <Link to="/register"
            className="inline-flex items-center gap-2.5 px-10 py-4 rounded-full font-bold text-lg transition-all duration-300"
            style={{ background: 'white', color: '#9d4300', boxShadow: '0 8px 32px rgba(0,0,0,0.2)' }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 12px 40px rgba(0,0,0,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.2)'; }}
          >
            Create Free Account <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="py-8 px-8 flex flex-col md:flex-row items-center justify-between gap-4" style={{ background: '#201a17', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'linear-gradient(135deg, #ff6b35, #9d4300)' }}>
            <Flame size={15} color="white" />
          </div>
          <span className="font-black text-white text-lg">HEWS</span>
        </div>
        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
          Heatwave Early Warning System · Karnataka, India · AI-Powered Climate Intelligence
        </p>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-xs font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>Sign In</Link>
          <Link to="/register" className="text-xs font-medium transition-colors" style={{ color: 'rgba(255,255,255,0.4)' }}>Register</Link>
        </div>
      </footer>
    </div>
  );
}
