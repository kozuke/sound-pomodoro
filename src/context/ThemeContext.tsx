import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, THEMES, DEFAULT_THEME_ID } from '../constants/themes';

const THEME_STORAGE_KEY = 'pomodoro-theme';

interface ThemeContextType {
  currentTheme: Theme;
  changeTheme: (themeId: string) => void;
  availableThemes: Theme[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState<Theme>(() => {
    // 初期化時にlocalStorageから設定を読み込み
    const savedThemeId = localStorage.getItem(THEME_STORAGE_KEY);
    const theme = THEMES.find(t => t.id === savedThemeId);
    return theme || THEMES.find(t => t.id === DEFAULT_THEME_ID)!;
  });

  // テーマ変更関数
  const changeTheme = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId);
    if (theme) {
      setCurrentTheme(theme);
      localStorage.setItem(THEME_STORAGE_KEY, themeId);
    }
  };

  const value: ThemeContextType = {
    currentTheme,
    changeTheme,
    availableThemes: THEMES,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}; 