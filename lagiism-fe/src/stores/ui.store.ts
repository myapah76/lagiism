import { create } from 'zustand';

export type Locale = 'en' | 'vi';
export type AuthModalMode = 'LOGIN' | 'REGISTER';
export type AccountModalTab = 'PROFILE' | 'ORDERS' | 'PASSWORD';

interface UiState {
  locale: Locale;
  isBagOpen: boolean;
  isAuthModalOpen: boolean;
  authModalMode: AuthModalMode;
  isAccountModalOpen: boolean;
  accountModalTab: AccountModalTab;
  setLocale: (locale: Locale) => void;
  setBagOpen: (open: boolean) => void;
  openAuthModal: (mode?: AuthModalMode) => void;
  closeAuthModal: () => void;
  openAccountModal: (tab?: AccountModalTab) => void;
  closeAccountModal: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  locale: 'en',
  isBagOpen: false,
  isAuthModalOpen: false,
  authModalMode: 'LOGIN',
  isAccountModalOpen: false,
  accountModalTab: 'PROFILE',
  setLocale: (locale) => set({ locale }),
  setBagOpen: (isBagOpen) => set({ isBagOpen }),
  openAuthModal: (mode = 'LOGIN') =>
    set({ isAuthModalOpen: true, authModalMode: mode, isAccountModalOpen: false }),
  closeAuthModal: () => set({ isAuthModalOpen: false }),
  openAccountModal: (tab = 'PROFILE') =>
    set({ isAccountModalOpen: true, accountModalTab: tab, isAuthModalOpen: false }),
  closeAccountModal: () => set({ isAccountModalOpen: false }),
}));
