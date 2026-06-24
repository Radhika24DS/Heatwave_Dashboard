import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Shield, Mail, Lock, User, CheckCircle, AlertTriangle } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name is too long'),
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100, 'Password is too long'),
  role: z.enum(['PUBLIC', 'FARMER', 'TRAVELLER', 'RESEARCH'], {
    errorMap: () => ({ message: 'Please select a valid role' }),
  }),
});

const RegisterPage = () => {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [apiError, setApiError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: 'PUBLIC',
    }
  });

  const onSubmit = async (data) => {
    setApiError('');
    setLoading(true);
    const result = await registerUser(data);
    setLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        navigate('/login');
      }, 2500);
    } else {
      setApiError(result.error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-dark px-4 py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-risk-low opacity-5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-risk-moderate opacity-5 rounded-full blur-[120px]"></div>

      <div className="w-full max-w-md space-y-8 z-10">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-brand-slate border border-brand-border text-risk-low shadow-lg">
            <Shield className="h-9 w-9" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-brand-text">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-brand-muted">
            Register to receive localized heatwave warnings and advisory insights
          </p>
        </div>

        <div className="bg-brand-navy border border-brand-border rounded-xl p-8 shadow-2xl backdrop-blur-md bg-opacity-95">
          {success ? (
            <div className="flex flex-col items-center justify-center space-y-3 py-6 text-center">
              <CheckCircle className="h-16 w-16 text-risk-low animate-bounce" />
              <h3 className="text-xl font-bold text-brand-text">Registration Successful!</h3>
              <p className="text-sm text-brand-muted">
                Your account is ready. Redirecting to sign in page...
              </p>
            </div>
          ) : (
            <>
              {apiError && (
                <div className="mb-6 flex items-center space-x-2 rounded-lg bg-red-900/30 border border-red-500/50 p-4 text-sm text-red-200">
                  <AlertTriangle className="h-5 w-5 text-risk-extreme flex-shrink-0" />
                  <span>{apiError}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-brand-muted mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      className={`w-full pl-10 pr-3 py-2 bg-brand-dark border rounded-lg focus:outline-none focus:ring-2 focus:ring-risk-low focus:border-transparent text-brand-text placeholder-brand-muted/50 ${
                        errors.name ? 'border-risk-extreme' : 'border-brand-border'
                      }`}
                      {...register('name')}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1 text-xs text-risk-extreme font-medium">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-brand-muted mb-1">
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
                      className={`w-full pl-10 pr-3 py-2 bg-brand-dark border rounded-lg focus:outline-none focus:ring-2 focus:ring-risk-low focus:border-transparent text-brand-text placeholder-brand-muted/50 ${
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
                  <label htmlFor="password" className="block text-sm font-medium text-brand-muted mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-brand-muted">
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-3 py-2 bg-brand-dark border rounded-lg focus:outline-none focus:ring-2 focus:ring-risk-low focus:border-transparent text-brand-text placeholder-brand-muted/50 ${
                        errors.password ? 'border-risk-extreme' : 'border-brand-border'
                      }`}
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="mt-1 text-xs text-risk-extreme font-medium">{errors.password.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-brand-muted mb-1">
                    I am registering as a
                  </label>
                  <select
                    id="role"
                    className="w-full px-3 py-2 bg-brand-dark border border-brand-border rounded-lg focus:outline-none focus:ring-2 focus:ring-risk-low focus:border-transparent text-brand-text"
                    {...register('role')}
                  >
                    <option value="PUBLIC">General Public</option>
                    <option value="FARMER">Farmer</option>
                    <option value="TRAVELLER">Traveller</option>
                    <option value="RESEARCH">Scientific Researcher</option>
                  </select>
                  {errors.role && (
                    <p className="mt-1 text-xs text-risk-extreme font-medium">{errors.role.message}</p>
                  )}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-bold text-white bg-risk-low hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-risk-low disabled:opacity-50 transition-colors shadow-lg shadow-risk-low/20"
                  >
                    {loading ? 'Creating account...' : 'Create Account'}
                  </button>
                </div>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-brand-muted">
                  Already have an account?{' '}
                  <Link to="/login" className="font-medium text-risk-low hover:text-emerald-400 transition-colors">
                    Sign in here
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
