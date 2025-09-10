export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'FATAL';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  component: string;
  message: string;
  metadata?: Record<string, unknown>;
  requestId?: string;
  userId?: string;
  performance?: {
    duration: number;
    memory: number;
    cpu?: number;
  };
  error?: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context?: {
    url?: string;
    userAgent?: string;
    ip?: string;
    method?: string;
    statusCode?: number;
  };
}

export interface LoggerConfig {
  level: LogLevel;
  enableGcpLogging: boolean;
  enableConsoleLogging: boolean;
  enableFileLogging: boolean;
  maxLogSize: number;
  retentionDays: number;
  component: string;
}

export interface PerformanceMetrics {
  startTime: number;
  endTime?: number;
  duration?: number;
  memoryUsage?: NodeJS.MemoryUsage;
  customMetrics?: Record<string, number> | undefined;
}