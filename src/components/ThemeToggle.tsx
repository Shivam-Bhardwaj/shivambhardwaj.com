"use client";

import { useTheme } from '@/lib/theme';
import { Moon, Sun, Monitor } from 'lucide-react';

export default function ThemeToggle() {
  const { mode, toggleMode: _toggleMode, updatePreferences, isDarkMode, isSystemMode } = useTheme();

  const handleModeChange = () => {
    const currentMode = mode;
    if (currentMode === 'light') {
      updatePreferences({ mode: 'dark' });
    } else if (currentMode === 'dark') {
      updatePreferences({ mode: 'system' });
    } else {
      updatePreferences({ mode: 'light' });
    }
  };

  const getIcon = () => {
    if (isSystemMode) return <Monitor className="w-4 h-4" />;
    if (isDarkMode) return <Moon className="w-4 h-4" />;
    return <Sun className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (isSystemMode) return 'System';
    if (isDarkMode) return 'Dark';
    return 'Light';
  };

  return (
    <button
      onClick={handleModeChange}
      className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white/70 dark:bg-gray-900/60 backdrop-blur hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors"
      title={`Current theme: ${getLabel()}. Click to cycle between Light, Dark, and System.`}
    >
      {getIcon()}
      <span className="text-sm font-medium">{getLabel()}</span>
    </button>
  );
}