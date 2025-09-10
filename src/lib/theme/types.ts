// Shared theme type definitions extracted to avoid circular barrel issues.
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
