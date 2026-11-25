import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth.service';
import { useAuthStore } from '../../stores/auth.store';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { login, loading } = useAuthStore();

  const [mode, setMode] = useState<'LOGIN' | 'FORGOT' | 'RESET'>('LOGIN');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await login(email, password);
      navigate('/admin', { replace: true });
    } catch {
      setErrorMessage('Invalid email or password.');
    }
  };

  const handleForgot = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await authService.forgotPassword(email);
      setStatusMessage('If the email exists, a 6-digit OTP has been dispatched.');
      setMode('RESET');
    } catch {
      setErrorMessage('Failed to dispatch recovery code.');
    }
  };

  const handleReset = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    try {
      await authService.resetPassword(email, otp, newPassword);
      setStatusMessage('Password updated. Sign in with your new credentials.');
      setMode('LOGIN');
      setPassword('');
      setOtp('');
      setNewPassword('');
    } catch {
      setErrorMessage('Invalid or expired OTP code.');
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-black p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#555555]">
          LAGIISM // INTERNAL PORTAL
        </p>
        <h1 className="text-2xl font-black uppercase tracking-[-0.03em] mt-2">
          {mode === 'LOGIN' && 'ADMIN SIGN IN'}
          {mode === 'FORGOT' && 'PASSWORD RECOVERY'}
          {mode === 'RESET' && 'VERIFY OTP & RESET'}
        </h1>

        {errorMessage && (
          <div className="mt-4 border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs text-red-700">
            {errorMessage}
          </div>
        )}
        {statusMessage && (
          <div className="mt-4 border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs text-black">
            {statusMessage}
          </div>
        )}

        {mode === 'LOGIN' && (
          <form onSubmit={handleLogin} className="mt-6 space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">Email</label>
              <input
                type="email"
                required
                autoComplete="username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">Password</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#222222] disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'AUTHENTICATING...' : 'ENTER ADMIN PORTAL'}
            </button>
            <button
              type="button"
              onClick={() => setMode('FORGOT')}
              className="w-full text-center font-mono text-[11px] uppercase underline underline-offset-4 text-[#555555] hover:text-black cursor-pointer"
            >
              Forgot Password (OTP)
            </button>
          </form>
        )}

        {mode === 'FORGOT' && (
          <form onSubmit={handleForgot} className="mt-6 space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">Admin Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] cursor-pointer"
            >
              SEND RECOVERY OTP
            </button>
            <button
              type="button"
              onClick={() => setMode('LOGIN')}
              className="w-full text-center font-mono text-[11px] uppercase underline underline-offset-4 text-[#555555] cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        )}

        {mode === 'RESET' && (
          <form onSubmit={handleReset} className="mt-6 space-y-4">
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">6-Digit OTP</label>
              <input
                type="text"
                required
                minLength={6}
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full border border-black px-3 py-2.5 font-mono text-sm tracking-[0.2em] focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                New Password (min 8 chars)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-black text-white py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] cursor-pointer"
            >
              RESET PASSWORD
            </button>
            <button
              type="button"
              onClick={() => setMode('LOGIN')}
              className="w-full text-center font-mono text-[11px] uppercase underline underline-offset-4 text-[#555555] cursor-pointer"
            >
              Back to Login
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
