import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Mail, Lock, AlertTriangle, Eye, EyeOff, ChevronRight } from 'lucide-react';
import Card from '../../components/ui/Card';
import Logo from '../../components/layout/Logo';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const TEST_ACCOUNTS = [
  { label: 'Admin',     email: 'admin@heatwave.org',      color: 'text-purple-400' },
  { label: 'Authority', email: 'authority@heatwave.org',  color: 'text-blue-400'   },
  { label: 'Research',  email: 'researcher@heatwave.org', color: 'text-cyan-400'   },
  { label: 'Farmer',    email: 'farmer@heatwave.org',     color: 'text-risk-low'   },
  { label: 'Traveller', email: 'traveller@heatwave.org',  color: 'text-risk-moderate' },
  { label: 'Public',    email: 'public@heatwave.org',     color: 'text-brand-muted' },
];

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result.success) {
      const token = localStorage.getItem('access_token');
      if (token) {
        const role = JSON.parse(atob(token.split('.')[1])).role;
        const r = role.toUpperCase();
        if (r === 'ADMIN') navigate('/dashboard/admin');
        else if (r === 'AUTHORITY') navigate('/dashboard/authority');
        else if (r === 'RESEARCH') navigate('/research');
        else if (r === 'FARMER') navigate('/farmer');
        else if (r === 'TRAVELLER') navigate('/traveller');
        else navigate('/dashboard/public');
      } else navigate('/dashboard/public');
    } else {
      setApiError(result.error);
    }
  };

  const fillTestAccount = (email) => {
    setValue('email', email);
    setValue('password', 'password123');
    setApiError('');
  };

  return (
    <div className="min-h-screen flex bg-brand-bg overflow-hidden">
      {/* ── Left panel: branding visual ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative p-12 bg-heat-dark overflow-hidden">
        {/* Radial heat glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-brand-primary/15 blur-[100px]" />
          <div className="absolute top-1/4 right-0 w-[300px] h-[300px] rounded-full bg-brand-yellow/10 blur-[80px]" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center max-w-sm">
          <div className="flex h-20 w-20 mx-auto items-center justify-center rounded-2xl bg-brand-primary/10 border border-brand-primary/30 heat-ring mb-8">
            <Logo className="h-12 w-12" />
          </div>
          <h1 className="font-heading text-4xl font-black mb-3 gradient-text">
            HeatWave AI
          </h1>
          <p className="text-brand-muted text-lg mb-8 leading-relaxed">
            Karnataka Early Warning System
          </p>

          {/* Feature list */}
          <div className="space-y-3 text-left">
            {[
              '🛰️  Real-time AOD & IMD meteorological data',
              '🤖  AI-based 3-day heatwave forecasting',
              '📋  Role-tailored advisories for all users',
              '🗺️  District-level risk mapping of Karnataka',
            ].map((f) => (
              <div key={f} className="flex items-start gap-2 text-sm text-brand-muted">
                <span>{f}</span>
              </div>
            ))}
          </div>

          {/* PG badge */}
          <div className="mt-10 inline-flex items-center gap-2 bg-brand-card border border-brand-border rounded-full px-4 py-2 text-xs text-brand-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-risk-low animate-pulse" />
            PG Research Project · Department of CS
          </div>
        </div>
      </div>

      {/* ── Right panel: login form ──────────────────────────── */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-12 relative">
        <div className="w-full max-w-sm relative z-10">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-brand-primary/10 border border-brand-primary/30 heat-ring mb-3">
              <Logo className="h-7 w-7" />
            </div>
            <h1 className="font-heading text-2xl font-black gradient-text">HeatWave AI EWS</h1>
          </div>
          <h2 className="font-heading text-2xl font-bold text-brand-text mb-1">Welcome back</h2>
          <p className="text-sm text-brand-muted mb-8">Sign in to your account to continue</p>
          <Card title="Sign In" className="glass-sm p-6">
            {/* Error banner */}
            {apiError && (
              <div className="mb-5 flex items-center gap-2 rounded-xl bg-risk-extreme/10 border border-risk-extreme/30 px-4 py-3 text-sm text-red-300">
                <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                {apiError}
              </div>
            )}
            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              {/* Email */}
              <div>
                <label htmlFor="login-email" className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-faint pointer-events-none" />
                  <input id="login-email" type="email" placeholder="you@example.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-brand-card border rounded-xl text-sm text-brand-text placeholder-brand-faint focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/50 transition-all ${errors.email ? 'border-risk-extreme' : 'border-brand-border'}`}
                    {...register('email')}
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-risk-extreme">{errors.email.message}</p>}
              </div>
              {/* Password */}
              <div>
                <label htmlFor="login-password" className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-faint pointer-events-none" />
                  <input id="login-password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-brand-card border rounded-xl text-sm text-brand-text placeholder-brand-faint focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/50 transition-all ${errors.password ? 'border-risk-extreme' : 'border-brand-border'}`}
                    {...register('password')}
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-faint hover:text-brand-muted transition-colors">
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-risk-extreme">{errors.password.message}</p>}
              </div>
              {/* Submit */}
              <button type="submit" disabled={loading}
                className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-mid focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50 transition-all shadow-heat">
                {loading ? (
                  <>
                    <span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    Authenticating…
                  </>
                ) : (
                  <>Sign In <ChevronRight className="h-4 w-4" /></>
                )}
              </button>
            </form>
            <p className="mt-6 text-center text-sm text-brand-muted">
              Don't have an account? <Link to="/register" className="font-semibold text-brand-primary hover:text-brand-mid transition-colors">Register here</Link>
            </p>
            {/* Quick-fill test accounts */}
            <div className="mt-8 glass-sm p-4">
              <p className="text-[10px] text-brand-faint uppercase font-bold tracking-widest mb-3">🎓 Viva / Demo Test Accounts (auto-fill)</p>
              <div className="grid grid-cols-3 gap-1.5">
                {TEST_ACCOUNTS.map(({ label, email, color }) => (
                  <button key={email} type="button" onClick={() => fillTestAccount(email)}
                    className="py-1.5 px-2 rounded-lg bg-brand-card hover:bg-brand-border border border-brand-border text-[11px] font-semibold transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] hover:border-brand-primary/40 text-center">
                    <span className={color}>{label}</span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-brand-faint text-center">Password auto-filled as <code className="text-brand-muted">password123</code></p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
