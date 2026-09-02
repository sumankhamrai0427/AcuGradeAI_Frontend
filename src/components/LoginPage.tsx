import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Info,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  User,
  Users,
  X,
} from 'lucide-react';
import ApiServices, {
  storeTokens,
  decodeTokenPayload,
} from '../services/ApiServices';
import { RegistrationRole } from '../types/api';

interface LoginPageProps {
  onAuthenticated: (role: string) => void;
  onBackToLanding?: () => void;
  onClose?: () => void;
  initialMode?: 'login' | 'register';
}

const DEFAULT_ROLES: RegistrationRole[] = [
  {
    id: 2,
    roleName: 'Parent',
    displayName: 'Parent (Family & Guardian)',
    description: 'Manage children, view reports and follow learning progress.',
    icon: '👨‍👩‍👧',
    isActive: 1,
  },
  {
    id: 3,
    roleName: 'Student',
    displayName: 'Student',
    description: 'Learn and take assessments.',
    icon: '🧑‍🎓',
    isActive: 1,
  },
];

export const LoginPage: React.FC<LoginPageProps> = ({
  onAuthenticated,
  onBackToLanding,
  onClose,
  initialMode = 'login',
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const handleBack = onBackToLanding || onClose;

  const passwordStrength = (() => {
    let score = 0;

    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    return score;
  })();

  const handleModeChange = (nextMode: 'login' | 'register') => {
    setMode(nextMode);
    setErrorMessage(null);
    setFieldErrors({});
    setName('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setFieldErrors({});

    let hasError = false;
    const newFieldErrors: Record<string, string> = {};

    if (!email.trim()) {
      newFieldErrors.email = 'Please enter your email address.';
      hasError = true;
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        newFieldErrors.email = 'Please enter a valid email address.';
        hasError = true;
      }
    }

    if (!password) {
      newFieldErrors.password = 'Please enter your password.';
      hasError = true;
    }

    if (mode === 'register') {
      if (!name.trim()) {
        newFieldErrors.name = 'Please enter your full name.';
        hasError = true;
      }

      if (password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).{8,}$/;
        if (!passwordRegex.test(password)) {
          newFieldErrors.password =
            'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character.';
          hasError = true;
        } else if (password !== confirmPassword) {
          newFieldErrors.confirmPassword = 'Passwords do not match.';
          hasError = true;
        }
      }
    }

    if (hasError) {
      setFieldErrors(newFieldErrors);
      return;
    }

    setIsSubmitting(true);

    try {
      /*
       * IMPORTANT:
       * Keep your existing API signatures here.
       * If your api.ts uses a different register signature, change ONLY
       * the register call below.
       */
      const response =
        mode === 'login'
          ? await ApiServices.login({ email: email.trim(), password })
          : await ApiServices.register({
              name: name.trim(),
              email: email.trim(),
              password,
              role: 'Parent'
            });
            
      const result = response.data;

      const accessToken =
        result.accessToken || result.tokens?.accessToken;

      const refreshToken =
        result.refreshToken || result.tokens?.refreshToken;

      if (accessToken && refreshToken) {
        storeTokens({ accessToken, refreshToken });
      }

      const payload = accessToken
        ? decodeTokenPayload(accessToken)
        : null;

      const userRole =
        payload?.role ||
        result.user?.role ||
        result.user?.roleName ||
        'Parent';

      onAuthenticated(userRole);
    } catch (error: any) {
      if (error?.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(
          mode === 'login'
            ? 'Unable to sign in. Please check your details and try again.'
            : 'Unable to create your account. Please try again.'
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="h-full w-full flex flex-col bg-white overflow-y-auto relative shadow-2xl">
      <div className="w-full max-w-md mx-auto px-6 pt-8 pb-6 sm:px-8 flex-1 flex flex-col justify-start relative">

        {/* Header with Logo and Close Button */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-yellow-400 text-stone-900 flex items-center justify-center shadow-lg shadow-yellow-400/30">
              <GraduationCap size={20} />
            </div>
            <div>
              <div className="text-xl font-black tracking-tight text-stone-900">SahajPath</div>
            </div>
          </div>

          <button
            onClick={handleBack}
            className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition-colors -mr-2"
            aria-label="Close"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mb-4">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-900 mb-2">
            {mode === 'login' ? 'Welcome back' : 'Create an account'}
          </h2>
          <p className="text-stone-500 font-medium text-sm sm:text-base leading-relaxed">
            {mode === 'login'
              ? 'Sign in to access your learning dashboard.'
              : 'Join to track progress and manage learning.'}
          </p>
        </div>

        {/* Mode Switcher */}
        <div className="flex p-1 bg-stone-200/60 rounded-xl mb-4">
          <button
            type="button"
            onClick={() => handleModeChange('login')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${mode === 'login' ? 'bg-white text-yellow-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('register')}
            className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all duration-200 ${mode === 'register' ? 'bg-white text-yellow-700 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
          >
            Sign Up
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3" noValidate>

          {/* Google Button */}
          <button
            type="button"
            className="w-full h-11 flex items-center justify-center gap-3 bg-white border-2 border-stone-200 hover:border-yellow-300 hover:bg-stone-50 text-stone-700 text-sm font-bold rounded-xl transition-all shadow-sm active:scale-[0.98]"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          {/* Google Sign In Divider */}
          <div className="relative flex items-center justify-center pb-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200"></div>
            </div>
            <div className="relative bg-stone-50 px-4 text-[10px] font-bold text-stone-400 uppercase tracking-wider">
              Or continue with email
            </div>
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 ml-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <User size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.name ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearFieldError('name');
                  }}
                  placeholder="Enter your full name"
                  className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.name ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'}`}
                />
              </div>
              {fieldErrors.name && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.name}</p>}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5 ml-1">
              Email Address <span className="text-red-500">*</span>
            </label>
            <div className="relative group">
              <Mail size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.email ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`} />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearFieldError('email');
                }}
                placeholder="name@example.com"
                className={`w-full h-11 pl-11 pr-4 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.email ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'}`}
              />
            </div>
            {fieldErrors.email && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.email}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5 ml-1 mr-1">
              <label className="text-xs font-bold text-stone-700">
                {mode === 'login' ? 'Password' : 'Create Password'} <span className="text-red-500">*</span>
              </label>
              {mode === 'login' && (
                <button type="button" className="text-xs font-bold text-yellow-600 hover:text-yellow-700">Forgot?</button>
              )}
            </div>
            <div className="relative group">
              <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.password ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`} />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearFieldError('password');
                }}
                placeholder="••••••••"
                className={`w-full h-11 pl-11 pr-12 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.password ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {fieldErrors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1 leading-tight">{fieldErrors.password}</p>}

            {mode === 'register' && password.length > 0 && (
              <div className="mt-3 flex gap-1.5">
                {[1, 2, 3, 4].map((step) => (
                  <div
                    key={step}
                    className={`h-1.5 flex-1 rounded-full transition-colors ${step <= passwordStrength ? (passwordStrength < 3 ? 'bg-amber-400' : 'bg-yellow-500') : 'bg-stone-200'}`}
                  />
                ))}
              </div>
            )}
          </div>

          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 ml-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <div className="relative group">
                <Lock size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${fieldErrors.confirmPassword ? 'text-red-400' : 'text-stone-400 group-focus-within:text-yellow-600'}`} />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    clearFieldError('confirmPassword');
                  }}
                  placeholder="••••••••"
                  className={`w-full h-11 pl-11 pr-12 bg-white border-2 rounded-xl text-sm font-medium text-stone-900 outline-none transition-all placeholder:text-stone-400 ${fieldErrors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-500/20' : 'border-stone-200 focus:border-yellow-400 focus:ring-4 focus:ring-yellow-600/10'}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 transition-colors"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {fieldErrors.confirmPassword && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{fieldErrors.confirmPassword}</p>}
            </div>
          )}

          {errorMessage && (
            <div className="p-3 mt-4 rounded-xl bg-red-50 border border-red-100 text-sm font-semibold text-red-600 flex items-start gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 flex-shrink-0" />
              {errorMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 mt-2 flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-700 active:scale-[0.98] text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-yellow-400/25 disabled:opacity-70 disabled:pointer-events-none"
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" />
            ) : (
              <>
                {mode === 'login' ? 'Log in' : 'Create Account'}
                <ArrowRight size={18} />
              </>
            )}
          </button>

        </form>

      </div>
    </div>
  );
};

export default LoginPage;