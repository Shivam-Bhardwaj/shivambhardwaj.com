/**
 *  Modern Development Environment Configuration
 *
 * Environment-specific configurations for different deployment stages
 * Modern CI/CD pipeline configuration
 */
import { config } from './central-config'
// ============================================================================
// ENVIRONMENT CONFIGURATIONS
// ============================================================================
// Development environment configuration
export const developmentConfig = {
  // Database
  database: {
    url: 'postgresql://localhost:5432/robotics_dev',
    ssl: false,
    maxConnections: 10,
  },
  // External APIs
  apis: {
    github: {
      token: process.env.GITHUB_TOKEN_DEV,
      baseUrl: 'https://api.github.com',
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID_DEV,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET_DEV,
    },
  },
  // Analytics
  analytics: {
    googleAnalyticsId: process.env.GA_ID_DEV || '',
    enableTracking: false,
  },
  // Security
  security: {
    ...config.security,
    enableHSTS: false, // Disable HSTS in development
  },
  // Development tools
  devTools: {
    enableReduxDevTools: true,
    enableReactDevTools: true,
    enableHotReload: true,
    enableErrorOverlay: true,
  },
}
// Production environment configuration
export const productionConfig = {
  // Database
  database: {
    url: process.env.DATABASE_URL,
    ssl: true,
    maxConnections: 100,
  },
  // External APIs
  apis: {
    github: {
      token: process.env.GITHUB_TOKEN,
      baseUrl: 'https://api.github.com',
    },
    linkedin: {
      clientId: process.env.LINKEDIN_CLIENT_ID,
      clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
    },
  },
  // Analytics
  analytics: {
    googleAnalyticsId: process.env.GA_ID || '',
    enableTracking: true,
  },
  // Security
  security: {
    ...config.security,
    enableHSTS: true, // Enable HSTS in production
  },
  // Production optimizations
  optimizations: {
    enableCompression: true,
    enableCaching: true,
    enableCDN: true,
    enableServiceWorker: true,
  },
}
// Staging environment configuration
export const stagingConfig = {
  ...productionConfig,
  // Override staging-specific settings
  database: {
    url: process.env.DATABASE_URL_STAGING,
    ssl: true,
    maxConnections: 50,
  },
  analytics: {
    googleAnalyticsId: process.env.GA_ID_STAGING || '',
    enableTracking: false, // Disable analytics in staging
  },
  security: {
    ...config.security,
    enableHSTS: false, // Disable HSTS in staging
  },
}
// Test environment configuration
export const testConfig = {
  ...developmentConfig,
  // Test-specific overrides
  database: {
    url: 'postgresql://localhost:5432/robotics_test',
    ssl: false,
    maxConnections: 5,
  },
  apis: {
    github: {
      token: process.env.TEST_GITHUB_TOKEN || 'fake-test-token-not-real',
      baseUrl: 'http://localhost:3001',
    },
    linkedin: {
      clientId: process.env.TEST_LINKEDIN_CLIENT_ID || 'fake-test-client-id',
      clientSecret: process.env.TEST_LINKEDIN_SECRET || 'fake-test-client-secret',
    },
  },
  analytics: {
    googleAnalyticsId: '',
    enableTracking: false,
  },
}
// ============================================================================
// ENVIRONMENT DETECTOR
// ============================================================================
export function getEnvironmentConfig() {
  switch (config.environment) {
    case 'production':
      return productionConfig
    case 'staging':
      return stagingConfig
    case 'test':
      return testConfig
    case 'development':
    default:
      return developmentConfig
  }
}
// ============================================================================
// CI/CD CONFIGURATION
// ============================================================================
export const ciConfig = {
  // GitHub Actions
  github: {
    workflows: {
      'ci.yml': {
        name: 'CI',
        on: {
          push: { branches: ['main', 'develop'] },
          pull_request: { branches: ['main', 'develop'] },
        },
        jobs: {
          test: {
            'runs-on': 'ubuntu-latest',
            steps: [
              { uses: 'actions/checkout@v4' },
              { uses: 'actions/setup-node@v4', with: { 'node-version': '18' } },
              { run: 'npm ci' },
              { run: 'npm run test:comprehensive' },
              { run: 'npm run build' },
            ],
          },
          deploy: {
            'runs-on': 'ubuntu-latest',
            needs: 'test',
            'if': "github.ref == 'refs/heads/main'",
            steps: [
              { uses: 'actions/checkout@v4' },
              { uses: 'FirebaseExtended/action-hosting-deploy@v0' },
            ],
          },
        },
      },
      'security.yml': {
        name: 'Security Scan',
        on: {
          schedule: [{ cron: '0 0 * * 1' }], // Weekly on Mondays
          push: { branches: ['main'] },
        },
        jobs: {
          security: {
            'runs-on': 'ubuntu-latest',
            steps: [
              { uses: 'actions/checkout@v4' },
              { uses: 'github/super-linter/slim@v5' },
              { run: 'npm audit --audit-level high' },
            ],
          },
        },
      },
    },
  },
  // Code Quality Gates
  qualityGates: {
    test: {
      coverage: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
      maxDuration: 300, // 5 minutes
    },
    lint: {
      maxErrors: 0,
      maxWarnings: 10,
    },
    security: {
      maxVulnerabilities: 0,
      auditLevel: 'high',
    },
  },
  // Deployment Configurations
  deployments: {
    firebase: {
      projectId: config.deployment.firebase?.projectId,
      hosting: {
        public: config.build.outputDir,
        ignore: ['firebase.json', '**/.*', '**/node_modules/**'],
        rewrites: [{ source: '**', destination: '/index.html' }],
      },
    },
    netlify: {
      buildCommand: 'npm run build',
      publishDirectory: config.build.outputDir,
      functionsDirectory: 'netlify/functions',
    },
    vercel: {
      buildCommand: 'npm run build',
      outputDirectory: config.build.outputDir,
      functionsDirectory: 'api',
    },
  },
}
// ============================================================================
// EXPORT CONFIGURATION
// ============================================================================
export const envConfig = getEnvironmentConfig()
// Combined configuration for easy access
export const fullConfig = {
  ...config,
  env: envConfig,
  ci: ciConfig,
}
export default fullConfig
