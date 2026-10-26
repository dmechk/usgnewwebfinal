import React, { useState } from 'react';
import {
  X,
  Lock,
  UserCheck,
  AlertCircle,
  KeyRound,
  ShieldAlert,
  CheckCircle2,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { ImigongoRibbon } from './ImigongoPattern';
import { authApi, clearAuthToken, setAuthToken } from '../services/api';

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

  // Mandatory / Direct Password Change state
  const [isPasswordChangeStep, setIsPasswordChangeStep] = useState(false);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [changeEmail, setChangeEmail] = useState('');
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changeSuccessMessage, setChangeSuccessMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isPasswordChangeStep) {
      // Clear temporary auth token so user cannot sign in without changing default password
      clearAuthToken();
    }
    setIsPasswordChangeStep(false);
    setPendingUser(null);
    setChangeSuccessMessage(null);
    setError('');
    onClose();
  };

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
        // Enforce mandatory password change if required by database
        if (data.user.passwordChangeRequired) {
          setPendingUser(data.user);
          setChangeEmail(data.user.email);
          setCurrentPasswordInput(cleanPassword);
          setNewPasswordInput('');
          setConfirmPasswordInput('');
          setError('');
          setIsPasswordChangeStep(true);
          setLoading(false);
          return; // Strictly stop here: no sign in without confirming new password!
        }

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
      if (
        apiErr.status === 401 ||
        (apiErr.message &&
          !apiErr.message.includes('timed out') &&
          !apiErr.message.includes('Failed to fetch') &&
          !apiErr.message.includes('backend server'))
      ) {
        setError(apiErr.message || 'Invalid email or password.');
        setLoading(false);
        return;
      }
    }

    setLoading(false);

    // 2. Verified Local Fallback (in case backend is momentarily offline)
    if (
      (cleanEmail === 'ubumwesaccogakenke@gmail.com' ||
        cleanEmail === 'manager@ubumwesacco.rw' ||
        cleanEmail === 'phocas@ubumwesacco.rw') &&
      (cleanPassword === 'Password123!' || cleanPassword === 'gakenke2026' || cleanPassword === 'admin2026')
    ) {
      onLoginSuccess({
        name: 'Mbitsemunda Phocas (Manager & Media Admin)',
        email: 'manager@ubumwesacco.rw',
        role: 'ADMIN',
      });
      onClose();
    } else if (cleanEmail === 'dmechack12@gmail.com' && cleanPassword === 'dmechack') {
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
    } else if (cleanEmail === 'hr@ubumwesacco.rw' && cleanPassword === 'Password123!') {
      onLoginSuccess({
        name: 'Innocent N. (HR Administrator)',
        email: 'hr@ubumwesacco.rw',
        role: 'ADMIN_HR',
      });
      onClose();
    } else if (cleanEmail === 'daf@ubumwesacco.rw' && cleanPassword === 'Password123!') {
      onLoginSuccess({
        name: 'Director of Finance & Admin',
        email: 'daf@ubumwesacco.rw',
        role: 'DAF',
      });
      onClose();
    } else if (
      (cleanEmail === 'md@ubumwesacco.rw' ||
        cleanEmail === 'wellarse@ubumwesacco.rw' ||
        cleanEmail === 'bartazal@ubumwesacco.rw') &&
      cleanPassword === 'Password123!'
    ) {
      onLoginSuccess({
        name: 'Executive Board & Management (MD)',
        email: cleanEmail,
        role: 'MD',
      });
      onClose();
    } else {
      setError(
        'Access Denied: Invalid credentials. Please use the verified role logins or registered staff credentials.'
      );
    }
  };

  const handlePasswordChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const cleanCurrent = currentPasswordInput.trim();
    const cleanNew = newPasswordInput.trim();
    const cleanConfirm = confirmPasswordInput.trim();

    if (cleanNew.length < 8) {
      setError('New password must be at least 8 characters in length.');
      return;
    }
    if (cleanNew !== cleanConfirm) {
      setError('New password and confirmation password do not match.');
      return;
    }
    if (cleanNew === cleanCurrent) {
      setError('New password must be different from your temporary default password.');
      return;
    }

    setLoading(true);

    try {
      // If user came via direct button without prior login call, authenticate first
      if (!pendingUser) {
        const loginRes = await authApi.login({
          email: changeEmail.trim().toLowerCase(),
          password: cleanCurrent,
        });
        setPendingUser(loginRes.user);
      }

      const res = await authApi.changePassword({
        currentPassword: cleanCurrent,
        newPassword: cleanNew,
      });

      if (res.success) {
        // Store the fresh JWT returned by the backend (old token is invalid after passwordChangedAt changes)
        if (res.accessToken) {
          setAuthToken(res.accessToken);
        }

        setChangeSuccessMessage('Default password successfully updated! Authorizing login session...');

        setTimeout(() => {
          const userObj = pendingUser || res.data?.user;
          try {
            localStorage.setItem('ubumwe_manager_session', 'true');
            localStorage.setItem('ubumwe_manager_name', userObj?.name || 'Staff User');
            localStorage.setItem('ubumwe_user_role', userObj?.role || 'ADMIN');
            localStorage.setItem(
              'ubumwe_auth_user',
              JSON.stringify({ ...(userObj || {}), passwordChangeRequired: false })
            );
          } catch {}

          onLoginSuccess({
            name: userObj?.name || 'Staff User',
            email: userObj?.email || changeEmail,
            role: userObj?.role || 'ADMIN',
            permissions: userObj?.permissions,
            dashboardUrl: userObj?.dashboardUrl,
          });

          setLoading(false);
          setIsPasswordChangeStep(false);
          onClose();
        }, 1200);
      }
    } catch (err: any) {
      setError(
        err?.message ||
          'Failed to update password. Please ensure your default/current password is correct and retry.'
      );
      setLoading(false);
    }
  };

  const openDirectPasswordChange = () => {
    setError('');
    setChangeSuccessMessage(null);
    setChangeEmail(email.trim().toLowerCase());
    setCurrentPasswordInput(password.trim());
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setIsPasswordChangeStep(true);
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
          onClick={handleClose}
          className="absolute top-3.5 right-3.5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================================= */}
        {/* VIEW 1: MANDATORY PASSWORD CHANGE STEP BEFORE LOGIN                      */}
        {/* ========================================================================= */}
        {isPasswordChangeStep ? (
          <div>
            <div className="text-center pt-1 pb-3">
              <div className="inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-amber-100 text-amber-800 mb-2 shadow-xs border border-amber-200">
                <ShieldAlert className="w-6 h-6 text-amber-700" />
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold tracking-wide uppercase mb-1">
                Mandatory First-Time Security Setup
              </div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-tight">
                Change Default Password Before Login
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
                {pendingUser ? (
                  <>
                    Account for <strong className="text-slate-800">{pendingUser.name}</strong> ({pendingUser.email}) requires establishing a permanent password before accessing the system.
                  </>
                ) : (
                  'Please update your default temporary credentials to establish authorized access.'
                )}
              </p>
            </div>

            {changeSuccessMessage && (
              <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">{changeSuccessMessage}</span>
              </div>
            )}

            {error && (
              <div className="mb-3 p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handlePasswordChangeSubmit} className="space-y-3">
              {!pendingUser && (
                <div>
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Staff Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={changeEmail}
                    onChange={(e) => setChangeEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    placeholder="staff@ubumwesacco.rw"
                  />
                </div>
              )}

              {/* Current Default Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Current / Default Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-0.5"
                  >
                    {showCurrentPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showCurrentPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? 'text' : 'password'}
                    required
                    value={currentPasswordInput}
                    onChange={(e) => setCurrentPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    placeholder="Enter current default password"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* New Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    New Permanent Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-0.5"
                  >
                    {showNewPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showNewPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={newPasswordInput}
                    onChange={(e) => setNewPasswordInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none font-mono"
                    placeholder="Minimum 8 characters"
                  />
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-[10px] text-slate-500 hover:text-slate-800 cursor-pointer flex items-center gap-0.5"
                  >
                    {showConfirmPassword ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showConfirmPassword ? 'Hide' : 'Show'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={8}
                    value={confirmPasswordInput}
                    onChange={(e) => setConfirmPasswordInput(e.target.value)}
                    className={`w-full px-3 py-2 bg-slate-50 border rounded-lg text-xs focus:ring-2 focus:outline-none font-mono ${
                      confirmPasswordInput && confirmPasswordInput !== newPasswordInput
                        ? 'border-rose-400 focus:ring-rose-500 bg-rose-50/30'
                        : 'border-slate-300 focus:ring-amber-500'
                    }`}
                    placeholder="Repeat new permanent password"
                  />
                  <ShieldCheck className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
                {confirmPasswordInput && confirmPasswordInput !== newPasswordInput && (
                  <p className="text-[10px] text-rose-600 mt-1">Passwords do not match.</p>
                )}
              </div>

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading || Boolean(confirmPasswordInput && confirmPasswordInput !== newPasswordInput)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-600 to-emerald-700 hover:from-amber-700 hover:to-emerald-800 disabled:opacity-60 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Saving Permanent Password...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Confirm New Password &amp; Sign In</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    clearAuthToken();
                    setIsPasswordChangeStep(false);
                    setPendingUser(null);
                    setError('');
                  }}
                  className="w-full py-1.5 text-center text-xs text-slate-500 hover:text-slate-800 cursor-pointer font-medium"
                >
                  Cancel &amp; Return to Sign In
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* ========================================================================= */
          /* VIEW 2: NORMAL SIGN IN                                                   */
          /* ========================================================================= */
          <div>
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

            {/* 1-Click Fill Credentials Chips */}
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl mb-3">
              <div className="flex items-center justify-between text-[10px] font-bold text-slate-600 mb-1.5 uppercase tracking-wider">
                <span className="flex items-center gap-1 text-emerald-800">
                  <KeyRound className="w-3 h-3" />
                  1-Click Role Logins:
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

            {/* Standard Sign In Form */}
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
                  placeholder="staff@ubumwesacco.rw"
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
                    placeholder="Enter passcode (e.g. Password123!)"
                  />
                  <KeyRound className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-2.5 pointer-events-none" />
                </div>
              </div>

              <div className="pt-1 space-y-2">
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

                {/* Option to change default password directly before login */}
                <div className="text-center pt-1 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={openDirectPasswordChange}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold flex items-center justify-center gap-1 mx-auto cursor-pointer"
                  >
                    <KeyRound className="w-3 h-3" />
                    <span>Change default / temporary password before login</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
