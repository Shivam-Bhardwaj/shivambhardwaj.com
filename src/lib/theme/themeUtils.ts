/**
 * Theme Utilities
 * 
 * Centralized functions for theme-aware styling to ensure consistency
 * across all components and prevent theme-related issues.
 */

export type ThemeMode = 'light' | 'dark';

/**
 * Detects current theme from DOM
 */
export function getCurrentTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'dark'; // SSR default
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
}

/**
 * Theme-aware color palette
 */
export const themeColors = {
  text: {
    primary: {
      light: 'rgb(31, 41, 55)',      // gray-800
      dark: 'rgb(243, 244, 246)'     // gray-100
    },
    secondary: {
      light: 'rgb(107, 114, 128)',   // gray-500
      dark: 'rgb(156, 163, 175)'     // gray-400
    },
    muted: {
      light: 'rgb(156, 163, 175)',   // gray-400
      dark: 'rgb(107, 114, 128)'     // gray-500
    },
    accent: {
      light: 'rgb(37, 99, 235)',     // blue-600
      dark: 'rgb(59, 130, 246)'      // blue-500
    }
  },
  background: {
    primary: {
      light: 'rgb(255, 255, 255)',   // white
      dark: 'rgb(17, 24, 39)'        // gray-900
    },
    secondary: {
      light: 'rgb(249, 250, 251)',   // gray-50
      dark: 'rgb(31, 41, 55)'        // gray-800
    },
    overlay: {
      light: 'rgba(255, 255, 255, 0.08)',
      dark: 'rgba(0, 0, 0, 0.08)'
    }
  },
  border: {
    primary: {
      light: 'rgb(229, 231, 235)',   // gray-200
      dark: 'rgb(75, 85, 99)'        // gray-600
    },
    secondary: {
      light: 'rgb(243, 244, 246)',   // gray-100
      dark: 'rgb(55, 65, 81)'        // gray-700
    }
  }
};

/**
 * Robot-specific theme colors
 */
export const robotColors = {
  leader: {
    body: {
      light: 'rgba(218, 165, 32, 0.9)',    // goldenrod
      dark: 'rgba(255, 215, 0, 0.9)'       // gold
    },
    trail: {
      light: 'rgba(218, 165, 32, 0.5)',
      dark: 'rgba(255, 215, 0, 0.7)'
    },
    outline: 'gold'
  },
  scout: {
    body: {
      light: 'rgba(0, 139, 139, 0.9)',     // dark cyan
      dark: 'rgba(0, 255, 255, 0.9)'       // cyan
    },
    trail: {
      light: 'rgba(0, 139, 139, 0.4)',
      dark: 'rgba(0, 255, 255, 0.6)'
    },
    outline: 'cyan'
  },
  worker: {
    body: {
      light: 'rgba(100, 100, 100, 0.9)',   // gray
      dark: 'rgba(200, 200, 200, 0.9)'     // light gray
    },
    trail: {
      light: 'rgba(100, 100, 100, 0.4)',
      dark: 'rgba(255, 255, 255, 0.6)'
    },
    outline: {
      light: 'black',
      dark: 'white'
    }
  },
  ui: {
    rays: {
      light: 'rgba(255, 0, 0, 0.4)',
      dark: 'rgba(255, 100, 100, 0.6)'
    },
    mouse: {
      light: 'rgba(255, 0, 100, 0.6)',
      dark: 'rgba(255, 100, 150, 0.8)'
    }
  }
};

/**
 * Get theme-aware color
 */
export function getThemeColor(colorPath: string, theme?: ThemeMode): string {
  const currentTheme = theme || getCurrentTheme();
  const pathParts = colorPath.split('.');
  
  try {
    let colorObj = themeColors as Record<string, unknown>;
    for (const part of pathParts) {
      if (colorObj[part] && typeof colorObj[part] === 'object') {
        colorObj = colorObj[part] as Record<string, unknown>;
      } else {
        console.warn(`Theme color path not found: ${colorPath}`);
        return currentTheme === 'dark' ? '#ffffff' : '#000000';
      }
    }
    
    if (colorObj && typeof colorObj === 'object' && 'light' in colorObj && 'dark' in colorObj) {
      const themeColorObj = colorObj as { light: string; dark: string };
      return themeColorObj[currentTheme];
    }
    
    return currentTheme === 'dark' ? '#ffffff' : '#000000';
  } catch {
    console.warn(`Theme color path not found: ${colorPath}`);
    return currentTheme === 'dark' ? '#ffffff' : '#000000';
  }
}

/**
 * Get robot color based on role and theme
 */
export function getRobotColor(role: 'leader' | 'scout' | 'worker', type: 'body' | 'trail' | 'outline', theme?: ThemeMode): string {
  const currentTheme = theme || getCurrentTheme();
  const roleColors = robotColors[role];
  
  if (type === 'outline' && typeof roleColors.outline === 'string') {
    return roleColors.outline;
  }
  
  const colorSet = roleColors[type as keyof typeof roleColors] as { light: string; dark: string };
  return colorSet ? colorSet[currentTheme] : getThemeColor('text.primary', currentTheme);
}

/**
 * Generate theme-aware CSS custom properties
 */
export function generateThemeCSS(theme: ThemeMode): string {
  return `
    :root {
      --theme-text-primary: ${themeColors.text.primary[theme]};
      --theme-text-secondary: ${themeColors.text.secondary[theme]};
      --theme-text-muted: ${themeColors.text.muted[theme]};
      --theme-text-accent: ${themeColors.text.accent[theme]};
      --theme-bg-primary: ${themeColors.background.primary[theme]};
      --theme-bg-secondary: ${themeColors.background.secondary[theme]};
      --theme-bg-overlay: ${themeColors.background.overlay[theme]};
      --theme-border-primary: ${themeColors.border.primary[theme]};
      --theme-border-secondary: ${themeColors.border.secondary[theme]};
    }
  `;
}

/**
 * Tailwind class utilities for theme-aware components
 */
export const themeClasses = {
  text: {
    primary: 'text-gray-800 dark:text-gray-100',
    secondary: 'text-gray-500 dark:text-gray-400',
    muted: 'text-gray-400 dark:text-gray-500',
    accent: 'text-blue-600 dark:text-blue-500'
  },
  background: {
    primary: 'bg-white dark:bg-gray-900',
    secondary: 'bg-gray-50 dark:bg-gray-800',
    card: 'bg-white dark:bg-gray-800'
  },
  border: {
    primary: 'border-gray-200 dark:border-gray-600',
    secondary: 'border-gray-100 dark:border-gray-700'
  },
  hover: {
    background: 'hover:bg-gray-50 dark:hover:bg-gray-800',
    text: 'hover:text-blue-600 dark:hover:text-blue-400'
  }
};

/**
 * Apply theme to canvas context
 */
export function applyCanvasTheme(ctx: CanvasRenderingContext2D, theme?: ThemeMode) {
  const currentTheme = theme || getCurrentTheme();
  
  // Set default canvas colors based on theme
  ctx.fillStyle = getThemeColor('text.primary', currentTheme);
  ctx.strokeStyle = getThemeColor('border.primary', currentTheme);
}