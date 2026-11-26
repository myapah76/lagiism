import axios from 'axios';
import { X } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { authService } from '../services/auth.service';
import { useAuthStore } from '../stores/auth.store';
import { useUiStore } from '../stores/ui.store';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

type ModalMode = 'LOGIN' | 'REGISTER' | 'FORGOT' | 'RESET';

interface FieldErrors {
  fullName?: string;
  email?: string;
  password?: string;
  otp?: string;
  confirmPassword?: string;
}

function extractApiError(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const serverMsg = err.response?.data?.message;
    if (typeof serverMsg === 'string' && serverMsg.trim().length > 0) {
      return serverMsg;
    }
    if (!err.response) {
      return 'Cannot reach backend API. Make sure the backend server is running.';
    }
  }
  return fallback;
}

export function AuthModal() {
  const { isAuthModalOpen, authModalMode, closeAuthModal } = useUiStore();
  const { login, register, loginWithGoogle, loading } = useAuthStore();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<ModalMode>(authModalMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [submittingOtp, setSubmittingOtp] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode(authModalMode);
      setFieldErrors({});
      setErrorMessage(null);
      setStatusMessage(null);
    }
  }, [isAuthModalOpen, authModalMode]);

  useEffect(() => {
    if (!isAuthModalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeAuthModal();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isAuthModalOpen, closeAuthModal]);

  // Render Google Sign-In button reliably on LOGIN / REGISTER tabs
  useEffect(() => {
    if (!isAuthModalOpen || !googleClientId || (mode !== 'LOGIN' && mode !== 'REGISTER')) {
      return;
    }

    let cancelled = false;
    let attempts = 0;

    const tryRenderGoogleButton = () => {
      if (cancelled || !googleBtnRef.current) return false;
      const gsi = window.google?.accounts?.id;
      if (!gsi) return false;

      googleBtnRef.current.innerHTML = '';
      gsi.initialize({
        client_id: googleClientId,
        callback: async (response) => {
          if (!response.credential) {
            setErrorMessage('Google did not return an ID token.');
            return;
          }
          setErrorMessage(null);
          try {
            await loginWithGoogle(response.credential);
            closeAuthModal();
          } catch (err) {
            setErrorMessage(
              extractApiError(err, 'Google sign-in failed. Please try again.')
            );
          }
        },
      });
      gsi.renderButton(googleBtnRef.current, {
        theme: 'outline',
        size: 'large',
        width: 360,
        text: mode === 'REGISTER' ? 'signup_with' : 'signin_with',
      });
      return true;
    };

    if (tryRenderGoogleButton()) return;

    const interval = window.setInterval(() => {
      attempts += 1;
      if (tryRenderGoogleButton() || attempts >= 25) {
        window.clearInterval(interval);
      }
    }, 200);

    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [isAuthModalOpen, googleClientId, mode, loginWithGoogle, closeAuthModal]);

  if (!isAuthModalOpen) return null;

  const switchMode = (next: ModalMode) => {
    setMode(next);
    setFieldErrors({});
    setErrorMessage(null);
  };

  const validateAuthFields = (): boolean => {
    const errors: FieldErrors = {};
    const trimmedEmail = email.trim();

    if (mode === 'REGISTER' && fullName.trim().length < 2) {
      errors.fullName = 'Please enter your name (at least 2 characters).';
    }
    if (!trimmedEmail) {
      errors.email = 'Email address is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address (e.g. example@lagiism.com).';
    }
    if (mode === 'LOGIN' || mode === 'REGISTER') {
      if (!password) {
        errors.password = 'Password is required.';
      } else if (mode === 'REGISTER' && password.length < 8) {
        errors.password = 'Password must be at least 8 characters.';
      }
    }
    if (mode === 'REGISTER' && password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match.';
    }
    if (mode === 'RESET') {
      if (otp.trim().length !== 6) {
        errors.otp = 'Enter the 6-digit OTP sent to your email.';
      }
      if (password.length < 8) {
        errors.password = 'New password must be at least 8 characters.';
      }
      if (password !== confirmPassword) {
        errors.confirmPassword = 'Passwords do not match.';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setStatusMessage(null);
    if (!validateAuthFields()) return;

    try {
      if (mode === 'REGISTER') {
        await register(email.trim(), fullName.trim(), password);
        setPassword('');
        closeAuthModal();
      } else if (mode === 'LOGIN') {
        await login(email.trim(), password);
        setPassword('');
        closeAuthModal();
      } else if (mode === 'FORGOT') {
        setSubmittingOtp(true);
        await authService.forgotPassword(email.trim());
        setStatusMessage('A 6-digit OTP (valid for 5 minutes) has been sent to your email.');
        setMode('RESET');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
      } else if (mode === 'RESET') {
        setSubmittingOtp(true);
        await authService.resetPassword(email.trim(), otp.trim(), password);
        setStatusMessage('Password reset successful. Sign in with your new password.');
        setMode('LOGIN');
        setPassword('');
        setConfirmPassword('');
        setOtp('');
      }
    } catch (err) {
      setErrorMessage(
        extractApiError(
          err,
          mode === 'REGISTER'
            ? 'Could not create account. Email may already be registered.'
            : mode === 'RESET'
              ? 'Invalid or expired OTP code.'
              : mode === 'FORGOT'
                ? 'Unable to send recovery OTP.'
                : 'Invalid email or password.'
        )
      );
    } finally {
      setSubmittingOtp(false);
    }
  };

  const busy = loading || submittingOtp;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeAuthModal();
      }}
      className="fixed inset-0 z-50 bg-black/45 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="relative w-full max-w-md bg-white text-black border border-black p-7 md:p-8 shadow-2xl max-h-[92vh] overflow-y-auto">
        <button
          type="button"
          onClick={closeAuthModal}
          aria-label="Close sign in dialog"
          className="absolute top-4 right-4 p-1.5 border border-transparent hover:border-black cursor-pointer"
        >
          <X size={18} />
        </button>

        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#555555]">
          LAGIISM // MEMBER ACCESS
        </p>
        <h2
          id="auth-modal-title"
          className="text-2xl font-black uppercase tracking-[-0.03em] mt-1.5"
        >
          {mode === 'LOGIN' && 'SIGN IN'}
          {mode === 'REGISTER' && 'CREATE ACCOUNT'}
          {mode === 'FORGOT' && 'FORGOT PASSWORD'}
          {mode === 'RESET' && 'VERIFY 5-MIN OTP'}
        </h2>

        {(mode === 'LOGIN' || mode === 'REGISTER') && (
          <div className="grid grid-cols-2 gap-2 mt-5">
            <button
              type="button"
              onClick={() => switchMode('LOGIN')}
              className={`py-2 font-mono text-xs font-bold uppercase border border-black cursor-pointer transition-colors ${mode === 'LOGIN'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F4F4F4]'
                }`}
            >
              SIGN IN
            </button>
            <button
              type="button"
              onClick={() => switchMode('REGISTER')}
              className={`py-2 font-mono text-xs font-bold uppercase border border-black cursor-pointer transition-colors ${mode === 'REGISTER'
                ? 'bg-black text-white'
                : 'bg-white text-black hover:bg-[#F4F4F4]'
                }`}
            >
              REGISTER
            </button>
          </div>
        )}

        {statusMessage && (
          <div className="mt-4 border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs text-black">
            {statusMessage}
          </div>
        )}

        {errorMessage && (
          <div className="mt-4 border border-red-700 bg-red-50 px-3 py-2 font-mono text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="mt-5 space-y-4">
          {mode === 'REGISTER' && (
            <div>
              <label
                htmlFor="modal-fullname"
                className="block font-mono text-[11px] uppercase mb-1"
              >
                Full Name
              </label>
              <input
                id="modal-fullname"
                type="text"
                autoComplete="name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (fieldErrors.fullName) {
                    setFieldErrors((prev) => ({ ...prev, fullName: undefined }));
                  }
                }}
                placeholder="Nguyen Van A"
                className={`w-full border px-3 py-2.5 text-sm focus:outline-none ${fieldErrors.fullName ? 'border-red-700 bg-red-50/40' : 'border-black'
                  }`}
              />
              {fieldErrors.fullName && (
                <p className="mt-1 font-mono text-[11px] text-red-700">
                  {fieldErrors.fullName}
                </p>
              )}
            </div>
          )}

          <div>
            <label
              htmlFor="modal-email"
              className="block font-mono text-[11px] uppercase mb-1"
            >
              Email
            </label>
            <input
              id="modal-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (fieldErrors.email) {
                  setFieldErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              placeholder="example@lagiism.com"
              className={`w-full border px-3 py-2.5 text-sm focus:outline-none ${fieldErrors.email ? 'border-red-700 bg-red-50/40' : 'border-black'
                }`}
            />
            {fieldErrors.email && (
              <p className="mt-1 font-mono text-[11px] text-red-700">
                {fieldErrors.email}
              </p>
            )}
          </div>

          {mode === 'RESET' && (
            <div>
              <label
                htmlFor="modal-otp"
                className="block font-mono text-[11px] uppercase mb-1"
              >
                6-Digit OTP (Expires in 5 Min)
              </label>
              <input
                id="modal-otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={otp}
                onChange={(e) => {
                  setOtp(e.target.value.replace(/\D/g, ''));
                  if (fieldErrors.otp) {
                    setFieldErrors((prev) => ({ ...prev, otp: undefined }));
                  }
                }}
                placeholder="000000"
                className={`w-full border px-3 py-2.5 font-mono text-sm tracking-[0.25em] focus:outline-none ${fieldErrors.otp ? 'border-red-700 bg-red-50/40' : 'border-black'
                  }`}
              />
              {fieldErrors.otp && (
                <p className="mt-1 font-mono text-[11px] text-red-700">
                  {fieldErrors.otp}
                </p>
              )}
            </div>
          )}

          {(mode === 'LOGIN' || mode === 'REGISTER' || mode === 'RESET') && (
            <div>
              <label
                htmlFor="modal-password"
                className="block font-mono text-[11px] uppercase mb-1"
              >
                {mode === 'RESET' ? 'New Password (min 8 chars)' : `Password${mode === 'REGISTER' ? ' (min 8 chars)' : ''}`}
              </label>
              <input
                id="modal-password"
                type="password"
                autoComplete={mode === 'LOGIN' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (fieldErrors.password) {
                    setFieldErrors((prev) => ({ ...prev, password: undefined }));
                  }
                }}
                className={`w-full border px-3 py-2.5 text-sm focus:outline-none ${fieldErrors.password ? 'border-red-700 bg-red-50/40' : 'border-black'
                  }`}
              />
              {fieldErrors.password && (
                <p className="mt-1 font-mono text-[11px] text-red-700">
                  {fieldErrors.password}
                </p>
              )}
            </div>
          )}

          {(mode === 'REGISTER' || mode === 'RESET') && (
            <div>
              <label
                htmlFor="modal-confirm-password"
                className="block font-mono text-[11px] uppercase mb-1"
              >
                {mode === 'RESET' ? 'Confirm New Password' : 'Confirm Password'}
              </label>
              <input
                id="modal-confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (fieldErrors.confirmPassword) {
                    setFieldErrors((prev) => ({ ...prev, confirmPassword: undefined }));
                  }
                }}
                className={`w-full border px-3 py-2.5 text-sm focus:outline-none ${fieldErrors.confirmPassword ? 'border-red-700 bg-red-50/40' : 'border-black'
                  }`}
              />
              {fieldErrors.confirmPassword && (
                <p className="mt-1 font-mono text-[11px] text-red-700">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full bg-black text-white py-3 font-mono text-xs font-bold uppercase tracking-[0.08em] hover:bg-[#222222] disabled:opacity-50 cursor-pointer"
          >
            {busy
              ? 'PROCESSING...'
              : mode === 'LOGIN'
                ? 'SIGN IN'
                : mode === 'REGISTER'
                  ? 'CREATE ACCOUNT'
                  : mode === 'FORGOT'
                    ? 'SEND 5-MIN OTP'
                    : 'RESET PASSWORD'}
          </button>

          {mode === 'LOGIN' && (
            <button
              type="button"
              onClick={() => switchMode('FORGOT')}
              className="w-full text-center font-mono text-[11px] uppercase underline underline-offset-4 text-[#555555] hover:text-black cursor-pointer"
            >
              Forgot Password?
            </button>
          )}

          {(mode === 'FORGOT' || mode === 'RESET') && (
            <button
              type="button"
              onClick={() => switchMode('LOGIN')}
              className="w-full text-center font-mono text-[11px] uppercase underline underline-offset-4 text-[#555555] hover:text-black cursor-pointer"
            >
              ← Back to Sign In
            </button>
          )}
        </form>

        {(mode === 'LOGIN' || mode === 'REGISTER') && (
          <>
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-[#E0E0E0]" />
              <span className="font-mono text-[10px] uppercase text-[#555555]">OR</span>
              <div className="h-px flex-1 bg-[#E0E0E0]" />
            </div>

            {googleClientId ? (
              <div ref={googleBtnRef} className="w-full flex justify-center min-h-[42px]" />
            ) : (
              <div className="border border-dashed border-[#999999] p-3 text-center font-mono text-[11px] text-[#555555]">
                Google Sign-In ready — set <code>VITE_GOOGLE_CLIENT_ID</code> in `.env`.
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
