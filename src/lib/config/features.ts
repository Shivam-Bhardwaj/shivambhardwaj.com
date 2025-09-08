export interface FeatureFlag {
  key: string;
  name: string;
  description: string;
  enabled: boolean;
  environment?: 'development' | 'staging' | 'production' | 'all';
  rolloutPercentage?: number;
  dependencies?: string[];
  category: 'core' | 'ui' | 'robotics' | 'performance' | 'admin' | 'experimental';
}

export const FEATURE_FLAGS: Record<string, FeatureFlag> = {
  robotics_enabled: {
    key: 'robotics_enabled',
    name: 'Robotics System',
    description: 'Enable autonomous robot swarm background',
    enabled: true,
    environment: 'all',
    dependencies: ['3d_rendering', 'collision_detection'],
    category: 'robotics',
  },
  
  admin_tools: {
    key: 'admin_tools',
    name: 'Admin Tools',
    description: 'Enable component playground and admin interfaces',
    enabled: process.env.NODE_ENV === 'development',
    environment: 'development',
    category: 'admin',
  },
  
  component_hot_swap: {
    key: 'component_hot_swap',
    name: 'Component Hot Swapping',
    description: 'Enable real-time component updates without code changes',
    enabled: true,
    environment: 'all',
    dependencies: ['admin_tools'],
    category: 'core',
  },
  
  '3d_rendering': {
    key: '3d_rendering',
    name: '3D Rendering',
    description: 'Enable Three.js 3D visualizations',
    enabled: true,
    environment: 'all',
    category: 'core',
  },
  
  collision_detection: {
    key: 'collision_detection',
    name: 'Collision Detection',
    description: 'Enable robot collision avoidance system',
    enabled: true,
    environment: 'all',
    dependencies: ['3d_rendering'],
    category: 'robotics',
  },
  
  advanced_animations: {
    key: 'advanced_animations',
    name: 'Advanced Animations',
    description: 'Enable complex UI animations and transitions',
    enabled: true,
    environment: 'all',
    category: 'ui',
  },
  
  particle_effects: {
    key: 'particle_effects',
    name: 'Particle Effects',
    description: 'Enable particle background systems',
    enabled: true,
    environment: 'all',
    dependencies: ['3d_rendering'],
    category: 'ui',
  },
  
  performance_mode: {
    key: 'performance_mode',
    name: 'Performance Mode',
    description: 'Optimize for performance over visual quality',
    enabled: false,
    environment: 'all',
    category: 'performance',
  },
  
  mobile_optimizations: {
    key: 'mobile_optimizations',
    name: 'Mobile Optimizations',
    description: 'Enable mobile-specific optimizations',
    enabled: true,
    environment: 'all',
    dependencies: ['performance_mode'],
    category: 'performance',
  },
  
  real_time_content: {
    key: 'real_time_content',
    name: 'Real-time Content Updates',
    description: 'Enable live content management and updates',
    enabled: true,
    environment: 'all',
    category: 'core',
  },
  
  experimental_ui: {
    key: 'experimental_ui',
    name: 'Experimental UI Components',
    description: 'Enable experimental and beta UI components',
    enabled: process.env.NODE_ENV === 'development',
    environment: 'development',
    category: 'experimental',
  },
  
  analytics_tracking: {
    key: 'analytics_tracking',
    name: 'Analytics Tracking',
    description: 'Enable user interaction and performance analytics',
    enabled: process.env.NODE_ENV === 'production',
    environment: 'production',
    category: 'core',
  },
  
  debug_overlays: {
    key: 'debug_overlays',
    name: 'Debug Overlays',
    description: 'Show debug information and performance metrics',
    enabled: process.env.NODE_ENV === 'development',
    environment: 'development',
    category: 'admin',
  },
};

export class FeatureFlagManager {
  private static instance: FeatureFlagManager;
  private overrides: Map<string, boolean> = new Map();
  
  public static getInstance(): FeatureFlagManager {
    if (!FeatureFlagManager.instance) {
      FeatureFlagManager.instance = new FeatureFlagManager();
    }
    return FeatureFlagManager.instance;
  }
  
  public isEnabled(flagKey: string): boolean {
    const flag = FEATURE_FLAGS[flagKey];
    if (!flag) return false;
    
    // Check for local overrides first
    if (this.overrides.has(flagKey)) {
      return this.overrides.get(flagKey)!;
    }
    
    // Check environment restrictions
    if (flag.environment && flag.environment !== 'all') {
      const currentEnv = process.env.NODE_ENV as 'development' | 'staging' | 'production';
      if (flag.environment !== currentEnv) {
        return false;
      }
    }
    
    // Check dependencies
    if (flag.dependencies) {
      for (const dependency of flag.dependencies) {
        if (!this.isEnabled(dependency)) {
          return false;
        }
      }
    }
    
    // Check rollout percentage
    if (flag.rolloutPercentage !== undefined) {
      const userHash = this.getUserHash();
      const threshold = flag.rolloutPercentage / 100;
      if (userHash > threshold) {
        return false;
      }
    }
    
    return flag.enabled;
  }
  
  public override(flagKey: string, enabled: boolean): void {
    this.overrides.set(flagKey, enabled);
    if (typeof window !== 'undefined') {
      localStorage.setItem(`feature_flag_${flagKey}`, String(enabled));
    }
  }
  
  public clearOverride(flagKey: string): void {
    this.overrides.delete(flagKey);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`feature_flag_${flagKey}`);
    }
  }
  
  public getAllFlags(): FeatureFlag[] {
    return Object.values(FEATURE_FLAGS).map(flag => ({
      ...flag,
      enabled: this.isEnabled(flag.key),
    }));
  }
  
  public getFlagsByCategory(category: FeatureFlag['category']): FeatureFlag[] {
    return this.getAllFlags().filter(flag => flag.category === category);
  }
  
  public getEnabledFlags(): FeatureFlag[] {
    return this.getAllFlags().filter(flag => flag.enabled);
  }
  
  private getUserHash(): number {
    // Simple hash for rollout percentage
    if (typeof window === 'undefined') return 0;
    
    const userAgent = window.navigator.userAgent;
    let hash = 0;
    for (let i = 0; i < userAgent.length; i++) {
      const char = userAgent.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) / 2147483647; // Normalize to 0-1
  }
  
  // Load overrides from localStorage on initialization
  public loadOverrides(): void {
    if (typeof window === 'undefined') return;
    
    Object.keys(FEATURE_FLAGS).forEach(flagKey => {
      const stored = localStorage.getItem(`feature_flag_${flagKey}`);
      if (stored !== null) {
        this.overrides.set(flagKey, stored === 'true');
      }
    });
  }
}

// Singleton instance
export const featureFlagManager = FeatureFlagManager.getInstance();

// React hook for feature flags
export function useFeatureFlag(flagKey: string): boolean {
  if (typeof window !== 'undefined') {
    featureFlagManager.loadOverrides();
  }
  return featureFlagManager.isEnabled(flagKey);
}

// Utility functions
export function isFeatureEnabled(flagKey: string): boolean {
  return featureFlagManager.isEnabled(flagKey);
}

export function getAllFeatures(): FeatureFlag[] {
  return featureFlagManager.getAllFlags();
}

export function getFeaturesByCategory(category: FeatureFlag['category']): FeatureFlag[] {
  return featureFlagManager.getFlagsByCategory(category);
}