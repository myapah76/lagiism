import { create } from 'zustand';

export type Locale = 'en' | 'vi';

interface UiState {
  locale: Locale;
  isBagOpen: boolean;
  setLocale: (locale: Locale) => void;
  setBagOpen: (open: boolean) => void;
}

export const useUiStore = create<UiState>((set) => ({
  locale: 'en',
  isBagOpen: false,
  setLocale: (locale) => set({ locale }),
  setBagOpen: (isBagOpen) => set({ isBagOpen }),
}));
