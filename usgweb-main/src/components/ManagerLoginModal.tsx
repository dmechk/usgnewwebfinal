import React, { useState } from 'react';
import { SACCO_INFO } from '../data/saccoData';
import { X, Lock, ShieldCheck, UserCheck, AlertCircle, KeyRound, ShieldAlert, CheckCircle2, Users } from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import { authApi } from '../services/api';

interface ManagerLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: {
    name: string;
    email: string;
    role: string;
    permissions?: string[];
    dashboardUrl?: string;
  }) => void;
}

export const ManagerLoginModal: React.FC<ManagerLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    setError('');
    setLoading(true);

    // 1. Authenticate against Backend API first
    try {
      const data = await authApi.login({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (data?.user) {
        try {
          localStorage.setItem('ubumwe_manager_session', 'true');
          localStorage.setItem('ubumwe_manager_name', data.user.name);
          localStorage.setItem('ubumwe_user_role', data.user.role);
          localStorage.setItem('ubumwe_auth_user', JSON.stringify(data.user));
        } catch {}

        onLoginSuccess({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          permissions: data.user.permissions,
          dashboardUrl: data.user.dashboardUrl,
        });
        setLoading(false);
        onClose();
        return;
      }
    } catch (apiErr: any) {
      console.warn('Backend authentication response:', apiErr.message);

      // If backend explicitly rejected credentials with 401 or similar message
      if (apiErr.status === 401 || (apiErr.message && !apiErr.message.includes('timed out') && !apiErr.message.includes('Failed to fetch') && !apiErr.message.includes('backend server'))) {
        setError(apiErr.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);

    // 2. Verified Local Fallback (in case backend is momentarily offline)
    if (
      (cleanEmail === 'ubumwesaccogakenke@gmail.com' || cleanEmail === 'manager@ubumwesacco.rw' || cleanEmail === 'phocas@ubumwesacco.rw') &&
      (cleanPassword === 'Password123!' || cleanPassword === 'gakenke2026' || cleanPassword === 'admin2026')
    ) {
      onLoginSuccess({
        name: 'Mbitsemunda Phocas (Manager & Media Admin)',
        email: 'manager@ubumwesacco.rw',
        role: 'ADMIN',
      });
      onClose();
    } else if (
      cleanEmail === 'dmechack12@gmail.com' &&
      cleanPassword === 'dmechack'
    ) {
      onLoginSuccess({
        name: 'Mechack D (Super Administrator)',
        email: 'dmechack12@gmail.com',
        role: 'ADMIN_IT',
      });
      onClose();
    } else if (
      cleanEmail === 'admin@example.com' &&
      (cleanPassword === 'replace-with-a-secure-password' || cleanPassword === 'admin')
    ) {
      onLoginSuccess({
        name: 'System Administrator',
        email: 'admin@example.com',
        role: 'admin',
      });
      onClose();
    } else if (
      cleanEmail === 'hr@ubumwesacco.rw' &&
      cleanPassword === 'Password123!'
    ) {
      onLoginSuccess({
        name: 'Innocent N. (HR Administrator)',
        email: 'hr@ubumwesacco.rw',
        role: 'ADMIN_HR',
      });
      onClose();
    } else if (
      cleanEmail === 'daf@ubumwesacco.rw' &&
      cleanPassword === 'Password123!'
    ) {
      onLoginSuccess({
        name: 'Director of Finance & Admin',
        email: 'daf@ubumwesacco.rw',
        role: 'DAF',
      });
      onClose();
    } else if (
      (cleanEmail === 'md@ubumwesacco.rw' || cleanEmail === 'wellarse@ubumwesacco.rw' || cleanEmail === 'bartazal@ubumwesacco.rw') &&
      cleanPassword === 'Password123!'
    ) {
      onLoginSuccess({
        name: 'Executive Board & Management (MD)',
        email: cleanEmail,
        role: 'MD',
      });
      onClose();
    } else {
      setError('Access Denied: Invalid credentials. Please use the verified role logins or registered staff credentials.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 relative shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto">
        {/* Top Imigongo skeleton ribbon */}
        <div className="absolute top-0 left-0 right-0">
          <ImigongoRibbon height={6} variant="light" bordered={false} />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          aria-label="Close login dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Compact Centered Header */}
        <div className="text-center pt-1 pb-3">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 mb-2 shadow-xs">
            <Lock className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="text-lg font-extrabold text-slate-900 tracking-tight leading-tight">
            Staff &amp; Board Login
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            UBUMWE SACCO GAKENKE Management &amp; Board Portal
          </p>
        </div>

        {/* Compact 1-Click Fill Credentials Chips */}
        <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-3">
          <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
            <span className="flex items-center gap-1 text-emerald-800">
              <KeyRound className="w-3 h-3" />
              1-Click Demo Logins:
            </span>
          </div>

          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setEmail('dmechack12@gmail.com');
                setPassword('dmechack');
                setError('');
              }}
              className="text-left px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[10px] font-bold text-slate-800 truncate cursor-pointer transition-colors shadow-2xs"
              title="Super Admin: Mechack D (dmechack12@gmail.com)"
            >
              🛡️ IT Admin (ADMIN_IT)
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('manager@ubumwesacco.rw');
                setPassword('Password123!');
                setError('');
              }}
              className="text-left px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[10px] font-bold text-slate-800 truncate cursor-pointer transition-colors shadow-2xs"
              title="Media & Gallery: Mbitsemunda Phocas (manager@ubumwesacco.rw)"
            >
              👑 Manager (ADMIN)
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('hr@ubumwesacco.rw');
                setPassword('Password123!');
                setError('');
              }}
              className="text-left px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[10px] font-bold text-slate-800 truncate cursor-pointer transition-colors shadow-2xs"
              title="Recruitment & HR: Innocent (hr@ubumwesacco.rw)"
            >
              💼 HR (ADMIN_HR)
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('daf@ubumwesacco.rw');
                setPassword('Password123!');
                setError('');
              }}
              className="text-left px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[10px] font-bold text-slate-800 truncate cursor-pointer transition-colors shadow-2xs"
              title="Careers & Finance: DAF (daf@ubumwesacco.rw)"
            >
              📈 Careers (DAF)
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('md@ubumwesacco.rw');
                setPassword('Password123!');
                setError('');
              }}
              className="text-left px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[10px] font-bold text-slate-800 truncate cursor-pointer transition-colors shadow-2xs"
              title="Executive Oversight: Managing Director (md@ubumwesacco.rw)"
            >
              🏛️ Oversight (MD)
            </button>

            <button
              type="button"
              onClick={() => {
                setEmail('admin@example.com');
                setPassword('replace-with-a-secure-password');
                setError('');
              }}
              className="text-left px-2 py-1.5 rounded-lg bg-white border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-[10px] font-bold text-slate-800 truncate cursor-pointer transition-colors shadow-2xs"
              title="System Administrator (admin@example.com)"
            >
              ⭐ Superuser (admin)
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-3 p-2.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Compact Form */}
        <form onSubmit={handleLogin} className="space-y-2.5">
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
              Staff Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              placeholder="ubumwesaccogakenke@gmail.com"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                Passcode / PIN
              </label>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none font-mono"
                placeholder="Enter passcode (e.g. gakenke2026)"
              />
              <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div className="pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Sign In to Admin Hub</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
