import React, { useState, useEffect, useTransition } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { districtService } from '../../services/district.service';
import Logo from '../../components/layout/Logo';
import { Eye, EyeOff, Lock, Mail, User, Shield, Loader2, ArrowRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ROLES = [
  { value: 'PUBLIC', label: 'Public User (Citizen)', icon: '🏙️' },
  { value: 'AUTHORITY', label: 'Authority (Govt & Disaster Mgmt)', icon: '🏛️' },
];

const CROPS = [
  'Cotton',
  'Tomato / Pepper / Eggplant',
  'Chilli / Okra / Cucurbits',
  'Bitter Gourd',
  'Mango / Litchi / Citrus / Guava / Papaya',
  'Groundnut',
  'Pulses (Tur / Moong)',
  'Paddy',
  'Maize',
  'Leafy Vegetables (Lettuce/Spinach)'
];

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('PUBLIC');
  const [districtId, setDistrictId] = useState('');
  const [cropType, setCropType] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [districts, setDistricts] = useState([]);
  
  const [isPending, startTransition] = useTransition();
  const navigate = useNavigate();

  // Fetch and cache districts list
  useEffect(() => {
    const loadDistricts = async () => {
      try {
        const cached = localStorage.getItem('samvit_districts_cache');
        if (cached) {
          setDistricts(JSON.parse(cached));
          return;
        }

        const res = await districtService.getAll();
        if (res.status === 'success' && Array.isArray(res.data)) {
          setDistricts(res.data);
          localStorage.setItem('samvit_districts_cache', JSON.stringify(res.data));
        }
      } catch (err) {
        console.error("Failed to load districts:", err);
      }
    };
    loadDistricts();
  }, []);

  const getPasswordStrength = () => {
    if (!password) return { label: 'Empty', color: 'bg-stone-200', width: 'w-0' };
    if (password.length < 8) return { label: 'Too short', color: 'bg-red-500', width: 'w-1/3' };
    
    // Check complexity
    const hasLetters = /[a-zA-Z]/.test(password);
    const hasNumbers = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);
    
    if (password.length >= 12 && hasLetters && hasNumbers && hasSpecial) {
      return { label: 'Strong', color: 'bg-emerald-500', width: 'w-full' };
    }
    return { label: 'Good', color: 'bg-yellow-500', width: 'w-2/3' };
  };

  const handleRegister = (e) => {
    e.preventDefault();
    if (!name || !email || !password || !districtId) {
      toast.error('Please fill in all required fields.');
      return;
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }
    if (!agreeTerms) {
      toast.error('You must agree to the terms and conditions.');
      return;
    }

    const payload = {
      name,
      email,
      password,
      role,
      district_id: parseInt(districtId, 10),
      crop_type: null
    };

    startTransition(async () => {
      try {
        const res = await authService.register(payload);
        if (res.status === 'success') {
          toast.success('Account created successfully! Please sign in.');
          navigate('/login');
        }
      } catch (error) {
        const errMsg = error.response?.data?.message || 'Registration failed. Please try again.';
        toast.error(errMsg);
      }
    });
  };

  const strength = getPasswordStrength();

  return (
    <div className="min-h-screen flex bg-[#fafaf9] text-[#1c1917]" style={{ fontFamily: "'Inter', sans-serif" }}>
      
      {/* ── Left Panel (Static / Brand) ── */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#f97316] via-[#d97706] to-[#dc2626] text-white p-12 flex-col justify-between relative overflow-hidden">
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
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 md:p-16 overflow-y-auto h-screen">
        <div className="w-full max-w-md space-y-8 my-auto py-8">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-6 flex flex-col items-center">
            <Logo className="h-12 w-12 text-[#f97316] mb-3" />
            <h1 className="text-3xl font-black text-[#9d4300] tracking-tight">SAMVIT</h1>
            <p className="text-xs text-stone-500 uppercase font-black tracking-widest mt-1">Heatwave Early Warning System</p>
          </div>

          {/* Tab Selector */}
          <div className="flex bg-[#f5f1ed] p-1.5 rounded-full border border-[#d6ccc4]/60">
            <Link
              to="/login"
              className="flex-1 py-2.5 text-sm font-bold text-stone-600 text-center rounded-full hover:text-[#1c1917] cursor-pointer"
            >
              Sign In
            </Link>
            <button
              className="flex-1 py-2.5 text-sm font-bold text-center rounded-full bg-white text-[#1c1917] shadow-sm cursor-pointer"
            >
              Sign Up
            </button>
          </div>

          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#1c1917]">Create Account</h2>
            <p className="text-sm mt-1 text-stone-500 font-medium">Join the SAMVIT Heatwave Warning Platform</p>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {/* Name */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-stone-700">Full Name</label>
              <div className="relative">
                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Your full name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#d6ccc4] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 rounded-xl text-sm font-medium transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-stone-700">Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#d6ccc4] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 rounded-xl text-sm font-medium transition-all focus:outline-none"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-stone-700">Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-11 pr-12 py-2.5 bg-white border border-[#d6ccc4] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 rounded-xl text-sm font-medium transition-all focus:outline-none"
                />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              {/* Strength bar */}
              {password.length > 0 && (
                <div className="space-y-1 mt-1.5">
                  <div className="h-1 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className={`h-full ${strength.color} ${strength.width} transition-all duration-300`} />
                  </div>
                  <span className="text-[10px] font-black text-stone-500 uppercase tracking-wider">
                    Strength: {strength.label}
                  </span>
                </div>
              )}
            </div>

            {/* Role dropdown */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-stone-700">I am a...</label>
              <div className="relative">
                <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <select
                  id="reg-role"
                  value={role}
                  onChange={e => {
                    setRole(e.target.value);
                    if (e.target.value !== 'FARMER') setCropType('');
                  }}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#d6ccc4] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 rounded-xl text-sm font-medium transition-all focus:outline-none appearance-none cursor-pointer"
                >
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>
                      {r.icon} {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* District dropdown */}
            <div className="space-y-1">
              <label className="block text-sm font-semibold text-stone-700">My District (Karnataka)</label>
              <div className="relative">
                <MapPin size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none" />
                <select
                  id="reg-district"
                  required
                  value={districtId}
                  onChange={e => setDistrictId(e.target.value)}
                  className="w-full pl-11 pr-4 py-2.5 bg-white border border-[#d6ccc4] focus:border-[#f97316] focus:ring-2 focus:ring-[#f97316]/10 rounded-xl text-sm font-medium transition-all focus:outline-none appearance-none cursor-pointer"
                >
                  <option value="">Select your district...</option>
                  {districts.map(d => (
                    <option key={d.id} value={d.id}>
                      📍 {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>



            {/* Terms checkbox */}
            <div className="flex items-start">
              <input
                id="terms"
                type="checkbox"
                required
                checked={agreeTerms}
                onChange={e => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 rounded border-stone-300 text-[#f97316] focus:ring-[#f97316] accent-[#f97316] cursor-pointer"
              />
              <label htmlFor="terms" className="ml-2 block text-xs font-semibold text-stone-600 select-none cursor-pointer leading-relaxed">
                I agree to the Terms of Service and Privacy Policy, enabling SAMVIT to analyze my localized warning risk parameters.
              </label>
            </div>

            {/* Create Account Button */}
            <button
              id="reg-submit"
              type="submit"
              disabled={isPending}
              className="w-full py-3 bg-[#f97316] hover:bg-[#d97706] text-white text-sm font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-orange-500/10 hover:shadow-orange-500/20 disabled:opacity-60 cursor-pointer active:scale-100 transition-none mt-2"
            >
              {isPending ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
              {isPending ? 'Creating account…' : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm font-medium text-stone-500">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-[#f97316] hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}
