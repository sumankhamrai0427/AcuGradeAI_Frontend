import React, { useState } from 'react';
import { GraduationCap, Loader2 } from 'lucide-react';
import { authApi, storeTokens, decodeTokenPayload, ApiError } from '../lib/api';

interface LoginPageProps {
  onAuthenticated: (role: string) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onAuthenticated }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      const result =
        mode === 'login'
          ? await authApi.login(email, password)
          : await authApi.register(name, email, password);

      storeTokens({ accessToken: result.accessToken, refreshToken: result.refreshToken });
      const payload = decodeTokenPayload(result.accessToken);
      onAuthenticated(payload?.role || result.user.role);
    } catch (err) {
      if (err instanceof ApiError) {
        setErrorMessage(err.message);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
        <div className="flex items-center gap-2.5 mb-6 justify-center">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-bold text-slate-900">AcuGrade AI</span>
        </div>

        <div className="flex mb-6 rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => setMode('login')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              mode === 'login' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            Log in
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${
              mode === 'register' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'
            }`}
          >
            Create account
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Full name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Ananya Sharma"
              />
            </div>
          )}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="At least 8 characters"
            />
          </div>

          {errorMessage && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {errorMessage}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            {mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
          <p className="text-xs text-slate-500 font-medium text-center">Quick Demo Credentials:</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setEmail('admin@acugrade.ai');
                setPassword('ChangeMe123!');
              }}
              className="flex-1 py-1.5 px-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-xs font-medium transition"
            >
              Fill Super Admin
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setName('Demo Parent');
                setEmail(`parent_${Math.floor(Math.random()*1000)}@acugrade.ai`);
                setPassword('Password123!');
              }}
              className="flex-1 py-1.5 px-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-md text-xs font-medium transition"
            >
              Fill New Parent
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-400 text-center mt-4">
          Parent and admin accounts both log in here — the app adapts to your role.
        </p>
      </div>
    </div>
  );
};
