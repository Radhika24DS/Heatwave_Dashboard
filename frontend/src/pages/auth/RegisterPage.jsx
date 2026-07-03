import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { Eye, EyeOff, Flame, Lock, Mail, User, Shield, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'PUBLIC',    label: 'Public',      desc: 'General citizen',          icon: '🏙️' },
  { value: 'FARMER',   label: 'Farmer',       desc: 'Agriculture & rural',       icon: '🌾' },
  { value: 'TRAVELLER',label: 'Traveller',    desc: 'Travel planning & safety',  icon: '✈️' },
  { value: 'RESEARCH', label: 'Researcher',   desc: 'Scientific analytics',      icon: '🔬' },
  { value: 'AUTHORITY',label: 'Authority',    desc: 'Government & disaster mgmt',icon: '🏛️' },
];

export default function RegisterPage() {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'PUBLIC' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      await authService.register(formData);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const set = (key, val) => setFormData(f => ({ ...f, [key]: val }));

  const inputStyle = {
    background: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,219,201,0.2)',
    color: 'white',
  };
  const onFocus = (e) => { e.target.style.border = '1px solid rgba(255,107,53,0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(255,107,53,0.15)'; };
  const onBlur  = (e) => { e.target.style.border = '1px solid rgba(255,219,201,0.2)'; e.target.style.boxShadow = 'none'; };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a0a00 0%, #3d1200 35%, #7c2d00 65%, #9d4300 100%)' }}>
      {/* Background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] right-[-5%] w-96 h-96 rounded-full opacity-20" style={{ background: 'radial-gradient(circle, #ff6b35, transparent)', animation: 'pulse 4s ease-in-out infinite' }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-80 h-80 rounded-full opacity-15" style={{ background: 'radial-gradient(circle, #ff9500, transparent)', animation: 'pulse 5s ease-in-out infinite 1.5s' }} />
        <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-3 shadow-lg" style={{ background: 'linear-gradient(135deg, #ff6b35, #9d4300)', boxShadow: '0 8px 32px rgba(255,107,53,0.4)' }}>
            <Flame size={28} color="white" />
          </div>
          <h1 className="text-3xl font-black text-white tracking-tight">Create Account</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,219,201,0.6)' }}>Join the Heatwave Early Warning System</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl p-7 shadow-2xl" style={{ background: 'rgba(255,255,255,0.07)', backdropFilter: 'blur(24px)', WebkitBackdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.12)' }}>
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,219,201,0.8)' }}>Full Name</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,219,201,0.5)' }} />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={formData.name}
                  onChange={e => set('name', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,219,201,0.8)' }}>Email Address</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,219,201,0.5)' }} />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={e => set('email', e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium mb-1.5" style={{ color: 'rgba(255,219,201,0.8)' }}>Password</label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,219,201,0.5)' }} />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  value={formData.password}
                  onChange={e => set('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-2.5 rounded-xl text-sm focus:outline-none transition-all"
                  style={inputStyle}
                  onFocus={onFocus}
                  onBlur={onBlur}
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-colors"
                  style={{ color: 'rgba(255,219,201,0.5)' }}>
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {formData.password.length > 0 && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <div className="flex gap-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 w-8 rounded-full transition-all duration-300"
                        style={{ background: formData.password.length >= i * 3 ? (formData.password.length >= 10 ? '#22c55e' : '#ff9500') : 'rgba(255,255,255,0.15)' }} />
                    ))}
                  </div>
                  <span className="text-xs" style={{ color: 'rgba(255,219,201,0.5)' }}>
                    {formData.password.length < 8 ? 'Too short' : formData.password.length < 12 ? 'Good' : 'Strong'}
                  </span>
                </div>
              )}
            </div>

            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: 'rgba(255,219,201,0.8)' }}>
                <Shield size={13} className="inline mr-1" />
                Account Type
              </label>
              <div className="grid grid-cols-1 gap-2">
                {ROLES.map(role => (
                  <button
                    key={role.value}
                    type="button"
                    id={`role-${role.value.toLowerCase()}`}
                    onClick={() => set('role', role.value)}
                    className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-left transition-all duration-200"
                    style={{
                      background: formData.role === role.value ? 'rgba(255,107,53,0.25)' : 'rgba(255,255,255,0.06)',
                      border: formData.role === role.value ? '1px solid rgba(255,107,53,0.5)' : '1px solid rgba(255,219,201,0.12)',
                      boxShadow: formData.role === role.value ? '0 0 0 1px rgba(255,107,53,0.2)' : 'none',
                    }}
                  >
                    <span className="text-xl flex-shrink-0">{role.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white">{role.label}</p>
                      <p className="text-xs" style={{ color: 'rgba(255,219,201,0.5)' }}>{role.desc}</p>
                    </div>
                    {formData.role === role.value && (
                      <CheckCircle size={16} style={{ color: '#ff6b35', flexShrink: 0 }} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              id="reg-submit"
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all duration-200 disabled:opacity-60 mt-2"
              style={{
                background: 'linear-gradient(135deg, #ff6b35, #9d4300)',
                color: 'white',
                boxShadow: '0 4px 20px rgba(255,107,53,0.35)',
              }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(255,107,53,0.45)'; } }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(255,107,53,0.35)'; }}
            >
              {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm" style={{ color: 'rgba(255,219,201,0.5)' }}>
            Already have an account?{' '}
            <Link to="/login" className="font-bold" style={{ color: '#ff9500' }}>Sign in</Link>
          </p>
        </div>

        <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,219,201,0.3)' }}>
          Karnataka Heatwave EWS · AI-Powered Climate Intelligence
        </p>
      </div>
    </div>
  );
}
