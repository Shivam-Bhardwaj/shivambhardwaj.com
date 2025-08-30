import React from 'react';
import '@testing-library/jest-dom';
import { vi, expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import { toHaveNoViolations } from 'jest-axe';
import { roboticsMatchers } from './tests/utils/robotics-matchers';

// Register jest-axe matchers globally
expect.extend(toHaveNoViolations);
// Register custom robotics matchers globally
expect.extend(roboticsMatchers as any);

// Provide a Jest-compatible global using Vitest under the hood
// This lets tests written with jest.* keep working (spyOn, fn, useFakeTimers, mock, etc.)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).jest = vi;

// Mock Next.js router
vi.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: vi.fn(),
      pop: vi.fn(),
      reload: vi.fn(),
      back: vi.fn(),
      prefetch: vi.fn(),
      beforePopState: vi.fn(),
      events: {
        on: vi.fn(),
        off: vi.fn(),
        emit: vi.fn(),
      },
    };
  },
}));

// Mock Next.js navigation with vi.fn so tests can override via mockReturnValue
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
  useSearchParams: vi.fn(() => new URLSearchParams()),
  usePathname: vi.fn(() => '/'),
}));

// Mock Next.js Link to render a plain anchor element
vi.mock('next/link', () => {
  const React = require('react');
  const Link = React.forwardRef(({ href, children, ...props }: any, ref: any) => {
    const url = typeof href === 'string' ? href : (href?.pathname || String(href));
    return React.createElement('a', { href: url, ref, ...props }, children);
  });
  Link.displayName = 'NextLinkMock';
  return { default: Link };
});

// Mock Next.js Image to a predictable <img> with Next-like src format
// This matches tests that expect encoded src via /_next/image?url=...
vi.mock('next/image', () => {
  const React = require('react');
  function NextImageMock(props: any) {
    const { src, alt, width, height, ...rest } = props;
    const w = typeof width === 'number' ? width : 800;
    const h = typeof height === 'number' ? height : 480;
    const q = 75;
    const url = `/_next/image?url=${encodeURIComponent(String(src))}&w=${w}&q=${q}`;
    return React.createElement('img', { src: url, alt, width: w, height: h, ...rest });
  }
  return { default: NextImageMock };
});

// Mock framer-motion to prevent animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }) => React.createElement('div', props, children),
    nav: ({ children, ...props }) => React.createElement('nav', props, children),
    ul: ({ children, ...props }) => React.createElement('ul', props, children),
    li: ({ children, ...props }) => React.createElement('li', props, children),
    p: ({ children, ...props }) => React.createElement('p', props, children),
    h1: ({ children, ...props }) => React.createElement('h1', props, children),
    h2: ({ children, ...props }) => React.createElement('h2', props, children),
    button: ({ children, ...props }) => React.createElement('button', props, children),
    a: ({ children, ...props }) => React.createElement('a', props, children),
    span: ({ children, ...props }) => React.createElement('span', props, children),
  },
  AnimatePresence: ({ children }) => children,
}));

// Mock canvas for SmartAvoidanceRobots component
if (typeof window !== 'undefined') {
  HTMLCanvasElement.prototype.getContext = (vi.fn(() => ({
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    translate: vi.fn(),
    rotate: vi.fn(),
    scale: vi.fn(),
    globalAlpha: 1,
    shadowBlur: 0,
    shadowColor: '',
    shadowOffsetX: 0,
    shadowOffsetY: 0,
    font: '',
    textAlign: 'left',
    textBaseline: 'top',
    fillText: vi.fn(),
    measureText: vi.fn(() => ({ width: 0 })),
    strokeRect: vi.fn(),
    strokeText: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    createRadialGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    drawImage: vi.fn(),
  })) as unknown) as HTMLCanvasElement['getContext'];

  // Mock window methods
  Object.defineProperty(window, 'innerWidth', { value: 1024, writable: true });
  Object.defineProperty(window, 'innerHeight', { value: 768, writable: true });

  // Mock requestAnimationFrame and cancelAnimationFrame using stubGlobal to avoid TS mismatches
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    return (setTimeout(() => callback(performance.now()), 0) as unknown) as number;
  });
  vi.stubGlobal('cancelAnimationFrame', (id: number) => {
    clearTimeout(id as unknown as NodeJS.Timeout);
  });

  // Mock ResizeObserver
  global.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  // Mock IntersectionObserver
  global.IntersectionObserver = class {
    root: Element | Document | null = null;
    rootMargin = '';
    thresholds: ReadonlyArray<number> = [];
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords(): IntersectionObserverEntry[] { return []; }
  } as unknown as typeof IntersectionObserver;

  // Mock performance API
  global.performance = {
    ...global.performance,
    now: vi.fn(() => Date.now()),
  };

  // Mock localStorage
  const localStorageMock = (() => {
    let store = {};
    return {
      getItem: (key) => store[key] || null,
      setItem: (key, value) => { store[key] = value.toString(); },
      removeItem: (key) => { delete store[key]; },
      clear: () => { store = {}; },
    };
  })();

  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock,
  });

  // Mock window.fetch
  global.fetch = (vi.fn(() =>
    Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve({}),
      text: () => Promise.resolve('{}'),
    } as unknown as Response)
  )) as unknown as typeof fetch;
}

// Ensure no test leaks timers or mocks that could cause hanging
afterEach(() => {
  // Unmount rendered components to trigger component-level cleanups
  try { cleanup(); } catch {}

  // Try flushing pending timers if fake timers are enabled
  try {
    // Vitest API
    // @ts-ignore - available in Vitest when timers are mocked
    if (typeof vi.runOnlyPendingTimers === 'function') vi.runOnlyPendingTimers();
  } catch {}
  try {
    // Jest alias (maps to vi)
    // @ts-ignore - provided by jest-compat layer
    if ((globalThis as any).jest && typeof (globalThis as any).jest.runOnlyPendingTimers === 'function') {
      (globalThis as any).jest.runOnlyPendingTimers();
    }
  } catch {}

  // Clear any lingering fake timers BEFORE switching back to real timers
  try {
    // @ts-ignore - available in Vitest when timers are mocked
    if (typeof vi.clearAllTimers === 'function') vi.clearAllTimers();
  } catch {}

  // Restore to real timers and reset mocks
  try { vi.useRealTimers(); } catch {}
  try { vi.clearAllMocks(); } catch {}
  try { vi.restoreAllMocks(); } catch {}
});
