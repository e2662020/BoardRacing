import { create } from 'zustand';

export type ThemeType = 'dark' | 'light';

interface ThemeState {
  theme: ThemeType;
  toggleTheme: () => void;
  setTheme: (theme: ThemeType) => void;
}

export const useThemeStore = create<ThemeState>()(
  (set) => ({
    theme: 'dark',
    toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
    setTheme: (theme) => set({ theme }),
  })
);
