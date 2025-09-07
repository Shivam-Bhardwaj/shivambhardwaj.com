"use client";
import { logger } from '@/lib/logging';
import dynamic from 'next/dynamic';

// Dynamic import (no need to disable SSR now that page is client component)
const ThemePresetSwitcher = dynamic(() => import('@/components/ThemePresetSwitcher'));

export default function HomePage() {
  // Log page access
  logger.info('Homepage accessed', {
    page: '/',
    timestamp: new Date().toISOString(),
  });

  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-950 dark:via-primary-900 dark:to-primary-800">
      <div className="container">
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center space-y-8 animate-in">
            <div className="space-y-4">
              <h1 className="heading-1 gradient-text">
                Welcome to Antimony Labs
              </h1>
              <p className="text-xl text-muted max-w-2xl mx-auto">
                Robotics Engineer & Portfolio - Google Cloud Version
              </p>
              <p className="text-muted-foreground max-w-3xl mx-auto">
                Professional portfolio showcasing robotics engineering expertise, 
                project management experience, and technical skills in autonomous systems 
                with enhanced testing, logging, and deployment automation.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary px-8 py-3">
                Explore Projects
              </button>
              <button className="btn-outline px-8 py-3">
                View Experience
              </button>
            </div>

            {/* Theme preset switcher (collapsible) */}
            <div className="mt-4">
              <ThemePresetSwitcher />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="card p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-2xl">🤖</span>
                </div>
                <h3 className="text-lg font-semibold">Robotics Engineering</h3>
                <p className="text-sm text-muted-foreground">
                  Advanced robotics systems, autonomous navigation, and swarm intelligence
                </p>
              </div>

              <div className="card p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-secondary-100 dark:bg-secondary-800 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-lg font-semibold">Project Management</h3>
                <p className="text-sm text-muted-foreground">
                  Leading cross-functional teams and delivering complex technical projects
                </p>
              </div>

              <div className="card p-6 text-center space-y-3">
                <div className="w-12 h-12 bg-primary-100 dark:bg-primary-800 rounded-lg mx-auto flex items-center justify-center">
                  <span className="text-2xl">⚡</span>
                </div>
                <h3 className="text-lg font-semibold">Enhanced Architecture</h3>
                <p className="text-sm text-muted-foreground">
                  Google Cloud deployment with comprehensive testing and monitoring
                </p>
              </div>
            </div>
            {/* System Status & Tech Stack moved to global Footer */}
          </div>
        </div>
      </div>
    </main>
  );
}