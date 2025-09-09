import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: [
      'tests/unit/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/integration/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'tests/accessibility/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}',
      'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'
    ],
    exclude: [
      'node_modules',
      '.next',
      'out',
      'dist',
      'tests/e2e/**',
      'tests/performance/**',
      'tests/security/**'
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: [
        'src/lib/components/**/*.{js,ts,tsx}',
        'src/components/robotics/**/*.{js,ts,tsx}',
        'src/hooks/**/*.{js,ts,tsx}',
        'src/services/**/*.{js,ts,tsx}',
      ],
      exclude: [
        'node_modules/**',
        'tests/**',
        '.next/**',
        'out/**',
        'dist/**',
        '**/*.d.ts',
        '**/*.config.*',
        '**/*.stories.{js,ts,tsx}',
        'scripts/**'
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 85,
          statements: 85,
        },
        'src/lib/components/': {
          branches: 90,
          functions: 90,
          lines: 95,
          statements: 95,
        },
        'src/components/robotics/': {
          branches: 85,
          functions: 85,
          lines: 90,
          statements: 90,
        },
      },
      all: true,
      clean: true
    },
    reporters: ['verbose', 'json'],
    outputFile: './test-results/unit-results.json',
    pool: 'threads',
    poolOptions: {
      threads: {
        singleThread: false,
        minThreads: 1,
        maxThreads: 4
      }
    }
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/lib': path.resolve(__dirname, './src/lib'),
      '@/config': path.resolve(__dirname, './src/config'),
      '@/types': path.resolve(__dirname, './src/types')
    }
  }
});