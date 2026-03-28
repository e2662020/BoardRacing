import React, { useEffect } from 'react';
import { useThemeStore } from '../stores';

interface ThemeProviderProps {
  children: React.ReactNode;
}

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { theme } = useThemeStore();

  useEffect(() => {
    // 移除之前的主题类
    document.body.classList.remove('theme-modern', 'theme-oreui');
    // 添加当前主题类
    document.body.classList.add(`theme-${theme}`);
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider;
