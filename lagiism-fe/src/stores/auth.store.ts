import { create } from 'zustand';
import { authService } from '../services/auth.service';
import { AuthUser } from '../types/api';

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: AuthUser | null) => void;
  checkSession: () => Promise<void>;
  register: (email: string, fullName: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,

  setUser(user) {
    set({ user });
  },

  async checkSession() {
    set({ loading: true });
    try {
      await authService.fetchCsrf();
      const user = await authService.me();
      set({ user, loading: false, initialized: true });
    } catch {
      set({ user: null, loading: false, initialized: true });
    }
  },

  async register(email: string, fullName: string, password: string) {
    set({ loading: true });
    try {
      const res = await authService.register(email, fullName, password);
      set({ user: res.user, loading: false, initialized: true });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  async login(email: string, password: string) {
    set({ loading: true });
    try {
      const res = await authService.login(email, password);
      set({ user: res.user, loading: false, initialized: true });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  async loginWithGoogle(idToken: string) {
    set({ loading: true });
    try {
      const res = await authService.loginWithGoogle(idToken);
      set({ user: res.user, loading: false, initialized: true });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  async logout() {
    set({ loading: true });
    try {
      await authService.logout();
    } finally {
      set({ user: null, loading: false, initialized: true });
    }
  },
}));
