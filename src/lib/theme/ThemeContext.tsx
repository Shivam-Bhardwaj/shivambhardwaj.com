"use client";
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
  isDark: boolean;
  colors: {
    text: {
      primary: string;
      secondary: string;
      muted: string;
      accent: string;
    };
    background: {
      primary: string;
      secondary: string;
      card: string;
      overlay: string;
    };
    border: {
      primary: string;
      secondary: string;
      accent: string;
    };
    robot: {
      leader: string;
      scout: string;
      worker: string;
      trail: {
        leader: string;
        scout: string;
        worker: string;
      };
    };
  };
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme color definitions
const getThemeColors = (theme: Theme) => ({
  text: {
    primary: theme === 'dark' ? 'rgb(243, 244, 246)' : 'rgb(31, 41, 55)',
    secondary: theme === 'dark' ? 'rgb(156, 163, 175)' : 'rgb(107, 114, 128)',
    muted: theme === 'dark' ? 'rgb(107, 114, 128)' : 'rgb(156, 163, 175)',
    accent: theme === 'dark' ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
  },
  background: {
    primary: theme === 'dark' ? 'rgb(17, 24, 39)' : 'rgb(255, 255, 255)',
    secondary: theme === 'dark' ? 'rgb(31, 41, 55)' : 'rgb(249, 250, 251)',
    card: theme === 'dark' ? 'rgb(31, 41, 55)' : 'rgb(255, 255, 255)',
    overlay: theme === 'dark' ? 'rgba(0, 0, 0, 0.08)' : 'rgba(255, 255, 255, 0.08)',
  },
  border: {
    primary: theme === 'dark' ? 'rgb(75, 85, 99)' : 'rgb(229, 231, 235)',
    secondary: theme === 'dark' ? 'rgb(55, 65, 81)' : 'rgb(243, 244, 246)',
    accent: theme === 'dark' ? 'rgb(59, 130, 246)' : 'rgb(37, 99, 235)',
  },
  robot: {
    leader: theme === 'dark' ? 'rgba(255, 215, 0, 0.9)' : 'rgba(218, 165, 32, 0.9)',
    scout: theme === 'dark' ? 'rgba(0, 255, 255, 0.9)' : 'rgba(0, 139, 139, 0.9)',
    worker: theme === 'dark' ? 'rgba(200, 200, 200, 0.9)' : 'rgba(100, 100, 100, 0.9)',
    trail: {
      leader: theme === 'dark' ? 'rgba(255, 215, 0, 0.7)' : 'rgba(218, 165, 32, 0.5)',
      scout: theme === 'dark' ? 'rgba(0, 255, 255, 0.6)' : 'rgba(0, 139, 139, 0.4)',
      worker: theme === 'dark' ? 'rgba(255, 255, 255, 0.6)' : 'rgba(100, 100, 100, 0.4)',
    },
  },
});

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('dark');

  useEffect(() => {
    // Check for saved theme or system preference
    if (typeof window === 'undefined') return;
    
    const savedTheme = localStorage?.getItem('theme');
    const systemTheme = window.matchMedia?.('(prefers-color-scheme: dark)')?.matches ? 'dark' : 'light';
    const initialTheme = (savedTheme as Theme) || systemTheme;
    
    setTheme(initialTheme);
    applyTheme(initialTheme);
  }, []);

  const applyTheme = (newTheme: Theme) => {
    // Apply both Tailwind dark class and data-theme attribute
    if (typeof document === 'undefined') return;
    
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.removeAttribute('data-theme');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    applyTheme(newTheme);
    if (typeof window !== 'undefined' && localStorage) {
      localStorage.setItem('theme', newTheme);
    }
  };

  const value: ThemeContextType = {
    theme,
    toggleTheme,
    isDark: theme === 'dark',
    colors: getThemeColors(theme),
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

// Utility hook for components that need theme-aware colors
export function useThemeColors() {
  const { colors, isDark } = useTheme();
  return { colors, isDark };
}