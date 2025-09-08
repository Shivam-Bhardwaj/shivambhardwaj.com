import { NextRequest, NextResponse } from 'next/server';
import { featureFlagManager } from './lib/config/features';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  
  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Feature flag headers for client-side access
  const roboticsEnabled = featureFlagManager.isEnabled('robotics_enabled');
  const adminToolsEnabled = featureFlagManager.isEnabled('admin_tools');
  const performanceMode = featureFlagManager.isEnabled('performance_mode');
  
  response.headers.set('X-Feature-Robotics', String(roboticsEnabled));
  response.headers.set('X-Feature-Admin', String(adminToolsEnabled));
  response.headers.set('X-Feature-Performance', String(performanceMode));
  
  // Admin route protection
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!adminToolsEnabled) {
      return NextResponse.rewrite(new URL('/404', request.url));
    }
  }
  
  // API route feature flag validation
  if (request.nextUrl.pathname.startsWith('/api/')) {
    const pathname = request.nextUrl.pathname;
    
    // Protect component API if component hot swap is disabled
    if (pathname.startsWith('/api/components') && !featureFlagManager.isEnabled('component_hot_swap')) {
      return NextResponse.json(
        { error: 'Component hot swapping is disabled' },
        { status: 403 }
      );
    }
    
    // Protect feature flag API in production
    if (pathname.startsWith('/api/features') && process.env.NODE_ENV === 'production' && !adminToolsEnabled) {
      return NextResponse.json(
        { error: 'Feature flag management not available in production' },
        { status: 403 }
      );
    }
  }
  
  // Performance optimizations based on feature flags
  if (performanceMode) {
    // Add performance-related headers
    response.headers.set('X-Performance-Mode', 'true');
    response.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  }
  
  // CSP (Content Security Policy) for security
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.github.com wss://vercel.live",
    "frame-src 'self' https://vercel.live",
    "worker-src 'self' blob:",
    "manifest-src 'self'",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);
  
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};