/**
 * Centralized theme color system for consistent theming across all components
 * Supports both light and dark modes with automatic color adaptation
 */

export interface ThemeColors {
  // Canvas/Drawing colors
  canvas: {
    background: string;
    foreground: string;
    muted: string;
    accent: string;
  };
  
  // Robot/Game colors that work in both themes
  robot: {
    trail: {
      leader: string;
      follower: string;
      scout: string;
    };
    communication: {
      connection: string;
      packet: string;
      node: string;
      strong: string;
    };
    indicators: {
      leader: string;
      scout: string;
      headlight: string;
      target: string;
      crosshair: string;
    };
  };
  
  // UI colors
  ui: {
    text: {
      primary: string;
      secondary: string;
      muted: string;
      inverse: string;
    };
    background: {
      primary: string;
      secondary: string;
      overlay: string;
    };
    border: {
      primary: string;
      secondary: string;
    };
  };
  
  // Game specific colors
  game: {
    city: {
      discovered: string;
      undiscovered: string;
      glow: string;
    };
    world: {
      outline: string;
    };
    debug: {
      ray: string;
    };
  };
}

/**
 * Get theme colors based on current theme
 * Automatically detects theme from document element
 */
export function getThemeColors(): ThemeColors {
  const isDark = typeof window !== 'undefined' && 
    (document.documentElement.classList.contains('dark') || 
     document.documentElement.getAttribute('data-theme') === 'dark');

  if (isDark) {
    return {
      canvas: {
        background: '#0a0a1a',
        foreground: '#ffffff',
        muted: '#666666',
        accent: '#00ffff',
      },
      robot: {
        trail: {
          leader: '#ffffff88',
          follower: '#ffffff66', 
          scout: '#ffffff44',
        },
        communication: {
          connection: 'rgba(0, 255, 255, 0.6)',
          packet: 'rgba(255, 255, 0, 0.9)',
          node: 'rgba(0, 255, 255, 0.3)',
          strong: 'rgba(0, 255, 0, 0.4)',
        },
        indicators: {
          leader: '#ffff00',
          scout: '#00ffff',
          headlight: '#ffff00',
          target: '#ff00ff',
          crosshair: '#ff00ff',
        },
      },
      ui: {
        text: {
          primary: '#ffffff',
          secondary: '#cccccc',
          muted: '#999999',
          inverse: '#000000',
        },
        background: {
          primary: '#000000',
          secondary: '#111111',
          overlay: 'rgba(0, 0, 0, 0.8)',
        },
        border: {
          primary: '#333333',
          secondary: '#222222',
        },
      },
      game: {
        city: {
          discovered: '#ffcc00',
          undiscovered: 'rgba(150, 150, 150, 0.4)',
          glow: '#ffcc00',
        },
        world: {
          outline: 'rgba(255, 255, 255, 0.15)',
        },
        debug: {
          ray: 'rgba(255, 0, 0, 0.4)',
        },
      },
    };
  }

  // Light theme
  return {
    canvas: {
      background: '#f8f9fa',
      foreground: '#000000',
      muted: '#666666',
      accent: '#0066cc',
    },
    robot: {
      trail: {
        leader: '#00000088',
        follower: '#00000066',
        scout: '#00000044',
      },
      communication: {
        connection: 'rgba(0, 100, 200, 0.6)',
        packet: 'rgba(200, 150, 0, 0.9)',
        node: 'rgba(0, 100, 200, 0.3)',
        strong: 'rgba(0, 150, 0, 0.4)',
      },
      indicators: {
        leader: '#cc9900',
        scout: '#0066cc',
        headlight: '#cc9900',
        target: '#cc0099',
        crosshair: '#cc0099',
      },
    },
    ui: {
      text: {
        primary: '#000000',
        secondary: '#333333',
        muted: '#666666',
        inverse: '#ffffff',
      },
      background: {
        primary: '#ffffff',
        secondary: '#f8f9fa',
        overlay: 'rgba(255, 255, 255, 0.8)',
      },
      border: {
        primary: '#dddddd',
        secondary: '#eeeeee',
      },
    },
    game: {
      city: {
        discovered: '#cc9900',
        undiscovered: 'rgba(100, 100, 100, 0.4)',
        glow: '#cc9900',
      },
      world: {
        outline: 'rgba(0, 0, 0, 0.15)',
      },
      debug: {
        ray: 'rgba(200, 0, 0, 0.4)',
      },
    },
  };
}

/**
 * Hook for reactive theme colors that updates when theme changes
 */
export function useThemeColors() {
  const [colors, setColors] = useState<ThemeColors>(getThemeColors);

  useEffect(() => {
    const updateColors = () => {
      setColors(getThemeColors());
    };

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && 
            (mutation.attributeName === 'class' || mutation.attributeName === 'data-theme')) {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme']
    });

    return () => observer.disconnect();
  }, []);

  return colors;
}

// React import for useState and useEffect
import { useState, useEffect } from 'react';