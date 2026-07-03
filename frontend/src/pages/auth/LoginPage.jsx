import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth.service';
import { Eye, EyeOff, Flame, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setToken } = useAuthStore();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res.status === 'success') {
        setToken(res.data.access_token);
        toast.success('Welcome back!');
        navigate('/app/dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1200 35%, #7c2d00 65%, #9d4300 100%)' }}>
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-80 h-80 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ff6b35, transparent)', animation: 'pulse 4s ease-in-out infinite' }} />
        <div className="absolute bottom-[-10%] right-[-5%] w-96 h-96 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ff9500, transparent)', animation: 'pulse 5s ease-in-out infinite 1s' }} />
        <div className="absolute top-[40%] right-[10%] w-64 h-64 rounded-full opacity-10" style={{ background: 'radial-gradient(circle, #ff4500, transparent)', animation: 'pulse 6s ease-in-out infinite 2s' }} />
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-lg" style={{ background: 'linear-gradient(135deg, #ff6b35, #9d4300)', boxShadow: '0 8px 32px rgba(255,107,53,0.4)' }}>
            <Flame size={32} color="white" />
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight">HEWS</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,219,201,0.7)' }}>Heatwave Early Warning System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-8 shadow-2xl" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-white">Welcome back</h2>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,219,201,0.6)' }}>Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,219,201,0.8)' }}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,219,201,0.5)' }} />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,219,201,0.2)',
                    color: 'white',
                  }}
                  onFocus={(e) => { e.target.style.border = '1px solid rgba(255,107,53,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.15)'; }}
                  onBlur={(e) => { e.target.style.border = '1px solid rgba(255,219,201,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,219,201,0.8)' }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,219,201,0.5)' }} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl text-sm transition-all duration-200 focus:outline-none"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,219,201,0.2)',
                    color: 'white',
                  }}
                  onFocus={(e) => { e.target.style.border = '1px solid rgba(255,107,53,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.15)'; }}
                  onBlur={(e) => { e.target.style.border = '1px solid rgba(255,219,201,0.2)'; e.target.style.boxShadow = 'none'; }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,219,201,0.5)' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = 'white'}
                  onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255,219,201,0.5)'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60"
              style={{
                background: loading ? 'rgba(157,67,0,0.7)' : 'linear-gradient(135deg, #ff6b35, #9d4300)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255,107,53,0.35)',
              }}
              onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; if (!loading) e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,107,53,0.45)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,107,53,0.35)'; }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm" style={{ color: 'rgba(255,219,201,0.5)' }}>
            Don't have an account?{' '}
            <Link to="/register" className="font-bold transition-colors" style={{ color: '#ff9500' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#ffb347'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#ff9500'}
            >
              Register now
            </Link>
          </p>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,219,201,0.3)' }}>
          Karnataka Heatwave EWS · AI-Powered Climate Intelligence
        </p>
      </div>
    </div>
  );
}
