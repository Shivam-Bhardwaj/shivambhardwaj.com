'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logging';
import { config } from '@/config';

// Theme types
export type ThemeMode = 'light' | 'dark' | 'system';
export type ColorScheme = 'blue' | 'green' | 'purple' | 'orange' | 'red';
export type FontSize = 'small' | 'medium' | 'large';
export type AnimationLevel = 'none' | 'reduced' | 'normal' | 'enhanced';

export interface ThemePreferences {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  fontSize: FontSize;
  animationLevel: AnimationLevel;
  highContrast: boolean;
  reduceMotion: boolean;
  compactMode: boolean;
  customAccentColor?: string;
  customFontFamily?: string;
}

export interface ThemeState extends ThemePreferences {
  resolvedTheme: 'light' | 'dark';
  systemTheme: 'light' | 'dark';
  isLoading: boolean;
}

// Default theme preferences
const DEFAULT_THEME: ThemePreferences = {
  mode: config.ui.theme.defaultMode as ThemeMode,
  colorScheme: 'blue',
  fontSize: 'medium',
  animationLevel: 'normal',
  highContrast: false,
  reduceMotion: false,
  compactMode: false,
};

// Theme storage key
const THEME_STORAGE_KEY = 'portfolio-theme-preferences';

/**
 * Theme Management System
 */
export class ThemeManager {
  private preferences: ThemePreferences = DEFAULT_THEME;
  private systemTheme: 'light' | 'dark' = 'light';
  private mediaQuery: MediaQueryList | null = null;
  private listeners: Set<(theme: ThemeState) => void> = new Set();
  private isClient: boolean = typeof window !== 'undefined';

  constructor() {
    if (this.isClient) {
      this.initializeSystemTheme();
      this.loadPreferences();
      this.applyTheme();
      
      logger.info('ThemeManager initialized', { 
        preferences: this.preferences,
        systemTheme: this.systemTheme 
      });
    }
  }

  /**
   * Initialize system theme detection
   */
  private initializeSystemTheme(): void {
    if (!this.isClient) return;

    this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';

    // Listen for system theme changes
    this.mediaQuery.addEventListener('change', (e) => {
      this.systemTheme = e.matches ? 'dark' : 'light';
      logger.info('System theme changed', { systemTheme: this.systemTheme });
      this.notifyListeners();
      
      if (this.preferences.mode === 'system') {
        this.applyTheme();
      }
    });

    // Listen for reduced motion preference changes
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      if (e.matches && !this.preferences.reduceMotion) {
        this.updatePreferences({ reduceMotion: true, animationLevel: 'none' });
        logger.info('Reduced motion preference detected');
      }
    });

    // Check initial reduced motion preference
    if (motionQuery.matches) {
      this.preferences.reduceMotion = true;
      this.preferences.animationLevel = 'none';
    }
  }

  /**
   * Load theme preferences from localStorage
   */
  private loadPreferences(): void {
    if (!this.isClient) return;

    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        this.preferences = { ...DEFAULT_THEME, ...parsed };
        logger.info('Theme preferences loaded', { preferences: this.preferences });
      }
    } catch (error) {
      logger.error('Failed to load theme preferences', error as Error);
      this.preferences = DEFAULT_THEME;
    }
  }

  /**
   * Save theme preferences to localStorage
   */
  private savePreferences(): void {
    if (!this.isClient) return;

    try {
      localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.preferences));
      logger.debug('Theme preferences saved');
    } catch (error) {
      logger.error('Failed to save theme preferences', error as Error);
    }
  }

  /**
   * Apply theme to the document
   */
  private applyTheme(): void {
    if (!this.isClient) return;

    const resolvedTheme = this.getResolvedTheme();
    const root = document.documentElement;

    // Apply theme class
    root.classList.remove('light', 'dark');
    root.classList.add(resolvedTheme);

    // Apply color scheme
    root.setAttribute('data-color-scheme', this.preferences.colorScheme);

    // Apply font size
    root.setAttribute('data-font-size', this.preferences.fontSize);

    // Apply animation level
    root.setAttribute('data-animation-level', this.preferences.animationLevel);

    // Apply accessibility preferences
    if (this.preferences.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (this.preferences.reduceMotion || this.preferences.animationLevel === 'none') {
      root.classList.add('reduce-motion');
    } else {
      root.classList.remove('reduce-motion');
    }

    if (this.preferences.compactMode) {
      root.classList.add('compact-mode');
    } else {
      root.classList.remove('compact-mode');
    }

    // Apply custom accent color
    if (this.preferences.customAccentColor) {
      root.style.setProperty('--accent-color', this.preferences.customAccentColor);
    } else {
      root.style.removeProperty('--accent-color');
    }

    // Apply custom font family
    if (this.preferences.customFontFamily) {
      root.style.setProperty('--font-family-custom', this.preferences.customFontFamily);
    } else {
      root.style.removeProperty('--font-family-custom');
    }

    // Update meta theme-color
    this.updateMetaThemeColor(resolvedTheme);

    logger.info('Theme applied', { 
      resolvedTheme, 
      preferences: this.preferences 
    });
  }

  /**
   * Update meta theme-color for mobile browsers
   */
  private updateMetaThemeColor(theme: 'light' | 'dark'): void {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = theme === 'dark' ? '#1f2937' : '#ffffff';
      metaThemeColor.setAttribute('content', color);
    }
  }

  /**
   * Get resolved theme (light or dark)
   */
  private getResolvedTheme(): 'light' | 'dark' {
    if (this.preferences.mode === 'system') {
      return this.systemTheme;
    }
    return this.preferences.mode as 'light' | 'dark';
  }

  /**
   * Get current theme state
   */
  getThemeState(): ThemeState {
    return {
      ...this.preferences,
      resolvedTheme: this.getResolvedTheme(),
      systemTheme: this.systemTheme,
      isLoading: false,
    };
  }

  /**
   * Update theme preferences
   */
  updatePreferences(updates: Partial<ThemePreferences>): void {
    const oldPreferences = { ...this.preferences };
    this.preferences = { ...this.preferences, ...updates };
    
    this.savePreferences();
    this.applyTheme();
    this.notifyListeners();

    logger.info('Theme preferences updated', { 
      oldPreferences, 
      newPreferences: this.preferences,
      updates 
    });
  }

  /**
   * Toggle between light and dark mode
   */
  toggleMode(): void {
    const currentMode = this.preferences.mode;
    let newMode: ThemeMode;

    if (currentMode === 'system') {
      newMode = this.systemTheme === 'dark' ? 'light' : 'dark';
    } else if (currentMode === 'light') {
      newMode = 'dark';
    } else {
      newMode = 'light';
    }

    this.updatePreferences({ mode: newMode });
  }

  /**
   * Reset to default theme
   */
  resetToDefaults(): void {
    this.preferences = { ...DEFAULT_THEME };
    this.savePreferences();
    this.applyTheme();
    this.notifyListeners();

    logger.info('Theme reset to defaults');
  }

  /**
   * Export theme preferences
   */
  exportPreferences(): string {
    return JSON.stringify(this.preferences, null, 2);
  }

  /**
   * Import theme preferences
   */
  importPreferences(preferencesJson: string): boolean {
    try {
      const imported = JSON.parse(preferencesJson);
      
      // Validate imported preferences
      const validatedPreferences = this.validatePreferences(imported);
      
      this.preferences = validatedPreferences;
      this.savePreferences();
      this.applyTheme();
      this.notifyListeners();

      logger.info('Theme preferences imported successfully');
      return true;
    } catch (error) {
      logger.error('Failed to import theme preferences', error as Error);
      return false;
    }
  }

  /**
   * Validate theme preferences object
   */
  private validatePreferences(preferences: any): ThemePreferences {
    const validated: ThemePreferences = { ...DEFAULT_THEME };

    if (preferences.mode && ['light', 'dark', 'system'].includes(preferences.mode)) {
      validated.mode = preferences.mode;
    }

    if (preferences.colorScheme && ['blue', 'green', 'purple', 'orange', 'red'].includes(preferences.colorScheme)) {
      validated.colorScheme = preferences.colorScheme;
    }

    if (preferences.fontSize && ['small', 'medium', 'large'].includes(preferences.fontSize)) {
      validated.fontSize = preferences.fontSize;
    }

    if (preferences.animationLevel && ['none', 'reduced', 'normal', 'enhanced'].includes(preferences.animationLevel)) {
      validated.animationLevel = preferences.animationLevel;
    }

    if (typeof preferences.highContrast === 'boolean') {
      validated.highContrast = preferences.highContrast;
    }

    if (typeof preferences.reduceMotion === 'boolean') {
      validated.reduceMotion = preferences.reduceMotion;
    }

    if (typeof preferences.compactMode === 'boolean') {
      validated.compactMode = preferences.compactMode;
    }

    if (typeof preferences.customAccentColor === 'string' && preferences.customAccentColor) {
      validated.customAccentColor = preferences.customAccentColor;
    }

    if (typeof preferences.customFontFamily === 'string' && preferences.customFontFamily) {
      validated.customFontFamily = preferences.customFontFamily;
    }

    return validated;
  }

  /**
   * Add theme change listener
   */
  subscribe(listener: (theme: ThemeState) => void): () => void {
    this.listeners.add(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of theme changes
   */
  private notifyListeners(): void {
    const themeState = this.getThemeState();
    this.listeners.forEach(listener => {
      try {
        listener(themeState);
      } catch (error) {
        logger.error('Theme listener error', error as Error);
      }
    });
  }

  /**
   * Check if current theme is dark
   */
  isDarkMode(): boolean {
    return this.getResolvedTheme() === 'dark';
  }

  /**
   * Get theme-aware color value
   */
  getColor(lightColor: string, darkColor: string): string {
    return this.isDarkMode() ? darkColor : lightColor;
  }

  /**
   * Generate CSS custom properties for current theme
   */
  getCSSCustomProperties(): Record<string, string> {
    const resolvedTheme = this.getResolvedTheme();
    const properties: Record<string, string> = {};

    // Base theme properties
    properties['--theme-mode'] = resolvedTheme;
    properties['--color-scheme'] = this.preferences.colorScheme;
    properties['--font-size-scale'] = this.getFontSizeScale();
    properties['--animation-duration'] = this.getAnimationDuration();

    // Accessibility properties
    if (this.preferences.highContrast) {
      properties['--contrast-multiplier'] = '1.5';
    }

    if (this.preferences.compactMode) {
      properties['--spacing-scale'] = '0.85';
    }

    return properties;
  }

  private getFontSizeScale(): string {
    switch (this.preferences.fontSize) {
      case 'small': return '0.875';
      case 'large': return '1.125';
      default: return '1';
    }
  }

  private getAnimationDuration(): string {
    switch (this.preferences.animationLevel) {
      case 'none': return '0ms';
      case 'reduced': return '150ms';
      case 'enhanced': return '500ms';
      default: return '300ms';
    }
  }

  /**
   * Cleanup method
   */
  destroy(): void {
    if (this.mediaQuery) {
      // Note: removeEventListener with arrow functions doesn't work properly
      // This is a simplified cleanup - in production you'd store the handler reference
      this.mediaQuery = null;
    }
    
    this.listeners.clear();
    logger.info('ThemeManager destroyed');
  }
}

// Create singleton theme manager instance
export const themeManager = typeof window !== 'undefined' ? new ThemeManager() : null;

// React Context for theme
export const ThemeContext = createContext<ThemeState | null>(null);

// Theme provider component
export interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [themeState, setThemeState] = useState<ThemeState>({
    ...DEFAULT_THEME,
    resolvedTheme: 'light',
    systemTheme: 'light',
    isLoading: true,
  });

  useEffect(() => {
    if (!themeManager) return;

    // Initialize theme state
    setThemeState(themeManager.getThemeState());

    // Subscribe to theme changes
    const unsubscribe = themeManager.subscribe((theme) => {
      setThemeState(theme);
    });

    return unsubscribe;
  }, []);

  return (
    <ThemeContext.Provider value={themeState}>
      {children}
    </ThemeContext.Provider>
  );
}

// Custom hook for using theme
export function useTheme() {
  const context = useContext(ThemeContext);
  
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  const updatePreferences = (updates: Partial<ThemePreferences>) => {
    if (themeManager) {
      themeManager.updatePreferences(updates);
    }
  };

  const toggleMode = () => {
    if (themeManager) {
      themeManager.toggleMode();
    }
  };

  const resetToDefaults = () => {
    if (themeManager) {
      themeManager.resetToDefaults();
    }
  };

  return {
    ...context,
    updatePreferences,
    toggleMode,
    resetToDefaults,
    isDarkMode: context.resolvedTheme === 'dark',
    isLightMode: context.resolvedTheme === 'light',
    isSystemMode: context.mode === 'system',
  };
}

// Theme utilities
export const ThemeUtils = {
  /**
   * Get contrasting text color for a background color
   */
  getContrastingTextColor(backgroundColor: string): 'light' | 'dark' {
    // Simple contrast calculation - in production, use a proper color contrast library
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 128 ? 'dark' : 'light';
  },

  /**
   * Generate theme-aware class names
   */
  getThemeClasses(baseClasses: string, darkClasses?: string): string {
    if (!themeManager) return baseClasses;
    
    const isDark = themeManager.isDarkMode();
    return isDark && darkClasses ? `${baseClasses} ${darkClasses}` : baseClasses;
  },

  /**
   * Apply theme transition styles
   */
  applyTransition(element: HTMLElement, duration: number = 300): void {
    element.style.transition = `all ${duration}ms ease-in-out`;
    
    // Remove transition after completion to avoid interfering with other animations
    setTimeout(() => {
      element.style.transition = '';
    }, duration);
  },

  /**
   * Create responsive theme media queries
   */
  createMediaQueries(): Record<string, string> {
    return {
      light: '(prefers-color-scheme: light)',
      dark: '(prefers-color-scheme: dark)',
      reducedMotion: '(prefers-reduced-motion: reduce)',
      highContrast: '(prefers-contrast: high)',
    };
  }
};

// Export color scheme configurations
export const COLOR_SCHEMES = {
  blue: {
    primary: 'rgb(59, 130, 246)',
    primaryDark: 'rgb(37, 99, 235)',
    secondary: 'rgb(147, 197, 253)',
    accent: 'rgb(219, 234, 254)',
  },
  green: {
    primary: 'rgb(34, 197, 94)',
    primaryDark: 'rgb(22, 163, 74)',
    secondary: 'rgb(134, 239, 172)',
    accent: 'rgb(220, 252, 231)',
  },
  purple: {
    primary: 'rgb(147, 51, 234)',
    primaryDark: 'rgb(126, 34, 206)',
    secondary: 'rgb(196, 181, 253)',
    accent: 'rgb(237, 233, 254)',
  },
  orange: {
    primary: 'rgb(249, 115, 22)',
    primaryDark: 'rgb(234, 88, 12)',
    secondary: 'rgb(253, 186, 116)',
    accent: 'rgb(255, 237, 213)',
  },
  red: {
    primary: 'rgb(239, 68, 68)',
    primaryDark: 'rgb(220, 38, 38)',
    secondary: 'rgb(252, 165, 165)',
    accent: 'rgb(254, 226, 226)',
  },
} as const;