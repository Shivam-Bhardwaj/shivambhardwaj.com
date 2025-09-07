"use client";
import { useEffect, useState } from 'react';
import { themeManager } from '@/lib/theme';
import { THEME_PRESETS, applyCustomTheme, CUSTOM_THEME_KEY } from '@/lib/theme/presets';

interface CustomThemeState {
  primary: string;
  secondary: string;
}

const DEFAULT_CUSTOM: CustomThemeState = { primary: '#334155', secondary: '#0d9488' };

function loadCustom(): CustomThemeState {
  if (typeof window === 'undefined') return DEFAULT_CUSTOM;
  try {
    const raw = localStorage.getItem(CUSTOM_THEME_KEY);
    if (!raw) return DEFAULT_CUSTOM;
    const parsed = JSON.parse(raw);
    if (parsed.primary && parsed.secondary) return parsed;
    return DEFAULT_CUSTOM;
  } catch {
    return DEFAULT_CUSTOM;
  }
}

export default function ThemePresetSwitcher() {
  const [activePreset, setActivePreset] = useState<string>('');
  const [custom, setCustom] = useState<CustomThemeState>(loadCustom());
  const [expanded, setExpanded] = useState(false);

  // Apply custom theme if stored
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const root = document.documentElement;
    if (activePreset === 'custom') {
      applyCustomTheme(root, custom.primary, custom.secondary);
    }
  }, [activePreset, custom]);

  // Rehydrate stored chosen preset
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('antimony-active-preset');
    if (stored) {
      if (stored === 'custom') {
        setActivePreset('custom');
        const c = loadCustom();
        setCustom(c);
        const root = document.documentElement;
        applyCustomTheme(root, c.primary, c.secondary);
      } else {
        setActivePreset(stored);
        // Could adjust preferences via themeManager if needed
      }
    } else {
  setActivePreset(THEME_PRESETS[0]?.id ?? '');
    }
  }, []);

  function choosePreset(id: string) {
    setActivePreset(id);
    localStorage.setItem('antimony-active-preset', id);
    if (id !== 'custom') {
      // Optionally: reset to defaults then apply accent hints
      themeManager?.updatePreferences({ colorScheme: 'blue' });
    }
  }

  function updateCustom(field: keyof CustomThemeState, value: string) {
    const next = { ...custom, [field]: value };
    setCustom(next);
    localStorage.setItem(CUSTOM_THEME_KEY, JSON.stringify(next));
    if (activePreset === 'custom') {
      const root = document.documentElement;
      applyCustomTheme(root, next.primary, next.secondary);
    }
  }

  return (
    <div className="w-full max-w-md mx-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur p-4 shadow-sm">
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300"
      >
        <span>Theme Options</span>
        <span className="text-xs text-gray-500">{expanded ? 'Hide' : 'Show'}</span>
      </button>
      {expanded && (
        <div className="mt-4 space-y-6">
          <div className="grid grid-cols-3 gap-3">
            {THEME_PRESETS.map(p => (
              <button
                key={p.id}
                onClick={() => choosePreset(p.id)}
                className={`group relative rounded-lg p-3 border text-left transition focus:outline-none focus:ring-2 focus:ring-primary-500 hover:shadow ${activePreset===p.id ? 'border-primary-500 ring-1 ring-primary-500' : 'border-gray-200 dark:border-gray-700'}`}
                style={{ background: `linear-gradient(135deg, ${p.primary} 0%, ${p.secondary} 100%)` }}
              >
                <span className="block text-xs font-semibold drop-shadow text-white">
                  {p.name}
                </span>
                <span className="block mt-4 text-[10px] text-white/80 line-clamp-2">
                  {p.description}
                </span>
              </button>
            ))}
            <button
              onClick={() => choosePreset('custom')}
              className={`rounded-lg p-3 border flex flex-col items-start justify-between transition focus:outline-none focus:ring-2 focus:ring-primary-500 hover:shadow ${activePreset==='custom' ? 'border-primary-500 ring-1 ring-primary-500' : 'border-dashed border-gray-300 dark:border-gray-600'}`}
            >
              <span className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-300">Custom</span>
              <div className="flex gap-2 w-full h-6">
                <span style={{ background: custom.primary }} className="flex-1 rounded" />
                <span style={{ background: custom.secondary }} className="flex-1 rounded" />
              </div>
              <span className="mt-2 text-[10px] text-gray-500 dark:text-gray-400">Pick colors</span>
            </button>
          </div>

          {activePreset === 'custom' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-medium w-20 text-gray-600 dark:text-gray-400">Primary</label>
                <input
                  type="color"
                  value={custom.primary}
                  onChange={e => updateCustom('primary', e.target.value)}
                  className="h-9 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-transparent"
                  aria-label="Primary color"
                />
                <code className="text-[10px] text-gray-500 dark:text-gray-400">{custom.primary}</code>
              </div>
              <div className="flex items-center justify-between gap-4">
                <label className="text-xs font-medium w-20 text-gray-600 dark:text-gray-400">Secondary</label>
                <input
                  type="color"
                  value={custom.secondary}
                  onChange={e => updateCustom('secondary', e.target.value)}
                  className="h-9 w-16 cursor-pointer rounded border border-gray-300 dark:border-gray-600 bg-transparent"
                  aria-label="Secondary color"
                />
                <code className="text-[10px] text-gray-500 dark:text-gray-400">{custom.secondary}</code>
              </div>
              <p className="text-[10px] text-gray-500 leading-relaxed">
                A full tonal scale is generated from each selected seed. This preview immediately applies live by updating CSS variables (no reload). Values persist in local storage.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
