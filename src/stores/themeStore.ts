import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeType = 'modern' | 'oreui';

interface ThemeState {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'modern',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ 
        theme: state.theme === 'modern' ? 'oreui' : 'modern' 
      })),
    }),
    {
      name: 'theme-storage',
    }
  )
);
