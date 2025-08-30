// Vitest type augmentation for custom matchers used in this project
// Ensures TS understands expect(...).toBeValidRobot() etc.
import 'vitest'

declare module 'vitest' {
  interface Assertion<T = any> {
    toBeValidRobot(): void
    toBeWithinBounds(bounds: { width: number; height: number }): void
    toHaveValidSensorData(): void
    toHaveNoViolations(): void
  }

  interface AsymmetricMatchersContaining {
    toBeValidRobot(): void
    toBeWithinBounds(bounds: { width: number; height: number }): void
    toHaveValidSensorData(): void
    toHaveNoViolations(): void
  }
}

export {}
