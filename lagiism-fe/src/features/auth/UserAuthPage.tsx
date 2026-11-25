import { FormEvent, useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/auth.store';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential?: string }) => void;
          }) => void;
          renderButton: (
            element: HTMLElement,
            options: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

interface UserAuthPageProps {
  initialMode?: 'LOGIN' | 'REGISTER';
}

export function UserAuthPage({ initialMode = 'LOGIN' }: UserAuthPageProps) {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, loading } = useAuthStore();
  const googleBtnRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>(initialMode);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    if (!googleClientId || !googleBtnRef.current || !window.google?.accounts?.id) {
      return;
    }
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        if (!response.credential) return;
        setErrorMessage(null);
        try {
          await loginWithGoogle(response.credential);
          navigate('/', { replace: true });
        } catch {
          setErrorMessage('Google sign-in failed. Please try again.');
        }
      },
    });
    window.google.accounts.id.renderButton(googleBtnRef.current, {
      theme: 'outline',
      size: 'large',
      width: '100%',
      text: mode === 'REGISTER' ? 'signup_with' : 'signin_with',
    });
  }, [googleClientId, mode, loginWithGoogle, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    try {
      if (mode === 'REGISTER') {
        await register(email, fullName, password);
      } else {
        await login(email, password);
      }
      navigate('/', { replace: true });
    } catch {
      setErrorMessage(
        mode === 'REGISTER'
          ? 'Could not create account. Email may already be registered.'
          : 'Invalid email or password.'
      );
    }
  };

  return (
    <div className="min-h-screen bg-white text-black flex items-center justify-center p-6">
      <div className="w-full max-w-md border border-black p-8">
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="font-mono text-[11px] uppercase tracking-[0.08em] text-[#555555] hover:text-black"
          >
            ← LAGIISM ARCHIVE
          </Link>
          <span className="font-mono text-[10px] uppercase text-[#555555]">
            MEMBER ACCESS
          </span>
        </div>

        <h1 className="text-2xl font-black uppercase tracking-[-0.03em] mt-4">
          {mode === 'LOGIN' ? 'SIGN IN' : 'CREATE ACCOUNT'}
        </h1>

        <div className="grid grid-cols-2 gap-2 mt-5">
          <button
            type="button"
            onClick={() => {
              setMode('LOGIN');
              setErrorMessage(null);
            }}
            className={`py-2 font-mono text-xs uppercase border border-black cursor-pointer ${
              mode === 'LOGIN' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            SIGN IN
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('REGISTER');
              setErrorMessage(null);
            }}
            className={`py-2 font-mono text-xs uppercase border border-black cursor-pointer ${
              mode === 'REGISTER' ? 'bg-black text-white' : 'bg-white text-black'
            }`}
          >
            REGISTER
          </button>
        </div>

        {errorMessage && (
          <div className="mt-4 border border-black bg-[#F4F4F4] px-3 py-2 font-mono text-xs text-red-700">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'REGISTER' && (
            <div>
              <label className="block font-mono text-[11px] uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
          )}

          <div>
            <label className="block font-mono text-[11px] uppercase mb-1">Email</label>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-black px-3 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-mono text-[11px] uppercase mb-1">
              Password {mode === 'REGISTER' && '(min 8 chars)'}
            </label>
            <input
              type="password"
              required
              minLength={mode === 'REGISTER' ? 8 : 1}
              autoComplete={mode === 'REGISTER' ? 'new-password' : 'current-password'}
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
            {loading
              ? 'PROCESSING...'
              : mode === 'LOGIN'
                ? 'SIGN IN'
                : 'CREATE ACCOUNT'}
          </button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E0E0E0]" />
          <span className="font-mono text-[10px] uppercase text-[#555555]">OR</span>
          <div className="h-px flex-1 bg-[#E0E0E0]" />
        </div>

        {googleClientId ? (
          <div ref={googleBtnRef} className="w-full flex justify-center" />
        ) : (
          <div className="border border-dashed border-[#999999] p-3 text-center font-mono text-[11px] text-[#555555]">
            Google Sign-In ready — set <code>VITE_GOOGLE_CLIENT_ID</code> to enable.
          </div>
        )}
      </div>
    </div>
  );
}
