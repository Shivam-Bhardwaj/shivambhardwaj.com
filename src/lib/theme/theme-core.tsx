'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { logger } from '@/lib/logging';
import { config } from '@/config';
import type { ThemePreferences, ThemeState, ThemeMode, ColorScheme, FontSize, AnimationLevel } from './types';

const DEFAULT_THEME: ThemePreferences = {
	mode: config.ui.theme.defaultMode as ThemeMode,
	colorScheme: 'blue',
	fontSize: 'medium',
	animationLevel: 'normal',
	highContrast: false,
	reduceMotion: false,
	compactMode: false,
};

const THEME_STORAGE_KEY = 'portfolio-theme-preferences';

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
			logger.info('ThemeManager initialized', { preferences: this.preferences, systemTheme: this.systemTheme });
		}
	}

	private initializeSystemTheme(): void {
		if (!this.isClient) return;
		this.mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
		this.systemTheme = this.mediaQuery.matches ? 'dark' : 'light';
		this.mediaQuery.addEventListener('change', (e: MediaQueryListEvent) => {
			this.systemTheme = e.matches ? 'dark' : 'light';
			logger.info('System theme changed', { systemTheme: this.systemTheme });
			this.notifyListeners();
			if (this.preferences.mode === 'system') this.applyTheme();
		});
		const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
		motionQuery.addEventListener('change', (e: MediaQueryListEvent) => {
			if (e.matches && !this.preferences.reduceMotion) {
				this.updatePreferences({ reduceMotion: true, animationLevel: 'none' });
				logger.info('Reduced motion preference detected');
			}
		});
		if (motionQuery.matches) {
			this.preferences.reduceMotion = true;
			this.preferences.animationLevel = 'none';
		}
	}

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

	private savePreferences(): void {
		if (!this.isClient) return;
		try {
			localStorage.setItem(THEME_STORAGE_KEY, JSON.stringify(this.preferences));
			logger.debug('Theme preferences saved');
		} catch (error) {
			logger.error('Failed to save theme preferences', error as Error);
		}
	}

	private applyTheme(): void {
		if (!this.isClient) return;
		const resolvedTheme = this.getResolvedTheme();
		const root = document.documentElement;
		root.classList.remove('light', 'dark');
		root.classList.add(resolvedTheme);
		root.setAttribute('data-color-scheme', this.preferences.colorScheme);
		root.setAttribute('data-font-size', this.preferences.fontSize);
		root.setAttribute('data-animation-level', this.preferences.animationLevel);
		if (this.preferences.highContrast) root.classList.add('high-contrast'); else root.classList.remove('high-contrast');
		if (this.preferences.reduceMotion || this.preferences.animationLevel === 'none') root.classList.add('reduce-motion'); else root.classList.remove('reduce-motion');
		if (this.preferences.compactMode) root.classList.add('compact-mode'); else root.classList.remove('compact-mode');
		if (this.preferences.customAccentColor) root.style.setProperty('--accent-color', this.preferences.customAccentColor); else root.style.removeProperty('--accent-color');
		if (this.preferences.customFontFamily) root.style.setProperty('--font-family-custom', this.preferences.customFontFamily); else root.style.removeProperty('--font-family-custom');
		this.updateMetaThemeColor(resolvedTheme);
		logger.info('Theme applied', { resolvedTheme, preferences: this.preferences });
	}

	private updateMetaThemeColor(theme: 'light' | 'dark'): void {
		const metaThemeColor = document.querySelector('meta[name="theme-color"]');
		if (metaThemeColor) metaThemeColor.setAttribute('content', theme === 'dark' ? '#1f2937' : '#ffffff');
	}

	private getResolvedTheme(): 'light' | 'dark' {
		return this.preferences.mode === 'system' ? this.systemTheme : (this.preferences.mode as 'light' | 'dark');
	}

	getThemeState(): ThemeState { return { ...this.preferences, resolvedTheme: this.getResolvedTheme(), systemTheme: this.systemTheme, isLoading: false }; }

	updatePreferences(updates: Partial<ThemePreferences>): void {
		const oldPreferences = { ...this.preferences };
		this.preferences = { ...this.preferences, ...updates };
		this.savePreferences();
		this.applyTheme();
		this.notifyListeners();
		logger.info('Theme preferences updated', { oldPreferences, newPreferences: this.preferences, updates });
	}

	toggleMode(): void {
		const currentMode = this.preferences.mode;
		const newMode: ThemeMode = currentMode === 'system' ? (this.systemTheme === 'dark' ? 'light' : 'dark') : currentMode === 'light' ? 'dark' : 'light';
		this.updatePreferences({ mode: newMode });
	}

	resetToDefaults(): void { this.preferences = { ...DEFAULT_THEME }; this.savePreferences(); this.applyTheme(); this.notifyListeners(); logger.info('Theme reset to defaults'); }
	exportPreferences(): string { return JSON.stringify(this.preferences, null, 2); }
	importPreferences(preferencesJson: string): boolean { try { const imported = JSON.parse(preferencesJson); const validated = this.validatePreferences(imported); this.preferences = validated; this.savePreferences(); this.applyTheme(); this.notifyListeners(); logger.info('Theme preferences imported successfully'); return true; } catch (e) { logger.error('Failed to import theme preferences', e as Error); return false; } }

	private validatePreferences(preferences: unknown): ThemePreferences {
		if (typeof preferences !== 'object' || preferences == null) return { ...DEFAULT_THEME };
		const p = preferences as Record<string, unknown>;
		const validated: ThemePreferences = { ...DEFAULT_THEME };
		if (['light','dark','system'].includes(String(p.mode))) validated.mode = p.mode as ThemeMode;
		if (['blue','green','purple','orange','red'].includes(String(p.colorScheme))) validated.colorScheme = p.colorScheme as ColorScheme;
		if (['small','medium','large'].includes(String(p.fontSize))) validated.fontSize = p.fontSize as FontSize;
		if (['none','reduced','normal','enhanced'].includes(String(p.animationLevel))) validated.animationLevel = p.animationLevel as AnimationLevel;
		if (typeof p.highContrast === 'boolean') validated.highContrast = p.highContrast;
		if (typeof p.reduceMotion === 'boolean') validated.reduceMotion = p.reduceMotion;
		if (typeof p.compactMode === 'boolean') validated.compactMode = p.compactMode;
		if (typeof p.customAccentColor === 'string' && p.customAccentColor) validated.customAccentColor = p.customAccentColor;
		if (typeof p.customFontFamily === 'string' && p.customFontFamily) validated.customFontFamily = p.customFontFamily;
		return validated;
	}

	subscribe(listener: (theme: ThemeState) => void): () => void { this.listeners.add(listener); return () => { this.listeners.delete(listener); }; }
	private notifyListeners(): void { const t = this.getThemeState(); this.listeners.forEach(l => { try { l(t); } catch (e) { logger.error('Theme listener error', e as Error); } }); }
	isDarkMode(): boolean { return this.getResolvedTheme() === 'dark'; }
	getColor(lightColor: string, darkColor: string): string { return this.isDarkMode() ? darkColor : lightColor; }
	getCSSCustomProperties(): Record<string,string> { const r = this.getResolvedTheme(); const props: Record<string,string> = { '--theme-mode': r, '--color-scheme': this.preferences.colorScheme, '--font-size-scale': this.getFontSizeScale(), '--animation-duration': this.getAnimationDuration() }; if (this.preferences.highContrast) props['--contrast-multiplier']='1.5'; if (this.preferences.compactMode) props['--spacing-scale']='0.85'; return props; }
	private getFontSizeScale(): string { return this.preferences.fontSize === 'small' ? '0.875' : this.preferences.fontSize === 'large' ? '1.125' : '1'; }
	private getAnimationDuration(): string { return this.preferences.animationLevel === 'none' ? '0ms' : this.preferences.animationLevel === 'reduced' ? '150ms' : this.preferences.animationLevel === 'enhanced' ? '500ms' : '300ms'; }
	destroy(): void { this.mediaQuery = null; this.listeners.clear(); logger.info('ThemeManager destroyed'); }
}

export const themeManager = typeof window !== 'undefined' ? new ThemeManager() : null;
export const ThemeContext = createContext<ThemeState | null>(null);
export interface ThemeProviderProps { children: React.ReactNode; }
export function ThemeProvider({ children }: ThemeProviderProps) { const [themeState, setThemeState] = useState<ThemeState>({ ...DEFAULT_THEME, resolvedTheme: 'light', systemTheme: 'light', isLoading: true }); useEffect(() => { if (!themeManager) return; setThemeState(themeManager.getThemeState()); const unsub = themeManager.subscribe((t)=>{ setThemeState(t); }); return unsub; }, []); return <ThemeContext.Provider value={themeState}>{children}</ThemeContext.Provider>; }
export function useTheme() { const context = useContext(ThemeContext); if (!context) throw new Error('useTheme must be used within a ThemeProvider'); const updatePreferences = (u: Partial<ThemePreferences>) => { if (themeManager) themeManager.updatePreferences(u); }; const toggleMode = () => { if (themeManager) themeManager.toggleMode(); }; const resetToDefaults = () => { if (themeManager) themeManager.resetToDefaults(); }; return { ...context, updatePreferences, toggleMode, resetToDefaults, isDarkMode: context.resolvedTheme === 'dark', isLightMode: context.resolvedTheme === 'light', isSystemMode: context.mode === 'system' }; }
export const ThemeUtils = { getContrastingTextColor(backgroundColor: string): 'light' | 'dark' { const hex = backgroundColor.replace('#',''); const r=parseInt(hex.substring(0,2),16); const g=parseInt(hex.substring(2,4),16); const b=parseInt(hex.substring(4,6),16); const brightness=(r*299+g*587+b*114)/1000; return brightness>128?'dark':'light'; }, getThemeClasses(base: string, darkClasses?: string): string { if (!themeManager) return base; const isDark = themeManager.isDarkMode(); return isDark && darkClasses ? `${base} ${darkClasses}` : base; }, applyTransition(el: HTMLElement, duration=300): void { el.style.transition=`all ${duration}ms ease-in-out`; setTimeout(()=>{ el.style.transition=''; }, duration); }, createMediaQueries(): Record<string,string> { return { light:'(prefers-color-scheme: light)', dark:'(prefers-color-scheme: dark)', reducedMotion:'(prefers-reduced-motion: reduce)', highContrast:'(prefers-contrast: high)' }; } };
export const COLOR_SCHEMES = { blue:{ primary:'rgb(59, 130, 246)', primaryDark:'rgb(37, 99, 235)', secondary:'rgb(147, 197, 253)', accent:'rgb(219, 234, 254)' }, green:{ primary:'rgb(34, 197, 94)', primaryDark:'rgb(22, 163, 74)', secondary:'rgb(134, 239, 172)', accent:'rgb(220, 252, 231)' }, purple:{ primary:'rgb(147, 51, 234)', primaryDark:'rgb(126, 34, 206)', secondary:'rgb(196, 181, 253)', accent:'rgb(237, 233, 254)' }, orange:{ primary:'rgb(249, 115, 22)', primaryDark:'rgb(234, 88, 12)', secondary:'rgb(253, 186, 116)', accent:'rgb(255, 237, 213)' }, red:{ primary:'rgb(239, 68, 68)', primaryDark:'rgb(220, 38, 38)', secondary:'rgb(252, 165, 165)', accent:'rgb(254, 226, 226)' } } as const;
