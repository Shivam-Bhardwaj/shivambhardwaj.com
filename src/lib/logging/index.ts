import { getLogger as getLoggerInstance } from './logger';
export { Logger, createLogger, getLogger } from './logger';
export type { LogEntry, LogLevel, LoggerConfig, PerformanceMetrics } from './types';

// Convenience exports for common logging patterns
export const logger = {
  // Get the global logger instance
  get instance() {
    return getLoggerInstance();
  },

  // Quick logging methods
  debug: (message: string, metadata?: Record<string, unknown>) => {
    return getLoggerInstance().debug(message, metadata);
  },

  info: (message: string, metadata?: Record<string, unknown>) => {
    return getLoggerInstance().info(message, metadata);
  },

  warn: (message: string, metadata?: Record<string, unknown>) => {
    return getLoggerInstance().warn(message, metadata);
  },

  error: (message: string, error?: Error, metadata?: Record<string, unknown>) => {
    return getLoggerInstance().error(message, error, metadata);
  },

  fatal: (message: string, error?: Error, metadata?: Record<string, unknown>) => {
    return getLoggerInstance().fatal(message, error, metadata);
  },

  // Performance tracking
  startTracking: (operationId: string, metadata?: Record<string, unknown>) => {
    return getLoggerInstance().startPerformanceTracking(operationId, metadata);
  },

  endTracking: (operationId: string, metadata?: Record<string, unknown>) => {
    return getLoggerInstance().endPerformanceTracking(operationId, metadata);
  },

  // Error logging
  logError: (error: Error, context?: Record<string, unknown>) => {
    return getLoggerInstance().logError(error, context);
  },

  // Child logger creation
  createChild: (component: string) => {
    return getLoggerInstance().createChildLogger(component);
  },
};