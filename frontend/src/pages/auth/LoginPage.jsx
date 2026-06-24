import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Shield, Mail, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    const result = await login(data.email, data.password);
    setLoading(false);

    if (result.success) {
      // Fetch user role to route appropriately
      const token = localStorage.getItem('access_token');
      if (token) {
        // Decode role from token (already done in context)
        const role = localStorage.getItem('access_token') ? JSON.parse(atob(token.split('.')[1])).role : 'PUBLIC';
        
        // Redirect to role dashboard
        const uppercaseRole = role.toUpperCase();
        if (uppercaseRole === 'ADMIN') navigate('/admin');
        else if (uppercaseRole === 'AUTHORITY') navigate('/authority');
        else if (uppercaseRole === 'RESEARCH') navigate('/research');
        else if (uppercaseRole === 'FARMER') navigate('/farmer');
        else if (uppercaseRole === 'TRAVELLER') navigate('/traveller');
        else navigate('/public');
      } else {
        navigate('/public');
      }
    } else {
      setApiError(result.error);
    }
  };

  const handleTestLogin = (email) => {
    setValue('email', email);
    setValue('password', 'password123');
    setApiError('');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-risk-extreme opacity-5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-risk-moderate opacity-5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-slate border border-brand-border text-risk-high shadow-lg">
            <Shield className="h-9 w-9" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-text">
            Heatwave Warning Portal
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            Real-Time AI-Based Prediction & Early Warning System
          </p>
        </div>

        <div className="bg-brand-navy border border-brand-border rounded-xl p-8 shadow-2xl backdrop-blur-md bg-opacity-95">
          {apiError && (
            <div className="mb-6 flex items-center space-x-2 rounded-lg bg-red-900/30 border border-red-500/50 p-4 text-sm text-red-200">
              <AlertTriangle className="h-5 w-5 text-risk-extreme flex-shrink-0" />
              <span>{apiError}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-brand-muted mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                  <Mail className="h-5 w-5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className={`w-full pl-10 pr-3 py-2.5 bg-brand-dark border rounded-lg focus:outline-none focus:ring-2 focus:ring-risk-high focus:border-transparent text-brand-text placeholder-brand-muted/50 ${
                    errors.email ? 'border-risk-extreme' : 'border-brand-border'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-risk-extreme font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-brand-muted mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                  <Lock className="h-5 w-5" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-10 py-2.5 bg-brand-dark border rounded-lg focus:outline-none focus:ring-2 focus:ring-risk-high focus:border-transparent text-brand-text placeholder-brand-muted/50 ${
                    errors.password ? 'border-risk-extreme' : 'border-brand-border'
                  }`}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-brand-muted hover:text-brand-text focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1 text-xs text-risk-extreme font-medium">{errors.password.message}</p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-risk-high hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-risk-high disabled:opacity-50 transition-colors shadow-lg shadow-risk-high/20"
              >
                {loading ? 'Authenticating...' : 'Sign In'}
              </button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-brand-muted">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-risk-high hover:text-orange-400 transition-colors">
                Register here
              </Link>
            </p>
          </div>
        </div>

        {/* Viva Test Account Credentials Quick-Click Section */}
        <div className="bg-brand-navy/60 border border-brand-border/60 rounded-xl p-5 shadow-lg backdrop-blur-sm">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-muted mb-3 flex items-center">
            <Shield className="h-4 w-4 mr-1 text-risk-moderate" /> Viva Test Accounts (Auto-role map)
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              onClick={() => handleTestLogin('admin@heatwave.org')}
              className="py-2 px-2.5 bg-brand-slate hover:bg-brand-border rounded border border-brand-border text-left hover:text-white transition-colors"
            >
              <span className="font-semibold block text-brand-text">ADMIN</span>
              <span className="text-[10px] text-brand-muted">admin@heatwave.org</span>
            </button>
            <button
              onClick={() => handleTestLogin('authority@heatwave.org')}
              className="py-2 px-2.5 bg-brand-slate hover:bg-brand-border rounded border border-brand-border text-left hover:text-white transition-colors"
            >
              <span className="font-semibold block text-brand-text">AUTHORITY</span>
              <span className="text-[10px] text-brand-muted">authority@heatwave.org</span>
            </button>
            <button
              onClick={() => handleTestLogin('researcher@heatwave.org')}
              className="py-2 px-2.5 bg-brand-slate hover:bg-brand-border rounded border border-brand-border text-left hover:text-white transition-colors"
            >
              <span className="font-semibold block text-brand-text">RESEARCH</span>
              <span className="text-[10px] text-brand-muted">researcher@heatwave.org</span>
            </button>
            <button
              onClick={() => handleTestLogin('farmer@heatwave.org')}
              className="py-2 px-2.5 bg-brand-slate hover:bg-brand-border rounded border border-brand-border text-left hover:text-white transition-colors"
            >
              <span className="font-semibold block text-brand-text">FARMER</span>
              <span className="text-[10px] text-brand-muted">farmer@heatwave.org</span>
            </button>
            <button
              onClick={() => handleTestLogin('traveller@heatwave.org')}
              className="py-2 px-2.5 bg-brand-slate hover:bg-brand-border rounded border border-brand-border text-left hover:text-white transition-colors"
            >
              <span className="font-semibold block text-brand-text">TRAVELLER</span>
              <span className="text-[10px] text-brand-muted">traveller@heatwave.org</span>
            </button>
            <button
              onClick={() => handleTestLogin('public@heatwave.org')}
              className="py-2 px-2.5 bg-brand-slate hover:bg-brand-border rounded border border-brand-border text-left hover:text-white transition-colors"
            >
              <span className="font-semibold block text-brand-text">PUBLIC</span>
              <span className="text-[10px] text-brand-muted">public@heatwave.org</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
