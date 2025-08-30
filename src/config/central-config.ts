/**
 *  Robotics Portfolio - Centralized Configuration
 *
 * Single Source of Truth for all application configurations
 * Modern software development practices implementation
 */
import { z } from 'zod'
import path from 'path'
// ============================================================================
// CONFIGURATION SCHEMAS
// ============================================================================
// Environment schema
const EnvironmentSchema = z.enum(['development', 'staging', 'production', 'test'])
// Base configuration schema
const BaseConfigSchema = z.object({
  environment: EnvironmentSchema,
  isDevelopment: z.boolean(),
  isProduction: z.boolean(),
  isTest: z.boolean(),
  isStaging: z.boolean(),
})
// Application configuration schema
const AppConfigSchema = z.object({
  name: z.string(),
  version: z.string(),
  description: z.string(),
  author: z.string(),
  repository: z.string().url(),
  homepage: z.string().url(),
  license: z.string(),
})
// Site configuration schema
const SiteConfigSchema = z.object({
  name: z.string(),
  role: z.string(),
  location: z.string(),
  email: z.string().email(),
  description: z.string(),
  keywords: z.array(z.string()),
  social: z.object({
    github: z.string().url().optional(),
    linkedin: z.string().url().optional(),
    twitter: z.string().url().optional(),
  }),
  company: z.object({
    current: z.string(),
    previous: z.array(z.string()),
  }),
})
// Build configuration schema
const BuildConfigSchema = z.object({
  outputDir: z.string(),
  publicDir: z.string(),
  cacheDir: z.string(),
  generateSourceMaps: z.boolean(),
  minify: z.boolean(),
  analyzeBundle: z.boolean(),
  enablePWA: z.boolean(),
  enableServiceWorker: z.boolean(),
})
// Development configuration schema
const DevConfigSchema = z.object({
  port: z.number(),
  host: z.string(),
  https: z.boolean(),
  openBrowser: z.boolean(),
  hotReload: z.boolean(),
  errorOverlay: z.boolean(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']),
})
// Testing configuration schema
const TestConfigSchema = z.object({
  setupFiles: z.array(z.string()),
  testMatch: z.array(z.string()),
  collectCoverage: z.boolean(),
  coverageDirectory: z.string(),
  coverageThreshold: z.object({
    global: z.object({
      branches: z.number(),
      functions: z.number(),
      lines: z.number(),
      statements: z.number(),
    }),
  }),
  testTimeout: z.number(),
  maxWorkers: z.number().or(z.string()),
  bail: z.boolean(),
})
// Deployment configuration schema
const DeploymentConfigSchema = z.object({
  providers: z.array(z.enum(['firebase', 'netlify', 'vercel', 'github-pages'])),
  firebase: z.object({
    projectId: z.string(),
    hosting: z.object({
      public: z.string(),
      ignore: z.array(z.string()),
      rewrites: z.array(z.any()),
    }),
  }).optional(),
  netlify: z.object({
    buildCommand: z.string(),
    publishDirectory: z.string(),
    functionsDirectory: z.string().optional(),
  }).optional(),
  vercel: z.object({
    buildCommand: z.string(),
    outputDirectory: z.string(),
    functionsDirectory: z.string().optional(),
  }).optional(),
})
// Security configuration schema
const SecurityConfigSchema = z.object({
  enableCSP: z.boolean(),
  enableHSTS: z.boolean(),
  enableXFrameOptions: z.boolean(),
  enableContentTypeNosniff: z.boolean(),
  enableReferrerPolicy: z.boolean(),
  cspDirectives: z.record(z.string(), z.array(z.string())),
  allowedHosts: z.array(z.string()),
})
// Performance configuration schema
const PerformanceConfigSchema = z.object({
  enableCompression: z.boolean(),
  enableCaching: z.boolean(),
  imageOptimization: z.boolean(),
  lazyLoading: z.boolean(),
  preloadCriticalResources: z.boolean(),
  bundleAnalyzer: z.boolean(),
})
// Monitoring configuration schema
const MonitoringConfigSchema = z.object({
  enableAnalytics: z.boolean(),
  enableErrorTracking: z.boolean(),
  enablePerformanceMonitoring: z.boolean(),
  logLevel: z.enum(['error', 'warn', 'info', 'debug']),
  logFormat: z.enum(['json', 'text', 'structured']),
  enableLogRotation: z.boolean(),
  maxLogSize: z.string(),
  maxLogFiles: z.number(),
})
// Feature flags schema
const FeatureFlagsSchema = z.object({
  enableDarkMode: z.boolean(),
  enablePWA: z.boolean(),
  enableOfflineMode: z.boolean(),
  enableMultiLanguage: z.boolean(),
  enableAnalytics: z.boolean(),
  enableErrorBoundary: z.boolean(),
  enablePerformanceMonitoring: z.boolean(),
  enableAccessibilityAudit: z.boolean(),
})
// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================
// Default configuration values
const DEFAULT_CONFIG = {
  // Base
  environment: 'development' as const,
  isDevelopment: true as boolean,
  isProduction: false as boolean,
  isTest: false as boolean,
  isStaging: false as boolean,
  // Application
  app: {
    name: 'Robotics Portfolio',
    version: '1.0.0',
    description: 'Professional portfolio showcasing robotics engineering expertise',
    author: 'Shivam Bhardwaj',
    repository: 'https://github.com/Shivam-Bhardwaj/shivambhardwaj.com',
    homepage: 'https://shivambhardwaj.com',
    license: 'MIT',
  },
  // Site
  site: {
    name: 'Shivam Bhardwaj',
    role: 'Senior Robotics Engineer',
    location: 'San Francisco, CA',
    email: 'contact@shivambhardwaj.com',
    description: 'Transforming ideas into autonomous systems through innovative robotics engineering',
    keywords: ['robotics', 'engineering', 'autonomous', 'AI', 'machine learning', 'computer vision'],
    social: {
      github: 'https://github.com/Shivam-Bhardwaj',
      linkedin: 'https://www.linkedin.com/in/shivambdj/',
    },
    company: {
      current: 'Applied Materials',
      previous: ['Meta', 'Tesla', 'Saildrone'],
    },
  },
  // Build
  build: {
    outputDir: 'dist',
    publicDir: 'public',
    cacheDir: '.next/cache',
    generateSourceMaps: true,
    minify: true,
    analyzeBundle: false,
    enablePWA: true,
    enableServiceWorker: true,
  },
  // Development
  dev: {
    port: 3000,
    host: 'localhost',
    https: false,
    openBrowser: true,
    hotReload: true,
    errorOverlay: true,
    logLevel: 'info' as const,
  },
  // Testing
  test: {
    setupFiles: ['<rootDir>/jest.setup.js'],
    testMatch: [
      '<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}',
      '<rootDir>/src/**/*.{test,spec}.{js,jsx,ts,tsx}',
      '<rootDir>/tests/**/*.{test,spec}.{js,jsx,ts,tsx}',
    ],
    collectCoverage: true,
    coverageDirectory: 'coverage',
    coverageThreshold: {
      global: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    testTimeout: 10000,
    maxWorkers: '50%',
    bail: false,
  },
  // Deployment
  deployment: {
    providers: ['firebase'],
    firebase: {
      projectId: 'shivambhardwaj-com',
      hosting: {
        public: 'out',
        ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
        rewrites: [
          {
            source: '**',
            destination: '/index.html',
          },
        ],
      },
    },
  },
  // Security
  security: {
    enableCSP: true,
    enableHSTS: true,
    enableXFrameOptions: true,
    enableContentTypeNosniff: true,
    enableReferrerPolicy: true,
    cspDirectives: {
      'default-src': ["'self'"],
      'script-src': ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      'style-src': ["'self'", "'unsafe-inline'"],
      'img-src': ["'self'", 'data:', 'https:'],
      'font-src': ["'self'"],
      'connect-src': ["'self'", 'https://*.google-analytics.com', 'https://*.googletagmanager.com'],
      'frame-src': ["'none'"],
      'object-src': ["'none'"],
      'base-uri': ["'self'"],
      'form-action': ["'self'"],
    },
    allowedHosts: ['localhost', '127.0.0.1', 'shivambhardwaj.com', '*.shivambhardwaj.com'],
  },
  // Performance
  performance: {
    enableCompression: true,
    enableCaching: true,
    imageOptimization: true,
    lazyLoading: true,
    preloadCriticalResources: true,
    bundleAnalyzer: false,
  },
  // Monitoring
  monitoring: {
    enableAnalytics: true,
    enableErrorTracking: true,
    enablePerformanceMonitoring: true,
    logLevel: 'info' as const,
    logFormat: 'structured' as const,
    enableLogRotation: true,
    maxLogSize: '10m',
    maxLogFiles: 5,
  },
  // Feature Flags
  features: {
    enableDarkMode: false,
    enablePWA: true,
    enableOfflineMode: false,
    enableMultiLanguage: false,
    enableAnalytics: true,
    enableErrorBoundary: true,
    enablePerformanceMonitoring: true,
    enableAccessibilityAudit: true,
  },
} as const
// Widen runtime type for environment to support all possible values
type RuntimeConfig = Omit<typeof DEFAULT_CONFIG, 'environment'> & {
  environment: z.infer<typeof EnvironmentSchema>
}
function detectEnvironment(): z.infer<typeof EnvironmentSchema> {
  const nodeEnv = process.env.NODE_ENV
  const env = process.env.ENVIRONMENT
  if (env === 'production' || nodeEnv === 'production') return 'production'
  // NODE_ENV does not include a standardized 'staging' value; use custom ENVIRONMENT for staging
  if (env === 'staging') return 'staging'
  if (env === 'test' || nodeEnv === 'test') return 'test'
  return 'development'
}
// ============================================================================
// CONFIGURATION LOADER
// ============================================================================
export class ConfigManager {
  private static instance: ConfigManager
  private config: RuntimeConfig
  private constructor() {
    const environment = detectEnvironment()
    this.config = {
      ...DEFAULT_CONFIG,
      environment,
      isDevelopment: environment === 'development',
      isProduction: environment === 'production',
      isTest: environment === 'test',
      isStaging: environment === 'staging',
    } as RuntimeConfig
    // Load environment-specific overrides
    this.loadEnvironmentOverrides()
  }
  static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager()
    }
    return ConfigManager.instance
  }
  private loadEnvironmentOverrides() {
    // const envFile = path.resolve(process.cwd(), `.env.${this.config.environment}`) // Future environment file loading
    // const localEnvFile = path.resolve(process.cwd(), '.env.local') // Future local environment file loading
    // Load environment variables from files (if they exist)
    // This would typically use dotenv or similar library
    // For now, we'll rely on process.env
  }
  // Getters for different configuration sections
  get app() { return this.config.app }
  get site() { return this.config.site }
  get build() { return this.config.build }
  get dev() { return this.config.dev }
  get test() { return this.config.test }
  get deployment() { return this.config.deployment }
  get security() { return this.config.security }
  get performance() { return this.config.performance }
  get monitoring() { return this.config.monitoring }
  get features() { return this.config.features }
  // Base configuration
  get environment() { return this.config.environment }
  get isDevelopment() { return this.config.isDevelopment }
  get isProduction() { return this.config.isProduction }
  get isTest() { return this.config.isTest }
  get isStaging() { return this.config.isStaging }
  // Utility methods
  getConfigPath(relativePath: string): string {
    return path.resolve(process.cwd(), relativePath)
  }
  isFeatureEnabled(feature: keyof typeof DEFAULT_CONFIG.features): boolean {
    return this.config.features[feature]
  }
  getEnvVar(key: string, defaultValue?: string): string {
    return process.env[key] || defaultValue || ''
  }
  // Validation method
  validate(): boolean {
    try {
      // Validate all schemas
      BaseConfigSchema.parse({
        environment: this.environment,
        isDevelopment: this.isDevelopment,
        isProduction: this.isProduction,
        isTest: this.isTest,
        isStaging: this.isStaging,
      })
      AppConfigSchema.parse(this.app)
      SiteConfigSchema.parse(this.site)
      BuildConfigSchema.parse(this.build)
      DevConfigSchema.parse(this.dev)
      TestConfigSchema.parse(this.test)
      DeploymentConfigSchema.parse(this.deployment)
      SecurityConfigSchema.parse(this.security)
      PerformanceConfigSchema.parse(this.performance)
      MonitoringConfigSchema.parse(this.monitoring)
      FeatureFlagsSchema.parse(this.features)
      return true
    } catch (error) {
      console.error('Configuration validation failed:', error)
      return false
    }
  }
}
// Export singleton instance
export const config = ConfigManager.getInstance()
// Export types for TypeScript
export type AppConfig = typeof DEFAULT_CONFIG.app
export type SiteConfig = typeof DEFAULT_CONFIG.site
export type BuildConfig = typeof DEFAULT_CONFIG.build
export type DevConfig = typeof DEFAULT_CONFIG.dev
export type TestConfig = typeof DEFAULT_CONFIG.test
export type DeploymentConfig = typeof DEFAULT_CONFIG.deployment
export type SecurityConfig = typeof DEFAULT_CONFIG.security
export type PerformanceConfig = typeof DEFAULT_CONFIG.performance
export type MonitoringConfig = typeof DEFAULT_CONFIG.monitoring
export type FeatureFlags = typeof DEFAULT_CONFIG.features
// Default export
export default config
