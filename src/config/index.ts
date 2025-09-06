import { z } from 'zod';

// Environment validation schema
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  GCP_PROJECT_ID: z.string().optional(),
  GCP_REGION: z.string().default('us-central1'),
  NEXT_PUBLIC_BASE_URL: z.string().default('http://localhost:3000'),
  LOGGING_LEVEL: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).default('INFO'),
  DATABASE_URL: z.string().optional(),
  SECRET_KEY: z.string().optional(),
});

// Parse and validate environment variables
const env = envSchema.parse(process.env);

export const config = {
  // Environment
  env: env.NODE_ENV,
  isDevelopment: env.NODE_ENV === 'development',
  isProduction: env.NODE_ENV === 'production',
  isTest: env.NODE_ENV === 'test',

  // GCP Configuration
  gcp: {
    projectId: env.GCP_PROJECT_ID,
    region: env.GCP_REGION,
    enabled: !!env.GCP_PROJECT_ID && env.NODE_ENV === 'production',
  },

  // Application Configuration
  app: {
    name: 'Shivam Bhardwaj Portfolio - GC',
    version: '1.0.0',
    baseUrl: env.NEXT_PUBLIC_BASE_URL,
    port: 3000,
  },

  // Logging Configuration
  logging: {
    level: env.LOGGING_LEVEL,
    enableGcp: env.NODE_ENV === 'production' && !!env.GCP_PROJECT_ID,
    enableConsole: env.NODE_ENV !== 'production',
    maxBufferSize: 100,
  },

  // Database Configuration
  database: {
    url: env.DATABASE_URL,
    enabled: !!env.DATABASE_URL,
  },

  // Security Configuration
  security: {
    secretKey: env.SECRET_KEY,
    corsOrigins: env.NODE_ENV === 'production' 
      ? [env.NEXT_PUBLIC_BASE_URL] 
      : ['http://localhost:3000', 'http://127.0.0.1:3000'],
    rateLimitWindowMs: 15 * 60 * 1000, // 15 minutes
    rateLimitMaxRequests: 100,
  },

  // Feature Flags
  features: {
    roboticsCalculators: true,
    swarmSimulation: true,
    portfolioMetrics: true,
    contactForm: true,
    darkMode: true,
    analytics: env.NODE_ENV === 'production',
    performanceMonitoring: true,
  },

  // UI Configuration
  ui: {
    theme: {
      defaultMode: 'system' as 'light' | 'dark' | 'system',
      enableTransitions: true,
      animationDuration: 300,
    },
    performance: {
      enableVirtualization: true,
      lazyLoadImages: true,
      optimizeRenders: true,
    },
  },

  // API Configuration
  api: {
    timeout: 30000, // 30 seconds
    retries: 3,
    retryDelay: 1000, // 1 second
    endpoints: {
      health: '/api/health',
      contact: '/api/contact',
      portfolio: '/api/portfolio',
      metrics: '/api/metrics',
    },
  },

  // Robotics Configuration
  robotics: {
    simulation: {
      maxParticles: 1000,
      updateInterval: 16, // 60 FPS
      canvasSize: { width: 800, height: 600 },
      defaultAlgorithm: 'boids',
    },
    calculators: {
      precision: 6,
      units: 'metric' as 'metric' | 'imperial',
      enableCache: true,
    },
  },

  // Performance Configuration
  performance: {
    enableServiceWorker: env.NODE_ENV === 'production',
    cacheStrategy: 'network-first' as 'cache-first' | 'network-first' | 'stale-while-revalidate',
    imageOptimization: {
      quality: 85,
      formats: ['webp', 'avif', 'jpeg'],
    },
    bundleAnalysis: {
      enabled: env.NODE_ENV === 'production',
      threshold: 250000, // 250KB
    },
  },

  // Monitoring Configuration
  monitoring: {
    enableErrorReporting: env.NODE_ENV === 'production',
    enablePerformanceTracking: true,
    enableUserAnalytics: env.NODE_ENV === 'production',
    sampleRate: env.NODE_ENV === 'production' ? 0.1 : 1.0,
    metricsInterval: 60000, // 1 minute
  },
} as const;

// Type exports for strong typing
export type Config = typeof config;
export type Environment = typeof config.env;
export type GCPConfig = typeof config.gcp;
export type FeatureFlags = typeof config.features;

// Configuration validation function
export function validateConfig(): boolean {
  try {
    // Validate required production configurations
    if (config.isProduction) {
      if (!config.gcp.projectId) {
        throw new Error('GCP_PROJECT_ID is required in production');
      }
      if (!config.app.baseUrl.startsWith('https://')) {
        throw new Error('HTTPS is required in production');
      }
    }

    // Validate GCP configuration when enabled
    if (config.gcp.enabled) {
      if (!config.gcp.projectId || !config.gcp.region) {
        throw new Error('Invalid GCP configuration');
      }
    }

    return true;
  } catch (error) {
    console.error('Configuration validation failed:', error);
    return false;
  }
}

// Environment-specific configurations
export const getEnvironmentConfig = () => {
  const baseConfig = {
    development: {
      logging: { level: 'DEBUG' as const },
      api: { timeout: 10000 },
      monitoring: { sampleRate: 1.0 },
    },
    test: {
      logging: { level: 'ERROR' as const },
      api: { timeout: 5000 },
      features: { analytics: false },
    },
    production: {
      logging: { level: 'INFO' as const },
      api: { timeout: 30000 },
      monitoring: { sampleRate: 0.1 },
    },
  };

  return baseConfig[config.env];
};

// Export default configuration
export default config;