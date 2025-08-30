import { type NextConfig } from 'next'
import { config } from './src/config/central-config'

const nextConfig: NextConfig = {
  // Environment-specific output
  output: config.isProduction ? 'export' : undefined,

  // Build optimization
  eslint: {
    ignoreDuringBuilds: config.isDevelopment,
  },

  typescript: {
    ignoreBuildErrors: config.isDevelopment,
  },

  // Production optimizations
  trailingSlash: config.isProduction,

  images: {
    unoptimized: config.isProduction, // For static export
    domains: config.security.allowedHosts.filter(host => !host.includes('*')),
    formats: config.performance.imageOptimization ? ['image/webp', 'image/avif'] : undefined,
  },

  // Environment variables
  env: {
    ENVIRONMENT: config.environment,
    APP_VERSION: config.app.version,
    APP_NAME: config.app.name,
  },

  // Security headers
  async headers() {
    const headers = []

    if (config.security.enableCSP) {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: Object.entries(config.security.cspDirectives)
              .map(([directive, values]) => `${directive} ${values.join(' ')}`)
              .join('; '),
          },
        ],
      })
    }

    if (config.security.enableHSTS && config.isProduction) {
      headers.push({
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      })
    }

    return headers
  },

  // PWA Configuration
  ...(config.features.enablePWA && {
    headers: async () => [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
          {
            key: 'Service-Worker-Allowed',
            value: '/',
          },
        ],
      },
    ],
  }),

  // Bundle analyzer for production builds
  ...(config.build.analyzeBundle && config.isProduction ? {
    webpack: (webpackConfig: any, { buildId, dev, isServer, defaultLoaders, webpack }: any) => {
      if (!dev) {
        try {
          const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
          webpackConfig.plugins.push(
            new BundleAnalyzerPlugin({
              analyzerMode: 'static',
              reportFilename: '../bundle-analyzer-report.html',
              openAnalyzer: false,
            })
          )
        } catch (error) {
          console.warn('Bundle analyzer not available, skipping...')
        }
      }

      return webpackConfig
    },
  } : {}),

  // Development optimizations
  ...(config.isDevelopment && {
    // Enable React Fast Refresh
    fastRefresh: true,
  }),
}

export default nextConfig
