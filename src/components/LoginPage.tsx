import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Loader2,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Users,
  AlertCircle,
  Briefcase,
  Sparkles
} from 'lucide-react';
import { authApi, storeTokens, decodeTokenPayload, ApiError, RegistrationRole } from '../lib/api';

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
    description: 'Manage multiple child sub-accounts and monitor academic diagnostics.',
    icon: '👨‍👩‍👧',
    isActive: 1,
  },
  {
    id: 3,
    roleName: 'Teacher',
    displayName: 'Teacher (School Educator / Tutor)',
    description: 'Communicate with parents, review student dossiers, and track classes.',
    icon: '🧑‍🏫',
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
  const [availableRoles, setAvailableRoles] = useState<RegistrationRole[]>(DEFAULT_ROLES);
  const [selectedRole, setSelectedRole] = useState<string>('Parent');
  const [roleTouched, setRoleTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleBack = onBackToLanding || onClose;

  // Fetch dynamic public registration roles from backend API
  useEffect(() => {
    let isMounted = true;
    async function fetchRoles() {
      try {
        const roles = await authApi.getRoles();
        if (isMounted && Array.isArray(roles) && roles.length > 0) {
          setAvailableRoles(roles);
          if (!roles.some((r) => r.roleName.toUpperCase() === selectedRole.toUpperCase())) {
            setSelectedRole(roles[0].roleName);
          }
        }
      } catch {
        // Fallback to DEFAULT_ROLES
      }
    }
    fetchRoles();
    return () => {
      isMounted = false;
    };
  }, [selectedRole]);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };
  const passStrength = getPasswordStrength(password);

  const currentRoleInfo = availableRoles.find(
    (r) => r.roleName.toUpperCase() === selectedRole.toUpperCase()
  ) || availableRoles[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (mode === 'register') {
      setRoleTouched(true);
      if (!selectedRole) {
        setErrorMessage('Please select an account role.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const result =
        mode === 'login'
          ? await authApi.login(email, password)
          : await authApi.register(name, email, password, selectedRole);

      const accessToken = result.accessToken || result.tokens?.accessToken;
      const refreshToken = result.refreshToken || result.tokens?.refreshToken;

      if (accessToken && refreshToken) {
        storeTokens({ accessToken, refreshToken });
      }

      const payload = decodeTokenPayload(accessToken);
      const userRole = (mode === 'register' && selectedRole)
        ? selectedRole
        : (payload?.role || result.user?.role || result.user?.roleName || 'Parent');

      onAuthenticated(userRole);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else if (err?.message) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Authentication failed. Please check your credentials and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-50 mesh-gradient-bg px-4 py-8 relative">
      {/* Back to Landing Page Button */}
      {handleBack && (
        <button
          onClick={handleBack}
          type="button"
          className="absolute top-6 left-6 inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold text-slate-600 hover:text-indigo-600 bg-white/80 hover:bg-white border border-slate-200/80 shadow-xs transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>
      )}

      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xl shadow-indigo-100/50 p-6 sm:p-8 relative">
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-3xl" />

        {/* Clean Project Brand Header */}
        <div className="flex items-center gap-3 mb-6 justify-center mt-1">
          <div className="w-11 h-11 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xl font-black text-slate-900 tracking-tight font-display">AcuGrade AI</span>
            <p className="text-xs text-slate-500 font-medium">Precision Exam Diagnostics</p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex mb-6 rounded-xl bg-slate-100 p-1 border border-slate-200/70">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 text-xs sm:text-sm font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-white shadow-xs text-indigo-700' : 'text-slate-500 hover:text-slate-800'
              }`}
          >
            Create Account
          </button>
        </div>

        {/* Alert / Error Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-xs sm:text-sm text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                  placeholder="e.g. Ananya Sharma"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email or Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                placeholder={mode === 'login' ? 'you@example.com or Admin123' : 'you@example.com'}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
              {mode === 'login' && (
                <span className="text-xs text-indigo-600 hover:text-indigo-800 cursor-pointer font-medium">
                  Forgot password?
                </span>
              )}
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-9 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white placeholder:text-slate-400"
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {mode === 'register' && password.length > 0 && (
              <div className="mt-2">
                <div className="flex gap-1 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${passStrength === 1
                      ? 'w-1/4 bg-red-500'
                      : passStrength === 2
                        ? 'w-2/4 bg-amber-500'
                        : passStrength === 3
                          ? 'w-3/4 bg-indigo-500'
                          : 'w-full bg-emerald-500'
                      }`}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400 mt-1">
                  <span>Strength:</span>
                  <span className="font-semibold text-slate-600">
                    {passStrength <= 1 && 'Weak'}
                    {passStrength === 2 && 'Fair'}
                    {passStrength === 3 && 'Good'}
                    {passStrength >= 4 && 'Strong ✨'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Dynamic Registration Role Dropdown */}
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Role *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <select
                  value={selectedRole}
                  onChange={(e) => {
                    setSelectedRole(e.target.value);
                    setRoleTouched(true);
                    if (errorMessage) setErrorMessage(null);
                  }}
                  className={`w-full pl-9 pr-8 py-2.5 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-800 appearance-none cursor-pointer ${roleTouched && !selectedRole ? 'border-red-300' : 'border-slate-300'
                    }`}
                >
                  {availableRoles.map((r) => (
                    <option key={r.id} value={r.roleName}>
                      {r.icon} {r.displayName}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
              {currentRoleInfo && (
                <p className="text-[11px] text-slate-400 mt-1">
                  {currentRoleInfo.description}
                </p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer mt-2"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{mode === 'login' ? 'Sign In' : 'Sign Up'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
