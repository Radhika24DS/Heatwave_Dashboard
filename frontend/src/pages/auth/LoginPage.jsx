import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { authService } from '../../services/auth.service';
import Logo from '../../components/layout/Logo';
import { Eye, EyeOff, Lock, Mail, Loader2, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const { setToken } = useAuthStore();
  const navigate = useNavigate();

  // Load remembered email
  useEffect(() => {
    const rememberedEmail = localStorage.getItem('samvit_remembered_email');
    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password.');
      return;
    }

    startTransition(async () => {
      try {
        const res = await authService.login(email, password);
        if (res.status === 'success') {
          setToken(res.data.access_token);
          
          if (rememberMe) {
            localStorage.setItem('samvit_remembered_email', email);
          } else {
            localStorage.removeItem('samvit_remembered_email');
          }
          
          toast.success('Welcome back to SAMVIT!');
          navigate('/app/dashboard');
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || 'Invalid email or password.';
        toast.error(errMsg);
      }
    });
  };

  return (
    <div className="min-h-screen flex bg-[#fafaf9] text-[#1c1917]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Left Panel (Static / Brand) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#f97316] via-[#d97706] to-[#dc2626] text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Animated background orbs */}
        <div className="absolute inset-0 pointer-events-none opacity-30">
          <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full bg-yellow-400 filter blur-3xl animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] rounded-full bg-red-400 filter blur-3xl animate-pulse" style={{ animationDelay: '2.5s' }} />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="p-1 bg-white/10 rounded-xl">
            <Logo className="h-10 w-10 text-white" />
          </div>
          <span className="text-3xl font-black tracking-tight">SAMVIT</span>
        </div>

        <div className="relative z-10 max-w-lg my-auto space-y-6">
          <h1 className="text-4xl md:text-5xl font-black leading-tight">
            Karnataka's AI Heatwave warning engine
          </h1>
          <p className="text-lg opacity-90 font-medium">
            "Awareness is protection. Access crop-specific insights, travel planners, and district rankings in real-time."
          </p>
          <div className="border-l-4 border-yellow-300 pl-4 py-2 italic opacity-85 text-sm">
            Powered by state-of-the-art XGBoost algorithms and RAG safety documents.
          </div>
        </div>

        <div className="relative z-10 text-xs opacity-75 font-semibold uppercase tracking-wider">
          SAMVIT © 2026 · Climate Intelligence Portal
        </div>
      </div>

      {/* ── Right Panel (Form) ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8 flex flex-col items-center">
            <Logo className="h-12 w-12 text-[#f97316] mb-3" />
            <h1 className="text-3xl font-black text-[#9d4300] tracking-tight">SAMVIT</h1>
            <p className="text-xs text-stone-500 uppercase font-black tracking-widest mt-1">Heatwave Early Warning System</p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#f5f1ed] p-1.5 rounded-full border border-[#d6ccc4]/60">
            <button
              className="flex-1 py-2.5 text-sm font-bold text-center rounded-full bg-white text-[#1c1917] shadow-sm cursor-pointer"
            >
              Sign In
            </button>
            <Link
              to="/register"
              className="flex-1 py-2.5 text-sm font-bold text-stone-600 text-center rounded-full hover:text-[#1c1917] cursor-pointer"
            >
              Sign Up
            </Link>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1c1917]">Welcome Back</h2>
            <p className="text-sm mt-1 text-stone-500 font-medium">Sign in to access your dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email input */}
            <div className="space-y-1.5">
              <label className="block text-sm font-semibold text-stone-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#d6ccc4] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 rounded-xl text-sm font-medium transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-semibold text-stone-700">Password</label>
                <a href="#forgot" className="text-xs font-bold text-[#f97316] hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-[#d6ccc4] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 rounded-xl text-sm font-medium transition-all focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-stone-300 text-[#f97316] focus:ring-[#f97316] accent-[#f97316]"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs font-semibold text-stone-600 select-none cursor-pointer">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              id="login-submit"
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-[#f97316] hover:bg-[#d97706] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 disabled:opacity-60 cursor-pointer active:scale-100 transition-none"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {isPending ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-stone-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-bold text-[#f97316] hover:underline">
              Sign up now
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

