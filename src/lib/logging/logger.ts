import { LogEntry, LogLevel, LoggerConfig, PerformanceMetrics } from './types';

type Metadata = Record<string, unknown>;
interface GcpLoggingLike {
  log(name: string): {
    entry(meta: Record<string, unknown>, entry: LogEntry): unknown;
    write(entry: unknown): Promise<unknown>;
  };
}

class Logger {
  private config: LoggerConfig;
  private gcpLogging: GcpLoggingLike | null = null;
  private performanceTrackers = new Map<string, PerformanceMetrics>();

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: 'INFO',
      enableGcpLogging: process.env.NODE_ENV === 'production',
      enableConsoleLogging: true,
      enableFileLogging: false,
      maxLogSize: 10 * 1024 * 1024, // 10MB
      retentionDays: 30,
      component: 'App',
      ...config,
    };

    this.initializeGcpLogging();
  }

  private async initializeGcpLogging() {
    if (this.config.enableGcpLogging) {
      try {
        const { Logging } = await import('@google-cloud/logging');
        const projectId = process.env.GCP_PROJECT_ID;
        if (projectId) {
          this.gcpLogging = new Logging({
            projectId,
          });
        } else {
          console.warn('GCP_PROJECT_ID not set, disabling GCP logging');
          this.config.enableGcpLogging = false;
        }
      } catch (error) {
        console.warn('Failed to initialize GCP logging:', error);
        this.config.enableGcpLogging = false;
      }
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: LogLevel[] = ['DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'];
    const currentLevelIndex = levels.indexOf(this.config.level);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Metadata,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: this.config.component,
      message,
      ...(metadata ? { metadata } : {}),
    } as LogEntry;

    // Add request context if available
    if (typeof window !== 'undefined') {
      entry.context = {
        url: window.location.href,
        userAgent: window.navigator.userAgent,
      };
    }

    // Add error information
    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        ...(error.stack && { stack: error.stack }),
  ...((error as unknown as { code?: string }).code && { code: (error as unknown as { code?: string }).code }),
      };
    }

    return entry;
  }

  private async writeToGcp(entry: LogEntry) {
    if (!this.gcpLogging) return;

    try {
      const log = this.gcpLogging.log('portfolio-app');
      const gcpEntry = log.entry(
        {
          resource: { type: 'gae_app' },
          severity: entry.level,
        },
        entry
      );
      await log.write(gcpEntry);
    } catch (error) {
      console.error('Failed to write to GCP logging:', error);
    }
  }

  private writeToConsole(entry: LogEntry) {
    if (!this.config.enableConsoleLogging) return;

    const timestamp = new Date(entry.timestamp).toLocaleTimeString();
    const prefix = `[${timestamp}] [${entry.level}] [${entry.component}]`;
    const message = `${prefix} ${entry.message}`;

    switch (entry.level) {
      case 'DEBUG':
        console.debug(message, entry.metadata);
        break;
      case 'INFO':
        console.info(message, entry.metadata);
        break;
      case 'WARN':
        console.warn(message, entry.metadata);
        break;
      case 'ERROR':
      case 'FATAL':
        console.error(message, entry.metadata, entry.error);
        break;
    }
  }

  private async log(
    level: LogLevel,
    message: string,
    metadata?: Metadata,
    error?: Error
  ) {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(level, message, metadata, error);

    // Write to console
    this.writeToConsole(entry);

    // Write to GCP (async)
    if (this.config.enableGcpLogging) {
      this.writeToGcp(entry).catch(console.error);
    }
  }

  debug(message: string, metadata?: Metadata) {
    return this.log('DEBUG', message, metadata);
  }

  info(message: string, metadata?: Metadata) {
    return this.log('INFO', message, metadata);
  }

  warn(message: string, metadata?: Metadata) {
    return this.log('WARN', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Metadata) {
    return this.log('ERROR', message, metadata, error);
  }

  fatal(message: string, error?: Error, metadata?: Metadata) {
    return this.log('FATAL', message, metadata, error);
  }

  // Performance tracking methods
  startPerformanceTracking(operationId: string, metadata?: Metadata) {
    const startTime = performance.now();
    this.performanceTrackers.set(operationId, {
      startTime,
      customMetrics: metadata as Record<string, number> | undefined,
    });
    this.debug(`Started tracking performance for ${operationId}`, metadata);
  }

  endPerformanceTracking(operationId: string, metadata?: Metadata) {
    const tracker = this.performanceTrackers.get(operationId);
    if (!tracker) {
      this.warn(`No performance tracker found for ${operationId}`);
      return;
    }

    const endTime = performance.now();
    const duration = endTime - tracker.startTime;

    // Get memory usage if in Node.js environment
    const memoryUsage = typeof process !== 'undefined' 
      ? process.memoryUsage() 
      : undefined;

    const performanceData = {
      operationId,
      duration: Math.round(duration * 100) / 100, // Round to 2 decimal places
      memoryUsage,
      ...tracker.customMetrics,
      ...metadata,
    };

    this.info(`Performance tracking completed for ${operationId}`, performanceData);
    this.performanceTrackers.delete(operationId);

    return performanceData;
  }

  // Utility method for structured error logging
  logError(error: Error, context?: Metadata) {
    const errorContext = {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...context,
    };

    this.error('Unhandled error occurred', error, errorContext);
  }

  // Method to create child logger with different component name
  createChildLogger(component: string): Logger {
    return new Logger({
      ...this.config,
      component: `${this.config.component}:${component}`,
    });
  }

  // Method to temporarily change log level
  withLevel(level: LogLevel): Logger {
    return new Logger({
      ...this.config,
      level,
    });
  }
}

// Singleton instance
let globalLogger: Logger | null = null;

export function createLogger(config?: Partial<LoggerConfig>): Logger {
  return new Logger(config);
}

export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger();
  }
  return globalLogger;
}

export { Logger };