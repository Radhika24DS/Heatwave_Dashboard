import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Card from '../../components/ui/Card';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  role: z.enum(['PUBLIC', 'FARMER', 'TRAVELLER', 'RESEARCH'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

const ROLES = [
  { value: 'PUBLIC',    label: 'General Public',         desc: 'Public heatwave alerts & tips' },
  { value: 'FARMER',    label: 'Farmer',                 desc: 'Crop & livestock advisories'   },
  { value: 'TRAVELLER', label: 'Traveller',               desc: 'Travel route risk assessment'  },
  { value: 'RESEARCH',  label: 'Scientific Researcher',   desc: 'Full model metrics & datasets' },
];

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: '', email: '', password: '', role: 'PUBLIC' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    const result = await registerUser(data);
    setLoading(false);
    if (result.success) {
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } else {
      setApiError(result.error);
    }
  };

  const inputClass = (hasError) =>
    `w-full pl-10 pr-4 py-2.5 bg-brand-card border rounded-xl text-sm text-brand-text placeholder-brand-faint focus:outline-none focus:ring-2 focus:ring-brand-primary/40 focus:border-brand-primary/50 transition-all ${
      hasError ? 'border-risk-extreme' : 'border-brand-border'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-bg px-4 py-12 relative overflow-hidden">
      {/* Background glows */}
      <div className="absolute top-0 left-0 w-80 h-80 rounded-full bg-brand-primary/8 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-80 h-80 rounded-full bg-brand-yellow/6 blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10 fade-in-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-brand-primary/10 border border-brand-primary/30 heat-ring mb-4">
            <Flame className="h-7 w-7 text-brand-primary" />
          </div>
          <h1 className="font-heading text-2xl font-black gradient-text">Create your account</h1>
          <p className="text-sm text-brand-muted mt-1">Join the Karnataka Heatwave Early Warning System</p>
        </div>

        <Card title="Create Account" className="glass-sm p-6">
          {/* Success state */}
          {success ? (
            <div className="flex flex-col items-center justify-center py-8 text-center fade-in-up">
              <CheckCircle2 className="h-16 w-16 text-risk-low mb-4" />
              <h3 className="font-heading text-xl font-bold text-brand-text mb-2">Registration Successful!</h3>
              <p className="text-sm text-brand-muted">Redirecting you to the sign-in page…</p>
              <div className="mt-4 h-1 w-40 rounded-full overflow-hidden bg-brand-border">
                <div className="h-full bg-risk-low rounded-full animate-[shimmer_2.5s_linear_1]" style={{ width: '100%' }} />
              </div>
            </div>
          ) : (
            <>
              {apiError && (
                <div className="mb-5 flex items-center gap-2 rounded-xl bg-risk-extreme/10 border border-risk-extreme/30 px-4 py-3 text-sm text-red-300">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {apiError}
                </div>
              )}

              <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                {/* Full Name */}
                <div>
                  <label htmlFor="reg-name" className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-faint pointer-events-none" />
                    <input id="reg-name" type="text" placeholder="Arjun Kumar" className={inputClass(!!errors.name)} {...register('name')} />
                  </div>
                  {errors.name && <p className="mt-1 text-xs text-risk-extreme">{errors.name.message}</p>}
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="reg-email" className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Email</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-faint pointer-events-none" />
                    <input id="reg-email" type="email" placeholder="you@example.com" className={inputClass(!!errors.email)} {...register('email')} />
                  </div>
                  {errors.email && <p className="mt-1 text-xs text-risk-extreme">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="reg-password" className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-brand-faint pointer-events-none" />
                    <input id="reg-password" type="password" placeholder="Min. 8 characters" className={inputClass(!!errors.password)} {...register('password')} />
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-risk-extreme">{errors.password.message}</p>}
                </div>

                {/* Role picker */}
                <div>
                  <label className="block text-xs font-semibold text-brand-muted mb-1.5 uppercase tracking-wider">I am a…</label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLES.map(({ value, label, desc }) => (
                      <label
                        key={value}
                        className={`cursor-pointer rounded-xl border p-3 transition-all ${
                          selectedRole === value
                            ? 'border-brand-primary/50 bg-brand-primary/8'
                            : 'border-brand-border bg-brand-card hover:border-brand-border/80'
                        }`}
                      >
                        <input type="radio" value={value} className="sr-only" {...register('role')} />
                        <p className={`text-xs font-bold ${selectedRole === value ? 'text-brand-primary' : 'text-brand-text'}`}>{label}</p>
                        <p className="text-[10px] text-brand-faint mt-0.5 leading-tight">{desc}</p>
                      </label>
                    ))}
                  </div>
                  {errors.role && <p className="mt-1 text-xs text-risk-extreme">{errors.role.message}</p>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-bold text-white bg-brand-primary hover:bg-brand-mid transition-all shadow-heat focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50"
                >
                  {loading ? (
                    <><span className="h-3.5 w-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Creating account…</>
                  ) : (
                    <>Create Account <ChevronRight className="h-4 w-4" /></>
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-brand-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-brand-primary hover:text-brand-mid transition-colors">
                  Sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
