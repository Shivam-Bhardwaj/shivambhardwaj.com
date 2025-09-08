'use client';

import { ReactNode, useMemo } from 'react';
import { FeatureFlagProps } from '../../lib/components/types';

const featureFlags: Record<string, boolean> = {
  'robotics_enabled': true,
  'admin_tools': process.env.NODE_ENV === 'development',
  'experimental_ui': false,
  'performance_mode': true,
  'debug_mode': process.env.NODE_ENV === 'development',
  'analytics_enabled': process.env.NODE_ENV === 'production',
  '3d_rendering': true,
  'real_time_updates': true,
  'advanced_animations': true,
  'mobile_optimizations': true,
};

function getFeatureFlag(flag: string): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(`feature_flag_${flag}`);
    if (stored !== null) {
      return stored === 'true';
    }
  }
  
  return featureFlags[flag] ?? false;
}

function setFeatureFlag(flag: string, enabled: boolean): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`feature_flag_${flag}`, String(enabled));
  }
}

export function useFeatureFlag(flag: string): boolean {
  return useMemo(() => getFeatureFlag(flag), [flag]);
}

export function useFeatureFlags(): {
  isEnabled: (flag: string) => boolean;
  toggle: (flag: string) => void;
  enable: (flag: string) => void;
  disable: (flag: string) => void;
  getAll: () => Record<string, boolean>;
} {
  return useMemo(() => ({
    isEnabled: (flag: string) => getFeatureFlag(flag),
    toggle: (flag: string) => {
      const current = getFeatureFlag(flag);
      setFeatureFlag(flag, !current);
      window.dispatchEvent(new CustomEvent('featureFlagChanged', { detail: { flag, enabled: !current } }));
    },
    enable: (flag: string) => {
      setFeatureFlag(flag, true);
      window.dispatchEvent(new CustomEvent('featureFlagChanged', { detail: { flag, enabled: true } }));
    },
    disable: (flag: string) => {
      setFeatureFlag(flag, false);
      window.dispatchEvent(new CustomEvent('featureFlagChanged', { detail: { flag, enabled: false } }));
    },
    getAll: () => {
      const result: Record<string, boolean> = {};
      Object.keys(featureFlags).forEach(flag => {
        result[flag] = getFeatureFlag(flag);
      });
      return result;
    },
  }), []);
}

export default function FeatureFlag({ flag, children, fallback = null }: FeatureFlagProps) {
  const isEnabled = useFeatureFlag(flag);

  if (!isEnabled) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

export function FeatureFlagAdmin() {
  const flags = useFeatureFlags();
  const allFlags = flags.getAll();

  if (!getFeatureFlag('admin_tools')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 border">
      <h3 className="text-sm font-medium mb-2">Feature Flags</h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {Object.entries(allFlags).map(([flag, enabled]) => (
          <div key={flag} className="flex items-center justify-between text-xs">
            <span className="font-mono">{flag}</span>
            <button
              onClick={() => flags.toggle(flag)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                enabled
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
            >
              {enabled ? 'ON' : 'OFF'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}