// Defer importing GCP logging to server runtime to avoid bundling Node built-ins in client
// Define minimal interfaces so we don't rely on the actual library types (keeps bundle slim and avoids ESM/CJS issues)
interface GcpLog {
  entry(
    metadata: {
      resource: { type: string; labels: Record<string, string> };
      severity: string;
      timestamp: string;
      labels: Record<string, string>;
    },
    data: {
      message: string;
      metadata?: Record<string, unknown>;
      error?: LogEntry['error'];
      performance?: LogEntry['performance'];
    }
  ): unknown;
  write(entry: unknown): Promise<void>;
}

interface GcpLoggingInstance {
  log(name: string): GcpLog;
}

// Constructor signature for deferred import
// Using a narrower surface keeps us independent of downstream library changes
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
type GcpLoggingConstructor = new (options: { projectId?: string | undefined; keyFilename?: string | undefined }) => GcpLoggingInstance;

let LoggingCtor: GcpLoggingConstructor | null = null;
if (typeof window === 'undefined') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    LoggingCtor = require('@google-cloud/logging').Logging;
  } catch {
    LoggingCtor = null;
  }
}

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  metadata?: Record<string, unknown> | undefined;
  requestId?: string | undefined;
  userId?: string | undefined;
  performance?: {
    duration: number;
    memory: number;
    cpu: number;
  } | undefined;
  error?: {
    name: string;
    message: string;
    stack?: string | undefined;
  } | undefined;
}

export interface Logger {
  debug(message: string, metadata?: Record<string, unknown>): void;
  info(message: string, metadata?: Record<string, unknown>): void;
  warn(message: string, metadata?: Record<string, unknown>): void;
  error(message: string, error?: Error, metadata?: Record<string, unknown>): void;
  fatal(message: string, error?: Error, metadata?: Record<string, unknown>): void;
}

class EnhancedLogger implements Logger {
  private gcpLogging: GcpLoggingInstance | null = null;
  private gcpLog: GcpLog | null = null;
  private isServer: boolean = typeof window === 'undefined';
  private logBuffer: LogEntry[] = [];
  private readonly maxBufferSize = 100;

  constructor() {
    this.initializeGCPLogging();
  }

  private async initializeGCPLogging(): Promise<void> {
    if (!this.isServer || process.env.NODE_ENV === 'development') {
      return;
    }

    try {
  if (!LoggingCtor) return;
  this.gcpLogging = new LoggingCtor({
        projectId: process.env.GCP_PROJECT_ID ?? undefined,
        keyFilename: process.env.GCP_SERVICE_ACCOUNT_KEY ?? undefined,
      });
      this.gcpLog = this.gcpLogging.log('portfolio-app');
    } catch (error) {
      console.warn('Failed to initialize GCP Logging:', error);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): LogEntry {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      component: this.getCallerComponent(),
      message,
      requestId: this.getRequestId(),
      userId: this.getUserId(),
    };

    if (metadata) {
      entry.metadata = metadata;
    }

    if (error) {
      entry.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    }

    if (this.isServer && global.process) {
      entry.performance = {
        duration: 0, // This should be set by calling code if needed
        memory: process.memoryUsage().heapUsed,
        cpu: process.cpuUsage().user,
      };
    }

    return entry;
  }

  private getCallerComponent(): string {
    if (typeof window === 'undefined') {
      return 'server';
    }
    return 'client';
  }

  private getRequestId(): string | undefined {
    // In a real implementation, this would extract from request context
    return Math.random().toString(36).substring(7);
  }

  private getUserId(): string | undefined {
    // In a real implementation, this would extract from user session
    return undefined;
  }

  private async writeToGCP(entry: LogEntry): Promise<void> {
    if (!this.gcpLog) {
      return;
    }

    try {
      const gcpEntry = this.gcpLog.entry(
        {
          resource: {
            type: 'gae_app',
            labels: {
              project_id: process.env.GCP_PROJECT_ID || 'unknown',
              module_id: 'default',
              version_id: process.env.GAE_VERSION || 'unknown',
            },
          },
          severity: this.mapLogLevel(entry.level),
          timestamp: entry.timestamp,
          labels: {
            component: entry.component,
            requestId: entry.requestId || '',
          },
        },
        {
          message: entry.message,
          ...(entry.metadata ? { metadata: entry.metadata } : {}),
          ...(entry.error ? { error: entry.error } : {}),
          ...(entry.performance ? { performance: entry.performance } : {}),
        }
      );

      await this.gcpLog.write(gcpEntry);
    } catch (error) {
      console.error('Failed to write to GCP Logging:', error);
    }
  }

  private mapLogLevel(level: LogLevel): string {
    const mapping: Record<LogLevel, string> = {
      DEBUG: 'DEBUG',
      INFO: 'INFO',
      WARN: 'WARNING',
      ERROR: 'ERROR',
      FATAL: 'CRITICAL',
    };
    return mapping[level];
  }

  private writeToConsole(entry: LogEntry): void {
    const { timestamp, level, component, message, metadata, error } = entry;
    const logMessage = `[${timestamp}] ${level} [${component}] ${message}`;

    const consoleMethod = {
      DEBUG: console.debug,
      INFO: console.info,
      WARN: console.warn,
      ERROR: console.error,
      FATAL: console.error,
    }[level];

    if (metadata || error) {
      consoleMethod(logMessage, { metadata, error });
    } else {
      consoleMethod(logMessage);
    }
  }

  private addToBuffer(entry: LogEntry): void {
    this.logBuffer.push(entry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }
  }

  private async writeLog(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>,
    error?: Error
  ): Promise<void> {
    const entry = this.createLogEntry(level, message, metadata, error);
    
    this.addToBuffer(entry);
    this.writeToConsole(entry);

    if (this.isServer && process.env.NODE_ENV === 'production') {
      await this.writeToGCP(entry);
    }
  }

  debug(message: string, metadata?: Record<string, unknown>): void {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'DEBUG') {
      this.writeLog('DEBUG', message, metadata);
    }
  }

  info(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog('INFO', message, metadata);
  }

  warn(message: string, metadata?: Record<string, unknown>): void {
    this.writeLog('WARN', message, metadata);
  }

  error(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.writeLog('ERROR', message, metadata, error);
  }

  fatal(message: string, error?: Error, metadata?: Record<string, unknown>): void {
    this.writeLog('FATAL', message, metadata, error);
  }

  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearBuffer(): void {
    this.logBuffer.length = 0;
  }
}

// Export singleton instance
export const logger = new EnhancedLogger();

// Export utility functions for performance logging
export const withPerformanceLogging = async <T>(
  operation: () => Promise<T>,
  operationName: string,
  metadata?: Record<string, unknown>
): Promise<T> => {
  const startTime = Date.now();
  const startMemory = typeof window === 'undefined' ? process.memoryUsage().heapUsed : 0;

  try {
    logger.debug(`Starting operation: ${operationName}`, metadata);
    const result = await operation();
    
    const duration = Date.now() - startTime;
    const memoryUsed = typeof window === 'undefined' 
      ? process.memoryUsage().heapUsed - startMemory 
      : 0;

    logger.info(`Operation completed: ${operationName}`, {
      ...metadata,
      performance: {
        duration,
        memoryUsed,
      },
    });

    return result;
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(`Operation failed: ${operationName}`, error as Error, {
      ...metadata,
      performance: { duration },
    });
    throw error;
  }
};

// Export request logging middleware helper
export const createRequestLogger = (requestId: string, userId?: string) => {
  return {
    debug: (message: string, metadata?: Record<string, unknown>) => 
      logger.debug(message, { ...metadata, requestId, userId }),
    info: (message: string, metadata?: Record<string, unknown>) => 
      logger.info(message, { ...metadata, requestId, userId }),
    warn: (message: string, metadata?: Record<string, unknown>) => 
      logger.warn(message, { ...metadata, requestId, userId }),
    error: (message: string, error?: Error, metadata?: Record<string, unknown>) => 
      logger.error(message, error, { ...metadata, requestId, userId }),
    fatal: (message: string, error?: Error, metadata?: Record<string, unknown>) => 
      logger.fatal(message, error, { ...metadata, requestId, userId }),
  };
};