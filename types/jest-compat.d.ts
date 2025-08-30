// Jest compatibility layer for Vitest in this project
// Allows existing Jest-style tests and type references to work with Vitest

import type { Mock as VitestMock, SpyInstance as VitestSpyInstance } from 'vitest'

declare global {
  // Provide a global `jest` object that maps to Vitest's `vi`
  // eslint-disable-next-line no-var
  var jest: typeof import('vitest')['vi']

  // Minimal Jest namespace type aliases used in this codebase
  namespace jest {
    // Commonly used type aliases (match Vitest generic order: <TArgs, TReturn>)
    type Mock<TArgs extends any[] = any[], TReturn = any> = VitestMock<TArgs, TReturn>
    type SpyInstance<TArgs extends any[] = any[], TReturn = any> = VitestSpyInstance<TArgs, TReturn>
    // Map Jest's MockedFunction<T> to Vitest's Mock with proper generics
    type MockedFunction<T extends (...args: any[]) => any> = VitestMock<Parameters<T>, ReturnType<T>>

    // Allow custom matchers declaration from tests/utils/test-helpers.ts
    interface Matchers<R> {
      toBeValidRobot(): R
      toBeWithinBounds(bounds: { width: number; height: number }): R
      toHaveValidSensorData(): R
    }
  }
}

export {}
