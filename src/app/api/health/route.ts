import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/logging';

export async function GET(request: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Basic health check data
    const healthData = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0',
      uptime: process.uptime ? `${Math.floor(process.uptime())}s` : 'unknown',
      memory: process.memoryUsage ? {
        rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
        heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
        heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
      } : 'unavailable',
      checks: {
        server: 'ok' as 'ok' | 'error',
        logging: 'ok' as 'ok' | 'error',
      },
      responseTime: '',
    };

    // Test logging system
    try {
      logger.debug('Health check endpoint accessed', {
        userAgent: request.headers.get('user-agent'),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
      });
    } catch (error) {
      healthData.checks.logging = 'error';
      logger.error('Logging system check failed', error instanceof Error ? error : new Error('Unknown error'));
    }

    // Calculate response time
    const responseTime = Math.round((performance.now() - startTime) * 100) / 100;
    healthData.responseTime = `${responseTime}ms`;

    // Log health check
    logger.info('Health check completed', {
      status: healthData.status,
      responseTime: healthData.responseTime,
      checks: healthData.checks,
    });

    return NextResponse.json(healthData, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error) {
    const errorData = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error',
      version: process.env.npm_package_version || '1.0.0',
    };

    logger.error('Health check failed', error instanceof Error ? error : new Error('Unknown error'));

    return NextResponse.json(errorData, {
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}